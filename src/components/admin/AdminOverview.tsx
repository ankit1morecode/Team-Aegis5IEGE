import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, TrendingUp, AlertTriangle, DollarSign, CheckCircle, XCircle, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { format, subDays } from "date-fns";

interface Props {
  profiles: any[];
  loans: any[];
  transactions: any[];
  wallets: any[];
}

export const AdminOverview = ({ profiles, loans, transactions, wallets }: Props) => {
  const totalUsers = profiles.length;
  const totalTransactions = transactions.length;
  const totalLoansGiven = loans.length;
  const activeLoans = loans.filter((l) => l.status === "active");
  const paidLoans = loans.filter((l) => l.status === "paid");
  const overdueLoans = loans.filter((l) => l.status === "overdue");
  const totalInterestEarned = paidLoans.reduce((s: number, l: any) => s + (l.interest_amount || 0), 0);
  const blockedUsers = profiles.filter((p) => p.is_blocked).length;

  const stats = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "text-primary" },
    { label: "Total Transactions", value: totalTransactions, icon: Activity, color: "text-accent" },
    { label: "Total Loans Given", value: totalLoansGiven, icon: CreditCard, color: "text-warning" },
    { label: "Loans Repaid", value: paidLoans.length, icon: CheckCircle, color: "text-success" },
    { label: "Active Loans", value: activeLoans.length, icon: TrendingUp, color: "text-primary" },
    { label: "Overdue Loans", value: overdueLoans.length, icon: AlertTriangle, color: "text-destructive" },
    { label: "Interest Earned", value: `₹${totalInterestEarned.toFixed(0)}`, icon: DollarSign, color: "text-success" },
    { label: "Blocked Users", value: blockedUsers, icon: XCircle, color: "text-destructive" },
  ];

  // Loan status pie chart
  const loanPieData = [
    { name: "Active", value: activeLoans.length, color: "hsl(250, 75%, 55%)" },
    { name: "Paid", value: paidLoans.length, color: "hsl(152, 60%, 42%)" },
    { name: "Overdue", value: overdueLoans.length, color: "hsl(0, 72%, 51%)" },
  ].filter((d) => d.value > 0);

  // Transactions per day (last 7 days)
  const txPerDay = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const count = transactions.filter((t: any) => t.created_at?.startsWith(dateStr)).length;
    return { day: format(date, "dd MMM"), count };
  });

  // Transaction type distribution
  const txTypeMap: Record<string, number> = {};
  transactions.forEach((t: any) => {
    txTypeMap[t.type] = (txTypeMap[t.type] || 0) + 1;
  });
  const txTypeData = Object.entries(txTypeMap).map(([name, value]) => ({ name: name.replace("_", " "), value }));

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="shadow-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-secondary ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-heading font-bold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm font-heading">Transactions (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={txPerDay}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(250, 75%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm font-heading">Loan Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            {loanPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={loanPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {loanPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm py-12">No loans yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-heading">Transaction Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={txTypeData} layout="vertical">
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(168, 70%, 42%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
