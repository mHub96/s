// pwa.js - يتضمن تثبيت التطبيق وتحديث السيرفس ووركر
(() => {
    let deferredInstallPrompt = null;

    // تسجيل السيرفس ووركر مع معامل لتكسير الكاش (للتحديث الفوري)
    if ('serviceWorker' in navigator) {
        // نضيف معامل الوقت لتجنب استخدام نسخة مخزّنة من ملف service-worker.js نفسه
        const swUrl = './service-worker.js?v=' + Date.now();
        navigator.serviceWorker.register(swUrl)
            .then(registration => {
                console.log('Service Worker registered successfully');
                // التحقق من وجود تحديث عند كل تحميل
                registration.update();
                // عند تحديث السيرفس، نُعلم المستخدم (اختياري)
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // نسخة جديدة جاهزة، نعرض رسالة للمستخدم
                            showUpdateToast();
                        }
                    });
                });
            })
            .catch(error => {
                console.warn('PWA service worker registration failed:', error);
            });
    }

    // دالة لإظهار رسالة تحديث (يمكنك تخصيصها)
    function showUpdateToast() {
        // استخدم دالة showToast الموجودة لديك أو أنشئ رسالة
        if (typeof showToast === 'function') {
            showToast('🔄 توجد نسخة جديدة من التطبيق، أعد تحميل الصفحة لتحديثها', 'info', 5000);
        } else {
            alert('🔄 توجد نسخة جديدة، أعد تحميل الصفحة لتحديث التطبيق.');
        }
        // نضغط على المستخدم لإعادة التحميل
        if (confirm('🔄 توجد نسخة جديدة من التطبيق، هل تريد تحديثها الآن؟')) {
            window.location.reload();
        }
    }

    // زر تثبيت التطبيق (كما هو موجود)
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
        // يمكنك إظهار رسالة شكر
        if (typeof showToast === 'function') {
            showToast('✅ تم تثبيت التطبيق بنجاح', 'success');
        }
    });

    // عند تحميل الصفحة، نطلب من السيرفس ووركر التحقق من التحديثات
    window.addEventListener('load', () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.update(); // يتحقق من وجود تحديثات
            });
        }
    });
})();
