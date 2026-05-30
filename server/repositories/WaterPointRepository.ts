import { db } from '../utils/database'
import { Prisma } from '@prisma/client'

export class WaterPointRepository {
    async findAll(filters?: { search?: string; status?: string }) {
        const where: Prisma.wp_water_pointsWhereInput = {}

        if (filters?.status) {
            where.status = filters.status
        }

        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search } },
                { district: { contains: filters.search } }
            ]
        }

        return await db.wp_water_points.findMany({
            where,
            orderBy: { created_at: 'desc' }
        })
    }

    async findById(id: number) {
        return await db.wp_water_points.findUnique({
            where: { id }
        })
    }

    async findByTopic(topic: string) {
        return await db.wp_water_points.findUnique({
            where: { topic }
        })
    }

    async create(data: Prisma.wp_water_pointsCreateInput) {
        return await db.wp_water_points.create({
            data
        })
    }

    async update(id: number, data: Prisma.wp_water_pointsUpdateInput) {
        return await db.wp_water_points.update({
            where: { id },
            data
        })
    }

    async delete(id: number) {
        return await db.wp_water_points.delete({
            where: { id }
        })
    }

    async countByStatus(status: string) {
        return await db.wp_water_points.count({
            where: { status }
        })
    }

    async getStats() {
        const aggregate = await db.wp_water_points.aggregate({
            _count: true,
            _avg: {
                debit: true
            }
        })

        return {
            total: aggregate._count,
            averageDebit: aggregate._avg.debit?.toNumber() || 0
        }
    }
}
