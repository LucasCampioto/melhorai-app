import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Target, Clock, Calendar, TrendingUp, MoreVertical, Edit2, Trash2, ListTodo } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { mockObjectives, getCategoryColor, getCategoryIcon, getStatusColor, getStatusLabel } from '@/lib/mockData';
import { Objective } from '@/types';
import { ObjectiveModal } from '@/components/modals/ObjectiveModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ObjectiveCard = ({ 
  objective, 
  index,
  onEdit,
  onDelete,
  onViewTasks,
  tasks
}: { 
  objective: Objective; 
  index: number;
  onEdit: (objective: Objective) => void;
  onDelete: (objectiveId: string) => void;
  onViewTasks: (objectiveId: string) => void;
  tasks: any[];
}) => {
  const progress = (objective.completedHours / objective.totalHours) * 100;
  const daysRemaining = Math.ceil((objective.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const taskCount = tasks.filter(t => t.objectiveId === objective.id).length;
  
  return (
    <motion.div
      className="glass-card-hover overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      {/* Header with gradient */}
      <div className={`h-2 bg-gradient-to-r ${getCategoryColor(objective.category)}`} />
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getCategoryIcon(objective.category)}</span>
            <div>
              <h3 className="font-display font-semibold text-lg">{objective.title}</h3>
              <span className={`text-sm font-medium ${getStatusColor(objective.status)}`}>
                {getStatusLabel(objective.status)}
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                <MoreVertical className="h-5 w-5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(objective)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(objective.id)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-muted-foreground text-sm mb-6 line-clamp-2">
          {objective.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="text-center p-3 rounded-xl bg-secondary/50">
            <Clock className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-semibold">{objective.totalHours}h</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-secondary/50">
            <TrendingUp className="h-4 w-4 mx-auto text-accent mb-1" />
            <p className="text-xs text-muted-foreground">Feito</p>
            <p className="font-semibold">{objective.completedHours}h</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-secondary/50">
            <Calendar className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">Restam</p>
            <p className="font-semibold">{daysRemaining}d</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-secondary/50">
            <ListTodo className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Tarefas</p>
            <p className="font-semibold">{taskCount}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium gradient-text">{progress.toFixed(1)}%</span>
          </div>
          <div className="progress-bar">
            <motion.div 
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <Button variant="glass" className="flex-1" size="sm" onClick={() => onEdit(objective)}>
            <Edit2 className="h-4 w-4" />
            Editar
          </Button>
          <Button variant="futuristic" className="flex-1" size="sm" onClick={() => onViewTasks(objective.id)}>
            Ver Tarefas
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default function Objectives() {
  const navigate = useNavigate();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'study' | 'training' | 'health' | 'work'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [objectiveToDelete, setObjectiveToDelete] = useState<{ id: string; title: string } | null>(null);

  // Carregar objetivos do localStorage ao montar o componente
  useEffect(() => {
    try {
      const storedObjectives = localStorage.getItem('objectives');
      if (storedObjectives) {
        const parsed = JSON.parse(storedObjectives);
        // Converter datas de string para Date
        const objectivesWithDates = parsed.map((obj: any) => ({
          ...obj,
          startDate: new Date(obj.startDate),
          endDate: new Date(obj.endDate),
          createdAt: new Date(obj.createdAt),
        }));
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Objectives.tsx:148',message:'LOADED objectives from localStorage',data:{count:objectivesWithDates.length,ids:objectivesWithDates.map((o:any)=>o.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'J'})}).catch(()=>{});
        // #endregion
        setObjectives(objectivesWithDates);
      } else {
        // Se não houver dados no localStorage, usar mockObjectives
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Objectives.tsx:152',message:'NO objectives in localStorage, using mock',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'J'})}).catch(()=>{});
        // #endregion
        setObjectives(mockObjectives);
      }
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Objectives.tsx:156',message:'ERROR loading objectives',data:{error:error instanceof Error ? error.message : 'Unknown error'},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'J'})}).catch(()=>{});
      // #endregion
      console.error('Erro ao carregar objetivos do localStorage:', error);
      setObjectives(mockObjectives);
    }
  }, []);

  // Carregar tarefas do localStorage
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        const parsed = JSON.parse(storedTasks);
        setTasks(parsed);
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas do localStorage:', error);
    }
  }, []);

  // Salvar objetivos no localStorage sempre que mudarem
  useEffect(() => {
    try {
      localStorage.setItem('objectives', JSON.stringify(objectives));
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Objectives.tsx:202',message:'SAVED objectives to localStorage',data:{objectivesCount:objectives.length},timestamp:Date.now(),sessionId:'debug-session',runId:'delete-feature',hypothesisId:'M'})}).catch(()=>{});
      // #endregion
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Objectives.tsx:207',message:'ERROR saving objectives to localStorage',data:{error:error instanceof Error ? error.message : 'Unknown error'},timestamp:Date.now(),sessionId:'debug-session',runId:'delete-feature',hypothesisId:'M'})}).catch(()=>{});
      // #endregion
      console.error('Erro ao salvar objetivos no localStorage:', error);
    }
  }, [objectives]);

  const filteredObjectives = filter === 'all' 
    ? objectives 
    : objectives.filter(o => o.category === filter);

  const handleEdit = (objective: Objective) => {
    setEditingObjective(objective);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (objectiveId: string) => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Objectives.tsx:221',message:'handleDeleteClick called',data:{objectiveId,objectivesCount:objectives.length},timestamp:Date.now(),sessionId:'debug-session',runId:'delete-feature',hypothesisId:'M'})}).catch(()=>{});
    // #endregion
    const objective = objectives.find(o => o.id === objectiveId);
    if (objective) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Objectives.tsx:225',message:'Opening delete dialog',data:{objectiveId,objectiveTitle:objective.title},timestamp:Date.now(),sessionId:'debug-session',runId:'delete-feature',hypothesisId:'M'})}).catch(()=>{});
      // #endregion
      setObjectiveToDelete({ id: objectiveId, title: objective.title });
      setDeleteDialogOpen(true);
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Objectives.tsx:230',message:'Objective not found for deletion',data:{objectiveId},timestamp:Date.now(),sessionId:'debug-session',runId:'delete-feature',hypothesisId:'M'})}).catch(()=>{});
      // #endregion
      console.error('Objetivo não encontrado para exclusão:', objectiveId);
    }
  };

  const handleDeleteConfirm = () => {
    if (!objectiveToDelete) return;

    const objectiveId = objectiveToDelete.id;
    const relatedTasksCount = tasks.filter(t => t.objectiveId === objectiveId).length;

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Objectives.tsx:209',message:'DELETE objective initiated',data:{objectiveId,objectiveTitle:objectiveToDelete.title,relatedTasksCount},timestamp:Date.now(),sessionId:'debug-session',runId:'delete-feature',hypothesisId:'M'})}).catch(()=>{});
    // #endregion

    // Remover objetivo
    setObjectives(prev => {
      const updated = prev.filter(o => o.id !== objectiveId);
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Objectives.tsx:215',message:'DELETE objective from state',data:{remainingObjectives:updated.length},timestamp:Date.now(),sessionId:'debug-session',runId:'delete-feature',hypothesisId:'M'})}).catch(()=>{});
      // #endregion
      return updated;
    });

    // Remover tarefas relacionadas do estado e do localStorage
    setTasks(prev => {
      const updated = prev.filter(t => t.objectiveId !== objectiveId);
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Objectives.tsx:222',message:'DELETE tasks from state',data:{remainingTasks:updated.length,deletedTasksCount:prev.length - updated.length},timestamp:Date.now(),sessionId:'debug-session',runId:'delete-feature',hypothesisId:'M'})}).catch(()=>{});
      // #endregion
      
      // Salvar no localStorage
      try {
        localStorage.setItem('tasks', JSON.stringify(updated));
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Objectives.tsx:228',message:'DELETE tasks saved to localStorage',data:{tasksInStorage:updated.length},timestamp:Date.now(),sessionId:'debug-session',runId:'delete-feature',hypothesisId:'M'})}).catch(()=>{});
        // #endregion
        
        // Disparar evento customizado para atualizar o calendário
        window.dispatchEvent(new Event('tasksUpdated'));
      } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Objectives.tsx:231',message:'ERROR saving tasks to localStorage',data:{error:error instanceof Error ? error.message : 'Unknown error'},timestamp:Date.now(),sessionId:'debug-session',runId:'delete-feature',hypothesisId:'M'})}).catch(()=>{});
        // #endregion
        console.error('Erro ao remover tarefas do localStorage:', error);
      }
      
      return updated;
    });

    // Fechar dialog
    setDeleteDialogOpen(false);
    setObjectiveToDelete(null);
  };

  const handleViewTasks = (objectiveId: string) => {
    navigate(`/tasks?objectiveId=${objectiveId}`);
  };

  const handleSaveObjective = (objectiveData: Partial<Objective>) => {
    if (editingObjective) {
      setObjectives(prev => prev.map(obj => 
        obj.id === editingObjective.id ? { ...obj, ...objectiveData } : obj
      ));
    } else {
      const newObjective: Objective = {
        id: `obj${Date.now()}`,
        title: objectiveData.title || '',
        description: objectiveData.description || '',
        category: objectiveData.category || 'study',
        totalHours: objectiveData.totalHours || 40,
        completedHours: 0,
        startDate: objectiveData.startDate || new Date(),
        endDate: objectiveData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'on-track',
        tasks: [],
        createdAt: new Date(),
      };
      setObjectives(prev => [...prev, newObjective]);
    }
    setEditingObjective(null);
  };

  const handleOpenNewObjective = () => {
    setEditingObjective(null);
    setIsModalOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-display font-bold">
              <Target className="inline-block mr-3 h-8 w-8 text-primary" />
              Meus Objetivos
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie seus objetivos e acompanhe seu progresso
            </p>
          </div>
          <Button variant="futuristic" size="lg" onClick={handleOpenNewObjective}>
            <Plus className="h-5 w-5" />
            Novo Objetivo
          </Button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2"
        >
          {[
            { value: 'all', label: 'Todos' },
            { value: 'study', label: '📚 Estudo' },
            { value: 'training', label: '💪 Treino' },
            { value: 'health', label: '❤️ Saúde' },
            { value: 'work', label: '💼 Trabalho' },
          ].map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? 'default' : 'glass'}
              size="sm"
              onClick={() => setFilter(f.value as any)}
            >
              {f.label}
            </Button>
          ))}
        </motion.div>

        {/* Objectives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredObjectives.map((objective, index) => (
            <ObjectiveCard 
              key={objective.id} 
              objective={objective} 
              index={index}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onViewTasks={handleViewTasks}
              tasks={tasks}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredObjectives.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum objetivo encontrado</h3>
            <p className="text-muted-foreground mb-6">
              Crie seu primeiro objetivo para começar sua jornada
            </p>
            <Button variant="futuristic" onClick={handleOpenNewObjective}>
              <Plus className="h-5 w-5" />
              Criar Objetivo
            </Button>
          </motion.div>
        )}
      </div>

      {/* Objective Modal */}
      <ObjectiveModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingObjective(null);
        }}
        onSave={handleSaveObjective}
        objective={editingObjective}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o objetivo <strong>"{objectiveToDelete?.title}"</strong>?
              <br />
              <br />
              Esta ação também removerá todas as tarefas associadas a este objetivo do calendário e não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setObjectiveToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
