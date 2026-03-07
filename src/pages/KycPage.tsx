import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useKyc, type KycFormData } from "@/hooks/useKyc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RadialGauge } from "@/components/RadialGauge";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserCheck,
  Loader2,
  ShieldCheck,
  Clock,
  XCircle,
  FileText,
  Briefcase,
  MapPin,
  CreditCard,
} from "lucide-react";

const KycPage = () => {
  const { user } = useAuth();
  const { kyc, isLoading, submitKyc, isKycVerified, isKycSubmitted, isKycRejected } = useKyc();

  const [form, setForm] = useState<KycFormData>({
    full_name: user?.user_metadata?.full_name || "",
    date_of_birth: "",
    pan_number: "",
    aadhaar_number: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    employment_type: "",
    monthly_income: 0,
  });

  const updateField = (field: keyof KycFormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.full_name.trim()) { toast.error("Full name is required"); return; }
    if (!form.date_of_birth) { toast.error("Date of birth is required"); return; }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan_number.toUpperCase())) {
      toast.error("Enter a valid PAN number (e.g., ABCDE1234F)");
      return;
    }
    if (!/^\d{12}$/.test(form.aadhaar_number)) {
      toast.error("Enter a valid 12-digit Aadhaar number");
      return;
    }
    if (!form.address.trim()) { toast.error("Address is required"); return; }
    if (!form.city.trim()) { toast.error("City is required"); return; }
    if (!form.state.trim()) { toast.error("State is required"); return; }
    if (!/^\d{6}$/.test(form.pincode)) { toast.error("Enter a valid 6-digit pincode"); return; }
    if (!form.employment_type) { toast.error("Select employment type"); return; }
    if (form.monthly_income <= 0) { toast.error("Enter valid monthly income"); return; }

    try {
      await submitKyc.mutateAsync({
        ...form,
        pan_number: form.pan_number.toUpperCase(),
      });
      toast.success("KYC submitted successfully! Verification in progress...");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit KYC");
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </AppLayout>
    );
  }

  // Status display for submitted/verified/rejected
  if (isKycVerified || isKycSubmitted || isKycRejected) {
    const statusConfig = {
      verified: {
        icon: ShieldCheck,
        color: "text-success",
        gaugeColor: "stroke-success",
        badge: "bg-success/10 text-success border-success/20",
        title: "KYC Verified",
        desc: "Your identity has been verified. You have full access to credit features.",
        value: 100,
      },
      submitted: {
        icon: Clock,
        color: "text-warning",
        gaugeColor: "stroke-warning",
        badge: "bg-warning/10 text-warning border-warning/20",
        title: "KYC Under Review",
        desc: "Your documents are being verified. This usually takes a few moments.",
        value: 60,
      },
      rejected: {
        icon: XCircle,
        color: "text-destructive",
        gaugeColor: "stroke-[hsl(var(--destructive))]",
        badge: "bg-destructive/10 text-destructive border-destructive/20",
        title: "KYC Rejected",
        desc: "Your verification was unsuccessful. Please resubmit with correct details.",
        value: 0,
      },
    };

    const status = kyc!.status as "verified" | "submitted" | "rejected";
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="font-heading text-2xl font-bold text-foreground">KYC Verification</h1>

          <Card className="shadow-elevated">
            <CardContent className="py-8">
              <div className="flex flex-col items-center gap-6">
                <RadialGauge
                  value={config.value}
                  max={100}
                  label="Verification"
                  sublabel={config.title}
                  colorClass={config.gaugeColor}
                  size={150}
                  strokeWidth={12}
                  formatValue={(v) => `${v}%`}
                />
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Icon className={`h-6 w-6 ${config.color}`} />
                    <h2 className="font-heading text-xl font-bold text-foreground">{config.title}</h2>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-md">{config.desc}</p>
                  <Badge variant="outline" className={config.badge}>
                    {kyc!.status.toUpperCase()}
                  </Badge>
                </div>

                {kyc!.status === "verified" && (
                  <div className="grid grid-cols-2 gap-4 w-full mt-4">
                    <div className="rounded-lg bg-secondary/50 p-3 text-center">
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="text-sm font-medium text-foreground">{kyc!.full_name}</p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-3 text-center">
                      <p className="text-xs text-muted-foreground">PAN</p>
                      <p className="text-sm font-medium text-foreground">{kyc!.pan_number.slice(0, 2)}****{kyc!.pan_number.slice(-2)}</p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-3 text-center">
                      <p className="text-xs text-muted-foreground">Employment</p>
                      <p className="text-sm font-medium text-foreground capitalize">{kyc!.employment_type}</p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-3 text-center">
                      <p className="text-xs text-muted-foreground">Monthly Income</p>
                      <p className="text-sm font-medium text-foreground">₹{kyc!.monthly_income.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // KYC Form
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">KYC Verification</h1>

        <Card className="shadow-card border-l-4 border-l-primary">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Complete KYC to unlock credit features</p>
                <p className="text-xs text-muted-foreground">Micro-loans, credit wallet, and dynamic limits require identity verification.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Identity Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Identity Details
            </CardTitle>
            <CardDescription>Personal information as per government records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
              <Input
                placeholder="As per PAN card"
                value={form.full_name}
                onChange={(e) => updateField("full_name", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Date of Birth</label>
              <Input
                type="date"
                value={form.date_of_birth}
                onChange={(e) => updateField("date_of_birth", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">PAN Number</label>
                <Input
                  placeholder="ABCDE1234F"
                  value={form.pan_number}
                  onChange={(e) => updateField("pan_number", e.target.value.toUpperCase())}
                  maxLength={10}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Aadhaar Number</label>
                <Input
                  placeholder="1234 5678 9012"
                  value={form.aadhaar_number}
                  onChange={(e) => updateField("aadhaar_number", e.target.value.replace(/\D/g, ""))}
                  maxLength={12}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Address Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Address</label>
              <Input
                placeholder="House/Flat no., Street, Locality"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">City</label>
                <Input
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">State</label>
                <Input
                  placeholder="State"
                  value={form.state}
                  onChange={(e) => updateField("state", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Pincode</label>
                <Input
                  placeholder="000000"
                  value={form.pincode}
                  onChange={(e) => updateField("pincode", e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Employment & Income
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Employment Type</label>
              <Select value={form.employment_type} onValueChange={(v) => updateField("employment_type", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salaried">Salaried</SelectItem>
                  <SelectItem value="self_employed">Self Employed</SelectItem>
                  <SelectItem value="business">Business Owner</SelectItem>
                  <SelectItem value="freelancer">Freelancer</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Monthly Income (₹)</label>
              <Input
                type="number"
                placeholder="Enter monthly income"
                value={form.monthly_income || ""}
                onChange={(e) => updateField("monthly_income", parseFloat(e.target.value) || 0)}
                min="0"
              />
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleSubmit}
          disabled={submitKyc.isPending}
          className="w-full gradient-primary text-lg py-6"
        >
          {submitKyc.isPending ? (
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
          ) : (
            <CreditCard className="h-5 w-5 mr-2" />
          )}
          Submit KYC & Unlock Credit
        </Button>
      </div>
    </AppLayout>
  );
};

export default KycPage;
