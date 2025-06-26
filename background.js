let protectionStatus = {
  fingerprintRandomizer: false,
  webglSpoofer: false,
  audioContextSpoofer: false,
  webrtcObfuscator: false,
  customStunTurn: false,
  formalVerification: false
};

let contentScriptsLoaded = {
  fingerprint_randomizer: false,
  webgl_spoofer: false,
  audio_context_spoofer: false,
  webrtc_obfuscator: false,
  test_handler: false
};

chrome.runtime.onInstalled.addListener(() => {
  console.log('Free Your Self - Anti-Forensic Browser Hardening Extension Installed');
  initializeProtection();
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Free Your Self - Extension Starting');
  initializeProtection();
});

function initializeProtection() {
  chrome.storage.sync.get([
    'fingerprintRandomizer',
    'webglSpoofer',
    'audioContextSpoofer', 
    'webrtcObfuscator',
    'customStunTurn',
    'formalVerification'
  ], function(result) {
    protectionStatus = {
      fingerprintRandomizer: result.fingerprintRandomizer !== false,
      webglSpoofer: result.webglSpoofer !== false,
      audioContextSpoofer: result.audioContextSpoofer !== false,
      webrtcObfuscator: result.webrtcObfuscator !== false,
      customStunTurn: result.customStunTurn !== false,
      formalVerification: result.formalVerification !== false
    };
    
    injectContentScripts();
  });
}

function injectContentScripts() {
  const scripts = [
    'content_scripts/test_handler.js',
    'content_scripts/fingerprint_randomizer.js',
    'content_scripts/webgl_spoofer.js', 
    'content_scripts/audio_context_spoofer.js',
    'content_scripts/webrtc_obfuscator.js'
  ];
  
  chrome.tabs.query({}, function(tabs) {
    tabs.forEach(tab => {
      if (tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
        scripts.forEach(script => {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: [script]
          }).then(() => {
            console.log(`Injected ${script} into tab ${tab.id}`);
            const scriptName = script.split('/').pop().replace('.js', '');
            contentScriptsLoaded[scriptName] = true;
          }).catch(error => {
            console.error(`Failed to inject ${script}:`, error);
          });
        });
      }
    });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  switch (request.action) {
    case 'updateProtection':
      handleProtectionUpdate(request, sendResponse);
      break;
      
    case 'checkContentScript':
      handleContentScriptCheck(request, sendResponse);
      break;
      
    case 'getExtensionStatus':
      handleExtensionStatus(sendResponse);
      break;
      
    case 'testProtection':
      handleProtectionTest(request, sendResponse);
      break;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
  
  return true; // Keep message channel open for async response
});

function handleProtectionUpdate(request, sendResponse) {
  const { setting, enabled } = request;
  
  if (protectionStatus.hasOwnProperty(setting)) {
    protectionStatus[setting] = enabled;
    
    chrome.storage.sync.set({ [setting]: enabled }, function() {
      console.log(`Updated ${setting} to ${enabled}`);
      
      // Notify content scripts of the change
      chrome.tabs.query({}, function(tabs) {
        tabs.forEach(tab => {
          if (tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
            chrome.tabs.sendMessage(tab.id, {
              action: 'protectionUpdate',
              setting: setting,
              enabled: enabled
            }).catch(error => {
              // Ignore errors for tabs that don't have content scripts
            });
          }
        });
      });
      
      sendResponse({ success: true, updated: true });
    });
  } else {
    sendResponse({ error: 'Unknown setting' });
  }
}

function handleContentScriptCheck(request, sendResponse) {
  const { script } = request;
  const scriptName = script.replace('.js', '');
  
  const isLoaded = contentScriptsLoaded[scriptName] || false;
  const isActive = protectionStatus[getSettingKey(scriptName)] || false;
  
  sendResponse({
    loaded: isLoaded,
    active: isActive,
    script: script
  });
}

function handleExtensionStatus(sendResponse) {
  const activeProtections = Object.values(protectionStatus).filter(Boolean).length;
  const totalProtections = Object.keys(protectionStatus).length;
  
  sendResponse({
    active: activeProtections > 0,
    protectionCount: activeProtections,
    totalProtections: totalProtections,
    status: protectionStatus
  });
}

function handleProtectionTest(request, sendResponse) {
  const { testType } = request;
  
  switch (testType) {
    case 'fingerprint':
      testFingerprintProtection(sendResponse);
      break;
    case 'webrtc':
      testWebRTCProtection(sendResponse);
      break;
    case 'webgl':
      testWebGLProtection(sendResponse);
      break;
    case 'audio':
      testAudioProtection(sendResponse);
      break;
    default:
      sendResponse({ error: 'Unknown test type' });
  }
}

