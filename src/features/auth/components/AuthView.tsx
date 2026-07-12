"use client";

import { useState, useEffect, useRef } from "react";
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
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.substring(value.length - 1);
    setCode(newCode);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      const newCode = [...code];
      for (let i = 0; i < pastedData.length; i++) {
        newCode[i] = pastedData[i];
      }
      setCode(newCode);
      const focusIndex = Math.min(pastedData.length, 5);
      inputRefs.current[focusIndex]?.focus();
      setError("");
    }
  };

  const triggerSubmit = async (finalCode: string) => {
    if (finalCode.length < 6) return;
    setError("");
    setLoading(true);
    try {
      await onVerify(finalCode);
    } catch (err: any) {
      setError(err.message ?? "Mã OTP không hợp lệ.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when fully filled
  useEffect(() => {
    const finalCode = code.join("");
    if (finalCode.length === 6 && !loading && !error) {
      triggerSubmit(finalCode);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <motion.div
      key="otp-form"
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center md:items-start"
    >
      <div className="mb-[40px] text-center md:text-left">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="w-16 h-16 bg-[#eef4ff] rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-sm border border-[#d2e3fc]"
        >
          <span className="material-symbols-outlined text-[32px] text-[#0058be]">mail</span>
        </motion.div>
        <h2 className="font-semibold text-[24px] md:text-[32px] text-[#121c2a] mb-[8px] tracking-tight">
          Xác thực email
        </h2>
        <p className="text-[15px] text-[#424754] leading-relaxed">
          Chúng tôi đã gửi mã gồm 6 chữ số tới <br className="hidden md:block" />
          <span className="font-semibold text-[#0058be]">{email}</span>
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); triggerSubmit(code.join("")); }} className="w-full space-y-[32px]">
        <div>
          <div className="flex justify-between gap-2 md:gap-3 mb-2">
            {code.map((digit, index) => (
              <motion.input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`w-[45px] h-[56px] md:w-[56px] md:h-[64px] text-center text-[24px] md:text-[28px] font-bold rounded-xl transition-all shadow-sm focus:outline-none focus:ring-[3px] focus:ring-[#0058be]/15
                  ${error ? "border-red-500 bg-red-50 text-red-700" : 
                    digit ? "border-[#0058be] bg-[#f0f5ff] text-[#0058be]" : "border-[#c2c6d6] bg-[#f8f9ff] text-[#121c2a]"} 
                  border`}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              />
            ))}
          </div>
          
          <AnimatePresence>
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-3 text-[14px] font-medium text-red-500 flex items-center justify-center md:justify-start gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error.length > 150 ? "Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau." : error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          type="submit"
          disabled={loading || code.join("").length < 6}
          className="w-full h-[52px] bg-gradient-to-r from-[#0058be] to-[#0051d5] text-white font-semibold text-[15px] rounded-xl hover:shadow-[0_8px_30px_rgba(0,88,190,0.2)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
        >
          {loading ? (
            <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
          ) : (
            <>
              Xác thực ngay
              <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">check_circle</span>
            </>
          )}
        </motion.button>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <p className="text-[14px] text-[#727785]">
            Chưa nhận được mã? <button type="button" className="text-[#0058be] font-medium hover:underline">Gửi lại</button>
          </p>
          <button
            type="button"
            onClick={onBack}
            className="text-[14px] font-medium text-[#424754] hover:text-[#121c2a] transition-colors flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg hover:bg-[#f0f4ff]"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Thay đổi email đăng ký
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
}

// ─── Success Step ─────────────────────────────────────────────────────────────
function SuccessStep({ onGoToLogin }: { onGoToLogin: () => void }) {
  return (
    <motion.div
      key="success-form"
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center text-center py-[24px]"
    >
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
        className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-green-100"
      >
        <span className="material-symbols-outlined text-[40px] text-green-600">check_circle</span>
      </motion.div>
      <h2 className="font-semibold text-[28px] text-[#121c2a] mb-[12px] tracking-tight">
        Đăng ký thành công!
      </h2>
      <p className="text-[15px] text-[#424754] leading-relaxed mb-[40px] max-w-[300px]">
        Tài khoản của bạn đã được xác thực. Giờ đây bạn có thể đăng nhập để trải nghiệm Không gian AI.
      </p>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onGoToLogin}
        className="w-full h-[52px] bg-gradient-to-r from-[#0058be] to-[#0051d5] text-white font-semibold text-[15px] rounded-xl hover:shadow-[0_8px_30px_rgba(0,88,190,0.2)] transition-all flex items-center justify-center gap-2 group"
      >
        Đăng nhập ngay
        <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
      </motion.button>
    </motion.div>
  );
}

