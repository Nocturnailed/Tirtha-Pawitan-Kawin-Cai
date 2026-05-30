<template>
  <div class="gis-map-public">
    <div id="map-public" class="map-view"></div>
    
    <!-- Floating Search Bar -->
    <div class="map-search-container" :class="{ 'has-results': searchResults.length > 0 && searchQuery }">
      <div class="search-box">
        <i class="bi bi-search search-icon"></i>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Cari sumber mata air..." 
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
            <div class="res-meta">{{ point.district }}</div>
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
  theme: { type: String, default: 'light' }
})

const loading = ref(true)
const searchQuery = ref('')
const isSearchFocused = ref(false)
const waterPoints = ref([])
let map = null
let tileLayer = null
let boundaryLayer = null
let markers = []
let L_cached = null

const searchResults = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return waterPoints.value.filter(p => 
    p.name.toLowerCase().includes(query) || 
    (p.district && p.district.toLowerCase().includes(query))
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

const selectSearchResult = (point) => {
  if (map) {
    map.flyTo([Number(point.lat), Number(point.lng)], 15)
    searchQuery.value = ''
    isSearchFocused.value = false
  }
}

onMounted(async () => {
  if (process.client) {
    try {
      const L = await import('leaflet')
      L_cached = L
      
      map = L.map('map-public', {
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

      waterPoints.value = await $fetch('/api/water-points')
      
      waterPoints.value.forEach(point => {
        const marker = L.circleMarker([Number(point.lat), Number(point.lng)], {
          radius: 9,
          fillColor: getStatusColor(point.status),
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(map)

        marker.on('mouseover', function () {
          this.setStyle({ weight: 4, radius: 11 })
          this.openPopup()
        })
        
        marker.on('mouseout', function () {
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
              <div class="info-row"><span>Status:</span> <strong style="color: ${getStatusColor(point.status)}">${point.status}</strong></div>
            </div>
          </div>
        `, { closeButton: false, offset: [0, -5] })
        
        markers.push(marker)
      })
    } catch (err) {
      console.error('Map init error:', err)
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
.gis-map-public { width: 100%; height: 100%; min-height: 450px; position: relative; border-radius: 20px; overflow: hidden; }
.map-view { width: 100%; height: 100%; z-index: 1; }
.map-loading { position: absolute; inset: 0; background: rgba(15, 23, 42, 0.8); display: flex; align-items: center; justify-content: center; z-index: 10; backdrop-filter: blur(4px); }

.map-search-container {
  position: absolute; top: 20px; left: 20px;
  width: 320px; z-index: 1000;
  transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
}
.search-box {
  background: white;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 16px;
  padding: 10px 16px;
  display: flex; align-items: center; gap: 12px;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.15);
}
.search-icon { color: #64748b; font-size: 18px; }
.search-box input {
  background: transparent; border: none; outline: none;
  color: #1e293b; font-size: 14px; flex: 1; font-weight: 500;
}
.clear-btn { background: transparent; border: none; color: #64748b; cursor: pointer; font-size: 12px; padding: 4px; }
.clear-btn:hover { color: #0ea5e9; }

.search-results-dropdown {
  margin-top: 8px;
  background: white;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 16px;
  overflow: hidden;
  max-height: 300px;
  overflow-y: auto;
}
.search-result-item {
  padding: 12px 16px;
  display: flex; align-items: center; gap: 14px;
  cursor: pointer; transition: all 0.2s;
  border-bottom: 1px solid #f1f5f9;
}
.search-result-item:last-child { border-bottom: none; }
.search-result-item:hover { background: #f8fafc; }

.res-icon { font-size: 18px; }
.res-name { font-weight: 700; color: #1e293b; font-size: 14px; }
.res-meta { font-size: 12px; color: #64748b; }

:deep(.map-popup-content) { min-width: 160px; font-family: 'Plus Jakarta Sans', sans-serif; }
:deep(.popup-header) { margin-bottom: 8px; }
:deep(.popup-header strong) { display: block; font-size: 14px; color: #1e293b; }
:deep(.popup-header span) { font-size: 11px; color: #64748b; }
:deep(.popup-body) { border-top: 1px solid #f1f5f9; padding-top: 8px; }
:deep(.info-row) { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
:deep(.leaflet-popup-content-wrapper) { background: white; border-radius: 14px; padding: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
:deep(.leaflet-popup-tip) { background: white; }
</style>
