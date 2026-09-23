// ==============================================================================
// DUMPY Mobile Web Uploader — Controller with Google Auth & Direct Supabase Upload
// ==============================================================================

(function() {
  'use strict';

  // State
  const state = {
    roomId: '',
    config: window.getSupabaseConfig ? window.getSupabaseConfig() : {},
    currentUser: null,
    uploadQueue: [],
    recentUploads: []
  };

  // DOM Elements
  const el = {
    roomCodeDisplay: document.getElementById('roomCodeDisplay'),
    btnChangeRoom: document.getElementById('btnChangeRoom'),
    btnSettings: document.getElementById('btnSettings'),
    uploadCard: document.getElementById('uploadCard'),
    fileInput: document.getElementById('fileInput'),
    cameraInput: document.getElementById('cameraInput'),
    btnCamera: document.getElementById('btnCamera'),
    btnGallery: document.getElementById('btnGallery'),
    queueSection: document.getElementById('queueSection'),
    queueList: document.getElementById('queueList'),
    
    // Auth
    btnGoogleAuth: document.getElementById('btnGoogleAuth'),
    userProfilePill: document.getElementById('userProfilePill'),
    userAvatar: document.getElementById('userAvatar'),
    userName: document.getElementById('userName'),
    btnSignOut: document.getElementById('btnSignOut'),
    
    // Room Modal
    roomModal: document.getElementById('roomModal'),
    btnCloseRoomModal: document.getElementById('btnCloseRoomModal'),
    inputRoomCode: document.getElementById('inputRoomCode'),
    btnSaveRoom: document.getElementById('btnSaveRoom'),
    
    // Settings Modal
    settingsModal: document.getElementById('settingsModal'),
    btnCloseSettings: document.getElementById('btnCloseSettings'),
    inputSupabaseUrl: document.getElementById('inputSupabaseUrl'),
    inputSupabaseKey: document.getElementById('inputSupabaseKey'),
    btnSaveSettings: document.getElementById('btnSaveSettings'),
    
    // Toast
    toastBar: document.getElementById('toastBar'),
    toastText: document.getElementById('toastText')
  };

  // Extract Room ID from URL query param `?room=XYZ` or localStorage
  function initRoomId() {
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get('room');

    if (roomFromUrl && roomFromUrl.trim()) {
      state.roomId = roomFromUrl.trim().toUpperCase();
      localStorage.setItem('dumpy_active_room', state.roomId);
    } else {
      const savedRoom = localStorage.getItem('dumpy_active_room');
      if (savedRoom) {
        state.roomId = savedRoom;
      } else {
        state.roomId = 'DMP-' + Math.random().toString(36).substring(2, 7).toUpperCase();
        localStorage.setItem('dumpy_active_room', state.roomId);
      }
    }

    el.roomCodeDisplay.textContent = state.roomId;
  }

  // Show Toast
  function showToast(msg, duration = 2500) {
    el.toastText.textContent = msg;
    el.toastBar.classList.add('active');
    setTimeout(() => el.toastBar.classList.remove('active'), duration);
  }

  // Trigger light mobile vibration for tactile feedback
  function triggerHaptic() {
    if (navigator.vibrate) {
      try { navigator.vibrate(40); } catch (e) {}
    }
  }

  // Initialize and Check Google OAuth Session
  async function initAuth() {
    const config = window.getSupabaseConfig();
    
    // Check if redirect contains access_token in hash (#access_token=...&refresh_token=...)
    if (window.location.hash && window.location.hash.includes('access_token')) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (accessToken) {
        localStorage.setItem('dumpy_auth_token', accessToken);
        if (refreshToken) localStorage.setItem('dumpy_refresh_token', refreshToken);
        
        // Clean hash from address bar without reload
        const cleanUrl = window.location.pathname + window.location.search;
        window.history.replaceState(null, '', cleanUrl);
        showToast('Signed in with Google!');
      }
    }

    const token = localStorage.getItem('dumpy_auth_token');
    if (token && config.url && config.key) {
      try {
        const res = await fetch(`${config.url}/auth/v1/user`, {
          headers: {
            'apikey': config.key,
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const user = await res.json();
          state.currentUser = user;
          syncUserProfile(user);
          renderAuthUI();
          return;
        } else {
          localStorage.removeItem('dumpy_auth_token');
        }
      } catch (err) {
        console.warn('Auth check failed:', err);
      }
    }

    renderAuthUI();
  }

  // Client-side fallback sync to dumpy_users table
  async function syncUserProfile(user) {
    const config = window.getSupabaseConfig();
    if (!config.url || !config.key || !user) return;
    try {
      const meta = user.user_metadata || {};
      await fetch(`${config.url}/rest/v1/dumpy_users`, {
        method: 'POST',
        headers: {
          'apikey': config.key,
          'Authorization': `Bearer ${config.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          full_name: meta.full_name || meta.name || user.email.split('@')[0],
          avatar_url: meta.avatar_url || meta.picture || ''
        })
      });
    } catch (e) {
      console.warn('User profile sync:', e);
    }
  }

  // Render User Auth Status in Header
  function renderAuthUI() {
    if (state.currentUser) {
      el.btnGoogleAuth.style.display = 'none';
      el.userProfilePill.style.display = 'flex';
      
      const meta = state.currentUser.user_metadata || {};
      const fullName = meta.full_name || meta.name || state.currentUser.email.split('@')[0];
      const avatarUrl = meta.avatar_url || meta.picture || '';

      el.userName.textContent = fullName;
      if (avatarUrl) {
        el.userAvatar.src = avatarUrl;
        el.userAvatar.style.display = 'block';
      } else {
        el.userAvatar.style.display = 'none';
      }
    } else {
      el.btnGoogleAuth.style.display = 'inline-flex';
      el.userProfilePill.style.display = 'none';
    }
  }

  // Sign In with Google
  function signInWithGoogle() {
    const config = window.getSupabaseConfig();
    if (!config.url || !config.key || config.url.includes('your-project')) {
      showToast('Set your Supabase Project URL & Key first in Settings');
      el.settingsModal.classList.add('open');
      return;
    }

    // Redirect to Supabase Google OAuth Provider endpoint
    const redirectUrl = window.location.origin + window.location.pathname + window.location.search;
    const authUrl = `${config.url}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
    window.location.href = authUrl;
  }

  // Sign Out
  function signOut() {
    localStorage.removeItem('dumpy_auth_token');
    localStorage.removeItem('dumpy_refresh_token');
    state.currentUser = null;
    renderAuthUI();
    showToast('Signed out');
  }

  // Helper: Read image dimensions
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
        statusBadge.innerHTML = '⚠️ Set Supabase credentials';
      }
      showToast('Please set your Supabase URL & Key in Settings');
      el.settingsModal.classList.add('open');
      return;
    }

    try {
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `${encodeURIComponent(state.roomId)}/${timestamp}_${sanitizedName}`;
      
      if (progressBar) progressBar.style.width = '30%';

      // 1. Upload to Supabase Storage via REST API
      const authToken = localStorage.getItem('dumpy_auth_token') || config.key;
      const uploadUrl = `${config.url}/storage/v1/object/${config.bucket}/${storagePath}`;
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'apikey': config.key,
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': file.type || 'image/png',
          'x-upsert': 'true'
        },
        body: file
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Storage upload failed (${uploadResponse.status}): ${errorText}`);
      }

      if (progressBar) progressBar.style.width = '70%';

      // 2. Construct public CDN URL
      const publicUrl = `${config.url}/storage/v1/object/public/${config.bucket}/${storagePath}`;

      // 3. Insert metadata record into `dumpy_screenshots` table
      const insertUrl = `${config.url}/rest/v1/dumpy_screenshots`;
      const recordPayload = {
        room_id: state.roomId,
        file_name: file.name,
        file_url: publicUrl,
        storage_path: storagePath,
        file_size: file.size,
        mime_type: file.type || 'image/png',
        is_inserted: false
      };

      if (state.currentUser && state.currentUser.id) {
        recordPayload.user_id = state.currentUser.id;
        recordPayload.user_email = state.currentUser.email;
      }

      const dbResponse = await fetch(insertUrl, {
        method: 'POST',
        headers: {
          'apikey': config.key,
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(recordPayload)
      });

      if (!dbResponse.ok) {
        const dbErrText = await dbResponse.text();
        throw new Error(`Database record failed: ${dbErrText}`);
      }

      if (progressBar) progressBar.style.width = '100%';

      // 4. Update UI to Success
      if (statusBadge) {
        statusBadge.className = 'queue-status-badge status-success';
        statusBadge.innerHTML = `
          <svg class="icon" style="width:14px; height:14px;" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Delivered to Figma
        `;
      }

      triggerHaptic();
      showToast(`⚡ Delivered "${file.name}" to Figma inbox!`);

    } catch (err) {
      console.error('Upload failed:', err);
      if (statusBadge) {
        statusBadge.className = 'queue-status-badge status-error';
        statusBadge.innerHTML = '✕ Upload failed';
      }
      showToast(`Upload error: ${err.message}`);
    }
  }

  // Handle incoming file list
  async function handleFiles(fileList) {
    if (!fileList || fileList.length === 0) return;

    el.queueSection.style.display = 'block';

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.type.startsWith('image/')) continue;

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
          <div class="queue-filename">${file.name}</div>
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

      el.queueList.prepend(card);
      uploadScreenshot(fileItem);
    }
  }

  // Event Listeners
  el.btnGoogleAuth.addEventListener('click', signInWithGoogle);
  el.btnSignOut.addEventListener('click', signOut);

  el.fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
  el.cameraInput.addEventListener('change', (e) => handleFiles(e.target.files));

  el.btnCamera.addEventListener('click', () => el.cameraInput.click());
  el.btnGallery.addEventListener('click', () => el.fileInput.click());

  // Drag & Drop
  el.uploadCard.addEventListener('dragover', (e) => {
    e.preventDefault();
    el.uploadCard.classList.add('drag-over');
  });

  el.uploadCard.addEventListener('dragleave', () => {
    el.uploadCard.classList.remove('drag-over');
  });

  el.uploadCard.addEventListener('drop', (e) => {
    e.preventDefault();
    el.uploadCard.classList.remove('drag-over');
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  });

  // Clipboard Paste
  window.addEventListener('paste', (e) => {
    if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
      handleFiles(e.clipboardData.files);
      showToast("Pasted screenshot from clipboard");
    }
  });

  // Room Switching Modal
  el.btnChangeRoom.addEventListener('click', () => {
    el.inputRoomCode.value = state.roomId;
    el.roomModal.classList.add('open');
  });

  el.btnCloseRoomModal.addEventListener('click', () => {
    el.roomModal.classList.remove('open');
  });

  el.btnSaveRoom.addEventListener('click', () => {
    const val = el.inputRoomCode.value.trim().toUpperCase();
    if (val) {
      state.roomId = val;
      localStorage.setItem('dumpy_active_room', state.roomId);
      el.roomCodeDisplay.textContent = state.roomId;
      
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('room', state.roomId);
      window.history.replaceState({}, '', newUrl.toString());

      el.roomModal.classList.remove('open');
      showToast(`Switched to room ${state.roomId}`);
    }
  });

  // Settings Modal
  el.btnSettings.addEventListener('click', () => {
    const cfg = window.getSupabaseConfig();
    el.inputSupabaseUrl.value = cfg.url;
    el.inputSupabaseKey.value = cfg.key;
    el.settingsModal.classList.add('open');
  });

  el.btnCloseSettings.addEventListener('click', () => {
    el.settingsModal.classList.remove('open');
  });

  el.btnSaveSettings.addEventListener('click', () => {
    const url = el.inputSupabaseUrl.value.trim();
    const key = el.inputSupabaseKey.value.trim();
    window.saveSupabaseConfig(url, key);
    state.config = window.getSupabaseConfig();
    el.settingsModal.classList.remove('open');
    showToast('Supabase settings saved!');
  });

  // Boot
  initRoomId();
  initAuth();
})();
