<template>
  <div :class="['admin-layout', theme]">
    <template v-if="!loading">
      <!-- Sidebar (Desktop) -->
      <aside class="sidebar d-none d-md-flex">
        <div class="sidebar-top">
          <NuxtLink to="/" class="sidebar-logo">
            <i class="bi bi-droplet-fill"></i>
          </NuxtLink>
          
          <nav class="sidebar-nav">
            <NuxtLink 
              v-for="item in filteredMenu" :key="item.path" 
              :to="item.path" class="nav-item" 
              :title="item.label"
            >
              <i :class="item.icon"></i>
              <span class="nav-label">{{ item.label }}</span>
            </NuxtLink>
          </nav>
        </div>

        <div class="sidebar-bottom">
          <button @click="toggleTheme" class="nav-item" :title="theme === 'light' ? 'Mode Gelap' : 'Mode Terang'">
            <i :class="theme === 'light' ? 'bi bi-moon-stars' : 'bi bi-sun'"></i>
          </button>
          <div class="user-popover" v-if="user">
            <div class="avatar" @click="showUserMenu = !showUserMenu">
              {{ user.fullName.charAt(0) }}
            </div>
            <div v-if="showUserMenu" class="user-dropdown">
              <div class="dropdown-header">
                <strong>{{ user.fullName }}</strong>
                <span>{{ user.role.name }}</span>
              </div>
              <hr />
              <button @click="navigateToProfile" class="dropdown-item">
                <i class="bi bi-key-fill me-2"></i>Ganti Password
              </button>
              <button @click="handleLogout" class="dropdown-item text-danger">
                <i class="bi bi-box-arrow-left me-2"></i>Keluar
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- Mobile Header -->
      <header class="content-header d-flex d-md-none justify-content-between align-items-center px-4 py-3 border-bottom shadow-sm">
        <div class="d-flex align-items-center gap-3">
          <div class="mobile-logo-bg">
            <i class="bi bi-droplet-fill"></i>
          </div>
          <div>
            <h1 class="h6 mb-0 fw-bold">Tirtha Pawitan</h1>
            <p class="mb-0 text-muted" style="font-size: 10px; letter-spacing: 0.5px;">ADMIN PANEL</p>
          </div>
        </div>
        <div class="user-popover" v-if="user">
          <div class="avatar-mobile" @click="showUserMenu = !showUserMenu">{{ user?.fullName.charAt(0) }}</div>
          <div v-if="showUserMenu" class="user-dropdown mobile">
            <div class="dropdown-header">
              <strong>{{ user.fullName }}</strong>
              <span>{{ user.role.name }}</span>
            </div>
            <hr />
            <button @click="navigateToProfile" class="dropdown-item">
              <i class="bi bi-key-fill me-2"></i>Ganti Password
            </button>
            <button @click="handleLogout" class="dropdown-item text-danger">
              <i class="bi bi-box-arrow-left me-2"></i>Keluar
            </button>
          </div>
        </div>
      </header>
    </template>

    <!-- Content -->
    <div class="content-wrapper">
      <main class="main-content" v-if="!loading">
        <slot />
      </main>
      <div v-else class="loading-full-screen">
        <div class="spinner-border text-primary"></div>
      </div>
    </div>

    <template v-if="!loading">
      <!-- Bottom Navigation (Mobile) -->
      <nav class="mobile-bottom-nav d-flex d-md-none justify-content-around align-items-center">
        <NuxtLink 
          v-for="item in mobileItems" :key="item.path" 
          :to="item.path" class="mobile-nav-item"
        >
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </NuxtLink>
        <button 
          class="mobile-nav-item border-0 bg-transparent" 
          @click="showMobileFullMenu = !showMobileFullMenu"
          :class="{ active: showMobileFullMenu }"
        >
          <i class="bi" :class="showMobileFullMenu ? 'bi-grid-fill' : 'bi-three-dots'"></i>
          <span>{{ showMobileFullMenu ? 'Lainnya' : 'Menu' }}</span>
        </button>
      </nav>

      <!-- Mobile Drawer -->
      <Transition name="drawer">
        <div v-if="showMobileFullMenu" class="mobile-drawer-overlay" @click="showMobileFullMenu = false">
          <div class="mobile-drawer-content" @click.stop>
            <div class="drawer-header border-bottom px-4 py-3 d-flex justify-content-between align-items-center">
              <span class="fw-bold small text-muted text-uppercase tracking-wider">Navigasi Penuh</span>
              <button class="btn-close btn-close-white" @click="showMobileFullMenu = false"></button>
            </div>
            <div class="drawer-body p-4">
              <div class="row g-3">
                <div v-for="item in filteredMenu" :key="item.path" class="col-4">
                  <NuxtLink 
                    :to="item.path" 
                    class="drawer-nav-btn text-center"
                    @click="showMobileFullMenu = false"
                  >
                    <div class="drawer-icon mb-2">
                      <i :class="item.icon"></i>
                    </div>
                    <span class="drawer-label">{{ item.label }}</span>
                  </NuxtLink>
                </div>
              </div>
              
              <div class="mt-5 pt-4 border-top">
                <div class="d-flex gap-3">
                  <button @click="toggleTheme" class="btn btn-light w-100 flex-grow-1 py-3 rounded-4 shadow-sm border">
                    <i :class="theme === 'light' ? 'bi bi-moon-stars me-2' : 'bi bi-sun me-2'"></i>
                    {{ theme === 'light' ? 'Dark' : 'Light' }}
                  </button>
                  <button @click="handleLogout" class="btn btn-outline-danger w-100 flex-grow-1 py-3 rounded-4 shadow-sm">
                    <i class="bi bi-box-arrow-left me-2"></i>Keluar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </template>
  </div>
