export default defineNuxtRouteMiddleware(async (to) => {
    const token = useCookie('auth_token').value

    // PROTECT ALL /admin ROUTES
    if (!token && to.path.startsWith('/admin')) {
        return navigateTo('/login')
    }

    // IF AT LOGIN AND ALREADY HAS TOKEN, REDIRECT TO DASHBOARD
    if (token && to.path === '/login') {
        return navigateTo('/admin/dashboard')
    }


    // Optional: Verify token via API for sensitive routes
    if (token && to.path.startsWith('/admin')) {
        try {
            // We use global fetch or $fetch which includes cookies/headers if configured
            // But here we rely on the backend to validate the token from cookie
            await $fetch('/api/auth/me')
        } catch (err) {
            // If API says unauthorized, clear cookie and redirect
            const tokenCookie = useCookie('auth_token')
            tokenCookie.value = null
            return navigateTo('/login')
        }
    }
})

