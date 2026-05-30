import { db } from '../../utils/database'
import { getAuthenticatedUser } from '../../utils/auth'
import { checkPermission } from '../../utils/rbac'
import { logApiRequest, recordMetric } from '../../utils/logger'

export default defineEventHandler(async (event) => {
  const startTime = Date.now()

  try {
    const auth = getAuthenticatedUser(event)
    if (!auth) {
      throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
    }

    const hasPermission = await checkPermission({
      userId: auth.userId, action: 'VIEW_LOGS', resource: 'SYSTEM'
    })
    if (!hasPermission) {
      throw createError({ statusCode: 403, statusMessage: 'Insufficient permissions' })
    }

    const [wpCount, userCount, auditCount, apiReqCount, recentErrors, mqtt24h, metrics24h] = await Promise.all([
      db.from('wp_water_points').select('id', { count: 'exact', head: true }),
      db.from('auth_users').select('id', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
      db.from('log_audit_trail').select('id', { count: 'exact', head: true }),
      db.from('log_api_requests').select('id', { count: 'exact', head: true }),
      db.from('log_api_requests').select('id', { count: 'exact', head: true }).gte('status_code', 400),
      db.from('log_mqtt_messages').select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      db.from('log_system_metrics').select('*')
        .eq('type', 'DEBIT_READING')
        .gte('recorded_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('recorded_at', { ascending: false })
        .limit(10)
    ])

    const totalApiRequests = apiReqCount.count || 0
    const recentErrorCount = recentErrors.count || 0
    const uptimeSeconds = process.uptime()
    const memoryUsage = process.memoryUsage()

    const healthData = {
      status: 'healthy',
      uptime: {
        seconds: Math.floor(uptimeSeconds),
        formatted: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${Math.floor(uptimeSeconds % 60)}s`
      },
      memory: {
        rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`
      },
      database: {
        totalWaterPoints: wpCount.count || 0,
        totalActiveUsers: userCount.count || 0,
        totalAuditLogs: auditCount.count || 0,
        totalApiRequests
      },
      metrics: {
        errorRate: totalApiRequests > 0 ? ((recentErrorCount / totalApiRequests) * 100).toFixed(2) + '%' : '0%',
        mqttMessages24h: mqtt24h.count || 0,
        recentDebitReadings: metrics24h.data || []
      },
      timestamp: new Date().toISOString()
    }

    await recordMetric({
      type: 'SYSTEM_HEALTH',
      value: recentErrorCount > 10 ? 0 : 1,
      unit: 'status',
      source: 'health-check',
      meta: healthData
    })

    await logApiRequest({
      method: 'GET', path: event.path, statusCode: 200,
      durationMs: Date.now() - startTime, userId: auth.userId,
      ip: getRequestIP(event), userAgent: getHeader(event, 'user-agent')
    })

    return healthData
  } catch (error: any) {
    await logApiRequest({
      method: 'GET', path: event.path,
      statusCode: error.statusCode || 500,
      durationMs: Date.now() - startTime,
      ip: getRequestIP(event), userAgent: getHeader(event, 'user-agent'),
      error: error.message
    })

    if (error.data || error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})
