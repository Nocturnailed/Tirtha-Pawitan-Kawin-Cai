import { AuthService } from '../../services/authService'

const auth = new AuthService()

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const body = await readBody(event)

  try {
    const result = await auth.login(
      body.email,
      body.password,
      getRequestIP(event),
      getHeader(event, 'user-agent')
    )

    return result
  } catch (error: any) {
    throw createError({
      statusCode: 401,
      statusMessage: error.message || 'Login failed'
    })
  }
})
