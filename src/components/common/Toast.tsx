'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useUIStore, ToastMessage } from '@/store/uiStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastItemProps {
  toast: ToastMessage;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle2 className="text-emerald-400" size={18} />,
    warning: <AlertTriangle className="text-amber-400" size={18} />,
    error: <AlertCircle className="text-red-400" size={18} />,
    info: <Info className="text-primary-gold" size={18} />,
  };

  const borderColors = {
    success: 'border-emerald-500/20 bg-emerald-950/20',
    warning: 'border-amber-500/20 bg-amber-950/20',
    error: 'border-red-500/20 bg-red-950/20',
    info: 'border-primary-gold/25 bg-zinc-950/80',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      className={`flex items-start justify-between p-4 rounded-xl border backdrop-blur-md shadow-lg ${borderColors[toast.type]}`}
    >
      <div className="flex space-x-3">
        <div className="mt-0.5">{icons[toast.type]}</div>
        <p className="text-xs font-semibold tracking-wide text-zinc-200">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-zinc-400 hover:text-white ml-3 focus:outline-none transition-colors"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};
