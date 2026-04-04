"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface SystemCheck {
  name: string;
  installed: boolean;
  description: string;
}

export interface ForgedApp {
  id: string;
  name: string;
  url: string;
  icon: string;
  themeColor: string;
  created_at: number;
}

interface ForgeState {
  isBuilding: boolean;
  isMinimized: boolean;
  progress: number;
  status: string;
  themeColor: string;
  error: string | null;
}

interface AppState {
  // ... rest of interface
  // Forged Apps Library
  forgedApps: ForgedApp[];
  addForgedApp: (app: ForgedApp) => void;
  removeApp: (id: string) => void;

  // Forge Logic
  forge: ForgeState;
  startForge: (name: string, themeColor?: string) => void;
  updateForge: (progress: number, status: string) => void;
  setMinimized: (minimized: boolean) => void;
  failForge: (error: string) => void;
  resetForge: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      checks: [],
      isHealthy: false,
      isChecking: false,
      setChecks: (checks) => set({ 
        checks, 
        isHealthy: checks.length > 0 && checks.every(c => c.installed) 
      }),
      setChecking: (isChecking) => set({ isChecking }),

      forgedApps: [],
      addForgedApp: (app) => set((state) => ({ 
        forgedApps: [app, ...state.forgedApps.filter(a => a.url !== app.url)] 
      })),
      removeApp: (id) => set((state) => ({ 
        forgedApps: state.forgedApps.filter(a => a.id !== id) 
      })),

      forge: {
        isBuilding: false,
        isMinimized: false,
        progress: 0,
        status: "",
        themeColor: "#8b5cf6",
        error: null,
      },
      startForge: (name, themeColor) => set({ 
        forge: { 
          isBuilding: true, 
          isMinimized: false,
          progress: 0, 
          status: `Initializing forge for ${name}...`, 
          themeColor: themeColor || "#8b5cf6",
          error: null 
        } 
      }),
      updateForge: (progress, status) => set((state) => ({ 
        forge: { ...state.forge, progress, status } 
      })),
      setMinimized: (isMinimized) => set((state) => ({
        forge: { ...state.forge, isMinimized }
      })),
      failForge: (error) => set((state) => ({ 
        forge: { ...state.forge, isBuilding: false, isMinimized: false, error } 
      })),
      resetForge: () => set({ 
        forge: { isBuilding: false, isMinimized: false, progress: 0, status: "", themeColor: "#8b5cf6", error: null } 
      }),
    }),
    {
      name: "purabo-app-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ forgedApps: state.forgedApps }),
    }
  )
);