// ─── Forgot Password Step ────────────────────────────────────────────────────────
function ForgotPasswordStep({
  onSendOtp,
  onBack,
}: {
  onSendOtp: (email: string) => Promise<void>;
  onBack: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    try {
      await onSendOtp(email);
    } catch (err: any) {
      setError(err.message ?? "Không thể gửi yêu cầu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="forgot-form"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 20, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-[48px] text-center md:text-left">
        <h2 className="font-semibold text-[24px] md:text-[32px] text-[#121c2a] mb-[4px]">
          Quên mật khẩu?
        </h2>
        <p className="text-[16px] text-[#424754]">
          Nhập email của bạn để nhận mã đặt lại mật khẩu.
        </p>
      </div>

      <form className="space-y-[24px]" onSubmit={handleSubmit}>
        <div>
          <label className="block font-semibold text-[14px] text-[#121c2a] mb-[4px]" htmlFor="email-forgot">
            Email
          </label>
          <input
            className="w-full h-[48px] px-[12px] bg-[#f8f9ff] border border-[#c2c6d6] rounded-xl text-[#121c2a] text-[16px] shadow-sm focus:outline-none focus:border-[#0058be] focus:ring-[3px] focus:ring-[#0058be]/10 transition-all placeholder:text-[#727785]"
            id="email-forgot"
            name="email"
            placeholder="researcher@university.edu"
            type="email"
            required
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            <span className="break-all">{error.length > 150 ? "Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau." : error}</span>
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
              Xác nhận
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </>
          )}
        </button>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={onBack}
            className="text-[14px] font-medium text-[#424754] hover:text-[#121c2a] transition-colors flex items-center justify-center gap-1.5 mx-auto px-4 py-2 rounded-lg hover:bg-[#f0f4ff]"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Quay lại đăng nhập
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ─── Reset OTP Step (bước 2: chỉ nhập mã OTP) ─────────────────────────────────────────────────────────────
function ResetOtpStep({
  email,
  onVerify,
  onBack,
}: {
  email: string;
  onVerify: (code: string) => Promise<void>;
  onBack: () => void;
}) {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.substring(value.length - 1);
    setCode(newCode);
    setError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      const newCode = [...code];
      for (let i = 0; i < pastedData.length; i++) newCode[i] = pastedData[i];
      setCode(newCode);
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const finalCode = code.join("");
    if (finalCode.length < 6) return;
    setError("");
    setLoading(true);
    try {
      await onVerify(finalCode);
    } catch (err: any) {
      setError(err.message ?? "Mã OTP không đúng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="reset-otp-form"
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center md:items-start"
    >
      <div className="mb-[40px] text-center md:text-left">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="w-16 h-16 bg-[#eef4ff] rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-sm border border-[#d2e3fc]"
        >
          <span className="material-symbols-outlined text-[32px] text-[#0058be]">mark_email_read</span>
        </motion.div>
        <h2 className="font-semibold text-[24px] md:text-[32px] text-[#121c2a] mb-[8px] tracking-tight">
          Nhập mã xác nhận
        </h2>
        <p className="text-[15px] text-[#424754] leading-relaxed">
          Mã 6 số đã được gửi đến hộp thư (cà mục Spam) của email:<br className="hidden md:block" />
          <span className="font-semibold text-[#0058be]">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-[32px]">
        <div>
          <div className="flex justify-between gap-2 md:gap-3 mb-2">
            {code.map((digit, index) => (
              <motion.input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`w-[45px] h-[56px] md:w-[56px] md:h-[64px] text-center text-[24px] md:text-[28px] font-bold rounded-xl transition-all shadow-sm focus:outline-none focus:ring-[3px] focus:ring-[#0058be]/15
                  ${error ? "border-red-500 bg-red-50 text-red-700" :
                    digit ? "border-[#0058be] bg-[#f0f5ff] text-[#0058be]" : "border-[#c2c6d6] bg-[#f8f9ff] text-[#121c2a]"}
                  border`}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              />
            ))}
          </div>
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 text-[13px] font-medium text-red-500 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">error</span>
                {error.length > 150 ? "Lỗi kết nối. Vui lòng thử lại sau." : error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          type="submit"
          disabled={loading || code.join("").length < 6}
          className="w-full h-[52px] bg-gradient-to-r from-[#0058be] to-[#0051d5] text-white font-semibold text-[15px] rounded-xl hover:shadow-[0_8px_30px_rgba(0,88,190,0.2)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
        >
          {loading ? (
            <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
          ) : (
            <>
              Xác nhận mã
              <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">arrow_forward</span>
            </>
          )}
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <button
            type="button"
            onClick={onBack}
            className="text-[14px] font-medium text-[#424754] hover:text-[#121c2a] transition-colors flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg hover:bg-[#f0f4ff]"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Hủy và quay lại
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
}

// ─── New Password Step (bước 3: nhập mật khẩu mới) ─────────────────────────────────────────────────────────────
function NewPasswordStep({
  email,
  otpCode,
  onSetPassword,
  onBack,
}: {
  email: string;
  otpCode: string;
  onSetPassword: (password: string) => Promise<void>;
  onBack: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    setError("");
    setLoading(true);
    try {
      await onSetPassword(password);
    } catch (err: any) {
      setError(err.message ?? "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="new-password-form"
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-[40px]">
        <h2 className="font-semibold text-[24px] md:text-[32px] text-[#121c2a] mb-[8px] tracking-tight">
          Tạo mật khẩu mới
        </h2>
        <p className="text-[15px] text-[#424754] leading-relaxed">
          Nhập mật khẩu mới cho tài khoản <span className="font-semibold text-[#0058be]">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-[24px]">
        <div>
          <label className="block font-semibold text-[14px] text-[#121c2a] mb-[4px]" htmlFor="new-password">
            Mật khẩu mới
          </label>
          <div className="relative">
            <span className="absolute left-[12px] top-1/2 -translate-y-1/2 material-symbols-outlined text-[#727785] text-[20px]">lock</span>
            <input
              className="w-full h-[48px] pl-[40px] pr-[12px] bg-[#f8f9ff] border border-[#c2c6d6] rounded-xl text-[#121c2a] text-[16px] shadow-sm focus:outline-none focus:border-[#0058be] focus:ring-[3px] focus:ring-[#0058be]/10 transition-all placeholder:text-[#727785]"
              id="new-password"
              name="password"
              placeholder="Tối thiểu 8 ký tự, 1 hoa, 1 số"
              type="password"
              required
              minLength={8}
            />
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5"
            >
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              <span>{error.length > 150 ? "Lỗi kết nối. Vui lòng thử lại sau." : error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-[52px] bg-gradient-to-r from-[#0058be] to-[#0051d5] text-white font-semibold text-[15px] rounded-xl hover:shadow-[0_8px_30px_rgba(0,88,190,0.2)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
        >
          {loading ? (
            <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
          ) : (
            <>
              Xác nhận đổi mật khẩu
              <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">check_circle</span>
            </>
          )}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-[14px] font-medium text-[#424754] hover:text-[#121c2a] transition-colors flex items-center justify-center gap-1.5 mx-auto px-4 py-2 rounded-lg hover:bg-[#f0f4ff]"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Nhập lại mã OTP
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AuthView({ initialMode }: AuthViewProps) {
  const pathname = usePathname();
  const { login, register, verifyOtp, forgotPassword, verifyResetOtp, resetPassword } = useAuth();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP flow state (đăng ký)
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Forgot password flow state (3 bước)
  const [resetEmail, setResetEmail] = useState<string | null>(null);   // bước 1 xong -> bước 2
  const [resetOtpCode, setResetOtpCode] = useState<string | null>(null); // bước 2 xong -> bước 3
  const [isResetSuccess, setIsResetSuccess] = useState(false);

  // Sync mode with URL if user navigates via browser history
  useEffect(() => {
    if (pathname === "/login") setMode("login");
    else if (pathname === "/signup") setMode("register");
  }, [pathname]);

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError("");
    const newPath = newMode === "login" ? "/login" : newMode === "register" ? "/signup" : "/forgot-password";
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
    setIsSuccess(true);
  };

  const handleForgotPassword = async (email: string) => {
    await forgotPassword(email);
    setResetEmail(email);
  };

  // Bước 2: verify OTP (chỉ kiểm tra mã, chưa đổi mật khẩu)
  const handleVerifyResetOtp = async (code: string) => {
    if (!resetEmail) return;
    await verifyResetOtp(resetEmail, code);
    setResetOtpCode(code); // Lưu mã OTP đã xác minh để dùng ở bước 3
  };

  // Bước 3: đặt mật khẩu mới
  const handleSetNewPassword = async (password: string) => {
    if (!resetEmail || !resetOtpCode) return;
    await resetPassword(resetEmail, resetOtpCode, password);
    // Clear step states BEFORE setting success so AnimatePresence renders correctly
    setResetOtpCode(null);
    setResetEmail(null);
    setIsResetSuccess(true);
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
          {/* Mode Switcher — hidden during OTP step, Success step, or Forgot Password */}
          {(!otpEmail && !isSuccess && !resetEmail && !isResetSuccess && mode !== "forgot-password") && (
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
              {/* ── Reset Success Step ── */}
              {isResetSuccess ? (
                <SuccessStep
                  key="reset-success"
                  onGoToLogin={() => {
                    setIsResetSuccess(false);
                    setResetEmail(null);
                    switchMode("login");
                  }}
                />
              ) : resetOtpCode ? (
                /* ── Bước 3: Nhập mật khẩu mới ── */
                <NewPasswordStep
                  key="new-password"
                  email={resetEmail!}
                  otpCode={resetOtpCode}
                  onSetPassword={handleSetNewPassword}
                  onBack={() => setResetOtpCode(null)}
                />
              ) : resetEmail ? (
                /* ── Bước 2: Nhập mã OTP ── */
                <ResetOtpStep
                  key="reset-otp"
                  email={resetEmail}
                  onVerify={handleVerifyResetOtp}
                  onBack={() => { setResetEmail(null); setError(""); }}
                />
              ) : /* ── Success Step ── */
              isSuccess ? (
                <SuccessStep
                  key="success"
                  onGoToLogin={() => {
                    setIsSuccess(false);
                    setOtpEmail(null);
                    switchMode("login");
                  }}
                />
              ) : otpEmail ? (
                /* ── OTP Step ── */
                <OtpStep
                  key="otp"
                  email={otpEmail}
                  onVerify={handleVerifyOtp}
                  onBack={() => { setOtpEmail(null); setError(""); }}
                />
              ) : mode === "forgot-password" ? (
                /* ── Forgot Password Form ── */
                <ForgotPasswordStep
                  key="forgot"
                  onSendOtp={handleForgotPassword}
                  onBack={() => switchMode("login")}
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
                        <button 
                          type="button" 
                          onClick={() => switchMode("forgot-password")}
                          className="text-[14px] text-[#0058be] hover:text-[#2170e4] transition-colors cursor-pointer"
                        >
                          Quên mật khẩu?
                        </button>
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
                        {error.length > 150 ? "Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau." : error}
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
                        {error.length > 150 ? "Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau." : error}
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
