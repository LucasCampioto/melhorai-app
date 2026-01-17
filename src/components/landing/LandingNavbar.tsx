import { motion } from 'framer-motion';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const LandingNavbar = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Início', href: '#' },
    { label: 'Funcionalidades', href: '#features' },
    { label: 'Planos', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50"
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              <span className="text-white font-display font-bold text-xl">R</span>
            </div>
            <span className="font-display font-bold text-xl hidden sm:block">Melhora.AI</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <motion.a
                key={index}
                href={link.href}
                whileHover={{ scale: 1.05 }}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {link.label}
              </motion.a>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </motion.button>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="font-medium"
              >
                Entrar
              </Button>
              <Button
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 font-medium shadow-glow"
              >
                Começar Grátis
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-background border-b border-border"
        >
          <div className="container mx-auto px-6 py-4 space-y-4">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="block text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 space-y-3 border-t border-border">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Entrar
              </Button>
              <Button
                className="w-full bg-gradient-to-r from-primary to-accent"
                onClick={() => navigate('/register')}
              >
                Começar Grátis
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default LandingNavbar;
