import { db } from '../utils/database'
import { Prisma } from '@prisma/client'

export class AuthRepository {
    async findByEmail(email: string) {
        return await db.auth_users.findUnique({
            where: { email },
            include: {
                role: {
                    include: {
                        permissions: true
                    }
                }
            }
        })
    }

    async findById(id: number) {
        return await db.auth_users.findUnique({
            where: { id },
            include: {
                role: {
                    include: {
                        permissions: true
                    }
                }
            }
        })
    }

    async createUser(data: Prisma.auth_usersCreateInput) {
        return await db.auth_users.create({
            data
        })
    }

    async updateUser(id: number, data: Prisma.auth_usersUpdateInput) {
        return await db.auth_users.update({
            where: { id },
            data
        })
    }

    async createSession(data: Prisma.auth_sessionsCreateInput) {
        return await db.auth_sessions.create({
            data
        })
    }

    async findSessionByToken(token: string) {
        return await db.auth_sessions.findUnique({
            where: { token },
            include: {
                user: {
                    include: {
                        role: {
                            include: {
                                permissions: true
                            }
                        }
                    }
                }
            }
        })
    }

    async deleteSession(token: string) {
        return await db.auth_sessions.delete({
            where: { token }
        })
    }

    async deleteExpiredSessions() {
        return await db.auth_sessions.deleteMany({
            where: {
                expires_at: {
                    lt: new Date()
                }
            }
        })
    }

    async findAll() {
        return await db.auth_users.findMany({
            include: {
                role: true
            }
        })
    }

    async deleteUser(id: number) {
        return await db.auth_users.delete({
            where: { id }
        })
    }
}

