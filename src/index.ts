import { Client } from '@notionhq/client'
import {
    QueryDatabaseResponse, UpdatePageResponse
} from '@notionhq/client/build/src/api-endpoints'
import { CONFIG } from './config'

const notion = new Client({ auth: CONFIG.NOTION_ID })

const wrong_type_msg = (prop_name: string) => {
    return `${prop_name} property had incorrect type. Skipping...`
}

const prop_not_found_msg = (prop_name: string) => {
    return `No ${prop_name} property. Skipping...`
}

type DatabaseItem = QueryDatabaseResponse['results'][number]

// TODO: "type" should be a specific type with possible values
const getProperty = (name: string, item: DatabaseItem) => {
    if (!('properties' in item)) {
        return
    }

    if (name in item.properties) {
        const props = item.properties[name]
        switch (props.type) {
            case 'title':
                return props.title[0].plain_text
            case 'date':
                if (props.date) {
                    return props.date.start
                }
                console.log('Null date property')
                break
            case 'number':
                if (props.number) {
                    return props.number
                }
                console.log('Null number property')
                break
            default:
                console.log(wrong_type_msg(name))
        }
    }
    else {
        console.log(prop_not_found_msg(name))
    }
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
        const name     = getProperty('Name', item)
        const old_date = getProperty('Do Date', item)
        const interval = getProperty('Interval', item)

        // TODO: there must be a better way to handle this section
        if (!(name && old_date && interval
              && typeof(name) === 'string'
              && typeof(old_date) === 'string'
              && typeof(interval) === 'number'
        )) {
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
