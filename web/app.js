// ==============================================================================
// DUMPY Mobile Web Uploader — Controller with Floating Action Buttons & Batch Beam
// Pure Cryptographic Room Architecture with Anonymous Device Tracking
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

  // Generate or retrieve anonymous device ID
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
    config: window.getSupabaseConfig ? window.getSupabaseConfig() : {},
    uploadQueue: [],
    recentUploads: []
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

  // Read natural image dimensions
  function getImageDimensions(file) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth || 0, height: img.naturalHeight || 0, previewUrl: url });
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0, previewUrl: url });
      };
      img.src = url;
    });
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

  // Direct Supabase Storage + Database Upload
  async function uploadScreenshot(fileItem) {
    const { file, id } = fileItem;
    const config = window.getSupabaseConfig();
    const itemCard = document.getElementById(`upload-${id}`);
    const progressBar = itemCard ? itemCard.querySelector('.progress-bar') : null;
    const statusBadge = itemCard ? itemCard.querySelector('.queue-status-badge') : null;

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
      
      if (progressBar) progressBar.style.width = '35%';

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
          throw new Error(`Storage bucket MIME restriction: ${parsedMessage}. Update bucket allowed_mime_types in Supabase.`);
        }
        throw new Error(`Storage upload failed (${uploadResponse.status}): ${parsedMessage}`);
      }

      if (progressBar) progressBar.style.width = '75%';

      // 2. Public CDN link
      const publicUrl = `${config.url}/storage/v1/object/public/${config.bucket}/${storagePath}`;

      // 3. Insert metadata record into `dumpy_screenshots` table
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
      if (state.deviceId) {
        recordPayload.device_id = state.deviceId;
      }

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

      // Smart fallback: if table schema cache is missing device_id or other optional columns, retry without it
      if (!dbResponse.ok && recordPayload.device_id) {
        const errorCopy = await dbResponse.clone().text();
        if (errorCopy.includes('device_id') || errorCopy.includes('PGRST204')) {
          delete recordPayload.device_id;
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
      }

      if (!dbResponse.ok) {
        const dbErrText = await dbResponse.text();
        throw new Error(`Database record failed: ${dbErrText}`);
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

  // Handle incoming file list (Single & Multiple Selection)
  async function handleFiles(fileList) {
    if (!fileList || fileList.length === 0) return;

    const validFiles = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    if (el.queueSection) el.queueSection.style.display = 'block';

    state.uploadQueue.push(...validFiles);
    if (el.queueCountBadge) {
      el.queueCountBadge.textContent = `${state.uploadQueue.length} file${state.uploadQueue.length > 1 ? 's' : ''}`;
    }

    const uploadPromises = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const fileId = 'f_' + Math.random().toString(36).substring(2, 9);
      const dimensions = await getImageDimensions(file);

      const fileItem = {
        id: fileId,
        file: file,
        width: dimensions.width,
        height: dimensions.height,
        previewUrl: dimensions.previewUrl
      };

      const card = document.createElement('div');
      card.className = 'queue-card';
      card.id = `upload-${fileId}`;

      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      const dimStr = dimensions.width && dimensions.height ? `${dimensions.width}×${dimensions.height}` : 'Image';

      card.innerHTML = `
        <img src="${dimensions.previewUrl}" class="queue-thumb" alt="Preview" />
        <div class="queue-info">
          <div class="queue-filename" title="${file.name}">${file.name}</div>
          <div class="queue-meta">
            <span>${dimStr}</span>
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
      uploadPromises.push(uploadScreenshot(fileItem));
    }

    await Promise.allSettled(uploadPromises);
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

  // 4. Room Code Click to Copy (No 'Room' or 'ID' label)
  if (el.roomCodeDisplay) {
    el.roomCodeDisplay.addEventListener('click', () => {
      navigator.clipboard.writeText(state.roomId).then(() => {
        showToast(`📋 Copied ${state.roomId}`);
      }).catch(() => {
        showToast(`${state.roomId}`);
      });
    });
  }

  // 5. Clear Activity Button
  if (el.btnClearQueue) {
    el.btnClearQueue.addEventListener('click', () => {
      state.uploadQueue = [];
      if (el.queueList) el.queueList.innerHTML = '';
      if (el.queueSection) el.queueSection.style.display = 'none';
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
})(window);