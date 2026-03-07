import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useWallet } from "@/hooks/useWallet";
import { useCreditScore } from "@/hooks/useCreditScore";
import { useKyc } from "@/hooks/useKyc";
import { KycBanner } from "@/components/KycBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadialGauge } from "@/components/RadialGauge";
import { toast } from "sonner";
import { Wallet, Loader2, Shield } from "lucide-react";

const WalletPage = () => {
  const { wallet, isLoading, addMoney } = useWallet();
  const { creditProfile } = useCreditScore();
  const { isKycVerified } = useKyc();
  const [amount, setAmount] = useState("");

  const handleAddMoney = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      await addMoney.mutateAsync(val);
      toast.success(`₹${val.toFixed(2)} added to wallet`);
      setAmount("");
    } catch (err: any) {
      toast.error(err.message || "Failed to add money");
    }
  };

  const quickAmounts = [100, 500, 1000, 5000];

  const scoreColor = creditProfile
    ? creditProfile.creditScore >= 700
      ? "stroke-success"
      : creditProfile.creditScore >= 500
        ? "stroke-warning"
        : "stroke-[hsl(var(--destructive))]"
    : "stroke-muted";

  const utilizationPercent = creditProfile && creditProfile.creditLimit > 0
    ? (creditProfile.creditUsed / creditProfile.creditLimit) * 100
    : 0;

  const utilizationColor = utilizationPercent > 75
    ? "stroke-[hsl(var(--destructive))]"
    : utilizationPercent > 40
      ? "stroke-warning"
      : "stroke-success";

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Wallet</h1>

        <Card className="shadow-elevated overflow-hidden">
          <div className="gradient-primary p-8">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="h-8 w-8 text-primary-foreground" />
              <span className="text-primary-foreground/80 text-sm font-medium">Available Balance</span>
            </div>
            <p className="text-4xl font-heading font-bold text-primary-foreground">
              ₹{isLoading ? "..." : (wallet?.balance ?? 0).toFixed(2)}
            </p>
          </div>
        </Card>

        <KycBanner />

        {/* Credit Gauges */}
        {creditProfile && isKycVerified && (
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-heading text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Credit Profile
                <Badge variant="outline" className={
                  creditProfile.riskLevel === "LOW" ? "bg-success/10 text-success border-success/20" :
                  creditProfile.riskLevel === "MEDIUM" ? "bg-warning/10 text-warning border-warning/20" :
                  "bg-destructive/10 text-destructive border-destructive/20"
                }>
                  {creditProfile.riskLevel} Risk
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex justify-center gap-8">
                <RadialGauge
                  value={creditProfile.creditScore}
                  max={900}
                  label="Credit Score"
                  sublabel={creditProfile.creditScore >= 700 ? "Excellent" : creditProfile.creditScore >= 500 ? "Fair" : "Poor"}
                  colorClass={scoreColor}
                  size={120}
                  strokeWidth={9}
                />
                <RadialGauge
                  value={Math.round(utilizationPercent)}
                  max={100}
                  label="Utilization"
                  sublabel={`of ₹${creditProfile.creditLimit.toFixed(0)}`}
                  colorClass={utilizationColor}
                  size={120}
                  strokeWidth={9}
                  formatValue={(v) => `${v}%`}
                />
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Limit</p>
                  <p className="text-sm font-bold text-foreground">₹{creditProfile.creditLimit.toFixed(0)}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Used</p>
                  <p className="text-sm font-bold text-warning">₹{creditProfile.creditUsed.toFixed(0)}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Available</p>
                  <p className="text-sm font-bold text-success">₹{creditProfile.availableCredit.toFixed(0)}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Credit utilization</span>
                  <span>{utilizationPercent.toFixed(0)}%</span>
                </div>
                <Progress value={utilizationPercent} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Add Money</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {quickAmounts.map((qa) => (
                <Button
                  key={qa}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(qa.toString())}
                  className="text-sm hover:bg-primary/10 hover:border-primary/30 transition-colors"
                >
                  ₹{qa}
                </Button>
              ))}
            </div>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max="100000"
            />
            <Button
              onClick={handleAddMoney}
              disabled={addMoney.isPending}
              className="w-full gradient-primary"
            >
              {addMoney.isPending ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                "Add Money"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default WalletPage;
