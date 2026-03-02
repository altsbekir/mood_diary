import { create } from 'zustand';
import { analyzeSentiment } from '../utils/sentiment';
import { db } from '../services/firebaseConfig'; 
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';
import { ThemeMap } from '../theme/ThemeMap';

interface JournalState {
  text: string;
  wordCount: number;
  sentimentScore: number | null;
  streak: number;
  markedDates: Record<string, any>;
  entriesByDate: Record<string, any>; // YENİ: Geçmiş günlükleri tarihe göre tutacağımız hafıza
  setText: (newText: string) => void;
  saveEntry: () => Promise<void>;
  fetchStreak: () => Promise<void>;
}

export const useJournalStore = create<JournalState>((set, get) => ({
  text: '',
  wordCount: 0,
  sentimentScore: null,
  streak: 0,
  markedDates: {},
  entriesByDate: {}, // YENİ: Başlangıçta boş
  
  setText: (newText) => {
    const count = newText.trim().length > 0 ? newText.trim().split(/\s+/).length : 0;
    set({ text: newText, wordCount: count });
  },

  fetchStreak: async () => {
    try {
      const q = query(collection(db, 'journals'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const dates = new Set<string>();
      const marks: Record<string, any> = {}; 
      const entries: Record<string, any> = {}; // YENİ: Geçmiş kayıtlar
      
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        const docDate = docData.date;

        if (!dates.has(docDate)) {
          dates.add(docDate);
          
          // Kaydı sözlüğe (hafızaya) ekliyoruz
          entries[docDate] = docData;

          const score = docData.sentimentScore ?? 0; 
          const dayTheme = ThemeMap[score] || ThemeMap[0]; 
        
          marks[docDate] = { 
            customStyles: {
              container: { backgroundColor: dayTheme.primary, borderRadius: 8 },
              text: { color: '#F8FAFC', fontWeight: 'bold' }
            }
          };
        }
      });

      const getFormattedDate = (dateObj: Date) => dateObj.toISOString().split('T')[0];

      // YENİ: Her geçmiş kayıt için o günkü seriyi (streak) geriye dönük hesaplıyoruz!
      Object.keys(entries).forEach(dateStr => {
        let historicalStreak = 0;
        let tempDate = new Date(dateStr);
        
        // O günden başlayıp geriye doğru kesintisiz günleri sayıyoruz
        while(dates.has(getFormattedDate(tempDate))) {
          historicalStreak++;
          tempDate.setDate(tempDate.getDate() - 1);
        }
        // Hesaplanan seriyi o kayda ekliyoruz
        entries[dateStr].historicalStreak = historicalStreak;
      });

      let currentStreak = 0;
      const checkDate = new Date(); 

      const todayStr = getFormattedDate(checkDate);
      
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = getFormattedDate(checkDate);

      if (!dates.has(todayStr) && !dates.has(yesterdayStr)) {
        set({ streak: 0, markedDates: marks, entriesByDate: entries }); 
        return;
      }

      checkDate.setTime(new Date().getTime()); 
      
      while (true) {
        const dateStr = getFormattedDate(checkDate);
        
        if (dates.has(dateStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          if (dateStr === todayStr) {
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      // entriesByDate state'e eklendi
      set({ streak: currentStreak, markedDates: marks, entriesByDate: entries }); 
      console.log(`[Streak] Seri hesaplandı: ${currentStreak}`);

    } catch (error) {
      console.error("[Firebase HATA] Streak hesaplanırken hata oluştu:", error);
    }
  },

  saveEntry: async () => {
    const currentText = get().text;
    if (currentText.trim() === '') return;

    const score = analyzeSentiment(currentText);
    set({ sentimentScore: score });

    // 1. KAYIP LOG GERİ GELDİ: Duygu Analizi
    console.log(`[Zustand] Metin analiz edildi. Skor: ${score}`);

    try {
      const todayDate = new Date().toISOString().split('T')[0];

      const docRef = await addDoc(collection(db, 'journals'), {
        text: currentText,
        wordCount: get().wordCount,
        sentimentScore: score,
        date: todayDate,
        createdAt: serverTimestamp(),
      });
      
      // 2. KAYIP LOG GERİ GELDİ: Firebase Başarı Durumu
      console.log("[Firebase BAŞARILI] Belge Firebase'e yazıldı! ID:", docRef.id);

      await get().fetchStreak();
      
    } catch (error) {
      console.error("[Firebase HATA] Kayıt başarısız oldu:", error);
    }
  },
}));