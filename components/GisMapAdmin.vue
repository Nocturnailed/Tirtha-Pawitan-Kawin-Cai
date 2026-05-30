<template>
  <div class="gis-map-admin">
    <div id="map-admin" class="map-view"></div>
    <div v-show="loading" class="map-loading">
      <div class="spinner-border text-primary"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  theme: { type: String, default: 'light' },
  points: { type: Array, default: () => [] }
})

const emit = defineEmits(['select-point'])

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

const renderMarkers = (L) => {
  markers.forEach(m => map.removeLayer(m))
  markers = []

  props.points.forEach(point => {
    const marker = L.circleMarker([Number(point.lat), Number(point.lng)], {
      radius: 10,
      fillColor: point.status === 'Layak/Aman' ? '#10b981' : (point.status === 'Kritis' ? '#ef4444' : '#f59e0b'),
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9
    }).addTo(map)

    marker.on('mouseover', function () { this.setStyle({ weight: 4, radius: 12 }) })
    marker.on('mouseout', function () { this.setStyle({ weight: 2, radius: 10 }) })
    marker.on('click', () => { emit('select-point', point) })

    markers.push(marker)
  })
}

onMounted(async () => {
  if (process.client) {
    try {
      const L = await import('leaflet')
      
      map = L.map('map-admin', {
        center: [-6.98, 108.48],
        zoom: 11,
        zoomControl: false
      })

      updateTiles(L, props.theme)

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
      renderMarkers(L)
    } catch (err) {
      console.error('Admin map init error:', err)
    } finally {
      loading.value = false
    }
  }
})

watch(() => props.points, async () => {
  if (map) {
    const L = await import('leaflet')
    renderMarkers(L)
  }
}, { deep: true })

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
.gis-map-admin { width: 100%; height: 100%; position: relative; }
.map-view { width: 100%; height: 100%; z-index: 1; min-height: 600px; }
.map-loading {
  position: absolute; inset: 0; background: rgba(var(--bg), 0.8);
  display: flex; align-items: center; justify-content: center; z-index: 10;
  backdrop-filter: blur(4px);
}
</style>
