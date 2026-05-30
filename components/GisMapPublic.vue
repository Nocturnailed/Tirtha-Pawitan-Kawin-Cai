<template>
  <div class="gis-map-public">
    <div id="map-public" class="map-view"></div>
    <div v-show="loading" class="map-loading">
      <div class="spinner-border text-primary"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const loading = ref(true)
let map = null

onMounted(async () => {
  if (process.client) {
    const L = await import('leaflet')
    
    map = L.map('map-public', {
      center: [-6.98, 108.48], // Kuningan area
      zoom: 12,
      zoomControl: false
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map)


    L.control.zoom({ position: 'bottomright' }).addTo(map)

    try {
      const points = await $fetch('/api/water-points')
      
      points.forEach(point => {
        const marker = L.circleMarker([point.lat, point.lng], {
          radius: 8,
          fillColor: point.status === 'Layak/Aman' ? '#10b981' : '#f43f5e',
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(map)

        marker.bindPopup(`
          <div style="font-family: 'Inter', sans-serif;">
            <h6 style="margin: 0; font-weight: 700;">${point.name}</h6>
            <div style="font-size: 11px; color: #64748b;">${point.district}</div>
            <hr style="margin: 8px 0; border: 0.5px solid #eee;">
            <div style="font-size: 12px; display: flex; justify-content: space-between;">
              <span>Debit:</span> <strong>${point.debit} L/s</strong>
            </div>
            <div style="font-size: 12px; display: flex; justify-content: space-between;">
              <span>Status:</span> <strong style="color: ${point.status === 'Layak/Aman' ? '#10b981' : '#f43f5e'}">${point.status}</strong>
            </div>
          </div>
        `)
      })
    } catch (err) {
      console.error('Failed to load points:', err)
    }

    loading.value = false
  }
})
</script>

<style scoped>
.gis-map-public {
  width: 100%;
  height: 100%;
  min-height: 450px;
  position: relative;
  border-radius: 20px;
  overflow: hidden;
}

.map-view {
  width: 100%;
  height: 100%;
  z-index: 1;
}

.map-loading {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  backdrop-filter: blur(4px);
}

:deep(.leaflet-popup-content-wrapper) {
  background: white;
  border-radius: 12px;
  padding: 5px;
}

:deep(.leaflet-popup-tip) {
  background: white;
}
</style>

