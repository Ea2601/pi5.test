import { create } from 'zustand';
import { NavigationItem, CardSpec, SystemMetrics, WireGuardPeer, AutomationRule } from '../types';

interface AppState {
  // Navigation
  currentView: string;
  setCurrentView: (view: string) => void;
  
  // Cards
  cards: CardSpec[];
  cardLayouts: Record<string, any>;
  setCardLayouts: (layouts: Record<string, any>) => void;
  
  // Data
  systemMetrics: SystemMetrics | null;
  wireGuardPeers: WireGuardPeer[];
  automationRules: AutomationRule[];
  
  // UI State
  isMenuCollapsed: boolean;
  toggleMenu: () => void;
  selectedCard: string | null;
  setSelectedCard: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'dashboard',
  setCurrentView: (view) => set({ currentView: view }),
  
  cards: [],
  cardLayouts: {},
  setCardLayouts: (layouts) => set({ cardLayouts: layouts }),
  
  systemMetrics: null,
  wireGuardPeers: [],
  automationRules: [],
  
  isMenuCollapsed: false,
  toggleMenu: () => set((state) => ({ isMenuCollapsed: !state.isMenuCollapsed })),
  selectedCard: null,
  setSelectedCard: (id) => set({ selectedCard: id }),
}));

export const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Panel', icon: 'LayoutDashboard' },
  { id: 'devices', label: 'Cihazlar', icon: 'Router' },
  { id: 'network', label: 'Ağ', icon: 'Network' },
  { id: 'vpn', label: 'VPN', icon: 'Shield' },
  { id: 'automations', label: 'Otomasyon', icon: 'Zap' },
  { id: 'observability', label: 'İzleme', icon: 'Activity' },
  { id: 'storage', label: 'Depolama', icon: 'HardDrive' },
  { id: 'nvr', label: 'Güvenlik', icon: 'Camera' },
  { id: 'ai', label: 'Yapay Zeka', icon: 'Brain' },
  { id: 'settings', label: 'Ayarlar', icon: 'Settings' }
];