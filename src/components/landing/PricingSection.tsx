import { motion } from 'framer-motion';
import { Check, Sparkles, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Starter',
    icon: Zap,
    price: 'Grátis',
    period: '',
    description: 'Perfeito para começar a organizar sua rotina',
    features: [
      '1 objetivo ativo',
      'Timer básico',
      'Dashboard simplificado',
      'Suporte por email',
      '7 dias de histórico',
    ],
    cta: 'Começar Grátis',
    popular: false,
    gradient: 'from-slate-500 to-slate-600',
  },
  {
    name: 'Pro',
    icon: Crown,
    price: 'R$ 29',
    period: '/mês',
    description: 'Para quem leva a produtividade a sério',
    features: [
      'Objetivos ilimitados',
      'Assistente IA completo',
      'Integração Google Calendar',
      'Dashboard avançado',
      'Relatórios semanais',
      'Histórico completo',
      'Suporte prioritário',
    ],
    cta: 'Escolher Pro',
    popular: true,
    gradient: 'from-primary to-accent',
  },
  {
    name: 'Enterprise',
    icon: Sparkles,
    price: 'R$ 99',
    period: '/mês',
    description: 'Solução completa para equipes',
    features: [
      'Tudo do Pro',
      'Até 10 membros da equipe',
      'Objetivos compartilhados',
      'API de integração',
      'Relatórios personalizados',
      'Gerente de sucesso dedicado',
      'SLA garantido',
    ],
    cta: 'Falar com Vendas',
    popular: false,
    gradient: 'from-violet-500 to-purple-600',
  },
];

const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Planos</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Escolha o plano{' '}
            <span className="gradient-text">ideal para você</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comece gratuitamente e evolua conforme sua necessidade. Sem surpresas.
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="relative"
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="px-4 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold shadow-glow">
                    Mais Popular
                  </div>
                </div>
              )}

              <div
                className={`h-full rounded-3xl p-8 transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-b from-primary/10 to-accent/10 border-2 border-primary/30 shadow-glow'
                    : 'glass-card'
                }`}
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.gradient} p-3 mb-6 shadow-lg`}>
                  <plan.icon className="w-full h-full text-white" />
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-display font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-8">
                  <span className="text-4xl md:text-5xl font-display font-bold">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className={`w-full py-6 text-lg font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-glow'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                  onClick={() => navigate('/register', { state: { plan: plan.name } })}
                >
                  {plan.cta}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-4">Garantia de 7 dias • Cancele quando quiser • Sem taxas ocultas</p>
          <div className="flex items-center justify-center gap-8 opacity-50">
            {['VISA', 'Mastercard', 'PIX'].map((method, index) => (
              <span key={index} className="text-sm font-semibold tracking-wider">
                {method}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
