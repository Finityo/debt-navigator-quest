import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { onboardingSteps, type TourStep } from './onboardingSteps';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const TOUR_STORAGE_KEY = 'finityo-tour-completed';

export function useOnboardingTour() {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const start = useCallback(() => {
    setStepIndex(0);
    setActive(true);
  }, []);

  const finish = useCallback(() => {
    setActive(false);
    setStepIndex(0);
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
  }, []);

  const hasCompleted = localStorage.getItem(TOUR_STORAGE_KEY) === 'true';

  return { active, stepIndex, setStepIndex, start, finish, hasCompleted };
}

interface TourProps {
  active: boolean;
  stepIndex: number;
  setStepIndex: (i: number) => void;
  onFinish: () => void;
}

export function OnboardingTour({ active, stepIndex, setStepIndex, onFinish }: TourProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const resizeRef = useRef<ReturnType<typeof setTimeout>>();

  const step = onboardingSteps[stepIndex];
  const totalSteps = onboardingSteps.length;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  // Navigate to step route if needed
  useEffect(() => {
    if (!active || !step) return;
    if (location.pathname !== step.route) {
      setIsNavigating(true);
      navigate(step.route);
    }
  }, [active, step, location.pathname, navigate]);

  // After navigation, wait for DOM to settle then position tooltip
  useEffect(() => {
    if (!active || !step) return;

    const position = () => {
      if (location.pathname !== step.route) return;
      setIsNavigating(false);

      if (!step.target) {
        setTooltipPos(null);
        return;
      }

      const el = document.querySelector(step.target);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTooltipPos({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
      } else {
        setTooltipPos(null);
      }
    };

    // Small delay to let the page render
    const timer = setTimeout(position, 300);
    return () => clearTimeout(timer);
  }, [active, step, stepIndex, location.pathname]);

  // Reposition on resize
  useEffect(() => {
    if (!active) return;
    const handleResize = () => {
      clearTimeout(resizeRef.current);
      resizeRef.current = setTimeout(() => {
        if (!step?.target) return;
        const el = document.querySelector(step.target);
        if (el) {
          const rect = el.getBoundingClientRect();
          setTooltipPos({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
        }
      }, 100);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [active, step]);

  const next = () => {
    if (isLast) {
      onFinish();
    } else {
      setStepIndex(stepIndex + 1);
    }
  };

  const prev = () => {
    if (!isFirst) setStepIndex(stepIndex - 1);
  };

  if (!active || !step || isNavigating) return null;

  const isCentered = !step.target || !tooltipPos;

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 z-[9998]" onClick={onFinish}>
        {/* Dark overlay with spotlight cutout */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        {tooltipPos && step.target && (
          <div
            className="absolute rounded-lg ring-2 ring-primary ring-offset-2 ring-offset-transparent"
            style={{
              top: tooltipPos.top - 4,
              left: tooltipPos.left - 4,
              width: tooltipPos.width + 8,
              height: tooltipPos.height + 8,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
              background: 'transparent',
              zIndex: 9999,
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className={`fixed z-[10000] w-[min(360px,90vw)] ${
            isCentered
              ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
              : ''
          }`}
          style={
            !isCentered && tooltipPos
              ? getTooltipPosition(tooltipPos, step.placement || 'bottom')
              : undefined
          }
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
                onClick={onFinish}
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
                      i === stepIndex
                        ? 'w-4 bg-primary'
                        : i < stepIndex
                        ? 'w-1.5 bg-primary/40'
                        : 'w-1.5 bg-muted-foreground/20'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-2">
                {!isFirst && (
                  <Button variant="ghost" size="sm" onClick={prev} className="h-8 px-3 text-xs">
                    <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                    Back
                  </Button>
                )}
                <Button size="sm" onClick={next} className="h-8 px-4 text-xs font-semibold">
                  {isLast ? 'Get Started' : 'Next'}
                  {!isLast && <ChevronRight className="w-3.5 h-3.5 ml-1" />}
                </Button>
              </div>
            </div>

            {/* Step counter */}
            <div className="px-5 pb-3">
              <p className="text-[10px] text-muted-foreground/50 font-medium text-right">
                {stepIndex + 1} / {totalSteps}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function getTooltipPosition(
  rect: { top: number; left: number; width: number; height: number },
  placement: string
): React.CSSProperties {
  const gap = 12;
  const tooltipWidth = 360;

  switch (placement) {
    case 'bottom':
      return {
        top: rect.top + rect.height + gap,
        left: Math.max(8, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 8)),
      };
    case 'top':
      return {
        bottom: window.innerHeight - rect.top + gap,
        left: Math.max(8, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 8)),
      };
    case 'left':
      return {
        top: rect.top + rect.height / 2 - 60,
        right: window.innerWidth - rect.left + gap,
      };
    case 'right':
      return {
        top: rect.top + rect.height / 2 - 60,
        left: rect.left + rect.width + gap,
      };
    default:
      return {
        top: rect.top + rect.height + gap,
        left: Math.max(8, rect.left + rect.width / 2 - tooltipWidth / 2),
      };
  }
}
