"use client";

import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import MagicBar from "@/components/MagicBar";
import RecipeStore from "@/components/RecipeStore";
import SystemDoctor from "@/components/SystemDoctor";
import ForgeModal from "@/components/ForgeModal";
import BackgroundForge from "@/components/BackgroundForge";
import ConfirmModal from "@/components/ConfirmModal";
import { motion } from "motion/react";
import { X, Minus } from "lucide-react";
import { useAppStore, type ForgedApp } from "@/store/useAppStore";
import { getCurrentWindow } from "@tauri-apps/api/window";

export default function Home() {
  const { startForge, failForge, isHealthy, addForgedApp, forgedApps } = useAppStore();
  const [activeAppName, setActiveAppName] = useState("");
  const [duplicateApp, setDuplicateApp] = useState<{ url: string, name: string, icon?: string, themeColor?: string } | null>(null);

  const executeForge = async (url: string, name: string, icon?: string, themeColor?: string) => {
    setActiveAppName(name);
    startForge(name, themeColor);
    try {
      await invoke("forge_app", { url, name, forceDark: false, minimalist: false });
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
      console.error("forge_failed", error);
    }
  };

  const handleForge = async (url: string, name: string, icon?: string, themeColor?: string) => {
    if (!isHealthy) return;
    const existing = forgedApps.find(a => a.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      setDuplicateApp({ url, name, icon, themeColor });
      return;
    }
    executeForge(url, name, icon, themeColor);
  };

  const appWindow = typeof window !== "undefined" ? getCurrentWindow() : null;

  return (
    <div className="h-screen bg-zinc-950 text-foreground overflow-hidden rounded-[40px] border border-zinc-800/50 shadow-2xl relative flex flex-col">
      <header className="absolute top-8 left-8 right-8 z-[100] flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 bg-zinc-900/80 backdrop-blur-xl px-4 py-2 rounded-full border border-zinc-800/50 pointer-events-auto">
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse shadow-[0_0_8px_#8b5cf6]" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Purabo Core</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button 
            type="button"
            onClick={() => appWindow?.minimize()}
            className="p-2.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/50 rounded-full text-zinc-500 hover:text-white transition-all backdrop-blur-xl"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={() => appWindow?.close()}
            className="p-2.5 bg-rose-500/5 hover:bg-rose-500/20 border border-rose-500/10 text-zinc-500 hover:text-rose-400 rounded-full transition-all backdrop-blur-xl"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      <section className="relative pt-32 pb-12 flex flex-col items-center z-10 shrink-0">
        <div 
          role="button"
          tabIndex={-1}
          onMouseDown={() => appWindow?.startDragging()}
          className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing outline-none"
          aria-label="Drag Window"
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 pointer-events-none"
        >
          <h1 className="text-5xl font-black tracking-tight mb-2 text-white">Purabo</h1>
          <p className="text-zinc-500 text-sm font-medium tracking-wide">High-performance app factory.</p>
        </motion.div>

        <MagicBar onForge={handleForge} />
      </section>

      <div className="flex-1 min-h-0 overflow-hidden relative flex flex-col">
        <RecipeStore onForge={handleForge} />
      </div>

      <SystemDoctor />
      <BackgroundForge />
      <ForgeModal appName={activeAppName} />

      <ConfirmModal 
        isOpen={!!duplicateApp}
        title="Override App?"
        message={`"${duplicateApp?.name}" already exists. Re-forging will purge old sessions.`}
        confirmText="Overwrite"
        onConfirm={() => {
          if (duplicateApp) {
            invoke("delete_app", { name: duplicateApp.name }).ok();
            executeForge(duplicateApp.url, duplicateApp.name, duplicateApp.icon, duplicateApp.themeColor);
            setDuplicateApp(null);
          }
        }}
        onCancel={() => setDuplicateApp(null)}
      />

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { display: none; }
        body, html {
          background: transparent !important;
          margin: 0;
          padding: 0;
          height: 100vh;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
