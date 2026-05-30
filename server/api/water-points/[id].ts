import { WaterPointService } from '../../services/waterPointService'
import { getAuthenticatedUser } from '../../utils/auth'
import { logApiRequest } from '../../utils/logger'
import { checkPermission } from '../../utils/rbac'

const service = new WaterPointService()

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id || '0')
  const startTime = Date.now()
  const method = event.node.req.method
  const path = event.path

  if (isNaN(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  }

  try {
    const auth = getAuthenticatedUser(event)

    if (method === 'GET') {
      const result = await service.getById(id)
      if (!result) {
        throw createError({ statusCode: 404, statusMessage: 'Sumber air tidak ditemukan' })
      }

      await logApiRequest({
        method, path, statusCode: 200,
        durationMs: Date.now() - startTime,
        userId: auth?.userId,
        ip: getRequestIP(event),
        userAgent: getHeader(event, 'user-agent')
      })

      return result
    }

    if (method === 'PATCH' || method === 'PUT') {
      if (!auth) {
        throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
      }

      const body = await readBody(event)
      const isManualOverride = body.source === 'Manual Petugas' || body.override === true

      const permissionAction = isManualOverride ? 'OVERRIDE' : 'UPDATE'
      const hasPermission = await checkPermission({
        userId: auth.userId,
        action: permissionAction,
        resource: 'WATER_POINTS'
      })

      if (!hasPermission) {
        throw createError({ statusCode: 403, statusMessage: `Insufficient permissions: ${permissionAction} on WATER_POINTS` })
      }

      // If it's a debit update with status
      if (body.debit !== undefined && body.status !== undefined) {
        const result = await service.updateDebit(id, body.debit, body.status, auth.userId, getRequestIP(event), getHeader(event, 'user-agent'))

        await logApiRequest({
          method, path, statusCode: 200,
          durationMs: Date.now() - startTime,
          userId: auth.userId,
          ip: getRequestIP(event),
          userAgent: getHeader(event, 'user-agent')
        })

        return result
      }

      const result = await service.update(id, body, auth.userId, getRequestIP(event), getHeader(event, 'user-agent'))

      await logApiRequest({
        method, path, statusCode: 200,
        durationMs: Date.now() - startTime,
        userId: auth.userId,
        ip: getRequestIP(event),
        userAgent: getHeader(event, 'user-agent')
      })

      return result
    }

    if (method === 'DELETE') {
      if (!auth) {
        throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
      }

      const hasPermission = await checkPermission({
        userId: auth.userId,
        action: 'DELETE',
        resource: 'WATER_POINTS'
      })

      if (!hasPermission) {
        throw createError({ statusCode: 403, statusMessage: 'Insufficient permissions: DELETE on WATER_POINTS' })
      }

      await service.delete(id, auth.userId, getRequestIP(event), getHeader(event, 'user-agent'))

      await logApiRequest({
        method, path, statusCode: 200,
        durationMs: Date.now() - startTime,
        userId: auth.userId,
        ip: getRequestIP(event),
        userAgent: getHeader(event, 'user-agent')
      })

      return { message: 'Sumber air berhasil dihapus' }
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
