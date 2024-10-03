/**
 * npm i nodemon -g
 * npm i @notionhq/client
 * npm i dotenv
 * npm i --save lodash
 */

const { Client, APIErrorCode } = require("@notionhq/client")
const { CanvasHelper } = require("./canvashelper")
const { NotionHelper } = require("./notionhelper")
const canvash = new CanvasHelper()
const notionh = new NotionHelper()

const notion = new Client({ auth: notionh.token})

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
                database_id: await notionh.databaseId
            },
            properties: assignment_properties,
        })
        console.log(`SUCCESS: new page ${assignment_properties.ID.number} has been created!`)
    } catch (error) {
        console.log(`ERROR: createPage failed!\n${error}`)
    }
}

/**
 * For assignments of a course, check if the assignment is already in the database.
 * If the assignment is in the database, send assignment for updates, otherwise
 * create the assignment page
 * 
 * @param {number} courseID
 * @param {string} courseName  
 */
async function createNotionPages(courseID, courseName) {
    const assignments = await canvash.getCourseAssignments(courseID, courseName)
    for (let assignment of await assignments) {
        checkNotionPages(await assignment.ID.number, assignment)
    }
}

/**
 * Create Notion database with properties to describe assignments.
 */
async function createNotionDatabase() {
    try {
        // parameters for database, subject to change
        const newDatabase = await notion.databases.create({
            parent: {
                type: "page_id",
                page_id: await notionh.pageId,
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
                "ID": {
                    type: "number",
                    number: {
                        format: "number"
                    }
                },
                "URL": {
                    type: "url",
                    url: {},
                },
                /**"children": [
                {
                    object: "block",
                    type: "paragraph",
                    paragraph: {
                        rich_text: [{
                          type: "text",
                          text: {
                            content: '',
                            "link": null
                          }
                        }],
                        "color": "default"
                    },
                }
                ]**/
            },
        })
        console.log(`SUCCESS: Canvas Assignments database has been created!`)

        // set database id in the environment
        notionh.databaseId = newDatabase.id
        notionh.setDatabaseId(newDatabase.id)

        // populate database
        createAssignments()
    }
    catch (error) {
        console.log(`ERROR: ${error}`)
    }

}

/**
 * Create assignment for each course.
 */
async function createAssignments() {
    const courses = await canvash.courses

    for (let i = 0; i < courses.length; i++) {
        createNotionPages(courses[i].id, courses[i].name)
    }
}

/**
 * Update Notion Database Course Property if changed,
 * Prompt to createAssignments to check if assignments
 * need to be added or changed
 * 
 */
async function updateNotionDatabase() {
    try {
        const response = await notion.databases.update({
            database_id: await notionh.databaseId,
            properties: {
                "Course": {
                    select: {
                        options: await canvash.courses,
                    },
                },
            },
        })
        createAssignments()
        console.log(`SUCCESS: Database has been updated!`)
    } catch (error) {
        console.log(`ERROR: Database could not be update! ${error}`)
    }
}

/**
 * Update page properties.
 * 
 * NOT COMPLETE !!
 */
async function updateNotionPages(assignment) {
    try {
    } catch (error) {
        console.log(`ERROR: Could not update page ${assignment.ID.number}`)
    }
}

/**
 * Check if assignment exists in the Notion Database
 * Returns true if exists, false otherwise
 * @param {number} pageID 
 * @returns {boolean}
 */
async function checkNotionPages(pageID, assignment) {
    const pages = await notionh.pages
    if ((await pages).includes(pageID) == true) {
        console.log(`FOUND: Assignment ${pageID} exists!`)
        console.log("Updating assignment...")
        await updateNotionPages(assignment)
    } else {
        console.log(`NOT FOUND: Assignment ${pageID} does not exist in database`)
        console.log("Creating new assignment...")
        await createPage(assignment)
    }
}

/**
 * Check if the course assignment database exists.
 */
async function checkNotionDatabase() {
    try {
        // find database using id
        const response = await notion.databases.query({
            database_id: await notionh.databaseId
        })
        // database exists, update possible values
        console.log('FOUND: Database exists! Retrieving database data...')
        updateNotionDatabase()
    } catch (error) {
        if (error.code === APIErrorCode.ObjectNotFound || notionh.databaseId === 'invalid') {
            // database does not exist, create database and add pages
            console.log('NOT FOUND: Database does not exist! Creating new database...')
            createNotionDatabase()
        } else {
            console.log(`ERROR: checkNotionDatabase failed\n${error}`)
        }
    }
}

checkNotionDatabase()