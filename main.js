/**
 * npm i @notionhq/client
 * npm i dotenv
 * npm i --save lodash
 */

const { Client } = require("@notionhq/client")
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

async function getCanvasCourses() {
    const url = `${CANVAS_API_URL}/api/v1/courses?access_token=${CANVAS_API}`
    const response = await fetch(url)
    const courses = await response.json()
    const course_option = await courses
        .filter(course => typeof course.name !== 'undefined' && course.end_at > new Date().toJSON())
        .map(course => ({
            id: course.id.toString(),
            name: course.name
        }))
    return await course_option
}

async function getCanvasAssignments(courseID, courseName) {
    const url = `${CANVAS_API_URL}/api/v1/users/${CANVAS_USER_ID}/courses/${courseID}/assignments?access_token=${CANVAS_API}`
    const response = await fetch(url)
    const assignments = await response.json()
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
            number: assignment.id,
        },
    }))
    return await assignment_list
}

async function createPage(assignment_properties) {
    try {
        const newPage = await notion.pages.create({
            parent: {
                type: "database_id",
                database_id: process.env.NOTION_DATABASE
            },
            properties: assignment_properties,
        })
    } catch (error) {
        console.log(error)
    }
}

async function createNotionPages() {
    const assignments = await getCanvasAssignments(402200, 'CS354')
    for (let assignment of await assignments) {
        //await createPage(await assignment)
    }
}

async function updateNotionPage() {

}

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
        //const parsed = {NOTION_DATABASE: 'test'}
        //dotenv.populate(process.env, parsed)
        console.log(newDatabase)
        console.log(`SUCCESS! The database: Canvas Assignments has been created!`)
    }
    catch (error) {
        console.log(`ERROR! ${error}`)
    }

}

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

async function checkNotionDatabase() {
    try {
        const response = await notion.databases.retrieve({
            database_id: process.env.NOTION_DATABASE
        })
        console.log('Database found! Retrieving database data...')
        updateNotionDatabase()
    } catch (error) {
        console.log('Database does not exist! Creating new database...')
        createNotionDatabase()
    }
}

async function checkNotionID(checkProperty) {
    try {
        const response = notion.databases.query({
            database_id: process.env.NOTION_DATABASE,
            filter: {
                property: "Hidden ID",
                number: {
                    equals: checkProperty
                }
            }
        })
    } catch (error) {
        console.log('')
    }
}

async function setCanvasUserID() {

}

async function setNotionDatabaseID() {
    
}

/**
 * @source https://stackoverflow.com/questions/64996008/update-attributes-in-env-file-in-node-js
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
createNotionPages()