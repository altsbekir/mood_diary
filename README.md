# 🧠 PsyNote Web MVP - Single Source of Truth (SSOT)

Bu belge, "Mood Diary" mobil uygulamamızın web platformundaki kardeşi olan **PsyNote** projesi için Tek Gerçeklik Kaynağıdır (SSOT). Ekibimizdeki herkesin mimari kararları, klasör yapısını ve proje vizyonunu net bir şekilde anlaması için hazırlanmıştır.

---

## 1. Proje Özeti ve Vizyon
**PsyNote**, kullanıcıların günlük düşüncelerini kaydettikleri, yazdıkları metin üzerinden canlı duygu analizi yapan ve ruh hali istatistiklerini görselleştiren akıllı bir dijital günlük web uygulamasıdır. 
Vizyonumuz; mobil MVP'mizde (Mood Diary) kanıtladığımız o güçlü Doğal Dil İşleme (NLP) ve Firestore altyapısını, web platformuna taşıyarak kullanıcılara cihazdan bağımsız, kesintisiz bir deneyim sunmaktır.

## 2. Teknoloji Yığını (Tech Stack)
Web MVP'mizde "YAGNI" (İhtiyacın Olmayacak) prensibini benimsedik. Ağır framework'ler (React/Vue) veya derleyiciler (Webpack/Vite) kullanmıyoruz.
* **Frontend:** Saf HTML5, CSS3 ve ES6 Vanilla JavaScript (Modüler yapı).
* **Backend & Veritabanı:** Firebase Firestore (NPM paketi kurmadan, doğrudan CDN üzerinden modül olarak entegre edildi).
* **Veri Görselleştirme:** Chart.js (Ruh hali analiz grafikleri için).

## 3. Klasör ve Dosya Yapısı
Mobil projeden (`main` branch) miras kalan tüm gereksiz React Native dosyaları (`App.tsx`, `package.json`, `node_modules`, `src/` klasörü) **tamamen silinmiştir.** Web projemizde kod karmaşasını önlemek için **"Separation of Concerns" (Sorumlulukların Ayrılığı)** prensibi benimsenmiş ve JavaScript kodlarımız modüllere (ES6 Modules) bölünmüştür. Projemizin güncel ve modüler yapısı şöyledir:

```text
/
├── index.html            # Uygulamanın iskeleti ve DOM yapısı (type="module" içerir)
├── style.css             # Hazırlanan şık tasarım ve layout
├── js/                   # İş mantığımızın parçalara ayrıldığı modül klasörü
│   ├── firebaseConfig.js # Sadece Firebase başlatma ve ayar kodlarını içerir
│   ├── sentiment.js      # Sadece "Sliding Window" tabanlı Türkçe NLP algoritmamızı içerir
│   └── main.js           # Orkestra Şefi: UI kontrolleri, event'ler ve veritabanı kayıt işlemleri
├── .gitignore            # Git'e dahil edilmeyecek dosyalar (.env vb.)
└── README.md             # SSOT (Bu dosya)

```

## 4. Kullanıcı Senaryoları (User Stories)

* **Canlı Duygu Analizi:** Kullanıcı günlük metnini yazarken, sistem arka planda kelimeleri analiz etmeli ve anlık olarak kullanıcının ruh halini yansıtmalıdır.
* **Dinamik Yönlendirme:** Kullanıcının yazdığı metnin duygu skoruna göre, sistem empati kurarak ona dinamik ve akıllı bir soru (`smartQuestion`) yöneltmelidir.
* **Bulut Senkronizasyonu:** Kullanıcı "Güvenle Kaydet" butonuna bastığında, veriler cihaz hafızasına değil, doğrudan Firestore bulut veritabanına kaydedilmeli; böylece mobil cihazından da aynı verilere erişebilmelidir.
* **İstatistik (Dashboard):** Kullanıcı, geçmiş günlüklerinden derlenen duygu durum özetini Chart.js ile çizilmiş pasta grafiklerinde görebilmelidir.

## 5. Mimari Kararlar ve Revizyonlar (Mobilden Web'e Geçiş)

İlk web prototipini hazırlayan arkadaşımızın değerli katkıları üzerinden aşağıdaki "Senior" revizyonlar yapılmıştır:

