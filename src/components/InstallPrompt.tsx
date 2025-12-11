import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-scale-in">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            <Download className="w-8 h-8 text-blue-600" />
          </div>

          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Install ChatApp
          </h3>

          <p className="text-gray-600 mb-6">
            Install our app for quick access and a better experience. Works offline and feels like a native app!
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={handleDismiss}
              className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Not now
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
            >
              Install
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
