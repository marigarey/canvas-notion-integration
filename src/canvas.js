const CANVAS_ACCEPT = "application/json+canvas-string-ids";
const MAX_PAGES = 1000;

class CanvasApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "CanvasApiError";
    this.status = status;
  }
}

function getNextLink(header) {
  if (!header) return null;
  const part = header
    .split(",")
    .map((value) => value.trim())
    .find((value) => /;\s*rel="next"/.test(value));
  return part?.match(/^<([^>]+)>/)?.[1] || null;
}

function retryDelay(response, attempt) {
  const retryAfter = response?.headers?.get("retry-after");
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) return Math.min(seconds * 1000, 10_000);
    const dateDelay = Date.parse(retryAfter) - Date.now();
    if (Number.isFinite(dateDelay)) return Math.max(0, Math.min(dateDelay, 10_000));
  }
  return Math.min(250 * (2 ** attempt), 2_000);
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

class CanvasClient {
  constructor(baseUrl, accessToken, options = {}) {
    this.baseUrl = baseUrl;
    this.base = new URL(baseUrl);
    this.accessToken = accessToken;
    this.fetch = options.fetch || globalThis.fetch;
    this.sleep = options.sleep || sleep;
    this.timeoutMs = options.timeoutMs || 15_000;
    this.maxRetries = options.maxRetries ?? 2;
  }

  resolveUrl(urlOrPath) {
    const url = /^https?:/i.test(urlOrPath)
      ? new URL(urlOrPath)
      : new URL(`${this.baseUrl}${urlOrPath}`);
    const allowedPath = `${this.base.pathname.replace(/\/$/, "")}/api/v1/`;

    if (url.origin !== this.base.origin || !url.pathname.startsWith(allowedPath)) {
      throw new CanvasApiError("Canvas pagination attempted to leave the configured API.");
    }
    return url;
  }

  async request(urlOrPath) {
    const url = this.resolveUrl(urlOrPath);

    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      let response;
      try {
        response = await this.fetch(url, {
          headers: {
            Accept: CANVAS_ACCEPT,
            Authorization: `Bearer ${this.accessToken}`,
          },
          redirect: "error",
          signal: AbortSignal.timeout(this.timeoutMs),
        });
      } catch (error) {
        if (attempt < this.maxRetries) {
          await this.sleep(retryDelay(null, attempt));
          continue;
        }
        const message = error?.name === "TimeoutError"
          ? "Canvas could not be reached before the request timed out."
          : "Canvas could not be reached or returned an unsafe redirect.";
        throw new CanvasApiError(message);
      }

      if ((response.status === 429 || response.status >= 500) && attempt < this.maxRetries) {
        await this.sleep(retryDelay(response, attempt));
        continue;
      }

      if (!response.ok) {
        const message = response.status === 401 || response.status === 403
          ? "Canvas rejected the access token or denied access."
          : `Canvas request failed with status ${response.status}.`;
        throw new CanvasApiError(message, response.status);
      }

      let data;
      try {
        data = await response.json();
      } catch {
        throw new CanvasApiError("Canvas returned an invalid JSON response.", response.status);
      }
      return { data, next: getNextLink(response.headers.get("link")) };
    }

    throw new CanvasApiError("Canvas request failed.");
  }

  async listAll(path) {
    const results = [];
    let next = path;
    let pages = 0;

    while (next && pages < MAX_PAGES) {
      const response = await this.request(next);
      if (!Array.isArray(response.data)) {
        throw new CanvasApiError("Canvas returned an unexpected response shape.");
      }
      results.push(...response.data);
      next = response.next;
      pages += 1;
    }

    if (next) {
      throw new CanvasApiError("Canvas returned more pages than the safety limit allows.");
    }
    return results;
  }

  async getCourses() {
    const courses = await this.listAll(
      "/api/v1/courses?enrollment_state=active&state%5B%5D=available&per_page=100",
    );
    return courses
      .filter((course) => course && course.id != null && typeof course.name === "string")
      .map((course) => ({ id: String(course.id), name: course.name }));
  }

  async getSyncItems(course) {
    const courseId = encodeURIComponent(course.id);
    const [assignments, discussions] = await Promise.all([
      this.listAll(`/api/v1/courses/${courseId}/assignments?per_page=100`),
      this.listAll(`/api/v1/courses/${courseId}/discussion_topics?per_page=100`),
    ]);

    const gradedDiscussionAssignments = new Set(
      discussions.flatMap((discussion) => discussion.assignment_id == null
        ? []
        : [String(discussion.assignment_id)]),
    );

    const assignmentItems = assignments
      .filter((assignment) => assignment?.id != null && typeof assignment.name === "string")
      .filter((assignment) => !gradedDiscussionAssignments.has(String(assignment.id)))
      .map((assignment) => ({
        externalId: `${course.id}:assignment:${assignment.id}`,
        canvasId: String(assignment.id),
        type: assignment.submission_types?.includes("online_quiz") ? "Quiz" : "Assignment",
        name: assignment.name,
        courseId: course.id,
        courseName: course.name,
        dueAt: assignment.due_at || null,
        url: assignment.html_url || null,
      }));

    const discussionItems = discussions
      .filter((discussion) => discussion?.id != null && typeof discussion.title === "string")
      .map((discussion) => ({
        externalId: `${course.id}:discussion:${discussion.id}`,
        canvasId: String(discussion.id),
        type: "Discussion",
        name: discussion.title,
        courseId: course.id,
        courseName: course.name,
        dueAt: discussion.lock_at || discussion.delayed_post_at || null,
        url: discussion.html_url || null,
      }));

    return [...assignmentItems, ...discussionItems];
  }
}

module.exports = { CanvasApiError, CanvasClient, getNextLink };