</template>

<script setup>
const user = ref(null)
const loading = ref(true)
const theme = ref('light')
const showUserMenu = ref(false)
const showMobileFullMenu = ref(false)

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

const navigateToProfile = () => {
  showUserMenu.value = false
  navigateTo('/admin/profile')
}

const menuItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'bi bi-grid-fill' },
  { label: 'Peta GIS', path: '/admin/gis', icon: 'bi bi-map-fill' },
  { label: 'Konfigurasi MQTT', path: '/admin/mqtt', icon: 'bi bi-broadcast' },
  { label: 'Kontrol Akses', path: '/admin/roles', icon: 'bi bi-shield-lock-fill' },
  { label: 'Titik Air', path: '/admin/water-points', icon: 'bi bi-geo-alt-fill' },
  { label: 'Galeri', path: '/admin/gallery', icon: 'bi bi-images' },
  { label: 'Users', path: '/admin/users', icon: 'bi bi-people-fill' },
  { label: 'Logs', path: '/admin/logs', icon: 'bi bi-journal-text' }
]

const filteredMenu = computed(() => {
  if (!user.value) return []
  if (user.value.role.name === 'ADMIN') return menuItems
  if (user.value.role.name === 'PETUGAS') {
    return menuItems.filter(i => ['Dashboard', 'Titik Air'].includes(i.label))
  }
  return menuItems.filter(i => i.label === 'Dashboard')
})

const mobileItems = computed(() => {
  const essential = ['Dashboard', 'Peta GIS', 'Titik Air']
  return filteredMenu.value.filter(i => essential.includes(i.label)).slice(0, 3)
})


const fetchUser = async () => {
  try {
    user.value = await $fetch('/api/auth/me')
  } catch (err) { navigateTo('/login') }
  finally { loading.value = false }
}

const handleLogout = () => {
  useCookie('auth_token').value = null
  user.value = null
  navigateTo('/login')
}

onMounted(fetchUser)
</script>

<style>
:root {
  --sidebar-w: 80px;
}

.admin-layout.light {
  --bg: #f8fafc; --sidebar-bg: #ffffff; --text: #1e293b; --text-sub: #64748b;
  --border: #e2e8f0; --card-bg: #ffffff; --primary: #0ea5e9; --primary-soft: rgba(14,165,233,0.1);
  --nav-active: #f1f5f9; --nav-icon: #64748b;
  --success: #10b981; --success-soft: rgba(16,185,129,0.1);
  --danger: #ef4444; --danger-soft: rgba(239,68,68,0.1);
  --warning: #f59e0b; --warning-soft: rgba(245,158,11,0.1);
  --info: #06b6d4; --info-soft: rgba(6,182,212,0.1);
}

.admin-layout.dark {
  --bg: #0f172a; --sidebar-bg: #1e293b; --text: #f1f5f9; --text-sub: #94a3b8;
  --border: rgba(255,255,255,0.08); --card-bg: #1e293b; --primary: #38bdf8; --primary-soft: rgba(56,189,248,0.1);
  --nav-active: rgba(255,255,255,0.05); --nav-icon: #94a3b8;
  --success: #34d399; --success-soft: rgba(52,211,153,0.1);
  --danger: #fb7185; --danger-soft: rgba(251,113,133,0.1);
  --warning: #fbbf24; --warning-soft: rgba(251,191,36,0.1);
  --info: #22d3ee; --info-soft: rgba(34,211,238,0.1);
}

