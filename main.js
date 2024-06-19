/**
 * npm i @notionhq/client
 * npm i dotenv
 * npm i --save lodash
 * hello
 */

const { Client, APIErrorCode } = require("@notionhq/client")
const dotenv = require("dotenv").config({override: true})
const fs = require("fs");
const os = require("os");
const _ = require("lodash")

const CANVAS_API_URL = process.env.CANVAS_API_URL
const CANVAS_API = process.env.CANVAS_API
const CANVAS_USER_ID = process.env.CANVAS_USER_ID

const NOTION_PAGE = process.env.NOTION_PAGE
const NOTION_API = process.env.NOTION_API
const notion = new Client({ auth: NOTION_API})

const BATCH_SIZE = 10

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
                database_id: process.env.NOTION_DATABASE
            },
            properties: assignment_properties,
        })
        console.log(`SUCCESS: new page has been created!`)
    } catch (error) {
        console.log(`ERROR: ${error}`)
    }
}

async function createNotionPages() {
    const assignments = await getCanvasAssignments(402200, 'CS354')
    for (let assignment of await assignments) {
        //await createPage(await assignment)
    }
    /**const pagesToCreateChunks = _.chunk(pagesToCreate, OPERATION_BATCH_SIZE)
    for (const pagesToCreateBatch of pagesToCreateChunks) {
    await Promise.all(
      pagesToCreateBatch.map(issue =>
        notion.pages.create({
          parent: { database_id: databaseId },
          properties: getPropertiesFromIssue(issue),
        })
      )
    )}**/
}

/**
 * Create Notion database with properties to describe assignments.
 */
async function createNotionDatabase() {
    try {
        const newDatabase = await notion.databases.create({
            parent: {
                type: "page_id",
                page_id: NOTION_PAGE,
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
                        options: await getCanvasCourses(),
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
        setNotionDatabaseID(newDatabase.id)
    }
    catch (error) {
        console.log(`ERROR: ${error}`)
    }

}

/**
 * TODO finish this method :D
 */
async function updateNotionDatabase() {
    try {
        const response = await notion.databases.update({
            database_id: process.env.NOTION_DATABASE,
            properties: {
                "Course": {
                    select: {
                        options: await getCanvasCourses()
                    }
                }
            }
        })
        //console.log(response)
    } catch (error) {
        console.log('update database error!')
    }
}

/**
 * TODO finish this method :D
 */
async function updateNotionPages() {
}

//*========================================================================
// VERIFIERS
//*========================================================================

/**
 * Check if the course assignment database exists.
 */
async function checkNotionDatabase() {
    try {
        // find database using id
        const response = await notion.databases.retrieve({
            database_id: process.env.NOTION_DATABASE
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
                property: "Hidden ID",
                number: {
                    equals: checkProperty
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

//*========================================================================
// HELPERS
//*========================================================================

/**
 * Retrieves user's Canvas id.
 * 
 * @returns {Promise<Array<{ id: string, name: string}}
 */
async function getCanvasCourses() {
    // Canvas API connection
    const url = `${CANVAS_API_URL}/api/v1/courses?access_token=${CANVAS_API}`
    const response = await fetch(url)
    const courses = await response.json()

    // Convert each course for Notion API, only courses that are currently active
    const course_option = await courses
        .filter(course => typeof course.name !== 'undefined' && course.end_at > new Date().toJSON())
        .map(course => ({
            id: course.id.toString(),
            name: course.name
        }))

    // list of the active courses
    return await course_option
}

/**
 * Retrieves the assignments from the Canvas API for a specific course.
 * 
 * @param {number} courseID 
 * @param {string} courseName 
 * @returns {Promise<Array<{ name: string, date: string, course: string, id: string }>>}
 */
async function getCanvasAssignments(courseID, courseName) {
    // Canvas API connection
    const url = `${CANVAS_API_URL}/api/v1/users/${CANVAS_USER_ID}/courses/${courseID}/assignments?access_token=${CANVAS_API}`
    const response = await fetch(url)
    const assignments = await response.json()

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
        "Hidden ID": {
            type: "number",
            number: assignment.id,
        },
    }))

    // list of assignments for the course
    return await assignment_list
}

/**
 * Sets the CANVAS_USER_ID /.env variable.
 */
async function setCanvasUserID() {

    // access canvas api
    const url = `${CANVAS_API_URL}/api/v1/courses?access_token=${CANVAS_API}`
    const response = await fetch(url)
    const courses = await response.json()

    // use first item that has a defined name (course exists)
    const course_option = await courses.filter(course => typeof course.name !== 'undefined')

    // sets user_id in the environment
    console.log('Updating CANVAS_USER_ID to new value...')
    setEnvValue('CANVAS_USER_ID', `'${course_option[0]["enrollments"][0]["user_id"]}'`)
    console.log('Update for CANVAS_USER_ID successful!')
}

/**
 * Sets the NOTION_DATABASE /.env variable.
 * 
 * @param {string} databaseID
 */
async function setNotionDatabaseID(databaseID) {
    // sets user_id in the environment
    console.log('Updating NOTION_DATABASE to new value...')
    setEnvValue('NOTION_DATABASE', `'${databaseID}'`)
    console.log('Update for NOTION_DATABASE successful!')
}

/**
 * Creates or updates /.env values.
 * 
 * @source https://stackoverflow.com/questions/64996008/update-attributes-in-env-file-in-node-js
 * 
 * @param {string} key
 * @param {string} value
 */
function setEnvValue(key, value) {

    // read file from hdd & split if from a linebreak to a array
    const ENV_VARS = fs.readFileSync("./.env", "utf8").split(os.EOL);

    // find the env we want based on the key
    const target = ENV_VARS.indexOf(ENV_VARS.find((line) => {
        return line.match(new RegExp(key));
    }));

    // replace the key/value with the new value
    ENV_VARS.splice(target, 1, `${key}=${value}`);

    // write everything back to the file system
    fs.writeFileSync("./.env", ENV_VARS.join(os.EOL));
}

//checkNotionDatabase()
//createNotionPages()