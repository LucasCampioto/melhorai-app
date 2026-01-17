import { Objective, Task, WeeklyStats } from '@/types';

// Mock data for demonstration
export const mockObjectives: Objective[] = [
  {
    id: '1',
    title: 'Tech Lead - Habilidades Técnicas',
    description: 'Aprofundar conhecimentos em arquitetura de sistemas, design patterns e liderança técnica',
    category: 'study',
    totalHours: 120,
    completedHours: 45,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-02-28'),
    status: 'on-track',
    tasks: [],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    title: 'Inteligência Artificial - Fundamentos',
    description: 'Estudar machine learning, deep learning e aplicações práticas de IA',
    category: 'study',
    totalHours: 80,
    completedHours: 25,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-03-15'),
    status: 'delayed',
    tasks: [],
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    title: 'Condicionamento Físico',
    description: 'Treinos de força e cardio para melhorar a saúde geral',
    category: 'training',
    totalHours: 48,
    completedHours: 20,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-02-28'),
    status: 'on-track',
    tasks: [],
    createdAt: new Date('2024-01-01'),
  },
];

export const mockTasks: Task[] = [
  {
    id: 't1',
    objectiveId: '1',
    title: 'Estudar Design Patterns',
    description: 'Revisar padrões de projeto: Factory, Strategy, Observer',
    scheduledDate: new Date(),
    scheduledTime: '09:00',
    durationMinutes: 60,
    completedMinutes: 0,
    status: 'pending',
    isTimerRunning: false,
  },
  {
    id: 't2',
    objectiveId: '1',
    title: 'System Design - Escalabilidade',
    description: 'Estudar técnicas de escalabilidade horizontal e vertical',
    scheduledDate: new Date(),
    scheduledTime: '10:30',
    durationMinutes: 90,
    completedMinutes: 45,
    status: 'in-progress',
    isTimerRunning: false,
  },
  {
    id: 't3',
    objectiveId: '2',
    title: 'Curso de Machine Learning',
    description: 'Módulo 3: Regressão Linear e Logística',
    scheduledDate: new Date(),
    scheduledTime: '14:00',
    durationMinutes: 60,
    completedMinutes: 60,
    status: 'completed',
    isTimerRunning: false,
  },
  {
    id: 't4',
    objectiveId: '3',
    title: 'Treino de Força - Superior',
    description: 'Peito, ombro e tríceps',
    scheduledDate: new Date(),
    scheduledTime: '07:00',
    durationMinutes: 60,
    completedMinutes: 60,
    status: 'completed',
    isTimerRunning: false,
  },
  {
    id: 't5',
    objectiveId: '1',
    title: 'Revisão de Microservices',
    description: 'Estudar comunicação entre serviços e patterns de resiliência',
    scheduledDate: new Date(Date.now() + 86400000),
    scheduledTime: '09:00',
    durationMinutes: 90,
    completedMinutes: 0,
    status: 'pending',
    isTimerRunning: false,
  },
];

export const mockWeeklyStats: WeeklyStats = {
  weekNumber: 4,
  totalTasksCompleted: 18,
  totalTasksMissed: 3,
  totalHoursCompleted: 14.5,
  totalHoursPlanned: 20,
  progressPercentage: 72.5,
};

export const getCategoryColor = (category: Objective['category']) => {
  const colors = {
    study: 'from-primary to-accent',
    training: 'from-emerald-500 to-teal-400',
    health: 'from-rose-500 to-pink-400',
    work: 'from-violet-500 to-purple-400',
  };
  return colors[category];
};

export const getCategoryIcon = (category: Objective['category']) => {
  const icons = {
    study: '📚',
    training: '💪',
    health: '❤️',
    work: '💼',
  };
  return icons[category];
};

export const getStatusColor = (status: Objective['status']) => {
  const colors = {
    'on-track': 'text-emerald-500',
    'delayed': 'text-amber-500',
    'completed': 'text-primary',
    'paused': 'text-muted-foreground',
  };
  return colors[status];
};

export const getStatusLabel = (status: Objective['status']) => {
  const labels = {
    'on-track': 'No Prazo',
    'delayed': 'Atrasado',
    'completed': 'Concluído',
    'paused': 'Pausado',
  };
  return labels[status];
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
};

export const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
