import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldAlert, TrendingDown, Ban } from "lucide-react";

interface Props {
  profiles: any[];
  loans: any[];
  transactions: any[];
}

export const AdminFraud = ({ profiles, loans, transactions }: Props) => {
  const profileMap = new Map(profiles.map((p: any) => [p.user_id, p]));

  // Users with too many active loans (>=3)
  const loansByUser = new Map<string, any[]>();
  loans.forEach((l: any) => {
    if (!loansByUser.has(l.user_id)) loansByUser.set(l.user_id, []);
    loansByUser.get(l.user_id)!.push(l);
  });

  const heavyBorrowers = Array.from(loansByUser.entries())
    .filter(([, ul]) => ul.filter((l: any) => l.status === "active").length >= 2)
    .map(([uid, ul]) => ({
      ...profileMap.get(uid),
      activeLoans: ul.filter((l: any) => l.status === "active").length,
      totalBorrowed: ul.reduce((s: number, l: any) => s + l.loan_amount, 0),
    }));

  // Users with overdue loans
  const overdueUsers = Array.from(loansByUser.entries())
    .filter(([, ul]) => ul.some((l: any) => l.status === "overdue"))
    .map(([uid, ul]) => ({
      ...profileMap.get(uid),
      overdueCount: ul.filter((l: any) => l.status === "overdue").length,
      overdueAmount: ul.filter((l: any) => l.status === "overdue").reduce((s: number, l: any) => s + l.total_repayment, 0),
    }));

  // Low credit score users (<400)
  const lowScoreUsers = profiles.filter((p: any) => p.credit_score < 400);

  // Blocked accounts
  const blockedUsers = profiles.filter((p: any) => p.is_blocked);

  // Users with high transaction volume (>10 in last day)
  const now = Date.now();
  const dayMs = 86400000;
  const txByUser24h = new Map<string, number>();
  transactions.forEach((t: any) => {
    if (now - new Date(t.created_at).getTime() < dayMs) {
      txByUser24h.set(t.user_id, (txByUser24h.get(t.user_id) || 0) + 1);
    }
  });
  const highVolUsers = Array.from(txByUser24h.entries())
    .filter(([, c]) => c >= 10)
    .map(([uid, count]) => ({ ...profileMap.get(uid), txCount: count }));

  const sections = [
    {
      title: "Heavy Borrowers (2+ Active Loans)",
      icon: TrendingDown,
      color: "text-warning",
      items: heavyBorrowers,
      empty: "No heavy borrowers detected",
      render: (u: any) => (
        <div key={u.user_id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
          <div>
            <p className="font-medium text-foreground text-sm">{u.full_name || "—"}</p>
            <p className="text-xs text-muted-foreground">{u.email}</p>
          </div>
          <div className="text-right">
            <Badge className="bg-warning/10 text-warning border-warning/20">{u.activeLoans} active</Badge>
            <p className="text-xs text-muted-foreground mt-0.5">₹{u.totalBorrowed.toFixed(0)} total</p>
          </div>
        </div>
      ),
    },
    {
      title: "Overdue Accounts",
      icon: AlertTriangle,
      color: "text-destructive",
      items: overdueUsers,
      empty: "No overdue accounts",
      render: (u: any) => (
        <div key={u.user_id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
          <div>
            <p className="font-medium text-foreground text-sm">{u.full_name || "—"}</p>
            <p className="text-xs text-muted-foreground">{u.email}</p>
          </div>
          <div className="text-right">
            <Badge className="bg-destructive/10 text-destructive border-destructive/20">{u.overdueCount} overdue</Badge>
            <p className="text-xs text-muted-foreground mt-0.5">₹{u.overdueAmount.toFixed(0)} pending</p>
          </div>
        </div>
      ),
    },
    {
      title: "Low Credit Score (<400)",
      icon: ShieldAlert,
      color: "text-destructive",
      items: lowScoreUsers,
      empty: "No low-score users",
      render: (u: any) => (
        <div key={u.user_id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
          <div>
            <p className="font-medium text-foreground text-sm">{u.full_name || "—"}</p>
            <p className="text-xs text-muted-foreground">{u.email}</p>
          </div>
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">Score: {u.credit_score}</Badge>
        </div>
      ),
    },
    {
      title: "Blocked Accounts",
      icon: Ban,
      color: "text-destructive",
      items: blockedUsers,
      empty: "No blocked accounts",
      render: (u: any) => (
        <div key={u.user_id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
          <div>
            <p className="font-medium text-foreground text-sm">{u.full_name || "—"}</p>
            <p className="text-xs text-muted-foreground">{u.email}</p>
          </div>
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">Blocked</Badge>
        </div>
      ),
    },
    {
      title: "High Volume (10+ tx/24h)",
      icon: AlertTriangle,
      color: "text-warning",
      items: highVolUsers,
      empty: "No high-volume activity",
      render: (u: any) => (
        <div key={u.user_id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
          <div>
            <p className="font-medium text-foreground text-sm">{u.full_name || "—"}</p>
            <p className="text-xs text-muted-foreground">{u.email}</p>
          </div>
          <Badge className="bg-warning/10 text-warning border-warning/20">{u.txCount} txns</Badge>
        </div>
      ),
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {sections.map((s) => (
        <Card key={s.title} className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              {s.title}
              <Badge variant="outline" className="ml-auto">{s.items.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {s.items.length > 0 ? s.items.map(s.render) : (
              <p className="text-muted-foreground text-sm py-4 text-center">{s.empty}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
