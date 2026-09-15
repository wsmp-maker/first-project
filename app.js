// Sample Photos Data
const initialPhotos = [
  {
    id: "p1",
    title: "Alpine Peaks & Lake",
    tag: "Nature",
    desc: "Serene morning reflections on alpine crystal waters.",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    favorite: true,
    date: "2026-02-10"
  },
  {
    id: "p2",
    title: "Urban Neon Geometry",
    tag: "Architecture",
    desc: "Modern skyskraper angles lit up in twilight tones.",
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80",
    favorite: false,
    date: "2026-02-14"
  },
  {
    id: "p3",
    title: "Prismatic Wave Abstract",
    tag: "Abstract",
    desc: "Vibrant light spectrum refractions in fluid glass.",
    url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1000&q=80",
    favorite: true,
    date: "2026-03-01"
  },
  {
    id: "p4",
    title: "Golden Hour Forest",
    tag: "Nature",
    desc: "Sun rays filtering through lush pine forest trees.",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80",
    favorite: false,
    date: "2026-03-05"
  }
];

// App State
let state = {
  photos: JSON.parse(localStorage.getItem("snapvault_photos")) || initialPhotos,
  theme: localStorage.getItem("snapvault_theme") || "dark",
  accent: localStorage.getItem("snapvault_accent") || "purple",
  font: localStorage.getItem("snapvault_font") || "sans",
  card: localStorage.getItem("snapvault_card") || "rounded",
  viewMode: "grid", // 'grid' | 'masonry'
  activeFilter: "all",
  activePhotoId: null,
  filters: {
    preset: "none",
    brightness: 100,
    contrast: 100,
    saturate: 100
  }
};

// DOM Elements
const photoGrid = document.getElementById("photoGrid");
const favGrid = document.getElementById("favGrid");
const albumGrid = document.getElementById("albumGrid");
const searchInput = document.getElementById("searchInput");
const uploadModal = document.getElementById("uploadModal");
const viewModal = document.getElementById("viewModal");
const shareModal = document.getElementById("shareModal");
const canvas = document.getElementById("editorCanvas");
const ctx = canvas.getContext("2d");

let activeImageObj = new Image();

// Initialize App
function init() {
  applyCustomizations();
  renderPhotos();
  renderAlbums();
  setupEventListeners();
  checkShareUrl();
}

// Storage Helper
function savePhotos() {
  localStorage.setItem("snapvault_photos", JSON.stringify(state.photos));
}

// Theme & Style Settings Applied to <html> Element
function applyCustomizations() {
  document.documentElement.setAttribute("data-theme", state.theme);
  document.documentElement.setAttribute("data-accent", state.accent);
  document.documentElement.setAttribute("data-font", state.font);
  document.documentElement.setAttribute("data-card", state.card);
}

