import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (isResetMode) {
      toast({
        title: 'Email enviado!',
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      });
      setIsResetMode(false);
    } else {
      toast({
        title: 'Login realizado!',
        description: 'Bem-vindo de volta!',
      });
      navigate('/dashboard');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 relative">
        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </motion.button>

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/landing')}
          className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full mx-auto"
        >
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              <span className="text-white font-display font-bold text-2xl">R</span>
            </div>
            <span className="font-display font-bold text-2xl">Melhora.AI</span>
          </div>

          {/* Header */}
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            {isResetMode ? 'Redefinir Senha' : 'Bem-vindo de volta!'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isResetMode
              ? 'Digite seu email para receber o link de redefinição.'
              : 'Entre na sua conta para continuar sua jornada.'
            }
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-11 h-12 bg-secondary/50 border-border focus:border-primary"
                  required
                />
              </div>
            </div>

            {/* Password - Only show when not in reset mode */}
            {!isResetMode && (
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-11 pr-11 h-12 bg-secondary/50 border-border focus:border-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot Password */}
            {!isResetMode && (
              <button
                type="button"
                onClick={() => setIsResetMode(true)}
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                Esqueceu sua senha?
              </button>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-glow"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                />
              ) : isResetMode ? (
                'Enviar Link'
              ) : (
                'Entrar'
              )}
            </Button>

            {/* Back to Login */}
            {isResetMode && (
              <button
                type="button"
                onClick={() => setIsResetMode(false)}
                className="w-full text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Voltar para o login
              </button>
            )}
          </form>

          {/* Register Link */}
          {!isResetMode && (
            <p className="mt-8 text-center text-muted-foreground">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Cadastre-se
              </Link>
            </p>
          )}
        </motion.div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary/20 via-background to-accent/20 items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Central Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center"
        >
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-40 h-40 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow"
          >
            <Sparkles className="w-20 h-20 text-white" />
          </motion.div>
          <h2 className="text-3xl font-display font-bold mb-4">
            Organize sua <span className="gradient-text">rotina</span>
          </h2>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Com a ajuda da IA, alcance seus objetivos de forma inteligente e eficiente.
          </p>
        </motion.div>

        {/* Glow Effects */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default Login;
