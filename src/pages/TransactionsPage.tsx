import { AppLayout } from "@/components/AppLayout";
import { useTransactions } from "@/hooks/useTransactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownLeft, CreditCard, History, Loader2 } from "lucide-react";

const typeConfig: Record<string, { label: string; icon: typeof ArrowUpRight; color: string }> = {
  payment: { label: "Payment", icon: ArrowUpRight, color: "bg-destructive/10 text-destructive" },
  add_money: { label: "Added Money", icon: ArrowDownLeft, color: "bg-success/10 text-success" },
  loan_disbursement: { label: "Loan", icon: CreditCard, color: "bg-warning/10 text-warning" },
  loan_repayment: { label: "Repayment", icon: ArrowUpRight, color: "bg-primary/10 text-primary" },
};

const TransactionsPage = () => {
  const { transactions, isLoading } = useTransactions();

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Transaction History</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin h-6 w-6 text-primary" />
          </div>
        ) : transactions.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <History className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No transactions yet</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="space-y-1">
                {transactions.map((tx) => {
                  const config = typeConfig[tx.type] || typeConfig.payment;
                  const Icon = config.icon;
                  return (
                    <div key={tx.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${config.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{tx.description}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-xs font-normal py-0 h-5">
                              {config.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(tx.created_at), "MMM d, yyyy · h:mm a")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${
                        tx.type === "add_money" ? "text-success" : "text-destructive"
                      }`}>
                        {tx.type === "add_money" ? "+" : "-"}₹{tx.amount.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default TransactionsPage;
