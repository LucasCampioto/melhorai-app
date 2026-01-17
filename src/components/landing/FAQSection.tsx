import { motion } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: 'Como funciona o assistente de IA?',
    answer: 'Nosso assistente conversa com você para entender seus objetivos, disponibilidade e preferências. A partir disso, ele cria um plano personalizado com tarefas distribuídas ao longo da semana, respeitando seu tempo livre.',
  },
  {
    question: 'Posso integrar com meu Google Calendar?',
    answer: 'Sim! Com os planos Pro e Enterprise, você pode sincronizar automaticamente suas tarefas com o Google Calendar. Qualquer alteração será refletida em ambas as plataformas.',
  },
  {
    question: 'E se eu não conseguir completar uma tarefa no dia?',
    answer: 'Sem problemas! O sistema é flexível e permite que você reagende tarefas. A IA também aprende com seus padrões e pode sugerir ajustes no cronograma.',
  },
  {
    question: 'Posso cancelar minha assinatura a qualquer momento?',
    answer: 'Absolutamente! Você pode cancelar sua assinatura quando quiser, sem multas ou taxas. Se cancelar nos primeiros 7 dias, reembolsamos integralmente.',
  },
  {
    question: 'Meus dados estão seguros?',
    answer: 'Sim, levamos segurança muito a sério. Todos os dados são criptografados em trânsito e em repouso. Não vendemos ou compartilhamos suas informações com terceiros.',
  },
  {
    question: 'Preciso de cartão de crédito para começar?',
    answer: 'Não! O plano Starter é 100% gratuito e não requer cartão. Você só precisa fornecer dados de pagamento se decidir fazer upgrade para Pro ou Enterprise.',
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 relative overflow-hidden">
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
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">FAQ</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Perguntas{' '}
            <span className="gradient-text">Frequentes</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Encontre respostas para as dúvidas mais comuns sobre nossa plataforma.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="glass-card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
              >
                <span className="font-semibold text-lg pr-4">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
                </motion.div>
              </button>
              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? 'auto' : 0,
                  opacity: openIndex === index ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-5 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
