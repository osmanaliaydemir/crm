# Universal CRM & ERP Modernizasyon İş Planı

Bu belge, sektörel bağımsız (agnostik), tüm ticaret ve hizmet sektörlerine uyarlanabilir, dinamik ve genişletilebilir bir B2B SaaS CRM/ERP platformunun **.NET 9** (Backend) ve **Next.js** (Frontend) kullanılarak geliştirilmesi için hazırlanan detaylı mimari ve uygulama planıdır.

---

## 1. Vizyon ve Yönetici Özeti

Amaç, sadece tek bir dikey sektöre hitap eden statik bir sistem yerine; firmaların kendi iş süreçlerini, veri modellerini ve kullanıcı akışlarını arayüz üzerinden tasarlayabildiği **genel amaçlı, sürdürülebilir bir SaaS platformu** inşa etmektir. Performans, veri güvenliği (izolasyon) ve yüksek özelleştirilebilirlik projenin ana omurgasıdır.

## 2. Teknoloji Yığını (Tech Stack)

### 2.1 Backend (Arka Uç)

- **Framework:** .NET 9 Web API
- **Mimari:** Clean Architecture (Domain, Application, Infrastructure, Presentation)
- **Multi-Tenancy:** Single DB / Multiple Schemas or TenantId Row-level isolation.
- **Veritabanı:** Microsoft SQL Server (Esneklik gerektiren alanlar için JSON Sütunları). EF Core & Dapper kombinasyonu.
- **Gerçek Zamanlı İletişim:** SignalR (Kullanıcı arası mesajlaşma, bildirim, canlı veri akışı).
- **Kimlik Doğrulama:** JWT, Refresh Token, OpenID Connect hazırlığı.
- **Loglama ve Metrikler:** Serilog (Yapısal), OpenTelemetry (Trace izleme), HealthChecks.
- **İş Akışları (Workflow):** Stateless/Stateless Workflow Engine (Dinamik durum geçişleri için).

### 2.2 Frontend (Ön Yüz)

- **Framework:** Next.js 14+ (App Router, Server Components).
- **Dil:** TypeScript (Sıkı tip kontrolü).
- **Arayüz (UI):** Tailwind CSS + Shadcn/UI (Temalandırılabilir, White-label desteği).
- **Durum Yönetimi:** React Query (Veri odaklı) + Zustand (UI durumu).
- **Formlar ve Validasyon:** React Hook Form + Zod (Dinamik JSON form render altyapısı).

## 3. Temel Sistem Altyapısı (Core Architecture)

Sektör bağımsız olmanın getirdiği zorunlu altyapısal bileşenler:

1. **Çoklu Kiracı (Multi-Tenancy):** Her organizasyon (Tenant) verisinin mutlak izolasyonu. Global sorgu filtreleri (Global Query Filters) ile çapraz veri erişiminin engellenmesi.
2. **Dinamik Veri Modeli (Custom Fields):** Müşteri, Ürün, Sipariş gibi ana tablolara "Özel Alan" (Metin, Sayı, Tarih, Çoklu Seçim) eklenebilme yeteneği. Veritabanı tarafında JSON alanlarla desteklenecektir.
3. **Dinamik İş Akışları (Configurable Pipelines):** Fırsat (Opportunity), Sipariş veya Görevler için firmaların kendi durumlarını (Kanban board sütunlarını) ve aşamalarını tanımlayabilmesi.
4. **Modüler Sistem (Feature Toggles):** Emlakçının "Depo" modülünü kapatıp, Üreticinin "Mal Kabul" modülünü açabilmesini sağlayan esnek arayüz/servis lisanslama yapısı.
5. **Gelişmiş Rol ve İzinler (RBAC & ABAC):** Dinamik rol yaratma, modül bazlı yetkilendirme ve satır bazlı (Sadece kendi departmanının verisini gör) izin yapısı.
6. **Denetim İzi (Audit Logging):** EF Core Interceptor'lar ile tüm CRUD işlemlerinde "Kim, Ne Zaman, Hangi alanın eski değerini yeni değere çevirdi" kaydının otomatik tutulması.

## 4. Modül Hiyerarşisi ve Analizi

### A. Organizasyon ve Sistem Ayarları

- **Firma (Tenant) Ayarları:** Vergi bilgisi, logo, saat dilimi, para birimi (Multi-currency).
- **Kullanıcı ve Departmanlar:** Hiyerarşik takım yönetimi ve rol atamaları.
- **Form ve Alan Yönetimi:** Arayüzden yeni veri alanları ekleme ekranları.
- **Abonelik & Lisans:** Firmanın aktif modülleri ve limitleri.

### B. CRM (Müşteri ve Satış Süreçleri)

- **Müşteriler / CRM Kartları:** Bireysel (B2C) ve Kurumsal (B2B) yapılar. Limitsiz etiketleme, çoklu iletişim ve adresler. Dinamik metrik ekleyebilme.
- **Aktiviteler (Etkileşim):** Toplantı, Çağrı, Not Ekleme, E-Posta gönderim entegrasyonu.
- **Satış Fırsatları (Pipelines / Deals):** Özelleştirilebilir Kanban panosunda satış takip süreci (Lead -> Qualified -> Won/Lost).
- **Ajanda / Takvim:** Ortak ekip takvimi.

