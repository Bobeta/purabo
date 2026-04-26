"use client";

import { motion } from "motion/react";
import { Loader2, Maximize2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function BackgroundForge() {
  const { forge, setMinimized } = useAppStore();

  if (!forge.isBuilding || !forge.isMinimized) return null;

  return (
    <div className="fixed top-8 left-8 z-[60]">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        onClick={() => setMinimized(false)}
        className="flex items-center gap-4 bg-zinc-950/80 border border-zinc-800 p-2 pl-4 pr-3 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden relative group cursor-pointer hover:border-zinc-700 transition-all backdrop-blur-xl"
      >
        {/* Progress Glow */}
        <div 
          className="absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20"
          style={{ backgroundColor: forge.themeColor }}
        />
        
        <div className="flex flex-col relative z-10">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Engine Active</span>
          <span className="text-[11px] font-bold text-white truncate max-w-[120px]">
            {forge.status.split(":")[0]}
          </span>
        </div>

        <div className="relative flex items-center justify-center w-10 h-10 z-10">
          <svg className="w-full h-full -rotate-90" aria-hidden="true">
            <circle
              cx="20"
              cy="20"
              r={16}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-zinc-900"
            />
            <motion.circle
              cx="20"
              cy="20"
              r={16}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={100}
              initial={{ strokeDashoffset: 100 }}
              animate={{ strokeDashoffset: 100 - forge.progress }}
              transition={{ duration: 0.8 }}
              style={{ color: forge.themeColor }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: forge.themeColor }} />
          </div>
        </div>

        <div className="p-2 rounded-xl text-zinc-500 group-hover:text-white transition-colors relative z-10">
          <Maximize2 className="w-4 h-4" />
        </div>
      </motion.div>
    </div>
  );
}
