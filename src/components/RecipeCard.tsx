"use client";

import { cn } from "@/lib/utils";

interface RecipeCardProps {
  name: string;
  icon: string;
  description: string;
  themeColor?: string;
  onClick?: () => void;
}

export default function RecipeCard({ name, icon, description, themeColor = "#8b5cf6", onClick }: RecipeCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      style={{ '--brand-color': themeColor } as React.CSSProperties}
      className={cn(
        "relative bg-zinc-950/40 border border-zinc-800/80 p-7 rounded-[32px] cursor-pointer overflow-hidden backdrop-blur-xl",
        "transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
        "hover:border-[var(--brand-color)]/40 hover:-translate-y-1.5",
        "active:scale-[0.98] active:duration-100",
        "group will-change-transform"
      )}
    >
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${themeColor}22, transparent 70%)` }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex flex-col items-center text-center z-10">
        <div 
          style={{ boxShadow: `0 0 40px -10px ${themeColor}22` }}
          className={cn(
            "w-24 h-24 rounded-[28px] bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-8 relative",
            "transition-all duration-300 ease-out group-hover:bg-zinc-800 group-hover:scale-105 group-hover:border-zinc-700"
          )}
        >
          <div className="relative w-14 h-14 transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
            <img 
              src={icon} 
              alt={name} 
              className="w-full h-full object-contain" 
            />
          </div>
        </div>
        
        <div className="space-y-2.5">
          <h3 className="text-zinc-100 font-bold text-2xl tracking-tight group-hover:text-white transition-colors duration-200">{name}</h3>
          <p className="text-zinc-500 text-[13px] leading-relaxed max-w-[180px] mx-auto font-medium transition-colors duration-200 group-hover:text-zinc-400">
            {description}
          </p>
        </div>

        <div className="mt-8 h-8 overflow-hidden relative">
          <div 
            style={{ backgroundColor: themeColor }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black text-white uppercase tracking-[0.1em] translate-y-10 group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-lg"
          >
            Forge App
          </div>
        </div>
      </div>
    </div>
  );
}
