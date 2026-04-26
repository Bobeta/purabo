"use client";

import { useState, useEffect, useRef } from "react";
import { Link2, Wand2, Loader2, Moon, Sun, ZapOff, Layout } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { cn } from "@/lib/utils";

interface MagicBarProps {
  onForge: (url: string, name: string, icon?: string, themeColor?: string, forceDark?: boolean, minimalist?: boolean) => void;
}

export default function MagicBar({ onForge }: MagicBarProps) {
  const [url, setUrl] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMinimalist, setIsMinimalist] = useState(true);
  const [metadata, setMetadata] = useState<{ name: string; icon_url?: string; theme_color: string } | null>(null);
  const fetchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (fetchTimeout.current) clearTimeout(fetchTimeout.current);
    
    if (url.startsWith("http")) {
      setIsFetching(true);
      fetchTimeout.current = setTimeout(async () => {
        try {
          const data = await invoke<{ name: string; icon_url?: string; theme_color: string }>("fetch_metadata", { url });
          setMetadata(data);
        } catch (e) {
          console.error("fetch_failed", e);
        } finally {
          setIsFetching(false);
        }
      }, 800);
    } else {
      setMetadata(null);
      setIsFetching(false);
    }
  }, [url]);

  const handleForge = () => {
    if (!url) return;
    const name = metadata?.name || "Custom App";
    onForge(url, name, metadata?.icon_url, metadata?.theme_color, isDarkMode, isMinimalist);
  };

  return (
    <div className="w-full max-w-2xl px-4 relative z-10">
      <div className="flex justify-end gap-3 mb-4 px-2">
        <button 
          type="button"
          onClick={() => setIsMinimalist(!isMinimalist)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300",
            isMinimalist 
              ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
              : "bg-zinc-900 text-zinc-500 border border-zinc-800"
          )}
        >
          {isMinimalist ? <Layout className="w-3 h-3" /> : <ZapOff className="w-3 h-3" />}
          {isMinimalist ? "Minimalist Active" : "Full Interface"}
        </button>

        <button 
          type="button"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300",
            isDarkMode 
              ? "bg-violet-600/10 text-violet-400 border border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.1)]" 
              : "bg-zinc-900 text-zinc-500 border border-zinc-800"
          )}
        >
          {isDarkMode ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
          {isDarkMode ? "Dark Theme" : "Native Theme"}
        </button>
      </div>
      
      <div
        className={cn(
          "relative group transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] will-change-transform",
          isFocused ? "scale-[1.015]" : "scale-100"
        )}
      >
        <div className={cn(
          "absolute -inset-1 bg-gradient-to-r from-violet-600/10 via-fuchsia-500/10 to-violet-600/10 rounded-[22px] blur-2xl transition-opacity duration-500",
          isFocused ? "opacity-100" : "opacity-0"
        )} />
        
        <div className={cn(
          "absolute -inset-[1px] bg-zinc-800 rounded-[21px] transition-colors duration-300",
          isFocused ? "bg-zinc-700" : "group-hover:bg-zinc-800"
        )} />

        <div className="relative flex items-center bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden px-6 h-18 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]">
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900 transition-all duration-300 overflow-hidden",
            isFocused && "bg-zinc-800 text-violet-400"
          )}>
            {isFetching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : metadata?.icon_url ? (
              <img src={metadata.icon_url} className="w-6 h-6 object-contain" alt="icon" />
            ) : (
              <Link2 className={cn(
                "w-5 h-5 transition-transform duration-300",
                isFocused ? "rotate-45 scale-110" : "text-zinc-500"
              )} />
            )}
          </div>
          
          <div className="flex-1 flex flex-col ml-4">
            {metadata && (
              <span className="text-[10px] text-violet-400 font-black uppercase tracking-widest absolute -top-1">
                Resolved: {metadata.name}
              </span>
            )}
            <input
              type="text"
              placeholder="Inject URL to optimize..."
              className="bg-transparent border-none outline-none text-zinc-100 placeholder:text-zinc-600 text-lg font-medium selection:bg-violet-500/30 w-full"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => e.key === 'Enter' && handleForge()}
            />
          </div>

          <button
            type="button"
            onClick={handleForge}
            disabled={!url || isFetching}
            className={cn(
              "ml-4 px-6 h-11 rounded-xl font-bold flex items-center gap-2 transition-all duration-200",
              url && !isFetching
                ? "bg-violet-600 text-white opacity-100 translate-x-0 shadow-lg shadow-violet-600/20 active:scale-95" 
                : "bg-zinc-900 text-zinc-600 opacity-0 translate-x-4 pointer-events-none"
            )}
          >
            <Wand2 className="w-4 h-4" />
            <span>Forge</span>
          </button>
        </div>
      </div>
    </div>
  );
}
