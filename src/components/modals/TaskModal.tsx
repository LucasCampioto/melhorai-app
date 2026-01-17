import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ListTodo, Clock, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Task, Objective } from '@/types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  task?: Task | null;
  objectives: Objective[];
  defaultObjectiveId?: string;
}

export function TaskModal({ isOpen, onClose, onSave, task, objectives, defaultObjectiveId }: TaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objectiveId: defaultObjectiveId || objectives[0]?.id || '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '09:00',
    durationMinutes: 60,
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        objectiveId: task.objectiveId,
        scheduledDate: task.scheduledDate.toISOString().split('T')[0],
        scheduledTime: task.scheduledTime,
        durationMinutes: task.durationMinutes,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        objectiveId: defaultObjectiveId || objectives[0]?.id || '',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '09:00',
        durationMinutes: 60,
      });
    }
  }, [task, isOpen, defaultObjectiveId, objectives]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...task,
      ...formData,
      scheduledDate: new Date(formData.scheduledDate),
    });
    onClose();
  };

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
                  <ListTodo className="h-6 w-6 text-primary" />
                  {task ? 'Editar Tarefa' : 'Nova Tarefa'}
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
                    placeholder="Ex: Estudar capítulo 3"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva a tarefa..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objective">Objetivo</Label>
                  <select
                    id="objective"
                    value={formData.objectiveId}
                    onChange={(e) => setFormData({ ...formData, objectiveId: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-glass-border bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  >
                    {objectives.map((obj) => (
                      <option key={obj.id} value={obj.id}>
                        {obj.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate">Data</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="scheduledDate"
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduledTime">Horário</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="scheduledTime"
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (minutos)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="duration"
                      type="number"
                      min={5}
                      step={5}
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="glass" onClick={onClose} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" variant="futuristic" className="flex-1">
                    {task ? 'Salvar' : 'Criar Tarefa'}
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
