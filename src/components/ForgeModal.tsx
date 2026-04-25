"use client";

import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { motion } from "motion/react";
import { Loader2, CheckCircle, Rocket, AlertCircle, Minimize2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

interface ForgeModalProps {
  appName: string;
}

export default function ForgeModal({ appName }: ForgeModalProps) {
  const { forge, updateForge, setMinimized, resetForge } = useAppStore();

  useEffect(() => {
    if (!forge.isBuilding) return;

    const unlisten = listen<[string, number]>("forge-progress", (event) => {
      const [msg, prg] = event.payload;
      updateForge(prg, msg);
    });

    return () => {
      unlisten.then(f => f());
    };
  }, [forge.isBuilding, updateForge]);

  const handleLaunch = async () => {
    if (typeof window === "undefined" || !(window as any).__TAURI_INTERNALS__) {
      resetForge();
      return;
    }

    try {
      const name = appName.toLowerCase();
      let url = "https://google.com";
      
      if (name.includes("whatsapp")) url = "https://web.whatsapp.com";
      else if (name.includes("claude")) url = "https://claude.ai";
      else if (name.includes("notion")) url = "https://www.notion.so";
      else if (name.includes("linear")) url = "https://linear.app";

      await invoke("launch_app", { url, name: appName });
      resetForge();
    } catch (e) {
      console.error("exec_failed", e);
      resetForge();
    }
  };

  if ((!forge.isBuilding && !forge.error) || forge.isMinimized) return null;

  const radius = 96;
  const circumference = 2 * Math.PI * radius;
  const isDone = forge.progress === 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-[40px] p-12 text-center relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]"
      >
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 blur-xl opacity-30" 
          style={{ background: `linear-gradient(to right, transparent, ${forge.themeColor}, transparent)` }}
        />

        {!isDone && !forge.error && (
          <div className="absolute top-8 right-8">
            <button 
              type="button"
              onClick={() => setMinimized(true)}
              className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300 rounded-xl transition-all"
              title="Minimize"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="relative w-56 h-56 mx-auto mb-12">
          <svg className="w-full h-full -rotate-90" aria-hidden="true">
            <circle
              cx="112"
              cy="112"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-zinc-900"
            />
            <motion.circle
              cx="112"
              cy="112"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference * (1 - forge.progress / 100) }}
              transition={{ duration: 0.8, ease: "circOut" }}
              style={{ color: forge.themeColor }}
              strokeLinecap="round"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isDone ? (
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                className="text-emerald-400"
              >
                <CheckCircle className="w-24 h-24 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]" />
              </motion.div>
            ) : forge.error ? (
              <AlertCircle className="w-24 h-24 text-rose-500" />
            ) : (
              <>
                <motion.div 
                  key={forge.progress}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-6xl font-black text-white mb-1 tracking-tighter"
                >
                  {forge.progress}<span className="text-3xl text-zinc-500">%</span>
                </motion.div>
                <div className="text-[12px] text-zinc-500 font-black tracking-[0.4em] uppercase">Engine Active</div>
              </>
            )}
          </div>
          
          <div 
            className="absolute inset-0 rounded-full blur-[80px] opacity-20 transition-colors duration-1000"
            style={{ backgroundColor: isDone ? "#10b981" : forge.themeColor }}
          />
        </div>

        <div className="space-y-4 mb-14">
          <h2 className="text-3xl font-black text-white tracking-tight">
            {forge.error ? "Sequence Halted" : isDone ? "Success" : `Processing ${appName}`}
          </h2>
          
          <div className="flex flex-col items-center gap-2">
            <motion.p 
              key={forge.status}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-zinc-400 text-[15px] font-medium leading-relaxed max-w-[280px]"
            >
              {forge.error || forge.status}
            </motion.p>
            {!isDone && !forge.error && (
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    style={{ backgroundColor: forge.themeColor }}
                    className="w-1 h-1 rounded-full"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-4">
          {isDone || forge.error ? (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={isDone ? handleLaunch : resetForge}
              className={cn(
                "w-full py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-2xl tracking-wide",
                isDone 
                  ? "bg-white text-black hover:bg-zinc-200" 
                  : "bg-zinc-800 text-white hover:bg-zinc-700"
              )}
            >
              {isDone ? (
                <>
                  <Rocket className="w-6 h-6" />
                  Launch Experience
                </>
              ) : (
                "Dismiss"
              )}
            </motion.button>
          ) : (
            <div className="py-4 flex items-center justify-center gap-4 text-zinc-500 text-sm font-bold uppercase tracking-widest">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: forge.themeColor }} />
              <span>Compilation in Progress</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
