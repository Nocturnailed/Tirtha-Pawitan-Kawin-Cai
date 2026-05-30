import { RbacService } from '../services/rbacService'

const rbac = new RbacService()

interface RbacCheck {
  userId: number
  action: string
  resource: string
}

export const checkPermission = async ({ userId, action, resource }: RbacCheck): Promise<boolean> => {
  return await rbac.checkPermission(userId, action, resource)
}


export const requirePermission = (action: string, resource: string) => {
  return defineEventHandler(async (event) => {
    const user = event.context.auth as { userId: number } | undefined

    if (!user) {
      throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
    }

    const hasPermission = await checkPermission({
      userId: user.userId,
      action,
      resource
    })

    if (!hasPermission) {
      throw createError({ statusCode: 403, statusMessage: `Insufficient permissions: ${action} on ${resource}` })
    }
  })
}
