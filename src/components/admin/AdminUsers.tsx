import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Users, Eye, Ban, CheckCircle, Search, Wallet, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { getCreditLimitFromScore, getRiskLevel } from "@/hooks/useCreditScore";

interface Props {
  profiles: any[];
  wallets: any[];
  loans: any[];
  transactions: any[];
}

export const AdminUsers = ({ profiles, wallets, loans, transactions }: Props) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const walletMap = new Map(wallets.map((w: any) => [w.user_id, w]));
  const loansByUser = new Map<string, any[]>();
  loans.forEach((l: any) => {
    if (!loansByUser.has(l.user_id)) loansByUser.set(l.user_id, []);
    loansByUser.get(l.user_id)!.push(l);
  });

  const filtered = profiles.filter(
    (p: any) =>
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const userTx = transactions.filter((t: any) => t.user_id === selectedUser?.user_id);

  const logAction = async (action: string, targetUserId: string, details: string) => {
    await supabase.from("admin_logs").insert({
      admin_id: user!.id,
      action,
      target_user_id: targetUserId,
      details,
    });
  };

  const toggleBlock = async (p: any) => {
    const newVal = !p.is_blocked;
    const { error } = await supabase
      .from("profiles")
      .update({ is_blocked: newVal })
      .eq("user_id", p.user_id);
    if (error) return toast.error(error.message);
    await logAction(newVal ? "block_user" : "unblock_user", p.user_id, `${newVal ? "Blocked" : "Unblocked"} ${p.email}`);
    toast.success(`User ${newVal ? "blocked" : "unblocked"}`);
    qc.invalidateQueries({ queryKey: ["admin-profiles"] });
  };

  const resetWallet = async (p: any) => {
    const { error } = await supabase
      .from("wallets")
      .update({ balance: 0, credit_used: 0 })
      .eq("user_id", p.user_id);
    if (error) return toast.error(error.message);
    await logAction("reset_wallet", p.user_id, `Reset wallet for ${p.email}`);
    toast.success("Wallet reset to ₹0");
    qc.invalidateQueries({ queryKey: ["admin-wallets"] });
  };

  const getTypeBadge = (type: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      add_money: { cls: "bg-success/10 text-success border-success/20", label: "Add Money" },
      payment: { cls: "bg-primary/10 text-primary border-primary/20", label: "Payment" },
      loan_disbursement: { cls: "bg-warning/10 text-warning border-warning/20", label: "Loan" },
      loan_repayment: { cls: "bg-accent/10 text-accent-foreground border-accent/20", label: "Repayment" },
    };
    const m = map[type];
    return m ? <Badge className={m.cls}>{m.label}</Badge> : <Badge variant="outline">{type}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Badge variant="outline" className="text-muted-foreground">{filtered.length} users</Badge>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-3 px-4 font-medium text-muted-foreground">User</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground">Score</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground">Risk</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground">Balance</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground">Active Loans</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p: any) => {
                  const wallet = walletMap.get(p.user_id);
                  const userLoans = loansByUser.get(p.user_id) ?? [];
                  const active = userLoans.filter((l: any) => l.status === "active");
                  const risk = getRiskLevel(p.credit_score);
                  return (
                    <tr key={p.user_id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-medium text-foreground">{p.full_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{p.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-heading font-bold ${p.credit_score >= 700 ? "text-success" : p.credit_score >= 500 ? "text-warning" : "text-destructive"}`}>
                          {p.credit_score}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={risk === "LOW" ? "bg-success/10 text-success border-success/20" : risk === "MEDIUM" ? "bg-warning/10 text-warning border-warning/20" : "bg-destructive/10 text-destructive border-destructive/20"}>
                          {risk}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-medium">₹{wallet?.balance?.toFixed(2) ?? "0.00"}</td>
                      <td className="py-3 px-4">{active.length > 0 ? <span className="text-warning font-medium">{active.length}</span> : "None"}</td>
                      <td className="py-3 px-4">
                        {p.is_blocked ? (
                          <Badge className="bg-destructive/10 text-destructive border-destructive/20">Blocked</Badge>
                        ) : (
                          <Badge className="bg-success/10 text-success border-success/20">Active</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedUser(p)} className="text-primary gap-1">
                            <Eye className="h-3.5 w-3.5" /> View
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => toggleBlock(p)} className={p.is_blocked ? "text-success gap-1" : "text-destructive gap-1"}>
                            {p.is_blocked ? <CheckCircle className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                            {p.is_blocked ? "Unblock" : "Block"}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => resetWallet(p)} className="text-warning gap-1">
                            <RotateCcw className="h-3.5 w-3.5" /> Reset
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground">No users found.</p>}
          </div>
        </CardContent>
      </Card>

      {/* User Transaction Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {selectedUser?.full_name || "User"} — Transactions
            </DialogTitle>
            <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
          </DialogHeader>
          {userTx.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Recipient</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userTx.map((tx: any) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(tx.created_at), "dd MMM yyyy, hh:mm a")}</TableCell>
                    <TableCell>{getTypeBadge(tx.type)}</TableCell>
                    <TableCell className="font-medium">₹{tx.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-muted-foreground">{tx.recipient || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No transactions found.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
