const dotenv = require("dotenv").config({override: true})

class CanvasHelper { 
    constructor() {
        this.url = process.env.CANVAS_API_URL
        this.api = process.env.CANVAS_API
        this.user = this.defineUser()
    }

    get courses() {
        return this.getCourses()
    }

    /**
     * Gets/Sets the userId variable.
     */
    async defineUser() {
        // access canvas api
        const url = `${this.url}/api/v1/courses?access_token=${this.api}`
        const response = await fetch(url)
        const courses = await response.json()

        // use first item that has a defined name (course exists)
        const course_option = await courses.filter(course => typeof course.name !== 'undefined')

        // sets user_id in the environment
        return await course_option[0]["enrollments"][0]["user_id"]
    }

    /**
     * Retrieves user's Canvas id.
     * 
     * @returns {Promise<Array<{ id: string, name: string}}
     */
    async getCourses() {
        // Canvas API connection
        const url = `${this.url}/api/v1/courses?access_token=${this.api}`
        const response = await fetch(url)
        const courses = await response.json()

        // Convert each course for Notion API, only courses that are currently active
        const courseList = await courses
            .filter(course => typeof course.name !== 'undefined' && course.end_at > new Date().toJSON())
            .map(course => ({
                id: course.id.toString(),
                name: course.name
            }))

        // list of the active courses
        return await courseList
    }

    /**
     * Retrieves the assignments from the Canvas API for a specific course.
     * 
     * @param {number} courseID 
     * @param {string} courseName 
     * @returns {Promise<Array<{ name: string, date: string, course: string, ID: string }>>}
     */
    async getCourseAssignments(courseID, courseName) {
        // Canvas API connection
        const url = `${this.url}/api/v1/users/${await this.user}/courses/${courseID}/assignments?access_token=${this.api}&per_page=50`
        const response = await fetch(url)
        const assignments = await response.json()
        console.log(assignments)

        // Convert each assignment for the Notion API, only for assignments that are named
        const assignment_list = await assignments
        .filter(assignment => typeof assignment.name !== 'undefined')
        .map(assignment => ({
            "Assignment Name": {
                type: "title",
                title: [{
                    type: "text",
                    text: { content: assignment.name }
                }]
            },
            "Due Date": {
                type: "date",
                date: { start: assignment.due_at || '2024-09-10'}
            },
            "Course": {
                select: {
                    name: courseName
                }
            },
            "ID": {
                type: "number",
                number: assignment.id,
            },
        }))

        // list of assignments for the course
        return await assignment_list
    }
}

module.exports = { CanvasHelper }