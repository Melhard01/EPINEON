import React, { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';
import CookieConsent from './CookieConsent';

const CookieSettingsButton = () => {
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);

  // Check if user has given consent to show/hide the button
  useEffect(() => {
    const consent = localStorage?.getItem('epineon-cookie-consent');
    setHasConsent(!!consent);
  }, []);

  const handleOpenCookieSettings = () => {
    setShowCookieConsent(true);
  };

  const handleCloseCookieSettings = () => {
    setShowCookieConsent(false);
    // Re-check consent after closing
    const consent = localStorage?.getItem('epineon-cookie-consent');
    setHasConsent(!!consent);
  };

  // Only show button if user has already given consent
  if (!hasConsent) return null;

  return (
    <>
      {/* Floating Cookie Settings Button */}
      <button
        onClick={handleOpenCookieSettings}
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom,0px))] right-[max(1rem,env(safe-area-inset-right,0px))] z-40 p-3 bg-white text-gray-800 rounded-full shadow-lg transition-colors duration-200 group"
        title="Cookie Settings"
        aria-label="Open cookie settings"
      >
        <Cookie className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
      </button>

      {/* Cookie Consent Modal */}
      <CookieConsent 
        openFromButton={showCookieConsent} 
        onClose={handleCloseCookieSettings}
      />
    </>
  );
};

export default CookieSettingsButton;