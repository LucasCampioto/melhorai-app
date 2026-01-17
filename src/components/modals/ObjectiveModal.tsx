import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Objective } from '@/types';

interface ObjectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (objective: Partial<Objective>) => void;
  objective?: Objective | null;
}

export function ObjectiveModal({ isOpen, onClose, onSave, objective }: ObjectiveModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'study' as Objective['category'],
    totalHours: 40,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    if (objective) {
      setFormData({
        title: objective.title,
        description: objective.description,
        category: objective.category,
        totalHours: objective.totalHours,
        startDate: objective.startDate.toISOString().split('T')[0],
        endDate: objective.endDate.toISOString().split('T')[0],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'study',
        totalHours: 40,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    }
  }, [objective, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...objective,
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
    });
    onClose();
  };

  const categories = [
    { value: 'study', label: '📚 Estudo', color: 'from-primary to-accent' },
    { value: 'training', label: '💪 Treino', color: 'from-emerald-500 to-teal-400' },
    { value: 'health', label: '❤️ Saúde', color: 'from-rose-500 to-pink-400' },
    { value: 'work', label: '💼 Trabalho', color: 'from-violet-500 to-purple-400' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg z-50"
          >
            <div className="glass-card p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                  <Target className="h-6 w-6 text-primary" />
                  {objective ? 'Editar Objetivo' : 'Novo Objetivo'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Aprender React Avançado"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva seu objetivo..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat.value as Objective['category'] })}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          formData.category === cat.value
                            ? 'border-primary bg-primary/10'
                            : 'border-glass-border hover:border-primary/50'
                        }`}
                      >
                        <span className="text-sm font-medium">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalHours">Horas Totais</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="totalHours"
                      type="number"
                      min={1}
                      value={formData.totalHours}
                      onChange={(e) => setFormData({ ...formData, totalHours: parseInt(e.target.value) || 0 })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data Início</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data Fim</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="glass" onClick={onClose} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" variant="futuristic" className="flex-1">
                    {objective ? 'Salvar' : 'Criar Objetivo'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
