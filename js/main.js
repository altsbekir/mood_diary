// --- 1. İÇE AKTARIMLAR (IMPORTS) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { firebaseConfig } from './firebaseConfig.js';
import { analyzeSentiment } from './sentiment.js';

// --- 2. FIREBASE BAŞLATMA ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- 3. UI VE CANLI ANALİZ MANTIĞI ---
let myChart = null;

document.addEventListener('DOMContentLoaded', () => {
    renderChart(); 
    checkTodayMood(); // <-- YENİ EKLENDİ: Sayfa açıldığında bugünün rengini bul!
    
    const noteArea = document.getElementById('note');
    if (noteArea) {
        noteArea.addEventListener('input', (e) => {
            const score = analyzeSentiment(e.target.value);
            updateUI(score);
        });
    }
});

// --- YENİ FONKSİYON: BUGÜNÜN RENGİNİ HAFIZADA TUT ---
async function checkTodayMood() {
    try {
        // Firebase'den en son yazılan günlüğü çek
        const q = query(collection(db, 'journals'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const lastNote = querySnapshot.docs[0].data(); // En baştaki en yeni nottur
            const todayDate = new Date().toISOString().split('T')[0]; // Bugünün tarihi

            // Eğer veritabanındaki en son not BUGÜNE aitse, onun rengini ekrana bas!
            if (lastNote.date === todayDate) {
                updateUI(lastNote.sentimentScore);
                
                // Hatta kullanıcıya küçük bir mesaj da verelim
                document.getElementById('analysis').innerText = "Bugünkü modun hafızada... 🌿";
            } else {
                updateUI(0); // Bugün henüz bir şey yazılmamışsa varsayılan Gece Mavisi
            }
        }
    } catch (error) {
        console.log("Bugünün modu çekilemedi:", error);
    }
}

// --- js/main.js İÇİNDEKİ updateUI FONKSİYONU ---
function updateUI(score) {
    const analysisText = document.getElementById('analysis');
    const container = document.querySelector('.container');
    const body = document.body;
    
    // Geçişin yumuşak olması için CSS hilesi
    body.style.transition = "background 1s ease-in-out";
    
    // 5'li NLP Skalamıza Göre Şık ve Soft UI Değişimi
    switch (score) {
        case 2:
            analysisText.innerText = "Harika görünüyorsun! Enerjin tavan! 🌟";
            container.style.borderLeft = "10px solid #10b981"; // Soft Zümrüt
            body.style.background = "linear-gradient(120deg, #064e3b, #0f172a)"; // Koyu Orman Yeşili
            break;
        case 1:
            analysisText.innerText = "Günün iyi geçiyor gibi, ne güzel! 🙂";
            container.style.borderLeft = "10px solid #38bdf8"; // Gök Mavisi
            body.style.background = "linear-gradient(120deg, #0c4a6e, #0f172a)"; // Koyu Okyanus Mavisi
            break;
        case 0:
            analysisText.innerText = "Dengeli ve sakin bir gün... 🌿";
            container.style.borderLeft = "10px solid #64748b"; // Soft Gri-Mavi
            body.style.background = "linear-gradient(120deg, #0f172a, #1e293b)"; // Orijinal Gece Mavisi
            break;
        case -1:
            analysisText.innerText = "Biraz yorgun veya modun düşük gibi... 🍂";
            container.style.borderLeft = "10px solid #c084fc"; // Soft Mor
            body.style.background = "linear-gradient(120deg, #2e1065, #0f172a)"; // Koyu Melankolik Mor
            break;
        case -2:
            analysisText.innerText = "Zor bir gün... Derin bir nefes al, geçecek. 🌧️";
            container.style.borderLeft = "10px solid #f43f5e"; // Soft Gül Kurusu / Kırmızı
            body.style.background = "linear-gradient(120deg, #4c0519, #0f172a)"; // Koyu Şarap Rengi
            break;
        default:
            analysisText.innerText = "Düşüncelerini özgür bırak... 🌿";
            container.style.borderLeft = "10px solid #64748b";
            body.style.background = "linear-gradient(120deg, #0f172a, #1e293b)";
    }
}

// --- 4. FIREBASE KAYIT SİSTEMİ (Data Contract'a Uygun) ---
window.saveNote = async function() {
    const textArea = document.getElementById('note');
    const text = textArea.value.trim();
    
    if (!text) return alert("Boş not kaydedilemez!");

    const score = analyzeSentiment(text);
    const wordCount = text.split(/\s+/).length; // Kelime sayısını hesapla
    const todayDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formatı

    try {
        // Firebase Firestore'a Gönder!
        await addDoc(collection(db, 'journals'), {
            date: todayDate,
            text: text,
            sentimentScore: score,
            wordCount: wordCount,
            createdAt: serverTimestamp(),
            platform: 'web'
        });

        alert("Notun başarıyla buluta kaydedildi! 🚀");
        textArea.value = ""; 
        renderChart(); // Grafiği yenile
        
    } catch (error) {
        console.error("Kayıt hatası:", error);
        alert("Kaydedilemedi! Lütfen konsolu kontrol et.");
    }
};

// --- 5. FIREBASE OKUMA VE GRAFİK (5'li Skala) ---
async function renderChart() {
    try {
        const q = query(collection(db, 'journals'));
        const querySnapshot = await getDocs(q);
        
        const scores = { cokMutlu: 0, mutlu: 0, dengeli: 0, uzgun: 0, cokUzgun: 0 };

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            switch (data.sentimentScore) {
                case 2: scores.cokMutlu++; break;
                case 1: scores.mutlu++; break;
                case 0: scores.dengeli++; break;
                case -1: scores.uzgun++; break;
                case -2: scores.cokUzgun++; break;
                default: scores.dengeli++;
            }
        });

        const ctx = document.getElementById('moodChart').getContext('2d');
        if (myChart) myChart.destroy(); 

        myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Çok Mutlu', 'Mutlu', 'Dengeli', 'Üzgün', 'Çok Üzgün'],
                datasets: [{
                    data: [scores.cokMutlu, scores.mutlu, scores.dengeli, scores.uzgun, scores.cokUzgun],
                    backgroundColor: ['#22c55e', '#84cc16', '#3b82f6', '#f97316', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: { plugins: { legend: { labels: { color: 'white' } } } }
        });
    } catch (error) {
        console.log("Grafik çizilirken veri çekilemedi:", error);
    }
}

