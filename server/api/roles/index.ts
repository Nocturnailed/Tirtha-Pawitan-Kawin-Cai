import { RbacService } from '../../services/rbacService'
import { getAuthenticatedUser } from '../../utils/auth'

const rbac = new RbacService()

export default defineEventHandler(async (event) => {
    const auth = getAuthenticatedUser(event)
    if (!auth) throw createError({ statusCode: 401 })

    return await rbac.getAllRoles()
})
