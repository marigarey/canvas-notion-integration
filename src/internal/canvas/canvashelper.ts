import { Course, CourseInfo } from "./models";

type CanvasEnrollment = {
  user_id: number;
};

type CanvasCourseResponse = {
  name?: string;
  enrollments?: CanvasEnrollment[];
};

export class CanvasHelper implements CourseInfo {
  courses: Array<Course> = []
  url: string
  api_key: string
  user_id: string = ""

  constructor(url: string, api_key: string) {
    this.url = url
    this.api_key = api_key
  }

  async getCourse(course_id: string): Promise<Course> {
    const course: Course = {course_id: course_id, course_name: "test", assignments: []};
    return course
  }


  async setUserId(): Promise<void> {
    try {
      const request = `${this.url}/api/v1/courses?access_token=${this.api_key}`
      const response = (await (await fetch(request)).json()) as CanvasCourseResponse[]
      const course = response.find((item) => item.name && item.enrollments?.[0]?.user_id)

      if (!course?.enrollments?.[0]) {
        throw new Error("Canvas did not return an enrolled course for this user.")
      }

      this.user_id = course.enrollments[0].user_id.toString()
    } catch (error) {
      console.error(error) // temp
    }
  }
}
