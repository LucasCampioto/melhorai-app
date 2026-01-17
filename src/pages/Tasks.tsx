import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Clock, CheckCircle2, Edit2, MoreVertical, ListTodo, Trash2, Plus, Undo2, Target, Calendar } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { mockTasks, mockObjectives, formatDuration, formatTime } from '@/lib/mockData';
import { Task } from '@/types';
import { TaskModal } from '@/components/modals/TaskModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const TaskCard = ({ 
  task, 
  index,
  onToggleTimer,
  onComplete,
  onUncomplete,
  onEdit,
  onDelete,
  timerSeconds,
  objectives
}: { 
  task: Task; 
  index: number;
  onToggleTimer: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onUncomplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  timerSeconds: number;
  objectives: any[];
}) => {
  // Calcular minutos decorridos do timer atual (se estiver rodando)
  const currentTimerMinutes = task.isTimerRunning && task.timerStartedAt
    ? Math.floor((Date.now() - new Date(task.timerStartedAt).getTime()) / 60000)
    : 0;
  
  // Progresso considera completedMinutes + tempo do timer atual
  // Se timer está rodando, usar completedMinutesAtStart como base para evitar duplicação
  const baseMinutes = task.isTimerRunning && (task as any).completedMinutesAtStart !== undefined
    ? (task as any).completedMinutesAtStart
    : task.completedMinutes;
  const totalCompletedMinutes = baseMinutes + currentTimerMinutes;
  const progress = (totalCompletedMinutes / task.durationMinutes) * 100;
  const objective = objectives.find(o => o.id === task.objectiveId);
  
  // Calcular data/hora de início e fim
  const startDate = new Date(task.scheduledDate);
  // Definir horário agendado
  const [hours, minutes] = task.scheduledTime.split(':').map(Number);
  startDate.setHours(hours, minutes, 0, 0);
  
  // Calcular data/hora de fim (início + duração)
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + task.durationMinutes);
  
  // Formatar data completa
  const formatDateTime = (date: Date) => {
    return date.toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Formatar apenas data (sem hora)
  const formatDateOnly = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className={`glass-card-hover p-4 ${task.status === 'completed' ? 'opacity-60' : ''} h-full flex flex-col`}
    >
      {/* Header com título e menu */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm line-clamp-2 ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </h3>
              {objective && (
            <div className="flex items-center gap-1 mt-1">
              <Target className="h-3 w-3 text-primary flex-shrink-0" />
              <span className="text-xs text-primary font-medium truncate">{objective.title}</span>
                </div>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
            <button className="p-1 rounded-lg hover:bg-secondary transition-colors flex-shrink-0">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                {task.status === 'completed' ? (
                  <DropdownMenuItem onClick={() => onUncomplete(task.id)}>
                    <Undo2 className="h-4 w-4 mr-2" />
                    Desfazer Conclusão
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onComplete(task.id)}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Concluir
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

      {/* Descrição */}
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-shrink-0">
        {task.description}
      </p>

      {/* Datas */}
      <div className="space-y-2 mb-3 flex-shrink-0 p-2 rounded-lg bg-secondary/30">
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-muted-foreground text-[10px] mb-0.5">Data de Início</div>
            <div className="font-medium">{formatDateOnly(startDate)}</div>
            <div className="text-muted-foreground text-[10px] mt-0.5">{task.scheduledTime}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-muted-foreground text-[10px] mb-0.5">Data de Fim</div>
            <div className="font-medium">{formatDateOnly(endDate)}</div>
            <div className="text-muted-foreground text-[10px] mt-0.5">
              {endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* Timer Display Compacto */}
      <div className="mb-3 flex-shrink-0">
        <div className={`relative h-12 w-12 rounded-xl flex items-center justify-center ${
          task.isTimerRunning 
            ? 'bg-gradient-to-br from-primary to-accent animate-glow' 
            : task.status === 'completed'
            ? 'bg-emerald-100'
            : 'bg-secondary'
        }`}>
          {task.isTimerRunning && (
            <div className="absolute inset-0 rounded-xl animate-pulse-ring border-2 border-primary/50" />
          )}
          {task.status === 'completed' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <span className={`font-display font-bold text-xs ${task.isTimerRunning ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
              {task.isTimerRunning ? formatTime(timerSeconds) : formatDuration(task.durationMinutes)}
            </span>
          )}
        </div>
      </div>

          {/* Progress Bar */}
      <div className="space-y-1.5 mb-3 flex-shrink-0">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
                {task.scheduledTime}
              </span>
              <span className="font-medium">
                {totalCompletedMinutes}/{task.durationMinutes} min
              </span>
            </div>
        <div className="progress-bar h-1.5">
              <motion.div 
                className="progress-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Actions */}
      <div className="flex gap-2 mt-auto flex-shrink-0">
            {task.status !== 'completed' && (
              <>
                <Button
                  variant={task.isTimerRunning ? 'destructive' : 'timer'}
                  size="sm"
                  onClick={() => onToggleTimer(task.id)}
              className="flex-1 text-xs h-8"
                >
                  {task.isTimerRunning ? (
                    <>
                  <Pause className="h-3 w-3" />
                  <span className="ml-1">Pausar</span>
                    </>
                  ) : (
                    <>
                  <Play className="h-3 w-3" />
                  <span className="ml-1">Iniciar</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => onComplete(task.id)}
              className="h-8 px-2"
                >
              <CheckCircle2 className="h-3 w-3" />
                </Button>
              </>
            )}
            {task.status === 'completed' && (
              <Button
                variant="glass"
                size="sm"
                onClick={() => onUncomplete(task.id)}
            className="flex-1 text-xs h-8"
              >
            <Undo2 className="h-3 w-3 mr-1" />
                Desfazer
              </Button>
            )}
      </div>
    </motion.div>
  );
};

export default function Tasks() {
  const [searchParams] = useSearchParams();
  const objectiveIdParam = searchParams.get('objectiveId');
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [objectives, setObjectives] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [objectiveFilter, setObjectiveFilter] = useState<string | null>(objectiveIdParam);
  const [timerSeconds, setTimerSeconds] = useState<{ [key: string]: number }>({});
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Carregar objetivos do localStorage
  useEffect(() => {
    try {
      const storedObjectives = localStorage.getItem('objectives');
      if (storedObjectives) {
        const parsed = JSON.parse(storedObjectives);
        setObjectives(parsed);
      } else {
        setObjectives(mockObjectives);
      }
    } catch (error) {
      console.error('Erro ao carregar objetivos do localStorage:', error);
      setObjectives(mockObjectives);
    }
  }, []);

  // Carregar tarefas do localStorage ao montar o componente
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        const parsed = JSON.parse(storedTasks);
        // Converter datas de string para Date e preservar completedMinutesAtStart
        const tasksWithDates = parsed.map((task: any) => ({
          ...task,
          scheduledDate: new Date(task.scheduledDate),
          timerStartedAt: task.timerStartedAt ? new Date(task.timerStartedAt) : undefined,
          // Preservar completedMinutesAtStart se existir (campo extra não na interface)
          completedMinutesAtStart: task.completedMinutesAtStart !== undefined ? task.completedMinutesAtStart : undefined,
        }));
        // #region agent log
        const tasksWithTimer = tasksWithDates.filter((t: any) => t.isTimerRunning || t.completedMinutesAtStart !== undefined);
        fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Tasks.tsx:220',message:'LOADED tasks from localStorage',data:{count:tasksWithDates.length,tasksWithTimer:tasksWithTimer.map((t:any)=>({id:t.id,isTimerRunning:t.isTimerRunning,completedMinutes:t.completedMinutes,completedMinutesAtStart:t.completedMinutesAtStart})),objectiveFilter:objectiveIdParam},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'K'})}).catch(()=>{});
        // #endregion
        setTasks(tasksWithDates);
      } else {
        // Se não houver dados no localStorage, usar mockTasks
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Tasks.tsx:227',message:'NO tasks in localStorage, using mock',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'K'})}).catch(()=>{});
        // #endregion
        setTasks(mockTasks);
      }
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Tasks.tsx:231',message:'ERROR loading tasks',data:{error:error instanceof Error ? error.message : 'Unknown error'},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'K'})}).catch(()=>{});
      // #endregion
      console.error('Erro ao carregar tarefas do localStorage:', error);
      setTasks(mockTasks);
    }
  }, []);

  // Salvar tarefas no localStorage sempre que mudarem
  useEffect(() => {
    if (tasks.length > 0) {
      try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error('Erro ao salvar tarefas no localStorage:', error);
      }
    }
  }, [tasks]);

  // Update objective filter when URL param changes
  useEffect(() => {
    setObjectiveFilter(objectiveIdParam);
  }, [objectiveIdParam]);

  // Timer effect - incrementa timerSeconds para exibição visual e atualiza completedMinutes periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        const updated = { ...prev };
        tasks.forEach(task => {
          if (task.isTimerRunning && task.timerStartedAt) {
            // Calcular segundos decorridos desde timerStartedAt
            const elapsedMs = Date.now() - new Date(task.timerStartedAt).getTime();
            updated[task.id] = Math.floor(elapsedMs / 1000);
          } else if (task.isTimerRunning) {
            // Fallback se não tiver timerStartedAt
            updated[task.id] = (updated[task.id] || 0) + 1;
          }
        });
        return updated;
      });

      // Atualizar completedMinutes a cada minuto enquanto timer está rodando
      setTasks(prev => {
        let needsUpdate = false;
        const updated = prev.map(task => {
          if (task.isTimerRunning && task.timerStartedAt) {
            const elapsedMs = Date.now() - new Date(task.timerStartedAt).getTime();
            const elapsedMinutes = Math.floor(elapsedMs / 60000);
            
            if (elapsedMinutes > 0) {
              // Usar completedMinutesAtStart como base para evitar duplicação
              const baseMinutes = (task as any).completedMinutesAtStart ?? task.completedMinutes;
              const shouldHaveMinutes = Math.min(baseMinutes + elapsedMinutes, task.durationMinutes);
              
              // Só atualizar se mudou
              if (shouldHaveMinutes !== task.completedMinutes) {
                needsUpdate = true;
                
                // #region agent log
                if (elapsedMinutes % 5 === 0) { // Log a cada 5 minutos para não poluir
                  fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Tasks.tsx:342',message:'UPDATING completedMinutes during timer',data:{taskId:task.id,elapsedMinutes,baseMinutes,oldCompletedMinutes:task.completedMinutes,newCompletedMinutes:shouldHaveMinutes,completedMinutesAtStart:(task as any).completedMinutesAtStart},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-timer',hypothesisId:'N'})}).catch(()=>{});
                }
                // #endregion
                
                return {
                  ...task,
                  completedMinutes: shouldHaveMinutes,
                  // PRESERVAR completedMinutesAtStart durante atualizações periódicas
                  completedMinutesAtStart: (task as any).completedMinutesAtStart ?? task.completedMinutes,
                };
              }
            }
          }
          return task;
        });
        
        if (needsUpdate) {
          try {
            localStorage.setItem('tasks', JSON.stringify(updated));
            window.dispatchEvent(new Event('tasksUpdated'));
            
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Tasks.tsx:373',message:'PERIODIC UPDATE saved to localStorage',data:{updatedTasksCount:updated.filter(t => t.isTimerRunning).length},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-timer',hypothesisId:'N'})}).catch(()=>{});
            // #endregion
          } catch (error) {
            console.error('Erro ao salvar tarefas no localStorage:', error);
          }
        }
        
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks]);

  const handleToggleTimer = (taskId: string) => {
    // #region agent log
    const taskBefore = tasks.find(t => t.id === taskId);
    fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Tasks.tsx:389',message:'handleToggleTimer ENTRY',data:{taskId,taskBefore:taskBefore ? {isTimerRunning:taskBefore.isTimerRunning,completedMinutes:taskBefore.completedMinutes,timerStartedAt:taskBefore.timerStartedAt?.toISOString()} : null},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-timer',hypothesisId:'N'})}).catch(()=>{});
    // #endregion
    
    setTasks(prev => {
      const updated = prev.map(task => {
        if (task.id === taskId) {
          const wasRunning = task.isTimerRunning;
          
          if (wasRunning) {
            // Timer está sendo pausado - calcular e salvar tempo acumulado
            if (task.timerStartedAt) {
              const elapsedMs = Date.now() - new Date(task.timerStartedAt).getTime();
              const elapsedMinutes = Math.floor(elapsedMs / 60000);
              // Usar completedMinutesAtStart se existir, senão usar completedMinutes atual
              const baseMinutes = (task as any).completedMinutesAtStart ?? task.completedMinutes;
              const newCompletedMinutes = Math.min(baseMinutes + elapsedMinutes, task.durationMinutes);
              
              // #region agent log
              fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Tasks.tsx:397',message:'PAUSING timer',data:{taskId,wasRunning,elapsedMs,elapsedMinutes,baseMinutes,oldCompletedMinutes:task.completedMinutes,newCompletedMinutes},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-timer',hypothesisId:'N'})}).catch(()=>{});
              // #endregion
              
              return {
                ...task,
                isTimerRunning: false,
                completedMinutes: newCompletedMinutes,
                timerStartedAt: undefined,
                completedMinutesAtStart: undefined, // Limpar após salvar
              };
            } else {
              // Fallback se não tiver timerStartedAt
              const elapsedSeconds = timerSeconds[task.id] || 0;
              const elapsedMinutes = Math.floor(elapsedSeconds / 60);
              const baseMinutes = (task as any).completedMinutesAtStart ?? task.completedMinutes;
              const newCompletedMinutes = Math.min(baseMinutes + elapsedMinutes, task.durationMinutes);
              
              // #region agent log
              fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Tasks.tsx:409',message:'PAUSING timer (fallback)',data:{taskId,elapsedSeconds,elapsedMinutes,baseMinutes,oldCompletedMinutes:task.completedMinutes,newCompletedMinutes},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-timer',hypothesisId:'N'})}).catch(()=>{});
              // #endregion
              
              return {
                ...task,
                isTimerRunning: false,
                completedMinutes: newCompletedMinutes,
                timerStartedAt: undefined,
                completedMinutesAtStart: undefined,
              };
            }
          } else {
            // Timer está sendo iniciado - salvar completedMinutes atual como referência
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Tasks.tsx:420',message:'STARTING timer',data:{taskId,currentCompletedMinutes:task.completedMinutes,durationMinutes:task.durationMinutes},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-timer',hypothesisId:'N'})}).catch(()=>{});
            // #endregion
            
            return {
              ...task,
              isTimerRunning: true,
              status: 'in-progress',
              timerStartedAt: new Date(),
              completedMinutesAtStart: task.completedMinutes, // Salvar valor inicial
            };
          }
        }
        // Stop other timers e salvar tempo deles também
        if (task.isTimerRunning) {
          if (task.timerStartedAt) {
            const elapsedMs = Date.now() - new Date(task.timerStartedAt).getTime();
            const elapsedMinutes = Math.floor(elapsedMs / 60000);
            const baseMinutes = (task as any).completedMinutesAtStart ?? task.completedMinutes;
            const newCompletedMinutes = Math.min(baseMinutes + elapsedMinutes, task.durationMinutes);
            
            return {
              ...task,
              isTimerRunning: false,
              completedMinutes: newCompletedMinutes,
              timerStartedAt: undefined,
              completedMinutesAtStart: undefined,
            };
          }
          return {
            ...task,
            isTimerRunning: false,
            timerStartedAt: undefined,
            completedMinutesAtStart: undefined,
          };
        }
        return task;
      });
      
      // Salvar no localStorage
      try {
        const taskAfter = updated.find(t => t.id === taskId);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Tasks.tsx:448',message:'SAVING to localStorage',data:{taskId,taskAfter:taskAfter ? {isTimerRunning:taskAfter.isTimerRunning,completedMinutes:taskAfter.completedMinutes,timerStartedAt:taskAfter.timerStartedAt?.toISOString(),completedMinutesAtStart:(taskAfter as any).completedMinutesAtStart} : null,allTasksCount:updated.length},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-timer',hypothesisId:'N'})}).catch(()=>{});
        // #endregion
        
        localStorage.setItem('tasks', JSON.stringify(updated));
        // Disparar evento para atualizar Dashboard
        window.dispatchEvent(new Event('tasksUpdated'));
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Tasks.tsx:456',message:'SAVED to localStorage and dispatched event',data:{taskId},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-timer',hypothesisId:'N'})}).catch(()=>{});
        // #endregion
      } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Tasks.tsx:460',message:'ERROR saving to localStorage',data:{taskId,error:error instanceof Error ? error.message : 'Unknown error'},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-timer',hypothesisId:'N'})}).catch(()=>{});
        // #endregion
        console.error('Erro ao salvar tarefas no localStorage:', error);
      }
      
      return updated;
    });
    
    // Resetar timerSeconds quando parar o timer
    setTimerSeconds(prev => {
      const updated = { ...prev };
      if (tasks.find(t => t.id === taskId)?.isTimerRunning) {
        updated[taskId] = 0;
      }
      return updated;
    });
  };

  const handleComplete = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: 'completed',
          isTimerRunning: false,
          completedMinutes: task.durationMinutes,
        };
      }
      return task;
    }));
  };

  const handleUncomplete = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: 'pending',
          completedMinutes: 0,
        };
      }
      return task;
    }));
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDelete = (taskId: string) => {
    // Encontrar a tarefa a ser deletada
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    // Se for uma tarefa recorrente, deletar todas as ocorrências com o mesmo título, descrição, horário e objetivo
    setTasks(prev => prev.filter(task => {
      const sameType = task.title === taskToDelete.title &&
                       task.description === taskToDelete.description &&
                       task.scheduledTime === taskToDelete.scheduledTime &&
                       task.objectiveId === taskToDelete.objectiveId;
      return !sameType;
    }));
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id ? { ...task, ...taskData } : task
      ));
    } else {
      const newTask: Task = {
        id: `t${Date.now()}`,
        objectiveId: taskData.objectiveId || objectiveFilter || mockObjectives[0]?.id,
        title: taskData.title || '',
        description: taskData.description || '',
        scheduledDate: taskData.scheduledDate || new Date(),
        scheduledTime: taskData.scheduledTime || '09:00',
        durationMinutes: taskData.durationMinutes || 60,
        completedMinutes: 0,
        status: 'pending',
        isTimerRunning: false,
      };
      setTasks(prev => [...prev, newTask]);
    }
    setEditingTask(null);
  };

  const handleOpenNewTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  // Agrupar tarefas por tipo (título + descrição + horário + objetivo) para mostrar apenas uma instância de cada tarefa recorrente
  const getUniqueTaskKey = (task: Task) => {
    return `${task.title}-${task.description}-${task.scheduledTime}-${task.objectiveId}`;
  };

  // Criar um mapa para manter apenas a primeira ocorrência de cada tipo de tarefa
  const uniqueTasksMap = new Map<string, Task>();
  tasks.forEach(task => {
    const key = getUniqueTaskKey(task);
    if (!uniqueTasksMap.has(key)) {
      // Manter a primeira tarefa encontrada (ou priorizar tarefas em progresso/concluídas)
      uniqueTasksMap.set(key, task);
    } else {
      // Se já existe, priorizar tarefas com status diferente de 'pending'
      const existing = uniqueTasksMap.get(key)!;
      if (task.status !== 'pending' && existing.status === 'pending') {
        uniqueTasksMap.set(key, task);
      } else if (task.status === 'completed' && existing.status !== 'completed') {
        uniqueTasksMap.set(key, task);
      }
    }
  });

  // Converter o mapa de volta para array
  const uniqueTasks = Array.from(uniqueTasksMap.values());

  // Aplicar filtros de status e objetivo nas tarefas únicas
  let filteredTasks = filter === 'all' 
    ? uniqueTasks 
    : uniqueTasks.filter(t => t.status === filter);

  if (objectiveFilter) {
    filteredTasks = filteredTasks.filter(t => t.objectiveId === objectiveFilter);
  }

  // Para o timer ativo, buscar em todas as tarefas (não apenas únicas) para garantir que funcione corretamente
  const activeTimer = tasks.find(t => t.isTimerRunning);
  const currentObjective = objectiveFilter 
    ? objectives.find(o => o.id === objectiveFilter) 
    : null;

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
              <ListTodo className="inline-block mr-3 h-8 w-8 text-primary" />
              Tarefas
            </h1>
            <p className="text-muted-foreground mt-2">
              {currentObjective 
                ? `Tarefas do objetivo: ${currentObjective.title}`
                : 'Gerencie suas tarefas e acompanhe seu tempo'
              }
            </p>
          </div>
          <Button variant="futuristic" onClick={handleOpenNewTask}>
            <Plus className="h-5 w-5" />
            Nova Tarefa
          </Button>
        </motion.div>

        {/* Objective Filter Info */}
        {currentObjective && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-primary" />
              <span className="font-medium">{currentObjective.title}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setObjectiveFilter(null)}
            >
              Ver Todas
            </Button>
          </motion.div>
        )}

        {/* Active Timer Banner */}
        <AnimatePresence>
          {activeTimer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent shadow-neon flex items-center justify-center animate-glow">
                    <Play className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Timer ativo</p>
                    <p className="font-semibold">{activeTimer.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl font-bold gradient-text timer-display">
                    {formatTime(timerSeconds[activeTimer.id] || 0)}
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleToggleTimer(activeTimer.id)}
                    className="mt-2"
                  >
                    <Square className="h-4 w-4 mr-1" />
                    Parar
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters and Counters */}
        <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2"
        >
          {[
            { value: 'all', label: 'Todas' },
            { value: 'pending', label: 'Pendentes' },
            { value: 'in-progress', label: 'Em Progresso' },
            { value: 'completed', label: 'Concluídas' },
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

          {/* Task Counters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-4 text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold">{uniqueTasks.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Filtradas:</span>
              <span className="font-semibold">{filteredTasks.length}</span>
            </div>
          </motion.div>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onToggleTimer={handleToggleTimer}
                onComplete={handleComplete}
                onUncomplete={handleUncomplete}
                onEdit={handleEdit}
                onDelete={handleDelete}
                timerSeconds={timerSeconds[task.id] || 0}
                objectives={objectives}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <ListTodo className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma tarefa encontrada</h3>
            <p className="text-muted-foreground mb-6">
              {objectiveFilter 
                ? 'Este objetivo ainda não tem tarefas'
                : 'Suas tarefas aparecerão aqui'
              }
            </p>
            <Button variant="futuristic" onClick={handleOpenNewTask}>
              <Plus className="h-5 w-5" />
              Criar Tarefa
            </Button>
          </motion.div>
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        task={editingTask}
        objectives={objectives}
        defaultObjectiveId={objectiveFilter || undefined}
      />
    </MainLayout>
  );
}
