import { WaterPointService } from '../../services/waterPointService'
import { getAuthenticatedUser } from '../../utils/auth'
import { logApiRequest } from '../../utils/logger'

const service = new WaterPointService()

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const path = event.path

  try {
    const auth = getAuthenticatedUser(event)
    const result = await service.getStatistics()

    await logApiRequest({
      method: 'GET',
      path,
      statusCode: 200,
      durationMs: Date.now() - startTime,
      userId: auth?.userId,
      ip: getRequestIP(event),
      userAgent: getHeader(event, 'user-agent')
    })

    return result
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})
