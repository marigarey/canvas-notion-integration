// CANVAS

enum AssignmentType {
  Quiz,
  Assignment,
  Discussion,
}

export type Course = {
  course_id: string;
  course_name: string;
  assignments: Array<Assignment>;
};

export type Assignment = {
  assignment_name: string;
  due_date: string;
  assignment_url: string;
  id: string;
  assignment_type: AssignmentType;
}

export interface CourseInfo {
  courses: Array<Course>

  getCourse: (course_id: string) => Promise<Course> 
}

// NOTION

