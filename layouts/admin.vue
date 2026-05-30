<template>
  <div class="admin-layout" v-if="!loading">
    <!-- Mini Sidebar -->
    <aside class="sidebar glass-card">
      <div class="sidebar-logo">
        <i class="bi bi-water text-primary"></i>
      </div>
      
      <div class="user-profile mb-4" v-if="user">
        <div class="avatar-sm mx-auto mb-2">{{ user.fullName.charAt(0) }}</div>
        <div class="user-info text-center d-none d-md-block" style="font-size: 10px;">
          <div class="fw-bold text-truncate" style="max-width: 70px;">{{ user.fullName }}</div>
          <div class="text-muted">{{ user.role.name }}</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink 
          v-for="item in filteredMenu" :key="item.path" 
          :to="item.path" class="nav-item" 
          :title="item.label"
        >
          <i :class="item.icon"></i>
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="nav-item text-danger" title="Logout">
          <i class="bi bi-box-arrow-left"></i>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <slot />
    </main>
  </div>
  <div v-else class="loading-overlay">
    <div class="spinner-border text-primary"></div>
  </div>
</template>

<script setup>
const user = ref(null)
const loading = ref(true)

const menuItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'bi bi-grid-fill', permission: 'READ_WATER_POINTS' },
  { label: 'Titik Air', path: '/admin/water-points', icon: 'bi bi-geo-alt-fill', permission: 'MANAGE_WATER_POINTS' },
  { label: 'Galeri', path: '/admin/gallery', icon: 'bi bi-images', permission: 'MANAGE_WATER_POINTS' },
  { label: 'Users', path: '/admin/users', icon: 'bi bi-people-fill', permission: 'MANAGE_USERS' },
  { label: 'Logs', path: '/admin/logs', icon: 'bi bi-journal-text', permission: 'MANAGE_LOGS' }
]



const filteredMenu = computed(() => {
  if (!user.value) return []
  
  // If admin, show all
  if (user.value.role.name === 'ADMIN') return menuItems
  
  // Otherwise filter by permissions (for future granular control)
  // For now, simpler:
  if (user.value.role.name === 'PETUGAS') {
    return menuItems.filter(i => ['Dashboard', 'Water Points'].includes(i.label))
  }
  
  return menuItems.filter(i => i.label === 'Dashboard')
})

const fetchUser = async () => {
  try {
    const data = await $fetch('/api/auth/me')
    user.value = data
  } catch (err) {
    navigateTo('/login')
  } finally {
    loading.value = false
  }
}

const handleLogout = () => {
  const token = useCookie('auth_token')
  token.value = null
  user.value = null
  navigateTo('/login')
}

onMounted(fetchUser)
</script>

<style scoped>
.admin-layout {
  display: flex;
  background: #0f172a;
  min-height: 100vh;
}

.sidebar {
  width: 80px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
  z-index: 100;
  border-radius: 0;
  border-left: none;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  background: #38bdf8;
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.sidebar-logo {
  font-size: 32px;
  margin-bottom: 30px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
}

.nav-item {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 20px;
  border-radius: 14px;
  transition: all 0.3s;
  text-decoration: none;
  cursor: pointer;
  border: none;
  background: transparent;
}

.nav-item:hover, .nav-item.router-link-active {
  background: rgba(56, 189, 248, 0.1);
  color: #38bdf8;
}

.sidebar-footer {
  padding-bottom: 24px;
}

.main-content {
  margin-left: 80px;
  flex: 1;
}

.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.loading-overlay {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
}
</style>


<style scoped>
.admin-layout {
  display: flex;
  background: #0f172a;
  min-height: 100vh;
}

.sidebar {
  width: 80px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
  z-index: 100;
  border-radius: 0;
  border-left: none;
}

.sidebar-logo {
  font-size: 32px;
  margin-bottom: 40px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
}

.nav-item {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 20px;
  border-radius: 14px;
  transition: all 0.3s;
  text-decoration: none;
}

.nav-item:hover, .nav-item.router-link-active {
  background: rgba(56, 189, 248, 0.1);
  color: #38bdf8;
}

.sidebar-footer {
  padding-bottom: 24px;
}

.main-content {
  margin-left: 80px;
  flex: 1;
}

.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
