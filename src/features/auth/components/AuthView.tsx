"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { AuthMode } from "../types";
import { useAuth } from "../auth-context";

interface AuthViewProps {
  initialMode: AuthMode;
}

// ─── OTP Step ────────────────────────────────────────────────────────────────
function OtpStep({
  email,
  onVerify,
  onBack,
}: {
  email: string;
  onVerify: (code: string) => Promise<void>;
  onBack: () => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onVerify(code);
    } catch (err: any) {
      setError(err.message ?? "Mã OTP không hợp lệ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="otp-form"
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-[48px] text-center md:text-left">
        <h2 className="font-semibold text-[24px] md:text-[32px] text-[#121c2a] mb-[4px]">
          Xác thực email
        </h2>
        <p className="text-[16px] text-[#424754]">
          Nhập mã 6 chữ số đã gửi tới{" "}
          <span className="font-semibold text-[#0058be]">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-[24px]">
        <div>
          <label className="block font-semibold text-[14px] text-[#121c2a] mb-[4px]">
            Mã OTP
          </label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-full h-[56px] px-[16px] bg-[#f8f9ff] border border-[#c2c6d6] rounded-xl text-[#121c2a] text-[28px] font-bold tracking-[0.4em] text-center shadow-sm focus:outline-none focus:border-[#0058be] focus:ring-[3px] focus:ring-[#0058be]/10 transition-all placeholder:text-[#c2c6d6] placeholder:tracking-normal"
            placeholder="······"
            inputMode="numeric"
            maxLength={6}
            required
          />
          {error && (
            <p className="mt-2 text-[13px] text-red-500 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="w-full h-[48px] bg-gradient-to-r from-[#0058be] to-[#0051d5] text-white font-semibold text-[14px] rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
          ) : (
            <>
              Xác thực tài khoản
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full text-[14px] text-[#424754] hover:text-[#0058be] transition-colors flex items-center justify-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Quay lại đăng ký
        </button>
      </form>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AuthView({ initialMode }: AuthViewProps) {
  const pathname = usePathname();
  const { login, register, verifyOtp } = useAuth();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP flow state
  const [otpEmail, setOtpEmail] = useState<string | null>(null);

  // Sync mode with URL if user navigates via browser history
  useEffect(() => {
    if (pathname === "/login") setMode("login");
    else if (pathname === "/signup") setMode("register");
  }, [pathname]);

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError("");
    const newPath = newMode === "login" ? "/login" : "/signup";
    window.history.pushState(null, "", newPath);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message ?? "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    try {
      await register(name, email, password);
      setOtpEmail(email);
    } catch (err: any) {
      setError(err.message ?? "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (code: string) => {
    if (!otpEmail) return;
    await verifyOtp(otpEmail, code);
  };

  return (
    <div className="flex w-full min-h-screen bg-surface-container-lowest font-body-md text-body-md text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container overflow-hidden">
      {/* Left Pane - Branding & Illustration */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        initial={false}
        animate={{
          background:
            mode === "login"
              ? "linear-gradient(to bottom right, #003ea8, #0058be, #0051d5)"
              : "linear-gradient(to bottom right, #e8f0fe, #d2e3fc, #aecbfa)",
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
                <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] rounded-[32px] flex items-center justify-center mb-[32px] shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20">
                  <span
                    className="material-symbols-outlined text-white"
                    style={{ fontVariationSettings: "'FILL' 1", fontSize: "80px" }}
                  >
                    book
                  </span>
                </div>
              ) : (
                <div className="relative h-[120px] sm:h-[140px] w-full max-w-[280px] mb-[32px]">
                  <div className="absolute inset-0 rounded-[32px] bg-white/40 backdrop-blur-md border border-white/60 transform rotate-[-2deg] scale-95 shadow-[0_10px_40px_rgba(31,41,55,0.05)]"></div>
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
                Chuẩn xác trong từng khám phá.
              </h2>
              <p
                className={`text-[18px] leading-[1.6] transition-colors duration-500 ${
                  mode === "login" ? "text-[#adc6ff]" : "text-[#424754]"
                }`}
              >
                {mode === "login"
                  ? "Nâng tầm quy trình nghiên cứu của bạn với thông tin chi tiết theo ngữ cảnh và tổng hợp tài liệu bằng AI."
                  : "Trải nghiệm không gian làm việc tối giản, hiện đại dành riêng cho cộng đồng học thuật và nghiên cứu AI."}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Right Pane - Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-[16px] md:p-[64px] bg-surface-container-lowest relative overflow-hidden">
        <div className="w-full max-w-[420px] relative z-10">
          {/* Mode Switcher — hidden during OTP step */}
          {!otpEmail && (
            <div className="flex items-center justify-center p-1 bg-[#dee9fc] rounded-xl mb-[48px] relative">
              <button
                onClick={() => switchMode("login")}
                className={`flex-1 py-2 font-semibold text-[14px] text-center transition-all z-10 rounded-lg ${
                  mode === "login"
                    ? "text-[#121c2a]"
                    : "text-[#424754] hover:text-[#121c2a]"
                }`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => switchMode("register")}
                className={`flex-1 py-2 font-semibold text-[14px] text-center transition-all z-10 rounded-lg ${
                  mode === "register"
                    ? "text-[#121c2a]"
                    : "text-[#424754] hover:text-[#121c2a]"
                }`}
              >
                Đăng ký
              </button>
              <motion.div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white shadow-sm rounded-lg"
                initial={false}
                animate={{ left: mode === "login" ? "4px" : "calc(50%)" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>
          )}

          {/* Form Content */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {/* ── OTP Step ── */}
              {otpEmail ? (
                <OtpStep
                  key="otp"
                  email={otpEmail}
                  onVerify={handleVerifyOtp}
                  onBack={() => { setOtpEmail(null); setError(""); }}
                />
              ) : mode === "login" ? (
                /* ── Login Form ── */
                <motion.div
                  key="login-form"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-[48px] text-center md:text-left">
                    <h2 className="font-semibold text-[24px] md:text-[32px] text-[#121c2a] mb-[4px]">
                      Chào mừng trở lại
                    </h2>
                    <p className="text-[16px] text-[#424754]">
                      Truy cập không gian làm việc thông minh của bạn.
                    </p>
                  </div>

                  <form className="space-y-[24px]" onSubmit={handleLogin}>
                    <div>
                      <label className="block font-semibold text-[14px] text-[#121c2a] mb-[4px]" htmlFor="email-login">
                        Email
                      </label>
                      <input
                        className="w-full h-[48px] px-[12px] bg-[#f8f9ff] border border-[#c2c6d6] rounded-xl text-[#121c2a] text-[16px] shadow-sm focus:outline-none focus:border-[#0058be] focus:ring-[3px] focus:ring-[#0058be]/10 transition-all placeholder:text-[#727785]"
                        id="email-login"
                        name="email"
                        placeholder="researcher@university.edu"
                        type="email"
                        required
                        autoComplete="email"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-[4px]">
                        <label className="block font-semibold text-[14px] text-[#121c2a]" htmlFor="password-login">
                          Mật khẩu
                        </label>
                        <a className="text-[14px] text-[#0058be] hover:text-[#2170e4] transition-colors cursor-pointer" href="#">
                          Quên mật khẩu?
                        </a>
                      </div>
                      <input
                        className="w-full h-[48px] px-[12px] bg-[#f8f9ff] border border-[#c2c6d6] rounded-xl text-[#121c2a] text-[16px] shadow-sm focus:outline-none focus:border-[#0058be] focus:ring-[3px] focus:ring-[#0058be]/10 transition-all placeholder:text-[#727785]"
                        id="password-login"
                        name="password"
                        placeholder="••••••••"
                        type="password"
                        required
                        autoComplete="current-password"
                      />
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                        <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                        {error}
                      </div>
                    )}

                    <button
                      className="w-full h-[48px] bg-gradient-to-r from-[#0058be] to-[#0051d5] text-white font-semibold text-[14px] rounded-xl hover:opacity-90 hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-[48px] disabled:opacity-60 disabled:cursor-not-allowed"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                      ) : (
                        <>
                          Đăng nhập vào Workspace
                          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                /* ── Register Form ── */
                <motion.div
                  key="register-form"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-[48px] text-center md:text-left">
                    <h2 className="font-semibold text-[24px] md:text-[32px] text-[#121c2a] mb-[4px]">
                      Tạo tài khoản của bạn
                    </h2>
                    <p className="text-[16px] text-[#424754]">
                      Gia nhập cùng hàng ngàn nhà nghiên cứu sử dụng AI để đẩy nhanh khám phá.
                    </p>
                  </div>

                  <form className="space-y-[16px]" onSubmit={handleSignup}>
                    <div>
                      <label className="block font-semibold text-[14px] text-[#121c2a] mb-[4px]" htmlFor="name">
                        Họ và tên
                      </label>
                      <div className="relative">
                        <span className="absolute left-[12px] top-1/2 -translate-y-1/2 material-symbols-outlined text-[#727785] text-[20px]">person</span>
                        <input
                          className="w-full h-[48px] pl-[40px] pr-[12px] bg-[#f8f9ff] border border-[#c2c6d6] rounded-xl text-[#121c2a] text-[16px] shadow-sm focus:outline-none focus:border-[#0058be] focus:ring-[3px] focus:ring-[#0058be]/10 transition-all placeholder:text-[#727785]"
                          id="name"
                          name="name"
                          placeholder="Nguyễn Văn A"
                          type="text"
                          required
                          minLength={2}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-[14px] text-[#121c2a] mb-[4px]" htmlFor="email-signup">
                        Email
                      </label>
                      <div className="relative">
                        <span className="absolute left-[12px] top-1/2 -translate-y-1/2 material-symbols-outlined text-[#727785] text-[20px]">mail</span>
                        <input
                          className="w-full h-[48px] pl-[40px] pr-[12px] bg-[#f8f9ff] border border-[#c2c6d6] rounded-xl text-[#121c2a] text-[16px] shadow-sm focus:outline-none focus:border-[#0058be] focus:ring-[3px] focus:ring-[#0058be]/10 transition-all placeholder:text-[#727785]"
                          id="email-signup"
                          name="email"
                          placeholder="jane.doe@university.edu"
                          type="email"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-[14px] text-[#121c2a] mb-[4px]" htmlFor="password-signup">
                        Mật khẩu
                      </label>
                      <div className="relative">
                        <span className="absolute left-[12px] top-1/2 -translate-y-1/2 material-symbols-outlined text-[#727785] text-[20px]">lock</span>
                        <input
                          className="w-full h-[48px] pl-[40px] pr-[12px] bg-[#f8f9ff] border border-[#c2c6d6] rounded-xl text-[#121c2a] text-[16px] shadow-sm focus:outline-none focus:border-[#0058be] focus:ring-[3px] focus:ring-[#0058be]/10 transition-all placeholder:text-[#727785]"
                          id="password-signup"
                          name="password"
                          placeholder="Tối thiểu 8 ký tự, 1 hoa, 1 số"
                          type="password"
                          required
                          minLength={8}
                        />
                      </div>
                      <p className="text-[12px] text-[#727785] mt-1.5">
                        Mật khẩu cần ít nhất 8 ký tự, có chữ hoa và chữ số.
                      </p>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                        <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                        {error}
                      </div>
                    )}

                    <button
                      className="w-full h-[48px] bg-gradient-to-r from-[#0058be] to-[#0051d5] text-white font-semibold text-[14px] rounded-xl hover:opacity-90 hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-[32px] disabled:opacity-60 disabled:cursor-not-allowed"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                      ) : (
                        <>
                          Tạo tài khoản
                          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </>
                      )}
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
