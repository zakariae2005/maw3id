"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Mail, 
  Lock, 
  Building2, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  CheckCircle2,
  Users,
  Globe,
  TrendingUp
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FormData {
  businessName?: string;
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  businessName?: string;
}

interface AuthResponse {
  message?: string;
  user?: User;
  error?: string;
}

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [loginData, setLoginData] = useState<FormData>({ email: "", password: "" });
  const [registerData, setRegisterData] = useState<FormData>({ 
    businessName: "", 
    email: "", 
    password: "" 
  });
  
  const router = useRouter();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLoginSubmit = async (): Promise<void> => {
    setError("");
    setIsLoading(true);

    try {
      if (!loginData.email || !loginData.password) {
        setError("Please fill in all fields");
        return;
      }

      if (!validateEmail(loginData.email)) {
        setError("Please enter a valid email address");
        return;
      }

      const result = await signIn("credentials", {
        email: loginData.email.trim(),
        password: loginData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else if (result?.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccountSubmit = async (): Promise<void> => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (!registerData.businessName || !registerData.email || !registerData.password) {
        setError("Please fill in all fields");
        return;
      }

      if (!validateEmail(registerData.email)) {
        setError("Please enter a valid email address");
        return;
      }

      if (registerData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName: registerData.businessName.trim(),
          email: registerData.email.trim(),
          password: registerData.password,
        }),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create account");
        return;
      }

      setSuccess("Account created successfully! You can now log in.");
      setRegisterData({ businessName: "", email: "", password: "" });
      
      setTimeout(() => {
        setActiveTab("login");
        setSuccess("");
      }, 2000);

    } catch (error) {
      console.error("Registration error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string,
    formType: "login" | "register"
  ): void => {
    if (formType === "login") {
      setLoginData(prev => ({ ...prev, [field]: value }));
    } else {
      setRegisterData(prev => ({ ...prev, [field]: value }));
    }
    
    if (error) setError("");
    if (success) setSuccess("");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex min-h-screen">
        
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 to-slate-800 p-12 flex-col justify-between text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3 mb-16">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                <Shield className="h-6 w-6 text-slate-900" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Maw3id</h1>
                <p className="text-slate-300 text-sm">Enterprise Solution</p>
              </div>
            </div>
            
            {/* Value Proposition */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold leading-tight mb-4">
                  Streamline your business operations with confidence
                </h2>
                <p className="text-xl text-slate-300 leading-relaxed">
                  Join thousands of businesses that trust our platform to manage their reservations, 
                  bookings, and customer relationships efficiently.
                </p>
              </div>
              
              {/* Features */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Customer Management</h3>
                    <p className="text-slate-300 text-sm">Centralized customer data and communication</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Global Accessibility</h3>
                    <p className="text-slate-300 text-sm">Access your business anywhere, anytime</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Analytics & Insights</h3>
                    <p className="text-slate-300 text-sm">Data-driven decisions for growth</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Trust Indicators */}
          <div className="relative z-10">
            <div className="flex items-center justify-between text-slate-400 text-sm">
              <span>Trusted by 25,000+ businesses</span>
              <span>99.9% uptime</span>
              <span>Enterprise security</span>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Authentication Form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="flex items-center justify-center lg:hidden mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Maw3id</h1>
                  <p className="text-slate-500 text-sm">Enterprise Solution</p>
                </div>
              </div>
            </div>
            
            <Card className="border-0 shadow-xl bg-white dark:bg-slate-800">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-bold text-center text-slate-900 dark:text-white">
                  {activeTab === "login" ? "Welcome back" : "Get started"}
                </CardTitle>
                <CardDescription className="text-center text-slate-600 dark:text-slate-400">
                  {activeTab === "login" 
                    ? "Sign in to your account to continue" 
                    : "Create your account to get started"
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {/* Error/Success Messages */}
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                    <TabsTrigger 
                      value="login" 
                      className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm font-medium rounded-md transition-all"
                    >
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger 
                      value="create-account"
                      className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm font-medium rounded-md transition-all"
                    >
                      Sign Up
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label 
                          htmlFor="login-email" 
                          className="text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                          Email address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input 
                            id="login-email" 
                            type="email" 
                            placeholder="name@company.com"
                            value={loginData.email}
                            onChange={(e) => handleInputChange("email", e.target.value, "login")}
                            className="pl-10 h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 focus:border-slate-400 focus:ring-slate-400"
                            required 
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label 
                          htmlFor="login-password" 
                          className="text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input 
                            id="login-password" 
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={loginData.password}
                            onChange={(e) => handleInputChange("password", e.target.value, "login")}
                            className="pl-10 pr-12 h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 focus:border-slate-400 focus:ring-slate-400"
                            required 
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-slate-600"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" className="rounded border-slate-300" />
                          <span className="text-slate-600 dark:text-slate-400">Remember me</span>
                        </label>
                        <a href="#" className="text-slate-900 dark:text-slate-100 hover:underline font-medium">
                          Forgot password?
                        </a>
                      </div>
                      
                      <Button 
                        onClick={handleLoginSubmit}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 font-medium transition-colors"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Signing in...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            Sign in
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="create-account" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label 
                          htmlFor="business-name" 
                          className="text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                          Business name
                        </Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input 
                            id="business-name" 
                            type="text" 
                            placeholder="Your Business Inc."
                            value={registerData.businessName || ""}
                            onChange={(e) => handleInputChange("businessName", e.target.value, "register")}
                            className="pl-10 h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 focus:border-slate-400 focus:ring-slate-400"
                            required 
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label 
                          htmlFor="create-email" 
                          className="text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                          Work email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input 
                            id="create-email" 
                            type="email" 
                            placeholder="name@company.com"
                            value={registerData.email}
                            onChange={(e) => handleInputChange("email", e.target.value, "register")}
                            className="pl-10 h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 focus:border-slate-400 focus:ring-slate-400"
                            required 
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label 
                          htmlFor="create-password" 
                          className="text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input 
                            id="create-password" 
                            type={showCreatePassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            value={registerData.password}
                            onChange={(e) => handleInputChange("password", e.target.value, "register")}
                            className="pl-10 pr-12 h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 focus:border-slate-400 focus:ring-slate-400"
                            required 
                            disabled={isLoading}
                            minLength={6}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-slate-600"
                            onClick={() => setShowCreatePassword(!showCreatePassword)}
                            disabled={isLoading}
                          >
                            {showCreatePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Must be at least 6 characters long
                        </p>
                      </div>
                      
                      <Button 
                        onClick={handleCreateAccountSubmit}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 font-medium transition-colors"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Creating account...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            Create account
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

              </CardContent>
            </Card>
            
            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Need help? {" "}
                <a href="#" className="text-slate-900 dark:text-slate-100 hover:underline font-medium">
                  Contact support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}