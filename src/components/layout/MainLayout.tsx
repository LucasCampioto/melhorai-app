import { ReactNode, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  // Carregar estado do localStorage ou usar false como padrão
  // Em telas menores, sempre começar colapsado
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return true; // Sempre colapsado em mobile/tablet
    }
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Salvar estado no localStorage quando mudar (apenas em desktop)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
    }
  }, [isCollapsed]);

  // Ajustar comportamento em resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true); // Forçar colapsado em mobile
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      <motion.main
        className="min-h-screen"
        initial={false}
        animate={{
          marginLeft: isCollapsed ? '5rem' : '16rem',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </motion.main>
    </div>
  );
}
