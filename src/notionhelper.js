require('dotenv').config()

const { Client } = require("@notionhq/client")
const Notion = new Client({ auth: process.env.NOTION_API})
const { setEnvValue } = require("./util")

/**
 * Class to help create/update the database in Notion,
 * as well as the pages in Notion database
 * @author Mari Garey
 */
class NotionHelper {

    api // notion api key
    page // notion parent page id
    database // notion database id

    constructor() {
        this.api = process.env.NOTION_API
        this.page = process.env.NOTION_PAGE
        this.database = process.env.NOTION_DATABASE
    }

    /**
     * Sets the local and the .env file
     */
    set database(database) {
        this.database = database
    }

    get database() {
        return this.database
    }

    get pages() {
        return this.getNotionPages()
    }

    set pageId(pageId) {
        this.pageId = pageId
    }

    get pageId() {
        return this.pageId
    }

    set token(token) {
        this.token = token
    }

    get token() {
        return this.token
    }

    /**
     * IMPORTANT: only will get 100 pages max
     * 
     * Accesses all the current pages in a Notion Database
     * @returns array of notion pages
     */
    async getNotionPages() {
        try {
            const response = await Notion.databases.query({
                database_id: this.database,
            })
            const notion_pages = response.results.map(
                (page) => page.properties.ID.number
            )
    
            return notion_pages
        } catch(error) {
            console.log(`ERROR: getNotionPages() did not run: ${error}`)
        }
    }

    /**
     * Accesses all the current pages for the 
     * course property in the Notion Database
     * @param {Promise<id: string, name: string>} course 
     * @returns 
     */
    async getNotionPagesByCourse(course) {
        try {
            const response = await Notion.databases.query({
                database_id: this.database,
                filter: {
                    property: "Course",
                    select: {
                        equals: course.name
                    }
                }
            })
    
            const notion_pages = response.results.map(
                (page) => page.properties.ID.number
            )
            return notion_pages
        } catch(error) {
            console.log(`ERROR: getNotionPagesByCourse() did not run: ${error}`)
        }
    }

    /**
     * Creates a new database in the Notion page
     * @param {Array<id: string, name: string>} courses
     */
    async createNotionDatabase(courses) {
        try {
            const newDatabase = await Notion.databases.create({
                parent: {
                    type: "page_id",
                    page_id: this.page,
                },
                title: [
                    {
                        type: "text",
                        text: {
                            content: "Canvas Assignments",
                        },
                    },
                ],
                properties: {
                    "Assignment Name": {
                        type: "title",
                        title: {},
                    },
                    "Due Date": {
                        type: "date",
                        date: {},
                    },
                    "Course": {
                        select: {
                            options: await courses,
                        },
                    },
                    "Completion": {
                        type: "checkbox",
                        checkbox: {}
                    },
                    "URL": {
                        type: "url",
                        url: {},
                    },
                    "ID": {
                        type: "number",
                        number: {
                            format: "number"
                        },
                    },
                }
            })
            console.log(`SUCCESS: Database has been created!`)
            this.database = newDatabase.id
            setEnvValue('NOTION_DATABASE', `'${this.database}'`)
        } catch (error) {
            console.log(`DATABASE ERROR: ${error}`)
        }
    }

    /**
     * Updates the Course Property in the Notion Database
     * @param {Array<id: string, name: string>} updatedCourses 
     */
    async updateNotionDatabase(updatedCourses) {
        try {
            const response = await Notion.databases.update({
                database_id: this.database,
                properties: {
                    "Course": {
                        select: {
                            options: await updatedCourses,
                        },
                    },
                },
            })
            console.log(`SUCCESS: Database has been updated!`)
        } catch (error) {
            console.log(`ERROR: Database could not be update! ${error}`)
        }
    }

    /**
     * Creates a page in the Notion database with properties from page_properties
     * @param {Promise<Array<{name: string, data: string, course: string, url: string, ID: string}>>} page_properties 
     */
    async createNotionPage(page_properties) {
        try {
            const newPage = await Notion.pages.create({
                parent: {
                    type: "database_id",
                    database_id: this.database
                },
                properties: await page_properties,
            })
            console.log(`SUCCESS: new page ${page_properties.ID.number} has been created!`)
        } catch (error) {
            console.log(`ERROR: createNotionPage failed!\n${error}`)
        }
    }

    /**
     * Updates a page in the notion database with properties from page_properties
     * @param {Promise<Array<{name: string, data: string, course: string, url: string, ID: string}>>} page_properties 
     */
    async updateNotionPage(page_properties) {
        try {
            // update properties
            const updatePage = await Notion.pages.update({
                page_id: await this.getNotionPageID(page_properties),
                properties: page_properties,
            })
            console.log(`SUCCESS: new page ${page_properties.ID.number} has been updated!`)
        } catch (error) {
            console.log(`ERROR: Could not update page ${page_properties.ID.number}`)
        }
    }

    /**
     * Returns the page id of the page associated with the page_properties
     * @param {Promise<Array<{name: string, data: string, course: string, url: string, ID: string}>>} page_properties 
     * @returns page id
     */
    async getNotionPageID(page_properties) {
        try {
            const response = Notion.databases.query({
                database_id: this.database,
                filter: {
                    property: "ID",
                    number: {
                        equals: page_properties.ID.number
                    }
                }
            })
            return (await response).results[0].id
        } catch (error) {
            console.log(`ERROR: Could not locate page!!`)
        }
    }
}

module.exports = { NotionHelper}
