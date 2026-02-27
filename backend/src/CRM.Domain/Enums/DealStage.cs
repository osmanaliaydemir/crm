namespace CRM.Domain.Enums;

public enum DealStage
{
    Lead = 0,           // Potansiyel Müşteri
    Qualified = 1,      // Nitelikli Fırsat
    Proposal = 2,       // Teklif Verildi
    Negotiation = 3,    // Pazarlık Aşamasında
    Won = 4,            // Kazanıldı (Satış)
    Lost = 5            // Kaybedildi
}
