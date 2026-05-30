import { RbacRepository } from '../repositories/RbacRepository'
import { AuthRepository } from '../repositories/AuthRepository'

const repo = new RbacRepository()
const authRepo = new AuthRepository()

export class RbacService {
    async checkPermission(userId: number, action: string, resource: string) {
        const user = await authRepo.findById(userId)
        if (!user || user.status !== 'ACTIVE') return false

        return user.role.permissions.some(
            p => p.action === action && p.resource === resource
        )
    }

    async getRolePermissions(roleName: any) {
        const role = await repo.findRoleByName(roleName)
        return role?.permissions || []
    }

    async getAllRoles() {
        return await repo.findAllRoles()
    }
}
