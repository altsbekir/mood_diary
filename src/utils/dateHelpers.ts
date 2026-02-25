// src/utils/dateHelpers.ts

/**
 * Bugünün tarihini README kurallarına uygun olarak 
 * YYYY-MM-DD (UTC tabanlı ISO) formatında döndürür.
 */
export const getTodayDateString = (): string => {
  const date = new Date();
  // toISOString() metodu tarihi '2026-02-25T19:14:57.000Z' formatına çevirir.
  // split('T')[0] ile sadece '2026-02-25' kısmını alırız.
  return date.toISOString().split('T')[0];
};