import Link from "next/link";
import { LandingHeader } from "@/components/layouts/landing-header";
import { GetStartedButton } from "@/components/ui/get-started-button";

export default function PricingPage() {
  return (
    <>
      <div className="ambient-blob bg-primary-fixed w-[600px] h-[600px] top-[-200px] left-[-200px]"></div>
      <div className="ambient-blob bg-secondary-fixed w-[500px] h-[500px] top-[20%] right-[-100px]"></div>
      
      <LandingHeader />

      <main className="flex-grow pt-[120px] pb-[80px] w-full max-w-[1400px] mx-auto z-10 px-6">
        <div className="text-center mb-16">
          <h1 className="text-[40px] md:text-[56px] font-bold leading-[1.1] tracking-tight text-[#121c2a] mb-6">
            Simple, transparent <span className="text-[#0058be]">pricing</span>
          </h1>
          <p className="text-[18px] text-[#424754] max-w-[672px] mx-auto leading-relaxed">
            Choose the plan that fits your research needs. Upgrade, downgrade, or cancel at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[1200px] mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-3xl p-8 flex flex-col h-full border border-[#c2c6d6]/40 hover:border-[#0058be]/30 transition-all hover:shadow-lg hover:-translate-y-1">
            <h3 className="text-[20px] font-bold text-[#121c2a] mb-2">Explorer</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-[48px] font-bold text-[#121c2a]">$0</span>
              <span className="text-[#727785] font-medium">/ forever</span>
            </div>
            <p className="text-[14px] text-[#424754] mb-8 h-[40px]">
              Perfect for students and casual researchers getting started.
            </p>
            <GetStartedButton className="w-full py-3 rounded-xl bg-white border border-[#c2c6d6] text-[#424754] font-bold hover:bg-gray-50 transition-colors mb-8 shadow-sm">
              Get Started for Free
            </GetStartedButton>
            <ul className="flex flex-col gap-4">
              {["Up to 50 documents", "Basic AI synthesis", "Standard search", "1 Collection"].map(feature => (
                <li key={feature} className="flex items-center gap-3 text-[14px] text-[#424754]">
                  <span className="material-symbols-outlined text-[18px] text-[#0058be]">check_circle</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-3xl p-8 flex flex-col h-full border-2 border-[#0058be] relative shadow-xl transform md:-translate-y-4">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0058be] text-white px-4 py-1 rounded-full text-[12px] font-bold tracking-wide uppercase shadow-sm whitespace-nowrap">
              Most Popular
            </div>
            <h3 className="text-[20px] font-bold text-[#0058be] mb-2">Researcher Pro</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-[48px] font-bold text-[#121c2a]">$12</span>
              <span className="text-[#727785] font-medium">/ month</span>
            </div>
            <p className="text-[14px] text-[#424754] mb-8 h-[40px]">
              For academics and professionals needing deep analysis.
            </p>
            <button className="w-full py-3 rounded-xl bg-[#0058be] text-white font-bold hover:bg-[#2170e4] transition-colors mb-8 shadow-md">
              Start 14-day Trial
            </button>
            <ul className="flex flex-col gap-4">
              {["Unlimited documents", "Advanced LLM synthesis", "Semantic vector search", "Unlimited collections", "Priority support"].map(feature => (
                <li key={feature} className="flex items-center gap-3 text-[14px] text-[#424754]">
                  <span className="material-symbols-outlined text-[18px] text-[#0058be]">check_circle</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Team Plan */}
          <div className="bg-white rounded-3xl p-8 flex flex-col h-full border border-[#c2c6d6]/40 hover:border-[#0058be]/30 transition-all hover:shadow-lg hover:-translate-y-1">
            <h3 className="text-[20px] font-bold text-[#121c2a] mb-2">Lab & Team</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-[48px] font-bold text-[#121c2a]">$29</span>
              <span className="text-[#727785] font-medium">/ user / mo</span>
            </div>
            <p className="text-[14px] text-[#424754] mb-8 h-[40px]">
              Built for collaborative research groups and labs.
            </p>
            <button className="w-full py-3 rounded-xl bg-white border border-[#c2c6d6] text-[#424754] font-bold hover:bg-gray-50 transition-colors mb-8 shadow-sm">
              Contact Sales
            </button>
            <ul className="flex flex-col gap-4">
              {["Everything in Pro", "Shared workspaces", "Co-authoring & annotations", "Admin dashboard", "SSO integration"].map(feature => (
                <li key={feature} className="flex items-center gap-3 text-[14px] text-[#424754]">
                  <span className="material-symbols-outlined text-[18px] text-[#0058be]">check_circle</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="mt-32 max-w-[800px] mx-auto">
          <h2 className="text-[28px] font-bold text-center text-[#121c2a] mb-12">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#c2c6d6]/40 shadow-sm">
              <h4 className="text-[16px] font-bold text-[#121c2a] mb-2">Can I cancel my subscription at any time?</h4>
              <p className="text-[15px] text-[#424754] leading-relaxed">Yes, you can cancel your subscription at any time from your account settings. You will retain access to Pro features until the end of your billing cycle.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[#c2c6d6]/40 shadow-sm">
              <h4 className="text-[16px] font-bold text-[#121c2a] mb-2">What happens to my documents if I downgrade to Free?</h4>
              <p className="text-[15px] text-[#424754] leading-relaxed">Your documents remain safely stored. However, if your library exceeds the Free plan's limit of 50 documents, you won't be able to upload new ones until you remove some or upgrade again.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[#c2c6d6]/40 shadow-sm">
              <h4 className="text-[16px] font-bold text-[#121c2a] mb-2">Do you offer discounts for educational institutions?</h4>
              <p className="text-[15px] text-[#424754] leading-relaxed">Yes! We offer a 50% discount for students and faculty members with a valid .edu email address. Please contact our support team to claim your discount.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-md px-margin-mobile md:px-margin-desktop flex justify-between items-center mt-auto border-t border-[#c2c6d6]/30 bg-white z-50 relative">
        <div className="text-[14px] font-semibold tracking-wider text-[#121c2a]">
          Lumis
        </div>
        <div className="text-[14px] text-[#727785]">
          © 2026 Lumis. Precision in Discovery.
        </div>
        <div className="flex gap-md">
          <Link
            href="#"
            className="text-[14px] text-[#727785] hover:text-[#121c2a] transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            className="text-[14px] text-[#727785] hover:text-[#121c2a] transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </footer>
    </>
  );
}
