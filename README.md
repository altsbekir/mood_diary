# 📓 Dijital Günlük (MVP)

Bu doküman, projenin teknik sınırlarını, mimari kararlarını ve MVP (Minimum Viable Product) hedeflerini belirleyen **Tek Doğru Kaynak (Single Source of Truth)** belgesidir. Ekibe yeni katılan üyeler ve projeye destek veren AI asistanları tüm kararlarında bu belgeyi baz almalıdır.

## 🎯 Proje Özeti
Kullanıcıların her gün kısa günlükler yazmasını teşvik eden, tasarım odaklı bir mobil dijital günlük uygulaması.
* **Amaç:** Kullanıcıya farkındalık ve düzenli yazma alışkanlığı kazandırmak.
* **Kısıt:** Uygulama kesinlikle bir *terapi iddiası* taşımaz. Yazılan metinler kural tabanlı (lokal) analiz edilerek, uygulamanın teması o günün duygu durumuna göre şekillenir.

## ⏳ Süre & Hedef
* **Proje Süresi:** 4 Hafta (1 Sprint)
* **Hedef:** Çalışan, şık, hatasız ve sunulabilir bir MVP ortaya çıkarmak.
* **Kırmızı Çizgi:** "Over-engineering" (aşırı mühendislik) ve "Scope creep" (kapsam kayması) kesinlikle yasaktır.

---

## 🧭 Kullanıcı Senaryosu (Değiştirilemez)

1.  **Ana Ekran:**
    * Bugünün tarihi ve güncel Streak (seri) bilgisi.
    * Günlük yazma alanı ve canlı kelime sayacı.
    * Takvimi açan buton ve Kaydet butonu.
2.  **Akıllı Placeholder Sistemi (Düne Referanslı):**
    * Dün negatifse: *"Düne göre bugün nasılsın?"*
    * Dün pozitifse: *"Bugün de güzel bir şeyler oldu mu?"*
    * Dün nötrse: *"Bugün neler oldu, anlatmak ister misin?"*
    * Dün boşsa (veya ilk günse): *"Bugün neler yaşadın?"*
3.  **Duygu Analizi ve Tema Değişimi:**
    * Yazı kaydedildiğinde lokal algoritma çalışır ve -2 ile +2 arasında bir skor döner.
    * Uygulamanın arayüzü (arka plan ve tonlar) bu skora göre anında değişir.
4.  **Yönlendirici Metin (Chatbot DEĞİL):**
    * Kayıt sonrası yargılamayan, yumuşak bir teşvik metni çıkar (Örn: Pozitif için *"Bu güzel anı biraz daha anlatmak ister misin?"*).
5.  **Aynı Gün Tekrar Giriş:**
    * Tema o günün skorunda kalır, yönlendirici metin o güne aittir.
6.  **Takvim ve Özet Görünümü:**
    * Takvimde günlerin altında o günün duygu rengini belirten noktalar bulunur.
    * Güne tıklandığında metin, duygu durumu ve kelime sayısı görünür.
    * Haftalık sekmesinde son 7 günün basit grafiği, streak ve ortalama kelime sayısı yer alır.

---

## 🧱 Tech Stack (Değiştirilemez)
* **Mobil:** Expo + React Native + TypeScript
* **Backend & DB:** Firebase (Auth + Firestore)
* **State Management:** Zustand
* **Takvim UI:** `react-native-calendars`
* **Lokal Cache:** AsyncStorage (Sadece Optimistic UI için)
* **Tasarım & Versiyon:** Figma & GitHub

---

## 🗄️ Veri Modeli (Firestore)
Veritabanı yapısı okuma maliyetlerini düşürmek için aşağıdaki şekilde denormalize edilmiştir. 

**Koleksiyon:** `users/{uid}`
```json
{
  "streak": 5,
  "lastEntryDate": "2026-02-23",
  "lastSentimentScore": 1
}

```

