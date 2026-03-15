const reportForm = document.getElementById('reportForm');
const messageForm = document.getElementById('messageForm');
const reportList = document.getElementById('reportList');
const messageList = document.getElementById('messageList');
const photoInput = document.getElementById('photoInput');
const photoPreview = document.getElementById('photoPreview');
const clearReportsBtn = document.getElementById('clearReports');
const clearMessagesBtn = document.getElementById('clearMessages');
const productGrid = document.getElementById('productGrid');
const shuffleShopBtn = document.getElementById('shuffleShop');
const mapStatus = document.getElementById('mapStatus');
const locateBtn = document.getElementById('locateMe');
const searchLocationBtn = document.getElementById('searchLocation');
const locationInput = document.getElementById('locationInput');
const radiusInput = document.getElementById('radiusInput');
const radiusValue = document.getElementById('radiusValue');
const hospitalList = document.getElementById('hospitalList');
const navButtons = document.querySelectorAll('.cat-btn');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');

const STORAGE_REPORT = 'mcs_reports';
const STORAGE_MESSAGE = 'mcs_messages';

let reports = JSON.parse(localStorage.getItem(STORAGE_REPORT) || '[]');
let messages = JSON.parse(localStorage.getItem(STORAGE_MESSAGE) || '[]');

const sampleProducts = [
  { name: '넥밴드 LED 목줄', price: 32000, tag: '야간산책', img: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=80' },
  { name: '동결건조 간식팩', price: 18000, tag: '간식', img: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80' },
  { name: '러버 슬로우볼', price: 27000, tag: '장난감', img: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=600&q=80' },
  { name: '반려인 응급키트', price: 12000, tag: '응급', img: 'https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&w=600&q=80' },
  { name: '케어 펫매트', price: 21000, tag: '위생', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80' },
  { name: '하네스 세트', price: 24000, tag: '산책', img: 'https://images.unsplash.com/photo-1612837017391-39c19f5041f4?auto=format&fit=crop&w=600&q=80' }
];

function formatTime(ts) {
  return new Intl.DateTimeFormat('ko', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(ts);
}

function renderReports() {
  reportList.innerHTML = '';
  if (!reports.length) {
    reportList.innerHTML = '<p class="hint">아직 제보가 없습니다.</p>';
    return;
  }
  reports.forEach(({ name, type, lastSeen, photo }, idx) => {
    const card = document.createElement('article');
    card.className = 'report-card';
    card.dataset.index = idx;
    card.innerHTML = `
      <div class="report-card__thumb">${photo ? `<img src="${photo}" alt="${name}">` : '<span>IMG</span>'}</div>
      <div class="report-card__info">
        <div class="chip">${type}</div>
        <h3>${name}</h3>
        <p class="report-card__meta">마지막 위치: ${lastSeen}</p>
      </div>
    `;
    reportList.appendChild(card);
  });
}

function renderMessages() {
  messageList.innerHTML = '';
  if (!messages.length) {
    messageList.innerHTML = '<p class="hint">첫 메시지를 남겨보세요.</p>';
    return;
  }
  messages.slice().reverse().forEach(({ nickname, text, createdAt }) => {
    const li = document.createElement('li');
    li.className = 'message';
    li.innerHTML = `
      <div class="avatar">${nickname.slice(0, 2).toUpperCase()}</div>
      <div class="message__body">
        <strong>${nickname}</strong>
        <p class="message__meta">${formatTime(createdAt)}</p>
        <p>${text}</p>
      </div>
    `;
    messageList.appendChild(li);
  });
}

function storeReports() {
  localStorage.setItem(STORAGE_REPORT, JSON.stringify(reports));
}
function storeMessages() {
  localStorage.setItem(STORAGE_MESSAGE, JSON.stringify(messages));
}

reportForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(reportForm);
  const entry = {
    name: data.get('name') || '',
    type: data.get('type') || '기타',
    lastSeen: data.get('lastSeen') || '',
    contact: data.get('contact') || '',
    features: data.get('features') || '',
    photo: photoPreview.dataset.src || '',
    createdAt: Date.now(),
  };
  reports.unshift(entry);
  storeReports();
  renderReports();
  reportForm.reset();
  photoPreview.innerHTML = '사진을 선택해주세요';
  delete photoPreview.dataset.src;
});

messageForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(messageForm);
  const entry = {
    nickname: data.get('nickname') || '익명',
    text: data.get('text') || '',
    createdAt: Date.now(),
  };
  messages.push(entry);
  storeMessages();
  renderMessages();
  messageForm.reset();
});

clearReportsBtn?.addEventListener('click', () => {
  if (confirm('모든 제보를 삭제할까요?')) {
    reports = [];
    storeReports();
    renderReports();
  }
});
clearMessagesBtn?.addEventListener('click', () => {
  if (confirm('모든 메시지를 삭제할까요?')) {
    messages = [];
    storeMessages();
    renderMessages();
  }
});

photoInput?.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('이미지 파일을 선택해주세요');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    photoPreview.innerHTML = `<img src="${reader.result}" alt="preview">`;
    photoPreview.dataset.src = reader.result;
  };
  reader.readAsDataURL(file);
});

