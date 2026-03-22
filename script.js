(function() {
  // Supabase Configuration
  const SUPABASE_URL = 'https://spopgxbmsjwosmqsdyzs.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3BneGJtc2p3b3NtcXNkeXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1OTE0NTgsImV4cCI6MjA4OTE2NzQ1OH0.lNwaLDQXwhWIkPX_u5Jm3O-pe9OUAlTkT2Tcog86n3w';

  // Initialize Supabase with a unique name to avoid clashing with the library
  const sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Global Variables within this scope
  let reportForm, messageForm, reportList, messageList, photoInput, photoPreview;
  let clearReportsBtn, clearMessagesBtn, productGrid, shuffleShopBtn, mapStatus;
  let locateBtn, searchLocationBtn, locationInput, radiusInput, radiusValue;
  let hospitalList, navButtons, navLinks, sections;
  let map, markerLayer;

  const sampleProducts = [
    { name: '넥밴드 LED 목줄', price: 32000, tag: '야간산책', img: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=80' },
    { name: '동결건조 간식팩', price: 18000, tag: '간식', img: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80' },
    { name: '러버 슬로우볼', price: 27000, tag: '장난감', img: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=600&q=80' },
    { name: '반려인 응급키트', price: 12000, tag: '응급', img: 'https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&w=600&q=80' },
    { name: '케어 펫매트', price: 21000, tag: '위생', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80' },
    { name: '하네스 세트', price: 24000, tag: '산책', img: 'https://images.unsplash.com/photo-1612837017391-39c19f5041f4?auto=format&fit=crop&w=600&q=80' }
  ];

  function formatTime(ts) {
    if (!ts) return '';
    return new Intl.DateTimeFormat('ko', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(ts));
  }

  // --- Supabase Data Logic ---

  async function fetchReports() {
    const { data, error } = await sbClient
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
      return;
    }
    renderReportsList(data);
  }

  function renderReportsList(reports) {
    if (!reportList) return;
    reportList.innerHTML = '';
    if (!reports || !reports.length) {
      reportList.innerHTML = '<p class="hint">아직 제보가 없습니다.</p>';
      return;
    }

    reports.forEach((item, idx) => {
      const card = document.createElement('article');
      card.className = 'report-card';
      card.dataset.index = idx;
      card.innerHTML = `
        <div class="report-card__thumb">${item.photo ? `<img src="${item.photo}" alt="${item.name}">` : '<span>IMG</span>'}</div>
        <div class="report-card__info">
          <div class="chip">${item.type}</div>
          <h3>${item.name}</h3>
          <p class="report-card__meta">마지막 위치: ${item.last_seen || item.lastSeen}</p>
        </div>
      `;
      card._reportData = { 
          name: item.name, 
          type: item.type, 
          lastSeen: item.last_seen || item.lastSeen, 
          photo: item.photo,
          contact: item.contact,
          features: item.features,
          createdAt: item.created_at
      };
      reportList.appendChild(card);
    });
  }

  async function fetchMessages() {
    const { data, error } = await sbClient
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }
    renderMessagesList(data);
  }

  function renderMessagesList(messages) {
    if (!messageList) return;
    messageList.innerHTML = '';
    if (!messages || !messages.length) {
      messageList.innerHTML = '<p class="hint">첫 메시지를 남겨보세요.</p>';
      return;
    }

    messages.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'message';
      li.innerHTML = `
        <div class="avatar">${(item.nickname || '익명').slice(0, 2).toUpperCase()}</div>
        <div class="message__body">
          <strong>${item.nickname}</strong>
          <p class="message__meta">${formatTime(item.created_at)}</p>
          <p>${item.text}</p>
        </div>
      `;
      messageList.appendChild(li);
    });
  }

  // Subscribe to Realtime changes
  sbClient
    .channel('public:reports')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports' }, payload => {
      fetchReports();
    })
    .subscribe();

  sbClient
    .channel('public:messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
      fetchMessages();
    })
    .subscribe();

  // --- Forms Submission ---

  async function handleReportSubmit(e) {
    e.preventDefault();
    const data = new FormData(reportForm);
    const entry = {
      name: data.get('name') || '',
      type: data.get('type') || '기타',
      last_seen: data.get('lastSeen') || '',
      contact: data.get('contact') || '',
      features: data.get('features') || '',
      photo: photoPreview.dataset.src || '',
    };

    const { error } = await sbClient.from('reports').insert([entry]);
    if (error) {
      console.error('Error adding report:', error);
      alert('제보 등록에 실패했습니다.');
    } else {
      reportForm.reset();
      photoPreview.innerHTML = '사진을 선택해주세요';
      delete photoPreview.dataset.src;
    }
  }

  async function handleMessageSubmit(e) {
    e.preventDefault();
    const data = new FormData(messageForm);
    const entry = {
      nickname: data.get('nickname') || '익명',
      text: data.get('text') || '',
    };

    const { error } = await sbClient.from('messages').insert([entry]);
    if (error) {
      console.error('Error adding message:', error);
      alert('메시지 전송에 실패했습니다.');
    } else {
      messageForm.reset();
    }
  }

  // --- Map Logic ---

  function setMapStatus(text) {
    if (mapStatus) mapStatus.textContent = text;
  }

  function renderHospitalList(items) {
    if (!hospitalList) return;
    hospitalList.innerHTML = '';
    if (!items.length) {
      hospitalList.innerHTML = '<p class="hint">주변에서 동물병원을 찾지 못했어요. 반경을 넓히거나 다른 위치를 검색해보세요.</p>';
      return;
    }

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'map-card';
      card.innerHTML = `
        <div class="map-card__info">
          <p class="map-card__name">${item.name}</p>
          <p class="map-card__meta">${item.address}</p>
          ${item.phone ? `<p class="map-card__meta">☎ ${item.phone}</p>` : ''}
        </div>
        <div class="map-card__distance">${item.distance.toFixed(1)} km</div>
      `;
      card.addEventListener('click', () => {
        map?.setView([item.lat, item.lon], 15);
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
    setMapStatus(`${label} 주변 검색 중...`);
    markerLayer.clearLayers();
    const radiusMeters = radiusKm * 1000;
    
    fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: buildHospitalQuery(lat, lon, radiusMeters),
    })
      .then(r => r.json())
      .then(data => {
        const elements = data.elements || [];
        if (elements.length === 0) {
          setMapStatus('주변 병원을 찾을 수 없습니다.');
          renderHospitalList([]);
          return;
        }
        const list = elements.map(el => {
          const pos = el.center || { lat: el.lat, lon: el.lon };
          const name = el.tags.name || '이름 없는 동물병원';
          const address = el.tags['addr:full'] || el.tags['addr:street'] || '주소 정보 없음';
          const phone = el.tags.phone || el.tags['contact:phone'] || '';
          const dist = Math.sqrt(Math.pow(pos.lat - lat, 2) + Math.pow(pos.lon - lon, 2)) * 111;
          L.marker([pos.lat, pos.lon]).addTo(markerLayer).bindPopup(`<strong>${name}</strong><br>${address}<br>${phone}`);
          return { name, address, phone, distance: dist, lat: pos.lat, lon: pos.lon };
        }).sort((a, b) => a.distance - b.distance);
        setMapStatus(`근처 동물병원 ${list.length}곳을 찾았습니다.`);
        renderHospitalList(list);
      })
      .catch(err => {
        console.error(err);
        setMapStatus('병원 정보를 가져오는데 실패했습니다.');
        renderHospitalList([]);
      });
  }

  function initMap() {
    const fallbackCenter = { lat: 37.5665, lng: 126.9780 };
    const container = document.getElementById('mapContainer');
    if (!container) return;
    map = L.map('mapContainer', { zoomControl: false }).setView([fallbackCenter.lat, fallbackCenter.lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    markerLayer = L.layerGroup().addTo(map);

    radiusInput?.addEventListener('input', (e) => {
      if (radiusValue) radiusValue.textContent = e.target.value;
    });

    locateBtn?.addEventListener('click', () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          map.setView([latitude, longitude], 14);
          L.circleMarker([latitude, longitude], { radius: 10, color: '#ff6fa5' }).addTo(map).bindPopup('내 위치');
          fetchHospitals(latitude, longitude, Number(radiusInput.value), '내 위치');
        },
        () => alert('위치 권한을 허용해 주세요.')
      );
    });

    searchLocationBtn?.addEventListener('click', () => {
      const q = locationInput.value.trim();
      if (!q) return;
      fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`)
        .then(r => r.json())
        .then(data => {
          if (!data.length) return alert('검색 결과가 없습니다.');
          const { lat, lon } = data[0];
          const flat = parseFloat(lat);
          const flon = parseFloat(lon);
          map.setView([flat, flon], 14);
          fetchHospitals(flat, flon, Number(radiusInput.value), q);
        });
    });

    fetchHospitals(fallbackCenter.lat, fallbackCenter.lng, 4, '서울');
  }

  // --- Shop Logic ---
  async function fetchProducts() {
    const { data, error } = await sbClient.from('products').select('*').order('id', { ascending: true });
    if (error || !data || !data.length) {
      renderProducts(sampleProducts);
    } else {
      renderProducts(data);
    }
  }

  function renderProducts(list) {
    if (!productGrid) return;
    productGrid.innerHTML = '';
    list.forEach(item => {
      const card = document.createElement('article');
      card.className = 'product';
      card.innerHTML = `
        <img src="${item.img}" alt="${item.name}">
        <span class="tag">${item.tag}</span>
        <h3>${item.name}</h3>
        <p class="price">${item.price.toLocaleString()}원</p>
        <button class="btn ghost pill" type="button">위시 담기</button>
      `;
      productGrid.appendChild(card);
    });
  }

  // --- UI Logic ---

  function activateSection(targetId) {
    if (!targetId || !sections) return;
    sections.forEach(sec => sec.classList.toggle('active', sec.id === targetId));
    navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.target === targetId));
    
    // 지도가 포함된 섹션일 경우 크기 재계산 (매우 중요)
    if (targetId === 'map' && map) {
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }
  }

  // Initialize everything after DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    // Select all elements
    reportForm = document.getElementById('reportForm');
    messageForm = document.getElementById('messageForm');
    reportList = document.getElementById('reportList');
    messageList = document.getElementById('messageList');
    photoInput = document.getElementById('photoInput');
    photoPreview = document.getElementById('photoPreview');
    clearReportsBtn = document.getElementById('clearReports');
    clearMessagesBtn = document.getElementById('clearMessages');
    productGrid = document.getElementById('productGrid');
    shuffleShopBtn = document.getElementById('shuffleShop');
    mapStatus = document.getElementById('mapStatus');
    locateBtn = document.getElementById('locateMe');
    searchLocationBtn = document.getElementById('searchLocation');
    locationInput = document.getElementById('locationInput');
    radiusInput = document.getElementById('radiusInput');
    radiusValue = document.getElementById('radiusValue');
    hospitalList = document.getElementById('hospitalList');
    navButtons = document.querySelectorAll('.cat-btn, .nav-link, .hero__actions .btn');
    navLinks = document.querySelectorAll('.footer__links a');
    sections = document.querySelectorAll('.section');

    // Init sub-modules
    initMap();
    fetchReports();
    fetchMessages();
    fetchProducts();

    // Event Listeners
    reportForm?.addEventListener('submit', handleReportSubmit);
    messageForm?.addEventListener('submit', handleMessageSubmit);
    
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        if (target) activateSection(target);
      });
    });

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          activateSection(href.substring(1));
        }
      });
    });

    shuffleShopBtn?.addEventListener('click', () => renderProducts([...sampleProducts].sort(() => Math.random() - 0.5)));

    photoInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        photoPreview.innerHTML = `<img src="${reader.result}" alt="preview">`;
        photoPreview.dataset.src = reader.result;
      };
      reader.readAsDataURL(file);
    });

    // Modal close handlers
    const modalClose = document.querySelector('.modal__close');
    const modalBackdrop = document.querySelector('.modal__backdrop');
    modalClose?.addEventListener('click', () => document.getElementById('detailModal')?.classList.add('hidden'));
    modalBackdrop?.addEventListener('click', () => document.getElementById('detailModal')?.classList.add('hidden'));
  });
})();
