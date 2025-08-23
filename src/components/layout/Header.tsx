'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { WalletButton } from '@/components/wallet/WalletButton';
import { 
  List, 
  X, 
  PaperPlaneTilt, 
  QrCode, 
  Info,
  Sun,
  Moon,
  Desktop
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/ThemeProvider';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/send', label: 'Send', icon: PaperPlaneTilt },
    { href: '/receive', label: 'Receive', icon: QrCode },
    { href: '/about', label: 'About', icon: Info },
  ];

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-lg border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image
              src="/seipay.png"
              alt="SeiPay"
              width={40}
              height={40}
              className="rounded-lg"
              priority
            />
            <span className="text-xl font-bold gradient-text">
              SeiPay
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  <Icon weight="regular" size={18} />
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={cycleTheme}
              className="p-2.5 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Sun weight="regular" size={20} className="text-muted-foreground" />
              ) : theme === 'dark' ? (
                <Moon weight="regular" size={20} className="text-muted-foreground" />
              ) : (
                <Desktop weight="regular" size={20} className="text-muted-foreground" />
              )}
            </button>
            
            <WalletButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X weight="regular" size={24} />
            ) : (
              <List weight="regular" size={24} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-lg border-t border-border">
          <div className="container py-4">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Icon weight="regular" size={20} className="text-primary" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
            </nav>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setTheme('light'); setIsMobileMenuOpen(false); }}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    theme === 'light' ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}
                  aria-label="Light mode"
                >
                  <Sun weight="regular" size={20} />
                </button>
                <button
                  onClick={() => { setTheme('dark'); setIsMobileMenuOpen(false); }}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    theme === 'dark' ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}
                  aria-label="Dark mode"
                >
                  <Moon weight="regular" size={20} />
                </button>
                <button
                  onClick={() => { setTheme('system'); setIsMobileMenuOpen(false); }}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    theme === 'system' ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}
                  aria-label="System theme"
                >
                  <Desktop weight="regular" size={20} />
                </button>
              </div>
              
              <WalletButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}