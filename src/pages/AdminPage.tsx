import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAdmin } from "@/hooks/useAdmin";
import { useInterestSettings } from "@/hooks/useInterestSettings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Shield, TrendingUp, Save, Loader2, AlertTriangle, LayoutDashboard, Users, CreditCard, History, ShieldAlert, ClipboardList } from "lucide-react";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminLoans } from "@/components/admin/AdminLoans";
import { AdminTransactions } from "@/components/admin/AdminTransactions";
import { AdminFraud } from "@/components/admin/AdminFraud";
import { format } from "date-fns";

const AdminPage = () => {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const { settings, isLoading: settingsLoading, updateSettings } = useInterestSettings();

  // Bypass authentication for direct access
  const bypassAuth = true; // Allow direct admin access without login

  const [rates, setRates] = useState<{
    week1_rate: number;
    week2_rate: number;
    week3_rate: number;
    week4_rate: number;
    week5_plus_rate: number;
  } | null>(null);

  const currentRates = rates ?? (settings ? {
    week1_rate: settings.week1_rate,
    week2_rate: settings.week2_rate,
    week3_rate: settings.week3_rate,
    week4_rate: settings.week4_rate,
    week5_plus_rate: settings.week5_plus_rate,
  } : null);

  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, credit_score, is_blocked")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin || bypassAuth,
  });

  const { data: wallets } = useQuery({
    queryKey: ["admin-wallets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wallets")
        .select("user_id, balance, credit_limit, credit_used");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin || bypassAuth,
  });

  const { data: loans } = useQuery({
    queryKey: ["admin-loans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loans")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin || bypassAuth,
  });

  const { data: transactions } = useQuery({
    queryKey: ["admin-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin || bypassAuth,
  });

  const { data: adminLogs } = useQuery({
    queryKey: ["admin-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: isAdmin || bypassAuth,
  });

  const handleSaveRates = async () => {
    if (!currentRates) return;
    try {
      await updateSettings.mutateAsync(currentRates);
      toast.success("Interest rates updated for all users!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update rates");
    }
  };

  if (adminLoading || settingsLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin && !bypassAuth) {
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto py-20 text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="font-heading text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">You do not have admin privileges.</p>
        </div>
      </AppLayout>
    );
  }

  const rateFields = [
    { key: "week1_rate" as const, label: "Week 1" },
    { key: "week2_rate" as const, label: "Week 2" },
    { key: "week3_rate" as const, label: "Week 3" },
    { key: "week4_rate" as const, label: "Week 4" },
    { key: "week5_plus_rate" as const, label: "Week 5+" },
  ];

  const p = profiles ?? [];
  const w = wallets ?? [];
  const l = loans ?? [];
  const t = transactions ?? [];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="font-heading text-2xl font-bold text-foreground">Admin Panel</h1>
          <Badge className="bg-primary/10 text-primary border-primary/20">Admin</Badge>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-secondary/50 p-1">
            <TabsTrigger value="dashboard" className="gap-1.5 text-xs"><LayoutDashboard className="h-3.5 w-3.5" />Dashboard</TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5 text-xs"><Users className="h-3.5 w-3.5" />Users</TabsTrigger>
            <TabsTrigger value="loans" className="gap-1.5 text-xs"><CreditCard className="h-3.5 w-3.5" />Loans</TabsTrigger>
            <TabsTrigger value="transactions" className="gap-1.5 text-xs"><History className="h-3.5 w-3.5" />Transactions</TabsTrigger>
            <TabsTrigger value="fraud" className="gap-1.5 text-xs"><ShieldAlert className="h-3.5 w-3.5" />Fraud</TabsTrigger>
            <TabsTrigger value="interest" className="gap-1.5 text-xs"><TrendingUp className="h-3.5 w-3.5" />Interest</TabsTrigger>
            <TabsTrigger value="logs" className="gap-1.5 text-xs"><ClipboardList className="h-3.5 w-3.5" />Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminOverview profiles={p} loans={l} transactions={t} wallets={w} />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsers profiles={p} wallets={w} loans={l} transactions={t} />
          </TabsContent>

          <TabsContent value="loans">
            <AdminLoans loans={l} profiles={p} />
          </TabsContent>

          <TabsContent value="transactions">
            <AdminTransactions transactions={t} profiles={p} />
          </TabsContent>

          <TabsContent value="fraud">
            <AdminFraud profiles={p} loans={l} transactions={t} />
          </TabsContent>

          <TabsContent value="interest">
            <Card className="shadow-card border-primary/20">
              <CardHeader>
                <CardTitle className="font-heading text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Global Interest Rate Settings
                </CardTitle>
                <CardDescription>
                  These rates apply to all users' micro-loans. Changes take effect immediately.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentRates && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {rateFields.map((f) => (
                        <div key={f.key} className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                          <div className="relative">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              step={0.5}
                              value={currentRates[f.key]}
                              onChange={(e) =>
                                setRates({
                                  ...currentRates,
                                  [f.key]: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)),
                                })
                              }
                              className="pr-6 text-sm"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button onClick={handleSaveRates} disabled={updateSettings.isPending} className="gradient-primary gap-2">
                      {updateSettings.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                      Save Interest Rates
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-sm font-heading flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  Admin Activity Logs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="py-3 px-4 font-medium text-muted-foreground">Time</th>
                        <th className="py-3 px-4 font-medium text-muted-foreground">Action</th>
                        <th className="py-3 px-4 font-medium text-muted-foreground">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminLogs?.map((log: any) => (
                        <tr key={log.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                          <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(log.created_at), "dd MMM yyyy, hh:mm a")}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{log.action.replace(/_/g, " ")}</Badge>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground text-xs">{log.details || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!adminLogs || adminLogs.length === 0) && (
                    <p className="text-center py-8 text-muted-foreground">No admin activity logged yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminPage;
