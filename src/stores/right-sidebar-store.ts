import { create } from "zustand"
import { persist } from "zustand/middleware"

interface RightSidebarState {
  open: boolean
  state: "expanded" | "collapsed"
  setOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useRightSidebarStore = create<RightSidebarState>()(
  persist(
    (set, get) => ({
      open: true,
      state: "expanded",
      setOpen: (open: boolean) => {
        set({ open, state: open ? "expanded" : "collapsed" })
      },
      toggleSidebar: () => {
        const { open } = get()
        set({ open: !open, state: !open ? "expanded" : "collapsed" })
      },
    }),
    {
      name: "right-sidebar-state",
      partialize: (state) => ({ open: state.open }),
    },
  ),
)
