import { motion, AnimatePresence } from 'framer-motion';
import { Wifi } from 'lucide-react';

interface CreditCardAnimationProps {
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCvv: string;
  isFlipped: boolean;
}

const CreditCardAnimation = ({
  cardNumber,
  cardName,
  cardExpiry,
  cardCvv,
  isFlipped,
}: CreditCardAnimationProps) => {
  const formatCardNumber = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ').padEnd(19, '•').slice(0, 19);
  };

  return (
    <div className="perspective-1000 w-full max-w-sm mx-auto">
      <motion.div
        className="relative w-full aspect-[1.586/1] preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of Card */}
        <div
          className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between backface-hidden"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 50%, hsl(270 70% 60%) 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px hsl(var(--primary) / 0.3)',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* Card Header */}
          <div className="flex justify-between items-start">
            <div className="w-12 h-9 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center">
              <div className="w-8 h-6 border-2 border-yellow-600/50 rounded-sm" />
            </div>
            <Wifi className="w-8 h-8 text-white/80 rotate-90" />
          </div>

          {/* Card Number */}
          <div className="text-2xl font-mono text-white tracking-wider">
            <AnimatePresence mode="wait">
              <motion.span
                key={cardNumber}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {formatCardNumber(cardNumber)}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Card Footer */}
          <div className="flex justify-between items-end">
            <div>
              <p className="text-white/60 text-xs uppercase mb-1">Nome do Titular</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={cardName}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white font-medium uppercase tracking-wide text-sm"
                >
                  {cardName || 'SEU NOME AQUI'}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs uppercase mb-1">Validade</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={cardExpiry}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white font-medium font-mono"
                >
                  {cardExpiry || 'MM/AA'}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* Card Brand */}
          <div className="absolute bottom-6 right-6">
            <div className="flex">
              <div className="w-8 h-8 rounded-full bg-red-500 opacity-80" />
              <div className="w-8 h-8 rounded-full bg-yellow-500 opacity-80 -ml-4" />
            </div>
          </div>
        </div>

        {/* Back of Card */}
        <div
          className="absolute inset-0 rounded-2xl flex flex-col backface-hidden"
          style={{
            background: 'linear-gradient(135deg, hsl(220 25% 20%) 0%, hsl(220 25% 15%) 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Magnetic Strip */}
          <div className="w-full h-12 bg-black/80 mt-6" />

          {/* CVV Section */}
          <div className="px-6 mt-6">
            <div className="flex items-center justify-end gap-4">
              <div className="flex-1 h-10 bg-white/90 rounded flex items-center justify-end px-4">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={cardCvv}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-mono text-black text-lg tracking-wider"
                  >
                    {cardCvv || '•••'}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="text-white/60 text-sm">CVV</span>
            </div>
          </div>

          {/* Info */}
          <div className="mt-auto p-6">
            <p className="text-white/40 text-xs leading-relaxed">
              Este cartão é propriedade do banco emissor e deve ser devolvido mediante solicitação.
              O uso está sujeito aos termos do contrato do cartão.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreditCardAnimation;
