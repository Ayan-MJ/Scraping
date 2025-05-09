import React from 'react';
import { AlertTriangle } from 'lucide-react'; // Using lucide-react for icons, common in shadcn/ui

interface WarningBannerProps {
  message: string | null;
  isVisible: boolean;
  onDismiss?: () => void; // Optional dismiss handler
}

const WarningBanner: React.FC<WarningBannerProps> = ({ message, isVisible, onDismiss }) => {
  if (!isVisible || !message) {
    return null;
  }

  return (
    <div className="my-4 p-3 border border-yellow-300 rounded-md bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 flex items-center justify-between shadow-sm">
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
        <p className="text-sm">{message}</p>
      </div>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="ml-4 text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded"
          aria-label="Dismiss warning"
        >
          Dismiss
        </button>
      )}
    </div>
  );
};

export default WarningBanner; 