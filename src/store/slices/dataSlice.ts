interface DataState {
  systemMetrics: any;
  wireGuardPeers: any[];
  automationRules: any[];
}

export const createDataSlice = (set: any) => ({
  systemMetrics: null,
  wireGuardPeers: [],
  automationRules: [],
  
  setSystemMetrics: (metrics: any) => set((state: any) => ({
    ...state,
    systemMetrics: metrics
  })),
  
  setWireGuardPeers: (peers: any[]) => set((state: any) => ({
    ...state,
    wireGuardPeers: peers
  }))
});