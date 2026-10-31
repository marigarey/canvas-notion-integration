import { afterEach, describe, expect, it, vi } from "vitest";
import { CanvasClient, normalizeCanvasUrl } from "./client";

describe("CanvasClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("normalizes Canvas site addresses", () => {
    expect(normalizeCanvasUrl("canvas.school.edu/")).toBe("https://canvas.school.edu");
  });

  it("uses bearer authentication and follows same-origin pagination", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: "1", name: "Course One" }]), {
        status: 200,
        headers: {
          link: '<https://canvas.school.edu/api/v1/courses?page=2>; rel="next"',
        },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: "2", name: "Course Two" }]), {
        status: 200,
      }));
    vi.stubGlobal("fetch", fetchMock);

    const courses = await new CanvasClient("https://canvas.school.edu", "secret-token").getCourses();

    expect(courses.map((course) => course.id)).toEqual(["1", "2"]);
    const [requestUrl, requestInit] = fetchMock.mock.calls[0];
    expect(String(requestUrl)).not.toContain("secret-token");
    expect(new Headers(requestInit?.headers).get("authorization")).toBe("Bearer secret-token");
  });

  it("refuses pagination links that leave the configured Canvas origin", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { link: '<https://attacker.example/courses?page=2>; rel="next"' },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      new CanvasClient("https://canvas.school.edu", "secret-token").getCourses(),
    ).rejects.toThrow("leave the configured Canvas site");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
