import { WaterPointService } from '../../services/waterPointService'
import { validateCreateWaterPoint, flattenErrors } from '../../utils/validation'
import { getAuthenticatedUser } from '../../utils/auth'
import { logApiRequest } from '../../utils/logger'
import { checkPermission } from '../../utils/rbac'

const service = new WaterPointService()

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const method = event.node.req.method
  const path = event.path

  try {
    const auth = getAuthenticatedUser(event)

    if (method === 'GET') {
      const query = getQuery(event)
      const result = await service.getAll({
        search: query.search as string,
        status: query.status as string
      })

      await logApiRequest({
        method, path, statusCode: 200,
        durationMs: Date.now() - startTime,
        userId: auth?.userId,
        ip: getRequestIP(event),
        userAgent: getHeader(event, 'user-agent')
      })

      return result
    }

    if (method === 'POST') {
      if (!auth) {
        throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
      }

      const hasPermission = await checkPermission({
        userId: auth.userId,
        action: 'CREATE',
        resource: 'WATER_POINTS'
      })

      if (!hasPermission) {
        throw createError({ statusCode: 403, statusMessage: 'Insufficient permissions: CREATE on WATER_POINTS' })
      }

      const body = await readBody(event)
      const { data, errors } = validateCreateWaterPoint(body)

      if (!data) {
        throw createError({
          statusCode: 422,
          statusMessage: flattenErrors(errors).join('; ')
        })
      }

      const result = await service.create({
        name: data.name,
        district: data.district,
        lat: data.lat,
        lng: data.lng,
        debit: data.debit,
        status: data.status,
        source: data.source,
        topic: data.topic,
        description: data.description
      }, auth.userId, getRequestIP(event), getHeader(event, 'user-agent'))

      await logApiRequest({
        method: method || 'POST', path, statusCode: 201,
        durationMs: Date.now() - startTime,
        userId: auth.userId,
        ip: getRequestIP(event),
        userAgent: getHeader(event, 'user-agent')
      })

      return result
    }

    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  } catch (error: any) {
    if (error.statusCode) throw error

    throw createError({
      statusCode: 400,
      statusMessage: error.message || 'Bad request'
    })
  }
})
