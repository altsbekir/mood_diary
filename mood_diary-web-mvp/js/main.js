import { analyzeSentiment } from './sentiment.js';

let myChart = null; // Grafiği bir değişkende tutalım

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
    
    if (score > 0) {
        analysisText.innerText = "Harika görünüyorsun! 😍";
        container.style.borderLeft = "10px solid #22c55e";
    } else if (score < 0) {
        analysisText.innerText = "Biraz modun düşük gibi... 😔";
        container.style.borderLeft = "10px solid #ef4444";
    } else {
        analysisText.innerText = "Dengeli bir gün... 🌿";
        container.style.borderLeft = "10px solid #3b82f6";
    }
}

// --- KAYIT SİSTEMİ (LocalStorage) ---
window.saveNote = function() {
    const text = document.getElementById('note').value;
    if (!text) return alert("Boş not kaydedilemez!");

    const newEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('tr-TR'),
        text: text,
        sentimentScore: analyzeSentiment(text)
    };

    // Mevcut notları al veya boş dizi oluştur
    const existingEntries = JSON.parse(localStorage.getItem('psyNotes') || '[]');
    existingEntries.push(newEntry);
    
    // Tarayıcıya kaydet
    localStorage.setItem('psyNotes', JSON.stringify(existingEntries));
    
    alert("Notun hafızaya kaydedildi!");
    document.getElementById('note').value = ""; // Alanı temizle
    renderChart(); // Grafiği güncelle
};

// --- GRAFİK SİSTEMİ (Chart.js) ---
function renderChart() {
    const entries = JSON.parse(localStorage.getItem('psyNotes') || '[]');
    const scores = { pozitif: 0, nötr: 0, negatif: 0 };

    entries.forEach(e => {
        if (e.sentimentScore > 0) scores.pozitif++;
        else if (e.sentimentScore < 0) scores.negatif++;
        else scores.nötr++;
    });

    const ctx = document.getElementById('moodChart').getContext('2d');
    
    if (myChart) myChart.destroy(); // Eskisini sil ki üzerine binmesin

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Mutlu', 'Dengeli', 'Üzgün'],
            datasets: [{
                data: [scores.pozitif, scores.nötr, scores.negatif],
                backgroundColor: ['#22c55e', '#3b82f6', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: { plugins: { legend: { labels: { color: 'white' } } } }
    });
}

// Menü ve Sayfa Geçişleri
window.toggleMenu = function() {
    const sidebar = document.getElementById('sidebar');
    sidebar.style.left = (sidebar.style.left === "0px") ? "-260px" : "0px";
};

window.showDiary = function() {
    document.getElementById('app').style.display = 'none';
    document.getElementById('diaryPage').style.display = 'block';
    
    const list = document.getElementById('diaryList');
    const entries = JSON.parse(localStorage.getItem('psyNotes') || '[]');
    list.innerHTML = entries.map(e => `
        <div style="background:rgba(255,255,255,0.1); padding:10px; margin:10px 0; border-radius:10px;">
            <small>${e.date}</small>
            <p>${e.text}</p>
        </div>
    `).join('') || '<p>Henüz kayıt yok.</p>';
    window.toggleMenu();
};

window.showHome = function() {
    document.getElementById('app').style.display = 'block';
    document.getElementById('diaryPage').style.display = 'none';
    window.toggleMenu();
};