import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Calendar,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";

export interface CreditOfferDetails {
  paymentAmount: number;
  walletBalance: number;
  shortfall: number;
  recipient: string;
}

export { calculateWeeklyInterest } from "@/lib/interestConfig";
import { calculateWeeklyInterest, getInterestTiers } from "@/lib/interestConfig";

interface CreditOfferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer: CreditOfferDetails | null;
  onAccept: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export const CreditOfferModal = ({
  open,
  onOpenChange,
  offer,
  onAccept,
  onCancel,
  isProcessing,
}: CreditOfferModalProps) => {
  

  if (!offer) return null;

  const { paymentAmount, walletBalance, shortfall, recipient } = offer;
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 30);

  const initialCalc = calculateWeeklyInterest(shortfall, 1);

  const repaymentTiers = getInterestTiers();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Micro-Credit Offer
          </DialogTitle>
          <DialogDescription>
            You need a micro-loan to complete this payment. Review the terms
            below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Card */}
          <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Payment Amount
              </span>
              <span className="font-heading font-bold text-foreground text-lg">
                ₹{paymentAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Wallet Balance
              </span>
              <span className="font-medium text-foreground">
                ₹{walletBalance.toFixed(2)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-destructive flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                Shortfall (Loan Required)
              </span>
              <span className="font-heading font-bold text-destructive text-lg">
                ₹{shortfall.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Recipient</span>
              <span className="font-medium text-foreground">{recipient}</span>
            </div>
          </div>

          {/* Interest Policy */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
            <h4 className="font-heading font-semibold text-foreground text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Interest Policy
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Interest starts at <strong className="text-foreground">5%</strong> and increases automatically the longer the loan is outstanding.
            </p>
            <div className="space-y-1.5 mt-2">
              {repaymentTiers.map((tier) => {
                const interest = parseFloat((shortfall * (tier.rate / 100)).toFixed(2));
                const total = parseFloat((shortfall + interest).toFixed(2));
                return (
                  <div key={tier.week} className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">{tier.label}</span>
                    <span className="font-medium text-foreground">
                      {tier.rate}% → ₹{total.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current terms */}
          <div className="rounded-xl border border-border bg-secondary/30 p-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Initial repayment (week 1)</span>
            <span className="font-heading font-bold text-foreground">₹{initialCalc.total.toFixed(2)} <Badge variant="outline" className="ml-1 text-[10px] bg-warning/10 text-warning border-warning/20">5%</Badge></span>
          </div>

          {/* Due Date */}
          <div className="rounded-xl border border-warning/20 bg-warning/5 p-3 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-warning flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">
                Maximum Repayment Deadline
              </p>
              <p className="text-sm font-semibold text-foreground">
                {deadline.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Security note */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 mt-0.5 text-primary flex-shrink-0" />
            <p>
              By accepting, a micro-loan of ₹{shortfall.toFixed(2)} will be
              created. Your wallet balance will be combined with the loan to
              complete the payment.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button
            onClick={onAccept}
            disabled={isProcessing}
            className="w-full gradient-primary"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Accept Credit & Continue Payment
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="w-full"
          >
            Cancel Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
