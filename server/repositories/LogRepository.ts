import { db } from '../utils/database'
import { Prisma } from '@prisma/client'

export class LogRepository {
    async createAuditLog(data: Prisma.log_audit_trailCreateInput) {
        return await db.log_audit_trail.create({ data })
    }

    async createMetric(data: Prisma.log_system_metricsCreateInput) {
        return await db.log_system_metrics.create({ data })
    }

    async createMqttLog(data: Prisma.log_mqtt_messagesCreateInput) {
        return await db.log_mqtt_messages.create({ data })
    }

    async createApiRequestLog(data: Prisma.log_api_requestsCreateInput) {
        return await db.log_api_requests.create({ data })
    }

    async getMetrics(type: string, limit = 100) {
        return await db.log_system_metrics.findMany({
            where: { type },
            orderBy: { recorded_at: 'desc' },
            take: limit
        })
    }

    async getAuditLogs(limit = 100) {
        return await db.log_audit_trail.findMany({
            orderBy: { created_at: 'desc' },
            take: limit,
            include: { user: true }
        })
    }

    async getMqttLogs(limit = 100) {
        return await db.log_mqtt_messages.findMany({
            orderBy: { created_at: 'desc' },
            take: limit
        })
    }

    async getSystemMetrics(limit = 100) {
        return await db.log_system_metrics.findMany({
            orderBy: { recorded_at: 'desc' },
            take: limit
        })
    }
}

