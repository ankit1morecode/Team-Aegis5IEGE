import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import {
  LayoutDashboard,
  Wallet,
  UserCheck,
  Send,
  Receipt,
  History,
  LogOut,
  Menu,
  X,
  User,
  QrCode,
  CreditCard,
  Settings,
  Smartphone,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/send-payment", label: "Send Payment", icon: Send },
  { to: "/loans", label: "Loans", icon: Receipt },
  { to: "/transactions", label: "History", icon: History },
  { to: "/kyc", label: "KYC", icon: UserCheck },
];

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const fullName = user?.user_metadata?.full_name || "User";
  const email = user?.email || "";
  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Profile dropdown rendered inline to avoid remount on re-render

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar - Fixed */}
      <aside className="hidden md:flex w-64 flex-col fixed top-0 left-0 h-screen border-r border-border bg-card p-6 z-30">
        <div className="mb-10">
          <h1 className="font-heading text-xl font-bold tracking-tight text-foreground">
            UPI <span className="text-primary">MicroCredit</span>
          </h1>
        </div>
        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "gradient-primary text-primary-foreground shadow-card"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                location.pathname === "/admin"
                  ? "gradient-primary text-primary-foreground shadow-card"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>
        <Button
          variant="ghost"
          className="justify-start gap-3 text-muted-foreground hover:text-destructive shrink-0"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </aside>

      {/* Main content with left margin for fixed sidebar */}
      <div className="flex flex-col flex-1 md:ml-64">
        {/* Top bar with profile */}
        <header className="flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-card via-card to-primary/5 backdrop-blur-md px-6 py-3 sticky top-0 z-20">
          <div className="md:hidden">
            <h1 className="font-heading text-lg font-bold">
              UPI <span className="text-primary">MicroCredit</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
            </span>
            <span className="text-border">•</span>
            <span className="text-xs text-muted-foreground font-mono">
              {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
            <div className="hidden md:flex items-center gap-2 text-right mr-1">
              <div>
                <p className="text-sm font-heading font-semibold text-foreground leading-tight">{fullName}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{email}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="gradient-primary text-primary-foreground text-sm font-heading font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-heading font-semibold text-foreground">{fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")} className="gap-3 cursor-pointer">
                  <User className="h-4 w-4" />
                  Update Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/wallet")} className="gap-3 cursor-pointer">
                  <Wallet className="h-4 w-4" />
                  My Wallet
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/qr-code")} className="gap-3 cursor-pointer">
                  <QrCode className="h-4 w-4" />
                  My QR Code
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/upi-id")} className="gap-3 cursor-pointer">
                  <Smartphone className="h-4 w-4" />
                  Your UPI ID
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/kyc")} className="gap-3 cursor-pointer">
                  <CreditCard className="h-4 w-4" />
                  KYC Status
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="gap-3 cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {mobileOpen && (
          <div className="md:hidden border-b border-border bg-card px-4 py-3">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "gradient-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    location.pathname === "/admin"
                      ? "gradient-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </nav>
          </div>
        )}

        <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
};
