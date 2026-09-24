// ==============================================================================
// DUMPY Mobile Web Uploader — Controller with Fast Multi-Upload & Visitor Tracking
// Pure Cryptographic Room Architecture with Deduplicated Device & IP Logging
// ==============================================================================

(function(global) {
  'use strict';

  // Safe Storage helper
  const safeStorage = window.safeStorage || {
    getItem: function(key) {
      try { return window.localStorage ? window.localStorage.getItem(key) : null; } catch(e) { return null; }
    },
    setItem: function(key, val) {
      try { if (window.localStorage) window.localStorage.setItem(key, val); } catch(e) {}
    },
    removeItem: function(key) {
      try { if (window.localStorage) window.localStorage.removeItem(key); } catch(e) {}
    }
  };

  // Generate or retrieve anonymous persistent device ID
  function getDeviceId() {
    let deviceId = safeStorage.getItem('dumpy_device_id');
    if (!deviceId) {
      deviceId = 'DEV-' + 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }).toUpperCase();
      safeStorage.setItem('dumpy_device_id', deviceId);
    }
    return deviceId;
  }

  // State
  const state = {
    roomId: '',
    deviceId: getDeviceId(),
    clientIp: null,
    visitorId: safeStorage.getItem('dumpy_visitor_id') || null,
    visitorPromise: null,
    config: window.getSupabaseConfig ? window.getSupabaseConfig() : {},
    uploadQueue: []
  };

  // DOM Elements
  const el = {
    roomCodeDisplay: document.getElementById('roomCodeDisplay'),
    roomCodeText: document.getElementById('roomCodeText'),
    
    uploadCard: document.getElementById('uploadCard'),
    fileInput: document.getElementById('fileInput'),
    cameraInput: document.getElementById('cameraInput'),
    btnCamera: document.getElementById('btnCamera'),
    btnGallery: document.getElementById('btnGallery'),
    
    queueSection: document.getElementById('queueSection'),
    queueList: document.getElementById('queueList'),
    queueCountBadge: document.getElementById('queueCountBadge'),
    btnClearQueue: document.getElementById('btnClearQueue'),
    
    toastBar: document.getElementById('toastBar'),
    toastText: document.getElementById('toastText')
  };

  // Extract Room ID from URL query param `?room=XYZ` or safeStorage
  function initRoomId() {
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get('room');

    if (roomFromUrl && roomFromUrl.trim()) {
      state.roomId = roomFromUrl.trim().toUpperCase();
      safeStorage.setItem('dumpy_active_room', state.roomId);
    } else {
      const savedRoom = safeStorage.getItem('dumpy_active_room');
      if (savedRoom) {
        state.roomId = savedRoom;
      } else {
        state.roomId = 'DMP-' + 'XXXXXXXX'.replace(/X/g, () => '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 32)]);
        safeStorage.setItem('dumpy_active_room', state.roomId);
      }
    }

    if (el.roomCodeText) {
      el.roomCodeText.textContent = state.roomId;
    }
  }

  // Fast Multi-Source Client IP Resolver (Parallel Race under 150ms)
  async function resolveClientIp() {
    if (state.clientIp && !state.clientIp.startsWith('client-')) return state.clientIp;

    const resolvers = [
      fetch('https://icanhazip.com', { signal: AbortSignal.timeout(3000) }).then(r => r.text()).then(t => t.trim()),
      fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) }).then(r => r.json()).then(j => j.ip),
      fetch('https://api64.ipify.org?format=json', { signal: AbortSignal.timeout(3000) }).then(r => r.json()).then(j => j.ip),
      fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) }).then(r => r.json()).then(j => j.ip)
    ];

    try {
      const ip = await Promise.any(resolvers);
      if (ip && typeof ip === 'string' && ip.length > 3) {
        state.clientIp = ip;
        return ip;
      }
    } catch (e) {}

    // Fallback if all external resolvers are blocked
    state.clientIp = 'client-' + state.deviceId;
    return state.clientIp;
  }

  // Bulletproof Visitor Record & Deduplication
  // Ensures 1 row per device regardless of how many QR codes or rooms are scanned
  async function recordVisitor() {
    try {
      const ip = await resolveClientIp();
      const config = window.getSupabaseConfig();
      if (!config.url || !config.key) return null;

      // 1. Try to find existing visitor record by persistent device_id or saved visitor_id
      const queryParam = state.visitorId 
        ? `id=eq.${state.visitorId}` 
        : `device_id=eq.${encodeURIComponent(state.deviceId)}`;

      const checkRes = await fetch(`${config.url}/rest/v1/dumpy_visitors?${queryParam}&order=last_seen.desc&limit=1`, {
        headers: { 'apikey': config.key, 'Authorization': `Bearer ${config.key}` }
      });

      if (checkRes.ok) {
        const rows = await checkRes.json();
        if (rows && rows.length > 0) {
          const v = rows[0];
          state.visitorId = v.id;
          safeStorage.setItem('dumpy_visitor_id', v.id);

          // Update existing visitor timestamp & IP (No duplicates created!)
          fetch(`${config.url}/rest/v1/dumpy_visitors?id=eq.${v.id}`, {
            method: 'PATCH',
            headers: {
              'apikey': config.key,
              'Authorization': `Bearer ${config.key}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              last_seen: new Date().toISOString(),
              visit_count: (v.visit_count || 1) + 1,
              ip_address: (ip && !ip.startsWith('client-')) ? ip : v.ip_address,
              user_agent: navigator.userAgent || v.user_agent
            })
          }).catch(() => {});

          return state.visitorId;
        }
      }

      // 2. If no record exists for this device yet, create initial visitor record
      const visitorPayload = {
        device_id: state.deviceId,
        ip_address: ip || 'unknown',
        user_agent: navigator.userAgent || 'Mobile Web',
        last_seen: new Date().toISOString(),
        visit_count: 1
      };

      const createRes = await fetch(`${config.url}/rest/v1/dumpy_visitors`, {
        method: 'POST',
        headers: {
          'apikey': config.key,
          'Authorization': `Bearer ${config.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(visitorPayload)
      });

      if (createRes.ok) {
        const newRows = await createRes.json();
        if (newRows && newRows[0] && newRows[0].id) {
          state.visitorId = newRows[0].id;
          safeStorage.setItem('dumpy_visitor_id', state.visitorId);
          return state.visitorId;
        }
      }
    } catch (e) {
      console.warn('Visitor deduplication tracking:', e);
    }
    return null;
  }

  // Start visitor tracking on page launch
  function initVisitorTracking() {
    state.visitorPromise = recordVisitor();
  }

  // Show Toast
  function showToast(msg, duration = 2400) {
    if (!el.toastBar || !el.toastText) return;
    el.toastText.textContent = msg;
    el.toastBar.classList.add('active');
    setTimeout(() => el.toastBar.classList.remove('active'), duration);
  }

  // Tactile haptic vibration for mobile devices
  function triggerHaptic() {
    if (navigator.vibrate) {
      try { navigator.vibrate(30); } catch (e) {}
    }
  }

  // Resolve clean MIME type for any file format
  function getEffectiveMimeType(file) {
    if (file.type && file.type.trim() !== '') {
      return file.type;
    }
    const ext = (file.name || '').split('.').pop().toLowerCase();
    const mimeMap = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      heic: 'image/heic',
      heif: 'image/heif',
      avif: 'image/avif',
      bmp: 'image/bmp',
      ico: 'image/x-icon',
      tiff: 'image/tiff',
      tif: 'image/tiff'
    };
    return mimeMap[ext] || 'image/png';
  }

  // High-Speed Direct Supabase Storage + Database Upload
  async function uploadScreenshot(fileItem) {
    const { file, id, cardEl } = fileItem;
    const config = window.getSupabaseConfig();
    const progressBar = cardEl ? cardEl.querySelector('.progress-bar') : null;
    const statusBadge = cardEl ? cardEl.querySelector('.queue-status-badge') : null;

    if (!config.url || !config.key) {
      if (statusBadge) {
        statusBadge.className = 'queue-status-badge status-error';
        statusBadge.innerHTML = '⚠️ Credentials missing';
      }
      showToast('Missing Supabase credentials');
      return;
    }

    try {
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `${encodeURIComponent(state.roomId)}/${timestamp}_${sanitizedName}`;
      const mimeType = getEffectiveMimeType(file);
      
      if (progressBar) progressBar.style.width = '40%';

      // 1. Upload to Supabase Storage via REST API
      const uploadUrl = `${config.url}/storage/v1/object/${config.bucket}/${storagePath}`;
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'apikey': config.key,
          'Authorization': `Bearer ${config.key}`,
          'Content-Type': mimeType,
          'x-upsert': 'true'
        },
        body: file
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        let parsedMessage = errorText;
        try {
          const jsonErr = JSON.parse(errorText);
          if (jsonErr.message) parsedMessage = jsonErr.message;
        } catch (e) {}

        if (parsedMessage.includes('mime type') || parsedMessage.includes('invalid_mime_type')) {
          throw new Error(`Storage bucket MIME restriction: ${parsedMessage}`);
        }
        throw new Error(`Storage upload failed (${uploadResponse.status}): ${parsedMessage}`);
      }

      if (progressBar) progressBar.style.width = '80%';

      // 2. Ensure visitor record is ready
      if (!state.visitorId && state.visitorPromise) {
        try { await state.visitorPromise; } catch(e) {}
      }

      // 3. Public CDN link
      const publicUrl = `${config.url}/storage/v1/object/public/${config.bucket}/${storagePath}`;

      // 4. Insert metadata record into `dumpy_screenshots` table
      const insertUrl = `${config.url}/rest/v1/dumpy_screenshots`;
      const recordPayload = {
        room_id: state.roomId,
        file_name: file.name,
        file_url: publicUrl,
        storage_path: storagePath,
        file_size: file.size,
        mime_type: mimeType,
        is_inserted: false
      };

      if (state.deviceId) recordPayload.device_id = state.deviceId;
      if (state.clientIp && !state.clientIp.startsWith('client-')) recordPayload.client_ip = state.clientIp;
      if (state.visitorId) recordPayload.visitor_id = state.visitorId;

      let dbResponse = await fetch(insertUrl, {
        method: 'POST',
        headers: {
          'apikey': config.key,
          'Authorization': `Bearer ${config.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(recordPayload)
      });

      // Smart fallback: if table schema cache is missing newer columns (visitor_id, device_id), retry cleanly
      if (!dbResponse.ok) {
        const errText = await dbResponse.text();
        let needsRetry = false;
        if (errText.includes('visitor_id') && recordPayload.visitor_id) {
          delete recordPayload.visitor_id;
          needsRetry = true;
        }
        if (errText.includes('device_id') && recordPayload.device_id) {
          delete recordPayload.device_id;
          needsRetry = true;
        }
        if (errText.includes('client_ip') && recordPayload.client_ip) {
          delete recordPayload.client_ip;
          needsRetry = true;
        }

        if (needsRetry) {
          dbResponse = await fetch(insertUrl, {
            method: 'POST',
            headers: {
              'apikey': config.key,
              'Authorization': `Bearer ${config.key}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(recordPayload)
          });
        }

        if (!dbResponse.ok) {
          throw new Error(`Database record failed: ${await dbResponse.text()}`);
        }
      }

      if (progressBar) progressBar.style.width = '100%';

      if (statusBadge) {
        statusBadge.className = 'queue-status-badge status-success';
        statusBadge.innerHTML = '✓ In Figma';
      }

      triggerHaptic();
      showToast(`⚡ Beamed "${file.name}" to Figma!`);

    } catch (err) {
      console.error('Upload failed:', err);
      if (statusBadge) {
        statusBadge.className = 'queue-status-badge status-error';
        statusBadge.innerHTML = '✕ Upload failed';
      }
      showToast(`Upload error: ${err.message}`);
    }
  }

  // Handle incoming file list (Ultra-Fast Concurrent Batch Upload)
  async function handleFiles(fileList) {
    if (!fileList || fileList.length === 0) return;

    const validFiles = Array.from(fileList).filter(f => f.type.startsWith('image/') || f.name.match(/\.(png|jpe?g|webp|gif|svg|heic|heif|avif|bmp)$/i));
    if (validFiles.length === 0) return;

    // HIDE Empty State Dropzone & SHOW Upload Activity
    if (el.uploadCard) el.uploadCard.style.display = 'none';
    if (el.queueSection) el.queueSection.style.display = 'block';

    state.uploadQueue.push(...validFiles);
    if (el.queueCountBadge) {
      el.queueCountBadge.textContent = `${state.uploadQueue.length} file${state.uploadQueue.length > 1 ? 's' : ''}`;
    }

    const uploadItems = [];

    // Instant UI card instantiation without blocking for image decode
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const fileId = 'f_' + Math.random().toString(36).substring(2, 9);
      const previewUrl = URL.createObjectURL(file);

      const card = document.createElement('div');
      card.className = 'queue-card';
      card.id = `upload-${fileId}`;

      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

      card.innerHTML = `
        <img src="${previewUrl}" class="queue-thumb" alt="Preview" />
        <div class="queue-info">
          <div class="queue-filename" title="${file.name}">${file.name}</div>
          <div class="queue-meta">
            <span class="dim-text">Image</span>
            <span>•</span>
            <span>${sizeStr}</span>
          </div>
          <div class="progress-track">
            <div class="progress-bar"></div>
          </div>
        </div>
        <div class="queue-status-badge status-uploading">
          <svg class="icon" style="width:14px; height:14px; animation: pulse 1s infinite;" viewBox="0 0 24 24">
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Beaming...
        </div>
      `;

      if (el.queueList) el.queueList.prepend(card);

      // Async dimension resolution in background
      const img = new Image();
      img.onload = () => {
        const dimEl = card.querySelector('.dim-text');
        if (dimEl && img.naturalWidth && img.naturalHeight) {
          dimEl.textContent = `${img.naturalWidth}×${img.naturalHeight}`;
        }
      };
      img.src = previewUrl;

      uploadItems.push({
        id: fileId,
        file: file,
        cardEl: card
      });
    }

    // Launch all uploads concurrently in parallel
    await Promise.allSettled(uploadItems.map(item => uploadScreenshot(item)));
  }

  // Event Listeners

  // 1. Hero Dropzone Tap -> Opens Gallery / Photo Library
  if (el.uploadCard) {
    el.uploadCard.addEventListener('click', () => {
      triggerHaptic();
      if (el.fileInput) el.fileInput.click();
    });

    // Drag & Drop
    el.uploadCard.addEventListener('dragover', (e) => {
      e.preventDefault();
      el.uploadCard.classList.add('drag-over');
      const titleEl = el.uploadCard.querySelector('.empty-headline');
      if (titleEl) titleEl.textContent = 'Drop Screenshots Here';
    });

    el.uploadCard.addEventListener('dragleave', () => {
      el.uploadCard.classList.remove('drag-over');
      const titleEl = el.uploadCard.querySelector('.empty-headline');
      if (titleEl) titleEl.textContent = 'Drop screenshots here';
    });

    el.uploadCard.addEventListener('drop', (e) => {
      e.preventDefault();
      el.uploadCard.classList.remove('drag-over');
      const titleEl = el.uploadCard.querySelector('.empty-headline');
      if (titleEl) titleEl.textContent = 'Drop screenshots here';
      if (e.dataTransfer && e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
        showToast(`Processing ${e.dataTransfer.files.length} screenshot(s)`);
      }
    });
  }

  // 2. Hidden File Inputs change events
  if (el.fileInput) {
    el.fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
      e.target.value = '';
    });
  }

  if (el.cameraInput) {
    el.cameraInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
      e.target.value = '';
    });
  }

  // 3. Floating Action Buttons (FABs)
  if (el.btnCamera) {
    el.btnCamera.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerHaptic();
      if (el.cameraInput) el.cameraInput.click();
    });
  }

  if (el.btnGallery) {
    el.btnGallery.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerHaptic();
      if (el.fileInput) el.fileInput.click();
    });
  }

  // 4. Room Code Click to Copy
  if (el.roomCodeDisplay) {
    el.roomCodeDisplay.addEventListener('click', () => {
      navigator.clipboard.writeText(state.roomId).then(() => {
        showToast(`📋 Copied ${state.roomId}`);
      }).catch(() => {
        showToast(`${state.roomId}`);
      });
    });
  }

  // 5. Clear Activity Button -> Restores Empty State Dropzone
  if (el.btnClearQueue) {
    el.btnClearQueue.addEventListener('click', () => {
      state.uploadQueue = [];
      if (el.queueList) el.queueList.innerHTML = '';
      if (el.queueSection) el.queueSection.style.display = 'none';
      if (el.uploadCard) el.uploadCard.style.display = 'flex';
      if (el.queueCountBadge) el.queueCountBadge.textContent = '0 files';
      showToast('Activity cleared');
    });
  }

  // 6. Clipboard Paste
  window.addEventListener('paste', (e) => {
    if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
      handleFiles(e.clipboardData.files);
      showToast("Pasted screenshot from clipboard");
    }
  });

  // Boot
  initRoomId();
  initVisitorTracking();
})(window);