// https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import 'dotenv/config'

class Config {
    NOTION_ID = process.env.NOTION_ID
    DATABASE_ID = process.env.DATABASE_ID
}

export const CONFIG = new Config()
