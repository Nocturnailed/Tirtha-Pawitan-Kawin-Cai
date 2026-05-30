<template>
  <div class="login-container">
    <div class="glass-overlay"></div>
    <div class="login-box animate-fade-in">
      <div class="logo-section">
        <i class="bi bi-water logo-icon"></i>
        <h1>Tirtha Pawitan</h1>
        <p class="subtitle">GIS AIoT Monitoring System</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email Address</label>
          <div class="input-with-icon">
            <i class="bi bi-envelope"></i>
            <input 
              v-model="form.email" 
              type="email" 
              id="email" 
              placeholder="admin@tirtha.id" 
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-with-icon">
            <i class="bi bi-lock"></i>
            <input 
              v-model="form.password" 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              placeholder="••••••••" 
              required
            />
            <button type="button" class="btn-toggle" @click="showPassword = !showPassword">
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>

        <div v-if="error" class="error-msg animate-shake">
          <i class="bi bi-exclamation-circle"></i>
          {{ error }}
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm"></span>
          <span v-else>Sign In</span>
        </button>
      </form>

      <div class="footer-links">
        <NuxtLink to="/">Back to Dashboard</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})

const form = ref({
  email: '',
  password: ''
})
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: form.value
    })

    // Store token
    const token = useCookie('auth_token', {
      maxAge: 60 * 60 * 24, // 1 day
      path: '/'
    })
    token.value = response.token

    // Store user info in pinia or localstorage if needed
    // For now we'll just redirect
    navigateTo('/admin/water-points')
  } catch (err) {
    error.value = err.data?.statusMessage || 'Login failed. Please check your credentials.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top left, #0f172a, #1e293b);
  position: relative;
  overflow: hidden;
}

.glass-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  filter: blur(100px);
  z-index: 1;
}

.login-box {
  width: 420px;
  max-width: 90%;
  padding: 40px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  z-index: 2;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.logo-section {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  font-size: 48px;
  color: #38bdf8;
  display: block;
  margin-bottom: 12px;
}

h1 {
  color: #f8fafc;
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
}

.subtitle {
  color: #94a3b8;
  font-size: 14px;
  margin-top: 4px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  color: #cbd5e1;
  font-size: 13px;
  font-weight: 500;
  margin-left: 4px;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon i {
  position: absolute;
  left: 16px;
  color: #64748b;
  font-size: 18px;
}

input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #f8fafc;
  font-size: 15px;
  transition: all 0.2s ease;
}

input:focus {
  outline: none;
  border-color: #38bdf8;
  background: rgba(15, 23, 42, 0.8);
  box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.1);
}

.btn-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #64748b;
  padding: 4px;
  display: flex;
  align-items: center;
}

.btn-toggle:hover {
  color: #f8fafc;
}

.btn-login {
  margin-top: 12px;
  padding: 14px;
  background: linear-gradient(135deg, #38bdf8, #0ea5e9);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(56, 189, 248, 0.4);
}

.btn-login:active {
  transform: translateY(0);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-msg {
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 10px;
  color: #fca5a5;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-links {
  text-align: center;
  margin-top: 24px;
}

.footer-links a {
  color: #64748b;
  font-size: 13px;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: #38bdf8;
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.animate-shake {
  animation: shake 0.4s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
</style>
