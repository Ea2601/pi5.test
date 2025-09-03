interface CardState {
  cards: any[];
  cardLayouts: Record<string, any>;
  selectedCard: string | null;
}

export const createCardSlice = (set: any) => ({
  cards: [],
  cardLayouts: {},
  selectedCard: null,
  
  setCardLayouts: (layouts: Record<string, any>) => set((state: any) => ({
    ...state,
    cardLayouts: layouts
  })),
  
  setSelectedCard: (id: string | null) => set((state: any) => ({
    ...state,
    selectedCard: id
  }))
});