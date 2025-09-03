import { create } from 'zustand';
import { NavigationItem } from '../types';
import { createNavigationSlice } from './slices/navigationSlice';
import { createDataSlice } from './slices/dataSlice';
import { createCardSlice } from './slices/cardSlice';

export const useAppStore = create((set) => ({
  ...createNavigationSlice(set),
  ...createDataSlice(set),
  ...createCardSlice(set)
}));
