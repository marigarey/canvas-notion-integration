/**
 * npm i @kth/canvas-api
 */

const { Client } = require("@notionhq/client")
const dotenv = require("dotenv")
const { Canvas } = require("@kth/canvas-api").default

config()

const CANVAS_API_URL = process.env.CANVAS_API_URL
const CANVAS_API_TOKEN = process.env.CANVAS_API_TOKEN
const canvas = new Canvas(CANVAS_API_URL, CANVAS_API_TOKEN)

const NOTION_PAGE_ID = process.env.NOTION_PAGE_ID
const NOTION_API_KEY = process.env.NOTION_API_KEY
const notion = new Client({ auth: NOTION_API_KEY})

async function createNewDatabase() {
    try {
        const newDatabase = await notion.databases.create({
            parent: {
                type: "page_id",
                page_id: NOTION_PAGE_ID,
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
                /**
                 * Assignment Name
                 * Due Date
                 * Course
                 * Status
                 */
            }
        })
    }

}

async function createDatabase() {

}

async function updateDatabase() {

}

async function checkDatabase() {
    try {
        const response = await notion.search({
            query: 'Canvas Assignments',
            filter: {
                value: 'database',
                property: 'object'
            },
            sort: {
                direction: 'ascending',
                timestamp: 'last_edited_time'
            },
        })
        console.log(`SUCCESS! ${response}`)
        createDatabase()
    } catch (error) {
        console.log(`ERROR! ${error}`)
        createNewDatabase()
    }
}

