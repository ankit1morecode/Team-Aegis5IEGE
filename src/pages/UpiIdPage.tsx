import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Smartphone, Copy, ShieldCheck } from "lucide-react";

const UpiIdPage = () => {
  const { user } = useAuth();
  const upiId = `${user?.email?.split("@")[0] || "user"}@flexcred`;

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    toast.success("UPI ID copied to clipboard!");
  };

  return (
    <AppLayout>
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Your UPI ID</h1>

        <Card className="shadow-elevated">
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-lg flex items-center justify-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              UPI Details
            </CardTitle>
            <CardDescription>Your unique payment identifier</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <div className="rounded-2xl gradient-primary p-8 w-full text-center">
              <p className="text-primary-foreground/70 text-sm mb-2">Your UPI ID</p>
              <p className="text-2xl font-heading font-bold text-primary-foreground font-mono tracking-wide">
                {upiId}
              </p>
            </div>

            <Button onClick={handleCopy} variant="outline" className="gap-2 w-full">
              <Copy className="h-4 w-4" />
              Copy UPI ID
            </Button>

            <div className="w-full space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className="bg-success/10 text-success border-success/20" variant="outline">
                  <ShieldCheck className="h-3 w-3 mr-1" /> Active
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                <span className="text-sm text-muted-foreground">Linked Email</span>
                <span className="text-sm font-medium text-foreground">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                <span className="text-sm text-muted-foreground">Provider</span>
                <span className="text-sm font-medium text-foreground">FlexCred UPI</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Share this UPI ID with others to receive instant payments directly to your FlexCred wallet.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default UpiIdPage;
