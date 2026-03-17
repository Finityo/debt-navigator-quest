import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/finityo-logo.png";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center space-y-10 glass">
      {/* AMBIENT BACKGROUND GLOW */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-120px] right-1/3 w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      {/* BRAND */}
      <div className="flex flex-col items-center space-y-4">
        <div className="glass-strong p-5 rounded-2xl glow">
          <img src={logo} alt="Finityo logo" className="w-24 h-24" />
        </div>
        <h1 className="text-3xl font-bold font-heading tracking-tight text-foreground">
          Finityo
        </h1>
        <p className="text-sm text-muted-foreground">
          Debt Freedom Engine
        </p>
      </div>

      {/* HEADLINE */}
      <div className="space-y-4 max-w-lg">
        <h2 className="text-3xl font-semibold font-heading leading-snug text-foreground drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          Turn your debt into a clear, structured payoff plan
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Finityo analyzes your balances, interest rates, and payments to build a precise strategy
          — so you know exactly what to pay, when to pay it, and when you'll be debt-free.
        </p>
      </div>

      {/* VALUE BULLETS */}
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>• Built-in Snowball &amp; Avalanche strategies</p>
        <p>• Real payoff timelines — not estimates</p>
        <p>• Track progress and eliminate guesswork</p>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <Button
          size="lg"
          className="glass-strong glow hover:scale-[1.02] transition-all"
          onClick={() => navigate("/dashboard")}
        >
          Build My Plan
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="glass hover:bg-accent"
          onClick={() => navigate("/debts")}
        >
          View My Debts
        </Button>
      </div>

      {/* TRUST */}
      <p className="text-xs text-muted-foreground">
        Takes less than 60 seconds • No spreadsheets • No guesswork
      </p>
    </div>
  );
}
