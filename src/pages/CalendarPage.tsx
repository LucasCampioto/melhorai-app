import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Play, Pause } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { mockTasks, mockObjectives, formatDuration, getCategoryColor } from '@/lib/mockData';
import { Task } from '@/types';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const getWeekDays = (date: Date) => {
  const week = [];
  const current = new Date(date);
  const day = current.getDay();
  const diff = current.getDate() - day;
  
  for (let i = 0; i < 7; i++) {
    const weekDay = new Date(current);
    weekDay.setDate(diff + i);
    week.push(weekDay);
  }
  return week;
};

const getMonthDays = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  
  // Add days from previous month to fill the first week
  const startOffset = firstDay.getDay();
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, isCurrentMonth: false });
  }
  
  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }
  
  // Add days from next month to complete the grid
  const remaining = 42 - days.length; // 6 rows * 7 days
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
  }
  
  return days;
};

interface TaskEventProps {
  task: Task;
  index: number;
  onToggleTimer: (taskId: string) => void;
  compact?: boolean;
}

const TaskEvent = ({ task, index, onToggleTimer, compact, objectives }: TaskEventProps & { objectives: any[] }) => {
  const objective = objectives.find(o => o.id === task.objectiveId);
  
  // Obter cor da categoria do objetivo, ou usar cor padrão se não houver objetivo
  const categoryColor = objective && objective.category 
    ? getCategoryColor(objective.category)
    : 'from-primary to-accent'; // Cor padrão
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="overflow-hidden rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
    >
      {/* Borda superior colorida baseada na categoria do objetivo */}
      <div className={`h-2 bg-gradient-to-r ${categoryColor}`} />
      
      {/* Conteúdo do card */}
      <div className={`text-sm ${
        compact ? 'p-2' : 'p-3'
      } ${
        task.status === 'completed' 
          ? 'bg-emerald-100 border-x border-b border-emerald-200 text-emerald-800' 
          : task.status === 'in-progress' || task.isTimerRunning
          ? 'bg-gradient-to-r from-primary/10 to-accent/10 border-x border-b border-primary/20'
          : 'bg-secondary border-x border-b border-border'
      }`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={`font-medium truncate ${compact ? 'text-xs' : ''}`}>{task.title}</p>
            {!compact && (
              <>
                <p className="text-xs text-muted-foreground mt-1">
                  {task.scheduledTime} • {formatDuration(task.durationMinutes)}
                </p>
                {objective && (
                  <p className="text-xs text-primary/70 mt-1 truncate">
                    {objective.title}
                  </p>
                )}
              </>
            )}
          </div>
          {task.status !== 'completed' && !compact && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleTimer(task.id);
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                task.isTimerRunning 
                  ? 'bg-destructive/20 hover:bg-destructive/30 text-destructive' 
                  : 'bg-primary/20 hover:bg-primary/30 text-primary'
              }`}
            >
              {task.isTimerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month'>('week');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [objectives, setObjectives] = useState<any[]>([]);

  // Carregar tarefas do localStorage
  const loadTasks = () => {
    try {
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        const parsed = JSON.parse(storedTasks);
        const tasksWithDates = parsed.map((task: any) => ({
          ...task,
          scheduledDate: new Date(task.scheduledDate),
          timerStartedAt: task.timerStartedAt ? new Date(task.timerStartedAt) : undefined,
          // Preservar completedMinutesAtStart se existir (campo extra não na interface)
          completedMinutesAtStart: task.completedMinutesAtStart !== undefined ? task.completedMinutesAtStart : undefined,
        }));
        console.log('📅 Tarefas carregadas do localStorage:', tasksWithDates);
        console.log('📊 Total de tarefas:', tasksWithDates.length);
        setTasks(tasksWithDates);
      } else {
        console.log('📅 Nenhuma tarefa encontrada no localStorage, usando mockTasks:', mockTasks);
        setTasks(mockTasks);
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas do localStorage:', error);
      setTasks(mockTasks);
    }
  };

  useEffect(() => {
    loadTasks();
    
    // Escutar mudanças no localStorage (quando tarefas são removidas de outras páginas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tasks') {
        loadTasks();
      }
    };
    
    // Escutar evento customizado disparado quando tarefas são deletadas
    const handleTasksUpdated = () => {
      loadTasks();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('tasksUpdated', handleTasksUpdated);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tasksUpdated', handleTasksUpdated);
    };
  }, []);

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
  
  const weekDays = getWeekDays(currentDate);
  const monthDays = getMonthDays(currentDate);
  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();

  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toDateString();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dayTasks = tasks.filter(t => {
      // Verificar se scheduledDate é uma string ou Date
      const taskDateRaw = t.scheduledDate;
      const taskDate = taskDateRaw instanceof Date ? new Date(taskDateRaw) : new Date(taskDateRaw);
      taskDate.setHours(0, 0, 0, 0);
      const taskDateStr = taskDate.toDateString();
      
      const matches = taskDateStr === dateStr;
      
      // Log para debug (apenas primeiras 3 tarefas e quando houver matches)
      if (tasks.indexOf(t) < 3 || matches) {
        console.log(`🔍 Comparando datas - Tarefa: ${t.title.substring(0, 30)}, taskDateRaw: ${taskDateRaw}, taskDate: ${taskDate.toISOString()}, dateStr: ${dateStr}, taskDateStr: ${taskDateStr}, matches: ${matches}`);
      }
      
      // Filtrar apenas tarefas do dia e que não sejam passadas
      return matches && taskDate >= today;
    });
    
    // Ordenar por horário
    const sortedTasks = dayTasks.sort((a, b) => {
      const timeA = a.scheduledTime || '00:00';
      const timeB = b.scheduledTime || '00:00';
      return timeA.localeCompare(timeB);
    });
    
    console.log(`📆 Tarefas para ${dateStr}:`, sortedTasks.length, sortedTasks.map(t => ({ title: t.title.substring(0, 30), date: new Date(t.scheduledDate).toDateString() })));
    return sortedTasks;
  };


  const handleToggleTimer = (taskId: string) => {
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
              
              return {
                ...task,
                isTimerRunning: false,
                completedMinutes: newCompletedMinutes,
                timerStartedAt: undefined,
                completedMinutesAtStart: undefined, // Limpar após salvar
              };
            } else {
              return {
                ...task,
                isTimerRunning: false,
                timerStartedAt: undefined,
                completedMinutesAtStart: undefined,
              };
            }
          } else {
            // Timer está sendo iniciado - salvar completedMinutes atual como referência
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
        localStorage.setItem('tasks', JSON.stringify(updated));
        // Disparar evento para atualizar Dashboard
        window.dispatchEvent(new Event('tasksUpdated'));
      } catch (error) {
        console.error('Erro ao salvar tarefas no localStorage:', error);
      }
      return updated;
    });
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
              <CalendarIcon className="inline-block mr-3 h-8 w-8 text-primary" />
              Calendário
            </h1>
            <p className="text-muted-foreground mt-2">
              Visualize e gerencie sua rotina
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={view === 'week' ? 'default' : 'glass'}
              size="sm"
              onClick={() => setView('week')}
            >
              Semana
            </Button>
            <Button
              variant={view === 'month' ? 'default' : 'glass'}
              size="sm"
              onClick={() => setView('month')}
            >
              Mês
            </Button>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between"
        >
          <Button variant="ghost" size="icon" onClick={() => navigate('prev')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-display font-semibold">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => navigate('next')}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </motion.div>

        {/* Week View */}
        {view === 'week' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card overflow-hidden"
          >
            <div className="grid grid-cols-7 border-b border-glass-border">
              {weekDays.map((date, i) => (
                <div
                  key={i}
                  className={`p-4 text-center border-r last:border-r-0 border-glass-border ${
                    isToday(date) ? 'bg-gradient-to-b from-primary/10 to-transparent' : ''
                  }`}
                >
                  <p className="text-sm text-muted-foreground">{DAYS[date.getDay()]}</p>
                  <p className={`text-2xl font-display font-bold mt-1 ${
                    isToday(date) ? 'text-primary' : ''
                  }`}>
                    {date.getDate()}
                  </p>
                  {isToday(date) && (
                    <div className="h-1 w-8 mx-auto mt-2 rounded-full bg-gradient-to-r from-primary to-accent" />
                  )}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 min-h-[400px]">
              {weekDays.map((date, i) => {
                const dayTasks = getTasksForDate(date);
                return (
                  <div
                    key={i}
                    className={`p-3 border-r last:border-r-0 border-glass-border ${
                      isToday(date) ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="space-y-2">
                      {dayTasks.map((task, taskIndex) => {
                        console.log(`🎯 Renderizando tarefa ${taskIndex + 1} para ${date.toDateString()}:`, task);
                        return (
                          <TaskEvent 
                            key={task.id} 
                            task={task} 
                            index={taskIndex} 
                            onToggleTimer={handleToggleTimer}
                            objectives={objectives}
                          />
                        );
                      })}
                      {dayTasks.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          Sem tarefas
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Month View */}
        {view === 'month' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card overflow-hidden"
          >
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-glass-border">
              {DAYS.map((day, i) => (
                <div key={i} className="p-3 text-center border-r last:border-r-0 border-glass-border">
                  <p className="text-sm font-medium text-muted-foreground">{day}</p>
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {monthDays.map(({ date, isCurrentMonth }, i) => {
                const dayTasks = getTasksForDate(date);
                const today = isToday(date);
                
                return (
                  <div
                    key={i}
                    className={`min-h-[100px] p-2 border-r border-b last:border-r-0 border-glass-border transition-colors ${
                      !isCurrentMonth ? 'bg-muted/30' : ''
                    } ${today ? 'bg-primary/5' : ''}`}
                  >
                    <p className={`text-sm font-medium mb-1 ${
                      !isCurrentMonth ? 'text-muted-foreground/50' : ''
                    } ${today ? 'text-primary font-bold' : ''}`}>
                      {date.getDate()}
                    </p>
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map((task, taskIndex) => (
                        <TaskEvent 
                          key={task.id} 
                          task={task} 
                          index={taskIndex} 
                          onToggleTimer={handleToggleTimer}
                          compact
                          objectives={objectives}
                        />
                      ))}
                      {dayTasks.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{dayTasks.length - 3} mais
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center gap-4 text-sm"
        >
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Concluído</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Em progresso</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-muted-foreground" />
            <span className="text-muted-foreground">Pendente</span>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
