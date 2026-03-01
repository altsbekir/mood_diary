// src/theme/ThemeMap.ts

export interface ThemeColors {
  background: string;
  surface: string; // Yazı alanı gibi kutuların arka planı
  primary: string; // Butonlar ve öne çıkan rozetler
  text: string;
}

// Skora göre (-2 ile +2 arası) Dark Mode uyumlu renk paletimiz
export const ThemeMap: Record<number, ThemeColors> = {
  '-2': {
    background: '#2C1212', // Koyu Bordo (Çok Kötü)
    surface: '#3D1C1C',
    primary: '#7F1D1D',
    text: '#F8FAFC',
  },
  '-1': {
    background: '#2C1A12', // Koyu Kiremit/Kahve (Kötü)
    surface: '#3D261C',
    primary: '#9A3412',
    text: '#F8FAFC',
  },
  '0': {
    background: '#0F172A', // Nötr Gece Mavisi (Mevcut açılış rengimiz)
    surface: '#1E293B',
    primary: '#1E3A8A',
    text: '#F8FAFC',
  },
  '1': {
    background: '#0F291E', // Koyu Çam Yeşili (İyi)
    surface: '#173D2C',
    primary: '#059669',
    text: '#F8FAFC',
  },
  '2': {
    background: '#064E3B', // Canlı Zümrüt Yeşili (Çok İyi)
    surface: '#047857',
    primary: '#10B981',
    text: '#F8FAFC',
  },
};