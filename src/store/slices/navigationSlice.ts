interface NavigationState {
  currentView: string;
  isMenuCollapsed: boolean;
}

export const createNavigationSlice = (set: any) => ({
  currentView: 'dashboard',
  isMenuCollapsed: false,
  
  setCurrentView: (view: string) => set((state: any) => ({ 
    ...state, 
    currentView: view 
  })),
  
  toggleMenu: () => set((state: any) => ({ 
    ...state, 
    isMenuCollapsed: !state.isMenuCollapsed 
  }))
});