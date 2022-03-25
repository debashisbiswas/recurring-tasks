import { Client } from "@notionhq/client"

const notion = new Client({ auth: '' })

const databaseId = ''

    ; (async () => {
        const db = await notion.databases.query({
            database_id: databaseId
        })
        console.log(db)
    })()
