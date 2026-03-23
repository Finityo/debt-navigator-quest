import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import finityoLogo from '@/assets/finityo-logo.png';
import { useOnboardingStore } from '@/store/onboardingStore';

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

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const onboarding = useOnboardingStore();

  return (
    <div className="flex min-h-screen bg-background" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[15.5rem] flex-col bg-sidebar border-r border-sidebar-border shrink-0">
        <div className="px-5 pt-7 pb-7 flex items-center gap-3">
          <img src={finityoLogo} alt="Finityo" className="w-8 h-8" />
          <div>
            <h1 className="text-lg font-bold font-heading text-sidebar-primary tracking-tight leading-none">
              Finityo
            </h1>
            <p className="text-[10px] text-sidebar-foreground/35 mt-1 font-medium tracking-wider uppercase">Debt Freedom Engine</p>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                    : 'text-sidebar-foreground/50 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent/50'
                }`}
              >
                <item.icon className={`w-[18px] h-[18px] ${active ? 'text-sidebar-primary' : ''}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 pb-5 pt-2 space-y-1">
          <button
            onClick={() => onboarding.reset()}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-[13px] font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent/50 transition-all duration-150"
          >
            <HelpCircle className="w-[18px] h-[18px]" />
            Replay Tour
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-[13px] font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent/50 transition-all duration-150"
          >
            {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b bg-card shadow-sm">
          <h1 className="text-lg font-bold font-heading text-primary tracking-tight">Finityo</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onboarding.reset()}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Replay tour"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          </div>
        </header>

        {/* Mobile nav overlay */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-sm pt-16">
            <nav className="px-4 space-y-1">
              {navItems.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-lg text-base font-medium transition-colors ${
                      active
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${active ? 'text-primary' : ''}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 xl:p-10 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
