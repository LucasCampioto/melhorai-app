import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    product: [
      { label: 'Funcionalidades', href: '#features' },
      { label: 'Planos', href: '#pricing' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Changelog', href: '#' },
    ],
    company: [
      { label: 'Sobre', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Carreiras', href: '#' },
      { label: 'Contato', href: '#' },
    ],
    legal: [
      { label: 'Privacidade', href: '#' },
      { label: 'Termos', href: '#' },
      { label: 'Cookies', href: '#' },
    ],
  };

  const social = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: '#', label: 'Email' },
  ];

  return (
    <footer className="relative border-t border-border bg-card/50">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 mb-4"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                <span className="text-white font-display font-bold text-xl">R</span>
              </div>
              <span className="font-display font-bold text-xl">Routine AI</span>
            </motion.div>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Transforme seus objetivos em realidade com a ajuda da inteligência artificial. 
              Organize sua rotina e alcance suas metas.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {social.map((item, index) => (
                <motion.a
                  key={index}
                  href={item.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-xl bg-secondary hover:bg-primary/20 flex items-center justify-center transition-colors"
                  aria-label={item.label}
                >
                  <item.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-bold mb-4">Produto</h4>
            <ul className="space-y-3">
              {links.product.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold mb-4">Empresa</h4>
            <ul className="space-y-3">
              {links.company.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold mb-4">Legal</h4>
            <ul className="space-y-3">
              {links.legal.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © {currentYear} Melhor.AI. Todos os direitos reservados.
          </p>
          <p className="text-muted-foreground text-sm">
            Feito com 💙 para transformar rotinas
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
