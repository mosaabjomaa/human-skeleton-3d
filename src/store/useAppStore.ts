import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BoneGroup, Language } from "../data/types";
export interface AppState {
  selectedId: string | null;
  hoveredId: string | null;
  panelOpen: boolean;
  language: Language;
  query: string;
  region: "all" | "axial" | "appendicular";
  group: BoneGroup | "all";
  isolate: boolean;
  wireframe: boolean;
  autoRotate: boolean;
  explode: number;
  resetNonce: number;
  view: "front" | "back" | "left" | "right";
  sidebarOpen: boolean;
  selectBone: (id: string) => void;
  closePanel: () => void;
  setHovered: (id: string | null) => void;
  setLanguage: (language: Language) => void;
  setQuery: (query: string) => void;
  setRegion: (region: AppState["region"]) => void;
  setGroup: (group: AppState["group"]) => void;
  toggle: (key: "isolate" | "wireframe" | "autoRotate" | "sidebarOpen") => void;
  setExplode: (value: number) => void;
  reset: () => void;
  setView: (view: AppState["view"]) => void;
}
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedId: null,
      hoveredId: null,
      panelOpen: false,
      language: "en",
      query: "",
      region: "all",
      group: "all",
      isolate: false,
      wireframe: false,
      autoRotate: false,
      explode: 0,
      resetNonce: 0,
      view: "front",
      sidebarOpen: false,
      selectBone: (id) =>
        set({
          selectedId: id,
          panelOpen: true,
          hoveredId: null,
          region: "all",
          group: "all",
          sidebarOpen: false,
          autoRotate: false,
        }),
      closePanel: () => set({ panelOpen: false }),
      setHovered: (id) => set({ hoveredId: id }),
      setLanguage: (language) => set({ language }),
      setQuery: (query) => set({ query }),
      setRegion: (region) =>
        set({ region, selectedId: null, panelOpen: false, isolate: false }),
      setGroup: (group) =>
        set({ group, selectedId: null, panelOpen: false, isolate: false }),
      toggle: (key) => set((state) => ({ [key]: !state[key] })),
      setExplode: (explode) => set({ explode }),
      reset: () =>
        set((state) => ({
          selectedId: null,
          hoveredId: null,
          panelOpen: false,
          region: "all",
          group: "all",
          isolate: false,
          wireframe: false,
          explode: 0,
          autoRotate: false,
          view: "front",
          resetNonce: state.resetNonce + 1,
        })),
      setView: (view) =>
        set((state) => ({
          view,
          selectedId: null,
          panelOpen: false,
          isolate: false,
          resetNonce: state.resetNonce + 1,
        })),
    }),
    {
      name: "osseo-preferences",
      partialize: (state) => ({ language: state.language }),
    },
  ),
);
