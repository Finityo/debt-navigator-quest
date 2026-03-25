import { useCallback, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  CreditCard,
  Calculator,
  CalendarDays,
  GitCompare,
  BarChart3,
  ClipboardList,
  Settings,
  Menu,
  X,
  Banknote,
  Moon,
  Sun,
  HelpCircle,
  LogIn,
  User,
} from 'lucide-react';
import finityoLogo from '@/assets/app-icon-1024.png';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/debts', label: 'Debts', icon: CreditCard },
  { to: '/extra-payments', label: 'Extra Payments', icon: Banknote },
  { to: '/plan', label: 'Plan', icon: Calculator },
  { to: '/timeline', label: 'Timeline', icon: CalendarDays },
  { to: '/scenarios', label: 'Scenarios', icon: GitCompare },
  { to: '/sensitivity', label: 'Sensitivity', icon: BarChart3 },
  { to: '/activity', label: 'Activity', icon: ClipboardList },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function MobileNavPanel({ onClose, children }: { onClose: () => void; children: (close: () => void) => React.ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [dragX, setDragX] = useState(0);
  const [closing, setClosing] = useState(false);

  const THRESHOLD = 80;

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 250);
  }, [onClose]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.touches[0].clientX - touchStart.current.x;
    const dy = Math.abs(e.touches[0].clientY - touchStart.current.y);
    // Only track horizontal swipe to the right
    if (dx > 0 && dx > dy) {
      setDragX(dx);
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    if (dragX > THRESHOLD) {
      handleClose();
    } else {
      setDragX(0);
    }
    touchStart.current = null;
  }, [dragX, handleClose]);

  const panelTranslate = closing ? '100%' : `${dragX}px`;
  const scrimOpacity = closing ? 0 : Math.max(0, 1 - dragX / 320);

  return (
    <div className="lg:hidden fixed inset-0 z-50" onClick={handleClose}>
      {/* Scrim */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-250"
        style={{ opacity: scrimOpacity }}
      />
      {/* Panel */}
      <div
        ref={panelRef}
        className={`absolute top-0 right-0 h-full w-[min(80vw,320px)] glass-sidebar border-l border-[var(--glass-border)] shadow-glow flex flex-col ${closing ? 'transition-transform duration-250 ease-in' : dragX > 0 ? '' : 'animate-in slide-in-from-right duration-300'}`}
        style={{ transform: `translateX(${panelTranslate})` }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children(handleClose)}
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const onboarding = useOnboardingStore();

  return (
    <div className="flex min-h-screen liquid-bg" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Desktop sidebar — glass */}
      <aside className="hidden lg:flex w-[15.5rem] flex-col glass-sidebar shrink-0">
        <div className="px-5 pt-7 pb-7 flex items-center gap-3">
          <img src={finityoLogo} alt="Finityo" className="w-8 h-8" />
          <div>
            <h1 className="text-lg font-bold font-heading text-primary tracking-tight leading-none">
              Finityo
            </h1>
            <p className="text-[10px] text-foreground/35 mt-1 font-medium tracking-wider uppercase">Debt Freedom Engine</p>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                  active
                    ? 'glass-strong text-foreground shadow-sm border border-[var(--glass-border-strong)]'
                    : 'text-foreground/50 hover:text-foreground/80 hover:bg-[var(--glass-bg)]'
                }`}
              >
                <item.icon className={`w-[18px] h-[18px] ${active ? 'text-primary' : ''}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 pb-5 pt-2 space-y-1">
          <button
            onClick={() => onboarding.reset()}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-foreground/50 hover:text-foreground/80 hover:bg-[var(--glass-bg)] transition-all duration-200"
          >
            <HelpCircle className="w-[18px] h-[18px]" />
            Replay Tour
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-foreground/50 hover:text-foreground/80 hover:bg-[var(--glass-bg)] transition-all duration-200"
          >
            {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </aside>

      {/* Mobile header — glass */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 glass-header">
          <h1 className="text-lg font-bold font-heading text-primary tracking-tight">Finityo</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onboarding.reset()}
              className="p-2 rounded-xl hover:bg-[var(--glass-bg-strong)] transition-colors"
              aria-label="Replay tour"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl hover:bg-[var(--glass-bg-strong)] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl hover:bg-[var(--glass-bg-strong)] transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          </div>
        </header>

        {/* Mobile nav — swipeable slide-in glass panel */}
        {mobileOpen && (
          <MobileNavPanel onClose={() => setMobileOpen(false)}>
            {(handleClose) => (
              <>
                {/* Panel header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--glass-border)]">
                  <span className="text-sm font-heading font-bold text-foreground/70 uppercase tracking-wider">Menu</span>
                  <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-[var(--glass-bg-strong)] transition-colors">
                    <X className="w-5 h-5 text-foreground/60" />
                  </button>
                </div>
                {/* Nav links */}
                <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
                  {navItems.map((item) => {
                    const active = location.pathname === item.to;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={handleClose}
                        className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-[15px] font-medium transition-all duration-200 ${
                          active
                            ? 'glass-strong text-foreground border border-[var(--glass-border-strong)]'
                            : 'text-foreground/50 hover:text-foreground/80 hover:bg-[var(--glass-bg)]'
                        }`}
                      >
                        <item.icon className={`w-5 h-5 shrink-0 ${active ? 'text-primary' : ''}`} />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
                {/* Panel footer */}
                <div className="px-3 pb-5 pt-2 space-y-1 border-t border-[var(--glass-border)]">
                  <button
                    onClick={() => { onboarding.reset(); handleClose(); }}
                    className="flex items-center gap-3 w-full px-3.5 py-3 rounded-xl text-[15px] font-medium text-foreground/50 hover:text-foreground/80 hover:bg-[var(--glass-bg)] transition-all duration-200"
                  >
                    <HelpCircle className="w-5 h-5 shrink-0" />
                    Replay Tour
                  </button>
                  <button
                    onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); handleClose(); }}
                    className="flex items-center gap-3 w-full px-3.5 py-3 rounded-xl text-[15px] font-medium text-foreground/50 hover:text-foreground/80 hover:bg-[var(--glass-bg)] transition-all duration-200"
                  >
                    {theme === 'dark' ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </button>
                </div>
              </>
            )}
          </MobileNavPanel>
        )}

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 xl:p-10 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
