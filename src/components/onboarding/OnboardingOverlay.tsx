import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ONBOARDING_STEPS } from "@/onboarding/onboardingSteps";
import { useOnboardingStore } from "@/store/onboardingStore";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Volume2, VolumeX } from "lucide-react";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

type Placement = "top" | "bottom" | "left" | "right" | "center";

export default function OnboardingOverlay() {
  const { currentStep, next, prev, skip, hasSeen } = useOnboardingStore();
  const step = ONBOARDING_STEPS[currentStep];
  const location = useLocation();
  const navigate = useNavigate();
  const { speak, stop } = useSpeechSynthesis();
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const boxRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [mode, setMode] = useState<"anchored" | "sheet" | "center">("center");

  // Auto-navigate to the step's route
  useEffect(() => {
    if (!step || hasSeen) return;
    if (step.route && location.pathname !== step.route) {
      navigate(step.route);
    }
  }, [step, hasSeen, location.pathname, navigate]);

  useEffect(() => {
    if (!step) return;

    const el = step.targetId ? document.getElementById(step.targetId) : null;

    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      el.classList.add("ring-2", "ring-primary", "ring-offset-2", "relative", "z-[60]");
    }

    return () => {
      if (el) {
        el.classList.remove("ring-2", "ring-primary", "ring-offset-2", "relative", "z-[60]");
      }
    };
  }, [step, location.pathname]);

  useLayoutEffect(() => {
    if (!step) return;

    if (step.placement === "center" || !step.targetId) {
      setMode("center");
      setStyle({
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      });
      return;
    }

    const el = document.getElementById(step.targetId);
    const box = boxRef.current;

    if (!el || !box) {
      setMode("sheet");
      setStyle({});
      return;
    }

    const rect = el.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 16;
    const gap = 12;

    const isSmallScreen = vw < 768 || vh < 700;
    if (isSmallScreen) {
      setMode("sheet");
      setStyle({});
      return;
    }

    let top = 0;
    let left = 0;
    const placement = (step.placement || "bottom") as Placement;

    if (placement === "top") {
      top = rect.top - boxRect.height - gap;
      left = rect.left + rect.width / 2 - boxRect.width / 2;
    } else if (placement === "bottom") {
      top = rect.bottom + gap;
      left = rect.left + rect.width / 2 - boxRect.width / 2;
    } else if (placement === "left") {
      top = rect.top + rect.height / 2 - boxRect.height / 2;
      left = rect.left - boxRect.width - gap;
    } else {
      top = rect.top + rect.height / 2 - boxRect.height / 2;
      left = rect.right + gap;
    }

    const wouldClip =
      top < margin ||
      left < margin ||
      top + boxRect.height > vh - margin ||
      left + boxRect.width > vw - margin;

    if (wouldClip) {
      setMode("sheet");
      setStyle({});
      return;
    }

    setMode("anchored");
    setStyle({ top, left, transform: "none" });
  }, [step, currentStep, location.pathname]);

  if (hasSeen || !step) return null;

  const showArrow = mode === "anchored" && step.placement !== "center";
  const isLast = currentStep >= ONBOARDING_STEPS.length - 1;

  const stepCounter = (
    <span className="text-xs text-muted-foreground whitespace-nowrap">
      {currentStep + 1} / {ONBOARDING_STEPS.length}
    </span>
  );

  const controls = (
    <div className="flex items-center gap-2">
      {currentStep > 0 && (
        <Button variant="ghost" size="sm" onClick={prev} className="h-8 px-3 text-xs">
          <ChevronLeft className="w-3.5 h-3.5 mr-1" />
          Back
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={skip} className="h-8 px-3 text-xs">
        Skip
      </Button>
      <Button size="sm" onClick={next} className="h-8 px-4 text-xs font-semibold">
        {isLast ? "Get Started" : "Next →"}
      </Button>
    </div>
  );

  const cardContent = (
    <>
      <h3 className="font-heading font-bold text-base text-foreground leading-tight mb-3">
        {step.title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5">
        {step.description}
      </p>
      <div className="flex items-center justify-between gap-3">
        {stepCounter}
        {controls}
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 z-[9998]" onClick={skip}>
      {/* dim layer */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      {/* CENTER MODE */}
      {mode === "center" && (
        <div
          className="fixed z-[10000] w-[min(360px,90vw)] bg-card border border-border shadow-2xl rounded-xl p-5"
          style={style}
          onClick={(e) => e.stopPropagation()}
        >
          {cardContent}
        </div>
      )}

      {/* ANCHORED MODE */}
      {mode === "anchored" && (
        <div
          ref={boxRef}
          className="fixed z-[10000] w-[min(360px,90vw)] bg-card border border-border shadow-2xl rounded-xl p-5"
          style={style}
          onClick={(e) => e.stopPropagation()}
        >
          {showArrow && (
            <div className="absolute -top-2 left-6 w-4 h-4 rotate-45 bg-card border-l border-t border-border" />
          )}
          {cardContent}
        </div>
      )}

      {/* MOBILE / FALLBACK SHEET MODE */}
      {mode === "sheet" && (
        <div
          className="fixed z-[10000] bottom-0 left-0 right-0 bg-card border-t border-border shadow-2xl rounded-t-2xl p-5 pb-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-10 h-1 rounded-full bg-muted-foreground/20 mx-auto mb-4" />
          {cardContent}
        </div>
      )}
    </div>
  );
}
