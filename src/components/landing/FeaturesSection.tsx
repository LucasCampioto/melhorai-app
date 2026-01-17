import { motion } from 'framer-motion';
import { 
  Calendar, 
  MessageSquare, 
  Timer, 
  BarChart3, 
  Zap, 
  Shield,
  Sparkles,
  Target
} from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Assistente IA Inteligente',
    description: 'Converse naturalmente e deixe a IA criar um plano personalizado baseado nos seus objetivos e disponibilidade.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Calendar,
    title: 'Integração com Google Calendar',
    description: 'Sincronize automaticamente sua rotina com o Google Calendar e nunca perca um compromisso.',
    gradient: 'from-cyan-500 to-teal-500',
  },
  {
    icon: Timer,
    title: 'Timer Inteligente',
    description: 'Acompanhe o tempo gasto em cada tarefa com precisão e veja seu progresso em tempo real.',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Analítico',
    description: 'Visualize métricas detalhadas do seu progresso com gráficos interativos e insights.',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    icon: Target,
    title: 'Gestão de Objetivos',
    description: 'Defina metas com prazos e horas necessárias. Acompanhe cada objetivo até a conclusão.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Zap,
    title: 'Automação Total',
    description: 'Tarefas recorrentes, lembretes automáticos e ajustes inteligentes no seu cronograma.',
    gradient: 'from-emerald-500 to-green-500',
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      
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
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Funcionalidades</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Tudo que você precisa para{' '}
            <span className="gradient-text">dominar sua rotina</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ferramentas poderosas combinadas com inteligência artificial para maximizar sua produtividade.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="glass-card p-8 h-full transition-all duration-300 group-hover:shadow-glow">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} p-3 mb-6 shadow-lg`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-display font-bold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Line */}
                <div className="mt-6 h-1 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${feature.gradient}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 flex items-center justify-center gap-4"
        >
          <Shield className="w-6 h-6 text-primary" />
          <span className="text-muted-foreground">
            Seus dados estão <span className="text-foreground font-semibold">100% seguros</span> e criptografados
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