function testFingerprintProtection(sendResponse) {
  const isProtected = protectionStatus.fingerprintRandomizer;
  sendResponse({
    success: true,
    protected: isProtected,
    score: isProtected ? 100 : 0
  });
}

function testWebRTCProtection(sendResponse) {
  const isProtected = protectionStatus.webrtcObfuscator;
  sendResponse({
    success: true,
    protected: isProtected,
    score: isProtected ? 100 : 0
  });
}

function testWebGLProtection(sendResponse) {
  const isProtected = protectionStatus.webglSpoofer;
  sendResponse({
    success: true,
    protected: isProtected,
    score: isProtected ? 100 : 0
  });
}

function testAudioProtection(sendResponse) {
  const isProtected = protectionStatus.audioContextSpoofer;
  sendResponse({
    success: true,
    protected: isProtected,
    score: isProtected ? 100 : 0
  });
}

function getSettingKey(scriptName) {
  const keyMap = {
    'fingerprint_randomizer': 'fingerprintRandomizer',
    'webgl_spoofer': 'webglSpoofer',
    'audio_context_spoofer': 'audioContextSpoofer',
    'webrtc_obfuscator': 'webrtcObfuscator'
  };
  return keyMap[scriptName] || scriptName;
}

// Handle tab updates to inject content scripts
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && 
      (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
    
    const scripts = [
      'content_scripts/test_handler.js',
      'content_scripts/fingerprint_randomizer.js',
      'content_scripts/webgl_spoofer.js',
      'content_scripts/audio_context_spoofer.js',
      'content_scripts/webrtc_obfuscator.js'
    ];
    
    scripts.forEach(script => {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: [script]
      }).then(() => {
        console.log(`Injected ${script} into new tab ${tabId}`);
        const scriptName = script.split('/').pop().replace('.js', '');
        contentScriptsLoaded[scriptName] = true;
      }).catch(error => {
        console.error(`Failed to inject ${script} into tab ${tabId}:`, error);
      });
    });
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: 'popup.html' });
});

chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    const headers = details.requestHeaders.filter(function(h) {
      return h.name.toLowerCase() !== "referer";
    });
    headers.push({ name: "Referer", value: "" });
    return { requestHeaders: headers };
  },
  { urls: ["<all_urls>"] },
  ["blocking", "requestHeaders"]
);

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    const blockedDomains = [
      'fingerprintjs.com',
      'fingerprint2js.com',
      'fingerprint.com',
      'fpjs.io',
      'cdn.fingerprintjs.com',
      'cdn.fingerprint2js.com',
      'cdn.fingerprint.com',
      'cdn.fpjs.io'
    ];
    
    const url = new URL(details.url);
    if (blockedDomains.some(domain => url.hostname.includes(domain))) {
      return {cancel: true};
    }
    
    return {cancel: false};
  },
  {urls: ["<all_urls>"]},
  ["blocking"]
);

chrome.webRequest.onHeadersReceived.addListener(
  function(details) {
    const headers = details.responseHeaders;
    
    for (let i = 0; i < headers.length; i++) {
      if (headers[i].name.toLowerCase() === 'content-security-policy') {
        headers[i].value = headers[i].value.replace(/script-src[^;]*/g, 'script-src \'self\' \'unsafe-inline\' \'unsafe-eval\'');
        break;
      }
    }
    
    return {responseHeaders: headers};
  },
  {urls: ["<all_urls>"]},
  ["responseHeaders", "blocking"]
);

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    console.log('Tab updated, injecting content scripts');
    
    chrome.storage.sync.get([
      'fingerprintRandomizer',
      'webglSpoofer',
      'audioContextSpoofer',
      'webrtcObfuscator',
      'customStunTurn',
      'formalVerification'
    ], function(result) {
      const settings = {
        fingerprintRandomizer: result.fingerprintRandomizer !== false,
        webglSpoofer: result.webglSpoofer !== false,
        audioContextSpoofer: result.audioContextSpoofer !== false,
        webrtcObfuscator: result.webrtcObfuscator !== false,
        customStunTurn: result.customStunTurn !== false,
        formalVerification: result.formalVerification !== false
      };
      
      chrome.tabs.sendMessage(tabId, {
        action: 'initializeProtection',
        settings: settings
      }).catch(() => {
        console.log(`Failed to send initialization message to tab ${tabId}`);
      });
    });
  }
});

chrome.runtime.onSuspend.addListener(function() {
  console.log('Free Your Self extension suspended');
}); 