import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useLoans } from "@/hooks/useLoans";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { Receipt, Loader2, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const LoansPage = () => {
  const { loans, isLoading, repayLoan } = useLoans();
  const [repayingLoanId, setRepayingLoanId] = useState<string | null>(null);
  

  const handleRepay = async (loanId: string) => {
    setRepayingLoanId(loanId);
    try {
      await repayLoan.mutateAsync(loanId);
      toast.success("Loan repaid successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to repay loan");
    } finally {
      setRepayingLoanId(null);
    }
  };

  const statusConfig = {
    active: { label: "Active", variant: "default" as const, icon: Clock, className: "bg-warning text-warning-foreground" },
    paid: { label: "Paid", variant: "secondary" as const, icon: CheckCircle2, className: "bg-success text-success-foreground" },
    overdue: { label: "Overdue", variant: "destructive" as const, icon: AlertTriangle, className: "bg-destructive text-destructive-foreground" },
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-foreground">Loans</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Receipt className="h-4 w-4" />
            {loans.filter((l) => l.status === "active").length} active
          </div>
        </div>

        

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin h-6 w-6 text-primary" />
          </div>
        ) : loans.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No loans yet. Loans are created automatically when your balance is insufficient for a payment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => {
              const config = statusConfig[loan.status];
              const StatusIcon = config.icon;
              const isRepaying = repayingLoanId === loan.id;
              return (
                <Card key={loan.id} className="shadow-card">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={config.className}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(loan.created_at), "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Loan</p>
                            <p className="font-semibold text-foreground">₹{loan.loan_amount.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Interest ({loan.interest_rate}%)</p>
                            <p className="font-semibold text-foreground">₹{loan.interest_amount.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Total Repayment</p>
                            <p className="font-semibold text-foreground">₹{loan.total_repayment.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Due Date</p>
                            <p className="font-semibold text-foreground">
                              {format(new Date(loan.repayment_deadline), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                      </div>
                      {loan.status === "active" && (
                        <Button
                          onClick={() => handleRepay(loan.id)}
                          disabled={isRepaying}
                          className="gradient-primary min-w-[140px]"
                        >
                          {isRepaying ? (
                            <Loader2 className="animate-spin h-4 w-4" />
                          ) : (
                            "Repay from Wallet"
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default LoansPage;
