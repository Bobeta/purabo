"use client";

import RecipeCard from "./RecipeCard";
import { useAppStore } from "@/store/useAppStore";
import { Trash2, FolderOpen } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

const MOCK_RECIPES = [
  {
    name: "WhatsApp",
    url: "https://web.whatsapp.com",
    icon: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
    description: "End-to-end encrypted messaging."
  },
  {
    name: "Claude",
    url: "https://claude.ai",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Claude_AI_logo.svg/1024px-Claude_AI_logo.svg.png",
    description: "Contextual reasoning engine."
  },
  {
    name: "Notion",
    url: "https://notion.so",
    icon: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
    description: "Unified knowledge workspace."
  },
  {
    name: "ChatGPT",
    url: "https://chatgpt.com",
    icon: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
    description: "Conversational reasoning model."
  },
  {
    name: "Discord",
    url: "https://discord.com/app",
    icon: "https://upload.wikimedia.org/wikipedia/commons/7/73/Discord_Color_Text_Logo.svg",
    description: "Community-first communication."
  },
  {
    name: "Gmail",
    url: "https://mail.google.com",
    icon: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg",
    description: "High-performance email management."
  }
];

interface RecipeStoreProps {
  onForge: (url: string, name: string) => void;
}

export default function RecipeStore({ onForge }: RecipeStoreProps) {
  const { forgedApps, removeApp } = useAppStore();

  const revealApps = async () => {
    try {
      await invoke("reveal_in_folder", { path: ".local/share/purabo/apps" });
    } catch (e) {
      console.error("reveal_failed", e);
    }
  };

  return (
    <div className="w-full max-w-5xl px-4 mt-16 space-y-16 pb-20">
      {forgedApps.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-violet-400 font-black text-sm tracking-[0.2em] uppercase">My Forge</h2>
            <div className="h-px flex-1 bg-violet-500/20 ml-6" />
            <button 
              type="button"
              onClick={revealApps}
              className="ml-6 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors text-xs font-bold uppercase tracking-wider"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Binaries
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {forgedApps.map((app) => (
              <div key={app.id} className="relative group/app">
                <RecipeCard 
                  name={app.name}
                  icon={app.icon}
                  themeColor={app.themeColor}
                  description={`Generated ${new Date(app.created_at).toLocaleDateString()}`}
                  onClick={() => onForge(app.url, app.name)}
                />
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (confirm(`Uninstall ${app.name}?`)) {
                      try {
                        await invoke("delete_app", { name: app.name });
                        removeApp(app.id);
                      } catch (err) {
                        removeApp(app.id);
                      }
                    }
                  }}
                  className="absolute top-4 right-4 p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl opacity-0 group-hover/app:opacity-100 transition-all duration-200 z-20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-zinc-500 font-black text-sm tracking-[0.2em] uppercase">Popular Recipes</h2>
          <div className="h-px flex-1 bg-zinc-800 ml-6" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {MOCK_RECIPES.map((recipe) => (
            <RecipeCard 
              key={recipe.name}
              {...recipe} 
              onClick={() => onForge(recipe.url, recipe.name)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
