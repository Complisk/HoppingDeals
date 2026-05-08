"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import Logo from "@/presentation/components/shared/Logo";
import { useToast } from "@/presentation/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/presentation/hooks/use-redux";
import { useAuthService } from "@/presentation/services/authService";
const UserLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useRouter();
    const { toast } = useToast();
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector((state) => state.auth);
    const { loginUser } = useAuthService();
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast({
                title: "Error",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }
        try {
            const response = await loginUser(dispatch, { email, password });
            if (response && response.user) {
                toast({
                    title: "Welcome back!",
                    description: "You've successfully logged in.",
                });
                navigate.push("/");
            }
            else {
                throw new Error("Invalid response from server");
            }
        }
        catch (err) {
            toast({
                title: "Login Failed",
                description: "Login failed. Please try again.",
                variant: "destructive",
            });
        }
    };
    return (<div className="min-h-screen flex bg-background">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <div className="mb-8">
            <Logo size="lg"/>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground mb-8">
            Sign in to discover local promotions
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" disabled={isLoading} required/>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" disabled={isLoading} required/>
              </div>
            </div>

            {error && (<div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>)}

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
              <ArrowRight className="h-5 w-5 ml-2"/>
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <a href="/auth/register" className="text-primary hover:underline font-medium">
                Create Account
              </a>
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
              <ArrowRight className="h-4 w-4 rotate-180"/>
              Continue as Guest
            </a>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent to-primary items-center justify-center p-12">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="text-center text-primary-foreground">
          <Sparkles className="h-24 w-24 mx-auto mb-8 opacity-90"/>
          <h2 className="text-3xl font-bold mb-4">Discover Local Deals</h2>
          <p className="text-lg opacity-80 max-w-md">
            Find the best promotions from businesses near you. Save money and
            support local!
          </p>

          <div className="mt-12 grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold">1000+</div>
              <div className="text-sm opacity-70">Active Deals</div>
            </div>
            <div>
              <div className="text-4xl font-bold">50K+</div>
              <div className="text-sm opacity-70">Happy Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold">100+</div>
              <div className="text-sm opacity-70">Cities</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>);
};
export default UserLogin;
