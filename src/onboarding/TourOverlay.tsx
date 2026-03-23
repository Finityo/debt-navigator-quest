import React, { useEffect, useMemo, useState } from "react";
import { ONBOARDING_STEPS } from "./onboardingSteps";
import { useOnboarding } from "./OnboardingProvider";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

type BoxPosition = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export default function TourOverlay() {
  const {
    isActive,
    currentStepIndex,
    nextStep,
    prevStep,
    skipTour,
  } = useOnboarding();

  const [targetBox, setTargetBox] = useState<BoxPosition | null>(null);
  const step = ONBOARDING_STEPS[currentStepIndex];
  const totalSteps = ONBOARDING_STEPS.length;
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === totalSteps - 1;

  useEffect(() => {
    if (!isActive) return;

    const updatePosition = () => {
      if (!step?.targetId) {
        setTargetBox(null);
        return;
      }

      const el = document.getElementById(step.targetId!) as HTMLElement | null;
      if (!el) {
        setTargetBox(null);
        return;
      }

      const rect = el.getBoundingClientRect();
      setTargetBox({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
    };

    const t = setTimeout(updatePosition, 250);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [isActive, step, currentStepIndex]);

  const popoverStyle = useMemo((): React.CSSProperties => {
    if (!targetBox || !step?.target) {
      // Centered modal
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const gap = 12;
    const tooltipWidth = 360;
    const placement = step.placement || "bottom";
    const viewportTop = targetBox.top - window.scrollY;
    const viewportLeft = targetBox.left - window.scrollX;

    const clampLeft = (rawLeft: number) =>
      Math.max(8, Math.min(rawLeft, window.innerWidth - tooltipWidth - 8));

    switch (placement) {
      case "top":
        return {
          position: "fixed",
          bottom: window.innerHeight - viewportTop + gap,
          left: clampLeft(viewportLeft + targetBox.width / 2 - tooltipWidth / 2),
        };
      case "left":
        return {
          position: "fixed",
          top: viewportTop + targetBox.height / 2 - 60,
          right: window.innerWidth - viewportLeft + gap,
        };
      case "right":
        return {
          position: "fixed",
          top: viewportTop + targetBox.height / 2 - 60,
          left: viewportLeft + targetBox.width + gap,
        };
      case "bottom":
      default:
        return {
          position: "fixed",
          top: viewportTop + targetBox.height + gap,
          left: clampLeft(viewportLeft + targetBox.width / 2 - tooltipWidth / 2),
        };
    }
  }, [targetBox, step]);

  if (!isActive || !step) return null;

  const isCentered = !step.target || !targetBox;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9998]" onClick={skipTour}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        {targetBox && step.target && (
          <div
            className="absolute rounded-lg ring-2 ring-primary ring-offset-2 ring-offset-transparent"
            style={{
              top: targetBox.top - window.scrollY - 4,
              left: targetBox.left - window.scrollX - 4,
              width: targetBox.width + 8,
              height: targetBox.height + 8,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
              background: "transparent",
              zIndex: 9999,
              position: "fixed",
            }}
          />
        )}
      </div>

      {/* Popover */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="z-[10000] w-[min(360px,90vw)]"
          style={popoverStyle}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-card border border-border shadow-2xl rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-5 pb-0 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-base text-foreground leading-tight">
                  {step.title}
                </h3>
              </div>
              <button
                onClick={skipTour}
                className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.content}
              </p>
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 flex items-center justify-between gap-3">
              {/* Progress dots */}
              <div className="flex items-center gap-1">
                {onboardingSteps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      i === currentStepIndex
                        ? "w-4 bg-primary"
                        : i < currentStepIndex
                        ? "w-1.5 bg-primary/40"
                        : "w-1.5 bg-muted-foreground/20"
                    }`}
                  />
                ))}
              </div>

              {/* Nav buttons */}
              <div className="flex items-center gap-2">
                {!isFirst && (
                  <Button variant="ghost" size="sm" onClick={prevStep} className="h-8 px-3 text-xs">
                    <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                    Back
                  </Button>
                )}
                <Button size="sm" onClick={nextStep} className="h-8 px-4 text-xs font-semibold">
                  {isLast ? "Get Started" : "Next"}
                  {!isLast && <ChevronRight className="w-3.5 h-3.5 ml-1" />}
                </Button>
              </div>
            </div>

            {/* Step counter */}
            <div className="px-5 pb-3">
              <p className="text-[10px] text-muted-foreground/50 font-medium text-right">
                {currentStepIndex + 1} / {totalSteps}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