**Alt Koleksiyon:** `users/{uid}/entries/{YYYY-MM-DD}` *(Doküman ID'si kesinlikle tarihtir)*

```json
{
  "text": "Bugün harika bir gündü...",
  "wordCount": 24,
  "sentimentScore": 1,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}

```

> ⚠️ **Tarih Formatı Standardı:**  
> Tüm günlük doküman ID’leri ve tarih karşılaştırmaları için **UTC tabanlı ISO formatı (`YYYY-MM-DD`) kullanılacaktır.**  
> Streak hesaplamaları bu string formatı üzerinden yapılır.  
> Cihaz saat farklarından kaynaklı edge-case'ler bu standart ile yönetilecektir.

---

## 🧠 Mimari Kurallar & Kırmızı Çizgiler

1. **Single Source of Truth:** Verinin tek ve mutlak sahibi **Firestore**'dur.
2. **Optimistic UI:** `AsyncStorage` sadece uygulama açılışında arayüzü hızlı çizmek (hydrate) için kullanılır. Firestore'dan gelen veri her zaman lokal veriyi ezer (overwrite).
3. **Kapsam Koruma:** Yeni büyük özellikler (feature) teklif edilemez. Mimari yaklaşım kökten değiştirilemez.
4. **Görsellik:** Kompleks Lottie animasyonları veya ağır geçişler yoktur. Sadece renk ve ton bazlı sabit tema değişimi yapılacaktır.

---

## 🔍 Duygu Analizi Prensipleri

* **Algoritma:** Lokal, kural tabanlı (Rule-based) çalışır.
* **Mantık:** Türkçe kelime kökleri + Negatörler (değil, yok) + Pekiştiriciler (çok, aşırı) kullanılarak hesaplanır.
* **Kabul:** Algoritmanın %100 doğru çalışmadığı, yanılma payı olduğu peşinen kabul edilmiştir.
* **İletişim:** Kullanıcıya kesinlikle "Sen mutsuzsun" gibi teşhis veya yargı bildiren cümleler kurulmaz. Dil daima yumuşak ve davetkârdır.

---

## 📁 Proje Klasör Yapısı

```text
/src
├── components/     # Buton, Kart, Input gibi tekrar kullanılabilir UI elemanları
├── screens/        # Home, Calendar, Summary (Ana görünümler)
├── navigation/     # React Navigation (Tab & Stack) ayarları
├── store/          # Zustand state yönetimi (useJournalStore.ts)
├── services/       # Firebase config, Auth ve Firestore DB işlemleri
├── utils/          # Duygu algoritması, tarih formatlayıcılar (helpers)
├── theme/          # Renk map'leri (ThemeMap.ts)
├── constants/      # Kelime kökleri, placeholder havuzu, sabit metinler
└── hooks/          # Özel mantık barındıran custom hook'lar

```

---

## 👥 Ekip & Rol Dağılımı

* **Kişi 1 (Lead / Scrum Master):** Proje mimarisi, Firebase entegrasyonu, lokal duygu analizi algoritması, tema sistemi mantığı, genel entegrasyon.
* **Kişi 2 (UI / UX):** Ana ekran UI, takvim UI, tema görselleri/renkleri, placeholder/yönlendirici metinlerin yerleşimi, genel arayüz cilası (polish).
* **Kişi 3 (Data / Logic):** Günlük CRUD işlemleri, takvim veri akışı, streak/kelime hesaplamaları, haftalık verilerin hazırlanması.

---

## ⚠️ MVP'de Bilinçli Olarak YAPILMAYACAKLAR (Out of Scope)

Aşağıdaki özellikler proje takvimini korumak adına bilinçli olarak kapsam dışı bırakılmıştır:

* Push Notification (Anlık bildirimler)
* Kullanıcılar arası sosyal etkileşim veya paylaşım
* Gelişmiş bulut yedekleme (Export/Import v2)
* Sunucu tabanlı gelişmiş Machine Learning / NLP modelleri
* Offline-first için özel senkronizasyon mantığı (Firebase'in default offline yeteneği yeterlidir. Firebase’in varsayılan offline cache davranışı dışında özel senkronizasyon katmanı yazılmayacaktır.)

---

## 🧪 Test & Demo Notları

* **Donanım:** Uygulama mutlaka **gerçek fiziksel cihazda** test edilecektir.
* **UX:** Günlük yazma alanında klavye açıldığında "Kaydet" butonunun kapanmaması (KeyboardAvoidingView) sıkı test edilecektir.
* **Ağ:** İnternetsiz ortamda yazma senaryosu test edilecektir.
* **Sunum:** Proje sunumu için geriye dönük **1 haftalık anlamlı dummy (sahte) veri** seti önceden hazır bulundurulacaktır.

## 🧭 Karar Alma Prensibi

Bu dokümanda yer almayan bir konuda karar alınması gerekiyorsa:

1. Önce MVP hedefine hizmet edip etmediğine bakılır  
2. Geliştirme süresini uzatıyor mu değerlendirilir  
3. Kullanıcıya doğrudan değer katıyor mu sorgulanır  

Bu üç kriterden en az ikisi sağlanmıyorsa özellik eklenmez.