import { db } from '../../utils/database'
import { validateRegister, flattenErrors } from '../../utils/validation'
import { hashPassword, generateToken } from '../../utils/auth'
import { auditLog, logApiRequest } from '../../utils/logger'

export default defineEventHandler(async (event) => {
  const startTime = Date.now()

  try {
    const body = await readBody(event)
    const { data, errors } = validateRegister(body)

    if (!data) {
      throw createError({ statusCode: 422, statusMessage: flattenErrors(errors).join('; ') })
    }

    const { data: existingUser } = await db.from('auth_users').select('id').eq('email', data.email).maybeSingle()
    if (existingUser) {
      throw createError({ statusCode: 409, statusMessage: 'Email sudah terdaftar' })
    }

    const { data: viewerRole } = await db.from('rbac_roles').select('id').eq('name', 'VIEWER').single()
    if (!viewerRole) {
      throw createError({ statusCode: 500, statusMessage: 'Role VIEWER not found. Run seed first.' })
    }

    const hashedPassword = await hashPassword(data.password)

    const { data: user, error: insertError } = await db.from('auth_users').insert({
      email: data.email,
      password: hashedPassword,
      full_name: data.fullName,
      institution: data.institution || null,
      position: data.position || null,
      role_id: viewerRole.id,
      status: 'ACTIVE'
    }).select('id, email, full_name, role_id, status, rbac_roles:role_id(name)').single()

    if (insertError) throw new Error(insertError.message)

    const roleName = (user.rbac_roles as any)?.name || 'VIEWER'

    const token = generateToken({
      userId: user.id,
      email: user.email,
      roleId: user.role_id,
      roleName
    })

    await db.from('auth_sessions').insert({
      user_id: user.id,
      token,
      user_agent: getHeader(event, 'user-agent'),
      ip: getRequestIP(event),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    })

    await auditLog({
      userId: user.id,
      action: 'USER_REGISTER',
      resource: 'auth_users',
      resourceId: user.id,
      newValue: { email: user.email, fullName: user.full_name, role: roleName },
      ip: getRequestIP(event),
      userAgent: getHeader(event, 'user-agent'),
      details: `New user registered: ${user.email}`
    })

    await logApiRequest({
      method: 'POST', path: event.path, statusCode: 201,
      durationMs: Date.now() - startTime, userId: user.id,
      ip: getRequestIP(event), userAgent: getHeader(event, 'user-agent')
    })

    return {
      user: { id: user.id, email: user.email, fullName: user.full_name, role: roleName, status: user.status },
      token
    }
  } catch (error: any) {
    await logApiRequest({
      method: 'POST', path: event.path,
      statusCode: error.statusCode || 500,
      durationMs: Date.now() - startTime,
      ip: getRequestIP(event), userAgent: getHeader(event, 'user-agent'),
      error: error.message
    })

    if (error.data || error.statusCode) throw error
    throw createError({ statusCode: 400, statusMessage: error.message || 'Registration failed' })
  }
})
