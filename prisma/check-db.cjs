const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function check() {
    const users = await p.auth_users.findMany({
        select: { id: true, email: true, full_name: true, status: true, password: true, role: { select: { name: true } } }
    })
    console.log('=== USERS IN DATABASE ===')
    users.forEach(u => {
        console.log('ID:', u.id, '| Email:', u.email, '| Name:', u.full_name, '| Role:', u.role.name, '| Status:', u.status)
        console.log('  Hash starts with:', u.password.substring(0, 40) + '...')
    })

    const points = await p.wp_water_points.findMany({ select: { id: true, name: true, district: true, status: true } })
    console.log('\n=== WATER POINTS IN DATABASE ===')
    points.forEach(wp => console.log('ID:', wp.id, '|', wp.name, '|', wp.district, '|', wp.status))

    const roles = await p.rbac_roles.findMany()
    console.log('\n=== ROLES IN DATABASE ===')
    roles.forEach(r => console.log('ID:', r.id, '|', r.name))

    await p.$disconnect()
}

check().catch(e => { console.error(e); process.exit(1) })
