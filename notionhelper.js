const { Client, APIErrorCode } = require("@notionhq/client")
const Notion = new Client({ auth: process.env.NOTION_API})
const { setEnvValue } = require("./util")

class NotionHelper {

    api // notion api key
    page // notion parent page id
    database // notion database id

    constructor() {
        this.api = process.env.NOTION_API
        this.page = process.env.NOTION_PAGE
        this.database = process.env.NOTION_DATABASE
    }

    set database(database) {
        this.database = database
        setEnvValue('NOTION_DATABASE', `'${database}'`)
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

    async getNotionPages() {
        const response = await notion.databases.query({
            database_id: this.database,
        })
        const notion_pages = response.results
        .map((page) => page.properties.ID.number)

        return await notion_pages
    }

    async createNotionDatabase(courses) {
        try {
            const newDatabase = await Notion.databases.create({
                parent: {
                    type: "page_id",
                    page_id: await this.page,
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
        } catch (error) {
            console.log(`DATABASE ERROR: ${error}`)
        }
    }

    async updateNotionDatabase(updatedCourses) {
        try {
            const response = await notion.databases.update({
                database_id: await this.database,
                properties: {
                    "Course": {
                        select: {
                            options: await updatedCourses,
                        },
                    },
                },
            })
            console.log(`SUCCESS: Database has been updated!`)
            // only add assignments for new courses -> less api calls
        } catch (error) {
            console.log(`ERROR: Database could not be update! ${error}`)
        }
    }

    async createNotionPage(page_properties) {
        try {
            const newPage = await notion.pages.create({
                parent: {
                    type: "database_id",
                    database_id: this.database
                },
                properties: page_properties,
            })
            console.log(`SUCCESS: new page ${page_properties.ID.number} has been created!`)
        } catch (error) {
            console.log(`ERROR: createPage failed!\n${error}`)
        }
    }

    async updateNotionPage(page_properties) {
        try {
            // get page
            this.getNotionPageID(page_properties)
            page_id = 0
            // update properties
            const updatePage = await notion.pages.update({
                page_id: page_id,
                properties: page_properties,
            })
            console.log(`SUCCESS: new page ${page_properties.ID.number} has been updated!`)
        } catch (error) {
            console.log(`ERROR: Could not update page ${assignment.ID.number}`)
        }
    }

    async getNotionPageID(page_properties) {
        try {
            const response = notion.databases.query({
                database_id: this.database,
                filter: {
                    property: "ID",
                    number: {
                        equals: page_properties.ID.number
                    }
                }
            })
            console.log(response)
        } catch (error) {
            console.log(`ERROR: Could not locate page!!`)
        }
    }
}

module.exports = { NotionHelper}