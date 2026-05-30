<template>
  <div class="admin-page p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold mb-1">Galeri</h2>
        <p class="text-muted mb-0">Kelola foto & gambar untuk halaman utama.</p>
      </div>
      <button class="btn btn-primary rounded-pill" @click="openModal('create')">
        <i class="bi bi-plus-lg me-2"></i>Tambah Foto
      </button>
    </div>

    <!-- Gallery Grid -->
    <div class="row g-3">
      <div class="col-md-4 col-lg-3" v-for="item in gallery" :key="item.id">
        <div class="gallery-card">
          <div class="gallery-img-wrap">
            <img :src="item.image_url" :alt="item.title" @error="handleImgError" />
            <div class="gallery-actions">
              <button class="btn-sm-icon" @click="openModal('edit', item)" title="Edit">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn-sm-icon danger" @click="confirmDelete(item)" title="Hapus">
                <i class="bi bi-trash"></i>
              </button>
            </div>
            <span v-if="item.is_featured" class="featured-badge">
              <i class="bi bi-star-fill"></i>
            </span>
          </div>
          <div class="gallery-info">
            <h6>{{ item.title }}</h6>
            <p v-if="item.caption">{{ item.caption }}</p>
          </div>
        </div>
      </div>
      <div class="col-12" v-if="loading">
        <div class="text-center py-5"><div class="spinner-border text-primary"></div></div>
      </div>
      <div class="col-12" v-if="!loading && gallery.length === 0">
        <div class="text-center py-5 text-muted">
          <i class="bi bi-images fs-1 d-block mb-3"></i>
          Belum ada foto. Klik "Tambah Foto" untuk memulai.
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-box">
        <div class="modal-header-custom">
          <h5>{{ modalType === 'create' ? 'Tambah Foto' : 'Edit Foto' }}</h5>
          <button class="btn-close-custom" @click="showModal = false"><i class="bi bi-x-lg"></i></button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="modal-body-custom">
            <div class="mb-3">
              <label class="form-label-custom">Judul</label>
              <input v-model="form.title" type="text" class="form-input" required placeholder="Contoh: Mata Air Cibulan" />
            </div>
            <div class="mb-3">
              <label class="form-label-custom">URL Gambar</label>
              <input v-model="form.image_url" type="url" class="form-input" required placeholder="https://..." />
            </div>
            <div class="mb-3" v-if="form.image_url">
              <label class="form-label-custom">Preview</label>
              <img :src="form.image_url" class="img-preview" @error="handleImgError" />
            </div>
            <div class="mb-3">
              <label class="form-label-custom">Keterangan (opsional)</label>
              <textarea v-model="form.caption" class="form-input" rows="2" placeholder="Deskripsi singkat..."></textarea>
            </div>
            <div class="row g-3">
              <div class="col-6">
                <label class="form-label-custom">Urutan</label>
                <input v-model.number="form.sort_order" type="number" class="form-input" />
              </div>
              <div class="col-6 d-flex align-items-end">
                <label class="form-check-custom">
                  <input type="checkbox" v-model="form.is_featured" />
                  <span>Tampilkan Besar (Featured)</span>
                </label>
              </div>
            </div>
          </div>
          <div class="modal-footer-custom">
            <button type="button" class="btn-cancel" @click="showModal = false">Batal</button>
            <button type="submit" class="btn-save" :disabled="submitting">
              {{ submitting ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: ['auth'] })

const gallery = ref([])
const loading = ref(true)
const showModal = ref(false)
const modalType = ref('create')
const submitting = ref(false)
const form = ref({ id: null, title: '', image_url: '', caption: '', is_featured: false, sort_order: 0 })

const fetchGallery = async () => {
  loading.value = true
  try {
    gallery.value = await $fetch('/api/gallery')
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const openModal = (type, data = null) => {
  modalType.value = type
  form.value = data ? { ...data }
    : { id: null, title: '', image_url: '', caption: '', is_featured: false, sort_order: 0 }
  showModal.value = true
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (modalType.value === 'create') {
      await $fetch('/api/gallery', { method: 'POST', body: form.value })
    } else {
      await $fetch(`/api/gallery/${form.value.id}`, { method: 'PATCH', body: form.value })
    }
    showModal.value = false
    await fetchGallery()
  } catch (e) { alert('Gagal menyimpan') }
  finally { submitting.value = false }
}

const confirmDelete = async (item) => {
  if (confirm(`Hapus "${item.title}"?`)) {
    try {
      await $fetch(`/api/gallery/${item.id}`, { method: 'DELETE' })
      await fetchGallery()
    } catch (e) { alert('Gagal menghapus') }
  }
}

const handleImgError = (e) => { e.target.src = 'https://placehold.co/400x300/1e293b/64748b?text=No+Image' }

onMounted(fetchGallery)
</script>

<style scoped>
.admin-page { background: #0f172a; min-height: 100vh; color: #f8fafc; }
.gallery-card { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08); border-radius: 16px; overflow: hidden; transition: all .3s; }
.gallery-card:hover { border-color: rgba(56,189,248,.3); transform: translateY(-4px); }
.gallery-img-wrap { position: relative; height: 200px; overflow: hidden; }
.gallery-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s; }
.gallery-card:hover img { transform: scale(1.05); }
.gallery-actions { position: absolute; top: 10px; right: 10px; display: flex; gap: 6px; opacity: 0; transition: opacity .3s; }
.gallery-card:hover .gallery-actions { opacity: 1; }
.btn-sm-icon { width: 32px; height: 32px; border: none; border-radius: 8px; background: rgba(0,0,0,.6); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; backdrop-filter: blur(4px); }
.btn-sm-icon.danger:hover { background: #ef4444; }
.btn-sm-icon:hover { background: #38bdf8; }
.featured-badge { position: absolute; top: 10px; left: 10px; background: #f59e0b; color: #1e293b; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; }
.gallery-info { padding: 14px; }
.gallery-info h6 { font-size: 14px; font-weight: 700; margin: 0; }
.gallery-info p { font-size: 12px; color: #94a3b8; margin: 4px 0 0; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.7); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(4px); }
.modal-box { width: 500px; max-width: 95%; background: #1e293b; border: 1px solid rgba(255,255,255,.1); border-radius: 20px; }
.modal-header-custom { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px 0; }
.modal-header-custom h5 { font-weight: 700; margin: 0; }
.btn-close-custom { background: none; border: none; color: #64748b; font-size: 18px; cursor: pointer; }
.modal-body-custom { padding: 20px 24px; }
.modal-footer-custom { padding: 0 24px 20px; display: flex; gap: 12px; justify-content: flex-end; }
.form-label-custom { display: block; font-size: 13px; color: #94a3b8; font-weight: 600; margin-bottom: 6px; }
.form-input { width: 100%; padding: 10px 14px; background: rgba(15,23,42,.6); border: 1px solid rgba(255,255,255,.1); border-radius: 10px; color: white; font-size: 14px; }
.form-input:focus { outline: none; border-color: #38bdf8; }
.img-preview { width: 100%; height: 150px; object-fit: cover; border-radius: 10px; border: 1px solid rgba(255,255,255,.1); }
.form-check-custom { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #cbd5e1; cursor: pointer; }
.form-check-custom input { width: 16px; height: 16px; accent-color: #38bdf8; }
.btn-cancel { padding: 10px 20px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); border-radius: 10px; color: #94a3b8; cursor: pointer; }
.btn-save { padding: 10px 24px; background: #0ea5e9; border: none; border-radius: 10px; color: white; font-weight: 600; cursor: pointer; }
.btn-save:disabled { opacity: .6; }
</style>