// Render Photos Grid
function renderPhotos() {
  const searchTerm = searchInput.value.toLowerCase();
  
  const filtered = state.photos.filter(p => {
    const matchesFilter = state.activeFilter === "all" || p.tag.toLowerCase() === state.activeFilter.toLowerCase();
    const matchesSearch = p.title.toLowerCase().includes(searchTerm) || 
                          p.tag.toLowerCase().includes(searchTerm) || 
                          p.desc.toLowerCase().includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const emptyGallery = document.getElementById("emptyGallery");
  if (filtered.length === 0) {
    emptyGallery.style.display = "block";
    photoGrid.innerHTML = "";
  } else {
    emptyGallery.style.display = "none";
    photoGrid.className = state.viewMode === "masonry" ? "photo-grid masonry" : "photo-grid";
    photoGrid.innerHTML = filtered.map(photo => createPhotoCardHTML(photo)).join("");
  }

  // Favorites Tab Rendering
  const favs = state.photos.filter(p => p.favorite);
  const emptyFavs = document.getElementById("emptyFavs");
  if (favs.length === 0) {
    emptyFavs.style.display = "block";
    favGrid.innerHTML = "";
  } else {
    emptyFavs.style.display = "none";
    favGrid.className = state.viewMode === "masonry" ? "photo-grid masonry" : "photo-grid";
    favGrid.innerHTML = favs.map(photo => createPhotoCardHTML(photo)).join("");
  }
}

function createPhotoCardHTML(photo) {
  return `
    <div class="photo-card" data-id="${photo.id}">
      <div class="photo-thumb-wrap">
        <img src="${photo.url}" class="photo-thumb" alt="${photo.title}">
        <div class="photo-overlay">
          <button class="card-action-btn ${photo.favorite ? 'active-fav' : ''}" onclick="toggleFavorite(event, '${photo.id}')" title="Bookmark">
            <i class="fa-${photo.favorite ? 'solid' : 'regular'} fa-heart"></i>
          </button>
          <button class="card-action-btn" onclick="openShareModal(event, '${photo.id}')" title="Share">
            <i class="fa-solid fa-share-nodes"></i>
          </button>
        </div>
      </div>
      <div class="photo-info">
        <div class="photo-title">${escapeHTML(photo.title)}</div>
        <div class="photo-meta">
          <span class="photo-tag">${escapeHTML(photo.tag)}</span>
          <span>${photo.date}</span>
        </div>
      </div>
    </div>
  `;
}

// Render Albums
function renderAlbums() {
  const categories = [...new Set(state.photos.map(p => p.tag))];
  albumGrid.innerHTML = categories.map(cat => {
    const catPhotos = state.photos.filter(p => p.tag === cat);
    const cover1 = catPhotos[0]?.url || "";
    const cover2 = catPhotos[1]?.url || cover1;
    const cover3 = catPhotos[2]?.url || cover1;

    return `
      <div class="album-card" onclick="filterByAlbum('${cat}')">
        <div class="album-cover-stack">
          <img src="${cover1}" class="album-cover-main" alt="Cover">
          <div class="album-cover-side">
            <img src="${cover2}" alt="Cover 2">
            <img src="${cover3}" alt="Cover 3">
          </div>
        </div>
        <div>
          <h3>${escapeHTML(cat)}</h3>
          <p style="color: var(--text-muted); font-size: 0.85rem;">${catPhotos.length} Photo${catPhotos.length > 1 ? 's' : ''}</p>
        </div>
      </div>
    `;
  }).join("");
}

function filterByAlbum(category) {
  state.activeFilter = category;
  document.querySelectorAll(".pill").forEach(pill => {
    pill.classList.toggle("active", pill.dataset.filter === category);
  });
  switchTab("gallery");
  renderPhotos();
}

// Toggle Favorite Status
window.toggleFavorite = function(e, id) {
  e.stopPropagation();
  const photo = state.photos.find(p => p.id === id);
  if (photo) {
    photo.favorite = !photo.favorite;
    savePhotos();
    renderPhotos();
  }
};

// Canvas Photo Editor Mechanics
function openPhotoEditor(id) {
  state.activePhotoId = id;
  const photo = state.photos.find(p => p.id === id);
  if (!photo) return;

  document.getElementById("viewModalTitle").innerText = photo.title;
  resetFilterState();

  activeImageObj = new Image();
  activeImageObj.crossOrigin = "Anonymous";
  activeImageObj.src = photo.url;
  activeImageObj.onload = () => {
    renderCanvas();
  };

  viewModal.classList.add("active");
}

function resetFilterState() {
  state.filters = { preset: "none", brightness: 100, contrast: 100, saturate: 100 };
  document.getElementById("adjBrightness").value = 100;
  document.getElementById("adjContrast").value = 100;
  document.getElementById("adjSaturate").value = 100;
  document.getElementById("valBrightness").innerText = "100%";
  document.getElementById("valContrast").innerText = "100%";
  document.getElementById("valSaturate").innerText = "100%";
  document.querySelectorAll(".filter-preset-btn").forEach(b => b.classList.remove("active"));
  document.querySelector('.filter-preset-btn[data-preset="none"]').classList.add("active");
}

function renderCanvas() {
  if (!activeImageObj.complete) return;
  canvas.width = activeImageObj.naturalWidth || 800;
  canvas.height = activeImageObj.naturalHeight || 600;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let filterStr = `brightness(${state.filters.brightness}%) contrast(${state.filters.contrast}%) saturate(${state.filters.saturate}%)`;

  switch (state.filters.preset) {
    case "grayscale": filterStr += " grayscale(100%)"; break;
    case "sepia": filterStr += " sepia(80%)"; break;
    case "vivid": filterStr += " saturate(180%) contrast(120%)"; break;
    case "cool": filterStr += " hue-rotate(180deg) brightness(105%)"; break;
    case "warm": filterStr += " sepia(30%) saturate(140%)"; break;
  }

  ctx.filter = filterStr;
  ctx.drawImage(activeImageObj, 0, 0, canvas.width, canvas.height);
}

// Sharing & URL Generator
window.openShareModal = function(e, id) {
  if (e) e.stopPropagation();
  const photo = state.photos.find(p => p.id === id);
  if (!photo) return;

  document.getElementById("shareCardImg").src = photo.url;
  document.getElementById("shareCardTitle").innerText = photo.title;
  document.getElementById("shareCardDesc").innerText = photo.desc || "Shared via SnapVault";

  const shareUrl = `${window.location.origin}${window.location.pathname}?photo=${photo.id}`;
  const shareInput = document.getElementById("shareUrlInput");
  shareInput.value = shareUrl;

  // Generate QR Code
  const qrContainer = document.getElementById("qrcode");
  qrContainer.innerHTML = "";
  new QRCode(qrContainer, {
    text: shareUrl,
    width: 128,
    height: 128
  });

  shareModal.classList.add("active");
};

// Handle Direct URL Sharing Access
function checkShareUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const sharedPhotoId = urlParams.get("photo");
  if (sharedPhotoId) {
    const photo = state.photos.find(p => p.id === sharedPhotoId);
    if (photo) {
      setTimeout(() => openPhotoEditor(sharedPhotoId), 300);
    }
  }
}

// Switch Navigation Tabs
function switchTab(tabId) {
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });
  document.querySelectorAll(".tab-pane").forEach(pane => {
    pane.classList.remove("active");
  });
  const activePane = document.getElementById(`tab${capitalize(tabId)}`);
  if (activePane) activePane.classList.add("active");
}

