import { GalleryService } from '../../services/galleryService'
import { getAuthenticatedUser } from '../../utils/auth'

const service = new GalleryService()

export default defineEventHandler(async (event) => {
    const method = event.node.req.method

    if (method === 'GET') {
        return await service.getAll()
    }

    if (method === 'POST') {
        const auth = getAuthenticatedUser(event)
        if (!auth) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

        const body = await readBody(event)
        if (!body.title || !body.image_url) {
            throw createError({ statusCode: 422, statusMessage: 'Title and image_url are required' })
        }

        return await service.create({
            title: body.title,
            image_url: body.image_url,
            caption: body.caption || null,
            is_featured: body.is_featured || false,
            sort_order: body.sort_order || 0
        })
    }

    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
