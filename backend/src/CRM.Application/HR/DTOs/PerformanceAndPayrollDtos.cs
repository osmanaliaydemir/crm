namespace CRM.Application.HR.DTOs;

public class PerformanceEvaluationDto
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public Guid EvaluatorId { get; set; }
    public string EvaluatorName { get; set; } = string.Empty;
    public int Score { get; set; }
    public string Feedback { get; set; } = string.Empty;
    public DateTime EvaluationDate { get; set; }
    public string Period { get; set; } = string.Empty;
}

public class CreatePerformanceEvaluationDto
{
    public Guid EmployeeId { get; set; }
    public Guid EvaluatorId { get; set; }
    public int Score { get; set; }
    public string Feedback { get; set; } = string.Empty;
    public DateTime EvaluationDate { get; set; }
    public string Period { get; set; } = string.Empty;
}

public class PayrollDto
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string Period { get; set; } = string.Empty;
    public decimal BasicSalary { get; set; }
    public decimal Bonus { get; set; }
    public decimal Deductions { get; set; }
    public decimal NetSalary { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? PaymentDate { get; set; }
}

public class CreatePayrollDto
{
    public Guid EmployeeId { get; set; }
    public string Period { get; set; } = string.Empty;
    public decimal BasicSalary { get; set; }
    public decimal Bonus { get; set; }
    public decimal Deductions { get; set; }
}

public class UpdatePayrollStatusDto
{
    public Guid Id { get; set; }
    public string Status { get; set; } = string.Empty; // Ödendi vb.
    public DateTime? PaymentDate { get; set; }
}