// Detail modal
const modal = document.getElementById('detailModal');
const modalClose = modal?.querySelector('.modal__close');
const modalBackdrop = modal?.querySelector('.modal__backdrop');
const detailPhoto = document.getElementById('detailPhoto');
const detailType = document.getElementById('detailType');
const detailName = document.getElementById('detailName');
const detailLastSeen = document.getElementById('detailLastSeen');
const detailContact = document.getElementById('detailContact');
const detailFeatures = document.getElementById('detailFeatures');
const detailCreated = document.getElementById('detailCreated');

function openDetail(idx) {
  const item = reports[idx];
  if (!item || !modal) return;
  detailPhoto.innerHTML = item.photo ? `<img src="${item.photo}" alt="${item.name}">` : '';
  detailType.textContent = item.type;
  detailName.textContent = item.name;
  detailLastSeen.textContent = `마지막 위치: ${item.lastSeen}`;
  detailContact.textContent = `연락처: ${item.contact}`;
  detailFeatures.textContent = item.features || '';
  detailCreated.textContent = `작성: ${formatTime(item.createdAt)}`;
  modal.classList.remove('hidden');
}
function closeDetail() {
  modal?.classList.add('hidden');
}

reportList?.addEventListener('click', (e) => {
  const card = e.target.closest('.report-card');
  if (!card) return;
  const idx = Number(card.dataset.index);
  if (!Number.isNaN(idx)) openDetail(idx);
});
modalClose?.addEventListener('click', closeDetail);
modalBackdrop?.addEventListener('click', closeDetail);
document.addEventListener('keyup', (e) => {
  if (e.key === 'Escape') closeDetail();
});

// Map: Leaflet + Overpass (병원)
let map;
let markerLayer;
let markerRefs = [];
const fallbackCenter = { lat: 37.5665, lng: 126.9780, label: '서울시청' };
let currentCenter = null;

function setStatus(text) {
  if (mapStatus) mapStatus.textContent = text;
}

function kmDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatAddress(tags = {}) {
  return tags['addr:full']
    || [tags['addr:postcode'], tags['addr:city'], tags['addr:district'], tags['addr:suburb'], tags['addr:road'] || tags['addr:street'], tags['addr:housenumber']]
      .filter(Boolean)
      .join(' ')
    || '주소 정보 없음';
}

function renderHospitalList(items) {
  if (!hospitalList) return;
  hospitalList.innerHTML = '';
  if (!items.length) {
    hospitalList.innerHTML = '<p class="hint">주변에서 병원을 찾지 못했어요. 반경을 넓히거나 다른 위치를 검색해보세요.</p>';
    return;
  }
  items.forEach((item, idx) => {
    const card = document.createElement('article');
    card.className = 'map-card';
    card.dataset.idx = String(idx);
    card.innerHTML = `
      <div>
        <p class="map-card__name">${item.name}</p>
        <p class="map-card__meta">${item.address}</p>
        ${item.phone ? `<p class="map-card__meta">☎ ${item.phone}</p>` : ''}
      </div>
      <div class="map-card__distance">${item.distance.toFixed(1)} km</div>
    `;
    card.addEventListener('click', () => {
      map?.setView([item.lat, item.lon], 15);
      markerRefs[idx]?.openPopup();
    });
    hospitalList.appendChild(card);
  });
}

function buildHospitalQuery(lat, lon, radiusMeters) {
  return `[out:json][timeout:25];
    (
      node["amenity"="veterinary"](around:${radiusMeters},${lat},${lon});
      way["amenity"="veterinary"](around:${radiusMeters},${lat},${lon});
      relation["amenity"="veterinary"](around:${radiusMeters},${lat},${lon});
      node["healthcare"="veterinary"](around:${radiusMeters},${lat},${lon});
      way["healthcare"="veterinary"](around:${radiusMeters},${lat},${lon});
      relation["healthcare"="veterinary"](around:${radiusMeters},${lat},${lon});
      node["name"~"동물병원"](around:${radiusMeters},${lat},${lon});
      way["name"~"동물병원"](around:${radiusMeters},${lat},${lon});
      relation["name"~"동물병원"](around:${radiusMeters},${lat},${lon});
    );
    out center;`;
}

