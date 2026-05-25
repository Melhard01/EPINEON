// Cookie consent utilities
export const getCookieConsent = () => {
  try {
    const consent = localStorage.getItem('epineon-cookie-consent');
    return consent ? JSON.parse(consent) : null;
  } catch (error) {
    console.error('Error reading cookie consent:', error);
    return null;
  }
};

export const hasCookieConsent = (type = null) => {
  const consent = getCookieConsent();
  if (!consent) return false;
  
  if (type) {
    return consent[type] === true;
  }
  
  // If no specific type requested, check if any consent exists
  return true;
};

export const setCookieConsent = (preferences) => {
  try {
    const consentData = {
      ...preferences,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('epineon-cookie-consent', JSON.stringify(consentData));
    return true;
  } catch (error) {
    console.error('Error saving cookie consent:', error);
    return false;
  }
};

export const removeCookieConsent = () => {
  try {
    localStorage.removeItem('epineon-cookie-consent');
    return true;
  } catch (error) {
    console.error('Error removing cookie consent:', error);
    return false;
  }
};

// Helper function to check if analytics cookies are allowed
export const canUseAnalytics = () => {
  return hasCookieConsent('analytics');
};

// Helper function to check if marketing cookies are allowed
export const canUseMarketing = () => {
  return hasCookieConsent('marketing');
};

// Helper function to check if functional cookies are allowed
export const canUseFunctional = () => {
  return hasCookieConsent('functional');
};

// Function to conditionally load scripts based on consent
export const loadScript = (src, type = 'functional') => {
  if (!hasCookieConsent(type)) {
    console.log(`Script ${src} not loaded due to cookie consent preferences`);
    return false;
  }
  
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  document.head.appendChild(script);
  return true;
};

// Function to conditionally set cookies based on consent
export const setCookie = (name, value, days = 30, type = 'functional') => {
  if (!hasCookieConsent(type)) {
    console.log(`Cookie ${name} not set due to consent preferences`);
    return false;
  }
  
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  return true;
};

// Google Analytics helper
export const initializeGoogleAnalytics = (measurementId) => {
  if (!canUseAnalytics()) {
    console.log('Google Analytics not initialized due to cookie consent');
    return false;
  }
  
  // Load Google Analytics script
  const gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(gtagScript);
  
  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', measurementId);
  
  return true;
};

export default {
  getCookieConsent,
  hasCookieConsent,
  setCookieConsent,
  removeCookieConsent,
  canUseAnalytics,
  canUseMarketing,
  canUseFunctional,
  loadScript,
  setCookie,
  initializeGoogleAnalytics
};
