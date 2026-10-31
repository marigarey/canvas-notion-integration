const test = require("node:test");
const assert = require("node:assert/strict");
const { CanvasClient } = require("../src/canvas");

test("Canvas uses a bearer header, never a query token, and follows pagination", async () => {
  const calls = [];
  const responses = [
    new Response(JSON.stringify([{ id: "1", name: "Course one" }]), {
      status: 200,
      headers: {
        "content-type": "application/json",
        link: '<https://school.example/api/v1/courses?page=2>; rel="next"',
      },
    }),
    new Response(JSON.stringify([{ id: "2", name: "Course two" }]), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  ];
  const client = new CanvasClient("https://school.example", "super-secret", {
    maxRetries: 0,
    fetch: async (url, options) => {
      calls.push({ url: String(url), options });
      return responses.shift();
    },
  });

  const courses = await client.getCourses();
  assert.deepEqual(courses, [
    { id: "1", name: "Course one" },
    { id: "2", name: "Course two" },
  ]);
  assert.equal(calls.length, 2);
  for (const call of calls) {
    assert.equal(call.options.headers.Authorization, "Bearer super-secret");
    assert.doesNotMatch(call.url, /super-secret|access_token/i);
  }
});

test("Canvas rejects pagination links to another origin", async () => {
  const client = new CanvasClient("https://school.example", "token", { maxRetries: 0 });
  await assert.rejects(
    () => client.request("https://attacker.example/api/v1/courses"),
    /attempted to leave/,
  );
});

test("Canvas authentication errors do not include the token", async () => {
  const client = new CanvasClient("https://school.example", "private-token", {
    maxRetries: 0,
    fetch: async () => new Response("{}", { status: 401 }),
  });
  await assert.rejects(
    () => client.getCourses(),
    (error) => {
      assert.match(error.message, /rejected the access token/);
      assert.doesNotMatch(error.message, /private-token/);
      return true;
    },
  );
});

test("Canvas retries rate limits using a bounded delay", async () => {
  let attempts = 0;
  const delays = [];
  const client = new CanvasClient("https://school.example", "token", {
    maxRetries: 1,
    sleep: async (delay) => { delays.push(delay); },
    fetch: async () => {
      attempts += 1;
      if (attempts === 1) {
        return new Response("{}", {
          status: 429,
          headers: { "retry-after": "30" },
        });
      }
      return new Response("[]", {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    },
  });

  assert.deepEqual(await client.getCourses(), []);
  assert.equal(attempts, 2);
  assert.deepEqual(delays, [10_000]);
});

test("Canvas creates stable, collision-resistant item identifiers", async () => {
  const client = new CanvasClient("https://school.example", "token", { maxRetries: 0 });
  client.listAll = async (path) => path.includes("assignments")
    ? [{ id: "42", name: "Quiz", submission_types: ["online_quiz"], html_url: "https://school.example/q" }]
    : [{ id: "42", title: "Discussion", html_url: "https://school.example/d" }];

  const items = await client.getSyncItems({ id: "7", name: "Biology" });
  assert.deepEqual(items.map((item) => item.externalId), [
    "7:assignment:42",
    "7:discussion:42",
  ]);
});
