const dotenv = require("dotenv").config({override: true})

class CanvasHelper { 

    url
    api
    user
    courses

    constructor() {
        this.url = process.env.CANVAS_API_URL
        this.api = process.env.CANVAS_API
        this.user = this.defineUser()
        this.courses = this.getCourses()
    }

    set url(url) {
        this.url = url
    }

    get url() {
        return this.url
    }

    set api(api) {
        this.api = api
    }

    get api() {
        return this.api
    }

    set user(user) {
        this.user = user
    }

    get user() {
        return this.user
    }

    set courses(courses) {
        this.courses = courses
    }

    get courses() {
        return this.courses
    }

    async updateCourses() {
        this.courses = this.getCourses()
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
     * TODO figure out if this method is even worth it 💀 
     */
    async getCourse(courseID) {
        const url = `${this.url}/api/v1/courses/${courseID}?access_token=${this.api}`
        const response = await fetch(url)
        const course = await response.json()

        return await ({
            id: course.id.toString(),
            name: course.name
        })
    }

    /**
     * Retrieves user's Canvas id.
     * 
     * @returns {Promise<Array<{ id: string, name: string}}
     */
    async getCourses() {
        // Canvas API connection
        const url = `${this.url}/api/v1/courses?access_token=${this.api}&per_page=100`
        const response = await fetch(url)
        const courses = await response.json()
        console.log(courses)

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

    async getCourseAssignment(courseID, assignmentID) {
        const url = `${this.url}/api/v1/users/${await this.user}/courses/${courseID}/assignments/${assignmentID}?access_token=${this.api}`
        const response = await fetch(url)
        const assignment = await response.json()

        return await ({
            "Assignment Name": {
                type: "title",
                title: [{
                    type: "text",
                    text: { content: assignment.name }
                }]
            },
            "Due Date": {
                type: "date",
                date: { start: assignment.due_at || '2020-09-10'}
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
            "URL" : {
                type: "url",
                url: assignment.html_url,
            }
        })
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
        //console.log(await assignments)

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
                date: { start: assignment.due_at || '2020-09-10'}
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
            "URL" : {
                type: "url",
                url: assignment.html_url,
            }
            /**"children": [
                {
                    object: "block",
                    type: "paragraph",
                    paragraph: {
                        rich_text: [{
                          type: "text",
                          text: {
                            content: assignment.description,
                            "link": null
                          }
                        }],
                        "color": "default"
                    },
                }
            ]**/
        }))

        // list of assignments for the course
        return await assignment_list
    }
}

module.exports = { CanvasHelper }