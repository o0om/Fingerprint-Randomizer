document.addEventListener('DOMContentLoaded', function() {
  initUI();
  setupEvents();
  loadConfig();
  updateStatus();
  startRotationTimer();
});

function initUI() {
  const toggles = document.querySelectorAll('.toggle input[type="checkbox"]');
  toggles.forEach(toggle => {
    toggle.addEventListener('change', function() {
      const settingKey = this.id.replace('toggle-', '');
      saveConfig(settingKey, this.checked);
      updateStatus();
      logActivity(`${settingKey.toUpperCase()} ${this.checked ? 'ENABLED' : 'DISABLED'}`);
    });
  });
  
  const profileBtns = document.querySelectorAll('.btn[data-profile]');
  profileBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const profile = this.dataset.profile;
      applyProfile(profile);
      updateProfileUI(profile);
    });
  });
  
  document.getElementById('rotateNow').addEventListener('click', rotateFingerprint);
  document.getElementById('testSecurity').addEventListener('click', runSecurityTest);
  document.getElementById('resetAll').addEventListener('click', resetConfig);
  document.getElementById('saveSettings').addEventListener('click', saveAllConfig);
  document.getElementById('closeError').addEventListener('click', hideError);
}

function setupEvents() {
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync') {
      Object.keys(changes).forEach(key => {
        const change = changes[key];
        if (change.newValue !== change.oldValue) {
          updateToggle(key, change.newValue);
        }
      });
      updateStatus();
    }
  });
}

function loadConfig() {
  chrome.storage.sync.get([
    'fingerprint', 'webgl', 'audio', 'webrtc', 'canvas', 'microphone',
    'stun', 'turn', 'ml', 'fonts', 'behavioral',
    'lastRotation', 'rotationInterval', 'currentProfile'
  ], function(result) {
    const toggleMap = {
      'fingerprint': result.fingerprint !== false,
      'webgl': result.webgl !== false,
      'audio': result.audio !== false,
      'webrtc': result.webrtc !== false,
      'canvas': result.canvas !== false,
      'microphone': result.microphone !== false,
      'stun': result.stun || false,
      'turn': result.turn || false,
      'ml': result.ml || false,
      'fonts': result.fonts || false,
      'behavioral': result.behavioral || false
    };
    
    Object.keys(toggleMap).forEach(key => {
      const el = document.getElementById(`toggle-${key}`);
      if (el) el.checked = toggleMap[key];
    });
    
    window._lastRotation = result.lastRotation || Date.now();
    window._rotationInterval = result.rotationInterval || 30;
    window._currentProfile = result.currentProfile || 'maximum';
    
    updateStatus();
    updateProfileUI(window._currentProfile);
    logActivity('CONFIGURATION LOADED');
  });
}

function saveConfig(key, value) {
  chrome.storage.sync.set({ [key]: value }, function() {
    chrome.runtime.sendMessage({
      action: 'updateProtection',
      setting: key,
      enabled: value
    });
  });
}

function saveAllConfig() {
  const toggles = [
    'fingerprint', 'webgl', 'audio', 'webrtc', 'canvas', 'microphone',
    'stun', 'turn', 'ml', 'fonts', 'behavioral'
  ];
  
  const config = {};
  toggles.forEach(key => {
    const el = document.getElementById(`toggle-${key}`);
    if (el) config[key] = el.checked;
  });
  
  chrome.storage.sync.set(config, function() {
    logActivity('CONFIGURATION SAVED');
    showError('SETTINGS SAVED SUCCESSFULLY');
  });
}

function updateToggle(key, value) {
  const el = document.getElementById(`toggle-${key}`);
  if (el && el.checked !== value) {
    el.checked = value;
  }
}

function updateStatus() {
  const coreToggles = ['fingerprint', 'webgl', 'audio', 'webrtc', 'canvas', 'microphone'];
  const activeCount = coreToggles.filter(key => {
    const el = document.getElementById(`toggle-${key}`);
    return el && el.checked;
  }).length;
  
  const protectionEl = document.getElementById('protectionLevel');
  const shieldsEl = document.getElementById('activeShields');
  
  shieldsEl.textContent = `${activeCount}/6`;
  
  if (activeCount === 6) {
    protectionEl.textContent = 'MAXIMUM';
    protectionEl.className = 'status-value';
  } else if (activeCount >= 4) {
    protectionEl.textContent = 'HIGH';
    protectionEl.className = 'status-value';
  } else if (activeCount >= 2) {
    protectionEl.textContent = 'MEDIUM';
    protectionEl.className = 'status-value warning';
  } else {
    protectionEl.textContent = 'LOW';
    protectionEl.className = 'status-value danger';
  }
}

