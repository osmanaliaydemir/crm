/**
 * JSON verisini CSV formatına dönüştürür ve tarayıcı üzerinden indirilmesini sağlar.
 * @param data Dışa aktarılacak veri dizisi
 * @param filename İndirilecek dosyanın adı (uzantısız)
 */
export function exportToCSV(data: any[], filename: string) {
    if (!data || !data.length) return;

    // Başlıkları al
    const headers = Object.keys(data[0]);

    // Satırları oluştur
    const csvRows = [
        headers.join(','), // CSV başlık satırı
        ...data.map(row =>
            headers.map(fieldName => {
                const value = row[fieldName] === null ? '' : row[fieldName];
                const escaped = ('' + value).replace(/"/g, '""'); // Tırnak işaretlerini kaçır
                return `"${escaped}"`;
            }).join(',')
        )
    ];

    const csvContent = csvRows.join('\r\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // \ufeff (BOM) Türkçe karakterler için Excel uyumluluğu sağlar

    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
