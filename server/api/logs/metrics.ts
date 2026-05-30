import { LogRepository } from '../../repositories/LogRepository'
import { getAuthenticatedUser } from '../../utils/auth'

const logRepo = new LogRepository()

export default defineEventHandler(async (event) => {
    const auth = getAuthenticatedUser(event)
    if (!auth) throw createError({ statusCode: 401 })

    return await logRepo.getSystemMetrics()
})
