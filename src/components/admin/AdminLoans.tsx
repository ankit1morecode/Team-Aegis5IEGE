import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

interface Props {
  loans: any[];
  profiles: any[];
}

export const AdminLoans = ({ loans, profiles }: Props) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const profileMap = new Map(profiles.map((p: any) => [p.user_id, p]));

  const filtered = loans.filter((l: any) => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (search) {
      const p = profileMap.get(l.user_id);
      return p?.full_name?.toLowerCase().includes(search.toLowerCase()) || p?.email?.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const logAction = async (action: string, targetUserId: string, details: string) => {
    await supabase.from("admin_logs").insert({ admin_id: user!.id, action, target_user_id: targetUserId, details });
  };

  const markRepaid = async (loan: any) => {
    const { error } = await supabase.from("loans").update({ status: "paid" }).eq("id", loan.id);
    if (error) return toast.error(error.message);
    await logAction("mark_loan_repaid", loan.user_id, `Marked loan ₹${loan.loan_amount} as repaid`);
    toast.success("Loan marked as repaid");
    qc.invalidateQueries({ queryKey: ["admin-loans"] });
  };

  const cancelLoan = async (loan: any) => {
    // We'll set status to "paid" with a log noting cancellation (no "cancelled" enum value)
    const { error } = await supabase.from("loans").update({ status: "paid" }).eq("id", loan.id);
    if (error) return toast.error(error.message);
    await logAction("cancel_loan", loan.user_id, `Cancelled fraudulent loan ₹${loan.loan_amount}`);
    toast.success("Loan cancelled");
    qc.invalidateQueries({ queryKey: ["admin-loans"] });
  };

  const statusBadge = (status: string) => {
    if (status === "active") return <Badge className="bg-primary/10 text-primary border-primary/20">Active</Badge>;
    if (status === "paid") return <Badge className="bg-success/10 text-success border-success/20">Paid</Badge>;
    return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Overdue</Badge>;
  };

  const totalInterest = filtered.reduce((s: number, l: any) => s + (l.interest_amount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by user..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-muted-foreground">{filtered.length} loans</Badge>
        <Badge variant="outline" className="text-success border-success/20">Interest: ₹{totalInterest.toFixed(0)}</Badge>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-3 px-4 font-medium text-muted-foreground">User</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground">Loan Amount</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground">Interest</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground">Total Repay</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground">Due Date</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l: any) => {
                  const p = profileMap.get(l.user_id);
                  return (
                    <tr key={l.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-medium text-foreground">{p?.full_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{p?.email}</p>
                      </td>
                      <td className="py-3 px-4 font-medium">₹{l.loan_amount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-muted-foreground">₹{l.interest_amount?.toFixed(2) ?? "0"} ({l.interest_rate}%)</td>
                      <td className="py-3 px-4 font-medium">₹{l.total_repayment.toFixed(2)}</td>
                      <td className="py-3 px-4">{statusBadge(l.status)}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{format(new Date(l.repayment_deadline), "dd MMM yyyy")}</td>
                      <td className="py-3 px-4">
                        {l.status === "active" || l.status === "overdue" ? (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => markRepaid(l)} className="text-success gap-1">
                              <CheckCircle className="h-3.5 w-3.5" /> Repaid
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => cancelLoan(l)} className="text-destructive gap-1">
                              <XCircle className="h-3.5 w-3.5" /> Cancel
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground">No loans found.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
