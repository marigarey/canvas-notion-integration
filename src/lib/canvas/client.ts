import "server-only";

import { isIP } from "node:net";
import type {
  CanvasAssignment,
  CanvasCourse,
  CanvasDiscussion,
  CanvasProfile,
  SyncItem,
} from "./types";

const CANVAS_ACCEPT = "application/json+canvas-string-ids";
const MAX_PAGES = 100;

export class CanvasApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "CanvasApiError";
  }
}

export function normalizeCanvasUrl(value: string) {
  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(value.trim())
    ? value.trim()
    : `https://${value.trim()}`;
  const url = new URL(withProtocol);

  if (url.protocol !== "https:" && process.env.NODE_ENV === "production") {
    throw new CanvasApiError("Canvas must use HTTPS.");
  }

  const hostname = url.hostname.toLowerCase();
  const ipVersion = isIP(hostname);
  const privateIpv4 = ipVersion === 4 && (
    hostname.startsWith("10.") ||
    hostname.startsWith("127.") ||
    hostname.startsWith("169.254.") ||
    hostname.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
  );
  const privateIpv6 = ipVersion === 6 && (
    hostname === "::1" ||
    hostname.startsWith("fc") ||
    hostname.startsWith("fd") ||
    hostname.startsWith("fe8") ||
    hostname.startsWith("fe9") ||
    hostname.startsWith("fea") ||
    hostname.startsWith("feb")
  );

  if (
    process.env.NODE_ENV === "production" &&
    (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || privateIpv4 || privateIpv6)
  ) {
    throw new CanvasApiError("Canvas must use a public school domain.");
  }

  if (url.username || url.password || url.search || url.hash) {
    throw new CanvasApiError("Enter only the Canvas site address.");
  }

  url.pathname = url.pathname.replace(/\/+$/, "");
  return url.origin + url.pathname;
}

function getNextLink(header: string | null) {
  if (!header) return null;
  const match = header
    .split(",")
    .map((part) => part.trim())
    .find((part) => /;\s*rel="next"/.test(part))
    ?.match(/^<([^>]+)>/);
  return match?.[1] ?? null;
}

export class CanvasClient {
  readonly baseUrl: string;

  constructor(baseUrl: string, private readonly accessToken: string) {
    this.baseUrl = normalizeCanvasUrl(baseUrl);
  }

  private async request<T>(urlOrPath: string) {
    const url = urlOrPath.startsWith("http") ? urlOrPath : `${this.baseUrl}${urlOrPath}`;
    const parsed = new URL(url);

    if (parsed.origin !== new URL(this.baseUrl).origin) {
      throw new CanvasApiError("Canvas pagination attempted to leave the configured Canvas site.");
    }

    const response = await fetch(parsed, {
      headers: {
        Accept: CANVAS_ACCEPT,
        Authorization: `Bearer ${this.accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const message = response.status === 401
        ? "Canvas rejected the access token."
        : `Canvas request failed with status ${response.status}.`;
      throw new CanvasApiError(message, response.status);
    }

    return { data: (await response.json()) as T, next: getNextLink(response.headers.get("link")) };
  }

  private async listAll<T>(path: string) {
    const results: T[] = [];
    let next: string | null = path;
    let pageCount = 0;

    while (next && pageCount < MAX_PAGES) {
      const page: { data: T[]; next: string | null } = await this.request<T[]>(next);
      results.push(...page.data);
      next = page.next;
      pageCount += 1;
    }

    if (next) {
      throw new CanvasApiError("Canvas returned more pages than the safety limit allows.");
    }

    return results;
  }

  async getProfile() {
    return (await this.request<CanvasProfile>("/api/v1/users/self/profile")).data;
  }

  async getCourses() {
    const courses = await this.listAll<CanvasCourse>(
      "/api/v1/courses?enrollment_state=active&state%5B%5D=available&per_page=100",
    );
    return courses.filter((course) => course.name);
  }

  async getSyncItems(course: CanvasCourse) {
    const [assignments, discussions] = await Promise.all([
      this.listAll<CanvasAssignment>(`/api/v1/courses/${course.id}/assignments?per_page=100`),
      this.listAll<CanvasDiscussion>(`/api/v1/courses/${course.id}/discussion_topics?per_page=100`),
    ]);

    const assignmentItems: SyncItem[] = assignments.map((assignment) => ({
      externalId: `${course.id}:assignment:${assignment.id}`,
      canvasId: assignment.id,
      type: assignment.submission_types?.includes("online_quiz") ? "Quiz" : "Assignment",
      name: assignment.name,
      courseId: course.id,
      courseName: course.name,
      dueAt: assignment.due_at ?? null,
      url: assignment.html_url,
    }));

    const gradedDiscussionIds = new Set(
      discussions.flatMap((discussion) => discussion.assignment_id ? [discussion.assignment_id] : []),
    );
    const ungradedAssignments = assignmentItems.filter(
      (assignment) => !gradedDiscussionIds.has(assignment.canvasId),
    );
    const discussionItems: SyncItem[] = discussions.map((discussion) => ({
      externalId: `${course.id}:discussion:${discussion.id}`,
      canvasId: discussion.id,
      type: "Discussion",
      name: discussion.title,
      courseId: course.id,
      courseName: course.name,
      dueAt: discussion.lock_at ?? discussion.delayed_post_at ?? null,
      url: discussion.html_url,
    }));

    return [...ungradedAssignments, ...discussionItems];
  }
}
