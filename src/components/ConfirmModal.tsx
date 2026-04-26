"use client";

import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Uninstall",
  cancelText = "Keep App"
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-[32px] p-8 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/5 flex items-center justify-center mb-6 border border-rose-500/10">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed mb-8">
                {message}
              </p>
              
              <div className="flex flex-col w-full gap-3">
                <button
                  type="button"
                  onClick={onConfirm}
                  className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                  {confirmText}
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-2xl font-bold transition-all"
                >
                  {cancelText}
                </button>
              </div>
            </div>

            <button 
              type="button"
              onClick={onCancel}
              className="absolute top-6 right-6 text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
