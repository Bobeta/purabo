"use client";

import { useEffect, useState } from "react";
import RecipeCard from "./RecipeCard";
import { useAppStore, type Recipe } from "@/store/useAppStore";
import { Trash2, FolderOpen, RefreshCcw } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { cn } from "@/lib/utils";

const WEB_FALLBACK_RECIPES: Recipe[] = [
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
    name: "GitHub",
    url: "https://github.com",
    icon: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg",
    description: "Developer collaboration platform."
  }
];

interface RecipeStoreProps {
  onForge: (url: string, name: string) => void;
}

export default function RecipeStore({ onForge }: RecipeStoreProps) {
  const { forgedApps, removeApp, recipes, setRecipes } = useAppStore();
  const [loading, setLoading] = useState(false);

  const fetchRecipes = async () => {
    // Detect if we are in a regular browser tab or Tauri
    const isTauri = typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__;

    if (!isTauri) {
      setRecipes(WEB_FALLBACK_RECIPES);
      return;
    }

    setLoading(true);
    try {
      const remoteRecipes = await invoke<Recipe[]>("fetch_recipes");
      setRecipes(remoteRecipes);
    } catch (e) {
      console.error("fetch_recipes_failed", e);
      // Fallback on error
      setRecipes(WEB_FALLBACK_RECIPES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (recipes.length === 0) {
      fetchRecipes();
    }
  }, []);

  const revealApps = async () => {
    try {
      await invoke("reveal_in_folder", { path: ".local/share/purabo/apps" });
    } catch (e) {
      console.error("reveal_failed", e);
    }
  };

  return (
    <div className="w-full max-w-5xl px-4 mt-16 space-y-16 pb-20">
      {/* My Forge Section */}
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
                      } catch (_err) {
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

      {/* Popular Recipes Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-zinc-500 font-black text-sm tracking-[0.2em] uppercase">Popular Recipes</h2>
          <div className="h-px flex-1 bg-zinc-800 ml-6" />
          <button 
            type="button"
            onClick={fetchRecipes}
            className="ml-6 p-2 text-zinc-600 hover:text-zinc-400 transition-colors"
            title="Refresh Recipes"
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
          {recipes.length === 0 && !loading && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-zinc-900 rounded-3xl">
              <p className="text-zinc-600 font-medium">No recipes loaded. Check your connection.</p>
              <button 
                type="button"
                onClick={fetchRecipes}
                className="mt-4 text-violet-500 font-bold hover:text-violet-400"
              >
                Retry Load
              </button>
            </div>
          )}
          {loading && recipes.length === 0 && (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 bg-zinc-950/40 border border-zinc-900 rounded-[32px] animate-pulse" />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
