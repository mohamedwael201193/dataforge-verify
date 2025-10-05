import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/contexts/WalletContext';
import { truncateAddress } from '@/lib/contract';
import { 
  Brain, 
  Database, 
  Wallet, 
  Moon, 
  Sun, 
  Menu, 
  X,
  Shield,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
  const location = useLocation();
  const { account, isConnected, connect, disconnect, balance, isConnecting } = useWallet();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    toast.success(`Switched to ${isDarkMode ? 'light' : 'dark'} mode`);
  };

  const navigation = [
    { name: 'Browse', href: '/browse', icon: Database },
    { name: 'Fund', href: '/fund', icon: Wallet },
    { name: 'Upload', href: '/upload', icon: Shield },
    { name: 'Retrieve', href: '/retrieve', icon: Database },
    { name: 'Access', href: '/access', icon: Zap },
    { name: 'Dashboard', href: '/dashboard', icon: Brain },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full glass-card border-b border-white/10 backdrop-blur-xl"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-2 bg-gradient-ai rounded-lg shadow-lg"
            >
              <Brain className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold gradient-text">DataForge Hub</h1>
              <Badge variant="secondary" className="text-xs">
                Wave 2 MVP
              </Badge>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-primary/20 text-primary'
                      : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Wallet Connection */}
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right text-sm">
                  <div className="font-medium">{truncateAddress(account!)}</div>
                  <div className="text-muted-foreground">{parseFloat(balance).toFixed(4)} tFIL</div>
                </div>
                <Button
                  variant="glass"
                  onClick={disconnect}
                  className="flex items-center space-x-2"
                >
                  <Wallet className="h-4 w-4" />
                  <span className="hidden sm:inline">Disconnect</span>
                </Button>
              </div>
            ) : (
              <Button
                variant="hero"
                onClick={connect}
                disabled={isConnecting}
                className="flex items-center space-x-2"
              >
                <Wallet className="h-4 w-4" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-white/10"
          >
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-primary/20 text-primary'
                        : 'hover:bg-white/5 text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        )}
      </div>
    </motion.header>
  );
};

export default Header;