function fetchHospitals(lat, lon, radiusKm, label = '선택 위치') {
  if (!map) return;
  const radiusMeters = Math.max(500, radiusKm * 1000);
  setStatus('주변 병원 정보를 불러오는 중...');
  markerLayer?.clearLayers();
  markerRefs = [];

  const centerMarker = L.circleMarker([lat, lon], { radius: 8, color: '#ff6fa5' }).addTo(markerLayer);
  if (label) centerMarker.bindPopup(label);

  fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: buildHospitalQuery(lat, lon, radiusMeters),
  })
    .then(res => res.json())
    .then(json => {
      const elements = json.elements || [];
      if (!elements.length) {
        setStatus('검색된 병원이 없습니다. 반경을 넓혀보세요.');
        renderHospitalList([]);
        return;
      }
      const list = elements.map(el => {
        const point = el.center || el;
        const tags = el.tags || {};
        const name = tags.name || '병원 이름 없음';
        const address = formatAddress(tags);
        const phone = tags.phone || tags['contact:phone'] || '';
        const distance = kmDistance(lat, lon, point.lat, point.lon);
        return { name, address, phone, lat: point.lat, lon: point.lon, distance };
      }).sort((a, b) => a.distance - b.distance);

      list.forEach(item => {
        const marker = L.marker([item.lat, item.lon]).addTo(markerLayer)
          .bindPopup(`<strong>${item.name}</strong><br>${item.address}${item.phone ? `<br>${item.phone}` : ''}`);
        markerRefs.push(marker);
      });

      setStatus(`반경 ${radiusKm}km 내 병원 ${list.length}곳을 찾았습니다.`);
      renderHospitalList(list);
    })
    .catch(() => {
      setStatus('병원 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
      renderHospitalList([]);
    });
}

function moveAndLoad(lat, lon, label = '선택 위치') {
  if (!map) return;
  currentCenter = { lat, lon, label };
  map.setView([lat, lon], 14);
  const radiusKm = Number(radiusInput?.value || 4);
  fetchHospitals(lat, lon, radiusKm, label);
  setTimeout(() => {
    map?.invalidateSize();
  }, 100);
}

function requestGeolocation() {
  if (!navigator.geolocation) {
    setStatus('브라우저에서 위치 접근을 지원하지 않습니다. 주소 검색을 사용하세요.');
    moveAndLoad(fallbackCenter.lat, fallbackCenter.lng, fallbackCenter.label);
    return;
  }
  setStatus('현재 위치를 불러오는 중...');
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      moveAndLoad(latitude, longitude, '현재 위치');
    },
    () => {
      setStatus('위치 권한이 거부되어 기본 위치로 전환합니다.');
      moveAndLoad(fallbackCenter.lat, fallbackCenter.lng, fallbackCenter.label);
    }
  );
}

function handleSearchLocation() {
  const q = locationInput?.value.trim();
  if (!q) {
    setStatus('검색어를 입력해주세요.');
    return;
  }
  setStatus('주소를 찾는 중...');
  fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`)
    .then(res => res.json())
    .then(results => {
      if (!results.length) {
        setStatus('입력한 주소를 찾을 수 없어요.');
        return;
      }
      const { lat, lon, display_name } = results[0];
      moveAndLoad(parseFloat(lat), parseFloat(lon), display_name);
      setStatus(`"${display_name}" 주변 병원을 찾는 중...`);
    })
    .catch(() => setStatus('주소 검색 중 오류가 발생했습니다.'));
}

function initMap() {
  if (typeof L === 'undefined') {
    setStatus('지도를 불러오지 못했어요. 새로고침 후 다시 시도해주세요.');
    return;
  }
  map = L.map('mapContainer', { zoomControl: false }).setView([fallbackCenter.lat, fallbackCenter.lng], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  markerLayer = L.layerGroup().addTo(map);

  radiusInput?.addEventListener('input', () => {
    radiusValue.textContent = radiusInput.value;
    if (currentCenter) fetchHospitals(currentCenter.lat, currentCenter.lng, Number(radiusInput.value));
  });
  locateBtn?.addEventListener('click', requestGeolocation);
  searchLocationBtn?.addEventListener('click', handleSearchLocation);
  locationInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchLocation();
    }
  });

  requestGeolocation();
}

// Shop
function renderProducts(list) {
  productGrid.innerHTML = '';
  list.forEach(item => {
    const card = document.createElement('article');
    card.className = 'product';
    card.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <span class="tag">${item.tag}</span>
      <h3>${item.name}</h3>
      <p class="price">${item.price.toLocaleString()}원</p>
      <button class="btn ghost pill" type="button">장바구니 담기</button>
    `;
    const actionBtn = card.querySelector('button');
    actionBtn.addEventListener('click', () => {
      actionBtn.textContent = '담겼어요';
      actionBtn.disabled = true;
    });
    productGrid.appendChild(card);
  });
}

shuffleShopBtn?.addEventListener('click', () => {
  const shuffled = [...sampleProducts].sort(() => Math.random() - 0.5);
  renderProducts(shuffled);
});

function activateSection(targetId) {
  if (!targetId) return;
  sections.forEach(sec => sec.classList.toggle('active', sec.id === targetId));
  navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.target === targetId));
  document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (targetId === 'map' && map) {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }
}

function init() {
  renderReports();
  renderMessages();
  renderProducts(sampleProducts);
  initMap();

  navButtons.forEach(btn => btn.addEventListener('click', () => activateSection(btn.dataset.target)));
  navLinks.forEach(btn => btn.addEventListener('click', () => activateSection(btn.dataset.target)));

  window.addEventListener('hashchange', () => {
    const id = location.hash.replace('#', '');
    if (id) activateSection(id);
  });

  const initial = location.hash.replace('#', '');
  if (initial) activateSection(initial);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
