// src/utils/sentiment.ts

const POSITIVE_WORDS = ['mutlu', 'güzel', 'harika', 'iyi', 'süper', 'sevinç', 'huzur', 'neşe', 'umut', 'başarı', 'şahane', 'keyif', 'heyecan', 'muhteşem', 'sev', 'gül'];
const NEGATIVE_WORDS = ['üzgün', 'kötü', 'berbat', 'sinir', 'öfke', 'ağla', 'yalnız', 'stres', 'kaygı', 'yorgun', 'kırgın', 'mutsuz', 'kork', 'endişe', 'bık'];

// Türkçeye özel ayırımlar
const PRE_NEGATORS = ['hiç']; // Genelde duygudan önce gelir (Örn: "hiç iyi")
const POST_NEGATORS = ['değil', 'yok']; // Genelde duygudan sonra gelir (Örn: "iyi bir gün değildi")
const INTENSIFIERS = ['çok', 'aşırı', 'baya', 'fazla', 'epey']; // Pekiştiriciler

export const analyzeSentiment = (text: string): number => {
  if (!text || text.trim() === '') return 0;

  // Noktalama işaretlerini temizle ve kelimelere böl
  const words = text.toLocaleLowerCase('tr-TR').replace(/[.,!?;:]/g, '').split(/\s+/);
  
  let totalScore = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let wordScore = 0;

    const isPositive = POSITIVE_WORDS.some(p => word.includes(p));
    const isNegative = NEGATIVE_WORDS.some(n => word.includes(n));

    if (isPositive) wordScore = 1;
    if (isNegative) wordScore = -1;

    // Eğer duygu belirten bir kelime bulduysak, etrafındaki "pencereye" bakalım
    if (wordScore !== 0) {
      let hasIntensifier = false;
      let hasNegator = false;

      // 1. Geriye Doğru Bak (Maksimum 2 kelime): Pekiştirici veya 'hiç' var mı?
      for (let j = Math.max(0, i - 2); j < i; j++) {
        if (INTENSIFIERS.some(int => words[j].includes(int))) hasIntensifier = true;
        if (PRE_NEGATORS.some(neg => words[j].includes(neg))) hasNegator = true;
      }

      // 2. İleriye Doğru Bak (Maksimum 3 kelime): 'değil' veya 'yok' var mı? 
      // (Örn: "harika(i) bir(i+1) gün(i+2) değildi(i+3)")
      for (let j = i + 1; j <= Math.min(words.length - 1, i + 3); j++) {
        if (POST_NEGATORS.some(neg => words[j].includes(neg))) hasNegator = true;
      }

      // Bulunanlara göre skoru güncelle
      if (hasIntensifier) wordScore *= 2; // "çok harika" -> +2
      if (hasNegator) wordScore *= -1;    // "harika değil" -> -1 VEYA "çok harika değil" -> -2

      totalScore += wordScore;
    }
  }

  // Sınırlandırma (Clamp)
  if (totalScore > 2) return 2;
  if (totalScore < -2) return -2;
  
  return totalScore;
};