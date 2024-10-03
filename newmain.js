const { Client, APIErrorCode } = require("@notionhq/client")
const { CanvasHelper } = require("./canvashelper")
const { NotionHelper } = require("./notionhelper")
const CanvasHelp = new CanvasHelper()
const NotionHelp = new NotionHelper()
const NotionClient = new Client({ auth: NotionHelp.api})

async function checkDatabase() {
    try {
        const response = await NotionClient.databases.query({
            database_id: NotionHelp.database
        })
        console.log('FOUND: Database exists! Retrieving database data...')
        NotionHelp.updateNotionDatabase()
    } catch (error) {
        if (error.code === APIErrorCode.ObjectNotFound || NotionHelp.database === 'invalid') {
            console.log('NOT FOUND: Database does not exist! Creating new database...')
            NotionHelp.createNotionDatabase()
        } else {
            console.log(`ERROR: checkNotionDatabase failed\n${error}`)
        }
    }
}

async function checkPage(page_id, page) {
    const pages = await NotionHelp.getNotionPages()
    if (pages.includes(page_id) == true) {
        console.log(`FOUND: Assignment ${page_id} exists!`)
        await NotionHelp.updateNotionPage(page)
    }
    else {
        console.log(`NOT FOUND: Assignment ${page_id} does not exist in database!`)
        console.log("Creating new assignment...")
        await NotionHelp.createNotionPage(page)
    }
}

async function getCoursesPages() {
    const courses = await CanvasHelp.courses
    for (let i = 0; i < courses.length; i++) {
        const pages = await CanvasHelp.getCourseAssignments(courses[i].id, courses[i].name)
        for (let page of pages) {
            checkPage(await page.ID.number, page)
        }
    }
}

async function run() {
    checkDatabase()
    getCoursesPages()
}

run()