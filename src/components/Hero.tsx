import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/finityo-logo.png";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col items-center justify-center text-center py-16 md:py-24 px-4">
      {/* BRAND */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <img src={logo} alt="Finityo logo" className="w-20 h-20 opacity-90" />
        <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground leading-none">
          Finityo
        </h1>
        <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-[0.2em]">
          Debt Freedom Engine
        </p>
      </div>

      {/* CORE MESSAGE */}
      <div className="max-w-xl space-y-4 mb-10">
        <h2 className="text-3xl md:text-4xl font-bold font-heading tracking-tight text-foreground leading-tight">
          Turn your debt into a clear, structured payoff plan
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
          Finityo analyzes your balances, interest rates, and payments to build a precise strategy
          — so you know exactly what to pay, when to pay it, and when you'll be debt-free.
        </p>
      </div>

      {/* VALUE BULLETS */}
      <div className="flex flex-col items-start gap-2.5 text-sm text-foreground/80 mb-10">
        <p>• Snowball &amp; Avalanche strategies built-in</p>
        <p>• Real payoff timelines — not estimates</p>
        <p>• Track progress and eliminate guesswork</p>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button size="lg" onClick={() => navigate("/dashboard")} className="px-8">
          Build My Plan
        </Button>
        <Button size="lg" variant="outline" onClick={() => navigate("/debts")}>
          View My Debts
        </Button>
      </div>

      {/* TRUST LINE */}
      <p className="text-xs text-muted-foreground/50 mt-10 tracking-wide">
        Takes less than 60 seconds • No spreadsheets • No guesswork
      </p>
    </section>
  );
}
