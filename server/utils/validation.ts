// Lightweight validation — zero external dependencies
// Replaces zod to avoid Nitro dev server module resolution issues

interface Rule {
  check: () => boolean
  message: string
}

interface FieldValidation {
  valid: boolean
  errors: string[]
}

type ValidationErrors = Record<string, string[]>

const VALID_STATUSES = ['Layak/Aman', 'Butuh Konservasi', 'Kritis'] as const
const VALID_SOURCES = ['Sistem IoT', 'Manual Petugas'] as const

function validate(rules: Rule[]): FieldValidation {
  const errors = rules.filter(r => !r.check()).map(r => r.message)
  return { valid: errors.length === 0, errors }
}

function isString(v: unknown): v is string {
  return typeof v === 'string'
}

function isNumber(v: unknown): v is number {
  return typeof v === 'number' && !isNaN(v)
}

// ---- Water Point Schemas ----

export function validateCreateWaterPoint(body: unknown): { data: any; errors: ValidationErrors } | { data: null; errors: ValidationErrors } {
  const errors: ValidationErrors = {}
  const d = body as Record<string, unknown>

  // name
  {
    const r = validate([
      { check: () => isString(d.name), message: 'Nama harus berupa teks' },
      { check: () => isString(d.name) && d.name.length >= 3, message: 'Nama minimal 3 karakter' },
      { check: () => isString(d.name) && d.name.length <= 100, message: 'Nama maksimal 100 karakter' },
    ])
    if (!r.valid) errors.name = r.errors
  }

  // district
  {
    const r = validate([
      { check: () => isString(d.district), message: 'Kecamatan harus berupa teks' },
      { check: () => isString(d.district) && d.district.length >= 2, message: 'Kecamatan minimal 2 karakter' },
      { check: () => isString(d.district) && d.district.length <= 50, message: 'Kecamatan maksimal 50 karakter' },
    ])
    if (!r.valid) errors.district = r.errors
  }

  // lat
  {
    const r = validate([
      { check: () => isNumber(d.lat), message: 'Latitude harus berupa angka' },
      { check: () => isNumber(d.lat) && d.lat >= -90, message: 'Latitude minimal -90' },
      { check: () => isNumber(d.lat) && d.lat <= 90, message: 'Latitude maksimal 90' },
    ])
    if (!r.valid) errors.lat = r.errors
  }

  // lng
  {
    const r = validate([
      { check: () => isNumber(d.lng), message: 'Longitude harus berupa angka' },
      { check: () => isNumber(d.lng) && d.lng >= -180, message: 'Longitude minimal -180' },
      { check: () => isNumber(d.lng) && d.lng <= 180, message: 'Longitude maksimal 180' },
    ])
    if (!r.valid) errors.lng = r.errors
  }

  // debit
  {
    const r = validate([
      { check: () => isNumber(d.debit), message: 'Debit harus berupa angka' },
      { check: () => isNumber(d.debit) && d.debit >= 0, message: 'Debit tidak boleh negatif' },
      { check: () => isNumber(d.debit) && d.debit <= 9999.99, message: 'Debit maksimal 9999.99' },
    ])
    if (!r.valid) errors.debit = r.errors
  }

  // status
  {
    const r = validate([
      { check: () => isString(d.status), message: 'Status harus berupa teks' },
      { check: () => VALID_STATUSES.includes(d.status as any), message: `Status tidak valid. Pilihan: ${VALID_STATUSES.join(', ')}` },
    ])
    if (!r.valid) errors.status = r.errors
  }

  // source
  {
    if (d.source !== undefined) {
      const r = validate([
        { check: () => isString(d.source), message: 'Source harus berupa teks' },
        { check: () => VALID_SOURCES.includes(d.source as any), message: `Source tidak valid. Pilihan: ${VALID_SOURCES.join(', ')}` },
      ])
      if (!r.valid) errors.source = r.errors
    }
  }

  // topic
  {
    const r = validate([
      { check: () => isString(d.topic), message: 'Topic harus berupa teks' },
      { check: () => isString(d.topic) && d.topic.length >= 2, message: 'Topic minimal 2 karakter' },
      { check: () => isString(d.topic) && d.topic.length <= 50, message: 'Topic maksimal 50 karakter' },
      { check: () => isString(d.topic) && /^[a-z0-9-]+$/.test(d.topic), message: 'Topic hanya boleh huruf kecil, angka, dan tanda hubung' },
    ])
    if (!r.valid) errors.topic = r.errors
  }

  // description (optional)
  if (d.description !== undefined && d.description !== null) {
    const r = validate([
      { check: () => isString(d.description), message: 'Deskripsi harus berupa teks' },
      { check: () => isString(d.description) && d.description.length <= 500, message: 'Deskripsi maksimal 500 karakter' },
    ])
    if (!r.valid) errors.description = r.errors
  }

  if (Object.keys(errors).length > 0) {
    return { data: null, errors }
  }

  return {
    data: {
      name: d.name as string,
      district: d.district as string,
      lat: d.lat as number,
      lng: d.lng as number,
      debit: d.debit as number,
      status: d.status as string,
      source: (d.source as string) || 'Manual Petugas',
      topic: d.topic as string,
      description: d.description as string | undefined,
    },
    errors: {}
  }
}

