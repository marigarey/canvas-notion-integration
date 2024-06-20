/**
 * npm i @notionhq/client
 * npm i dotenv
 * npm i --save lodash
 */

const { test, tester} = require("./test")

const { Client, APIErrorCode } = require("@notionhq/client")
const { CanvasHelper } = require("./canvashelper")
const { NotionHelper } = require("./notionhelper")

const dotenv = require("dotenv").config({override: true})

const canvash = new CanvasHelper()
const notionh = new NotionHelper()

const notion = new Client({ auth: notionh.token})

// TODO order the notion calls
// figure out maybe how to run the file in the background so it doesn't have to manually run

/**
 * Creates a page and adds it to the Notion database.
 * 
 * @param {Promise<Array<{ name: string, date: string, course: string, id: string }>>} assignment_properties 
 */
async function createPage(assignment_properties) {
    try {
        const newPage = await notion.pages.create({
            parent: {
                type: "database_id",
                database_id: notionh.database_id
            },
            properties: assignment_properties,
        })
        console.log(`SUCCESS: new page ${assignment_properties.ID.number} has been created!`)
    } catch (error) {
        console.log(`ERROR: ${error}`)
    }
}

/**
 * TODO finish :D
 * create more than 10 assignments at a time
 * also loop through each course!
 * Creates the assignment pages in the database.
 * @param {number} courseID
 * @param {string} courseName  
 */
async function createNotionPages(courseID, courseName) {
    const assignments = await canvash.getCourseAssignments(courseID, courseName)
    for (let assignment of await assignments) {
        if (await checkNotionPages(assignment.ID.number) == 0) {
            await updateNotionPages(assignment)
        } else {
            await createPage(assignment)
        }
    }
}

/**
 * TODO figure out status value, and maybe other properties
 * Create Notion database with properties to describe assignments.
 */
async function createNotionDatabase() {
    try {
        // parameters for database, subject to change
        const newDatabase = await notion.databases.create({
            parent: {
                type: "page_id",
                page_id: notionh.pageId,
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
                        options: await canvash.courses,
                    },
                },
                "Completion": {
                    type: "checkbox",
                    checkbox: {}
                },
                "Hidden ID": {
                    type: "number",
                    number: {
                        format: "number"
                    }
                },
            },
        })
        console.log(`SUCCESS: Canvas Assignments database has been created!`)

        // set database id in the environment
        notionh.databaseId = newDatabase.id

        // populate database
        createAllAssignments()
    }
    catch (error) {
        console.log(`ERROR: ${error}`)
    }

}

/**
 * TODO finish this method :D
 * add properties, change propeties etc
 * 
 */
async function updateNotionDatabase() {
    try {
        const response = await notion.databases.update({
            database_id: process.env.NOTION_DATABASE,
            properties: {
                "Course": {
                    select: {
                        options: await canvash.courses,
                    },
                },
            },
        })
        console.log(`SUCCESS: Database ${response.title} has been updated!`)
    } catch (error) {
        console.log(`ERROR: Database could not be update! ${error}`)
    }
}

/**
 * AHHHHHHH
 */
async function createAllAssignments() {
    const courses = await canvash.courses

    for (let i = 0; i < courses.length; i++) {
        createNotionPages(courses[i].id, courses[i].name)
    }
}

/**
 * TODO finish this method :D
 * update page properties, add properties if not addedß
 */
async function updateNotionPages() {
}

//*========================================================================
// VERIFIERS
//*========================================================================

/**
 * TODO this :D
 * check if an assignment needs to be added (aka doesn't exist)
 * or if it needs to be updated (exists but not equivalent to page in database)
 * @param {number} pageID 
 * @returns {boolean}
 */
async function checkNotionPages(pageID) {
    const pages = notionh.pages
    if ((await pages).includes(pageID) == true) {
        console.log(`FOUND: Assignment ${pageID} exists!`)
        return false
    } else {
        console.log(`NOT FOUND: Assignment ${pageID} does not exist in database`)
        return true
    }
}

/**
 * Check if the course assignment database exists.
 */
async function checkNotionDatabase() {
    try {
        // find database using id
        const response = await notion.databases.retrieve({
            database_id: notionh.databaseId
        })
        // database exists, update possible values
        console.log('FOUND: Database exists! Retrieving database data...')
        updateNotionDatabase()
    } catch (error) {
        if (error.code === APIErrorCode.ObjectNotFound) {
            // database does not exist, create database and add pages
            console.log('NOT FOUND: Database does not exist! Creating new database...')
            createNotionDatabase()
        } else {
            console.log(`ERROR: ${error}`)
        }
    }
}

/**
 * IGNORE
 * Checks if an assignment is already in the database.
 * 
 * @param {number} checkID
 * @returns {boolean}
 */
async function checkNotionID(checkID) {
    try {
        // find id in the database
        const response = notion.databases.query({
            database_id: process.env.NOTION_DATABASE,
            filter: {
                property: "ID",
                number: {
                    equals: checkID
                }
            }
        })
        // id found in database
        console.log(`FOUND: Assignment ${checkID} exists!`)
        return true
    } catch (error) {
        if (error.code === APIErrorCode.ObjectNotFound) {
            // id not found in database
            console.log(`NOT FOUND: Assignment ${checkID} does not exist in database`)
            return false
        } else {
            console.log(`ERROR: ${error}`)
        }
    }
}