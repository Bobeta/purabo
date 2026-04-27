"use client";

import { useEffect, useState } from "react";
import RecipeCard from "./RecipeCard";
import ConfirmModal from "./ConfirmModal";
import { useAppStore, type ForgedApp, type Recipe } from "@/store/useAppStore";
import { Trash2, FolderOpen, RefreshCcw } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { cn } from "@/lib/utils";

const WEB_FALLBACK_RECIPES: Recipe[] = [
  {
    name: "WhatsApp",
    url: "https://web.whatsapp.com",
    icon: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
    description: "Secure messaging."
  },
  {
    name: "Claude",
    url: "https://claude.ai",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Claude_AI_logo.svg/1024px-Claude_AI_logo.svg.png",
    description: "Advanced reasoning."
  },
  {
    name: "GitHub",
    url: "https://github.com",
    icon: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg",
    description: "Code collaboration."
  },
  {
    name: "Linear",
    url: "https://linear.app",
    icon: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Linear_logo.svg",
    description: "Modern planning."
  }
];

interface RecipeStoreProps {
  onForge: (url: string, name: string) => void;
}

export default function RecipeStore({ onForge }: RecipeStoreProps) {
  const { forgedApps, removeApp, recipes, setRecipes } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [appToUninstall, setAppToUninstall] = useState<ForgedApp | null>(null);

  const fetchRecipes = async () => {
    const isTauri = typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__;
    if (!isTauri) {
      setRecipes(WEB_FALLBACK_RECIPES);
      return;
    }

    setLoading(true);
    try {
      const remoteRecipes = await invoke<Recipe[]>("fetch_recipes");
      setRecipes(remoteRecipes);
    } catch (_e) {
      setRecipes(WEB_FALLBACK_RECIPES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (recipes.length === 0) fetchRecipes();
  }, []);

  const revealApps = async () => {
    try {
      await invoke("reveal_in_folder", { path: ".local/share/purabo/apps" });
    } catch (_e) {}
  };

  const handleUninstall = async () => {
    if (!appToUninstall) return;
    try {
      await invoke("delete_app", { name: appToUninstall.name });
      removeApp(appToUninstall.id);
    } catch (_err) {
      removeApp(appToUninstall.id);
    } finally {
      setAppToUninstall(null);
    }
  };

  return (
    <div className="w-full flex flex-col flex-1 min-h-0">
      <ConfirmModal 
        isOpen={!!appToUninstall}
        title={`Uninstall ${appToUninstall?.name}?`}
        message="This will completely remove the binary and all browser data."
        onConfirm={handleUninstall}
        onCancel={() => setAppToUninstall(null)}
      />

      {/* Main Container - Vertical Space Managed */}
      <div className="flex-1 flex flex-col gap-12 overflow-y-auto custom-scroll px-4">
        
        {/* My Forge Section - Horizontal Carousel */}
        {forgedApps.length > 0 && (
          <section className="w-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_10px_#8b5cf6]" />
                <h2 className="text-zinc-100 font-black text-xs uppercase tracking-[0.2em]">My Forge</h2>
              </div>
              <button 
                type="button"
                onClick={revealApps}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors text-[10px] font-black uppercase tracking-wider"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                Binaries
              </button>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-6 custom-scroll">
              {forgedApps.map((app) => (
                <div key={app.id} className="relative group/app shrink-0 w-[240px]">
                  <RecipeCard 
                    name={app.name}
                    icon={app.icon}
                    themeColor={app.themeColor}
                    description={`Generated ${new Date(app.created_at).toLocaleDateString()}`}
                    onClick={() => onForge(app.url, app.name)}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAppToUninstall(app);
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

        {/* Popular Recipes Section - Dynamic Grid */}
        <section className="w-full pb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-zinc-500" />
              <h2 className="text-zinc-500 font-black text-xs uppercase tracking-[0.2em]">Templates</h2>
            </div>
            <button 
              type="button"
              onClick={fetchRecipes}
              className="p-2 text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recipes.map((recipe) => (
              <RecipeCard 
                key={recipe.name}
                {...recipe} 
                onClick={() => onForge(recipe.url, recipe.name)}
              />
            ))}
            {loading && recipes.length === 0 && (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-64 bg-zinc-950/40 border border-zinc-900 rounded-[32px] animate-pulse" />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