export function validateUpdateWaterPoint(body: unknown): { data: any; errors: ValidationErrors } | { data: null; errors: ValidationErrors } {
  const d = body as Record<string, unknown>
  const data: Record<string, unknown> = {}
  const errors: ValidationErrors = {}

  if (d.name !== undefined) {
    const r = validate([
      { check: () => isString(d.name) && (d.name as string).length >= 3, message: 'Nama minimal 3 karakter' },
      { check: () => isString(d.name) && (d.name as string).length <= 100, message: 'Nama maksimal 100 karakter' },
    ])
    if (!r.valid) errors.name = r.errors
    else data.name = d.name
  }

  if (d.district !== undefined) {
    const r = validate([
      { check: () => isString(d.district) && (d.district as string).length >= 2, message: 'Kecamatan minimal 2 karakter' },
      { check: () => isString(d.district) && (d.district as string).length <= 50, message: 'Kecamatan maksimal 50 karakter' },
    ])
    if (!r.valid) errors.district = r.errors
    else data.district = d.district
  }

  if (d.lat !== undefined) {
    const r = validate([
      { check: () => isNumber(d.lat) && d.lat >= -90 && d.lat <= 90, message: 'Latitude harus antara -90 sampai 90' },
    ])
    if (!r.valid) errors.lat = r.errors
    else data.lat = d.lat
  }

  if (d.lng !== undefined) {
    const r = validate([
      { check: () => isNumber(d.lng) && d.lng >= -180 && d.lng <= 180, message: 'Longitude harus antara -180 sampai 180' },
    ])
    if (!r.valid) errors.lng = r.errors
    else data.lng = d.lng
  }

  if (d.debit !== undefined) {
    const r = validate([
      { check: () => isNumber(d.debit) && d.debit >= 0, message: 'Debit tidak boleh negatif' },
      { check: () => isNumber(d.debit) && d.debit <= 9999.99, message: 'Debit maksimal 9999.99' },
    ])
    if (!r.valid) errors.debit = r.errors
    else data.debit = d.debit
  }

  if (d.status !== undefined) {
    const r = validate([
      { check: () => VALID_STATUSES.includes(d.status as any), message: `Status tidak valid` },
    ])
    if (!r.valid) errors.status = r.errors
    else data.status = d.status
  }

  if (d.topic !== undefined) {
    const r = validate([
      { check: () => isString(d.topic) && /^[a-z0-9-]+$/.test(d.topic as string), message: 'Topic hanya boleh huruf kecil, angka, dan tanda hubung' },
    ])
    if (!r.valid) errors.topic = r.errors
    else data.topic = d.topic
  }

  if (d.description !== undefined) {
    const r = validate([
      { check: () => isString(d.description) && (d.description as string).length <= 500, message: 'Deskripsi maksimal 500 karakter' },
    ])
    if (!r.valid) errors.description = r.errors
    else data.description = d.description
  }

  if (Object.keys(errors).length > 0) {
    return { data: null, errors }
  }

  return { data, errors }
}

