import mqtt from 'mqtt'
import { useWaterPointStore } from '~/stores/waterPointStore'

// Detailed connection status
const connectionStatus = ref<'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error' | 'offline'>('disconnected')
// Keep isConnected for backward compatibility
const isConnected = computed(() => connectionStatus.value === 'connected')
const connectionMode = ref<'live' | 'fallback'>('live')
const consoleLogs = ref<string[]>(['[INFO] Sistem siap menerima transmisi paket IoT...'])

let client: any = null
let simulationInterval: any = null
let fallbackTimeout: any = null

export const useMqtt = () => {
  const waterPointStore = useWaterPointStore()

  const appendLog = (message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warn: '⚠️',
      error: '❌'
    }
    const logEntry = `[${timestamp}] ${icons[type]} ${message}`
    consoleLogs.value.push(logEntry)

    if (consoleLogs.value.length > 50) {
      consoleLogs.value = consoleLogs.value.slice(-50)
    }
  }

  const startSimulation = () => {
    if (simulationInterval) return
    appendLog('Mengaktifkan mode simulasi data lokal.', 'info')
    simulationInterval = setInterval(() => {
      if (waterPointStore.points.length > 0) {
        const randomIndex = Math.floor(Math.random() * waterPointStore.points.length)
        const randomPoint = waterPointStore.points[randomIndex]
        const fluctuation = (Math.random() - 0.5) * 1.8
        const newDebit = Math.max(1.0, randomPoint.debit + fluctuation)
        const newStatus = newDebit >= 20.0 ? 'Layak/Aman' : (newDebit > 5.0 ? 'Butuh Konservasi' : 'Kritis')

        waterPointStore.updatePointLocal(randomPoint.topic, {
          debit: parseFloat(newDebit.toFixed(2)),
          status: newStatus
        })
        // Only log simulation occasionally to avoid clutter
        if (Math.random() > 0.8) {
          appendLog(`[SIMULASI] Update data untuk "${randomPoint.name}"`, 'info')
        }
      }
    }, 5000)
  }

  const stopSimulation = () => {
    if (simulationInterval) {
      clearInterval(simulationInterval)
      simulationInterval = null
      appendLog('Mode simulasi dinonaktifkan.', 'info')
    }
  }

  const activateFallback = (reason: string) => {
    if (connectionMode.value === 'fallback') return
    connectionMode.value = 'fallback'
    appendLog(`Failsafe Mode diaktifkan: ${reason}`, 'warn')
    startSimulation()
  }

  const deactivateFallback = () => {
    if (connectionMode.value === 'live') return
    connectionMode.value = 'live'
    appendLog('Live Mode diaktifkan kembali.', 'success')
    stopSimulation()
  }

  const initMqtt = async () => {
    if (client) return

    connectionStatus.value = 'connecting'
    appendLog('Menghubungkan ke broker MQTT: public.cloud.shiftr.io...', 'info')

    try {
      // Set a longer timeout for the initial fallback, but don't prevent connection
      fallbackTimeout = setTimeout(() => {
        if (connectionStatus.value !== 'connected') {
          activateFallback('Koneksi awal lambat')
        }
      }, 8000)

      client = mqtt.connect('wss://public:public@public.cloud.shiftr.io', {
        clientId: 'tirtha_pawitan_' + Math.random().toString(16).substring(2, 10),
        connectTimeout: 10000,
        reconnectPeriod: 5000, // Robust automatic reconnection
        keepalive: 60
      })

      client.on('connect', () => {
        if (fallbackTimeout) clearTimeout(fallbackTimeout)
        connectionStatus.value = 'connected'
        deactivateFallback()
        appendLog('Berhasil terhubung ke broker MQTT!', 'success')
        client.subscribe('tirtha-pawitan/sensor/+', (err: any) => {
          if (!err) {
            appendLog('Berlangganan ke saluran monitoring sensor.', 'success')
          }
        })
      })

      client.on('reconnect', () => {
        connectionStatus.value = 'reconnecting'
        appendLog('Mencoba menghubungkan kembali ke broker...', 'warn')
      })

      client.on('close', () => {
        if (connectionStatus.value !== 'reconnecting') {
          connectionStatus.value = 'disconnected'
        }
      })

      client.on('offline', () => {
        connectionStatus.value = 'offline'
        appendLog('Status broker offline. Berpindah ke mode siaga.', 'warn')
        activateFallback('Broker Offline')
      })

      client.on('error', (err: any) => {
        connectionStatus.value = 'error'
        appendLog(`Kesalahan MQTT: ${err.message}`, 'error')
        activateFallback('Error Protokol')
      })

      client.on('message', (topic: string, message: Buffer) => {
        try {
          const payload = JSON.parse(message.toString())
          const slug = topic.split('/').pop()
          if (slug) {
            waterPointStore.updatePointLocal(slug, payload)
            appendLog(`Paket data diterima dari [${slug}]`, 'info')
          }
        } catch (e) {
          appendLog(`Gagal memproses pesan: ${e}`, 'error')
        }
      })
    } catch (err: any) {
      connectionStatus.value = 'error'
      appendLog(`Gagal inisialisasi MQTT: ${err.message}`, 'error')
      activateFallback('Gagal Inisialisasi')
    }
  }

  const disconnectMqtt = () => {
    if (client) {
      client.end()
      client = null
      connectionStatus.value = 'disconnected'
      appendLog('Koneksi MQTT diputuskan secara manual.', 'warn')
    }
  }

  const publishMessage = (topic: string, payload: any) => {
    if (client && isConnected.value) {
      client.publish(topic, JSON.stringify(payload))
      appendLog(`Mengirim data ke [${topic}]`, 'info')
    } else {
      // Simulate local processing
      const slug = topic.split('/').pop()
      if (slug) {
        waterPointStore.updatePointLocal(slug, payload)
        appendLog(`[SIMULASI] Publish ke [${topic}] diproses secara lokal.`, 'info')
      }
    }
  }

  return {
    connectionStatus,
    isConnected,
    connectionMode,
    consoleLogs,
    initMqtt,
    disconnectMqtt,
    publishMessage,
    appendLog
  }
}

