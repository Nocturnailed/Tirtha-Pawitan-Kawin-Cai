import { AuthRepository } from '../repositories/AuthRepository'
import { hashPassword, verifyPassword, generateToken } from '../utils/auth'

const repo = new AuthRepository()

export class AuthService {
    async login(email: string, password: string, ip?: string, userAgent?: string) {
        const user = await repo.findByEmail(email)
        if (!user) throw new Error('User not found')

        const isValid = await verifyPassword(password, user.password)
        if (!isValid) throw new Error('Invalid password')

        if (user.status !== 'ACTIVE') throw new Error('Account is not active')

        const token = generateToken({
            userId: user.id,
            email: user.email,
            roleId: user.role_id,
            roleName: user.role.name
        })

        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 1) // 1 day

        await repo.createSession({
            token,
            user: { connect: { id: user.id } },
            ip,
            user_agent: userAgent,
            expires_at: expiresAt
        })

        await repo.updateUser(user.id, { last_login_at: new Date() })

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                role: user.role.name
            }
        }
    }

    async logout(token: string) {
        await repo.deleteSession(token)
    }

    async validateSession(token: string) {
        const session = await repo.findSessionByToken(token)
        if (!session) return null
        if (session.expires_at < new Date()) {
            await repo.deleteSession(token)
            return null
        }
        return session.user
    }

    async getAllUsers() {
        const users = await repo.findAll()
        return users.map(u => ({
            id: u.id,
            email: u.email,
            fullName: u.full_name,
            role: u.role.name,
            status: u.status,
            createdAt: u.created_at
        }))
    }

    async createUser(data: any) {
        const hashedPassword = await hashPassword(data.password)
        return await repo.createUser({
            email: data.email,
            password: hashedPassword,
            full_name: data.fullName,
            role: { connect: { id: data.roleId } },
            status: data.status || 'ACTIVE'
        })
    }

    async deleteUser(id: number) {
        return await repo.deleteUser(id)
    }

    async getUserProfile(id: number) {
        const user = await repo.findById(id)
        if (!user) return null

        return {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            institution: user.institution,
            position: user.position,
            status: user.status,
            role: {
                name: user.role.name,
                description: user.role.description,
                permissions: user.role.permissions.map(p => ({
                    action: p.action,
                    resource: p.resource
                }))
            },
            lastLoginAt: user.last_login_at
        }
    }
}


