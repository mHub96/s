// pwa.js - with automatic update detection
(() => {
  let deferredInstallPrompt = null;

  // Register the service worker with a cache-busting parameter
  if ('serviceWorker' in navigator) {
    const swUrl = './service-worker.js?v=' + Date.now();
    navigator.serviceWorker.register(swUrl)
      .then(registration => {
        console.log('Service Worker registered successfully');

        // Check for updates immediately
        registration.update();

        // Listen for a new service worker installing
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version is ready — notify the user
              showUpdatePrompt();
            }
          });
        });
      })
      .catch(error => {
        console.warn('PWA service worker registration failed:', error);
      });
  }

  // Show a friendly prompt to reload
  function showUpdatePrompt() {
    // Try using your existing Toast function if available
    if (typeof showToast === 'function') {
      showToast('🔄 New version available. Reload to update.', 'info', 6000);
    } else {
      // Fallback: browser confirm dialog
      if (confirm('A new version of this app is available. Refresh now?')) {
        window.location.reload();
      }
    }
  }

  // ----- Install Button (unchanged from your original) -----
  function addInstallButton() {
    if (document.getElementById('pwa-install-button')) return;
    const button = document.createElement('button');
    button.id = 'pwa-install-button';
    button.type = 'button';
    button.innerHTML = '<i class="fas fa-download"></i><span>تثبيت التطبيق</span>';
    button.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:9998;display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border:1px solid rgba(16,185,129,.35);border-radius:999px;background:#0f766e;color:#fff;font:700 12px "IBM Plex Sans Arabic",sans-serif;box-shadow:0 12px 28px rgba(0,0,0,.24);cursor:pointer;';
    button.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      button.remove();
    });
    document.body.appendChild(button);
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    addInstallButton();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    document.getElementById('pwa-install-button')?.remove();
    if (typeof showToast === 'function') {
      showToast('✅ App installed successfully!', 'success');
    }
  });

  // On page load, check for updates again
  window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.update();
      });
    }
  });
})();
