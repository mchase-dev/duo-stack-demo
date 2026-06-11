import React, { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { Button } from "./ui";

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-xl z-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start space-x-4 flex-1">
            <Cookie className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Cookie Consent
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                We use cookies to enhance your browsing experience, serve
                personalized content, and analyze our traffic. By clicking
                "Accept All", you consent to our use of cookies for
                authentication and session management.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" size="sm" onClick={handleAccept}>
                  Accept All
                </Button>
                <Button variant="secondary" size="sm" onClick={handleDecline}>
                  Decline
                </Button>
                <a
                  href="/pages/privacy-policy"
                  className="text-sm text-blue-600 hover:underline self-center"
                >
                  Learn more
                </a>
              </div>
            </div>
          </div>
          <button
            onClick={handleDecline}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
