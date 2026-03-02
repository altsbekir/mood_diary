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
    renderChart(); // Sayfa açılınca grafiği çiz
    
    const noteArea = document.getElementById('note');
    if (noteArea) {
        noteArea.addEventListener('input', (e) => {
            const score = analyzeSentiment(e.target.value);
            updateUI(score);
        });
    }
});

function updateUI(score) {
    const analysisText = document.getElementById('analysis');
    const container = document.querySelector('.container');
    
    // 5'li NLP Skalamıza Göre UI Değişimi
    switch (score) {
        case 2:
            analysisText.innerText = "Harika görünüyorsun! Enerjin tavan! 🌟";
            container.style.borderLeft = "10px solid #22c55e"; // Zümrüt Yeşili
            break;
        case 1:
            analysisText.innerText = "Günün iyi geçiyor gibi, ne güzel! 🙂";
            container.style.borderLeft = "10px solid #84cc16"; // Açık Yeşil
            break;
        case 0:
            analysisText.innerText = "Dengeli ve sakin bir gün... 🌿";
            container.style.borderLeft = "10px solid #3b82f6"; // Mavi
            break;
        case -1:
            analysisText.innerText = "Biraz yorgun veya modun düşük gibi... 🍂";
            container.style.borderLeft = "10px solid #f97316"; // Turuncu
            break;
        case -2:
            analysisText.innerText = "Zor bir gün... Derin bir nefes al, geçecek. 🌧️";
            container.style.borderLeft = "10px solid #ef4444"; // Kırmızı
            break;
        default:
            analysisText.innerText = "Düşüncelerini özgür bırak... 🌿";
            container.style.borderLeft = "10px solid #3b82f6";
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
        updateUI(0); // UI'ı sıfırla
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

// --- 6. GEÇMİŞ GÜNLÜKLERİ BULUTTAN OKUMA ---
window.showDiary = async function() {
    document.getElementById('app').style.display = 'none';
    document.getElementById('diaryPage').style.display = 'block';
    window.toggleMenu();
    
    const list = document.getElementById('diaryList');
    list.innerHTML = "<p>Buluttan veriler getiriliyor... ⏳</p>";

    try {
        // En yeniden en eskiye sıralayarak çek
        const q = query(collection(db, 'journals'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            list.innerHTML = '<p>Henüz kayıt yok.</p>';
            return;
        }

        let html = "";
        querySnapshot.forEach((doc) => {
            const e = doc.data();
            // Skora göre küçük bir emoji rozeti
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
        list.innerHTML = html;
        
    } catch (error) {
        console.error("Okuma hatası:", error);
        list.innerHTML = '<p style="color:#ef4444;">Veriler yüklenirken hata oluştu.</p>';
    }
};

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