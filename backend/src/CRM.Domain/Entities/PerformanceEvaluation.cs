using CRM.Domain.Common;

namespace CRM.Domain.Entities;

public class PerformanceEvaluation : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public User Employee { get; set; } = null!;
    
    public Guid EvaluatorId { get; set; }
    public User Evaluator { get; set; } = null!;
    
    public int Score { get; set; } // Örn: 0-100 arası
    public string Feedback { get; set; } = string.Empty;
    public DateTime EvaluationDate { get; set; }
    public string Period { get; set; } = string.Empty; // Örn: "2024 Q1", "2023 Yıl Sonu"
}
