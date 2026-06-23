"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type AuthMode = "login" | "register";

interface AuthViewProps {
  initialMode: AuthMode;
}

export default function AuthView({ initialMode }: AuthViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Sync mode with URL if user navigates via browser history
  useEffect(() => {
    if (pathname === "/login") setMode("login");
    else if (pathname === "/signup") setMode("register");
  }, [pathname]);

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    // Update URL without full page reload
    const newPath = newMode === "login" ? "/login" : "/signup";
    window.history.pushState(null, "", newPath);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/hub/dashboard");
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/hub/dashboard");
  };

  return (
    <div className="flex w-full min-h-screen bg-surface-container-lowest font-body-md text-body-md text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container overflow-hidden">
      {/* Left Pane - Branding & Illustration (Animated) */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        initial={false}
        animate={{
          background:
            mode === "login"
              ? "linear-gradient(to bottom right, #003ea8, #0058be, #0051d5)" // Dark theme
              : "linear-gradient(to bottom right, #e8f0fe, #d2e3fc, #aecbfa)", // Light theme
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <AnimatePresence mode="wait">
          {mode === "login" ? (
            <motion.div
              key="login-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#316bf3] opacity-30 blur-[100px]"></div>
              <div className="absolute bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#0058be] opacity-40 blur-[120px]"></div>
            </motion.div>
          ) : (
            <motion.div
              key="register-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#ffffff] opacity-60 blur-[100px]"></div>
              <div className="absolute bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#e8f0fe] opacity-80 blur-[120px]"></div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTIwIDIwYTEgMSAwIDEgMS0yIDAgMSAxIDAgMCAxIDIgMHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] opacity-50 mix-blend-overlay"></div>

        <div className="relative z-10 flex flex-col items-center text-center px-[64px] w-full max-w-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center w-full"
            >
              {mode === "login" ? (
                <div
                  className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] rounded-[32px] flex items-center justify-center mb-[32px] shadow-2xl transition-colors duration-500 bg-white/10 backdrop-blur-xl border border-white/20"
                >
                  <span
                    className="material-symbols-outlined text-white"
                    style={{ fontVariationSettings: "'FILL' 1", fontSize: "80px" }}
                  >
                    book
                  </span>
                </div>
              ) : (
                <div className="relative h-[120px] sm:h-[140px] w-full max-w-[280px] mb-[32px]">
                  <div className="absolute inset-0 rounded-[32px] bg-white/40 backdrop-blur-md border border-white/60 transform rotate-[-2deg] scale-95 transition-transform duration-700 hover:rotate-0 hover:scale-100 shadow-[0_10px_40px_rgba(31,41,55,0.05)]"></div>
                  <div className="absolute inset-0 rounded-[32px] bg-white/60 backdrop-blur-lg border border-white/80 transform rotate-1 shadow-[0_10px_40px_rgba(31,41,55,0.05)] flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-[#2170e4]/20 flex items-center justify-center text-[#0058be] animate-pulse">
                      <span className="material-symbols-outlined text-[32px]">auto_awesome</span>
                    </div>
                  </div>
                </div>
              )}
              <h1
                className={`font-semibold text-[48px] leading-[1.1] tracking-tight mb-[12px] transition-colors duration-500 ${
                  mode === "login" ? "text-white" : "text-[#121c2a]"
                }`}
              >
                Lumis
              </h1>
              <h2
                className={`font-semibold text-[32px] leading-[1.2] mb-[16px] transition-colors duration-500 ${
                  mode === "login" ? "text-white" : "text-[#121c2a]"
                }`}
              >
                Precision in Discovery.
              </h2>
              <p
                className={`text-[18px] leading-[1.6] transition-colors duration-500 ${
                  mode === "login" ? "text-[#adc6ff]" : "text-[#424754]"
                }`}
              >
                {mode === "login"
                  ? "Elevate your research workflow with AI-driven contextual insights and document synthesis."
                  : "Experience a high-tech minimalist workspace tailored for the academic and AI research community. Elevate your cognitive focus with tools designed for rigorous document management and synthesized insights."}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Right Pane - Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-[16px] md:p-[64px] bg-surface-container-lowest relative overflow-hidden">
        <div className="w-full max-w-[420px] relative z-10">
          {/* Top Switcher */}
          <div className="flex items-center justify-center p-1 bg-[#dee9fc] dark:bg-surface-container-high rounded-xl mb-[48px] relative">
            <button
              onClick={() => switchMode("login")}
              className={`flex-1 py-2 font-semibold text-[14px] text-center transition-all z-10 rounded-lg ${
                mode === "login"
                  ? "text-[#121c2a] dark:text-on-surface"
                  : "text-[#424754] dark:text-on-surface-variant hover:text-[#121c2a]"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => switchMode("register")}
              className={`flex-1 py-2 font-semibold text-[14px] text-center transition-all z-10 rounded-lg ${
                mode === "register"
                  ? "text-[#121c2a] dark:text-on-surface"
                  : "text-[#424754] dark:text-on-surface-variant hover:text-[#121c2a]"
              }`}
            >
              Register
            </button>
            {/* Sliding Pill Indicator */}
            <motion.div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-surface shadow-sm rounded-lg"
              initial={false}
              animate={{ left: mode === "login" ? "4px" : "calc(50%)" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>

          {/* Form Content */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {mode === "login" ? (
                <motion.div
                  key="login-form"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Heading */}
                  <div className="mb-[48px] text-center md:text-left">
                    <h2 className="font-semibold text-[24px] md:text-[32px] text-[#121c2a] dark:text-on-surface mb-[4px]">
                      Welcome back
                    </h2>
                    <p className="text-[16px] text-[#424754] dark:text-on-surface-variant">
                      Access your intelligent workspace.
                    </p>
                  </div>

                  {/* OAuth Buttons */}
                  <div className="flex flex-col gap-[12px] mb-[24px]">
                    <button className="w-full h-[48px] flex items-center justify-center gap-[12px] bg-white border border-[#c2c6d6] hover:bg-[#eff4ff] hover:border-[#727785] text-[#121c2a] font-semibold text-[14px] rounded-xl transition-all shadow-[0px_2px_4px_rgba(31,41,55,0.02)]">
                      <img
                        alt="Google Logo"
                        className="w-5 h-5"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPeIEbAZsWW4q5svAcXAyDsyZ5pyeFAKa-zGIFarjXQ5smpYkm6YHYz59IfrsE5-SDTkN1D8OuFF7EGH5d4fF9OwO68NCPa9g2wp5dYmLWqa7lHyp0fNI_Zo1MFOcU8mlFxX1HSleSvF-xWk5k-ne3HMKt60phBjNY8F7zO6Z96nNlRClTTEqw60oHb6fMzW2mdcQqRi1EV3yNJlXiPUM9-8mw8Mpvgj02NDLO5sLOxtxMBEUcOjHTrJJrjqhokRm3zh3ZLbY-MYR0"
                      />
                      Continue with Google
                    </button>
                    <button className="w-full h-[48px] flex items-center justify-center gap-[12px] bg-white border border-[#c2c6d6] hover:bg-[#eff4ff] hover:border-[#727785] text-[#121c2a] font-semibold text-[14px] rounded-xl transition-all shadow-[0px_2px_4px_rgba(31,41,55,0.02)]">
                      <svg
                        className="w-5 h-5 text-[#181717] fill-current"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                      </svg>
                      Continue with GitHub
                    </button>
                  </div>

                  <div className="flex items-center gap-[12px] mb-[24px]">
                    <div className="h-px bg-[#c2c6d6]/50 flex-1"></div>
                    <span className="font-semibold text-[12px] text-[#424754] uppercase tracking-wider">
                      Or continue with email
                    </span>
                    <div className="h-px bg-[#c2c6d6]/50 flex-1"></div>
                  </div>

                  <form className="space-y-[24px]" onSubmit={handleLogin}>
                    <div>
                      <label
                        className="block font-semibold text-[14px] text-[#121c2a] dark:text-on-surface mb-[4px]"
                        htmlFor="email-login"
                      >
                        Institutional Email
                      </label>
                      <input
                        className="w-full h-[48px] px-[12px] bg-[#f8f9ff] dark:bg-surface border border-[#c2c6d6] dark:border-outline-variant rounded-xl text-[#121c2a] dark:text-on-surface text-[16px] shadow-[0px_4px_12px_rgba(31,41,55,0.03)] focus:outline-none focus:border-[#0058be] dark:focus:border-primary focus:ring-[3px] focus:ring-[#0058be]/10 transition-all placeholder:text-[#727785] dark:placeholder:text-outline"
                        id="email-login"
                        placeholder="researcher@university.edu"
                        type="email"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-[4px]">
                        <label
                          className="block font-semibold text-[14px] text-[#121c2a] dark:text-on-surface"
                          htmlFor="password-login"
                        >
                          Password
                        </label>
                        <a
                          className="text-[14px] text-[#0058be] dark:text-primary hover:text-[#2170e4] dark:hover:text-primary-container transition-colors cursor-pointer"
                          href="#"
                        >
                          Forgot password?
                        </a>
                      </div>
                      <div className="relative">
                        <input
                          className="w-full h-[48px] px-[12px] bg-[#f8f9ff] dark:bg-surface border border-[#c2c6d6] dark:border-outline-variant rounded-xl text-[#121c2a] dark:text-on-surface text-[16px] shadow-[0px_4px_12px_rgba(31,41,55,0.03)] focus:outline-none focus:border-[#0058be] focus:ring-[3px] focus:ring-[#0058be]/10 transition-all placeholder:text-[#727785]"
                          id="password-login"
                          placeholder="••••••••"
                          type="password"
                          required
                        />
                        <button
                          className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#424754] hover:text-[#121c2a] p-1"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            visibility_off
                          </span>
                        </button>
                      </div>
                    </div>

                    <button
                      className="w-full h-[48px] bg-gradient-to-r from-[#0058be] to-[#0051d5] text-white font-semibold text-[14px] rounded-xl hover:opacity-90 hover:shadow-[0px_10px_40px_rgba(31,41,55,0.12)] transition-all flex items-center justify-center gap-[4px] mt-[48px]"
                      type="submit"
                    >
                      Sign In to Workspace
                      <span className="material-symbols-outlined text-[18px]">
                        arrow_forward
                      </span>
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="register-form"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Heading */}
                  <div className="mb-[48px] text-center md:text-left">
                    <h2 className="font-semibold text-[24px] md:text-[32px] text-[#121c2a] dark:text-on-surface mb-[4px]">
                      Create your account
                    </h2>
                    <p className="text-[16px] text-[#424754] dark:text-on-surface-variant">
                      Join thousands of researchers using AI to accelerate discovery.
                    </p>
                  </div>

                  {/* OAuth Buttons */}
                  <div className="flex flex-col gap-[12px] mb-[24px]">
                    <button className="w-full h-[48px] flex items-center justify-center gap-[12px] bg-white border border-[#c2c6d6] hover:bg-[#eff4ff] hover:border-[#727785] text-[#121c2a] font-semibold text-[14px] rounded-xl transition-all shadow-[0px_2px_4px_rgba(31,41,55,0.02)]">
                      <img
                        alt="Google Logo"
                        className="w-5 h-5"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPeIEbAZsWW4q5svAcXAyDsyZ5pyeFAKa-zGIFarjXQ5smpYkm6YHYz59IfrsE5-SDTkN1D8OuFF7EGH5d4fF9OwO68NCPa9g2wp5dYmLWqa7lHyp0fNI_Zo1MFOcU8mlFxX1HSleSvF-xWk5k-ne3HMKt60phBjNY8F7zO6Z96nNlRClTTEqw60oHb6fMzW2mdcQqRi1EV3yNJlXiPUM9-8mw8Mpvgj02NDLO5sLOxtxMBEUcOjHTrJJrjqhokRm3zh3ZLbY-MYR0"
                      />
                      Sign up with Google
                    </button>
                    <button className="w-full h-[48px] flex items-center justify-center gap-[12px] bg-white border border-[#c2c6d6] hover:bg-[#eff4ff] hover:border-[#727785] text-[#121c2a] font-semibold text-[14px] rounded-xl transition-all shadow-[0px_2px_4px_rgba(31,41,55,0.02)]">
                      <svg
                        className="w-5 h-5 text-[#181717] fill-current"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                      </svg>
                      Sign up with GitHub
                    </button>
                  </div>

                  <div className="flex items-center gap-[12px] mb-[24px]">
                    <div className="h-px bg-[#c2c6d6]/50 flex-1"></div>
                    <span className="font-semibold text-[12px] text-[#424754] uppercase tracking-wider">
                      Or continue with email
                    </span>
                    <div className="h-px bg-[#c2c6d6]/50 flex-1"></div>
                  </div>

                  <form className="space-y-[16px]" onSubmit={handleSignup}>
                    <div>
                      <label
                        className="block font-semibold text-[14px] text-[#121c2a] dark:text-on-surface mb-[4px]"
                        htmlFor="name"
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <span className="absolute left-[12px] top-1/2 -translate-y-1/2 material-symbols-outlined text-[#727785] text-[20px]">
                          person
                        </span>
                        <input
                          className="w-full h-[48px] pl-[40px] pr-[12px] bg-[#f8f9ff] dark:bg-surface border border-[#c2c6d6] dark:border-outline-variant rounded-xl text-[#121c2a] dark:text-on-surface text-[16px] shadow-[0px_4px_12px_rgba(31,41,55,0.03)] focus:outline-none focus:border-[#0058be] dark:focus:border-primary focus:ring-[3px] focus:ring-[#0058be]/10 transition-all placeholder:text-[#727785]"
                          id="name"
                          placeholder="Dr. Jane Doe"
                          type="text"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        className="block font-semibold text-[14px] text-[#121c2a] dark:text-on-surface mb-[4px]"
                        htmlFor="email-signup"
                      >
                        Institutional Email
                      </label>
                      <div className="relative">
                        <span className="absolute left-[12px] top-1/2 -translate-y-1/2 material-symbols-outlined text-[#727785] text-[20px]">
                          mail
                        </span>
                        <input
                          className="w-full h-[48px] pl-[40px] pr-[12px] bg-[#f8f9ff] dark:bg-surface border border-[#c2c6d6] dark:border-outline-variant rounded-xl text-[#121c2a] dark:text-on-surface text-[16px] shadow-[0px_4px_12px_rgba(31,41,55,0.03)] focus:outline-none focus:border-[#0058be] dark:focus:border-primary focus:ring-[3px] focus:ring-[#0058be]/10 transition-all placeholder:text-[#727785]"
                          id="email-signup"
                          placeholder="jane.doe@university.edu"
                          type="email"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        className="block font-semibold text-[14px] text-[#121c2a] dark:text-on-surface mb-[4px]"
                        htmlFor="password-signup"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <span className="absolute left-[12px] top-1/2 -translate-y-1/2 material-symbols-outlined text-[#727785] text-[20px]">
                          lock
                        </span>
                        <input
                          className="w-full h-[48px] pl-[40px] pr-[40px] bg-[#f8f9ff] dark:bg-surface border border-[#c2c6d6] dark:border-outline-variant rounded-xl text-[#121c2a] dark:text-on-surface text-[16px] shadow-[0px_4px_12px_rgba(31,41,55,0.03)] focus:outline-none focus:border-[#0058be] focus:ring-[3px] focus:ring-[#0058be]/10 transition-all placeholder:text-[#727785]"
                          id="password-signup"
                          placeholder="••••••••"
                          type="password"
                          required
                        />
                      </div>
                    </div>

                    <button
                      className="w-full h-[48px] bg-gradient-to-r from-[#0058be] to-[#0051d5] text-white font-semibold text-[14px] rounded-xl hover:opacity-90 hover:shadow-[0px_10px_40px_rgba(31,41,55,0.12)] transition-all flex items-center justify-center gap-[4px] mt-[32px] !mt-[32px]"
                      type="submit"
                    >
                      Create Account
                      <span className="material-symbols-outlined text-[18px]">
                        arrow_forward
                      </span>
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
