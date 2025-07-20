function test() {
    console.log("test")
}

function tester() {
    console.log("another one")
}

async function sortNotionDatabase() {
    try {
        const response = await notion.databases.query({
            database_id: notionh.databaseId,
            filter: {
                and: [
                    {
                        property: "Due Date",
                        date: {
                            next_week: {},
                        }
                    },
                    {
                        property: "Completion",
                        checkbox: {
                            equals: false
                        }
                    }
                ],
            },
            sorts: [
                {
                    property: "Due Date",
                    direction: "ascending",
                }
            ],
        })
        return response
    } catch (error) {
        console.log(`ERROR: unable to sort database due to ${error}`)
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
            database_id: await notionh.databaseId,
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

module.exports = {test, tester};

//e04c43ba-c824-4e73-9d4a-4604077f4cde

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// COPY OF METHODS WITH CHILDREN PARAMS
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
            properties: await page_properties.properties,
            "children": [
                {
                    "object": "block",
                    "paragraph": {
                        "rich_text": [
                            {
                                "text": {
                                    "content": await page_properties.description
                                }
                            }
                        ]
                    }
                },
            ]
        })
        console.log(`SUCCESS: new page ${page_properties.properties.ID.number} has been created!`)
    } catch (error) {
        console.log(page_properties.properties)
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
            properties: page_properties.properties,
            "children": [
                {
                    "object": "block",
                    "html": {
                        "rich_text": [
                            {
                                "text": {
                                    "content": page_properties.description
                                }
                            }
                        ]
                    }
                },
            ]
        })
        console.log(`SUCCESS: new page ${page_properties.ID.number} has been updated!`)
    } catch (error) {
        console.log(`ERROR: Could not update page ${page_properties.ID.number}`)
    }
}

    /**
     * Retrieves the assignments from the Canvas API for a specific course.
     * 
     * @param {number} courseID 
     * @param {string} courseName 
     * @returns {Promise<Array<{ name: string, date: string, course: string, ID: string }>>}
     */
    async getCourseAssignments(courseID, courseName) {
        // Canvas API connection
        const url = `${this.url}/api/v1/users/${await this.user}/courses/${courseID}/assignments?access_token=${this.api}&per_page=100`
        const response = await fetch(url)
        const assignments = await response.json()
        //console.log(await assignments)

        // Convert each assignment for the API, only for assignments that are named
        const assignment_list = await assignments
        .filter(assignment => typeof assignment.name !== 'undefined')
        .map((assignment) =>
            ({
                properties: {
                    "Assignment Name": {
                        type: "title",
                        title: [{
                            type: "text",
                            text: { content: assignment.name }
                        }]
                    },
                    "Due Date": {
                        type: "date",
                        date: { start: assignment.due_at || '2020-09-10'}
                    },
                    "Course": {
                        select: {
                            name: courseName
                        }
                    },
                    "URL": {
                        type: "url",
                        url: assignment.html_url
                    },
                    "ID": {
                        type: "number",
                        number: assignment.id,
                    },
                },
                description: assignment.description,
            }
        ))

        // list of assignments for the course
        return await assignment_list 
    }
