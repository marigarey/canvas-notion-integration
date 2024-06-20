const dotenv = require("dotenv").config({override: true})
const notion = new Client({ auth: process.env.NOTION_API})
const { setEnvValue } = require("./util")

class NotionHelper {
    constructor() {
        this.token = process.env.NOTION_API
        this.pageId = process.env.NOTION_PAGE
    }

    set databaseId(databaseId) {
        this.databaseId = databaseId // change later
        this.setNotionDatabaseID(this.databaseId)
    }

    get databaseId() {
        return this.databaseId
    }

    get pages() {
        return this.getNotionPages()
    }

    get pageId() {
        return this.pageId
    }

    get token() {
        return this.token
    }

    /**
     * TODO get notion assignment
     */
    async getNotionPages() {
        const response = await notion.databases.query({
            database_id: this.databaseId,
        })
        const notion_pages = response.results
        .map((page) => page.properties.ID.number)

        return await notion_pages
    }

    /**
     * Sets the NOTION_DATABASE /.env variable.
     * 
     * @param {string} databaseID
     */
    async setNotionDatabaseID(databaseID) {
        // sets user_id in the environment
        console.log('Updating NOTION_DATABASE to new value...')
        setEnvValue('NOTION_DATABASE', `'${databaseID}'`)
        console.log('Update for NOTION_DATABASE successful!')
    }
}

module.exports = { NotionHelper }