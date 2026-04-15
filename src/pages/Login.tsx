import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Shield, Mail, Eye, EyeOff } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = () => {
    setEmail("admin@gmail.com");
    setPassword("admin1234");
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address first");
      return;
    }

    setForgotLoading(true);
    try {
      // For Supabase, we'll use the reset password functionality
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        // Handle rate limit specifically
        if (error.message?.includes('rate limit') || error.message?.includes('too many requests')) {
          throw new Error('Too many reset attempts. Please wait 1 hour or check your email inbox.');
        }
        throw error;
      }
      
      toast.success("Password reset link sent! Check your email inbox.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            UPI <span className="text-primary">MicroCredit</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">Digital payments with instant micro-loans</p>
        </div>
        <Card className="shadow-elevated border-border">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full gradient-primary" disabled={loading}>
                {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                Sign In
              </Button>
            </form>

            <div className="relative my-5">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                or
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5"
              onClick={handleAdminLogin}
            >
              <Shield className="h-4 w-4" />
              Fill Admin Credentials
            </Button>
            <p className="text-center text-[11px] text-muted-foreground mt-2">
              Pre-fills admin@gmail.com — then click Sign In
            </p>

            <Button
              type="button"
              variant="default"
              className="w-full gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
              onClick={() => navigate("/admin")}
            >
              <Shield className="h-4 w-4" />
              Direct Admin Access (No Login Required)
            </Button>
            <p className="text-center text-[11px] text-muted-foreground mt-2">
              Bypass authentication - Go straight to admin dashboard
            </p>

            <div className="relative my-5">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                or
              </span>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="w-full gap-2 text-primary hover:bg-primary/5 h-auto p-2"
              onClick={handleForgotPassword}
              disabled={forgotLoading}
            >
              {forgotLoading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              Forgot Password?
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
