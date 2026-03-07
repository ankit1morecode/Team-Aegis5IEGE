import { AppLayout } from "@/components/AppLayout";
import { useWallet } from "@/hooks/useWallet";
import { useLoans } from "@/hooks/useLoans";
import { useTransactions } from "@/hooks/useTransactions";
import { useCreditScore } from "@/hooks/useCreditScore";
import { useMicroCreditLimit } from "@/hooks/useMicroCreditLimit";
import { useAuth } from "@/hooks/useAuth";
import { useKyc } from "@/hooks/useKyc";
import { KycBanner } from "@/components/KycBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadialGauge } from "@/components/RadialGauge";
import { Wallet, Receipt, TrendingUp, ArrowUpRight, ArrowDownLeft, CreditCard, Shield, Gauge, Zap, Target, Activity, ShieldCheck, Sparkles } from "lucide-react";
import { format } from "date-fns";

const Dashboard = () => {
  const { user } = useAuth();
  const { wallet, isLoading: walletLoading } = useWallet();
  const { loans } = useLoans();
  const { transactions } = useTransactions();
  const { creditProfile } = useCreditScore();
  const { microCredit } = useMicroCreditLimit();
  const { isKycVerified } = useKyc();

  const activeLoans = loans.filter((l) => l.status === "active");
  const paidLoans = loans.filter((l) => l.status === "paid");
  const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.total_repayment, 0);
  const recentTx = transactions.slice(0, 5);

  const scoreColor = creditProfile
    ? creditProfile.creditScore >= 700
      ? "stroke-success"
      : creditProfile.creditScore >= 500
        ? "stroke-warning"
        : "stroke-[hsl(var(--destructive))]"
    : "stroke-muted";

  const riskBadgeConfig = {
    LOW: { className: "bg-success/10 text-success border-success/20", label: "Low Risk" },
    MEDIUM: { className: "bg-warning/10 text-warning border-warning/20", label: "Medium Risk" },
    HIGH: { className: "bg-destructive/10 text-destructive border-destructive/20", label: "High Risk" },
  };

  const utilizationPercent = creditProfile && creditProfile.creditLimit > 0
    ? (creditProfile.creditUsed / creditProfile.creditLimit) * 100
    : 0;

  const utilizationColor = utilizationPercent > 75
    ? "stroke-[hsl(var(--destructive))]"
    : utilizationPercent > 40
      ? "stroke-warning"
      : "stroke-success";

  const riskGaugeColor = creditProfile?.riskLevel === "HIGH"
    ? "stroke-[hsl(var(--destructive))]"
    : creditProfile?.riskLevel === "MEDIUM"
      ? "stroke-warning"
      : "stroke-success";

  const riskValue = creditProfile?.riskLevel === "HIGH" ? 85 : creditProfile?.riskLevel === "MEDIUM" ? 50 : 20;

  const repaymentRate = loans.length > 0 ? Math.round((paidLoans.length / loans.length) * 100) : 100;

  const txIcon = (type: string) => {
    switch (type) {
      case "payment": return <ArrowUpRight className="h-4 w-4 text-destructive" />;
      case "add_money": return <ArrowDownLeft className="h-4 w-4 text-success" />;
      case "loan_disbursement": return <CreditCard className="h-4 w-4 text-warning" />;
      case "loan_repayment": return <ArrowUpRight className="h-4 w-4 text-primary" />;
      default: return null;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground inline-flex items-center gap-2">
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}
            {isKycVerified && (
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary" title="KYC Verified">
                <ShieldCheck className="h-3.5 w-3.5 text-primary-foreground" />
              </span>
            )}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Your financial overview</p>
        </div>

        <KycBanner />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-card hover:shadow-elevated transition-shadow duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className="text-2xl font-heading font-bold text-foreground">
                    ₹{walletLoading ? "..." : (wallet?.balance ?? 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-shadow duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl gradient-accent flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Loans</p>
                  <p className="text-2xl font-heading font-bold text-foreground">{activeLoans.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-shadow duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-warning flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-warning-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding</p>
                  <p className="text-2xl font-heading font-bold text-foreground">₹{totalOutstanding.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-shadow duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Zap className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-heading font-bold text-foreground">{transactions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gauges Section */}
        {creditProfile && isKycVerified && (
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-heading text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Financial Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-4">
                <RadialGauge
                  value={creditProfile.creditScore}
                  max={900}
                  label="Credit Score"
                  sublabel={creditProfile.creditScore >= 700 ? "Excellent" : creditProfile.creditScore >= 500 ? "Fair" : "Poor"}
                  colorClass={scoreColor}
                  size={130}
                  strokeWidth={10}
                />
                <RadialGauge
                  value={Math.round(utilizationPercent)}
                  max={100}
                  label="Utilization"
                  sublabel={`₹${creditProfile.creditUsed.toFixed(0)} used`}
                  colorClass={utilizationColor}
                  size={130}
                  strokeWidth={10}
                  formatValue={(v) => `${v}%`}
                />
                <RadialGauge
                  value={riskValue}
                  max={100}
                  label="Risk Level"
                  sublabel={creditProfile.riskLevel}
                  colorClass={riskGaugeColor}
                  size={130}
                  strokeWidth={10}
                  formatValue={() => creditProfile.riskLevel}
                />
                <RadialGauge
                  value={repaymentRate}
                  max={100}
                  label="Repayment Rate"
                  sublabel={`${paidLoans.length}/${loans.length} paid`}
                  colorClass={repaymentRate >= 80 ? "stroke-success" : repaymentRate >= 50 ? "stroke-warning" : "stroke-[hsl(var(--destructive))]"}
                  size={130}
                  strokeWidth={10}
                  formatValue={(v) => `${v}%`}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Credit Wallet Card */}
        {creditProfile && isKycVerified && (
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Credit Wallet
                <Badge variant="outline" className={riskBadgeConfig[creditProfile.riskLevel].className}>
                  {riskBadgeConfig[creditProfile.riskLevel].label}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="rounded-lg bg-secondary/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Credit Limit</p>
                  <p className="text-lg font-heading font-bold text-foreground">₹{creditProfile.creditLimit.toFixed(0)}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Used</p>
                  <p className="text-lg font-heading font-bold text-warning">₹{creditProfile.creditUsed.toFixed(0)}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Available</p>
                  <p className="text-lg font-heading font-bold text-success">₹{creditProfile.availableCredit.toFixed(0)}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Credit utilization</span>
                  <span>{utilizationPercent.toFixed(0)}%</span>
                </div>
                <Progress
                  value={utilizationPercent}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Micro-Credit Limit Card */}
        {microCredit && isKycVerified && (
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Micro-Credit Limit
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  ₹{microCredit.credit_limit}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="rounded-lg bg-secondary/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Transactions</p>
                  <p className="text-lg font-heading font-bold text-foreground">{microCredit.transaction_count}</p>
                  <p className="text-[10px] text-muted-foreground">{microCredit.transaction_count > 20 ? "+₹200 bonus" : "Need 20+"}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Repayment Rate</p>
                  <p className="text-lg font-heading font-bold text-foreground">{microCredit.repayment_success_rate}%</p>
                  <p className="text-[10px] text-muted-foreground">{microCredit.repayment_success_rate > 90 ? "+₹300 bonus" : "Need 90%+"}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Monthly Freq.</p>
                  <p className="text-lg font-heading font-bold text-foreground">{microCredit.monthly_payment_frequency}</p>
                  <p className="text-[10px] text-muted-foreground">{microCredit.monthly_payment_frequency > 10 ? "+₹200 bonus" : "Need 10+"}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Micro-credit progress</span>
                  <span>₹{microCredit.credit_limit} / ₹1,200</span>
                </div>
                <Progress value={(microCredit.credit_limit / 1200) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Transactions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTx.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {recentTx.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 hover:bg-secondary/30 rounded-lg px-2 -mx-2 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                        {txIcon(tx.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(tx.created_at), "MMM d, yyyy · h:mm a")}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${
                      tx.type === "add_money" ? "text-success" : tx.type === "payment" || tx.type === "loan_repayment" ? "text-destructive" : "text-warning"
                    }`}>
                      {tx.type === "add_money" ? "+" : "-"}₹{tx.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
