import { ConfigService } from '../../services/configService'
import { getAuthenticatedUser } from '../../utils/auth'
import { checkPermission } from '../../utils/rbac'

const configService = new ConfigService()

export default defineEventHandler(async (event) => {
    const method = event.node.req.method
    const auth = getAuthenticatedUser(event)

    if (!auth) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    // RBAC: Only ADMIN can manage configuration
    const isAdmin = await checkPermission({ userId: auth.userId, action: 'MANAGE', resource: 'SETTINGS' })
    if (!isAdmin) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    if (method === 'GET') {
        return await configService.getMqttConfig()
    }

    if (method === 'POST') {
        const body = await readBody(event)
        await configService.saveMqttConfig(body)
        return { message: 'MQTT Configuration saved successfully' }
    }

    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
