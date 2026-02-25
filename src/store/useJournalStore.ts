import { create } from 'zustand';

// Store'umuzun tip tanımlamaları (TypeScript için)
interface JournalState {
  entryText: string;
  wordCount: number;
  setEntryText: (text: string) => void;
  clearEntry: () => void;
}

// Zustand store'u oluşturuyoruz
export const useJournalStore = create<JournalState>((set) => ({
  entryText: '',
  wordCount: 0,
  
  // Kullanıcı yazı yazdıkça hem metni güncelleyen hem de kelimeyi sayan fonksiyon
  setEntryText: (text) => {
    // Metni boşluklardan bölerek kelime sayısını hesaplıyoruz
    const words = text.trim().split(/\s+/);
    const count = text.trim() === '' ? 0 : words.length;
    
    set({ entryText: text, wordCount: count });
  },
  
  // Kayıt sonrası alanı temizlemek için
  clearEntry: () => set({ entryText: '', wordCount: 0 }),
}));