import { GalleryService } from '../../services/galleryService'
import { getAuthenticatedUser } from '../../utils/auth'

const service = new GalleryService()

export default defineEventHandler(async (event) => {
    const id = Number(getRouterParam(event, 'id'))
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

    const method = event.node.req.method
    const auth = getAuthenticatedUser(event)
    if (!auth) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

    if (method === 'PATCH' || method === 'PUT') {
        const body = await readBody(event)
        return await service.update(id, body)
    }

    if (method === 'DELETE') {
        await service.delete(id)
        return { success: true }
    }

    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
