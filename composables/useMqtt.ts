import mqtt from 'mqtt'
import { useWaterPointStore } from '~/stores/waterPointStore'

const isConnected = ref(false)
const connectionMode = ref<'live' | 'fallback'>('live')
const consoleLogs = ref<string[]>(['[INFO] Sistem siap menerima transmisi paket IoT...'])
let client: any = null
let simulationInterval: any = null

export const useMqtt = () => {
  const waterPointStore = useWaterPointStore()

  const appendLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `[${timestamp}] ${message}`
    consoleLogs.value.push(logEntry)

    if (consoleLogs.value.length > 50) {
      consoleLogs.value = consoleLogs.value.slice(-50)
    }
  }

  const activateFallback = (reason: string) => {
    if (connectionMode.value === 'fallback') return
    connectionMode.value = 'fallback'
    isConnected.value = false
    appendLog(`⚠️ PEMBERITAHUAN: Koneksi MQTT dibatasi (${reason}).`)
    appendLog(`🔄 Sistem secara otomatis beralih menggunakan Failsafe Mode (Simulasi Lokal).`)

    // Start simulation interval
    if (!simulationInterval) {
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
          appendLog(`[SIMULASI] Data real-time diperbarui untuk "${randomPoint.name}"`)
        }
      }, 6000)
    }
  }

  const initMqtt = async () => {
    if (client || connectionMode.value === 'fallback') return

    try {
      const timeout = setTimeout(() => {
        if (!isConnected.value) {
          activateFallback('Timeout')
        }
      }, 3500)

      client = mqtt.connect('wss://public:public@public.cloud.shiftr.io', {
        clientId: 'tirtha_pawitan_' + Math.random().toString(16).substr(2, 8),
        connectTimeout: 3000
      })

      client.on('connect', () => {
        clearTimeout(timeout)
        isConnected.value = true
        connectionMode.value = 'live'
        appendLog('✓ Koneksi berhasil terhubung ke broker MQTT!')
        client.subscribe('tirtha-pawitan/sensor/+')
        appendLog('Berlangganan topik: tirtha-pawitan/sensor/+')
      })

      client.on('error', () => {
        clearTimeout(timeout)
        activateFallback('Error Koneksi')
      })

      client.on('message', (topic: string, message: Buffer) => {
        try {
          const payload = JSON.parse(message.toString())
          const slug = topic.split('/').pop()
          if (slug) {
            waterPointStore.updatePointLocal(slug, payload)
            appendLog(`Menerima dari [${topic}]: ${message.toString()}`)
          }
        } catch (e) {
          appendLog(`Gagal parsing: ${e}`)
        }
      })
    } catch (err: any) {
      activateFallback(err.message)
    }
  }

  const publishMessage = (topic: string, payload: any) => {
    if (client && isConnected.value && connectionMode.value === 'live') {
      client.publish(topic, JSON.stringify(payload))
      appendLog(`Mengirim ke [${topic}]: ${JSON.stringify(payload)}`)
    } else {
      // Simulate local processing
      const slug = topic.split('/').pop()
      if (slug) {
        waterPointStore.updatePointLocal(slug, payload)
        appendLog(`[SIMULASI] Publish ke [${topic}] diproses secara lokal.`)
      }
    }
  }

  return {
    isConnected,
    connectionMode,
    consoleLogs,
    initMqtt,
    publishMessage,
    appendLog
  }
}
