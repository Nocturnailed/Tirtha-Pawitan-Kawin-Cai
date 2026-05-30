import { createHash, randomBytes, pbkdf2Sync } from 'node:crypto'

const JWT_SECRET = () => useRuntimeConfig().jwtSecret || 'tirtha-pawitan-secret-key-2026'

export interface JwtPayload {
  userId: number
  email: string
  roleId: number
  roleName: string
}

// --- Password hashing using PBKDF2 (zero external deps) ---

const SALT_LEN = 16
const KEY_LEN = 64
const ITERATIONS = 100000

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(SALT_LEN).toString('hex')
  const key = pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, 'sha512').toString('hex')
  return `pbkdf2$${ITERATIONS}$${salt}$${key}`
}

export const verifyPassword = async (password: string, stored: string): Promise<boolean> => {
  if (!stored.startsWith('pbkdf2$')) {
    // Legacy bcrypt hashes — reject, they can't be verified without bcryptjs
    return false
  }
  const [, iterStr, salt, origKey] = stored.split('$')
  const iterations = parseInt(iterStr, 10)
  const key = pbkdf2Sync(password, salt, iterations, KEY_LEN, 'sha512').toString('hex')
  return key === origKey
}

// --- JWT using Web Crypto API (zero external deps) ---

function base64url(data: string): string {
  return Buffer.from(data, 'utf-8').toString('base64url')
}

function base64urlDecode(str: string): string {
  return Buffer.from(str, 'base64url').toString('utf-8')
}

export const generateToken = (payload: JwtPayload): string => {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const now = Math.floor(Date.now() / 1000)
  const body = base64url(JSON.stringify({ ...payload, iat: now, exp: now + 86400 }))
  const signature = createHash('sha256').update(`${header}.${body}.${JWT_SECRET()}`).digest('base64url')
  return `${header}.${body}.${signature}`
}

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const [header, body, signature] = token.split('.')
    if (!header || !body || !signature) return null

    const expected = createHash('sha256').update(`${header}.${body}.${JWT_SECRET()}`).digest('base64url')
    if (signature !== expected) return null

    const payload = JSON.parse(base64urlDecode(body))
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null

    return {
      userId: payload.userId,
      email: payload.email,
      roleId: payload.roleId,
      roleName: payload.roleName
    }
  } catch {
    return null
  }
}

export const extractBearerToken = (event: any): string | null => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}

export const getAuthenticatedUser = (event: any): JwtPayload | null => {
  // 1. Try Bearer Token
  let token = extractBearerToken(event)

  // 2. Try Cookie if no Bearer
  if (!token) {
    const cookies = parseCookies(event)
    token = cookies.auth_token || null
  }

  if (!token) return null
  return verifyToken(token)
}
