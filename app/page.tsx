import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="ambient-blob bg-primary-fixed w-[600px] h-[600px] top-[-200px] left-[-200px]"></div>
      <div className="ambient-blob bg-secondary-fixed w-[500px] h-[500px] top-[20%] right-[-100px]"></div>
      <div className="ambient-blob bg-surface-container-high w-[700px] h-[700px] bottom-[-200px] left-[20%]"></div>

      <header
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-gutter h-16 bg-surface/80 dark:bg-inverse-surface/80 backdrop-blur-xl border-b border-on-surface/10 shadow-sm transition-all duration-300"
        id="main-nav"
      >
        <div className="flex items-center gap-sm">
          <Link
            href="/"
            className="text-[28px] font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#0058be] to-[#316bf3] dark:from-[#adc6ff] dark:to-[#dbe1ff] drop-shadow-sm hover:scale-[1.02] transition-transform cursor-pointer"
          >
            Lumis
          </Link>
        </div>

        <nav className="hidden md:flex gap-lg items-center">
          <Link
            href="#features"
            className="text-on-surface-variant dark:text-on-surface-variant hover:text-on-surface text-[14px] font-semibold tracking-wider transition-colors"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-on-surface-variant dark:text-on-surface-variant hover:text-on-surface text-[14px] font-semibold tracking-wider transition-colors"
          >
            How it works
          </Link>
          <Link
            href="#pricing"
            className="text-on-surface-variant dark:text-on-surface-variant hover:text-on-surface text-[14px] font-semibold tracking-wider transition-colors"
          >
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-md">
          <button className="hidden md:flex items-center gap-xs text-on-surface-variant hover:text-on-surface transition-colors p-xs rounded-full hover:bg-surface-container-highest/50">
            <span className="material-symbols-outlined text-[20px]">
              search
            </span>
          </button>
          <Link
            href="/login"
            className="text-[14px] font-semibold tracking-wider text-[#0058be] hover:text-[#2170e4] transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="bg-[#0058be] hover:bg-[#2170e4] text-white text-[14px] font-semibold tracking-wider py-sm px-md rounded-full shadow-sm transition-all duration-200 hover:shadow-md border-none"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex-grow pt-xl mt-lg px-margin-mobile md:px-margin-desktop w-full max-w-[1400px] mx-auto z-10">
        <section className="flex flex-col lg:flex-row items-center justify-between gap-lg py-[80px] min-h-[80vh]">
          <div className="flex-1 flex flex-col items-start gap-lg w-full max-w-[672px]">
            <div className="inline-flex items-center gap-xs px-sm py-xs bg-surface-container-high rounded-full text-[#0058be] text-[12px] font-medium border border-[#adc6ff]">
              <span className="material-symbols-outlined text-[16px]">
                auto_awesome
              </span>
              <span>Introducing AI Synthesis 2.0</span>
            </div>

            <h1 className="text-[48px] font-bold leading-[1.1] tracking-tight text-on-surface">
              Intelligence for your{" "}
              <span className="text-[#0058be]">Research</span>.
            </h1>

            <p className="text-[18px] leading-[1.6] text-[#424754] dark:text-[#c2c6d6] w-full max-w-[576px]">
              Accelerate your discovery process with an AI-first workspace
              designed for deep academic and professional research. Organize,
              analyze, and synthesize knowledge effortlessly.
            </p>

            <div className="flex flex-col sm:flex-row gap-md mt-sm w-full sm:w-auto">
              <button className="bg-gradient-to-r from-[#0058be] to-[#316bf3] hover:from-[#2170e4] hover:to-[#0051d5] text-white text-[14px] font-semibold py-[16px] px-[32px] rounded-2xl shadow-[0_10px_40px_rgba(31,41,55,0.15)] hover:shadow-[0_15px_50px_rgba(31,41,55,0.2)] transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto text-center border-none">
                Get Started for Free
              </button>
              <button className="glass-panel text-on-surface text-[14px] font-semibold py-[16px] px-[32px] rounded-2xl hover:bg-[#d9e3f6]/50 transition-all duration-300 w-full sm:w-auto text-center flex items-center justify-center gap-sm border border-black/5 dark:border-white/10 dark:text-white">
                <span className="material-symbols-outlined">play_circle</span>
                Watch Demo
              </button>
            </div>
          </div>

          <div className="flex-1 relative w-full aspect-square max-w-[600px] lg:max-w-none">
            <div className="w-full h-full relative rounded-3xl overflow-hidden glass-panel ai-spark-border p-md flex items-center justify-center bg-surface/30">
              <img
                alt="Abstract AI documents"
                className="w-full h-full object-cover rounded-2xl opacity-90 mix-blend-overlay"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBshQc5MIFmp6ffxVLKfWm7uCD3mgKu9K06bdkPY1PFjAywp_okmhQroIWsQi8D7TzSsImrbWlVOrVuhQVZH7xnRg4_ELKsCjY3HXeLDvlMFjTCAQ1qijvWsElcvWQXLDW_MXoz9BRvfdZZ_cMcO7rxiduUJujlKXQM95RwcIAUgf2NPyEmRTlaGDGzdaNZCiVVp4LtB3Y0SO6Mf6WWZMhYXVh4fZ8GgjUWd552iADJuOugXMH4liNNTwQSHFsWpffe0lPvRaUe735f"
              />

              <div className="absolute inset-0 p-lg flex flex-col gap-md justify-center items-center z-10 pointer-events-none">
                <div className="glass-panel w-3/4 h-24 rounded-xl flex items-center p-md gap-md transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary">
                    <span className="material-symbols-outlined">
                      description
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col gap-xs">
                    <div className="h-3 w-1/2 bg-surface-container-highest rounded"></div>
                    <div className="h-2 w-3/4 bg-surface-container-highest rounded"></div>
                  </div>
                </div>

                <div className="glass-panel w-5/6 h-32 rounded-xl flex items-center p-md gap-md transform translate-x-4 ai-spark-border">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-primary">
                    <span className="material-symbols-outlined text-[20px]">
                      auto_awesome
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col gap-sm">
                    <div className="h-2 w-full bg-surface-container-highest rounded"></div>
                    <div className="h-2 w-5/6 bg-surface-container-highest rounded"></div>
                    <div className="h-2 w-4/6 bg-surface-container-highest rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-xl" id="features">
          <div className="text-center mb-xl">
            <h2 className="text-[32px] font-semibold leading-[1.2] tracking-tight text-on-surface mb-md">
              Built for Deep Work
            </h2>
            <p className="text-[18px] text-on-surface-variant max-w-[672px] mx-auto">
              Everything you need to move from raw data to synthesized insight.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div className="md:col-span-2 glass-panel rounded-3xl p-lg flex flex-col justify-between overflow-hidden relative group h-[400px]">
              <div className="z-10 relative">
                <span className="material-symbols-outlined text-[32px] text-[#0058be] mb-sm block">
                  psychology
                </span>
                <h3 className="text-[24px] font-medium leading-[1.3] text-on-surface mb-sm">
                  AI-Powered Analysis
                </h3>
                <p className="text-[16px] text-on-surface-variant max-w-[448px] mt-4">
                  Instantly summarize papers, extract key methodologies, and
                  identify contradictions across your entire library with
                  advanced language models.
                </p>
              </div>

              <div className="absolute right-[-5%] bottom-[-10%] w-2/3 h-2/3 bg-surface dark:bg-inverse-surface rounded-tl-3xl shadow-[-10px_-10px_30px_rgba(31,41,55,0.05)] p-md border-t border-l border-black/5 dark:border-white/10 transform group-hover:-translate-y-2 group-hover:-translate-x-2 transition-transform duration-500">
                <div className="flex items-center gap-sm mb-sm text-[#0058be]">
                  <span className="material-symbols-outlined text-[16px]">
                    auto_awesome
                  </span>
                  <span className="text-[12px] font-medium">
                    Synthesis Complete
                  </span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest dark:bg-surface-variant/20 rounded mb-2"></div>
                <div className="h-2 w-5/6 bg-surface-container-highest dark:bg-surface-variant/20 rounded mb-2"></div>
                <div className="h-2 w-4/6 bg-surface-container-highest dark:bg-surface-variant/20 rounded"></div>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-lg flex flex-col justify-start relative group h-[400px]">
              <span className="material-symbols-outlined text-[32px] text-[#0051d5] mb-sm block">
                travel_explore
              </span>
              <h3 className="text-[24px] font-medium leading-[1.3] text-on-surface mb-sm">
                Universal Search
              </h3>
              <p className="text-[16px] text-on-surface-variant mt-4 max-w-[448px]">
                Find exact citations, figures, or concepts across thousands of
                PDFs in milliseconds. Semantic search understands what you mean,
                not just what you type.
              </p>
              <div className="mt-auto w-full bg-surface rounded-xl p-sm shadow-sm flex items-center gap-sm border border-black/5 dark:border-white/10 dark:bg-inverse-surface">
                <span className="material-symbols-outlined text-outline">
                  search
                </span>
                <span className="text-[14px] text-outline-variant">
                  "neural plasticity mechanisms"
                </span>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-lg flex flex-col justify-start relative group h-[400px]">
              <span className="material-symbols-outlined text-[32px] text-[#924700] mb-sm block">
                group_work
              </span>
              <h3 className="text-[24px] font-medium leading-[1.3] text-on-surface mb-sm">
                Collaborative Workspaces
              </h3>
              <p className="text-[16px] text-on-surface-variant mt-4 max-w-[448px]">
                Share curated libraries, co-author notes, and synthesize
                findings with your lab or study group in real-time.
              </p>
              <div className="mt-auto flex -space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#2170e4] border-2 border-white flex items-center justify-center text-white text-[12px] font-medium">
                  A
                </div>
                <div className="w-10 h-10 rounded-full bg-[#316bf3] border-2 border-white flex items-center justify-center text-white text-[12px] font-medium">
                  B
                </div>
                <div className="w-10 h-10 rounded-full bg-[#b75b00] border-2 border-white flex items-center justify-center text-white text-[12px] font-medium">
                  C
                </div>
              </div>
            </div>

            <div className="md:col-span-2 glass-panel ai-spark-border rounded-3xl p-lg flex flex-col justify-center items-center text-center overflow-hidden h-[400px] bg-gradient-to-br from-surface to-surface-container-low">
              <span className="material-symbols-outlined text-[48px] text-[#0058be] mb-md block">
                library_add_check
              </span>
              <h3 className="text-[32px] font-semibold leading-[1.2] text-on-surface mb-md">
                Ready to organize the chaos?
              </h3>
              <button className="bg-[#0058be] hover:bg-[#2170e4] text-white text-[14px] font-semibold py-md px-lg rounded-full shadow-sm transition-all duration-200 mt-2 border-none">
                Start your free workspace
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-md px-margin-mobile md:px-margin-desktop flex justify-between items-center mt-auto border-t border-on-surface/5 bg-surface dark:bg-inverse-surface z-50 relative">
        <div className="text-[14px] font-semibold tracking-wider text-on-surface">
          Lumis
        </div>
        <div className="text-[14px] text-on-surface-variant">
          © 2024 Lumis. Precision in Discovery.
        </div>
        <div className="flex gap-md">
          <Link
            href="#"
            className="text-[14px] text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            className="text-[14px] text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </footer>
    </>
  );
}