// --- 6. GEÇMİŞ GÜNLÜKLERİ BULUTTAN OKUMA VE STREAK (SERİ) HESAPLAMA ---
window.showDiary = async function() {
    document.getElementById('app').style.display = 'none';
    document.getElementById('diaryPage').style.display = 'block';
    window.toggleMenu();
    
    const list = document.getElementById('diaryList');
    list.innerHTML = "<p>Buluttan veriler getiriliyor... ⏳</p>";

    try {
        const q = query(collection(db, 'journals'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            list.innerHTML = '<p>Henüz kayıt yok. İlk günlüğünü yazarak seriye başla! 🚀</p>';
            return;
        }

        let html = "";
        let datesArray = []; // Seri hesaplamak için tarihleri toplayacağız

        querySnapshot.forEach((doc) => {
            const e = doc.data();
            datesArray.push(e.date); // Tarihi diziye at

            let emoji = "🌿";
            if(e.sentimentScore === 2) emoji = "🌟";
            else if(e.sentimentScore === 1) emoji = "🙂";
            else if(e.sentimentScore === -1) emoji = "🍂";
            else if(e.sentimentScore === -2) emoji = "🌧️";

            html += `
                <div class="noteBox">
                    <div style="display:flex; justify-content:space-between;">
                        <small style="color:#94a3b8;">${e.date}</small>
                        <small>${emoji} (${e.wordCount} kelime)</small>
                    </div>
                    <p style="margin-top:8px;">${e.text}</p>
                </div>
            `;
        });

        // 🔥 Ateşli Seri Hesaplama
        const streakCount = calculateStreak(datesArray);
        
        // Streak Rozetini HTML'in en tepesine ekle
        let streakBadge = "";
        if (streakCount > 0) {
            streakBadge = `
                <div style="background: linear-gradient(135deg, #f97316, #ef4444); color: white; padding: 10px; border-radius: 10px; text-align: center; margin-bottom: 15px; font-weight: bold; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);">
                    🔥 Harika! ${streakCount} gündür aralıksız günlük yazıyorsun!
                </div>
            `;
        } else {
            streakBadge = `
                <div style="background: rgba(255,255,255,0.05); color: #94a3b8; padding: 10px; border-radius: 10px; text-align: center; margin-bottom: 15px; font-size: 14px;">
                    💡 Bugün bir şeyler yazarak serini başlatabilirsin!
                </div>
            `;
        }

        list.innerHTML = streakBadge + html;
        
    } catch (error) {
        console.error("Okuma hatası:", error);
        list.innerHTML = '<p style="color:#ef4444;">Veriler yüklenirken hata oluştu.</p>';
    }
};

// --- 🔥 STREAK (ATEŞLİ SERİ) MATEMATİĞİ ---
function calculateStreak(dates) {
    if (!dates || dates.length === 0) return 0;

    // Aynı güne birden fazla kayıt girilmişse onları teke düşür (Unique)
    const uniqueDates = [...new Set(dates)];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Saatleri sıfırla ki sadece günü kıyaslayalım

    let streak = 0;
    let checkDate = new Date(today); // Kontrol edeceğimiz gün (Önce bugün)

    // En son not BUGÜN veya en kötü DÜN yazılmış mı? Yazılmamışsa seri çoktan kırılmıştır (0 döner).
    const lastNoteDate = new Date(uniqueDates[0]);
    lastNoteDate.setHours(0,0,0,0);
    
    const diffTime = Math.abs(today - lastNoteDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays > 1) return 0; // Seri bozulmuş

    // Geriye doğru günleri kontrol et
    for (let i = 0; i < uniqueDates.length; i++) {
        const noteDate = new Date(uniqueDates[i]);
        noteDate.setHours(0, 0, 0, 0);

        // Eğer aradığımız günde not yazılmışsa seriyi artır
        if (noteDate.getTime() === checkDate.getTime()) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1); // Bir önceki güne geç
        } 
        // Eğer aradığımız gün değilse ama dünkü kontrol için 1 hak tanıyorsak (bugün yazmamış ama dün yazmışsa devam et)
        else if (i === 0 && diffDays === 1) {
            checkDate.setDate(checkDate.getDate() - 1); // Bugünü atla, dünden saymaya başla
            if (noteDate.getTime() === checkDate.getTime()) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            }
        }
        else {
            break; // Zincir kırıldı! Döngüyü durdur.
        }
    }
    
    return streak;
}

// --- 7. MENÜ VE SAYFA KONTROLLERİ ---
window.showHome = function() {
    document.getElementById('app').style.display = 'block';
    document.getElementById('diaryPage').style.display = 'none';
    window.toggleMenu();
    renderChart();
};

window.toggleMenu = function() {
    const sidebar = document.getElementById('sidebar');
    sidebar.style.left = (sidebar.style.left === "0px") ? "-260px" : "0px";
};

window.logout = function() {
    alert("Çıkış yapıldı (Firebase Auth yakında eklenecek).");
    location.reload();
};