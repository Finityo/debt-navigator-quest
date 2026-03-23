import { ONBOARDING_STEPS } from "@/onboarding/onboardingSteps";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function OnboardingOverlay() {
  const { currentStep, next, prev, skip, hasSeen } = useOnboardingStore();
  const step = ONBOARDING_STEPS[currentStep];

  const [position, setPosition] = useState({ top: 100, left: 100 });

  useEffect(() => {
    if (!step?.targetId) return;

    const el = document.getElementById(step.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 10,
        left: rect.left,
      });
    }
  }, [step]);

  if (hasSeen || !step) return null;

  const isCentered = !step.targetId;

  return (
    <div className="fixed inset-0 z-[9998]" onClick={skip}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      <div
        className={`fixed z-[10000] w-[min(360px,90vw)] bg-card border border-border shadow-2xl rounded-xl overflow-hidden ${
          isCentered ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" : ""
        }`}
        style={!isCentered ? { top: position.top, left: position.left } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-0 flex items-start justify-between gap-2">
          <h3 className="font-heading font-bold text-base text-foreground leading-tight">
            {step.title}
          </h3>
          <button
            onClick={skip}
            className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {step.description}
          </p>
        </div>

        <div className="px-5 pb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            {ONBOARDING_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === currentStep
                    ? "w-4 bg-primary"
                    : i < currentStep
                    ? "w-1.5 bg-primary/40"
                    : "w-1.5 bg-muted-foreground/20"
                }`}
              />
            ))}
          </div>

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
              {currentStep >= ONBOARDING_STEPS.length - 1 ? "Get Started" : "Next"}
              {currentStep < ONBOARDING_STEPS.length - 1 && <ChevronRight className="w-3.5 h-3.5 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
