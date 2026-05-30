<template>
  <div class="gis-map-public">
    <div id="map-public" class="map-view"></div>
    <div v-show="loading" class="map-loading">
      <div class="spinner-border text-primary"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  theme: {
    type: String,
    default: 'light'
  }
})

const loading = ref(true)
let map = null
let tileLayer = null
let boundaryLayer = null
let markers = []

const kuninganGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "name": "Kabupaten Kuningan" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [108.384, -6.745], [108.452, -6.752], [108.524, -6.782], [108.588, -6.824],
          [108.645, -6.882], [108.685, -6.954], [108.712, -7.025], [108.685, -7.112],
          [108.624, -7.185], [108.552, -7.224], [108.482, -7.235], [108.412, -7.212],
          [108.345, -7.152], [108.298, -7.085], [108.282, -7.012], [108.295, -6.924],
          [108.324, -6.845], [108.384, -6.745]
        ]]
      }
    }
  ]
}

const updateTiles = (L, currentTheme) => {
  if (tileLayer) map.removeLayer(tileLayer)
  
  const url = currentTheme === 'dark' 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
    
  tileLayer = L.tileLayer(url, {
    subdomains: 'abcd',
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  }).addTo(map)
}

onMounted(async () => {
  if (process.client) {
    const L = await import('leaflet')
    
    map = L.map('map-public', {
      center: [-6.98, 108.48],
      zoom: 11,
      zoomControl: false
    })

    updateTiles(L, props.theme)

    // Add Boundary
    boundaryLayer = L.geoJSON(kuninganGeoJSON, {
      style: {
        color: props.theme === 'dark' ? '#38bdf8' : '#0ea5e9',
        weight: 3,
        fillColor: props.theme === 'dark' ? '#38bdf8' : '#0ea5e9',
        fillOpacity: 0.05,
        dashArray: '5, 8'
      }
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    try {
      const points = await $fetch('/api/water-points')
      
      points.forEach(point => {
        const marker = L.circleMarker([point.lat, point.lng], {
          radius: 9,
          fillColor: point.status === 'Layak/Aman' ? '#10b981' : (point.status === 'Kritis' ? '#f43f5e' : '#f59e0b'),
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(map)

        marker.on('mouseover', function (e) {
          this.setStyle({ weight: 4, radius: 11 })
          this.openPopup()
        })
        
        marker.on('mouseout', function (e) {
          this.setStyle({ weight: 2, radius: 9 })
        })

        marker.bindPopup(`
          <div class="map-popup-content">
            <div class="popup-header">
              <strong>${point.name}</strong>
              <span>${point.district}</span>
            </div>
            <div class="popup-body">
              <div class="info-row"><span>Debit:</span> <strong>${point.debit} L/s</strong></div>
              <div class="info-row"><span>Status:</span> <strong style="color: ${point.status === 'Layak/Aman' ? '#10b981' : (point.status === 'Kritis' ? '#f43f5e' : '#f59e0b')}">${point.status}</strong></div>
            </div>
          </div>
        `, { closeButton: false, offset: [0, -5] })
        
        markers.push(marker)
      })
    } catch (err) {
      console.error('Failed to load points:', err)
    }

    loading.value = false
  }
})

watch(() => props.theme, async (newTheme) => {
  if (map) {
    const L = await import('leaflet')
    updateTiles(L, newTheme)
    if (boundaryLayer) {
      boundaryLayer.setStyle({
        color: newTheme === 'dark' ? '#38bdf8' : '#0ea5e9',
        fillColor: newTheme === 'dark' ? '#38bdf8' : '#0ea5e9'
      })
    }
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

:deep(.map-popup-content) {
  min-width: 160px;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

:deep(.popup-header) {
  margin-bottom: 8px;
}

:deep(.popup-header strong) {
  display: block;
  font-size: 14px;
  color: #1e293b;
}

:deep(.popup-header span) {
  font-size: 11px;
  color: #64748b;
}

:deep(.popup-body) {
  border-top: 1px solid #f1f5f9;
  padding-top: 8px;
}

:deep(.info-row) {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 4px;
}

:deep(.leaflet-popup-content-wrapper) {
  background: white;
  border-radius: 14px;
  padding: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

:deep(.leaflet-popup-tip) {
  background: white;
}
</style>


