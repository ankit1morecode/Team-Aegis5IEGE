import { Link } from "react-router-dom";
import { useKyc } from "@/hooks/useKyc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ArrowRight, Clock, ShieldCheck } from "lucide-react";

interface KycBannerProps {
  /** If true, shows nothing when KYC is verified */
  hideWhenVerified?: boolean;
}

export const KycBanner = ({ hideWhenVerified = true }: KycBannerProps) => {
  const { kyc, isLoading, isKycVerified, isKycSubmitted, isKycPending, isKycRejected } = useKyc();

  if (isLoading) return null;
  if (hideWhenVerified && isKycVerified) return null;

  if (isKycSubmitted) {
    return (
      <Card className="shadow-card border-l-4 border-l-warning animate-fade-in">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm font-medium text-foreground">KYC Under Review</p>
                <p className="text-xs text-muted-foreground">Your documents are being verified.</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
              Pending
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isKycPending || isKycRejected) {
    return (
      <Card className="shadow-card border-l-4 border-l-primary animate-fade-in">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {isKycRejected ? "KYC Rejected — Please resubmit" : "Complete KYC to unlock credit"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Micro-loans and credit wallet require identity verification.
                </p>
              </div>
            </div>
            <Link to="/kyc">
              <Button size="sm" className="gradient-primary gap-1">
                {isKycRejected ? "Resubmit" : "Verify Now"}
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};
