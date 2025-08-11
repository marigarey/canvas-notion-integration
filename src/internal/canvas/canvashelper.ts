import { Course, CourseInfo } from "./models";

export class CanvasHelper implements CourseInfo {
  courses: Array<Course>
  url: string
  api_key: string
  user_id: string

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
      const response = await (await fetch(request)).json()
      const course: Course = await response.filter(course => typeof course.name !== undefined)
    } catch (error) {
      console.error(error) // temp
    }
  }
}