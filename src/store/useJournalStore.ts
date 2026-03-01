import { create } from 'zustand';
import { analyzeSentiment } from '../utils/sentiment'; // Az önce yazdığımız algoritmayı içeri aktarıyoruz

interface JournalState {
  text: string;
  wordCount: number;
  sentimentScore: number | null; // Henüz analiz yapılmadıysa null
  setText: (newText: string) => void;
  saveEntry: () => void; // Kaydetme fonksiyonumuz
}

export const useJournalStore = create<JournalState>((set, get) => ({
  text: '',
  wordCount: 0,
  sentimentScore: null,
  
  setText: (newText) => {
    const count = newText.trim().length > 0 ? newText.trim().split(/\s+/).length : 0;
    set({ 
      text: newText, 
      wordCount: count 
    });
  },

  saveEntry: () => {
    const currentText = get().text;
    
    // Eğer metin boşsa işlem yapma
    if (currentText.trim() === '') return;

    // 1. Duygu skorunu hesapla
    const score = analyzeSentiment(currentText);
    
    // 2. Skoru state'e kaydet (Şimdilik state'e, yakında Firestore'a kaydedeceğiz)
    set({ sentimentScore: score });

    // Test için konsola yazdırıyoruz (Gerçek cihazda veya emülatörde loglarda görebilirsin)
    console.log(`Kaydedilen Metin: "${currentText}"`);
    console.log(`Hesaplanan Duygu Skoru: ${score}`);
  },
}));