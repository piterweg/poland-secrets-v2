// Cookie Consent Banner — RODO / GDPR compliant
(function () {
  const STORAGE_KEY = 'cookie-consent-v1';
  const GA_ID = 'G-FE83G0TEHF';

  // Sprawdź czy zgoda już istnieje
  let consent = null;
  try {
    consent = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (e) { /* ignore */ }

  // ───── Google Consent Mode v2 — default deny ─────
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });

  // ───── Jeśli zgoda już jest, zaktualizuj tryb ─────
  if (consent) {
    applyConsent(consent);
    return;
  }

  // ───── Wyświetl banner po załadowaniu DOM ─────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showBanner);
  } else {
    showBanner();
  }

  function applyConsent(c) {
    gtag('consent', 'update', {
      ad_storage: c.marketing ? 'granted' : 'denied',
      ad_user_data: c.marketing ? 'granted' : 'denied',
      ad_personalization: c.marketing ? 'granted' : 'denied',
      analytics_storage: c.analytics ? 'granted' : 'denied'
    });
  }

  function showBanner() {
    if (document.querySelector('#cookie-banner')) return;

    const lang = document.documentElement.lang === 'en' ? 'en' : 'pl';
    const texts = {
      pl: {
        title: 'Szanujemy Twoją prywatność',
        desc: 'Używamy plików cookies, aby zapewnić prawidłowe działanie strony, analizować ruch i personalizować treści. Możesz zaakceptować wszystkie, odrzucić opcjonalne lub dostosować wybór.',
        accept: 'Akceptuję wszystkie',
        reject: 'Tylko niezbędne',
        customize: 'Dostosuj',
        settings: 'Ustawienia cookies',
        save: 'Zapisz wybór',
        analytics: 'Analityczne',
        analyticsDesc: 'Google Analytics 4 — pomagają zrozumieć, jak korzystasz ze strony.',
        marketing: 'Marketingowe',
        marketingDesc: 'Reklamy dopasowane do zainteresowań (np. Google Ads, Meta).',
        essential: 'Niezbędne',
        essentialDesc: 'Zapewniają prawidłowe działanie strony (zawsze aktywne).',
        privacy: 'Polityka prywatności',
        cookies: 'Polityka cookies'
      },
      en: {
        title: 'We respect your privacy',
        desc: 'We use cookies to ensure the proper functioning of the site, analyze traffic, and personalize content. You can accept all, reject optional, or customize your choice.',
        accept: 'Accept all',
        reject: 'Essential only',
        customize: 'Customize',
        settings: 'Cookie settings',
        save: 'Save choice',
        analytics: 'Analytics',
        analyticsDesc: 'Google Analytics 4 — help us understand how you use the site.',
        marketing: 'Marketing',
        marketingDesc: 'Ads tailored to interests (e.g. Google Ads, Meta).',
        essential: 'Essential',
        essentialDesc: 'Ensure the proper functioning of the site (always active).',
        privacy: 'Privacy Policy',
        cookies: 'Cookie Policy'
      }
    };
    const t = texts[lang];
    const isEn = lang === 'en';
    const privacyUrl = isEn ? 'polityka-prywatnosci-en.html' : 'polityka-prywatnosci.html';
    const cookiesUrl = isEn ? 'cookies-en.html' : 'cookies.html';

    // ───── Style inline (bez zewnętrznego CSS) ─────
    const style = document.createElement('style');
    style.textContent = `
      #cookie-banner {
        position: fixed; left: 20px; right: 20px; bottom: 20px;
        max-width: 640px; margin: 0 auto;
        background: #18332c; color: #f5f0e5;
        padding: 26px 28px; border-radius: 18px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.25);
        z-index: 10000; font-family: Manrope, Arial, sans-serif;
        font-size: 14px; line-height: 1.6;
        animation: cookieFadeUp .4s ease;
      }
      @keyframes cookieFadeUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      #cookie-banner h3 {
        margin: 0 0 10px; font-size: 18px; font-weight: 700;
        letter-spacing: -0.3px;
      }
      #cookie-banner p {
        margin: 0 0 18px; opacity: 0.85;
      }
      #cookie-banner a {
        color: #f4c84c; text-decoration: underline;
        text-underline-offset: 3px;
      }
      #cookie-banner .cb-buttons {
        display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 0;
      }
      #cookie-banner button {
        border: 1px solid #f5f0e5; background: none; color: #f5f0e5;
        padding: 11px 18px; border-radius: 10px; cursor: pointer;
        font: 600 13px Manrope; transition: all .2s;
      }
      #cookie-banner button:hover { background: rgba(255,255,255,0.1); }
      #cookie-banner button.cb-primary {
        background: #ee7652; border-color: #ee7652; color: #fff;
      }
      #cookie-banner button.cb-primary:hover { background: #d96445; border-color: #d96445; }
      #cookie-banner .cb-customize {
        display: none; margin: 18px 0 0; padding-top: 18px;
        border-top: 1px solid rgba(255,255,255,0.15);
      }
      #cookie-banner .cb-customize.open { display: block; }
      #cookie-banner .cb-row {
        display: flex; align-items: flex-start; gap: 12px;
        padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08);
      }
      #cookie-banner .cb-row:last-child { border-bottom: 0; }
      #cookie-banner .cb-row label {
        cursor: pointer; flex: 1;
      }
      #cookie-banner .cb-row strong {
        display: block; font-size: 14px; margin-bottom: 4px;
      }
      #cookie-banner .cb-row span {
        font-size: 12px; opacity: 0.7;
      }
      #cookie-banner input[type="checkbox"] {
        margin-top: 4px; width: 18px; height: 18px;
        accent-color: #ee7652; cursor: pointer; flex-shrink: 0;
      }
      #cookie-banner input[type="checkbox"]:disabled { opacity: 0.5; cursor: not-allowed; }
      @media (max-width: 600px) {
        #cookie-banner { left: 12px; right: 12px; bottom: 12px; padding: 22px 20px; }
      }
    `;
    document.head.appendChild(style);

    // ───── HTML bannera ─────
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', t.title);
    banner.innerHTML = `
      <h3>${t.title}</h3>
      <p>${t.desc} <a href="${privacyUrl}">${t.privacy}</a> · <a href="${cookiesUrl}">${t.cookies}</a></p>
      <div class="cb-buttons">
        <button class="cb-primary" data-action="accept">${t.accept}</button>
        <button data-action="reject">${t.reject}</button>
        <button data-action="customize">${t.customize}</button>
      </div>
      <div class="cb-customize" id="cb-customize">
        <div class="cb-row">
          <input type="checkbox" checked disabled>
          <label>
            <strong>${t.essential}</strong>
            <span>${t.essentialDesc}</span>
          </label>
        </div>
        <div class="cb-row">
          <input type="checkbox" id="cb-analytics">
          <label for="cb-analytics">
            <strong>${t.analytics}</strong>
            <span>${t.analyticsDesc}</span>
          </label>
        </div>
        <div class="cb-row">
          <input type="checkbox" id="cb-marketing">
          <label for="cb-marketing">
            <strong>${t.marketing}</strong>
            <span>${t.marketingDesc}</span>
          </label>
        </div>
        <div class="cb-buttons" style="margin-top:16px">
          <button class="cb-primary" data-action="save">${t.save}</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);

    // ───── Obsługa przycisków ─────
    banner.addEventListener('click', function (e) {
      const action = e.target.dataset.action;
      if (!action) return;

      if (action === 'customize') {
        document.getElementById('cb-customize').classList.toggle('open');
        return;
      }

      let newConsent;
      if (action === 'accept') {
        newConsent = { essential: true, analytics: true, marketing: true };
      } else if (action === 'reject') {
        newConsent = { essential: true, analytics: false, marketing: false };
      } else if (action === 'save') {
        newConsent = {
          essential: true,
          analytics: document.getElementById('cb-analytics').checked,
          marketing: document.getElementById('cb-marketing').checked
        };
      } else {
        return;
      }

      saveConsent(newConsent);
      applyConsent(newConsent);
      banner.remove();
    });
  }

  function saveConsent(c) {
    const data = {
      essential: true,
      analytics: !!c.analytics,
      marketing: !!c.marketing,
      timestamp: new Date().toISOString()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) { /* ignore */ }
  }

  // ───── Link „Ustawienia cookies" — pozwala zmienić wybór ─────
  document.addEventListener('click', function (e) {
    const link = e.target.closest('#cookie-settings-link');
    if (link) {
      e.preventDefault();
      try { localStorage.removeItem(STORAGE_KEY); } catch (err) { /* ignore */ }
      showBanner();
    }
  });
})();