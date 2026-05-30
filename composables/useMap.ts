let L: any = null

export const useMap = () => {
  const mapInstance = ref<any>(null)
  const markersLayer = ref<any>(null)
  const kuninganBoundaryLayer = ref<any>(null)
  const kuninganCenter = [-6.9856, 108.4874] as [number, number]

  const initMap = async (container: string | HTMLElement) => {
    if (process.server) return
    console.log('[useMap] Inisialisasi peta dimulai pada kontainer:', container)

    if (mapInstance.value) {
      console.log('[useMap] Instance peta sudah ada, mengabaikan...')
      return mapInstance.value
    }

    try {
      console.log('[useMap] Mengunduh library Leaflet secara dinamis...')
      const leafletModule = await import('leaflet')

      // Try multiple ways to get the L object
      L = (leafletModule as any).default || leafletModule
      if (L && !L.map && (leafletModule as any).L) {
        L = (leafletModule as any).L
      }

      console.log('[useMap] Leaflet berhasil diimpor. Keys:', Object.keys(L || {}).slice(0, 10))

      if (!L || typeof L.map !== 'function') {
        // Fallback for some weird CJS/ESM interop issues
        console.warn('[useMap] L.map tidak ditemukan, mencoba alternatif...')
        if (typeof window !== 'undefined' && (window as any).L) {
          L = (window as any).L
          console.log('[useMap] Berhasil mengambil L dari window.')
        }
      }

      if (!L || typeof L.map !== 'function') {
        throw new Error('Gagal menemukan objek Leaflet (L) yang valid.')
      }

      // Fix for Leaflet icons
      if (L.Icon && L.Icon.Default) {
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: '/leaflet/marker-icon-2x.png',
          iconUrl: '/leaflet/marker-icon.png',
          shadowUrl: '/leaflet/marker-shadow.png',
        })
      }

      const osmMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      })

      const esriSatellite = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: 'Tiles &copy; Esri' }
      )

      mapInstance.value = L.map(container, {
        center: kuninganCenter,
        zoom: 11,
        layers: [osmMap]
      })

      markersLayer.value = L.layerGroup().addTo(mapInstance.value)

      L.control.layers(
        {
          'Peta Jalan Standard': osmMap,
          'Citra Satelit Esri': esriSatellite
        },
        {}
      ).addTo(mapInstance.value)

      console.log('[useMap] Instance peta berhasil dibuat.')
      return mapInstance.value
    } catch (err) {
      console.error('[useMap] Gagal menginisialisasi peta:', err)
      return null
    }
  }

  const addMarker = (lat: number, lng: number, point: any, color: string) => {
    if (!mapInstance.value || !markersLayer.value || !L) return

    const isIoT = point.source === 'Sistem IoT'
    const pulseClass = isIoT ? 'pulse-marker' : ''

    const svgMarker = `
      <svg class="${pulseClass}" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="${color}" fill-opacity="0.35"/>
        <circle cx="12" cy="12" r="6" fill="${color}"/>
        <circle cx="12" cy="12" r="2" fill="#ffffff"/>
      </svg>
    `

    const icon = L.divIcon({
      html: svgMarker,
      className: 'custom-div-icon',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    })

    const popupHtml = `
      <div style="font-family: 'Inter', sans-serif; min-width: 170px;">
        <span class="badge" style="background-color: ${color}; color: white; margin-bottom: 5px; font-size: 0.7rem;">${point.status}</span>
        <span class="badge bg-dark text-white font-monospace mb-1 float-end" style="font-size:0.6rem;">${point.source}</span>
        <h6 class="fw-bold mb-1 text-dark" style="font-size: 0.85rem;">${point.name}</h6>
        <small class="text-muted d-block">Kec: <b>${point.district}</b></small>
        <small class="text-muted d-block">Debit: <strong class="text-primary">${point.debit} L/s</strong></small>
        <small class="text-muted d-block">MQTT: <code>${point.topic}</code></small>
        <hr class="my-1">
        <code style="font-size:0.7rem;">LatLng: ${lat.toFixed(4)}, ${lng.toFixed(4)}</code>
      </div>
    `

    const marker = L.marker([lat, lng], { icon })
      .bindPopup(popupHtml)

    markersLayer.value.addLayer(marker)
  }

  const clearMarkers = () => {
    if (markersLayer.value) {
      markersLayer.value.clearLayers()
    }
  }

  const drawMarkers = (points: any[]) => {
    clearMarkers()

    points.forEach(point => {
      let color = '#2ec4b6'
      if (point.status === 'Butuh Konservasi') color = '#ff9f1c'
      if (point.status === 'Kritis') color = '#e71d36'

      addMarker(point.lat, point.lng, point, color)
    })
  }

  const loadBoundary = async () => {
    if (!mapInstance.value || !L) return

    try {
      const res = await fetch('/data/kuningan-boundary.json')
      const data = await res.json()

      if (data.features?.length > 0) {
        kuninganBoundaryLayer.value = L.geoJSON(data, {
          style: {
            color: '#114232',
            weight: 3,
            opacity: 0.85,
            fillColor: '#007F73',
            fillOpacity: 0.05,
            dashArray: '6, 6'
          }
        }).addTo(mapInstance.value)

        const bounds = kuninganBoundaryLayer.value.getBounds()
        mapInstance.value.fitBounds(bounds, { padding: [15, 15] })
      }
    } catch (err) {
      console.warn('Failed to load boundary:', err)
    }
  }

  const fitBounds = () => {
    if (mapInstance.value && kuninganBoundaryLayer.value) {
      const bounds = kuninganBoundaryLayer.value.getBounds()
      mapInstance.value.fitBounds(bounds, { animate: true })
    } else if (mapInstance.value) {
      mapInstance.value.flyTo(kuninganCenter, 11, { animate: true })
    }
  }

  const flyTo = (lat: number, lng: number, zoom: number = 15) => {
    if (mapInstance.value) {
      mapInstance.value.flyTo([lat, lng], zoom, { animate: true, duration: 1.5 })
    }
  }

  const onMapClick = (callback: (lat: number, lng: number) => void) => {
    if (mapInstance.value) {
      mapInstance.value.on('click', (e: any) => {
        callback(e.latlng.lat, e.latlng.lng)
      })
    }
  }

  const invalidateSize = () => {
    if (mapInstance.value) {
      setTimeout(() => {
        mapInstance.value?.invalidateSize()
      }, 100)
    }
  }

  return {
    mapInstance,
    markersLayer,
    kuninganBoundaryLayer,
    initMap,
    addMarker,
    clearMarkers,
    drawMarkers,
    loadBoundary,
    fitBounds,
    flyTo,
    onMapClick,
    invalidateSize
  }
}
