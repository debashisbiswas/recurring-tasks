import { Client } from '@notionhq/client'
import { UpdatePageResponse } from '@notionhq/client/build/src/api-endpoints'
import { CONFIG } from './config'

const notion = new Client({ auth: CONFIG.NOTION_ID })

const wrong_type_msg = (prop_name: string) => {
    return `${prop_name} property had incorrect type. Skipping...`
}

const prop_not_found_msg = (prop_name: string) => {
    return `No ${prop_name} property. Skipping...`
}

const main = async () => {
    const checkedItems = await notion.databases.query({
        database_id: CONFIG.DATABASE_ID,
        filter: {
            property: 'Done',
            checkbox: {
                equals: true
            }
        },
    })

    const api_calls: Promise<UpdatePageResponse>[] = []
    for (const item of checkedItems.results) {
        let name = ''
        let old_date = ''
        let interval = 0
        if (!('properties' in item)) {
            continue
        }

        // TODO: lots of repeated code in here. Make this a function.
        let current_prop = 'Name'
        if (current_prop in item.properties) {
            const name_prop = item.properties[current_prop]
            if (name_prop.type == 'title') {
                name = name_prop.title[0].plain_text
            }
            else {
                console.log(wrong_type_msg(current_prop))
                continue
            }
        }
        else {
            console.log(prop_not_found_msg(current_prop))
            continue
        }

        current_prop = 'Do Date'
        if (current_prop in item.properties) {
            const date_prop = item.properties[current_prop]
            if (date_prop.type == 'date') {
                if (date_prop.date) {
                    old_date = date_prop.date.start
                }
            }
            else {
                console.log(wrong_type_msg(current_prop))
                continue
            }
        }
        else {
            console.log(prop_not_found_msg(current_prop))
            continue
        }

        current_prop = 'Interval'
        if (current_prop in item.properties) {
            const prop = item.properties[current_prop]
            if (prop.type == 'number') {
                if (prop.number) {
                    interval = prop.number
                }
            }
            else {
                console.log(wrong_type_msg(current_prop))
                continue
            }
        }
        else {
            console.log(prop_not_found_msg(current_prop))
            continue
        }

        const call = new Promise<UpdatePageResponse>((resolve) => {
            const new_date = new Date(old_date)
            new_date.setDate(new_date.getDate() + interval)
            console.log(`Handling ${name}`)

            resolve(
                notion.pages.update({
                    page_id: item.id,
                    properties: {
                        'Done': {
                            checkbox: false
                        },
                        'Do Date': {
                            date: {
                                start: new_date.toISOString().split('T')[0]
                            }
                        }
                    }
                })
            )
        })
        api_calls.push(call)
    }

    await Promise.all(api_calls.map((p) => { p.catch(console.error) }))
}

main().catch(console.error)
