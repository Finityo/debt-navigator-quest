import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import logo from "@/assets/finityo-logo.png";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const ease = [0.25, 0.4, 0.25, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease } },
};

export default function Hero() {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center space-y-10 glass"
    >
      {/* AMBIENT BACKGROUND GLOW */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-primary/10 blur-[140px] rounded-full"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.3 }}
          className="absolute bottom-[-120px] right-1/3 w-[300px] h-[300px] bg-blue-500/[0.08] blur-[140px] rounded-full"
        />
      </div>

      {/* BRAND */}
      <motion.div variants={scaleIn} className="flex flex-col items-center space-y-4">
        <div className="glass-strong p-5 rounded-2xl glow">
          <img src={logo} alt="Finityo logo" className="w-24 h-24" />
        </div>
        <motion.h1 variants={fadeUp} className="text-3xl font-bold font-heading tracking-tight text-foreground">
          Finityo
        </motion.h1>
        <motion.p variants={fadeUp} className="text-sm text-muted-foreground">
          Debt Freedom Engine
        </motion.p>
      </motion.div>

      {/* HEADLINE */}
      <motion.div variants={fadeUp} className="space-y-4 max-w-lg">
        <h2 className="text-3xl font-semibold font-heading leading-snug text-foreground drop-shadow-[0_0_20px_rgba(255,255,255,0.08)]">
          Turn your debt into a clear, structured payoff plan
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Finityo analyzes your balances, interest rates, and payments to build a precise strategy
          — so you know exactly what to pay, when to pay it, and when you'll be debt-free.
        </p>
      </motion.div>

      {/* VALUE BULLETS */}
      <motion.div variants={fadeUp} className="space-y-2 text-sm text-muted-foreground">
        <p>• Built-in Snowball &amp; Avalanche strategies</p>
        <p>• Real payoff timelines — not estimates</p>
        <p>• Track progress and eliminate guesswork</p>
      </motion.div>

      {/* CTA */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 pt-2">
        <Button
          size="lg"
          className="glass-strong glow bg-primary/90 hover:bg-primary text-primary-foreground font-semibold hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
          onClick={() => navigate("/dashboard")}
        >
          Build My Plan
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="glass hover:bg-accent/10 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
          onClick={() => navigate("/debts")}
        >
          View My Debts
        </Button>
      </motion.div>

      {/* TRUST */}
      <motion.p variants={fadeUp} className="text-xs text-muted-foreground">
        Takes less than 60 seconds • No spreadsheets • No guesswork
      </motion.p>
    </motion.div>
  );
}
