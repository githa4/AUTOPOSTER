
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppContext();

  return (
    <div className="fixed bottom-10 right-10 z-[300] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className="pointer-events-auto bg-[#252526] border border-[#3e3e42] text-[#cccccc] px-4 py-3 rounded shadow-2xl flex items-center gap-3 min-w-[300px] animate-fade-in-up"
        >
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
          {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
          
          <div className="flex-1 text-sm font-medium">{toast.message}</div>
          
          <button 
            onClick={() => removeToast(toast.id)} 
            className="text-[#666] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
