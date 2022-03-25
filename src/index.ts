import { Client } from "@notionhq/client"
import { CONFIG } from "./config"

const notion = new Client({ auth: CONFIG.NOTION_ID })

const main = async function () {
    if (CONFIG.DATABASE_ID) {
        const db = await notion.databases.query({
            database_id: CONFIG.DATABASE_ID
        })
        console.log(db)
    }
}

main()
