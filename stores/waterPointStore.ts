import { defineStore } from 'pinia'

export interface WaterPoint {
  id: number
  name: string
  district: string
  lat: number
  lng: number
  debit: number
  status: string
  source: string
  topic: string
  description?: string
  created_at?: string
  updated_at?: string
}

interface Statistics {
  total: number
  averageDebit: number
  layakCount: number
  kritisCount: number
}

export const useWaterPointStore = defineStore('waterPoint', () => {
  const points = ref<WaterPoint[]>([])
  const stats = ref<Statistics>({
    total: 0,
    averageDebit: 0,
    layakCount: 0,
    kritisCount: 0
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  const normalizeStatus = (s: string): string => {
    const map: Record<string, string> = {
      'LAYAK_AMAN': 'Layak/Aman',
      'BUTUH_KONSERVASI': 'Butuh Konservasi',
      'KRITIS': 'Kritis',
      'IOT': 'Sistem IoT',
      'MANUAL_PETUGAS': 'Manual Petugas'
    }
    return map[s] || s
  }

  const normalizePoint = (p: any): WaterPoint => ({
    ...p,
    lat: Number(p.lat),
    lng: Number(p.lng),
    debit: Number(p.debit),
    status: normalizeStatus(p.status),
    source: normalizeStatus(p.source)
  })

  const recomputeStats = () => {
    const total = points.value.length
    const totalDebit = points.value.reduce((acc, p) => acc + p.debit, 0)
    const averageDebit = total > 0 ? totalDebit / total : 0
    const layakCount = points.value.filter(p => p.status === 'Layak/Aman').length
    const kritisCount = points.value.filter(p => p.status === 'Kritis' || p.status === 'Butuh Konservasi').length

    stats.value = {
      total,
      averageDebit,
      layakCount,
      kritisCount
    }
  }

  const updatePointLocal = (slug: string, data: { debit?: number, status?: string }) => {
    const point = points.value.find(p => p.topic === slug)
    if (point) {
      if (data.debit !== undefined) point.debit = data.debit
      if (data.status !== undefined) point.status = data.status
      point.source = 'Sistem IoT'
      recomputeStats()
    }
  }

  const fetchPoints = async () => {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await useFetch('/api/water-points')
      if (fetchError.value) throw fetchError.value
      points.value = (data.value || []).map(normalizePoint)
      recomputeStats()
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch water points'
    } finally {
      loading.value = false
    }
  }

  const fetchStats = async () => {
    // We can now compute stats locally or fetch from API
    recomputeStats()
  }

  const addPoint = async (point: Omit<WaterPoint, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: fetchError } = await useFetch('/api/water-points', {
        method: 'POST',
        body: point
      })
      if (fetchError.value) throw fetchError.value
      if (data.value) {
        points.value.push(normalizePoint(data.value))
        await fetchStats()
      }
      return data.value
    } catch (err: any) {
      error.value = err.message || 'Failed to add water point'
      throw err
    }
  }

  const updatePoint = async (id: number, updates: Partial<WaterPoint>) => {
    try {
      const { data, error: fetchError } = await useFetch(`/api/water-points/${id}`, {
        method: 'PUT',
        body: updates
      })
      if (fetchError.value) throw fetchError.value
      if (data.value) {
        const index = points.value.findIndex(p => p.id === id)
        if (index !== -1) {
          points.value[index] = normalizePoint(data.value)
        }
        await fetchStats()
      }
      return data.value
    } catch (err: any) {
      error.value = err.message || 'Failed to update water point'
      throw err
    }
  }

  const deletePoint = async (id: number) => {
    try {
      await useFetch(`/api/water-points/${id}`, {
        method: 'DELETE'
      })
      points.value = points.value.filter(p => p.id !== id)
      await fetchStats()
    } catch (err: any) {
      error.value = err.message || 'Failed to delete water point'
      throw err
    }
  }

  const overrideDebit = async (id: number, debit: number, status: string, pin: string) => {
    return updatePoint(id, { debit, status, pin } as any)
  }

  const searchPoints = (query: string, statusFilter?: string): WaterPoint[] => {
    let filtered = points.value

    if (query) {
      const q = query.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) || p.district.toLowerCase().includes(q)
      )
    }

    if (statusFilter) {
      filtered = filtered.filter(p => p.status === statusFilter)
    }

    return filtered
  }

  return {
    points,
    stats,
    loading,
    error,
    fetchPoints,
    addPoint,
    updatePoint,
    deletePoint,
    overrideDebit,
    searchPoints,
    updatePointLocal,
    recomputeStats
  }
})
