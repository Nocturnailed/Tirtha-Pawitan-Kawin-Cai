<template>
  <div class="gis-map-admin">
    <div id="map-admin" class="map-view"></div>
    
    <!-- Floating Search Bar -->
    <div class="map-search-container" :class="{ 'has-results': searchResults.length > 0 && searchQuery }">
      <div class="search-box">
        <i class="bi bi-search search-icon"></i>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Cari titik mata air..." 
          @focus="isSearchFocused = true"
        />
        <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      
      <div v-if="isSearchFocused && searchQuery && searchResults.length > 0" class="search-results-dropdown shadow-lg">
        <div 
          v-for="point in searchResults" 
          :key="point.id" 
          class="search-result-item"
          @click="selectSearchResult(point)"
        >
          <div class="res-icon">
            <i class="bi bi-droplet-fill" :style="{ color: getStatusColor(point.status) }"></i>
          </div>
          <div class="res-info">
            <div class="res-name">{{ point.name }}</div>
            <div class="res-meta">{{ point.location || point.subDistrict }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-show="loading" class="map-loading">
      <div class="spinner-border text-primary"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue'

const props = defineProps({
  theme: { type: String, default: 'light' },
  points: { type: Array, default: () => [] }
})

const emit = defineEmits(['select-point'])

const loading = ref(true)
const searchQuery = ref('')
const isSearchFocused = ref(false)
let map = null
let tileLayer = null
let boundaryLayer = null
let markers = []
let L_cached = null

const searchResults = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return props.points.filter(p => 
    p.name.toLowerCase().includes(query) || 
    (p.location && p.location.toLowerCase().includes(query)) ||
    (p.subDistrict && p.subDistrict.toLowerCase().includes(query))
  ).slice(0, 5)
})

const getStatusColor = (status) => {
  if (status === 'Layak/Aman') return '#10b981'
  if (status === 'Kritis') return '#ef4444'
  return '#f59e0b'
}

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
      fillColor: getStatusColor(point.status),
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

const selectSearchResult = (point) => {
  if (map) {
    map.flyTo([Number(point.lat), Number(point.lng)], 15)
    emit('select-point', point)
    searchQuery.value = ''
    isSearchFocused.value = false
  }
}

onMounted(async () => {
  if (process.client) {
    try {
      const L = await import('leaflet')
      L_cached = L
      
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
    
    window.addEventListener('click', (e) => {
      if (!e.target.closest('.map-search-container')) {
        isSearchFocused.value = false
      }
    })
  }
})

watch(() => props.points, async () => {
  if (map && L_cached) {
    renderMarkers(L_cached)
  }
}, { deep: true })

watch(() => props.theme, async (newTheme) => {
  if (map && L_cached) {
    updateTiles(L_cached, newTheme)
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

.map-search-container {
  position: absolute; top: 20px; left: 20px;
  width: 320px; z-index: 1000;
  transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
}
.search-box {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 10px 16px;
  display: flex; align-items: center; gap: 12px;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.15);
  backdrop-filter: blur(10px);
}
.search-icon { color: var(--text-sub); font-size: 18px; }
.search-box input {
  background: transparent; border: none; outline: none;
  color: var(--text); font-size: 14px; flex: 1; font-weight: 500;
}
.clear-btn { background: transparent; border: none; color: var(--text-sub); cursor: pointer; font-size: 12px; padding: 4px; }
.clear-btn:hover { color: var(--primary); }

.search-results-dropdown {
  margin-top: 8px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  max-height: 300px;
  overflow-y: auto;
}
.search-result-item {
  padding: 12px 16px;
  display: flex; align-items: center; gap: 14px;
  cursor: pointer; transition: all 0.2s;
  border-bottom: 1px solid var(--border);
}
.search-result-item:last-child { border-bottom: none; }
.search-result-item:hover { background: var(--nav-active); }

.res-icon { font-size: 18px; }
.res-name { font-weight: 700; color: var(--text); font-size: 14px; }
.res-meta { font-size: 12px; color: var(--text-sub); }
</style>
