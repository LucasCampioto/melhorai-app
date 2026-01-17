export interface Objective {
  id: string;
  title: string;
  description: string;
  category: 'study' | 'training' | 'health' | 'work';
  totalHours: number;
  completedHours: number;
  startDate: Date;
  endDate: Date;
  status: 'on-track' | 'delayed' | 'completed' | 'paused';
  tasks: Task[];
  createdAt: Date;
}

export interface Task {
  id: string;
  objectiveId: string;
  title: string;
  description: string;
  scheduledDate: Date;
  scheduledTime: string;
  durationMinutes: number;
  completedMinutes: number;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  isTimerRunning: boolean;
  timerStartedAt?: Date;
}

export interface WeeklyStats {
  weekNumber: number;
  totalTasksCompleted: number;
  totalTasksMissed: number;
  totalHoursCompleted: number;
  totalHoursPlanned: number;
  progressPercentage: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'question' | 'preview';
  questionProps?: QuestionStepProps;
  previewData?: RoutinePreview;
}

export interface RoutineFormData {
  hasExistingPlan?: boolean;
  existingPlan?: string;
  area?: 'study' | 'health' | 'work' | 'fitness' | 'personal' | 'outros';
  objective?: string;
  period?: {
    value: number;
    unit: 'weeks' | 'months';
  };
  availability: {
    days: number[];
    timeRange: {
      start: string;
      end: string;
    };
  };
  user_id?: string;
}

export interface RoutinePreview {
  preview_mode: boolean;
  objective: {
    title: string;
    description: string;
    category: string;
  };
  tasks: RoutineTask[];
  generation: {
    horizonDays: number;
  };
}

export interface RoutineTask {
  title: string;
  description: string;
  planning: {
    totalPlannedMinutes: number;
    sessionPlannedMinutes: number;
  };
  schedule: {
    tz: string;
    time: string;
    startDate?: string;  // NOVO: data inicial da tarefa
    endDate?: string;    // NOVO: data final da tarefa
    rule: {
      type: string;
      interval: number;
      daysOfWeek: number[];
      startDate: string;
      endDate: string;
    };
    exceptions: any[];
  };
}

export interface QuestionStepProps {
  question: string;
  type: 'yesno' | 'textarea' | 'multiselect' | 'time' | 'select' | 'text' | 'periodselect';
  field: string;
  value: any;
  onChange: (value: any) => void;
  onNext: (inputValue?: any) => void;
  validation?: (value: any) => boolean;
  errorMessage?: string;
  options?: { label: string; value: any }[];
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  getValue?: () => any;
}

export interface UserRoutine {
  availableHours: { [day: string]: { start: string; end: string }[] };
  preferences: {
    preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
    sessionDuration: number;
    breakDuration: number;
  };
}
