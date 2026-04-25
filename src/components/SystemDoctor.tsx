"use client";

import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, ShieldAlert, Activity, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, type SystemCheck } from "@/store/useAppStore";

export default function SystemDoctor() {
  const { checks, isHealthy, isChecking, setChecks, setChecking } = useAppStore();
  const [healing, setHealing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const runChecks = async () => {
    // Only run if we are in a Tauri environment and internals are ready
    if (typeof window === "undefined" || !(window as any).__TAURI_INTERNALS__) {
      return;
    }

    setChecking(true);
    try {
      const results = await invoke<SystemCheck[]>("check_system");
      setChecks(results);
    } catch (error) {
      console.error("Failed to run checks:", error);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    // Wait for Tauri bridge
    const timer = setTimeout(() => {
      runChecks();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const healSystem = async () => {
    setHealing(true);
    try {
      await invoke("heal_system");
      await runChecks();
    } catch (error) {
      console.error("Healing failed:", error);
    } finally {
      setHealing(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <ShieldAlert className={cn("w-5 h-5", isHealthy ? "text-emerald-500" : "text-violet-500")} />
                <h3 className="text-zinc-100 font-semibold">System Doctor</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 mb-8">
              {isChecking ? (
                <div className="flex justify-center py-4">
                  <RefreshCw className="w-6 h-6 animate-spin text-zinc-700" />
                </div>
              ) : (
                checks.map((check) => (
                  <div key={check.name} className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-zinc-200 text-sm font-medium">{check.name}</p>
                      <p className="text-zinc-500 text-[10px] leading-tight mt-0.5">{check.description}</p>
                    </div>
                    {check.installed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-1" />
                    )}
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={healSystem}
              disabled={healing || isHealthy || isChecking}
              className={cn(
                "w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2",
                isHealthy 
                  ? "bg-emerald-500/10 text-emerald-500 cursor-default"
                  : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {healing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : isHealthy ? (
                <ShieldCheck className="w-4 h-4" />
              ) : (
                <Activity className="w-4 h-4" />
              )}
              {healing ? "Healing..." : isHealthy ? "System Healthy" : "Heal System"}
            </button>
          </motion.div>
        ) : (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setIsOpen(true)}
            className={cn(
              "p-4 rounded-2xl shadow-2xl border transition-all duration-300 flex items-center gap-3 group",
              isHealthy 
                ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700" 
                : "bg-violet-600 border-violet-500 text-white hover:scale-105 active:scale-95"
            )}
          >
            {isHealthy ? (
              <ShieldCheck className="w-5 h-5" />
            ) : (
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            )}
            {!isHealthy && <span className="font-semibold text-sm pr-1">System Issue Detected</span>}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
