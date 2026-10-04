"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Calendar,
  Layers,
  Users,
  LayoutDashboard,
  CheckSquare,
  Lock,
  Mail,
  User,
  ChevronRight,
  Video,
  X,
  Hash,
  Copy,
  Check,
  UserCheck,
  Send,
  Cpu,
  Flame,
  Globe,
  Radio,
  Share2,
  Eye,
  EyeOff,
  Loader2,
  Moon,
  Sun,
  Star,
} from "lucide-react";
import { UserSummary } from "@/types/models";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface LandingPageProps {
  onLoginSuccess: (user: UserSummary) => void;
  availableUsers?: UserSummary[];
}

export function LandingPage({ onLoginSuccess, availableUsers = [] }: LandingPageProps) {
  const { toast } = useToast();


  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"SIGNUP" | "LOGIN">("SIGNUP");

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Interactive Live Showcase State
  const [sampleProjectCode, setSampleProjectCode] = useState("CC-9842-NEX");
  const [hasCopiedSample, setHasCopiedSample] = useState(false);
  const [activeTabFeature, setActiveTabFeature] = useState<"CODES" | "OCC" | "KANBAN">("CODES");
  const [sampleRequestStatus, setSampleRequestStatus] = useState<"PENDING" | "ACCEPTED" | "DECLINED">("PENDING");
  const [sampleAssignedRole, setSampleAssignedRole] = useState("LEAD");

  // Handle Form Submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setEmailError("");
    setPasswordError("");
    setNameError("");

    // Validate
    let isValid = true;

    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Please enter a valid email");
      isValid = false;
    }

    if (authMode === "SIGNUP" && !name.trim()) {
      setNameError("Name is required");
      isValid = false;
    } else if (authMode === "SIGNUP" && name.trim().length < 2) {
      setNameError("Name must be at least 2 characters");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    }

    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const endpoint = authMode === "SIGNUP" ? "/api/auth/signup" : "/api/auth/login";
      const payload = authMode === "SIGNUP"
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Authentication failed");
      }

      const { user, message } = await res.json();

      // Persist in localStorage
      localStorage.setItem("combinecode_auth_user", JSON.stringify(user));

      toast({
        type: "success",
        title: authMode === "SIGNUP" ? "Account Created!" : "Welcome Back",
        message: message || `Signed in as ${user.name}. Entering workspace...`,
      });

      setIsAuthModalOpen(false);
      onLoginSuccess(user);
    } catch (err: any) {
      toast({
        type: "error",
        title: "Authentication Error",
        message: err.message || "Could not log in. Please check your details.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleCopySampleCode = () => {
    navigator.clipboard.writeText(sampleProjectCode);
    setHasCopiedSample(true);
    toast({
      type: "info",
      title: "Sample Code Copied",
      message: `${sampleProjectCode} copied to clipboard!`,
    });
    setTimeout(() => setHasCopiedSample(false), 2000);
  };

  return (
    <div className="w-full flex flex-col relative overflow-x-hidden min-h-screen text-white" style={{ backgroundColor: '#000000', minHeight: '100vh' }}>
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
        html, body, #root, #__next {
          background-color: #000000 !important;
          color: white !important;
        }
      `}</style>
      {/* Background Neon Aura Spheres */}
      <div className="absolute top-0 left-1/4 w-[650px] h-[650px] bg-gradient-to-tr from-purple-600/25 to-blue-500/20 rounded-full blur-[140px] pointer-events-none -z-10 float-animation" style={{ animationDelay: '0s' }} />
      <div className="absolute top-1/3 right-10 w-[550px] h-[550px] bg-gradient-to-br from-rose-600/20 via-pink-600/15 to-transparent rounded-full blur-[130px] pointer-events-none -z-10 float-animation" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-10 left-10 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 via-blue-700/15 to-teal-500/15 rounded-full blur-[140px] pointer-events-none -z-10 float-animation" style={{ animationDelay: '4s' }} />

      {/* Floating Futuristic Navigation Bar */}
      <header className="sticky top-4 z-40 max-w-7xl mx-auto w-[94%] sm:w-[90%] px-4 sm:px-6 py-3 rounded-3xl bg-zinc-950/75 backdrop-blur-2xl border border-white/15 shadow-[0_16px_50px_rgba(0,0,0,0.5)] flex items-center justify-between transition-all">
        {/* Brand Logo Badge */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-base">CombineCode</span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono hidden sm:block">
              Distributed OCC Concurrency & Project Hub
            </p>
          </div>
        </div>


        {/* Live System Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-zinc-300 hover:animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-emerald-300">Live Engine</span>
        </div>

        {/* Nav Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setAuthMode("LOGIN");
              setIsAuthModalOpen(true);
            }}
            className="px-4 py-2 rounded-2xl text-xs font-semibold text-zinc-200 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            Sign In
          </button>

          <button
            onClick={() => {
              setAuthMode("SIGNUP");
              setIsAuthModalOpen(true);
            }}
            className="px-5 py-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 cursor-pointer flex items-center gap-1.5"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-12 sm:pt-20 pb-20 flex flex-col items-center text-center">
        {/* Glowing Announcement Chip */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 border border-white/20 backdrop-blur-md shadow-lg shadow-purple-500/10 mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: "4s" }} />
          <span className="text-xs font-semibold text-zinc-200">
            Next-Gen Project Codes & Role-Based Permissions
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span className="text-[11px] font-mono text-blue-300">Live OCC Engine</span>
        </div>

        {/* Hero Title with Gradient Mask */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl leading-[1.08] drop-shadow-2xl float-animation hover:animate-pulse" style={{ animationDelay: '1s' }}>
          Architect. Collaborate.{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-rose-400 bg-clip-text text-transparent">
            Ship with Zero Conflicts.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-sm sm:text-lg text-zinc-300 max-w-3xl leading-relaxed font-normal float-animation hover:animate-pulse" style={{ animationDelay: '1.5s' }}>
          The ultimate distributed engineering studio. Generate <strong>unique project codes</strong> for your team, review incoming join requests, assign precise engineering roles, and orchestrate tasks in real-time with Tier 3 OCC auto-resolution.
        </p>

        {/* Hero CTA Action Group */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md">
          <button
            onClick={() => {
              setAuthMode("SIGNUP");
              setIsAuthModalOpen(true);
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-[0_12px_40px_rgba(37,99,235,0.4)] transition-all transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 hover:animate-pulse"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Your First Project</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setAuthMode("LOGIN");
              setIsAuthModalOpen(true);
            }}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm backdrop-blur-xl transition-all cursor-pointer flex items-center justify-center gap-2 hover:animate-pulse"
          >
            <Hash className="w-4 h-4 text-blue-400" />
            <span>Join with Code</span>
          </button>
        </div>

        {/* Realtime Platform Live Metrics Ticker */}
        <div className="mt-14 w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 select-none">
          {[
            { label: "OCC Conflict Resolution", value: "99.99%", sub: "Automated 3-way merge" },
            { label: "Sync Latency", value: "<12ms", sub: "Distributed WebSockets" },
            { label: "Project Codes", value: "1-Click", sub: "Instant invite generation" },
            { label: "Role Permissions", value: "Granular", sub: "Owner, Lead, Admin & Member" },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-4 rounded-3xl bg-zinc-950/60 border border-white/10 backdrop-blur-xl text-center shadow-lg hover:border-white/25 hover:animate-pulse transition-all"
            >
              <div className="text-xl sm:text-2xl font-mono font-extrabold text-white tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-zinc-300 mt-1">{stat.label}</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* 3 Core Architecture Pillars */}
        <section className="mt-20 w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-3xl bg-zinc-950/60 border border-white/10 backdrop-blur-xl shadow-xl hover:border-blue-500/40 hover:scale-[1.02] transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
              <Hash className="w-6 h-6 transition-all duration-300 group-hover:animate-pulse" />
            </div>
            <h4 className="text-base font-bold text-white">Unique Project Codes</h4>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Every project generates an immutable unique invite code (e.g. <code>CC-9842-NEX</code>). Share it with team members for frictionless access.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-950/60 border border-white/10 backdrop-blur-xl shadow-xl hover:border-purple-500/40 hover:scale-[1.02] transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
              <UserCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Creator Role Control</h4>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              The project creator retains full sovereignty: review pending join requests, assign roles (Lead, Member, Admin, Viewer), or decline with 1-click.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-950/60 border border-white/10 backdrop-blur-xl shadow-xl hover:border-pink-500/40 hover:scale-[1.02] transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Tier 3 OCC Concurrency</h4>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Real-time multi-user edits with monotonic versioning. Automatic non-conflicting merges and visual conflict resolvers prevent data loss.
            </p>
          </div>
        </section>
      </main>


      {/* Interactive Auth Modal (Sign Up / Sign In) */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
          <div className="relative w-full max-w-md rounded-3xl bg-zinc-900/95 border border-white/20 shadow-2xl overflow-hidden p-6 sm:p-8">
            {/* Ambient Modal Glows */}
            <div className="absolute -top-24 -left-24 w-60 h-60 bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />

            {/* Close Modal Button */}
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6 relative z-10">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {authMode === "SIGNUP" ? "Create Your CombineCode Account" : "Welcome Back"}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                {authMode === "SIGNUP"
                  ? "Enter your email to join the distributed workspace studio"
                  : "Sign in with your email to access your projects"}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-950/80 border border-white/10 mb-5 relative z-10">
              <button
                type="button"
                onClick={() => setAuthMode("SIGNUP")}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  authMode === "SIGNUP"
                    ? "bg-white text-zinc-900 shadow-md"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("LOGIN")}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  authMode === "LOGIN"
                    ? "bg-white text-zinc-900 shadow-md"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                Sign In
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4 relative z-10">
              {/* Enhanced Form with Validation and UX Improvements */}
              {authMode === "SIGNUP" && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Your Full Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        // Clear error when user types
                        if (nameError) setNameError("");
                      }}
                      placeholder="e.g. Jeel Vaishnav"
                      className={cn(
                        "w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-950/80 border border-white/15 focus:border-blue-500 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all",
                        nameError && "border-rose-500/50"
                      )}
                    />
                    {nameError && (
                      <p className="mt-1 text-xs text-rose-400">{nameError}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      // Clear error when user types
                      if (emailError) setEmailError("");
                    }}
                    placeholder="name@combinecode.in"
                    className={cn(
                      "w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-950/80 border border-white/15 focus:border-blue-500 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all",
                      emailError && "border-rose-500/50"
                    )}
                  />
                  {emailError && (
                    <p className="mt-1 text-xs text-rose-400">{emailError}</p>
                  )}
                </div>
              </div>

              {authMode === "SIGNUP" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Password <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          // Clear error when user types
                          if (passwordError) setPasswordError("");
                        }}
                        placeholder="••••••••"
                        className={cn(
                          "w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-950/80 border border-white/15 focus:border-blue-500 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all",
                          passwordError && "border-rose-500/50"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="mt-1 text-xs text-rose-400">{passwordError}</p>
                    )}
                  </div>
                </>
              )}

              {authMode === "LOGIN" && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        // Clear error when user types
                        if (passwordError) setPasswordError("");
                      }}
                      placeholder="••••••••"
                      className={cn(
                        "w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-950/80 border border-white/15 focus:border-blue-500 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all",
                        passwordError && "border-rose-500/50"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="mt-1 text-xs text-rose-400">{passwordError}</p>
                  )}
                </div>
              )}

              {/* Remember Me and Forgot Password */}
              {authMode === "LOGIN" && (
                <div className="flex items-center justify-between text-xs mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-zinc-600 rounded"
                    />
                    <span className="text-zinc-300">Remember me</span>
                  </label>
                  <button
                    onClick={() => {
                      // TODO: Implement forgot password flow
                      toast({
                        type: "info",
                        title: "Feature Coming Soon",
                        message: "Password reset functionality will be available in the next update.",
                      });
                    }}
                    className="text-zinc-400 hover:text-white underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>{authMode === "SIGNUP" ? "Create Account & Enter" : "Sign In & Enter"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}