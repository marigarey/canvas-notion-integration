/**
 * TODO:
 * => change checkbox to status
 * => add description of assignments into each page
 */

require('dotenv').config()
const { Client } = require("@notionhq/client")
const { CanvasHelper } = require("./canvashelper")
const { NotionHelper } = require("./notionhelper")
const CanvasHelp = new CanvasHelper()
const NotionHelp = new NotionHelper()
const NotionClient = new Client({ auth: NotionHelp.api})

/**
 * Validates if there is a database present.
 * If so, update the database, else create a new database.
 */
async function checkDatabase() {
    try {
        const courses = await CanvasHelp.getCourses()
        const response = await NotionClient.databases.query({
            database_id: NotionHelp.database
        })
        console.log('FOUND: Database exists! Retrieving database data...')
        if (CanvasHelp.courses != courses) {
            await NotionHelp.updateNotionDatabase(courses)
        }
        
    } catch (error) {
            console.log('NOT FOUND: Database does not exist! Creating new database...')
            await NotionHelp.createNotionDatabase(courses)
    }
}

/**
 * Check whether current page exists withi the database.
 * If so, update page, otherwise create new page.
 * @param {Promise<Array<{name: string, data: string, course: string, url: string, ID: number}>>} page 
 */
async function checkPage(page, course) {
    try {
        if ((await course).includes(await page.ID.number) == true) {
            console.log(`FOUND: Assignment ${page.ID.number} exists!`)
            await NotionHelp.updateNotionPage(page)
        }
        else {
            console.log(`NOT FOUND: Assignment ${page.ID.number} does not exist in database!`)
            console.log("Creating new assignment...")
            await NotionHelp.createNotionPage(page)
        }
    } catch(error) {
        console.log(`ERROR: checkPage() did not run: ${error}`)
    }
}

/**
 * For each course, get each assignment to check if it exists.
 */
async function getCoursesPages() {
    try {
        const courses = await CanvasHelp.courses
        for (let i = 0; i < courses.length; i++) {
            const pages = await CanvasHelp.getCourseAssignments(courses[i].id, courses[i].name)
            const course_pages = await NotionHelp.getNotionPagesByCourse(courses[i])
            for (let page of pages) {
                await checkPage(page, course_pages)
            }
        }
    } catch(error) {
        console.log(`ERROR: getCoursesPages() did not run: ${error}`)
    }
}

/**
 * Runs the database and page function.
 */
async function run() {
    await checkDatabase()
    await getCoursesPages()
}

run()