* **Tasarım ve UI Korundu:** CSS yapısı, açılır kapanır Sidebar ve Chart.js entegrasyonu birebir tutulmuştur.
* **Geçici Veritabanı Çöpe Atıldı:** `localStorage` ve `btoa` tabanlı sahte/güvensiz veri saklama yöntemi iptal edilmiştir. Yerine, mobil uygulamamızla aynı koleksiyonu (`journals`) dinleyen gerçek **Firebase Firestore** bağlanmıştır.
* **Manuel Duygu Seçimi Kaldırıldı:** Prototipteki `<select id="mood">` (Mutlu/Üzgün seçme) menüsü kaldırılmıştır.
* **Zeki NLP (Doğal Dil İşleme) Eklendi:** Mobilde harikalar yaratan *Sliding Window (Kayan Pencere)* tabanlı Türkçe NLP algoritmamız Vanilla JS'e uyarlanmıştır. Sistem artık metni okuyarak `-2 ile +2` arasında anlık matematiksel skor üretmektedir.
* **Canlı Tetikleyici:** NLP algoritması bir `input` dinleyicisine (Event Listener) bağlanmış, kullanıcı klavyede her tuşa bastığında duygu skoru ve `smartQuestion` (Akıllı Soru) canlı olarak güncellenecek şekilde kurgulanmıştır.

## 6. Kurulum ve Çalıştırma Yönergesi

Bu projeyi çalıştırmak için Node.js yüklemenize veya `npm install` yapmanıza gerek yoktur.

1. `web-mvp` branch'ini bilgisayarınıza çekin (`git checkout web-mvp`).
2. `script.js` dosyasını açıp, en üstteki `firebaseConfig` objesinin içine kendi Firebase API anahtarlarınızı girin.
3. VS Code kullanıyorsanız **Live Server** eklentisi ile `index.html` dosyasına sağ tıklayıp "Open with Live Server" diyerek projeyi anında ayağa kaldırın.
*(Not: Firebase Modül importları `file://` protokolünde çalışmadığı için yerel bir sunucu (localhost) üzerinden açılması şarttır.)*

## 7. Takım Çalışması ve Veri Sözleşmesi (Data Contract)
Bu proje Frontend (UI/UX) ve Backend (Firebase/Mantık) olarak asenkron iki koldan geliştirilmektedir. Geliştiricilerin birbirini bloklamaması için aradaki tek iletişim dili aşağıdaki **Veri Şeması** olacaktır.

**Frontend Geliştiricisinin Sorumluluğu:** Veritabanının bağlanmasını beklemeden, tasarımlarını (Geçmiş günlük kartları, Chart.js grafikleri) aşağıdaki JSON formatındaki uydurma (mock) verilerle kodlamak.
**Backend Geliştiricisinin Sorumluluğu:** Firebase'den çekilen veya kaydedilen verilerin yapısal olarak kesinlikle bu şemaya uymasını sağlamak.

### Standart Günlük (Journal) Objesi Şeması:
\`\`\`json
{
  "id": "1a2b3c4d5e",             // Firebase Belge ID'si (String)
  "date": "2026-03-02",           // YYYY-MM-DD formatında standart tarih (String)
  "text": "Bugün çok harikaydı!", // Kullanıcının yazdığı metin (String)
  "sentimentScore": 2,            // NLP'den gelen duygu skoru: -2 ile +2 arası (Number)
  "wordCount": 4                  // Metindeki kelime sayısı (Number)
}
\`\`\`
*(Not: Frontend geliştiricisi tema renklerini ve Chart.js istatistiklerini sadece `sentimentScore` değerine bakarak hesaplayacaktır.)*

## 8. Güvenlik ve Firebase Kurulumu
Projede Vanilla JS kullanıldığı için `.env` dosyası tarayıcı tarafından doğrudan okunamaz. Bu yüzden Firebase şifreleri Git'e yüklenmeyecektir.
1. Projeyi ilk kez indirdiğinizde `js/firebaseConfig.example.js` dosyasının adını `js/firebaseConfig.js` olarak değiştirin.
2. İçindeki boş alanlara kendi yerel test Firebase bilgilerinizi veya ekip liderinden aldığınız bilgileri girin.
3. `js/firebaseConfig.js` dosyası `.gitignore` listesindedir, bu yüzden yaptığınız şifre değişiklikleri GitHub'a yansımaz.

---

*Geliştirme felsefemiz: Basit tut, hızlı çalıştır, kullanıcıya değer kat!* 🚀