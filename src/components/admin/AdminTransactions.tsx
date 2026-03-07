import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download } from "lucide-react";
import { format } from "date-fns";

interface Props {
  transactions: any[];
  profiles: any[];
}

export const AdminTransactions = ({ transactions, profiles }: Props) => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const profileMap = new Map(profiles.map((p: any) => [p.user_id, p]));

  const filtered = transactions.filter((t: any) => {
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    if (dateFilter && !t.created_at?.startsWith(dateFilter)) return false;
    if (search) {
      const p = profileMap.get(t.user_id);
      return (
        p?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        p?.email?.toLowerCase().includes(search.toLowerCase()) ||
        t.recipient?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  const exportCSV = () => {
    const headers = "Date,User,Email,Type,Amount,Recipient,Description\n";
    const rows = filtered
      .map((t: any) => {
        const p = profileMap.get(t.user_id);
        return `"${format(new Date(t.created_at), "yyyy-MM-dd HH:mm")}","${p?.full_name || ""}","${p?.email || ""}","${t.type}","${t.amount}","${t.recipient || ""}","${t.description || ""}"`;
      })
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${format(new Date(), "yyyyMMdd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search user or recipient..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="add_money">Add Money</SelectItem>
            <SelectItem value="loan_disbursement">Loan</SelectItem>
            <SelectItem value="loan_repayment">Repayment</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-40" />
        <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
        <Badge variant="outline" className="text-muted-foreground">{filtered.length} records</Badge>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-3 px-4 font-medium text-muted-foreground">Date</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground">Sender</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground">Type</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground">Amount</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground">Recipient</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground">Description</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t: any) => {
                  const p = profileMap.get(t.user_id);
                  return (
                    <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">{format(new Date(t.created_at), "dd MMM yyyy, hh:mm a")}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-foreground">{p?.full_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{p?.email}</p>
                      </td>
                      <td className="py-3 px-4">{getTypeBadge(t.type)}</td>
                      <td className="py-3 px-4 font-medium">₹{t.amount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-muted-foreground">{t.recipient || "—"}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs max-w-[150px] truncate">{t.description || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground">No transactions found.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
