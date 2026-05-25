import React, { useState } from 'react';
import CookieConsent from './CookieConsent';
import { Button } from './ui/button';
import { Settings } from 'lucide-react';

const CookieSettings = ({ className = "" }) => {
  const [showSettings, setShowSettings] = useState(false);

  const handleOpenSettings = () => {
    // Reset localStorage to show the banner again
    localStorage.removeItem('epineon-cookie-consent');
    // Refresh the page to trigger the banner
    window.location.reload();
  };

  return (
    <Button
      onClick={handleOpenSettings}
      variant="ghost"
      size="sm"
      className={`text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors ${className}`}
    >
      <Settings className="w-4 h-4 mr-2" />
      Cookie Settings
    </Button>
  );
};

export default CookieSettings;
