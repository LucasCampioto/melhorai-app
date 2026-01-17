import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  CreditCard,
  Eye,
  EyeOff,
  Check,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import CreditCardAnimation from '@/components/register/CreditCardAnimation';

const steps = [
  { id: 1, title: 'Dados Pessoais', icon: User },
  { id: 2, title: 'Contato', icon: Phone },
  { id: 3, title: 'Endereço', icon: MapPin },
  { id: 4, title: 'Pagamento', icon: CreditCard },
];

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const selectedPlan = location.state?.plan || 'Pro';

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const [formData, setFormData] = useState({
    // Personal
    name: '',
    cpf: '',
    email: '',
    password: '',
    // Contact
    phone: '',
    // Address
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    // Payment
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{4})(\d)/, '$1 $2')
      .replace(/(\d{4})(\d)/, '$1 $2')
      .replace(/(\d{4})(\d)/, '$1 $2')
      .slice(0, 19);
  };

  const formatExpiry = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .slice(0, 5);
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: 'Conta criada com sucesso!',
      description: `Bem-vindo ao plano ${selectedPlan}!`,
    });
    
    navigate('/dashboard');
    setIsLoading(false);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="h-12 bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) => updateField('cpf', formatCPF(e.target.value))}
                className="h-12 bg-secondary/50"
                maxLength={14}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="h-12 pl-11 bg-secondary/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="h-12 pl-11 pr-11 bg-secondary/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', formatPhone(e.target.value))}
                  className="h-12 pl-11 bg-secondary/50"
                  maxLength={15}
                />
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                placeholder="00000-000"
                value={formData.cep}
                onChange={(e) => updateField('cep', formatCEP(e.target.value))}
                className="h-12 bg-secondary/50"
                maxLength={9}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="street">Rua</Label>
                <Input
                  id="street"
                  placeholder="Nome da rua"
                  value={formData.street}
                  onChange={(e) => updateField('street', e.target.value)}
                  className="h-12 bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  placeholder="123"
                  value={formData.number}
                  onChange={(e) => updateField('number', e.target.value)}
                  className="h-12 bg-secondary/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="complement">Complemento</Label>
              <Input
                id="complement"
                placeholder="Apto, bloco, etc."
                value={formData.complement}
                onChange={(e) => updateField('complement', e.target.value)}
                className="h-12 bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                placeholder="Seu bairro"
                value={formData.neighborhood}
                onChange={(e) => updateField('neighborhood', e.target.value)}
                className="h-12 bg-secondary/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  placeholder="Sua cidade"
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className="h-12 bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  placeholder="UF"
                  value={formData.state}
                  onChange={(e) => updateField('state', e.target.value.toUpperCase())}
                  className="h-12 bg-secondary/50"
                  maxLength={2}
                />
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Credit Card Animation */}
            <div className="mb-8">
              <CreditCardAnimation
                cardNumber={formData.cardNumber}
                cardName={formData.cardName}
                cardExpiry={formData.cardExpiry}
                cardCvv={formData.cardCvv}
                isFlipped={isCardFlipped}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber">Número do Cartão</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="cardNumber"
                  placeholder="0000 0000 0000 0000"
                  value={formData.cardNumber}
                  onChange={(e) => updateField('cardNumber', formatCardNumber(e.target.value))}
                  onFocus={() => setIsCardFlipped(false)}
                  className="h-12 pl-11 bg-secondary/50 font-mono"
                  maxLength={19}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardName">Nome no Cartão</Label>
              <Input
                id="cardName"
                placeholder="NOME COMO ESTÁ NO CARTÃO"
                value={formData.cardName}
                onChange={(e) => updateField('cardName', e.target.value.toUpperCase())}
                onFocus={() => setIsCardFlipped(false)}
                className="h-12 bg-secondary/50 uppercase"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardExpiry">Validade</Label>
                <Input
                  id="cardExpiry"
                  placeholder="MM/AA"
                  value={formData.cardExpiry}
                  onChange={(e) => updateField('cardExpiry', formatExpiry(e.target.value))}
                  onFocus={() => setIsCardFlipped(false)}
                  className="h-12 bg-secondary/50 font-mono"
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardCvv">CVV</Label>
                <Input
                  id="cardCvv"
                  placeholder="123"
                  value={formData.cardCvv}
                  onChange={(e) => updateField('cardCvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                  onFocus={() => setIsCardFlipped(true)}
                  onBlur={() => setIsCardFlipped(false)}
                  className="h-12 bg-secondary/50 font-mono"
                  maxLength={4}
                />
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary/20 via-background to-accent/20 items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 4 + 2,
                height: Math.random() * 4 + 2,
                backgroundColor: i % 2 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--accent))',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0.3,
              }}
              animate={{
                y: [0, -50, 0],
                x: [0, Math.random() * 30 - 15, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: Math.random() * 5 + 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 p-12 text-center max-w-md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow"
          >
            <span className="text-white font-display font-bold text-4xl">R</span>
          </motion.div>

          <h2 className="text-3xl font-display font-bold mb-4">
            Plano <span className="gradient-text">{selectedPlan}</span>
          </h2>
          <p className="text-muted-foreground">
            Você está a poucos passos de transformar sua rotina com a ajuda da inteligência artificial.
          </p>

          {/* Progress Steps */}
          <div className="mt-12 space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  currentStep === step.id
                    ? 'bg-primary/20 border border-primary/30'
                    : currentStep > step.id
                    ? 'bg-accent/10'
                    : 'bg-secondary/50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep > step.id
                      ? 'bg-accent text-white'
                      : currentStep === step.id
                      ? 'bg-primary text-white'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`font-medium ${
                    currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step.title}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 relative">
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
          onClick={() => currentStep === 1 ? navigate('/landing') : handleBack()}
          className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {currentStep === 1 ? 'Voltar' : 'Anterior'}
        </motion.button>

        <div className="max-w-md w-full mx-auto mt-12 lg:mt-0">
          {/* Mobile Steps Indicator */}
          <div className="lg:hidden mb-8">
            <div className="flex justify-center gap-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentStep >= step.id ? 'bg-primary' : 'bg-secondary'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Header */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-display font-bold mb-2">
              {steps[currentStep - 1].title}
            </h1>
            <p className="text-muted-foreground">
              Passo {currentStep} de {steps.length}
            </p>
          </motion.div>

          {/* Form Steps */}
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 h-12"
              >
                Voltar
              </Button>
            )}
            <Button
              onClick={currentStep === 4 ? handleSubmit : handleNext}
              disabled={isLoading}
              className="flex-1 h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-glow"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                />
              ) : currentStep === 4 ? (
                'Criar Conta'
              ) : (
                <>
                  Continuar
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Login Link */}
          <p className="mt-8 text-center text-muted-foreground">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
