import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
      className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center space-y-10"
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
        <div className="glass-card rounded-3xl glow overflow-hidden w-36 h-36">
          <video
            src="/hero-logo.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
        <motion.h1 variants={fadeUp} className="text-3xl font-bold font-heading tracking-tight text-foreground text-shadow-sm">
          Finityo
        </motion.h1>
        <motion.p variants={fadeUp} className="text-sm text-muted-foreground">
          Debt Freedom Engine
        </motion.p>
      </motion.div>

      {/* HEADLINE */}
      <motion.div variants={fadeUp} className="space-y-4 max-w-lg">
        <h2 className="text-3xl font-semibold font-heading leading-snug text-foreground text-shadow-sm">
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
          onClick={() => navigate("/dashboard")}
        >
          Build My Plan
        </Button>
        <Button
          variant="outline"
          size="lg"
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
