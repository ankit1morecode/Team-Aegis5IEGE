import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { usePayment } from "@/hooks/usePayment";
import { useWallet } from "@/hooks/useWallet";
import { useCreditScore } from "@/hooks/useCreditScore";
import { useKyc } from "@/hooks/useKyc";
import { KycBanner } from "@/components/KycBanner";
import { CreditOfferModal, CreditOfferDetails } from "@/components/CreditOfferModal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RadialGauge } from "@/components/RadialGauge";
import { toast } from "sonner";
import { Send, Loader2, AlertTriangle, CheckCircle2, CreditCard, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import type { RiskAssessment } from "@/hooks/useRiskEngine";

const SendPayment = () => {
  const { user } = useAuth();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [creditOffer, setCreditOffer] = useState<CreditOfferDetails | null>(null);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    loanCreated: boolean;
    loanAmount?: number;
    interestAmount?: number;
    totalRepayment?: number;
    riskAssessment?: RiskAssessment;
  } | null>(null);

  const { sendPayment } = usePayment();
  const { wallet } = useWallet();
  const { creditProfile } = useCreditScore();
  const { isKycVerified } = useKyc();

  // Check if user is blocked
  const { data: profileData } = useQuery({
    queryKey: ["profile-blocked", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("is_blocked")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });
  const isBlocked = profileData?.is_blocked ?? false;

  const balance = wallet?.balance ?? 0;
  const payAmount = parseFloat(amount) || 0;
  const shortfall = payAmount > balance ? payAmount - balance : 0;
  const availableCredit = creditProfile?.availableCredit ?? 0;
  const creditExceeded = shortfall > availableCredit;

  const handleSend = async () => {
    const val = parseFloat(amount);
    if (!recipient.trim()) { toast.error("Enter recipient name"); return; }
    if (isNaN(val) || val <= 0) { toast.error("Enter a valid amount"); return; }

    // If insufficient balance, show credit offer modal instead of proceeding
    if (val > balance) {
      if (creditExceeded) {
        toast.error("Insufficient credit limit for this payment");
        return;
      }
      setCreditOffer({
        paymentAmount: val,
        walletBalance: balance,
        shortfall: val - balance,
        recipient: recipient.trim(),
      });
      setShowCreditModal(true);
      return;
    }

    // Sufficient balance — pay directly
    await executePayment(false);
  };

  const executePayment = async (acceptedLoan: boolean) => {
    const val = parseFloat(amount);
    try {
      const res = await sendPayment.mutateAsync({
        recipient: recipient.trim(),
        amount: val,
        acceptedLoan,
      });
      setResult(res);
      setShowCreditModal(false);
      setCreditOffer(null);
      if (res.loanCreated) {
        toast.warning(`Payment completed with micro-loan of ₹${res.loanAmount?.toFixed(2)}. Repay within 7 days for 5% interest!`);
      } else {
        toast.success("Payment successful!");
      }
      setRecipient("");
      setAmount("");
    } catch (err: any) {
      toast.error(err.message || "Payment failed");
    }
  };

  const handleAcceptCredit = () => executePayment(true);

  const handleCancelCredit = () => {
    setShowCreditModal(false);
    setCreditOffer(null);
  };

  const scoreColor = creditProfile
    ? creditProfile.creditScore >= 700
      ? "stroke-success"
      : creditProfile.creditScore >= 500
        ? "stroke-warning"
        : "stroke-[hsl(var(--destructive))]"
    : "stroke-muted";

  const riskGaugeColor = creditProfile?.riskLevel === "HIGH"
    ? "stroke-[hsl(var(--destructive))]"
    : creditProfile?.riskLevel === "MEDIUM"
      ? "stroke-warning"
      : "stroke-success";

  const riskValue = creditProfile?.riskLevel === "HIGH" ? 85 : creditProfile?.riskLevel === "MEDIUM" ? 50 : 20;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Send Payment</h1>
        <KycBanner />

        {isBlocked && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="font-heading font-semibold text-destructive text-sm">Account Blocked</p>
              <p className="text-xs text-muted-foreground">Your account has been blocked by the administrator. You cannot make payments or transactions.</p>
            </div>
          </div>
        )}

        {/* Credit & Risk Gauges */}
        {creditProfile && isKycVerified && (
          <Card className="shadow-card">
            <CardContent className="py-5">
              <div className="flex items-center justify-center gap-8">
                <RadialGauge
                  value={creditProfile.creditScore}
                  max={900}
                  label="Credit Score"
                  sublabel={creditProfile.creditScore >= 700 ? "Excellent" : creditProfile.creditScore >= 500 ? "Fair" : "Poor"}
                  colorClass={scoreColor}
                  size={100}
                  strokeWidth={8}
                />
                <RadialGauge
                  value={riskValue}
                  max={100}
                  label="Risk Level"
                  sublabel={creditProfile.riskLevel}
                  colorClass={riskGaugeColor}
                  size={100}
                  strokeWidth={8}
                  formatValue={() => creditProfile.riskLevel}
                />
                <div className="flex flex-col items-center gap-1">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Available Credit</p>
                    <p className="text-2xl font-heading font-bold text-success">₹{availableCredit.toFixed(0)}</p>
                  </div>
                  <Badge variant="outline" className={
                    creditProfile.riskLevel === "LOW" ? "bg-success/10 text-success border-success/20" :
                    creditProfile.riskLevel === "MEDIUM" ? "bg-warning/10 text-warning border-warning/20" :
                    "bg-destructive/10 text-destructive border-destructive/20"
                  }>
                    {creditProfile.riskLevel} Risk
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" /> Make a Payment
            </CardTitle>
            <CardDescription>Current balance: ₹{balance.toFixed(2)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Recipient Name</label>
              <Input
                placeholder="Enter recipient name or UPI ID"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Amount (₹)</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
              />
            </div>

            {shortfall > 0 && (
              <div className={`rounded-lg border p-4 space-y-2 ${
                creditExceeded ? "border-destructive/30 bg-destructive/5" : "border-warning/30 bg-warning/5"
              }`}>
                <div className={`flex items-center gap-2 ${creditExceeded ? "text-destructive" : "text-warning"}`}>
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-semibold">
                    {creditExceeded ? "Credit limit exceeded" : "Insufficient balance — credit offer will appear"}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Required credit: <strong className="text-foreground">₹{shortfall.toFixed(2)}</strong></p>
                  <p>Available credit: <strong className="text-foreground">₹{availableCredit.toFixed(0)}</strong></p>
                  {!creditExceeded && (
                    <p className="text-success text-xs">5% interest if repaid within 7 days!</p>
                  )}
                </div>
              </div>
            )}

            <Button
              onClick={handleSend}
              disabled={sendPayment.isPending || creditExceeded || isBlocked}
              className="w-full gradient-primary"
            >
              {sendPayment.isPending ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {creditExceeded ? "Insufficient Credit" : shortfall > 0 ? "Review Credit Offer & Pay" : "Send Payment"}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className={`shadow-card border-l-4 animate-fade-in ${result.loanCreated ? "border-l-warning" : "border-l-success"}`}>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                {result.loanCreated ? (
                  <CreditCard className="h-6 w-6 text-warning mt-0.5" />
                ) : (
                  <CheckCircle2 className="h-6 w-6 text-success mt-0.5" />
                )}
                <div>
                  <p className="font-heading font-semibold text-foreground">
                    {result.loanCreated ? "Payment completed with Micro-Loan" : "Payment Successful!"}
                  </p>
                  {result.loanCreated && (
                    <div className="text-sm text-muted-foreground mt-2 space-y-1">
                      <p>Loan amount: ₹{result.loanAmount?.toFixed(2)}</p>
                      <p className="text-success font-medium">Repay within 7 days for 5% interest!</p>
                      <p className="text-xs">After 7 days: +5% per week</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Risk Assessment Gauge */}
              {result.riskAssessment && (
                <div className="rounded-lg bg-secondary/50 p-4 flex items-center gap-6">
                  <RadialGauge
                    value={result.riskAssessment.riskScore}
                    max={100}
                    label="Risk Score"
                    sublabel={result.riskAssessment.riskLevel}
                    colorClass={
                      result.riskAssessment.riskLevel === "HIGH" ? "stroke-[hsl(var(--destructive))]" :
                      result.riskAssessment.riskLevel === "MEDIUM" ? "stroke-warning" : "stroke-success"
                    }
                    size={80}
                    strokeWidth={7}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      Risk Assessment
                    </p>
                    {result.riskAssessment.flags.length > 0 && (
                      <ul className="text-xs text-muted-foreground space-y-0.5 mt-1">
                        {result.riskAssessment.flags.map((flag, i) => (
                          <li key={i}>• {flag}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Credit Offer Modal */}
      <CreditOfferModal
        open={showCreditModal}
        onOpenChange={setShowCreditModal}
        offer={creditOffer}
        onAccept={handleAcceptCredit}
        onCancel={handleCancelCredit}
        isProcessing={sendPayment.isPending}
      />
    </AppLayout>
  );
};

export default SendPayment;
