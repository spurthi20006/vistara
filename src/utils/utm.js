const UTM_STORAGE_KEY = 'uc-utm-params';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign'];

export function captureUtmParams(searchString) {
  try {
    const params = new URLSearchParams(searchString || window.location.search);
    const captured = {};
    let hasAny = false;

    UTM_KEYS.forEach((key) => {
      const value = params.get(key);
      if (value && value.trim()) {
        captured[key] = value.trim();
        hasAny = true;
      }
    });

    if (hasAny) {
      window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(captured));
      return captured;
    }
  } catch {
    // Ignore sessionStorage restriction
  }
  return getStoredUtmParams();
}

export function getStoredUtmParams() {
  try {
    const raw = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return { utm_source: '', utm_medium: '', utm_campaign: '' };
    const parsed = JSON.parse(raw);
    return {
      utm_source: parsed.utm_source || '',
      utm_medium: parsed.utm_medium || '',
      utm_campaign: parsed.utm_campaign || '',
    };
  } catch {
    return { utm_source: '', utm_medium: '', utm_campaign: '' };
  }
}
