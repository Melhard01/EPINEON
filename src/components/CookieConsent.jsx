import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import { scrollPageToTop } from '../lib/scrollPageToTop.js';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Cookie, X, Settings, Check } from 'lucide-react';

const CookieConsent = ({ openFromButton = false, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, can't be changed
    functional: false,
    analytics: false,
    marketing: false
  });

  // Check if user has already given consent
  useEffect(() => {
    if (openFromButton) {
      // Force show when opened from button
      setIsVisible(true);
      return;
    }

    const consent = localStorage?.getItem('epineon-cookie-consent');
    if (!consent) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [openFromButton]);

  // ADD THIS NEW FUNCTION:
  const closeAndNotify = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleAcceptAll = () => {
    const fullConsent = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('epineon-cookie-consent', JSON.stringify(fullConsent));
    }
    closeAndNotify();
  };

  const handleRejectAll = () => {
    const minimalConsent = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('epineon-cookie-consent', JSON.stringify(minimalConsent));
    }
    closeAndNotify();
  };

  const handleSavePreferences = () => {
    const consentData = {
      ...preferences,
      timestamp: new Date().toISOString()
    };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('epineon-cookie-consent', JSON.stringify(consentData));
    }
    closeAndNotify();
  };

  const handlePreferenceChange = (type, value) => {
    if (type === 'necessary') return; // Can't change necessary cookies
    setPreferences(prev => ({
      ...prev,
      [type]: value
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" />

      {/* Cookie Consent Card */}
      <Card className="relative w-full max-w-2xl gap-0 py-0 pointer-events-auto rounded-[2rem] border border-[#333333] bg-[#1a1a1a] text-white shadow-[0_24px_48px_rgba(0,0,0,0.45)]">
        {/* Close button */}
        <button
          onClick={handleRejectAll}
          className="absolute top-4 right-4 p-2 text-white/45 transition-colors hover:text-white"
          aria-label="Close cookie banner"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {!showSettings ? (
            // Main consent view
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 rounded-xl border border-[#c9a227]/35 bg-[#c9a227]/15 p-2">
                  <Cookie className="h-5 w-5 text-[#c9a227]" />
                </div>
                <div className="flex-1">
                  <h3
                    className="mb-2 text-lg font-semibold tracking-[0.05em] text-white"
                    style={{ fontFamily: 'var(--epineon-font-display)' }}
                  >
                    We Use Cookies
                  </h3>
                  <p className="text-sm leading-relaxed text-white/70">
                    We use cookies to enhance your browsing experience, serve personalized content,
                    and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                    You can customize your preferences or learn more in our{' '}
                    <Link
                      to="/cookie-policy"
                      onClick={scrollPageToTop}
                      className="font-medium text-[#c9a227] underline decoration-[#c9a227]/50 underline-offset-2 transition-colors hover:text-[#e8c547]"
                    >
                      Cookie Policy
                    </Link>.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button
                  onClick={handleAcceptAll}
                  className="epineon-btn-primary flex-1 rounded-full text-white"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Accept All
                </Button>

                <Button
                  onClick={() => setShowSettings(true)}
                  variant="outline"
                  className="flex-1 rounded-full border-neutral-600 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Customize
                </Button>

                <Button
                  onClick={handleRejectAll}
                  variant="outline"
                  className="flex-1 rounded-full border border-white/25 bg-transparent px-4 py-2 font-semibold text-white/80 shadow-none hover:border-white/45 hover:bg-white/[0.08] hover:text-white"
                >
                  Reject All
                </Button>
              </div>
            </div>
          ) : (
            // Settings view
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-white/10 pb-2">
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 text-white/45 transition-colors hover:text-white"
                >
                  ←
                </button>
                <h3
                  className="text-lg font-semibold tracking-[0.05em] text-white"
                  style={{ fontFamily: 'var(--epineon-font-display)' }}
                >
                  Cookie Preferences
                </h3>
              </div>

              <div className="space-y-3">
                {/* Necessary Cookies */}
                <div className="rounded-2xl border border-[#333333] bg-black/25 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-medium text-white">Essential Cookies</h4>
                    <div className="relative h-6 w-10 rounded-full bg-[#c9a227]/40">
                      <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white" />
                    </div>
                  </div>
                  <p className="text-sm text-white/60">
                    Essential for website functionality. Cannot be disabled.
                  </p>
                </div>

                {/* Functional Cookies */}
                <div className="rounded-2xl border border-[#333333] bg-black/25 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-medium text-white">Functional Cookies</h4>
                    <button
                      type="button"
                      onClick={() => handlePreferenceChange('functional', !preferences.functional)}
                      className={`relative h-6 w-10 rounded-full transition-colors ${preferences.functional ? 'bg-[#c9a227]' : 'bg-neutral-600'
                        }`}
                    >
                      <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${preferences.functional ? 'translate-x-4' : 'translate-x-0.5'
                        }`} />
                    </button>
                  </div>
                  <p className="text-sm text-white/60">
                    Enable enhanced functionality like chat support and personalization.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="rounded-2xl border border-[#333333] bg-black/25 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-medium text-white">Analytics Cookies</h4>
                    <button
                      type="button"
                      onClick={() => handlePreferenceChange('analytics', !preferences.analytics)}
                      className={`relative h-6 w-10 rounded-full transition-colors ${preferences.analytics ? 'bg-[#c9a227]' : 'bg-neutral-600'
                        }`}
                    >
                      <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${preferences.analytics ? 'translate-x-4' : 'translate-x-0.5'
                        }`} />
                    </button>
                  </div>
                  <p className="text-sm text-white/60">
                    Help us understand how visitors interact with our website.
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="rounded-2xl border border-[#333333] bg-black/25 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-medium text-white">Marketing Cookies</h4>
                    <button
                      type="button"
                      onClick={() => handlePreferenceChange('marketing', !preferences.marketing)}
                      className={`relative h-6 w-10 rounded-full transition-colors ${preferences.marketing ? 'bg-[#c9a227]' : 'bg-neutral-600'
                        }`}
                    >
                      <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${preferences.marketing ? 'translate-x-4' : 'translate-x-0.5'
                        }`} />
                    </button>
                  </div>
                  <p className="text-sm text-white/60">
                    Used to deliver relevant advertisements and track campaign effectiveness.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-white/10 pt-2 sm:flex-row">
                <Button
                  onClick={handleSavePreferences}
                  className="epineon-btn-primary flex-1 rounded-full text-white"
                >
                  Save Preferences
                </Button>
                <Button
                  onClick={handleAcceptAll}
                  variant="outline"
                  className="flex-1 rounded-full border-neutral-600 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  Accept All
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CookieConsent;
