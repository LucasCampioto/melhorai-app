import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Target,
  MessageSquare,
  Calendar,
  ListTodo,
  Settings,
  Moon,
  Sun,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Target, label: 'Objetivos', path: '/objectives' },
  { icon: MessageSquare, label: 'Agente IA', path: '/chat' },
  { icon: Calendar, label: 'Calendário', path: '/calendar' },
  { icon: ListTodo, label: 'Tarefas', path: '/tasks' },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.aside
      className="fixed left-0 top-0 z-40 h-screen bg-card/80 backdrop-blur-xl border-r border-glass-border overflow-hidden"
      initial={false}
      animate={{
        width: isCollapsed ? '5rem' : '16rem',
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center justify-center border-b border-glass-border px-3 relative">
          {isCollapsed ? (
            // Quando colapsado: logo funciona como botão para abrir
            <motion.button
              onClick={onToggle}
              className="flex items-center justify-center gap-3 min-w-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Expandir menu"
            >
              <motion.div
                className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-neon cursor-pointer"
              >
                <img 
                  src="/favicon.svg" 
                  alt="FocAI" 
                  className="h-6 w-6"
                />
                <div className="absolute inset-0 rounded-xl animate-pulse-ring border border-primary/50" />
              </motion.div>
            </motion.button>
          ) : (
            // Quando expandido: logo leva para home e tem botão de fechar
            <>
              <Link to="/" className="flex items-center justify-center gap-3 min-w-0 flex-1">
                <motion.div
                  className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-neon"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img 
                    src="/favicon.svg" 
                    alt="FocAI" 
                    className="h-6 w-6"
                  />
                  <div className="absolute inset-0 rounded-xl animate-pulse-ring border border-primary/50" />
                </motion.div>
                <AnimatePresence mode="wait">
                  <motion.span
                    key="logo-text"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="font-display text-xl font-bold gradient-text whitespace-nowrap overflow-hidden"
                  >
                    Foc.ai
                  </motion.span>
                </AnimatePresence>
              </Link>
              <motion.button
                onClick={onToggle}
                className="absolute right-2 p-2 rounded-lg hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Colapsar menu"
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300',
                    'hover:bg-secondary/80',
                    isActive && 'bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20'
                  )}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0 transition-colors',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        key={`label-${item.path}`}
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          'font-medium transition-colors whitespace-nowrap overflow-hidden',
                          isActive ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && !isCollapsed && (
                    <motion.div
                      className="ml-auto h-2 w-2 rounded-full bg-primary shadow-neon"
                      layoutId="activeIndicator"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="px-3 py-4 border-t border-glass-border space-y-2">
          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-secondary/80 transition-all"
            whileHover={{ x: 4 }}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600" />
            )}
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  key="theme-text"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-medium whitespace-nowrap overflow-hidden"
                >
                  {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Logout */}
          <Link to="/">
            <motion.div
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
              whileHover={{ x: 4 }}
            >
              <LogOut className="h-5 w-5" />
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    key="logout-text"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="font-medium whitespace-nowrap overflow-hidden"
                  >
                    Sair
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.aside>
  );
}
