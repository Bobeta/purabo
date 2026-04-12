"use client";

import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import MagicBar from "@/components/MagicBar";
import RecipeStore from "@/components/RecipeStore";
import SystemDoctor from "@/components/SystemDoctor";
import ForgeModal from "@/components/ForgeModal";
import BackgroundForge from "@/components/BackgroundForge";
import { motion } from "motion/react";
import { useAppStore, type ForgedApp } from "@/store/useAppStore";

export default function Home() {
  const { startForge, failForge, isHealthy, addForgedApp } = useAppStore();
  const [activeAppName, setActiveAppName] = useState("");

  const handleForge = async (url: string, name: string, icon?: string, themeColor?: string, forceDark?: boolean) => {
    if (!isHealthy) {
      alert("Please heal your system dependencies before forging an app.");
      return;
    }

    setActiveAppName(name);
    startForge(name, themeColor);

    try {
      await invoke("forge_app", { url, name, forceDark: !!forceDark });

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
      console.error("Forge failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-violet-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-500/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative flex flex-col items-center pt-24 pb-20 px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            v1.0.0 "Noble"
          </div>
          <h1 className="text-6xl font-bold tracking-tight mb-4 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
            Purabo
          </h1>
          <p className="text-zinc-500 text-lg max-w-md mx-auto leading-relaxed">
            The minimalist app factory. Turn any web experience into a native desktop application.
          </p>
        </motion.div>

        <MagicBar onForge={handleForge} />
        <RecipeStore onForge={handleForge} />

        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-32 text-zinc-600 text-xs flex items-center gap-4"
        >
          <span>Built on Pake & Tauri</span>
          <span className="w-1 h-1 rounded-full bg-zinc-800" />
          <span>Local Compilation</span>
          <span className="w-1 h-1 rounded-full bg-zinc-800" />
          <span>Open Source</span>
        </motion.footer>

        <SystemDoctor />
        <BackgroundForge />
        <ForgeModal appName={activeAppName} />
      </main>
    </div>
  );
}