// Utility: HTML Escaper
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Global Event Handlers
function setupEventListeners() {
  // Navigation
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // Mobile Drawer Toggle
  document.getElementById("mobileToggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
  });

  // View Switchers
  document.getElementById("viewGrid").addEventListener("click", () => {
    state.viewMode = "grid";
    document.getElementById("viewGrid").classList.add("active");
    document.getElementById("viewMasonry").classList.remove("active");
    renderPhotos();
  });

  document.getElementById("viewMasonry").addEventListener("click", () => {
    state.viewMode = "masonry";
    document.getElementById("viewMasonry").classList.add("active");
    document.getElementById("viewGrid").classList.remove("active");
    renderPhotos();
  });

  // Search & Filter Input
  searchInput.addEventListener("input", renderPhotos);

  document.querySelectorAll(".pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      state.activeFilter = pill.dataset.filter;
      renderPhotos();
    });
  });

  // Photo Click Event -> Open Modal
  photoGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".photo-card");
    if (card) openPhotoEditor(card.dataset.id);
  });

  favGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".photo-card");
    if (card) openPhotoEditor(card.dataset.id);
  });

  // Customizer Controls
  document.querySelectorAll(".theme-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".theme-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.theme = btn.dataset.mode;
      localStorage.setItem("snapvault_theme", state.theme);
      applyCustomizations();
    });
  });

  document.querySelectorAll(".color-swatch").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".color-swatch").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.accent = btn.dataset.accent;
      localStorage.setItem("snapvault_accent", state.accent);
      applyCustomizations();
    });
  });

  document.querySelectorAll(".font-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".font-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.font = btn.dataset.font;
      localStorage.setItem("snapvault_font", state.font);
      applyCustomizations();
    });
  });

  document.querySelectorAll(".card-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".card-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.card = btn.dataset.card;
      localStorage.setItem("snapvault_card", state.card);
      applyCustomizations();
    });
  });

  // Photo Upload Modal Setup
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");

  document.getElementById("btnUploadModal").addEventListener("click", () => {
    uploadModal.classList.add("active");
  });

  document.getElementById("closeUploadModal").addEventListener("click", () => uploadModal.classList.remove("active"));
  document.getElementById("cancelUpload").addEventListener("click", () => uploadModal.classList.remove("active"));

  dropzone.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        document.getElementById("previewImg").src = event.target.result;
        document.getElementById("uploadPreview").style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById("saveUploadBtn").addEventListener("click", () => {
    const title = document.getElementById("photoTitle").value || "Untitled Photo";
    const tag = document.getElementById("photoTag").value || "General";
    const desc = document.getElementById("photoDesc").value || "";
    const previewSrc = document.getElementById("previewImg").src;

    if (!previewSrc || previewSrc === "") {
      alert("Please select an image to upload.");
      return;
    }

    const newPhoto = {
      id: "p_" + Date.now(),
      title: title,
      tag: tag,
      desc: desc,
      url: previewSrc,
      favorite: false,
      date: new Date().toISOString().split("T")[0]
    };

    state.photos.unshift(newPhoto);
    savePhotos();
    renderPhotos();
    renderAlbums();

    uploadModal.classList.remove("active");
    // Reset Form
    document.getElementById("photoTitle").value = "";
    document.getElementById("photoTag").value = "";
    document.getElementById("photoDesc").value = "";
    document.getElementById("uploadPreview").style.display = "none";
    document.getElementById("previewImg").src = "";
  });

  // Editor Sub-tabs
  document.querySelectorAll(".ed-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".ed-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      document.querySelectorAll(".ed-pane").forEach(p => p.classList.remove("active"));
      if (tab.dataset.edtab === "filters") document.getElementById("edTabFilters").classList.add("active");
      if (tab.dataset.edtab === "adjust") document.getElementById("edTabAdjust").classList.add("active");
    });
  });

  // Filters & Adjustments
  document.querySelectorAll(".filter-preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-preset-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.filters.preset = btn.dataset.preset;
      renderCanvas();
    });
  });

  ["Brightness", "Contrast", "Saturate"].forEach(param => {
    const input = document.getElementById(`adj${param}`);
    input.addEventListener("input", (e) => {
      const val = e.target.value;
      state.filters[param.toLowerCase()] = val;
      document.getElementById(`val${param}`).innerText = `${val}%`;
      renderCanvas();
    });
  });

  document.getElementById("btnResetFilters").addEventListener("click", () => {
    resetFilterState();
    renderCanvas();
  });

  // Editor Modal Control Actions
  document.getElementById("closeViewModal").addEventListener("click", () => viewModal.classList.remove("active"));

  document.getElementById("btnDeletePhoto").addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this photo from your vault?")) {
      state.photos = state.photos.filter(p => p.id !== state.activePhotoId);
      savePhotos();
      renderPhotos();
      renderAlbums();
      viewModal.classList.remove("active");
    }
  });

  document.getElementById("btnDownloadEdited").addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `snapvault-export-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });

  document.getElementById("btnOpenShareModal").addEventListener("click", () => {
    openShareModal(null, state.activePhotoId);
  });

  // Share Modal Actions
  document.getElementById("closeShareModal").addEventListener("click", () => shareModal.classList.remove("active"));

  document.getElementById("btnCopyShareUrl").addEventListener("click", () => {
    const shareInput = document.getElementById("shareUrlInput");
    shareInput.select();
    navigator.clipboard.writeText(shareInput.value);
    alert("Share URL copied to clipboard!");
  });

  document.getElementById("btnShareNative").addEventListener("click", () => {
    const photo = state.photos.find(p => p.id === state.activePhotoId);
    if (navigator.share && photo) {
      navigator.share({
        title: photo.title,
        text: photo.desc,
        url: window.location.href
      }).catch(console.error);
    } else {
      alert("Native Web Share API is not supported on this browser context.");
    }
  });
}

// Start Application on Load
document.addEventListener("DOMContentLoaded", init);