export function validateOverrideWaterPoint(body: unknown): { data: { debit: number; status: string; pin: string }; errors: ValidationErrors } | { data: null; errors: ValidationErrors } {
  const d = body as Record<string, unknown>
  const errors: ValidationErrors = {}

  {
    const r = validate([
      { check: () => isNumber(d.debit), message: 'Debit harus berupa angka' },
      { check: () => isNumber(d.debit) && d.debit >= 0, message: 'Debit tidak boleh negatif' },
      { check: () => isNumber(d.debit) && d.debit <= 9999.99, message: 'Debit maksimal 9999.99' },
    ])
    if (!r.valid) errors.debit = r.errors
  }

  {
    const r = validate([
      { check: () => isString(d.status) && VALID_STATUSES.includes(d.status as any), message: `Status tidak valid` },
    ])
    if (!r.valid) errors.status = r.errors
  }

  {
    const r = validate([
      { check: () => isString(d.pin), message: 'PIN harus berupa teks' },
      { check: () => isString(d.pin) && d.pin.length === 4, message: 'PIN harus 4 digit' },
      { check: () => isString(d.pin) && /^\d{4}$/.test(d.pin), message: 'PIN harus 4 digit angka' },
    ])
    if (!r.valid) errors.pin = r.errors
  }

  if (Object.keys(errors).length > 0) {
    return { data: null, errors }
  }

  return {
    data: { debit: d.debit as number, status: d.status as string, pin: d.pin as string },
    errors
  }
}

// ---- Auth Schemas ----

export function validateRegister(body: unknown): { data: any; errors: ValidationErrors } | { data: null; errors: ValidationErrors } {
  const d = body as Record<string, unknown>
  const errors: ValidationErrors = {}

  {
    const r = validate([
      { check: () => isString(d.email), message: 'Email harus berupa teks' },
      { check: () => isString(d.email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email), message: 'Format email tidak valid' },
    ])
    if (!r.valid) errors.email = r.errors
  }

  {
    const r = validate([
      { check: () => isString(d.password), message: 'Password harus berupa teks' },
      { check: () => isString(d.password) && d.password.length >= 6, message: 'Password minimal 6 karakter' },
      { check: () => isString(d.password) && d.password.length <= 50, message: 'Password maksimal 50 karakter' },
    ])
    if (!r.valid) errors.password = r.errors
  }

  {
    const r = validate([
      { check: () => isString(d.fullName), message: 'Nama harus berupa teks' },
      { check: () => isString(d.fullName) && d.fullName.length >= 3, message: 'Nama minimal 3 karakter' },
      { check: () => isString(d.fullName) && d.fullName.length <= 100, message: 'Nama maksimal 100 karakter' },
    ])
    if (!r.valid) errors.fullName = r.errors
  }

  if (d.institution !== undefined) {
    const r = validate([
      { check: () => isString(d.institution) && d.institution.length <= 100, message: 'Institusi maksimal 100 karakter' },
    ])
    if (!r.valid) errors.institution = r.errors
  }

  if (d.position !== undefined) {
    const r = validate([
      { check: () => isString(d.position) && d.position.length <= 100, message: 'Jabatan maksimal 100 karakter' },
    ])
    if (!r.valid) errors.position = r.errors
  }

  if (Object.keys(errors).length > 0) {
    return { data: null, errors }
  }

  return {
    data: {
      email: d.email as string,
      password: d.password as string,
      fullName: d.fullName as string,
      institution: d.institution as string | undefined,
      position: d.position as string | undefined,
    },
    errors
  }
}

export function validateLogin(body: unknown): { data: { email: string; password: string }; errors: ValidationErrors } | { data: null; errors: ValidationErrors } {
  const d = body as Record<string, unknown>
  const errors: ValidationErrors = {}

  {
    const r = validate([
      { check: () => isString(d.email), message: 'Email harus berupa teks' },
      { check: () => isString(d.email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email), message: 'Format email tidak valid' },
    ])
    if (!r.valid) errors.email = r.errors
  }

  {
    const r = validate([
      { check: () => isString(d.password) && d.password.length >= 1, message: 'Password harus diisi' },
    ])
    if (!r.valid) errors.password = r.errors
  }

  if (Object.keys(errors).length > 0) {
    return { data: null, errors }
  }

  return { data: { email: d.email as string, password: d.password as string }, errors }
}

// Flatten errors for API responses
export function flattenErrors(errors: ValidationErrors): string[] {
  return Object.values(errors).flat()
}