### C. Ürün, Hizmet ve Envanter Yönetimi

*Bu modül, hizmet satan veya tekil ürün satan firmalara göre esneyebilir.*

- **Satış Kalemleri:** Fiziksel ürün, lisans veya danışmanlık hizmeti tanımlayabilme.
- **Varyant ve Konfigürasyon:** Renk, Beden, Malzeme, Lisans Süresi vb. JSON tabanlı ürün çeşitlendirme.
- **Stok ve Depo (İsteğe Bağlı Modül):** Çoklu depo, minimum stok alarmları, seri numara veya lot takibi.
- **Tedarik Zinciri (İsteğe Bağlı Modül):** Satın alma talepleri, mal kabul (irsaliye) süreçleri.

### D. Sipariş, Sözleşme ve Operasyon

- **Teklifler (Quotes):** PDF şablonu oluşturma (Kuruma özel logolu ve sözleşmeli pdf export).
- **Siparişler:** Fırsattan otomatik siparişe geçiş. Esnek sipariş durumları (Örn: Paketlendi, Kargoya Verildi veya Analiz Aşamasında vb.).
- **Proje ve Görevler:** Hizmet firmaları için sipariş onayından sonra tetiklenen müşteri projesi ve alt görev takip sistemi.

### E. Ön Muhasebe ve Finans

- **Borç/Alacak (Cari):** Müşteri ve Tedarikçi bakiyeleri.
- **Gelir/Gider Akışı:** Banka hesapları, nakit kasası, masraf formları ve onay süreçleri.
- **Faturalaşma:** E-Defter / E-Fatura servis sağlayıcıları (Uyumsoft, Logo vb.) için entegrasyon altyapısı.

### F. Geliştirici ve Dış Entegrasyonlar

- **RESTful API Endpointleri:** Firmanın kendi e-ticaret sitesiyle veya dış sistemlerle haberleşebilmesi.
- **Webhooks:** "Yeni fırsat açıldığında X adresine POST at" mantığı.

## 5. Uygulama Yol Haritası (Genişletilmiş Kapsam)

### FAZ 1: Altyapı ve Çekirdek (Core & Multi-Tenancy) | Hafta 1-3

- GitHub Repository, CI/CD Pipeline (GitHub Actions -> Docker Registry) kurulumu.
- .NET 9 Clean Architecture iskeleti. Shared Kernel oluşturma.
- Identity (JWT, Refresh Token), RBAC, Soft Delete, Audit Log interceptorlarının yazılması.
- Multi-Tenant izolasyon altyapısının (TenantId context) kurulması.
- Next.js projesinin, Tailwind+Shadcn tasarım sisteminin kurulması. Axios/Fetch interceptor'larının (Auth & Tenant Headers) ayarlanması.

### FAZ 2: Dinamik CRM Sistemi | Hafta 4-7

- EAV / JSON Custom Fields mekanizmasının hem Backend (\`DynamicEntity\`) hem de Frontend (Dynamic Forms) tarafında inşası.
- Müşteri, İletişim, Adres altyapısı.
- Satış Fırsatları Modülü (Kanban Board UI + Drag & Drop mekanikleri) ve Dinamik Aşamalar (Pipelines).
- Etkileşim günlüğü (Notlar, Çağrılar, Dosya Yüklemeleri).

### FAZ 3: Ürün Kataloğu ve Organizasyon | Hafta 8-10

- Dinamik Varyant yeteneğine sahip Ürün/Hizmet katalog mimarisi.
- Teklif oluşturma motoru (Kalem girme, İskonto, Vergi oranları). Tekliftin PDF'e render edilmesi.
- Firma içi Ajanda/Takvim (FullCalendar entegrasyonu) ve Görev atamaları.

### FAZ 4: Sipariş, Envanter ve Modülerlik | Hafta 11-13

- Fiyatlandırılan teklifin Siparişe dönüştürülmesi.
- Stok ve Çoklu Depo modellerinin ayağa kaldırılması (Feature toggle ile kontrol edilerek).
- Tedarik ve Satın Alma (Hammadde süreci) operasyonları.

### FAZ 5: Finans, Raporlama ve Analitik | Hafta 14-16

- Kasa/Banka, Gelir/Gider işleme formları, Cari Hareket tablosu.
- E-Fatura entegrasyon soyutlaması (Interface tabanlı).
- Dashboard: Sistemdeki verilerin React kütüphaneleri (Recharts vb.) ile görselleştirildiği, widget tabanlı dinamik şirket özeti ekranı.

### FAZ 6: Güvenlik, Performans ve Yayın | Hafta 17-18

- Webhook altyapısının tamamlanması.
- Kapsamlı Yük Testleri (Burden Testing) ve Güvenlik taraması. (N+1 Select ve Index kontrolleri).
- Üretim (Production) ortamı için kurgunun Container orkestrasyonu (Örn: Docker Swarm veya Kubernetes) ile ayağa kaldırılması ve canlıya alınması.
