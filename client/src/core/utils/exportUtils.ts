/**
 * CSV Export Utility - Aşama 3 Düzeltmesi
 * JSON verilerini CSV dosyasına dönüştürüp indirir
 */

export const exportToCsv = <T extends Record<string, any>>(
  data: T[],
  filename: string
) => {
  if (!data || !data.length) {
    console.warn("CSV export: Boş veri seti");
    return;
  }

  try {
    // Header'ları al (ilk objenin keys'leri)
    const headers = Object.keys(data[0]);
    
    // Header satırını oluştur
    const headerRow = headers
      .map((header) => `"${header}"`)
      .join(',');

    // Data satırlarını oluştur
    const rows = data.map((obj) =>
      headers
        .map((header) => {
          const value = obj[header] ?? '';
          const stringValue = String(value);
          // CSV'de çift tırnak kaçış
          const escaped = stringValue.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',')
    );

    // CSV içeriği oluştur (UTF-8 BOM ile)
    const csvContent = '﻿' + [headerRow, ...rows].join('\n');
    
    // Blob oluştur
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // URL oluştur
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // İndir
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('CSV export hatası:', error);
    throw new Error('CSV dosyası oluşturulurken hata oluştu');
  }
};

/**
 * Nesneyi CSV satırına dönüştür
 */
export const objectToCsvRow = (obj: Record<string, any>): string => {
  return Object.values(obj)
    .map((val) => {
      const stringValue = String(val ?? '');
      const escaped = stringValue.replace(/"/g, '""');
      return `"${escaped}"`;
    })
    .join(',');
};

/**
 * JSON array'i CSV string'e dönüştür
 */
export const jsonToCsv = <T extends Record<string, any>>(data: T[]): string => {
  if (!data.length) return '';

  const headers = Object.keys(data[0]).join(',');
  const rows = data.map((obj) =>
    Object.values(obj)
      .map((val) => {
        const stringValue = String(val ?? '');
        const escaped = stringValue.replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(',')
  );

  return [headers, ...rows].join('\n');
};
