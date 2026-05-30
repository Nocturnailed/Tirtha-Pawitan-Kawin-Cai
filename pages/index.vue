<template>
  <div :class="['landing', theme]">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="nav-container">
        <NuxtLink to="/" class="nav-brand">
          <i class="bi bi-droplet-fill"></i>
          <span>Tirtha Pawitan</span>
        </NuxtLink>
        <div class="nav-links d-none d-lg-flex">
          <a href="#tentang">Tentang</a>
          <a href="#tradisi">Tradisi</a>
          <a href="#proses">Proses</a>
          <a href="#peta">Peta GIS</a>
          <a href="#manfaat">Manfaat</a>
          <a href="#galeri">Galeri</a>
        </div>
        <div class="nav-actions">
          <button class="theme-toggle" @click="toggleTheme" :title="theme === 'light' ? 'Mode Gelap' : 'Mode Terang'">
            <i :class="theme === 'light' ? 'bi bi-moon-stars-fill' : 'bi bi-sun-fill'"></i>
          </button>
          <NuxtLink to="/login" class="btn-login">
            <i class="bi bi-box-arrow-in-right me-2"></i>Masuk
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <header class="hero">
      <div class="hero-bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
      <div class="hero-content">
        <div class="hero-badge">
          <span class="dot"></span> Kearifan Lokal Sunda
        </div>
        <h1>Melestarikan Air,<br/><span class="highlight">Menjaga Kehidupan.</span></h1>
        <p class="hero-desc">
          <strong>Kawin Cai</strong> adalah tradisi leluhur masyarakat Sunda dalam menjaga 
          keberlangsungan sumber mata air melalui harmoni antara manusia dan alam.
        </p>
        <div class="hero-cta">
          <a href="#tentang" class="btn-primary-cta">
            <i class="bi bi-arrow-down-circle me-2"></i>Pelajari Lebih Lanjut
          </a>
          <a href="#galeri" class="btn-secondary-cta">
            <i class="bi bi-images me-2"></i>Lihat Galeri
          </a>
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <div class="stat-number">{{ stats.total || 8 }}</div>
            <div class="stat-label">Titik Mata Air</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">15+</div>
            <div class="stat-label">Kecamatan</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">100+</div>
            <div class="stat-label">Tahun Tradisi</div>
          </div>
        </div>
      </div>
    </header>

    <!-- Tentang Section -->
    <section id="tentang" class="section">
      <div class="section-container">
        <div class="section-header">
          <span class="section-tag">Tentang</span>
          <h2>Apa itu <span class="highlight">Kawin Cai</span>?</h2>
          <p class="section-subtitle">Filosofi air yang menyatukan alam dan budaya Sunda</p>
        </div>
        <div class="about-grid">
          <div class="about-card main-card">
            <div class="about-icon"><i class="bi bi-water"></i></div>
            <h3>Pernikahan Air</h3>
            <p>
              <strong>"Kawin Cai"</strong> secara harfiah berarti <em>"pernikahan air"</em>. 
              Ini adalah upacara adat masyarakat Sunda, khususnya di Kabupaten Kuningan, 
              Jawa Barat, yang bertujuan menyatukan dua sumber air dari mata air berbeda 
              sebagai simbol keharmonisan dan keberlanjutan alam.
            </p>
            <p>
              Tradisi ini dipercaya mampu menjaga kelestarian sumber air, menolak bala, dan 
              memastikan kesejahteraan masyarakat sekitar. Lebih dari sekadar ritual, Kawin Cai 
              adalah bentuk kecintaan masyarakat terhadap alam.
            </p>
          </div>
          <div class="about-side">
            <div class="about-card">
              <div class="about-icon small-icon"><i class="bi bi-geo-alt-fill"></i></div>
              <h4>Kabupaten Kuningan</h4>
              <p>Tradisi ini berkembang di kawasan Kuningan yang dikenal sebagai "Kota Kuda" dan kaya akan sumber mata air alami.</p>
            </div>
            <div class="about-card">
              <div class="about-icon small-icon"><i class="bi bi-calendar-heart"></i></div>
              <h4>Dilakukan Berkala</h4>
              <p>Upacara Kawin Cai dilaksanakan setiap tahun atau saat kondisi tertentu sebagai bentuk syukur dan permohonan kepada alam.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tradisi Section -->
    <section id="tradisi" class="section section-alt">
      <div class="section-container">
        <div class="section-header">
          <span class="section-tag">Tradisi</span>
          <h2>Makna Spiritual & <span class="highlight">Budaya</span></h2>
          <p class="section-subtitle">Setiap elemen dalam Kawin Cai memiliki makna mendalam</p>
        </div>
        <div class="tradition-grid">
          <div class="tradition-card" v-for="(item, idx) in traditions" :key="idx">
            <div class="tradition-number">{{ String(idx + 1).padStart(2, '0') }}</div>
            <div class="tradition-icon"><i :class="item.icon"></i></div>
            <h4>{{ item.title }}</h4>
            <p>{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Proses Section -->
    <section id="proses" class="section">
      <div class="section-container">
        <div class="section-header">
          <span class="section-tag">Proses</span>
          <h2>Tahapan <span class="highlight">Upacara</span></h2>
          <p class="section-subtitle">Rangkaian prosesi sakral Kawin Cai</p>
        </div>
        <div class="timeline">
          <div class="timeline-item" v-for="(step, idx) in processSteps" :key="idx" :class="{ reverse: idx % 2 !== 0 }">
            <div class="timeline-dot">
              <span>{{ idx + 1 }}</span>
            </div>
            <div class="timeline-content">
              <h4>{{ step.title }}</h4>
              <p>{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Manfaat Section -->
    <section id="manfaat" class="section section-alt">
      <div class="section-container">
        <div class="section-header">
          <span class="section-tag">Manfaat</span>
          <h2>Dampak Positif <span class="highlight">Kawin Cai</span></h2>
          <p class="section-subtitle">Bukan hanya tradisi, tapi aksi nyata pelestarian alam</p>
        </div>
        <div class="benefit-grid">
          <div class="benefit-card" v-for="(b, idx) in benefits" :key="idx">
            <div class="benefit-icon"><i :class="b.icon"></i></div>
            <h4>{{ b.title }}</h4>
            <p>{{ b.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Peta GIS Section -->
    <section id="peta" class="section">
      <div class="section-container">
        <div class="section-header">
          <span class="section-tag">Peta</span>
          <h2>Sebaran <span class="highlight">Titik Mata Air</span></h2>
          <p class="section-subtitle">Lokasi sumber mata air yang terpantau di Kabupaten Kuningan</p>
        </div>
        <div class="map-section-wrapper">
          <div class="map-main">
            <ClientOnly>
              <GisMapPublic />
            </ClientOnly>
          </div>
          <div class="map-sidebar">
            <div class="map-info-card">
              <div class="map-info-icon"><i class="bi bi-pin-map-fill"></i></div>
              <h5>Interaktif</h5>
              <p>Klik pada titik di peta untuk melihat detail kondisi dan debit air terkini.</p>
            </div>
            <div class="map-info-card">
              <div class="map-info-icon success"><i class="bi bi-check-circle-fill"></i></div>
              <h5>{{ stats.total || 8 }} Titik Terpantau</h5>
              <p>Tersebar di berbagai kecamatan di Kabupaten Kuningan, Jawa Barat.</p>
            </div>
            <div class="map-legend">
              <h6>Legenda</h6>
              <div class="legend-item"><span class="legend-dot safe"></span> Layak / Aman</div>
              <div class="legend-item"><span class="legend-dot warning"></span> Butuh Konservasi</div>
              <div class="legend-item"><span class="legend-dot danger"></span> Kritis</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Galeri Section -->
    <section id="galeri" class="section">
      <div class="section-container">
        <div class="section-header">
          <span class="section-tag">Galeri</span>
          <h2>Keindahan <span class="highlight">Alam Kuningan</span></h2>
          <p class="section-subtitle">Panorama sumber mata air yang dijaga oleh tradisi Kawin Cai</p>
        </div>
        <div class="gallery-grid">
          <div class="gallery-item large">
            <img src="https://images.unsplash.com/photo-1540331547168-8b63109225b7?auto=format&fit=crop&q=80&w=800" alt="Sumber Air" />
            <div class="gallery-overlay"><span>Sumber Mata Air Alami</span></div>
          </div>
          <div class="gallery-item">
            <img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=600" alt="Pemandangan" />
            <div class="gallery-overlay"><span>Lembah Kuningan</span></div>
          </div>
          <div class="gallery-item">
            <img src="https://images.unsplash.com/photo-1432405972618-c6b0cfba1b3e?auto=format&fit=crop&q=80&w=600" alt="Hutan" />
            <div class="gallery-overlay"><span>Hutan Lindung</span></div>
          </div>
          <div class="gallery-item">
            <img src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=600" alt="Sungai" />
            <div class="gallery-overlay"><span>Aliran Sungai Bersih</span></div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="section-container text-center">
        <h2>Ikut Lestarikan Tradisi Kawin Cai</h2>
        <p>Jadilah bagian dari gerakan pelestarian mata air dan budaya Sunda.</p>
        <NuxtLink to="/login" class="btn-primary-cta large">
          <i class="bi bi-arrow-right-circle me-2"></i>Masuk ke Sistem Monitoring
        </NuxtLink>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="section-container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="nav-brand">
              <i class="bi bi-droplet-fill"></i>
              <span>Tirtha Pawitan</span>
            </div>
            <p>Sistem Informasi Geospasial untuk pelestarian sumber mata air berdasarkan kearifan lokal Kawin Cai.</p>
          </div>
          <div class="footer-links-col">
            <h5>Navigasi</h5>
            <a href="#tentang">Tentang</a>
            <a href="#tradisi">Tradisi</a>
            <a href="#proses">Proses</a>
            <a href="#manfaat">Manfaat</a>
          </div>
          <div class="footer-links-col">
            <h5>Lainnya</h5>
            <NuxtLink to="/login">Masuk Admin</NuxtLink>
            <a href="#">Kontak</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2026 Tirtha Pawitan — Kabupaten Kuningan, Jawa Barat</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })

const theme = ref('light')
const stats = ref({ total: 0 })

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

const traditions = [
  { icon: 'bi bi-droplet-half', title: 'Simbol Kesuburan', desc: 'Air melambangkan sumber kehidupan dan kesuburan tanah. Penyatuan dua sumber air adalah doa agar alam tetap subur dan memberikan manfaat.' },
  { icon: 'bi bi-heart-fill', title: 'Harmoni Alam', desc: 'Kawin Cai mengajarkan bahwa manusia dan alam harus hidup berdampingan. Menjaga air berarti menjaga keseimbangan ekosistem.' },
  { icon: 'bi bi-people-fill', title: 'Gotong Royong', desc: 'Upacara ini melibatkan seluruh warga desa, memperkuat ikatan sosial dan tanggung jawab bersama terhadap lingkungan.' },
  { icon: 'bi bi-shield-check', title: 'Pelindung Mata Air', desc: 'Masyarakat percaya bahwa ritual ini melindungi sumber air dari kekeringan, pencemaran, dan kerusakan alam.' },
  { icon: 'bi bi-tree-fill', title: 'Konservasi Hutan', desc: 'Kawasan sekitar mata air dijaga kelestariannya. Pohon-pohon tidak boleh ditebang untuk menjaga resapan air tanah.' },
  { icon: 'bi bi-stars', title: 'Warisan Leluhur', desc: 'Tradisi ini telah diwariskan turun-temurun selama ratusan tahun dan menjadi identitas budaya masyarakat Kuningan.' }
]

const processSteps = [
  { title: 'Musyawarah Desa', desc: 'Tokoh adat, sesepuh, dan warga berkumpul untuk menentukan waktu pelaksanaan dan persiapan upacara Kawin Cai.' },
  { title: 'Pengambilan Air Suci', desc: 'Air dari dua sumber mata air berbeda diambil oleh petugas adat yang ditunjuk, disertai doa dan mantra khusus.' },
  { title: 'Prosesi Arak-Arakan', desc: 'Kedua wadah air dibawa berkeliling kampung diiringi gamelan, tari-tarian, dan doa-doa masyarakat.' },
  { title: 'Penyatuan Air (Kawin Cai)', desc: 'Puncak upacara: kedua air dicampurkan menjadi satu di titik pertemuan sungai atau mata air utama desa.' },
  { title: 'Doa & Tumpengan', desc: 'Setelah penyatuan air, masyarakat berdoa bersama lalu menikmati tumpeng dan hidangan sebagai simbol syukur.' }
]

const benefits = [
  { icon: 'bi bi-moisture', title: 'Kelestarian Sumber Air', desc: 'Menjaga debit air tetap stabil dan berkelanjutan untuk kebutuhan warga dan pertanian.' },
  { icon: 'bi bi-globe-asia-australia', title: 'Kesehatan Ekosistem', desc: 'Ekosistem di sekitar mata air terjaga keberagaman hayatinya berkat perlindungan adat.' },
  { icon: 'bi bi-building', title: 'Identitas Budaya', desc: 'Memperkuat identitas dan kebanggaan budaya Sunda di tengah arus modernisasi.' },
  { icon: 'bi bi-graph-up-arrow', title: 'Pariwisata Budaya', desc: 'Menarik wisatawan yang tertarik dengan kearifan lokal dan keindahan alam Kuningan.' }
]

onMounted(async () => {
  try {
    const data = await $fetch('/api/water-points/stats')
    stats.value = data
  } catch (e) {}
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

/* ===== BASE ===== */
.landing {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  transition: background .4s, color .4s;
  overflow-x: hidden;
}

/* ===== LIGHT THEME (DEFAULT) ===== */
.landing.light {
  --bg: #ffffff;
  --bg-alt: #f8f9fc;
  --text: #1e293b;
  --text-sub: #64748b;
  --primary: #0ea5e9;
  --primary-soft: rgba(14, 165, 233, 0.08);
  --accent: #0284c7;
  --border: #e2e8f0;
  --card-bg: #ffffff;
  --card-shadow: 0 4px 24px -4px rgba(0,0,0,0.06);
  --nav-bg: rgba(255,255,255,0.85);
  --hero-gradient: linear-gradient(160deg, #f0f9ff 0%, #e0f2fe 40%, #f8fafc 100%);
  --highlight-color: #0ea5e9;
  --tag-bg: rgba(14,165,233,0.08);
  --tag-color: #0284c7;
  --footer-bg: #0f172a;
  --footer-text: #94a3b8;
  background: var(--bg);
  color: var(--text);
}

/* ===== DARK THEME ===== */
.landing.dark {
  --bg: #0f172a;
  --bg-alt: #1e293b;
  --text: #f1f5f9;
  --text-sub: #94a3b8;
  --primary: #38bdf8;
  --primary-soft: rgba(56, 189, 248, 0.1);
  --accent: #0ea5e9;
  --border: rgba(255,255,255,0.08);
  --card-bg: rgba(30, 41, 59, 0.6);
  --card-shadow: 0 4px 24px -4px rgba(0,0,0,0.3);
  --nav-bg: rgba(15,23,42,0.9);
  --hero-gradient: linear-gradient(160deg, #0f172a 0%, #1e293b 40%, #0f172a 100%);
  --highlight-color: #38bdf8;
  --tag-bg: rgba(56,189,248,0.1);
  --tag-color: #38bdf8;
  --footer-bg: #020617;
  --footer-text: #64748b;
  background: var(--bg);
  color: var(--text);
}

.highlight { color: var(--highlight-color); }

/* ===== NAVBAR ===== */
.navbar {
  position: fixed; top: 0; left: 0; right: 0;
  z-index: 1000;
  background: var(--nav-bg);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  padding: 16px 0;
}
.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.nav-brand {
  display: flex; align-items: center; gap: 10px;
  text-decoration: none;
  font-weight: 800; font-size: 20px;
  color: var(--text);
}
.nav-brand i { color: var(--primary); font-size: 24px; }
.nav-links { display: flex; gap: 32px; }
.nav-links a {
  text-decoration: none; color: var(--text-sub);
  font-weight: 600; font-size: 14px;
  transition: color .2s;
  white-space: nowrap;
}
.nav-links a:hover { color: var(--primary); }
.nav-actions { display: flex; align-items: center; gap: 14px; }
.theme-toggle {
  width: 40px; height: 40px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card-bg);
  color: var(--text);
  font-size: 16px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .2s;
}
.theme-toggle:hover { border-color: var(--primary); color: var(--primary); }
.btn-login {
  padding: 10px 20px;
  background: var(--primary);
  color: white;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all .2s;
}
.btn-login:hover { opacity: .9; transform: translateY(-1px); }

/* ===== HERO ===== */
.hero {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background: var(--hero-gradient);
  position: relative;
  padding: 120px 24px 80px;
  overflow: hidden;
}
.hero-bg-shapes { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.shape {
  position: absolute; border-radius: 50%;
  opacity: 0.15; filter: blur(80px);
}
.shape-1 { width: 500px; height: 500px; background: var(--primary); top: -100px; right: -100px; }
.shape-2 { width: 400px; height: 400px; background: #818cf8; bottom: -80px; left: -80px; }
.shape-3 { width: 300px; height: 300px; background: #10b981; top: 40%; left: 50%; }

.hero-content {
  max-width: 800px;
  text-align: center;
  position: relative;
  z-index: 2;
  animation: fadeUp .8s ease;
}
.hero-badge {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 8px 20px;
  background: var(--tag-bg);
  color: var(--tag-color);
  border-radius: 100px;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid var(--border);
  margin-bottom: 28px;
}
.dot {
  width: 8px; height: 8px;
  background: var(--primary);
  border-radius: 50%;
  animation: pulse 2s infinite;
}
.hero h1 {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 20px;
  letter-spacing: -1.5px;
}
.hero-desc {
  font-size: 18px;
  color: var(--text-sub);
  line-height: 1.7;
  margin-bottom: 36px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}
.hero-cta { display: flex; gap: 16px; justify-content: center; margin-bottom: 60px; }
.btn-primary-cta {
  padding: 14px 32px;
  background: var(--primary);
  color: white;
  border-radius: 14px;
  text-decoration: none;
  font-weight: 700;
  font-size: 15px;
  transition: all .3s;
  box-shadow: 0 10px 30px -8px rgba(14,165,233,0.4);
}
.btn-primary-cta:hover { transform: translateY(-2px); box-shadow: 0 15px 40px -8px rgba(14,165,233,0.5); }
.btn-primary-cta.large { padding: 18px 40px; font-size: 16px; }
.btn-secondary-cta {
  padding: 14px 28px;
  background: transparent;
  color: var(--text);
  border: 2px solid var(--border);
  border-radius: 14px;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  transition: all .3s;
}
.btn-secondary-cta:hover { border-color: var(--primary); color: var(--primary); }

.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  padding: 28px 48px;
  background: var(--card-bg);
  border-radius: 20px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border);
}
.stat-number { font-size: 28px; font-weight: 900; color: var(--primary); }
.stat-label { font-size: 12px; color: var(--text-sub); font-weight: 600; text-transform: uppercase; letter-spacing: .5px; margin-top: 2px; }
.stat-divider { width: 1px; height: 40px; background: var(--border); }

/* ===== SECTIONS ===== */
.section { padding: 100px 24px; }
.section-alt { background: var(--bg-alt); }
.section-container { max-width: 1100px; margin: 0 auto; }
.section-header { text-align: center; margin-bottom: 60px; }
.section-tag {
  display: inline-block;
  padding: 6px 18px;
  background: var(--tag-bg);
  color: var(--tag-color);
  border-radius: 100px;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
}
.section-header h2 { font-size: 36px; font-weight: 900; letter-spacing: -1px; margin-bottom: 12px; }
.section-subtitle { color: var(--text-sub); font-size: 16px; }

/* ===== ABOUT ===== */
.about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.about-card {
  padding: 36px;
  background: var(--card-bg);
  border-radius: 24px;
  border: 1px solid var(--border);
  box-shadow: var(--card-shadow);
  transition: all .3s;
}
.about-card:hover { transform: translateY(-4px); }
.about-card.main-card { grid-row: span 2; }
.about-card p { color: var(--text-sub); line-height: 1.8; font-size: 15px; margin-bottom: 12px; }
.about-card h3 { font-size: 22px; font-weight: 800; margin-bottom: 16px; }
.about-card h4 { font-size: 18px; font-weight: 700; margin-bottom: 10px; }
.about-icon {
  width: 56px; height: 56px;
  background: var(--tag-bg);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; color: var(--primary);
  margin-bottom: 20px;
}
.about-icon.small-icon { width: 44px; height: 44px; font-size: 20px; border-radius: 12px; }
.about-side { display: flex; flex-direction: column; gap: 24px; }

/* ===== TRADITION ===== */
.tradition-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.tradition-card {
  padding: 36px;
  background: var(--card-bg);
  border-radius: 24px;
  border: 1px solid var(--border);
  box-shadow: var(--card-shadow);
  position: relative;
  transition: all .3s;
}
.tradition-card:hover { transform: translateY(-6px); border-color: var(--primary); }
.tradition-number {
  position: absolute; top: 20px; right: 20px;
  font-size: 48px; font-weight: 900;
  color: var(--border);
  line-height: 1;
}
.tradition-icon {
  width: 50px; height: 50px;
  background: var(--tag-bg);
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; color: var(--primary);
  margin-bottom: 20px;
}
.tradition-card h4 { font-size: 17px; font-weight: 700; margin-bottom: 10px; }
.tradition-card p { color: var(--text-sub); font-size: 14px; line-height: 1.7; }

/* ===== TIMELINE ===== */
.timeline { position: relative; max-width: 700px; margin: 0 auto; }
.timeline::before {
  content: '';
  position: absolute;
  left: 24px; top: 0; bottom: 0;
  width: 2px;
  background: var(--border);
}
.timeline-item {
  display: flex;
  gap: 24px;
  margin-bottom: 40px;
  position: relative;
}
.timeline-dot {
  width: 50px; height: 50px;
  min-width: 50px;
  background: var(--primary);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  color: white;
  font-weight: 800;
  font-size: 16px;
  z-index: 2;
}
.timeline-content {
  background: var(--card-bg);
  padding: 24px;
  border-radius: 20px;
  border: 1px solid var(--border);
  box-shadow: var(--card-shadow);
  flex: 1;
}
.timeline-content h4 { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
.timeline-content p { color: var(--text-sub); font-size: 14px; line-height: 1.7; margin: 0; }

/* ===== BENEFITS ===== */
.benefit-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.benefit-card {
  padding: 36px 28px;
  background: var(--card-bg);
  border-radius: 24px;
  border: 1px solid var(--border);
  box-shadow: var(--card-shadow);
  text-align: center;
  transition: all .3s;
}
.benefit-card:hover { transform: translateY(-6px); border-color: var(--primary); }
.benefit-icon {
  width: 60px; height: 60px;
  background: var(--tag-bg);
  border-radius: 18px;
  display: flex; align-items: center; justify-content: center;
  font-size: 26px; color: var(--primary);
  margin: 0 auto 20px;
}
.benefit-card h4 { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
.benefit-card p { color: var(--text-sub); font-size: 13px; line-height: 1.7; }

/* ===== GALLERY ===== */
.gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; grid-auto-rows: 240px; }
.gallery-item {
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
}
.gallery-item.large { grid-column: span 2; grid-row: span 2; }
.gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s; }
.gallery-item:hover img { transform: scale(1.08); }
.gallery-overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 20px;
  background: linear-gradient(transparent, rgba(0,0,0,.7));
  color: white;
  font-weight: 700;
  font-size: 14px;
}

/* ===== CTA ===== */
.cta-section {
  padding: 100px 24px;
  background: linear-gradient(135deg, var(--primary), #6366f1);
  text-align: center;
}
.cta-section h2 { color: white; font-size: 36px; font-weight: 900; margin-bottom: 12px; }
.cta-section p { color: rgba(255,255,255,.8); font-size: 16px; margin-bottom: 32px; }
.cta-section .btn-primary-cta {
  background: white;
  color: var(--primary);
  box-shadow: 0 10px 30px rgba(0,0,0,.2);
}

/* ===== FOOTER ===== */
.footer { background: var(--footer-bg); padding: 60px 24px 30px; color: var(--footer-text); }
.footer .nav-brand { color: white; margin-bottom: 16px; }
.footer p { font-size: 14px; line-height: 1.7; max-width: 300px; }
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 40px; margin-bottom: 40px; }
.footer-links-col h5 { color: white; font-size: 14px; font-weight: 700; margin-bottom: 16px; }
.footer-links-col a { display: block; color: var(--footer-text); text-decoration: none; font-size: 14px; margin-bottom: 10px; transition: color .2s; }
.footer-links-col a:hover { color: var(--primary); }
.footer-bottom { border-top: 1px solid rgba(255,255,255,.05); padding-top: 24px; text-align: center; }
.footer-bottom p { font-size: 13px; max-width: 100%; }

/* ===== MAP SECTION ===== */
.map-section-wrapper {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
}
.map-main {
  min-height: 500px;
}
.map-sidebar {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--bg-alt);
}
.map-info-card {
  padding: 20px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
}
.map-info-card h5 { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
.map-info-card p { font-size: 13px; color: var(--text-sub); line-height: 1.6; margin: 0; }
.map-info-icon {
  width: 40px; height: 40px;
  background: var(--tag-bg);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; color: var(--primary);
  margin-bottom: 12px;
}
.map-info-icon.success { background: rgba(16,185,129,.1); color: #10b981; }
.map-legend {
  padding: 20px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
}
.map-legend h6 { font-size: 13px; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; letter-spacing: .5px; color: var(--text-sub); }
.legend-item { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--text-sub); margin-bottom: 8px; }
.legend-dot { width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 1px var(--border); }
.legend-dot.safe { background: #10b981; }
.legend-dot.warning { background: #f59e0b; }
.legend-dot.danger { background: #ef4444; }

/* ===== ANIMATIONS ===== */
@keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(14,165,233,.7); } 70% { box-shadow: 0 0 0 8px rgba(14,165,233,0); } 100% { box-shadow: 0 0 0 0 rgba(14,165,233,0); } }

/* ===== RESPONSIVE ===== */
@media (max-width: 991px) {
  .about-grid { grid-template-columns: 1fr; }
  .about-card.main-card { grid-row: span 1; }
  .tradition-grid { grid-template-columns: repeat(2, 1fr); }
  .benefit-grid { grid-template-columns: repeat(2, 1fr); }
  .gallery-grid { grid-template-columns: 1fr 1fr; grid-auto-rows: 200px; }
  .gallery-item.large { grid-column: span 2; }
  .footer-grid { grid-template-columns: 1fr; }
  .hero-stats { flex-direction: column; gap: 16px; padding: 24px; }
  .stat-divider { width: 60px; height: 1px; }
  .map-section-wrapper { grid-template-columns: 1fr; }
  .map-main { min-height: 400px; }
}
@media (max-width: 768px) {
  .tradition-grid { grid-template-columns: 1fr; }
  .benefit-grid { grid-template-columns: 1fr; }
  .gallery-grid { grid-template-columns: 1fr; grid-auto-rows: 200px; }
  .gallery-item.large { grid-column: span 1; grid-row: span 1; }
  .hero h1 { font-size: 2rem; }
  .hero-cta { flex-direction: column; align-items: center; }
}
</style>
