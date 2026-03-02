// js/sentiment.js

const positiveRoots = [
  'sev', 'mutlu', 'harik', 'güzel', 'iyi', 'muhteşem', 'başarı', 'huzur', 
  'heyecan', 'süper', 'şahan', 'neşe', 'keyif', 'mükemmel', 'şans', 'gurur', 'rahat'
];

const negativeRoots = [
  'üz', 'köt', 'berbat', 'iğrenç', 'sinir', 'öfk', 'kız', 'kır', 
  'stres', 'yorg', 'kork', 'nefret', 'mahv', 'tüken', 'çaresiz', 'bık', 'ağla', 
  'felaket', 'acı', 'yalnız', 'mutsuz', 'başarısız', 'umutsuz'
];

// Pekiştiriciler (Duygunun şiddetini 2'ye katlar)
const amplifiers = ['çok', 'aşırı', 'en', 'fazla', 'inanılmaz', 'bayağı', 'müthiş', 'olağanüstü', 'fazlasıyla'];

// -ma, -me, -mı, -mi, -sız, -siz vb.
const negationRegex = /(m[aeıioöuü]y?|m[ae]z|m[ae]d|s[ıiuü]z)/;

// Duyguyu tersine çeviren yardımcı fiiller
const auxiliaries = ['hisset', 'ol', 'geç', 'yap', 'kal', 'bırak', 'ver'];

export function analyzeSentiment(text) {
  if (!text) return 0; // Güvenlik kontrolü

  const lowerText = text.toLocaleLowerCase('tr-TR');
  
  // 1. ŞAHANE HAMLE: Cümleyi virgül, nokta, ünlem ve soru işaretlerinden "yan cümleciklere" ayırıyoruz!
  const clauses = lowerText.split(/[.,!?;\n]+/);
  
  let totalScore = 0;

  for (const clause of clauses) {
    const words = clause.trim().split(/\s+/).filter(w => w.length > 0);
    let clauseScore = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let wordScore = 0;
      let matchedRoot = '';

      for (const root of positiveRoots) {
        if (word.startsWith(root)) {
          wordScore = 1; matchedRoot = root; break;
        }
      }

      if (wordScore === 0) {
        for (const root of negativeRoots) {
          if (word.startsWith(root)) {
            wordScore = -1; matchedRoot = root; break;
          }
        }
      }

      if (wordScore !== 0) {
        const remainder = word.slice(matchedRoot.length);
        let isNegated = negationRegex.test(remainder);
        let isAmplified = false; // YENİ: Pekiştirici kontrolü

        if (!isNegated) {
          // Geriye doğru 3 kelime
          const start = Math.max(0, i - 3);
          for (let j = start; j < i; j++) {
            if (words[j] === 'hiç' || words[j] === 'asla' || words[j] === 'zerre') {
              isNegated = true; break;
            }
            // YENİ: Eğer kelimeden önce "çok", "aşırı" varsa gücü 2'ye katla!
            if (amplifiers.includes(words[j])) {
              isAmplified = true; 
            }
          }
          
          // ... (İleriye doğru bakma kodları aynen kalacak) ...
          
          // İleriye doğru 3 kelime VE yan cümleciğin en son kelimesi (Yüklem)
          const end = Math.min(words.length - 1, i + 3);
          const wordsToCheck = [];
          
          for (let j = i + 1; j <= end; j++) {
            wordsToCheck.push(words[j]);
          }
          
          // Eğer cümlenin son kelimesi radarımıza girmediyse, onu da listeye ekle (Türkçe yüklem kuralı)
          if (words.length > 0 && end < words.length - 1) {
            wordsToCheck.push(words[words.length - 1]);
          }

          for (const nextWord of wordsToCheck) {
            if (nextWord.startsWith('değil') || nextWord.startsWith('yok')) {
              isNegated = true; break;
            }
            
            const isAux = auxiliaries.some(aux => nextWord.startsWith(aux));
            if (isAux && negationRegex.test(nextWord)) {
              isNegated = true; break;
            }
          }
        }

        // YENİ: Pekiştirici varsa skoru 2 ile çarp (+1 ise +2, -1 ise -2 olur)
        if (isAmplified) wordScore *= 2; 

        // Eğer olumsuzluk bulduysa o kelimenin duygusunu tam tersine çevir!
        if (isNegated) wordScore *= -1;
        
        clauseScore += wordScore;
      }
    }
    totalScore += clauseScore;
  }

  // MVP Limitlerimiz (-2 ile +2 arası)
  if (totalScore >= 2) return 2;
  if (totalScore <= -2) return -2;
  return totalScore;
}