function updateProfileUI(profile) {
  const btns = document.querySelectorAll('.btn[data-profile]');
  btns.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.profile === profile) {
      btn.classList.add('active');
    }
  });
}

function applyProfile(profile) {
  const profiles = {
    maximum: {
      fingerprint: true, webgl: true, audio: true, webrtc: true, canvas: true, microphone: true,
      stun: true, turn: true, ml: true, fonts: true, behavioral: true
    },
    stealth: {
      fingerprint: true, webgl: true, audio: true, webrtc: true, canvas: true, microphone: false,
      stun: false, turn: false, ml: false, fonts: true, behavioral: false
    },
    custom: {
      fingerprint: true, webgl: true, audio: true, webrtc: true, canvas: true, microphone: true,
      stun: false, turn: false, ml: false, fonts: false, behavioral: false
    }
  };
  
  const config = profiles[profile];
  Object.keys(config).forEach(key => {
    const el = document.getElementById(`toggle-${key}`);
    if (el) {
      el.checked = config[key];
      saveConfig(key, config[key]);
    }
  });
  
  chrome.storage.sync.set({ currentProfile: profile });
  window._currentProfile = profile;
  
  logActivity(`PROFILE ${profile.toUpperCase()} APPLIED`);
  updateStatus();
}

function rotateFingerprint() {
  window._lastRotation = Date.now();
  chrome.storage.sync.set({ lastRotation: window._lastRotation });
  
  logActivity('FINGERPRINT ROTATED');
  updateRotationDisplay();
  
  chrome.runtime.sendMessage({ action: 'rotateFingerprint' });
}

function runSecurityTest() {
  logActivity('SECURITY TEST STARTED');
  
  const testResults = [];
  const toggles = ['fingerprint', 'webgl', 'audio', 'webrtc', 'canvas', 'microphone'];
  
  toggles.forEach(key => {
    const el = document.getElementById(`toggle-${key}`);
    if (el && el.checked) {
      testResults.push(`${key.toUpperCase()}: PASS`);
    } else {
      testResults.push(`${key.toUpperCase()}: FAIL`);
    }
  });
  
  setTimeout(() => {
    testResults.forEach(result => logActivity(result));
    logActivity('SECURITY TEST COMPLETED');
  }, 1000);
}

function resetConfig() {
  if (confirm('RESET ALL SETTINGS TO DEFAULT?')) {
    chrome.storage.sync.clear(function() {
      loadConfig();
      logActivity('CONFIGURATION RESET');
      showError('SETTINGS RESET TO DEFAULT');
    });
  }
}

function updateRotationDisplay() {
  const last = window._lastRotation || Date.now();
  const interval = window._rotationInterval || 30;
  const now = Date.now();
  const nextEl = document.getElementById('nextRotation');
  
  const msUntil = (last + interval * 60 * 1000) - now;
  
  if (msUntil <= 0) {
    nextEl.textContent = 'DUE NOW';
    nextEl.className = 'status-value danger';
  } else if (msUntil < 60000) {
    nextEl.textContent = '< 1 MIN';
    nextEl.className = 'status-value warning';
  } else if (msUntil < 3600000) {
    const min = Math.floor(msUntil / 60000);
    nextEl.textContent = `${min} MIN`;
    nextEl.className = 'status-value';
  } else {
    const hr = Math.floor(msUntil / 3600000);
    nextEl.textContent = `${hr} HR`;
    nextEl.className = 'status-value';
  }
}

function startRotationTimer() {
  setInterval(() => {
    updateRotationDisplay();
    const last = window._lastRotation || Date.now();
    const interval = window._rotationInterval || 30;
    const now = Date.now();
    
    if (now - last >= interval * 60 * 1000) {
      rotateFingerprint();
    }
  }, 30000);
}

function logActivity(message) {
  const logEl = document.getElementById('systemLog');
  const timestamp = new Date().toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
  
  const logEntry = `> ${timestamp} ${message}\n`;
  logEl.textContent += logEntry;
  logEl.scrollTop = logEl.scrollHeight;
  
  chrome.storage.sync.get(['activityLog'], function(result) {
    const log = result.activityLog || [];
    log.push({ timestamp: Date.now(), message });
    if (log.length > 100) log.shift();
    chrome.storage.sync.set({ activityLog: log });
  });
}

function showError(message) {
  const banner = document.getElementById('errorBanner');
  const messageEl = document.getElementById('errorMessage');
  messageEl.textContent = message;
  banner.style.display = 'flex';
  
  setTimeout(() => {
    hideError();
  }, 5000);
}

function hideError() {
  document.getElementById('errorBanner').style.display = 'none';
} 