.admin-layout {
  display: flex; min-height: 100vh; background: var(--bg); color: var(--text);
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.sidebar {
  width: var(--sidebar-w); height: 100vh; position: fixed; left: 0; top: 0;
  background: var(--sidebar-bg); border-right: 1px solid var(--border);
  display: flex; flex-direction: column; justify-content: space-between;
  padding: 24px 0; z-index: 1000;
}

.sidebar-logo {
  font-size: 28px; color: var(--primary); display: flex; justify-content: center; margin-bottom: 40px;
}

.sidebar-nav { display: flex; flex-direction: column; gap: 12px; align-items: center; }

.nav-item {
  width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
  color: var(--nav-icon); font-size: 20px; text-decoration: none; transition: all .2s; border: none; background: none; cursor: pointer;
}
.nav-item:hover, .nav-item.router-link-active { background: var(--nav-active); color: var(--primary); }
.nav-label { display: none; }

.sidebar-bottom { display: flex; flex-direction: column; gap: 20px; align-items: center; }

.avatar {
  width: 40px; height: 40px; border-radius: 12px; background: var(--primary); color: white;
  display: flex; align-items: center; justify-content: center; font-weight: 800; cursor: pointer;
}

.user-popover { position: relative; }
.user-dropdown {
  position: absolute; bottom: 50px; left: 20px; width: 200px;
  background: var(--sidebar-bg); border: 1px solid var(--border);
  border-radius: 16px; padding: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  z-index: 2000;
}
.user-dropdown.mobile {
  top: 55px; right: 0; left: auto; bottom: auto;
}

.dropdown-header { margin-bottom: 12px; }
.dropdown-header strong { display: block; font-size: 14px; }
.dropdown-header span { font-size: 11px; color: var(--text-sub); }
.dropdown-item {
  width: 100%; text-align: left; background: none; border: none; padding: 8px 0;
  font-size: 14px; font-weight: 600; cursor: pointer; color: var(--text);
}

.content-wrapper { flex: 1; margin-left: var(--sidebar-w); min-height: 100vh; }
.main-content { padding: 40px; }

@media (max-width: 768px) {
  .sidebar { display: none !important; }
  .content-wrapper { margin-left: 0; padding-bottom: 90px; }
  .main-content { padding: 24px 16px; }
  
  .content-header { 
    background: var(--sidebar-bg); 
    position: sticky; top: 0; z-index: 900;
  }
  
  .mobile-logo-bg {
    width: 34px; height: 34px; border-radius: 10px; background: var(--primary-soft);
    color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 20px;
  }
  
  .avatar-mobile {
    width: 34px; height: 34px; border-radius: 10px; background: var(--primary);
    color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px;
  }
  
  .mobile-bottom-nav {
    position: fixed; bottom: 0; left: 0; width: 100%; height: 75px;
    background: var(--sidebar-bg); border-top: 1px solid var(--border);
    z-index: 1000; box-shadow: 0 -4px 20px rgba(0,0,0,0.06); padding: 0 12px;
  }
  
  .mobile-nav-item {
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
    text-decoration: none; color: var(--text-sub); flex: 1; transition: all .2s;
  }
  .mobile-nav-item i { font-size: 22px; }
  .mobile-nav-item span { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; }
  .mobile-nav-item.router-link-active, .mobile-nav-item.active { color: var(--primary); }
}

/* Drawer Animation */
.drawer-enter-active, .drawer-leave-active { transition: all 0.4s cubic-bezier(0.32, 0.72, 0, 1); }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-from .mobile-drawer-content { transform: translateY(100%); }
.drawer-leave-to .mobile-drawer-content { transform: translateY(100%); }

.mobile-drawer-overlay {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(8px); z-index: 2000;
}
.mobile-drawer-content {
  position: absolute; bottom: 0; left: 0; width: 100%;
  background: var(--sidebar-bg); border-radius: 24px 24px 0 0;
  max-height: 80vh; overflow-y: auto; padding-bottom: 90px;
  box-shadow: 0 -10px 40px rgba(0,0,0,0.1);
}
.drawer-nav-btn {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 16px 8px; border-radius: 20px; transition: all .2s;
  text-decoration: none; color: var(--text); border: 1px solid transparent;
}
.drawer-icon {
  width: 52px; height: 52px; border-radius: 16px; background: var(--primary-soft);
  color: var(--primary); display: flex; align-items: center; justify-content: center;
  font-size: 24px; transition: all 0.2s;
}
.drawer-nav-btn:active .drawer-icon { transform: scale(0.9); background: var(--primary); color: white; }
.drawer-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-sub); }

.loading-full-screen { 
  position: fixed; inset: 0; background: var(--bg); 
  display: flex; align-items: center; justify-content: center; z-index: 3000; 
}
</style>
