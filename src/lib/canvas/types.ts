export type CanvasProfile = {
  id: string;
  name: string;
  primary_email?: string;
};

export type CanvasCourse = {
  id: string;
  name: string;
  course_code?: string;
  workflow_state?: string;
};

export type CanvasAssignment = {
  id: string;
  name: string;
  description?: string | null;
  due_at?: string | null;
  html_url: string;
  submission_types?: string[];
};

export type CanvasDiscussion = {
  id: string;
  title: string;
  message?: string | null;
  html_url: string;
  assignment_id?: string | null;
  delayed_post_at?: string | null;
  lock_at?: string | null;
};

export type SyncItem = {
  externalId: string;
  canvasId: string;
  type: "Assignment" | "Discussion" | "Quiz";
  name: string;
  courseId: string;
  courseName: string;
  dueAt: string | null;
  url: string;
};
