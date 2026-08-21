(() => {
  let deferredInstallPrompt = null;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(error => {
      console.warn('PWA service worker registration failed:', error);
    }));
  }

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
  });
})();
