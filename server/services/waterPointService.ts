import { WaterPointRepository } from '../repositories/WaterPointRepository'
import { LogRepository } from '../repositories/LogRepository'
import { AIoTService } from './aiot-service'

const repo = new WaterPointRepository()
const logRepo = new LogRepository()
const aiot = new AIoTService()

export class WaterPointService {
  async getAll(filters?: { search?: string; status?: string }) {
    const points = await repo.findAll(filters)
    return points.map(p => ({
      ...p,
      lat: p.lat.toNumber(),
      lng: p.lng.toNumber(),
      debit: p.debit.toNumber()
    }))
  }

  async getById(id: number) {
    const point = await repo.findById(id)
    if (!point) return null
    return {
      ...point,
      lat: point.lat.toNumber(),
      lng: point.lng.toNumber(),
      debit: point.debit.toNumber()
    }
  }

  async create(data: any, userId?: number, ip?: string, userAgent?: string) {
    const point = await repo.create(data)

    await logRepo.createAuditLog({
      user: userId ? { connect: { id: userId } } : undefined,
      action: 'CREATE_WATER_POINT',
      resource: 'wp_water_points',
      resource_id: point.id,
      new_value: point as any,
      ip,
      user_agent: userAgent,
      details: `Created water point: ${point.name}`
    })

    return point
  }

  async update(id: number, data: any, userId?: number, ip?: string, userAgent?: string) {
    const oldPoint = await repo.findById(id)
    if (!oldPoint) throw new Error('Water point not found')

    const updated = await repo.update(id, data)

    await logRepo.createAuditLog({
      user: userId ? { connect: { id: userId } } : undefined,
      action: 'UPDATE_WATER_POINT',
      resource: 'wp_water_points',
      resource_id: id,
      old_value: oldPoint as any,
      new_value: updated as any,
      ip,
      user_agent: userAgent,
      details: `Updated water point: ${updated.name}`
    })

    return updated
  }

  async delete(id: number, userId?: number, ip?: string, userAgent?: string) {
    const point = await repo.findById(id)
    if (!point) throw new Error('Water point not found')

    await repo.delete(id)

    await logRepo.createAuditLog({
      user: userId ? { connect: { id: userId } } : undefined,
      action: 'DELETE_WATER_POINT',
      resource: 'wp_water_points',
      resource_id: id,
      old_value: point as any,
      ip,
      user_agent: userAgent,
      details: `Deleted water point: ${point.name}`
    })
  }

  async updateDebit(id: number, debit: number, status: string, userId?: number, ip?: string, userAgent?: string) {
    const updated = await this.update(id, {
      debit,
      status,
      source: 'Sistem IoT'
    }, userId, ip, userAgent)

    // AIoT Logic: Check for anomalies
    const isAnomaly = await aiot.detectAnomaly(debit, id)
    if (isAnomaly) {
      await logRepo.createMetric({
        type: 'SYSTEM_WARNING',
        value: debit,
        unit: 'L/s',
        source: `AIoT_Anomaly_Detection_${id}`,
        meta: { message: 'Anomaly detected in water debit reading', pointId: id }
      })
    }

    await logRepo.createMetric({
      type: 'DEBIT_READING',
      value: debit,
      unit: 'L/s',
      source: `wp_water_points_${id}`,
      meta: { status, pointId: id, isAnomaly }
    })

    return updated
  }

  async getStatistics() {
    const stats = await repo.getStats()
    const layakCount = await repo.countByStatus('Layak/Aman')
    const kritisCount = await repo.countByStatus('Kritis') // Or handle specific logic in repo

    return {
      ...stats,
      layakCount,
      kritisCount
    }
  }
}

