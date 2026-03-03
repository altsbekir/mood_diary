```markdown
# 🧠 Mood Diary: Akıllı Dijital Günlük & NLP Duygu Analiz Motoru

Mood Diary, kullanıcıların metin tabanlı günlük girişlerini özel bir Doğal Dil İşleme (NLP) algoritmasıyla analiz ederek anlık duygu durumunu (sentiment) ölçen, web ve mobil platformlarda gerçek zamanlı senkronizasyonla çalışan akıllı bir dijital günlük uygulamasıdır.

## 🧠 2. Proje Ne İşe Yarıyor?

* **Çözdüğü Problem:** İnsanların gün içindeki yoğunluktan dolayı kendi psikolojik durumlarını (farkındalıklarını) takip edememesi ve klasik günlük tutma alışkanlığının sürdürülebilirlik açısından zayıf kalması.
* **Kimler İçin Yapıldı:** Kişisel farkındalığını (mindfulness) artırmak isteyen bireyler, psikolojik durumunu istatistiksel olarak takip etmek isteyenler ve danışanlarının duygu durum haritasını görmek isteyen terapistler.
* **Gerçek Hayatta Kullanımı:** Kullanıcı uygulamayı açar (ister telefondan ister bilgisayardan), o günkü düşüncelerini serbestçe yazar. Sistem arka planda bu metni analiz eder; arayüz, kişinin ruh haline göre anında renk (tema) değiştirir. Yazılan notlar Firebase bulutuna kaydedilir ve "Ateşli Seri (Streak)" gibi oyunlaştırma elementleriyle kullanıcının her gün yazması teşvik edilir.

## ⚙️ 3. Kullanılan Teknolojiler

Proje, çapraz platform (cross-platform) hizmet verebilmek adına modüler bir yapıda tasarlanmıştır:

**Ortak Altyapı (Backend & AI):**
* **Veritabanı:** Firebase Firestore (Gerçek zamanlı NoSQL veritabanı).
* **Duygu Analiz Motoru:** Vanilla JS / TypeScript ile sıfırdan yazılmış, "Kayan Pencere (Sliding Window)" ve "Pekiştirici (Amplifier)" destekli özel NLP algoritması.

**Web Platformu (Frontend):**
* **Core:** HTML5, CSS3 (Glassmorphism & Dinamik Dark Mode), Vanilla JavaScript (ES6+).
* **Veri Görselleştirme:** Chart.js (Doughnut grafiği).

**Mobil Platform (App):**
* **Framework:** React Native.
* **Dil:** TypeScript (Tip güvenliği ve NLP entegrasyonu için).

## 🚀 4. Kurulum (Installation)

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin.

### Web Versiyonu İçin:
1. Projeyi klonlayın: `git clone https://github.com/kullaniciadiniz/psynote.git`
2. `web-mvp` (veya `main`) branch'inde olduğunuza emin olun.
3. `js/` klasörü içinde `firebaseConfig.js` adında bir dosya oluşturun ve kendi Firebase API bilgilerinizi ekleyin:
   ```javascript
   export const firebaseConfig = {
     apiKey: "SENIN_API_KEY",
     projectId: "SENIN_PROJECT_ID",
     // ...diğer bilgiler
   };

4. VS Code üzerinden **Live Server** eklentisiyle `index.html` dosyasını çalıştırın.

### Mobil Versiyonu (React Native) İçin:

1. Mobil kodların bulunduğu klasöre (örn: `mood_diary`) gidin. (Mobil için branch: solo-release-test)
2. Bağımlılıkları yükleyin: `npm install`
3. (Sadece iOS için) Pod'ları yükleyin: `cd ios && pod install && cd ..`
4. Firebase yapılandırma dosyalarınızı (`google-services.json` ve `GoogleService-Info.plist`) ilgili Android ve iOS klasörlerine ekleyin.
5. Uygulamayı başlatın: `npx react-native run-android` veya `npx react-native run-ios`

## ▶️ 5. Kullanım (Usage)

Mood Diary'nin kalbi, -2 ile +2 arasında puanlama yapan NLP motorudur.

* **Adım 1:** Metin kutusuna düşüncelerinizi yazmaya başlayın.
* **Adım 2 (Canlı Analiz):** Algoritma kelimeleri, olumsuzluk eklerini ("değil", "hiç", "-ma/me") ve pekiştiricileri ("çok", "aşırı") anlık olarak okur.
* *Örnek Girdi:* "Bugün her şey **çok güzel** gidiyor." -> Sistem "güzel" (+1) kelimesini bulur, "çok" pekiştiricisini görüp skoru 2 ile çarpar (+2).


* **Adım 3 (Dinamik Arayüz):** Skor +2 olduğu an tüm uygulamanın arayüzü "Zümrüt Yeşiline" döner. (Skor -2 olsaydı "Koyu Şarap Rengine" dönecekti).
* **Adım 4 (Oyunlaştırma):** "Kaydet" butonuna basıldığında veri Firebase'e aktarılır. "Günlüklerim" sekmesinde geçmiş verileriniz web tarafında Chart.js ile istatistiksel pastaya dönüşür ve en üstte **"🔥 X Gündür Aralıksız Yazıyorsun"** seriniz (Streak) hesaplanıp gösterilir.

## 🏗️ 7. Proje Mimarisi

Projemiz, kod tekrarını önlemek ve hem web hem mobilde aynı iş mantığını (business logic) yürütmek üzerine inşa edilmiştir.

### Web Mimarisi Klasör Yapısı

Web tarafında, gereksiz framework karmaşasından kaçınılarak saf (Vanilla) JS mimarisi tercih edilmiştir:

```text
/mood_diary
│── index.html           # Ana uygulama arayüzü (Tek Sayfa - SPA mantığı)
│── style.css            # Glassmorphism ve geçişli arka plan tasarımları
└── /js
    ├── main.js          # DOM manipülasyonu, Firebase CRUD işlemleri ve Streak algoritması
    ├── sentiment.js     # Dışa aktarılabilir (Export) 5'li NLP Kayan Pencere Algoritması
    └── firebaseConfig.js# Güvenli Firebase API yapılandırması (Git'ten izole)

```

### Mobil Mimarisi Klasör Yapısı

Mobil tarafta React Native ve TypeScript kullanılarak, temiz kod prensiplerine (Clean Code) uygun modüler bir yapı kurulmuştur:

```text
/mood_diary
├── /src
│   ├── /screens
│   │   └── HomeScreen.tsx       # Ana günlük giriş ve duygu analiz ekranı
│   ├── /services
│   │   └── firebaseConfig.ts    # Firebase Firestore bağlantısı ve bulut işlemleri
│   ├── /store
│   │   └── useJournalStore.ts   # Global durum yönetimi (State Management)
│   ├── /theme
│   │   └── ThemeMap.ts          # NLP skoruna göre dinamik değişen tema ve renk ayarları
│   └── /utils
│       ├── dateHelpers.ts       # Tarih formatlama ve streak yardımcı fonksiyonları
│       └── sentiment.ts         # TypeScript ile tiplendirilmiş Kayan Pencere NLP algoritması
└── package.json                 # React Native bağımlılıkları ve scriptler

```