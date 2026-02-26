# Mobilyam İnegölden CRM - Sistem Analiz Raporu

**Tarih:** 2 Şubat 2026
**Analiz Eden:** Antigravity (Google DeepMind)

## 1. Genel Bakış

Mevcut sistem, mobilya üretimi ve satışı süreçlerini yöneten, bayi/tedarikçi ağını kapsayan, Flutter tabanlı bir web uygulamasıdır. Sistem; üretim, stok, satış ve finans modüllerini entegre bir şekilde sunmaktadır.

## 2. Navigasyon ve Modül Hiyerarşisi

Sistem sol tarafta yer alan bir menü yapısı kullanmaktadır. Tespit edilen ana modüller ve alt kırılımları şunlardır:

### 2.1. Ana Sayfa (Dashboard)

- Günlük sipariş özetleri.
- Bekleyen kargo ve iade talepleri.
- Kritik bildirimler.

### 2.2. Temel Modüller

- **Ajanda ve Takvim:** İş takibi ve randevu yönetimi.
- **Tedarikçiler:** Tedarikçi veritabanı.
- **Müşteriler:**
  - Müşteri listesi (Ad, Soyad, Telefon, Bakiye).
  - Detay görünümü: TC No, Doğum Tarihi, Çoklu Adres yapısı.
  - Hızlı Tahsilat Al butonu (Finans entegrasyonu).
- **Kasalar & Bankalar:**
  - Nakit akışı yönetimi.
  - Gelen/Giden ödemeler.
- **Personeller:** İK ve çalışan yönetimi.
- **Giderler:** İşletme giderleri takibi.
- **Firma Ayarları:** Sistem genel yapılandırması.

### 2.3. Operasyonel Modüller

- **Siparişler:**
  - **Sipariş Listesi:** Durum takibi (Onay, Üretim, Sevk).
  - **Teklifler:** Satış öncesi kayıtlar.
- **Satın Alma:** Hammadde tedariği.
- **Mal Kabul:** Depoya ürün girişi.
- **Sevkiyatlar:**
  - Parçalı sevkiyat takibi (Örn: Bir koltuk takımının sadece berjerinin gönderilmesi).
  - Lojistik planlama.
- **Ürünler:**
  - Tüm Ürünler listesi.
  - Kategoriler.
  - Ürün Ekleme (Varyant yönetimi: Kumaş, renk, materyal).
- **Depolar:** Çoklu depo stok takibi.

## 3. Kritik İş Süreçleri ve Gözlemler

### 3.1. Sipariş Yaşam Döngüsü

Siparişler basit bir "Satıldı" durumundan öte, üretim ve lojistik aşamalarını takip eder.
*Gözlenen Durumlar:* Bekliyor, Onaylandı, Üretimde, Sevke Hazır, Sevk Edildi, Teslim Edildi.
*Özellik:* "Parçalı Sevk" seçeneği, mobilya setlerinin parça parça müşteriye ulaştırılmasına olanak tanır.

### 3.2. Finansal Entegrasyon

Müşteri kartı üzerinden doğrudan tahsilat yapılabilmesi, CRM ile Ön Muhasebe'nin sıkı bir şekilde bağlı olduğunu gösterir. Müşteri bakiyesi, yapılan tahsilat ve kesilen faturaya göre anlık güncellenmektedir.

### 3.3. Ürün Yönetimi

Mobilya sektörü gereği ürünler varyantlıdır. Bir koltuk takımı için yüzlerce farklı kumaş ve renk kombinasyonu tanımlanabilir. Yeni sistemde bu varyant yapısının esnek (EAV veya JSON field) tasarlanması kritiktir.

## 4. Teknik Notlar

- Mevcut sistem Flutter Web kullanmaktadır (Canvas tabanlı render).
- Yeni sistemde HTML/CSS tabanlı (DOM) yapı ile daha hızlı yükleme ve SEO avantajı sağlanacaktır.
