import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, CheckCircle2, AlertTriangle, Target, Zap } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { getCategoryColor, getStatusLabel, formatDuration } from '@/lib/mockData';
import { Objective, Task } from '@/types';

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  subValue, 
  trend,
  trendValue,
  delay 
}: { 
  icon: any; 
  label: string; 
  value: string | number; 
  subValue?: string;
  trend?: 'up' | 'down';
  trendValue?: number;
  delay: number;
}) => (
  <motion.div
    className="glass-card-hover p-6"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className="text-3xl font-display font-bold gradient-text">{value}</p>
        {subValue && (
          <p className="text-sm text-muted-foreground mt-1">{subValue}</p>
        )}
      </div>
      <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
    </div>
    {trend !== undefined && trendValue !== undefined && (
      <div className={`flex items-center gap-1 mt-3 text-sm ${trend === 'up' ? 'text-emerald-500' : 'text-amber-500'}`}>
        <TrendingUp className={`h-4 w-4 ${trend === 'down' && 'rotate-180'}`} />
        <span>{trend === 'up' ? '+' : ''}{trendValue}% vs semana anterior</span>
      </div>
    )}
  </motion.div>
);

const ObjectiveCard = ({ objective, completedHours, delay }: { objective: Objective; completedHours: number; delay: number }) => {
  const progress = (completedHours / objective.totalHours) * 100;
  
  return (
    <motion.div
      className="glass-card-hover p-5"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground line-clamp-1">{objective.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{getStatusLabel(objective.status)}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(objective.category)} text-primary-foreground`}>
          {objective.category}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{completedHours.toFixed(1)}h / {objective.totalHours}h</span>
          <span className="font-medium text-primary">{progress.toFixed(0)}%</span>
        </div>
        <div className="progress-bar">
          <motion.div 
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ delay: delay + 0.2, duration: 0.8 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

const TaskItem = ({ task, delay }: { task: Task; delay: number }) => (
  <motion.div
    className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-colors"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.3 }}
  >
    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
      task.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
      task.status === 'in-progress' ? 'bg-primary/10 text-primary' :
      'bg-muted text-muted-foreground'
    }`}>
      {task.status === 'completed' ? (
        <CheckCircle2 className="h-5 w-5" />
      ) : (
        <Clock className="h-5 w-5" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className={`font-medium truncate ${task.status === 'completed' && 'line-through text-muted-foreground'}`}>
        {task.title}
      </p>
      <p className="text-sm text-muted-foreground">{task.scheduledTime} • {formatDuration(task.durationMinutes)}</p>
    </div>
  </motion.div>
);

// Funções auxiliares
const getUniqueTaskKey = (task: Task) => {
  return `${task.title}-${task.description}-${task.scheduledTime}-${task.objectiveId}`;
};

const getWeekStartDate = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Segunda-feira como início (1)
  const result = new Date(d);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

const getWeekEndDate = (date: Date): Date => {
  const start = getWeekStartDate(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6); // Domingo
  end.setHours(23, 59, 59, 999);
  return end;
};

const getPreviousWeekStartDate = (): Date => {
  const today = new Date();
  const currentWeekStart = getWeekStartDate(today);
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);
  return previousWeekStart;
};

const getPreviousWeekEndDate = (): Date => {
  const start = getPreviousWeekStartDate();
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

// Formatar horas com granularidade de minutos (ex: "2min" para 2 minutos, "1.25h" para 1h15min)
const formatHoursWithMinutes = (hours: number): string => {
  if (hours < 0.01) {
    // Valor muito pequeno (< 36 segundos), mostrar como 0
    return '0min';
  } else if (hours < 1) {
    // Para valores menores que 1 hora, mostrar em minutos para melhor legibilidade
    const minutes = Math.round(hours * 60);
    return `${minutes}min`;
  } else {
    // Para 1 hora ou mais, mostrar com 2 casas decimais (ex: "1.03h" = 1h02min, "1.25h" = 1h15min)
    return `${hours.toFixed(2)}h`;
  }
};

const calculateObjectiveCompletedHours = (objectiveId: string, tasks: Task[]): number => {
  const objectiveTasks = tasks.filter(t => t.objectiveId === objectiveId);
  const totalMinutes = objectiveTasks.reduce((sum, task) => sum + task.completedMinutes, 0);
  return Math.round((totalMinutes / 60) * 10) / 10; // Arredondar para 1 casa decimal
};

const calculateStreak = (tasks: Task[]): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  let currentDate = new Date(today);
  
  while (true) {
    // Limitar busca para evitar loop infinito (buscar até 365 dias atrás)
    const daysAgo = Math.floor((today.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo > 365) break;
    
    const dayTasks = tasks.filter(t => {
      const taskDate = new Date(t.scheduledDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.toDateString() === currentDate.toDateString();
    });
    
    const hasCompleted = dayTasks.some(t => t.status === 'completed');
    
    if (!hasCompleted && dayTasks.length > 0) {
      // Dia com tarefas mas sem completas - quebra o streak
      break;
    }
    
    if (!hasCompleted && dayTasks.length === 0) {
      // Dia sem tarefas - pular (não quebra streak)
      currentDate.setDate(currentDate.getDate() - 1);
      continue;
    }
    
    if (hasCompleted) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

const calculateWeeklyProgress = (tasks: Task[]): Array<{ day: string; percentage: number; height: number }> => {
  const weekStart = getWeekStartDate(new Date());
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  
  return days.map((day, index) => {
    const dayDate = new Date(weekStart);
    dayDate.setDate(dayDate.getDate() + index);
    dayDate.setHours(0, 0, 0, 0);
    
    const dayTasks = tasks.filter(t => {
      const taskDate = new Date(t.scheduledDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.toDateString() === dayDate.toDateString();
    });
    
    const totalMinutes = dayTasks.reduce((sum, t) => sum + t.durationMinutes, 0);
    // Contar minutos de TODAS as tarefas (completas ou em progresso), usando completedMinutes
    const completedMinutes = dayTasks
      .reduce((sum, t) => sum + t.completedMinutes, 0);
    
    const percentage = totalMinutes > 0 ? (completedMinutes / totalMinutes) * 100 : 0;
    const height = Math.max(40, (percentage / 100) * 200); // Min 40px, max 200px
    
    return { day, percentage, height };
  });
};

const calculateWeeklyStats = (tasks: Task[], startDate: Date, endDate: Date) => {
  // Extrair apenas ano/mês/dia das datas para comparação (ignorar horas/timezone)
  const getDateOnly = (date: Date): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const startDateStr = getDateOnly(startDate);
  const endDateStr = getDateOnly(endDate);
  
  const weekTasks = tasks.filter(t => {
    const taskDateStr = getDateOnly(new Date(t.scheduledDate));
    // Comparar apenas strings de data (YYYY-MM-DD)
    return taskDateStr >= startDateStr && taskDateStr <= endDateStr;
  });
  
  // #region agent log
  const tasksWithMinutes = weekTasks.filter(t => t.completedMinutes > 0);
  const sampleTasks = tasksWithMinutes.slice(0, 3).map(t => ({
    id: t.id,
    title: t.title.substring(0, 30),
    completedMinutes: t.completedMinutes,
    status: t.status,
    scheduledDate: new Date(t.scheduledDate).toISOString(),
    scheduledDateOnly: getDateOnly(new Date(t.scheduledDate))
  }));
  fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.tsx:245',message:'calculateWeeklyStats ENTRY',data:{totalTasks:tasks.length,weekTasksCount:weekTasks.length,startDateStr,endDateStr,startDate:startDate.toISOString(),endDate:endDate.toISOString(),tasksWithCompletedMinutes:tasksWithMinutes.length,sampleTasks},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-dashboard',hypothesisId:'P'})}).catch(()=>{});
  // #endregion
  
  const totalTasksPlanned = weekTasks.length;
  const totalTasksCompleted = weekTasks.filter(t => t.status === 'completed').length;
  const totalTasksMissed = totalTasksPlanned - totalTasksCompleted;
  
  const totalHoursPlanned = weekTasks.reduce((sum, t) => sum + t.durationMinutes, 0) / 60;
  // Contar horas de TODAS as tarefas (completas ou em progresso), usando completedMinutes
  const totalMinutesCompleted = weekTasks.reduce((sum, t) => sum + (t.completedMinutes || 0), 0);
  const totalHoursCompleted = totalMinutesCompleted / 60;
  
  // #region agent log
  const weekTasksWithDetails = weekTasks.map(t => ({
    id: t.id,
    title: t.title.substring(0, 30),
    completedMinutes: t.completedMinutes,
    durationMinutes: t.durationMinutes,
    status: t.status
  }));
  fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.tsx:285',message:'calculateWeeklyStats CALCULATION',data:{totalMinutesCompleted,totalHoursCompleted,totalHoursPlanned,weekTasksCount:weekTasks.length,weekTasksWithDetails},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-dashboard',hypothesisId:'P'})}).catch(()=>{});
  // #endregion
  
  // Progresso baseado em horas completadas vs horas planejadas (mais preciso e atualiza com o timer)
  const progressPercentage = totalHoursPlanned > 0 
    ? (totalHoursCompleted / totalHoursPlanned) * 100 
    : 0;
  
  return {
    totalTasksPlanned,
    totalTasksCompleted,
    totalTasksMissed,
    // Manter precisão total sem arredondar (já que vamos formatar na exibição)
    totalHoursPlanned,
    totalHoursCompleted,
    progressPercentage: Math.round(progressPercentage * 10) / 10,
  };
};

export default function Dashboard() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Carregar objetivos do localStorage
  useEffect(() => {
    try {
      const storedObjectives = localStorage.getItem('objectives');
      if (storedObjectives) {
        const parsed = JSON.parse(storedObjectives);
        const objectivesWithDates = parsed.map((obj: any) => ({
          ...obj,
          startDate: new Date(obj.startDate),
          endDate: new Date(obj.endDate),
          createdAt: new Date(obj.createdAt),
        }));
        setObjectives(objectivesWithDates);
      } else {
        // Sem dados no localStorage - usar array vazio
        setObjectives([]);
      }
    } catch (error) {
      console.error('Erro ao carregar objetivos do localStorage:', error);
      setObjectives([]);
    }
  }, []);

  // Carregar tarefas do localStorage
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        const parsed = JSON.parse(storedTasks);
        const tasksWithDates = parsed.map((task: any) => ({
          ...task,
          scheduledDate: new Date(task.scheduledDate),
          timerStartedAt: task.timerStartedAt ? new Date(task.timerStartedAt) : undefined,
        }));
        
        // #region agent log
        const tasksWithMinutes = tasksWithDates.filter((t: any) => t.completedMinutes > 0);
        const sampleTasks = tasksWithMinutes.slice(0, 3).map((t: any) => ({
          id: t.id,
          title: t.title.substring(0, 30),
          completedMinutes: t.completedMinutes,
          status: t.status,
          scheduledDate: new Date(t.scheduledDate).toISOString()
        }));
        fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.tsx:321',message:'LOADING tasks from localStorage',data:{totalTasks:tasksWithDates.length,tasksWithCompletedMinutes:tasksWithMinutes.length,sampleTasks},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-dashboard',hypothesisId:'P'})}).catch(()=>{});
        // #endregion
        
        setTasks(tasksWithDates);
      } else {
        // Sem dados no localStorage - usar array vazio
        setTasks([]);
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas do localStorage:', error);
      setTasks([]);
    }
  }, []);

  // Escutar mudanças no localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'objectives' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const objectivesWithDates = parsed.map((obj: any) => ({
            ...obj,
            startDate: new Date(obj.startDate),
            endDate: new Date(obj.endDate),
            createdAt: new Date(obj.createdAt),
          }));
          setObjectives(objectivesWithDates);
        } catch (error) {
          console.error('Erro ao atualizar objetivos:', error);
        }
      }
      if (e.key === 'tasks' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const tasksWithDates = parsed.map((task: any) => ({
            ...task,
            scheduledDate: new Date(task.scheduledDate),
            timerStartedAt: task.timerStartedAt ? new Date(task.timerStartedAt) : undefined,
          }));
          
          // #region agent log
          const tasksWithMinutes = tasksWithDates.filter((t: any) => t.completedMinutes > 0);
          fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.tsx:359',message:'STORAGE EVENT tasks updated',data:{totalTasks:tasksWithDates.length,tasksWithCompletedMinutes:tasksWithMinutes.length},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-dashboard',hypothesisId:'P'})}).catch(()=>{});
          // #endregion
          
          setTasks(tasksWithDates);
        } catch (error) {
          console.error('Erro ao atualizar tarefas:', error);
        }
      }
    };
    
    // Escutar evento customizado disparado quando dados são atualizados
    const handleDataUpdated = () => {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.tsx:359',message:'EVENT tasksUpdated received',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-dashboard',hypothesisId:'P'})}).catch(()=>{});
      // #endregion
      
      // Recarregar dados
      const storedObjectives = localStorage.getItem('objectives');
      const storedTasks = localStorage.getItem('tasks');
      
      if (storedObjectives) {
        try {
          const parsed = JSON.parse(storedObjectives);
          const objectivesWithDates = parsed.map((obj: any) => ({
            ...obj,
            startDate: new Date(obj.startDate),
            endDate: new Date(obj.endDate),
            createdAt: new Date(obj.createdAt),
          }));
          setObjectives(objectivesWithDates);
        } catch (error) {
          console.error('Erro ao atualizar objetivos:', error);
        }
      }
      
      if (storedTasks) {
        try {
          const parsed = JSON.parse(storedTasks);
          const tasksWithDates = parsed.map((task: any) => ({
            ...task,
            scheduledDate: new Date(task.scheduledDate),
            timerStartedAt: task.timerStartedAt ? new Date(task.timerStartedAt) : undefined,
          }));
          
          // #region agent log
          const tasksWithCompletedMinutes = tasksWithDates.filter((t: any) => t.completedMinutes > 0);
          const totalCompletedMinutes = tasksWithDates.reduce((sum: number, t: any) => sum + (t.completedMinutes || 0), 0);
          fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.tsx:382',message:'RELOADING tasks after event',data:{totalTasks:tasksWithDates.length,tasksWithCompletedMinutes:tasksWithCompletedMinutes.length,totalCompletedMinutes,tasksSample:tasksWithCompletedMinutes.slice(0,3).map((t:any)=>({id:t.id,title:t.title.substring(0,30),completedMinutes:t.completedMinutes,status:t.status}))},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-dashboard',hypothesisId:'P'})}).catch(()=>{});
          // #endregion
          
          setTasks(tasksWithDates);
        } catch (error) {
          console.error('Erro ao atualizar tarefas:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('tasksUpdated', handleDataUpdated);
    window.addEventListener('objectivesUpdated', handleDataUpdated);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tasksUpdated', handleDataUpdated);
      window.removeEventListener('objectivesUpdated', handleDataUpdated);
    };
  }, []);

  // Calcular estatísticas usando useMemo para performance
  const activeObjectives = useMemo(() => {
    return objectives.filter(o => o.status !== 'completed' && o.status !== 'paused');
  }, [objectives]);

  // Tarefas de hoje (únicas)
  const todayTasksUnique = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTasks = tasks.filter(t => {
      const taskDate = new Date(t.scheduledDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.toDateString() === today.toDateString();
    });
    
    // Agrupar por tipo único (mesma lógica da tela Tasks)
    const uniqueTasksMap = new Map<string, Task>();
    todayTasks.forEach(task => {
      const key = getUniqueTaskKey(task);
      if (!uniqueTasksMap.has(key)) {
        uniqueTasksMap.set(key, task);
      } else {
        const existing = uniqueTasksMap.get(key)!;
        if (task.status !== 'pending' && existing.status === 'pending') {
          uniqueTasksMap.set(key, task);
        } else if (task.status === 'completed' && existing.status !== 'completed') {
          uniqueTasksMap.set(key, task);
        }
      }
    });
    
    const uniqueTasks = Array.from(uniqueTasksMap.values());
    // Ordenar por horário
    return uniqueTasks.sort((a, b) => {
      const timeA = a.scheduledTime || '00:00';
      const timeB = b.scheduledTime || '00:00';
      return timeA.localeCompare(timeB);
    });
  }, [tasks]);

  const completedToday = useMemo(() => {
    return todayTasksUnique.filter(t => t.status === 'completed').length;
  }, [todayTasksUnique]);

  // Estatísticas da semana atual
  const currentWeekStats = useMemo(() => {
    const weekStart = getWeekStartDate(new Date());
    const weekEnd = getWeekEndDate(new Date());
    return calculateWeeklyStats(tasks, weekStart, weekEnd);
  }, [tasks]);

  // Estatísticas da semana anterior
  const previousWeekStats = useMemo(() => {
    const prevWeekStart = getPreviousWeekStartDate();
    const prevWeekEnd = getPreviousWeekEndDate();
    return calculateWeeklyStats(tasks, prevWeekStart, prevWeekEnd);
  }, [tasks]);

  // Tarefas de hoje vs mesmo dia da semana anterior (usando tarefas únicas para consistência)
  const todayVsPreviousWeekTrend = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Tarefas únicas de hoje
    const todayTasks = tasks.filter(t => {
      const taskDate = new Date(t.scheduledDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.toDateString() === today.toDateString();
    });
    
    // Agrupar por tipo único
    const todayUniqueMap = new Map<string, Task>();
    todayTasks.forEach(task => {
      const key = getUniqueTaskKey(task);
      if (!todayUniqueMap.has(key)) {
        todayUniqueMap.set(key, task);
      } else {
        const existing = todayUniqueMap.get(key)!;
        if (task.status === 'completed' && existing.status !== 'completed') {
          todayUniqueMap.set(key, task);
        }
      }
    });
    const todayCompleted = Array.from(todayUniqueMap.values()).filter(t => t.status === 'completed').length;
    
    // Mesmo dia da semana anterior
    const previousWeekDay = new Date(today);
    previousWeekDay.setDate(previousWeekDay.getDate() - 7);
    
    const previousWeekTasks = tasks.filter(t => {
      const taskDate = new Date(t.scheduledDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.toDateString() === previousWeekDay.toDateString();
    });
    
    // Agrupar por tipo único
    const previousUniqueMap = new Map<string, Task>();
    previousWeekTasks.forEach(task => {
      const key = getUniqueTaskKey(task);
      if (!previousUniqueMap.has(key)) {
        previousUniqueMap.set(key, task);
      } else {
        const existing = previousUniqueMap.get(key)!;
        if (task.status === 'completed' && existing.status !== 'completed') {
          previousUniqueMap.set(key, task);
        }
      }
    });
    const previousWeekCompleted = Array.from(previousUniqueMap.values()).filter(t => t.status === 'completed').length;
    
    if (previousWeekCompleted === 0) {
      return todayCompleted > 0 ? { trend: 'up' as const, value: 100 } : undefined;
    }
    
    const difference = ((todayCompleted - previousWeekCompleted) / previousWeekCompleted) * 100;
    return {
      trend: difference >= 0 ? 'up' as const : 'down' as const,
      value: Math.abs(Math.round(difference)),
    };
  }, [tasks]);

  // Progresso semanal vs semana anterior
  const weeklyProgressTrend = useMemo(() => {
    if (previousWeekStats.progressPercentage === 0) {
      return currentWeekStats.progressPercentage > 0 
        ? { trend: 'up' as const, value: 100 } 
        : undefined;
    }
    
    const difference = ((currentWeekStats.progressPercentage - previousWeekStats.progressPercentage) / previousWeekStats.progressPercentage) * 100;
    return {
      trend: difference >= 0 ? 'up' as const : 'down' as const,
      value: Math.abs(Math.round(difference)),
    };
  }, [currentWeekStats, previousWeekStats]);

  // Streak
  const streak = useMemo(() => {
    return calculateStreak(tasks);
  }, [tasks]);

  // Progresso semanal para gráfico
  const weeklyProgress = useMemo(() => {
    return calculateWeeklyProgress(tasks);
  }, [tasks]);

  // Objetivos com completedHours calculado
  const objectivesWithCalculatedHours = useMemo(() => {
    return objectives.map(obj => ({
      objective: obj,
      calculatedCompletedHours: calculateObjectiveCompletedHours(obj.id, tasks),
    }));
  }, [objectives, tasks]);

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-display font-bold">
              Bom dia! <span className="gradient-text">👋</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Aqui está o resumo da sua rotina de hoje
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-medium">Sequência de {streak} dias</span>
            {streak >= 7 && <span className="text-2xl">🔥</span>}
            {streak >= 3 && streak < 7 && <span className="text-xl">⚡</span>}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={Target}
            label="Objetivos Ativos"
            value={activeObjectives.length}
            subValue={`${objectives.length} total`}
            delay={0.1}
          />
          <StatCard
            icon={CheckCircle2}
            label="Tarefas Hoje"
            value={`${completedToday}/${todayTasksUnique.length}`}
            subValue="completadas"
            trend={todayVsPreviousWeekTrend?.trend}
            trendValue={todayVsPreviousWeekTrend?.value}
            delay={0.2}
          />
          <StatCard
            icon={Clock}
            label="Horas Esta Semana"
            value={formatHoursWithMinutes(currentWeekStats.totalHoursCompleted)}
            subValue={`de ${formatHoursWithMinutes(currentWeekStats.totalHoursPlanned)} planejadas`}
            delay={0.3}
          />
          <StatCard
            icon={AlertTriangle}
            label="Progresso Semanal"
            value={`${currentWeekStats.progressPercentage}%`}
            subValue={`${currentWeekStats.totalTasksMissed} tarefas pendentes`}
            trend={weeklyProgressTrend?.trend}
            trendValue={weeklyProgressTrend?.value}
            delay={0.4}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Objectives */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-semibold">Seus Objetivos</h2>
              <a href="/objectives" className="text-sm text-primary hover:underline">Ver todos →</a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {objectivesWithCalculatedHours.slice(0, 4).map((item, i) => (
                <ObjectiveCard 
                  key={item.objective.id} 
                  objective={item.objective} 
                  completedHours={item.calculatedCompletedHours}
                  delay={0.5 + i * 0.1} 
                />
              ))}
            </div>
            {objectivesWithCalculatedHours.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhum objetivo encontrado
              </p>
            )}
          </div>

          {/* Today's Tasks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-semibold">Tarefas de Hoje</h2>
              <a href="/tasks" className="text-sm text-primary hover:underline">Ver todas →</a>
            </div>
            <div className="glass-card p-4 space-y-3">
              {todayTasksUnique.length > 0 ? (
                todayTasksUnique.slice(0, 6).map((task, i) => (
                  <TaskItem key={task.id} task={task} delay={0.6 + i * 0.1} />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma tarefa para hoje
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Progress Chart Placeholder */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-xl font-display font-semibold mb-6">Progresso Semanal</h2>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center gap-8">
                {weeklyProgress.map((dayData, i) => (
                  <div key={dayData.day} className="flex flex-col items-center gap-2">
                    <motion.div 
                      className="w-8 bg-gradient-to-t from-primary to-accent rounded-t-lg"
                      style={{ height: `${dayData.height}px` }}
                      initial={{ height: 0 }}
                      animate={{ height: `${dayData.height}px` }}
                      transition={{ delay: 0.9 + i * 0.1, duration: 0.5 }}
                    />
                    <span className="text-xs text-muted-foreground">{dayData.day}</span>
                    <span className="text-xs font-medium text-primary">{dayData.percentage.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
