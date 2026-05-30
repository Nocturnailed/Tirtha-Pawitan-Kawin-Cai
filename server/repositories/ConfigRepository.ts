import { db } from '../utils/database'

export class ConfigRepository {
    async get(key: string) {
        return await db.sys_config.findUnique({
            where: { key }
        })
    }

    async upsert(key: string, value: any) {
        return await db.sys_config.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        })
    }
}
