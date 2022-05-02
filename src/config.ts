// https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import 'dotenv/config'

const verifyString = function (input: string | undefined): string {
    if (!input) {
        console.log('Incomplete config. Exiting...')
        process.exit(1)
    }
    return input
}

class Config {
    NOTION_ID = verifyString(process.env.NOTION_ID)
    DATABASE_ID = verifyString(process.env.DATABASE_ID)
}

export const CONFIG = new Config()
