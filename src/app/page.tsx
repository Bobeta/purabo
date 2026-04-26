"use client";

import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import MagicBar from "@/components/MagicBar";
import RecipeStore from "@/components/RecipeStore";
import SystemDoctor from "@/components/SystemDoctor";
import ForgeModal from "@/components/ForgeModal";
import BackgroundForge from "@/components/BackgroundForge";
import { motion } from "motion/react";
import { X, Minus } from "lucide-react";
import { useAppStore, type ForgedApp } from "@/store/useAppStore";
import { getCurrentWindow } from "@tauri-apps/api/window";

export default function Home() {
  const { startForge, failForge, isHealthy, addForgedApp } = useAppStore();
  const [activeAppName, setActiveAppName] = useState("");

  const handleForge = async (url: string, name: string, icon?: string, themeColor?: string) => {
    if (!isHealthy) {
      alert("System audit incomplete. Please resolve dependencies.");
      return;
    }

    setActiveAppName(name);
    startForge(name, themeColor);

    try {
      // Force minimalist and dark mode off by default for stability in v0.1.0
      await invoke("forge_app", { 
        url, 
        name, 
        force_dark: false, 
        minimalist: false 
      });

      const newApp: ForgedApp = {
        id: Math.random().toString(36).substring(7),
        name,
        url,
        icon: icon || `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`,
        themeColor: themeColor || "#8b5cf6",
        created_at: Date.now()
      };
      addForgedApp(newApp);
    } catch (error) {
      failForge(error as string);
      console.error("forge_exec_failed", error);
    }
  };

  const appWindow = typeof window !== "undefined" ? getCurrentWindow() : null;

  const handleDrag = async () => {
    if (appWindow) {
      await appWindow.startDragging();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-violet-500/30 overflow-hidden rounded-[32px] border border-zinc-800 shadow-2xl relative flex flex-col">
      <div 
        onMouseDown={handleDrag}
        className="absolute top-0 left-0 right-0 h-24 z-[90] cursor-grab active:cursor-grabbing"
        aria-hidden="true"
      />

      <div className="fixed top-8 right-8 z-[100] flex items-center gap-3">
        <button 
          type="button"
          onClick={() => appWindow?.minimize()}
          className="p-2 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800/50 rounded-xl text-zinc-500 hover:text-zinc-300 transition-all backdrop-blur-md"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button 
          type="button"
          onClick={() => appWindow?.close()}
          className="p-2 bg-rose-500/5 hover:bg-rose-500/20 border border-rose-500/10 text-zinc-500 hover:text-rose-400 rounded-xl transition-all backdrop-blur-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-500/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative flex-1 flex flex-col items-center pt-32 pb-20 px-10 overflow-y-auto z-10 custom-scroll">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            v0.1.0
          </div>
          <h1 className="text-7xl font-bold tracking-tight mb-4 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
            Purabo
          </h1>
          <p className="text-zinc-500 text-lg max-w-lg mx-auto leading-relaxed font-medium">
            High-performance binary factory. Transform web experiences into standalone desktop tools.
          </p>
        </motion.div>

        <MagicBar onForge={handleForge} />
        <RecipeStore onForge={handleForge} />

        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-32 text-zinc-600 text-[10px] flex items-center gap-4 font-black uppercase tracking-[0.2em]"
        >
          <span>Engine v2.1</span>
          <span className="w-1 h-1 rounded-full bg-zinc-800" />
          <span>Local Context</span>
          <span className="w-1 h-1 rounded-full bg-zinc-800" />
          <span>Public Domain</span>
        </motion.footer>

        <SystemDoctor />
        <BackgroundForge />
        <ForgeModal appName={activeAppName} />
      </main>

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar {
          width: 0px;
        }
        body, html {
          background: transparent !important;
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  );
}
