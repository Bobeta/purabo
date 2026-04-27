"use client";

import { useState, useEffect, useRef } from "react";
import { Link2, Wand2, Loader2 } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { cn } from "@/lib/utils";

interface MagicBarProps {
  onForge: (url: string, name: string, icon?: string, themeColor?: string) => void;
}

export default function MagicBar({ onForge }: MagicBarProps) {
  const [url, setUrl] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
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
    onForge(url, name, metadata?.icon_url, metadata?.theme_color);
  };

  return (
    <div className="w-full max-w-xl mx-auto relative z-20">
      <div
        className={cn(
          "relative flex items-center bg-zinc-900/40 border-2 rounded-full px-6 h-16 transition-all duration-500 backdrop-blur-2xl",
          isFocused 
            ? "border-violet-500/50 shadow-[0_0_40px_rgba(139,92,246,0.2)] bg-zinc-900/60 scale-[1.02]" 
            : "border-zinc-800 shadow-2xl scale-100"
        )}
      >
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
          isFocused ? "text-violet-400 rotate-12" : "text-zinc-500"
        )}>
          {isFetching ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : metadata?.icon_url ? (
            <img src={metadata.icon_url} className="w-7 h-7 object-contain rounded-lg" alt="icon" />
          ) : (
            <Link2 className="w-5 h-5" />
          )}
        </div>
        
        <div className="flex-1 flex flex-col ml-4">
          <input
            type="text"
            placeholder="Paste URL to forge native app..."
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
            "ml-2 px-6 h-10 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2",
            url && !isFetching
              ? "bg-white text-black opacity-100 translate-x-0 shadow-xl hover:bg-zinc-200" 
              : "bg-zinc-800 text-zinc-600 opacity-0 translate-x-4 pointer-events-none"
          )}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Forge</span>
        </button>
      </div>
      
      {/* Resolved indicator floating below */}
      <div className={cn(
        "absolute left-1/2 -translate-x-1/2 -bottom-8 transition-all duration-500 pointer-events-none",
        metadata ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      )}>
        <span className="text-[10px] font-black text-violet-500 uppercase tracking-[0.3em] whitespace-nowrap bg-violet-500/5 px-3 py-1 rounded-full border border-violet-500/10 backdrop-blur-xl">
          Target: {metadata?.name}
        </span>
      </div>
    </div>
  );
}
