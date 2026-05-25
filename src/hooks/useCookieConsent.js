import { useState, useEffect } from 'react';
import { getCookieConsent, setCookieConsent as saveCookieConsent } from '../lib/cookieUtils';

export const useCookieConsent = () => {
  const [consent, setConsent] = useState(null);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const savedConsent = getCookieConsent();
    if (savedConsent) {
      setConsent(savedConsent);
      setHasConsent(true);
    } else {
      setHasConsent(false);
    }
  }, []);

  const updateConsent = (newConsent) => {
    const success = saveCookieConsent(newConsent);
    if (success) {
      setConsent(newConsent);
      setHasConsent(true);
    }
    return success;
  };

  const clearConsent = () => {
    localStorage.removeItem('epineon-cookie-consent');
    setConsent(null);
    setHasConsent(false);
  };

  const canUse = (type) => {
    if (!consent) return false;
    return consent[type] === true;
  };

  return {
    consent,
    hasConsent,
    updateConsent,
    clearConsent,
    canUse,
    canUseAnalytics: () => canUse('analytics'),
    canUseMarketing: () => canUse('marketing'),
    canUseFunctional: () => canUse('functional'),
    canUseNecessary: () => true // Always true
  };
};

export default useCookieConsent;
