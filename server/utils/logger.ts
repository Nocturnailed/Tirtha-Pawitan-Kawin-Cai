import { LogRepository } from '../repositories/LogRepository'

const logRepo = new LogRepository()

interface LogEntry {
  userId?: number
  action: string
  resource: string
  resourceId?: number
  oldValue?: any
  newValue?: any
  ip?: string
  userAgent?: string
  details?: string
}

export const auditLog = async (entry: LogEntry) => {
  try {
    await logRepo.createAuditLog({
      action: entry.action,
      resource: entry.resource,
      resource_id: entry.resourceId,
      old_value: entry.oldValue ?? undefined,
      new_value: entry.newValue ?? undefined,
      ip: entry.ip,
      user_agent: entry.userAgent,
      details: entry.details,
      user: entry.userId ? { connect: { id: entry.userId } } : undefined
    })
  } catch (err) {
    console.error('[AuditLog Error]', err)
  }
}

export const logApiRequest = async (data: {
  method: string
  path: string
  statusCode: number
  durationMs: number
  userId?: number
  ip?: string
  userAgent?: string
  error?: string
}) => {
  try {
    await logRepo.createApiRequestLog({
      method: data.method,
      path: data.path,
      status_code: data.statusCode,
      duration_ms: data.durationMs,
      ip: data.ip,
      user_agent: data.userAgent,
      error: data.error,
      user_id: data.userId
    })
  } catch (err) {
    console.error('[ApiRequestLog Error]', err)
  }
}

export const logMqttMessage = async (data: {
  topic: string
  payload: any
  qos?: number
  retained?: boolean
  simulated?: boolean
}) => {
  try {
    await logRepo.createMqttLog({
      topic: data.topic,
      payload: data.payload,
      qos: data.qos ?? 0,
      retained: data.retained ?? false,
      simulated: data.simulated ?? false
    })
  } catch (err) {
    console.error('[MqttLog Error]', err)
  }
}

export const recordMetric = async (data: {
  type: string
  value: number
  unit?: string
  source?: string
  meta?: any
}) => {
  try {
    await logRepo.createMetric({
      type: data.type,
      value: data.value,
      unit: data.unit,
      source: data.source,
      meta: data.meta
    })
  } catch (err) {
    console.error('[SystemMetric Error]', err)
  }
}

