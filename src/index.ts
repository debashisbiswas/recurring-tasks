import { Client } from "@notionhq/client"
import { CONFIG } from "./config"

const notion = new Client({ auth: CONFIG.NOTION_ID })

const main = async function () {
    const checkedItems = await notion.databases.query({
        database_id: CONFIG.DATABASE_ID,
        filter: {
            property: 'Done',
            checkbox: {
                equals: true
            }
        },
    })

    for (let item of checkedItems.results) {
        let name = ''
        let old_date = ''
        let interval = 0

        if ('properties' in item) {
            if ('Name' in item.properties) {
                const name_prop = item.properties['Name']
                if (name_prop.type == 'title') {
                    name = name_prop.title[0].plain_text
                }
            }

            if ('Do Date' in item.properties) {
                if (item.properties['Do Date'].type == 'date') {
                    if (item.properties['Do Date'].date) {
                        old_date = item.properties['Do Date'].date.start
                    }
                }
            }

            if ('Interval' in item.properties) {
                if (item.properties['Interval'].type == 'number') {
                    if (item.properties['Interval'].number) {
                        interval = item.properties['Interval'].number
                    }
                }
            }
        }

        if (name) console.log(`Handling ${name}`)
        let new_date = new Date(old_date)
        new_date.setDate(new_date.getDate() + interval)

        await notion.pages.update({
            page_id: item.id,
            properties: {
                'Done': {
                    checkbox: false
                },
                'Do Date': {
                    date: {
                        start: new_date.toISOString().split('T')[0],
                    }
                }
            }
        })
    }
}

main()
