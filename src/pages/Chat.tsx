import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Bot, User, Loader2, CheckCircle2, X, Calendar, Clock, ListTodo, Target, Check } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChatMessage, RoutineFormData, RoutinePreview, QuestionStepProps } from '@/types';
import { getCategoryColor, getCategoryIcon, formatDuration } from '@/lib/mockData';
import { useNavigate } from 'react-router-dom';
import { debugLog } from '@/lib/debugLogger';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
];

const AREA_OPTIONS = [
  { value: 'study', label: 'Estudos' },
  { value: 'health', label: 'Saúde' },
  { value: 'work', label: 'Trabalho' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'personal', label: 'Pessoal' },
  { value: 'outros', label: 'Outros' },
];

const PERIOD_OPTIONS = [
  { value: { value: 1, unit: 'weeks' as const }, label: '1 semana' },
  { value: { value: 2, unit: 'weeks' as const }, label: '2 semanas' },
  { value: { value: 1, unit: 'months' as const }, label: '1 mês' },
  { value: { value: 3, unit: 'months' as const }, label: '3 meses' },
  { value: { value: 6, unit: 'months' as const }, label: '6 meses' },
  { value: { value: 12, unit: 'months' as const }, label: '12 meses' },
];

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Olá! 👋 Sou seu assistente de rotinas. Vou ajudá-lo a criar uma rotina personalizada baseada nos seus objetivos.\n\nVamos começar?',
    timestamp: new Date(),
    type: 'text',
  },
];

// Componentes de Input
const TextAreaInput = ({ 
  value, 
  onChange, 
  onNext, 
  placeholder, 
  minLength, 
  maxLength,
  errorMessage 
}: { 
  value: string; 
  onChange: (v: string) => void; 
  onNext: (inputValue?: string) => void;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  errorMessage?: string;
}) => {
  const [localValue, setLocalValue] = useState(value);
  const isValid = !minLength || localValue.length >= minLength;

  return (
    <div className="mt-4 space-y-2">
      <Textarea
        value={localValue}
        onChange={(e) => {
          const newValue = e.target.value;
          setLocalValue(newValue);
          onChange(newValue);
        }}
        placeholder={placeholder}
        className="min-h-[120px] bg-background/50 border-glass-border"
        maxLength={maxLength}
      />
      <div className="flex items-center justify-between">
        <div>
          {minLength && (
            <p className={`text-xs ${isValid ? 'text-muted-foreground' : 'text-destructive'}`}>
              Mínimo {minLength} caracteres {localValue.length > 0 && `(${localValue.length}/${minLength})`}
            </p>
          )}
          {errorMessage && !isValid && (
            <p className="text-xs text-destructive mt-1">{errorMessage}</p>
          )}
        </div>
        <Button
          variant="futuristic"
          size="sm"
          onClick={() => {
            // #region agent log
            debugLog({location:'Chat.tsx:91',message:'TextAreaInput CONTINUAR clicked',data:{isValid,hasValue:!!localValue.trim(),valueLength:localValue.length,minLength},runId:'post-fix',hypothesisId:'G'});
            // #endregion
            // Passar o localValue atual para a validação
            onNext(localValue);
          }}
          disabled={!isValid || !localValue.trim()}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

const MultiSelectInput = ({ 
  value, 
  onChange, 
  onNext,
  options 
}: { 
  value: number[]; 
  onChange: (v: number[]) => void; 
  onNext: (inputValue?: number[]) => void;
  options: { value: number; label: string }[];
}) => {
  // Usar estado local sincronizado com value prop
  const [localValue, setLocalValue] = useState(value);
  
  // Sincronizar quando value prop mudar
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  const toggleDay = (dayValue: number) => {
    // #region agent log
    debugLog({location:'Chat.tsx:120',message:'MultiSelectInput toggleDay ENTRY',data:{dayValue,currentValue:localValue,isIncluded:localValue.includes(dayValue)},runId:'post-fix',hypothesisId:'H'});
    // #endregion
    const newValue = localValue.includes(dayValue)
      ? localValue.filter(d => d !== dayValue)
      : [...localValue, dayValue].sort((a, b) => a - b);
    setLocalValue(newValue);
    // #region agent log
    debugLog({location:'Chat.tsx:127',message:'MultiSelectInput calling onChange',data:{newValue,newValueLength:newValue.length},runId:'post-fix',hypothesisId:'H'});
    // #endregion
    onChange(newValue);
  };

  const selectAllDays = () => {
    const allDays = options.map(opt => opt.value).sort((a, b) => a - b);
    setLocalValue(allDays);
    onChange(allDays);
  };

  const isAllSelected = localValue.length === options.length;

  return (
    <div className="mt-4 space-y-3">
      <Button
        type="button"
        variant={isAllSelected ? "default" : "outline"}
        size="sm"
        onClick={selectAllDays}
        className="w-full"
      >
        {isAllSelected ? '✓ Todos os dias selecionados' : 'Selecionar todos os dias'}
      </Button>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <div
            key={option.value}
            onClick={() => toggleDay(option.value)}
            className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
              localValue.includes(option.value)
                ? 'bg-primary/20 border-2 border-primary'
                : 'bg-secondary/50 border-2 border-transparent hover:bg-secondary/80'
            }`}
          >
            <Checkbox
              checked={localValue.includes(option.value)}
              onCheckedChange={(checked) => {
                // #region agent log
                debugLog({location:'Chat.tsx:155',message:'Checkbox onCheckedChange',data:{optionValue:option.value,checked,currentValue:localValue,isIncluded:localValue.includes(option.value)},runId:'post-fix',hypothesisId:'H'});
                // #endregion
                toggleDay(option.value);
              }}
            />
            <span className="text-sm font-medium">{option.label}</span>
          </div>
        ))}
      </div>
      {localValue.length > 0 && (
        <Button
          variant="futuristic"
          size="sm"
          onClick={() => onNext(localValue)}
          className="w-full mt-2"
        >
          Continuar ({localValue.length} {localValue.length === 1 ? 'dia selecionado' : 'dias selecionados'})
        </Button>
      )}
    </div>
  );
};

const PeriodSelectInput = ({ 
  value, 
  onChange, 
  onNext,
  options 
}: { 
  value: { value: number; unit: 'weeks' | 'months' } | undefined; 
  onChange: (v: { value: number; unit: 'weeks' | 'months' }) => void; 
  onNext: (inputValue?: { value: number; unit: 'weeks' | 'months' }) => void;
  options: { value: { value: number; unit: 'weeks' | 'months' }; label: string }[];
}) => {
  // Usar estado local sincronizado com value prop
  const [localValue, setLocalValue] = useState<{ value: number; unit: 'weeks' | 'months' } | undefined>(value);
  
  // Sincronizar quando value prop mudar
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  const selectPeriod = (periodValue: { value: number; unit: 'weeks' | 'months' }) => {
    setLocalValue(periodValue);
    onChange(periodValue);
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {options.map((option, index) => {
          const isSelected = localValue?.value === option.value.value && localValue?.unit === option.value.unit;
          return (
            <div
              key={index}
              onClick={() => selectPeriod(option.value)}
              className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-primary/20 border-2 border-primary'
                  : 'bg-secondary/50 border-2 border-transparent hover:bg-secondary/80'
              }`}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => {
                  selectPeriod(option.value);
                }}
              />
              <span className="text-sm font-medium">{option.label}</span>
            </div>
          );
        })}
      </div>
      {localValue && (
        <Button
          variant="futuristic"
          size="sm"
          onClick={() => onNext(localValue)}
          className="w-full mt-2"
        >
          Continuar - {options.find(o => o.value.value === localValue.value && o.value.unit === localValue.unit)?.label}
        </Button>
      )}
    </div>
  );
};

const TimeInput = ({ 
  value, 
  onChange, 
  onNext,
  label 
}: { 
  value: string; 
  onChange: (v: string) => void; 
  onNext: (inputValue?: string) => void;
  label: string;
}) => {
  // Usar estado local sincronizado com value prop
  const [localValue, setLocalValue] = useState(value);
  
  // Sincronizar quando value prop mudar
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  return (
    <div className="mt-4 space-y-2">
      <Input
        type="time"
        value={localValue}
        onChange={(e) => {
          const newValue = e.target.value;
          setLocalValue(newValue);
          onChange(newValue);
        }}
        className="bg-background/50 border-glass-border"
      />
      {localValue && (
        <Button
          variant="futuristic"
          size="sm"
          onClick={() => onNext(localValue)}
          className="w-full"
        >
          Continuar - {label}: {localValue}
        </Button>
      )}
    </div>
  );
};

const SelectInput = ({ 
  value, 
  onChange, 
  onNext,
  options 
}: { 
  value: string; 
  onChange: (v: string) => void; 
  onNext: (inputValue?: string) => void;
  options: { value: string; label: string }[];
}) => {
  // Usar estado local sincronizado com value prop
  const [localValue, setLocalValue] = useState(value);
  
  // Sincronizar quando value prop mudar
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  return (
    <div className="mt-4 space-y-2">
      <Select 
        value={localValue} 
        onValueChange={(newValue) => {
          setLocalValue(newValue);
          onChange(newValue);
        }}
      >
        <SelectTrigger className="bg-background/50 border-glass-border">
          <SelectValue placeholder="Selecione uma opção" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {localValue && (
        <Button
          variant="futuristic"
          size="sm"
          onClick={() => onNext(localValue)}
          className="w-full"
        >
          Continuar
        </Button>
      )}
    </div>
  );
};

const TextInput = ({ 
  value, 
  onChange, 
  onNext,
  placeholder,
  optional = false
}: { 
  value: string; 
  onChange: (v: string) => void; 
  onNext: (inputValue?: string) => void;
  placeholder?: string;
  optional?: boolean;
}) => {
  // Usar estado local sincronizado com value prop
  const [localValue, setLocalValue] = useState(value);
  
  // Sincronizar quando value prop mudar
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  return (
    <div className="mt-4 space-y-2">
      <Input
        value={localValue}
        onChange={(e) => {
          const newValue = e.target.value;
          setLocalValue(newValue);
          onChange(newValue);
        }}
        placeholder={placeholder}
        className="bg-background/50 border-glass-border"
      />
      <Button
        variant="futuristic"
        size="sm"
        onClick={() => onNext(localValue)}
        className="w-full"
        disabled={!optional && !localValue.trim()}
      >
        {optional ? 'Pular (opcional)' : 'Continuar'}
      </Button>
    </div>
  );
};

// Componente de Preview do Plano
const RoutinePreviewCard = ({ 
  preview, 
  onAccept, 
  onReject 
}: { 
  preview: RoutinePreview; 
  onAccept: () => void; 
  onReject: () => void;
}) => {
  const getDayName = (day: number) => DAYS_OF_WEEK.find(d => d.value === day)?.label || '';
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card overflow-hidden max-w-2xl"
    >
      {/* Objective Header */}
      <div className={`h-2 bg-gradient-to-r ${getCategoryColor(preview.objective.category as any)}`} />
      <div className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl">{getCategoryIcon(preview.objective.category as any)}</span>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-xl mb-2">{preview.objective.title}</h3>
            <p className="text-sm text-muted-foreground">{preview.objective.description}</p>
          </div>
        </div>

        {/* Tasks List */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <ListTodo className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Tarefas ({preview.tasks.length})</h4>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {preview.tasks.map((task, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl bg-secondary/50 border border-glass-border"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h5 className="font-semibold text-sm mb-1">{task.title}</h5>
                    <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-1 text-primary">
                        <Clock className="h-3 w-3" />
                        {task.schedule.time}
                      </div>
                      <div className="flex items-center gap-1 text-accent">
                        <Calendar className="h-3 w-3" />
                        {task.schedule.rule.daysOfWeek.map(getDayName).join(', ')}
                      </div>
                      <div className="text-muted-foreground">
                        {formatDuration(task.planning.sessionPlannedMinutes)}
                      </div>
                      <div className="text-muted-foreground">
                        {formatDate(task.schedule.rule.startDate)} - {formatDate(task.schedule.rule.endDate)}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-glass-border">
          <Button
            variant="futuristic"
            size="lg"
            onClick={onAccept}
            className="flex-1"
          >
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Aceitar Plano
          </Button>
          <Button
            variant="glass"
            size="lg"
            onClick={onReject}
            className="flex-1"
          >
            <X className="h-5 w-5 mr-2" />
            Rejeitar
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// Componente de Pergunta
const QuestionStep = ({ question, type, field, value, onChange, onNext, validation, errorMessage, options, placeholder, minLength, maxLength, required, getValue }: QuestionStepProps) => {
  // Buscar valor atualizado usando getValue() se disponível, senão usar value estático
  const currentValue = getValue ? getValue() : value;
  
  const handleNext = (inputValue?: any) => {
    // Usar o valor passado pelo input, ou getValue() se disponível, ou o value estático
    const valueToValidate = inputValue !== undefined 
      ? inputValue 
      : getValue 
        ? getValue() 
        : value;
    // #region agent log
    debugLog({location:'Chat.tsx:370',message:'QuestionStep handleNext ENTRY',data:{type,field,hasValidation:!!validation,valueType:typeof valueToValidate,valueLength:typeof valueToValidate === 'string' ? valueToValidate.length : Array.isArray(valueToValidate) ? valueToValidate.length : 'N/A',hasInputValue:inputValue !== undefined,hasGetValue:!!getValue},runId:'post-fix',hypothesisId:'G'});
    // #endregion
    if (validation && !validation(valueToValidate)) {
      // #region agent log
      debugLog({location:'Chat.tsx:374',message:'QuestionStep VALIDATION FAILED',data:{},runId:'post-fix',hypothesisId:'G'});
      // #endregion
      return;
    }
    // #region agent log
    debugLog({location:'Chat.tsx:377',message:'QuestionStep calling onNext',data:{},runId:'post-fix',hypothesisId:'G'});
    // #endregion
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{question}</p>
      {type === 'textarea' && (
        <TextAreaInput
          value={currentValue as string}
          onChange={onChange}
          onNext={handleNext}
          placeholder={placeholder}
          minLength={minLength}
          maxLength={maxLength}
          errorMessage={errorMessage}
        />
      )}
      {type === 'multiselect' && (
        <MultiSelectInput
          value={currentValue as number[]}
          onChange={onChange}
          onNext={handleNext}
          options={options as { value: number; label: string }[]}
        />
      )}
      {type === 'time' && (
        <TimeInput
          value={currentValue as string}
          onChange={onChange}
          onNext={handleNext}
          label={field.includes('start') ? 'Início' : 'Fim'}
        />
      )}
      {type === 'select' && (
        <SelectInput
          value={currentValue as string}
          onChange={onChange}
          onNext={handleNext}
          options={options as { value: string; label: string }[]}
        />
      )}
      {type === 'text' && (
        <TextInput
          value={currentValue as string}
          onChange={onChange}
          onNext={handleNext}
          placeholder={placeholder}
          optional={!required}
        />
      )}
      {type === 'periodselect' && (
        <PeriodSelectInput
          value={currentValue as { value: number; unit: 'weeks' | 'months' } | undefined}
          onChange={onChange}
          onNext={handleNext}
          options={options as { value: { value: number; unit: 'weeks' | 'months' }; label: string }[]}
        />
      )}
    </motion.div>
  );
};

const MessageBubble = ({ 
  message, 
  index,
  onAcceptPlan,
  onRejectPlan
}: { 
  message: ChatMessage; 
  index: number;
  onAcceptPlan?: () => void;
  onRejectPlan?: () => void;
}) => {
  const isAssistant = message.role === 'assistant';

  if (message.type === 'preview' && message.previewData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className="flex gap-3"
      >
        <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent shadow-neon flex items-center justify-center">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1 max-w-[90%]">
          <RoutinePreviewCard
            preview={message.previewData}
            onAccept={onAcceptPlan || (() => {})}
            onReject={onRejectPlan || (() => {})}
          />
        </div>
      </motion.div>
    );
  }

  if (message.type === 'question' && message.questionProps) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className="flex gap-3"
      >
        <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent shadow-neon flex items-center justify-center">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1 max-w-[90%]">
          <QuestionStep {...message.questionProps} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`flex gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}
    >
      <div className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${
        isAssistant 
          ? 'bg-gradient-to-br from-primary to-accent shadow-neon' 
          : 'bg-secondary'
      }`}>
        {isAssistant ? (
          <Bot className="h-5 w-5 text-primary-foreground" />
        ) : (
          <User className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className={`max-w-[80%] ${isAssistant ? '' : 'text-right'}`}>
        <div className={`inline-block p-4 rounded-2xl ${
          isAssistant 
            ? 'glass-card text-foreground' 
            : 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
        }`}>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-1 px-2">
          {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
};

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex gap-3"
  >
    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent shadow-neon flex items-center justify-center">
      <Bot className="h-5 w-5 text-primary-foreground" />
    </div>
    <div className="glass-card p-4 rounded-2xl">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-primary"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<RoutineFormData>({
    availability: {
      days: [],
      timeRange: {
        start: '',
        end: '',
      },
    },
    period: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState<RoutinePreview | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSubmitting]);

  // Validações
const validations = {
    existingPlan: (value: string) => value.length >= 5,
    objective: (value: string) => value.length >= 10,
    days: (value: number[]) => value.length > 0 && value.every(d => d >= 0 && d <= 6),
    timeRange: (start: string, end: string) => {
      if (!start || !end) return false;
      const [startH, startM] = start.split(':').map(Number);
      const [endH, endM] = end.split(':').map(Number);
      return endH > startH || (endH === startH && endM > startM);
    },
    area: (value: string) => ['study', 'health', 'work', 'fitness', 'personal', 'outros'].includes(value),
    period: (value: { value: number; unit: 'weeks' | 'months' } | undefined) => {
      if (!value) return false;
      return value.value > 0 && (value.unit === 'weeks' || value.unit === 'months');
    },
  };

  // Definir perguntas baseado no fluxo
  const getQuestions = () => {
    // #region agent log
    debugLog({location:'Chat.tsx:577',message:'getQuestions ENTRY',data:{hasExistingPlan:formData.hasExistingPlan},runId:'run1',hypothesisId:'C'});
    // #endregion
    const hasPlan = formData.hasExistingPlan === true;
    const baseQuestions = [
      {
        question: 'Você já tem um plano feito?',
        type: 'yesno' as const,
        field: 'hasExistingPlan',
        getValue: () => formData.hasExistingPlan,
        setValue: (v: boolean) => {
          setFormData(prev => ({ ...prev, hasExistingPlan: v }));
        },
      },
    ];

    if (hasPlan) {
      return [
        ...baseQuestions,
        {
          question: 'Envie seu plano completo\n\nFormato: Uma linha por item, numerada\nExemplo:\n1) ESLint: padronizando código (Alura)\n2) GitHub Actions: pipelines (Alura)',
          type: 'textarea' as const,
          field: 'existingPlan',
          getValue: () => formData.existingPlan || '',
          setValue: (v: string) => {
            setFormData(prev => ({ ...prev, existingPlan: v }));
          },
          validation: validations.existingPlan,
          errorMessage: 'O plano deve ter no mínimo 5 caracteres',
          minLength: 5,
        },
        {
          question: 'Quais dias da semana você tem disponível?',
          type: 'multiselect' as const,
          field: 'availability.days',
          getValue: () => formData.availability.days,
          setValue: (v: number[]) => {
            setFormData(prev => ({
              ...prev,
              availability: { ...prev.availability, days: v },
            }));
          },
          validation: validations.days,
          options: DAYS_OF_WEEK,
        },
        {
          question: 'Qual o horário de início? (formato HH:MM)',
          type: 'time' as const,
          field: 'availability.timeRange.start',
          getValue: () => formData.availability.timeRange.start,
          setValue: (v: string) => {
            setFormData(prev => ({
              ...prev,
              availability: {
                ...prev.availability,
                timeRange: { ...prev.availability.timeRange, start: v },
              },
            }));
          },
        },
        {
          question: 'Qual o horário de fim? (formato HH:MM)\n\nDeve ser maior que o horário de início.',
          type: 'time' as const,
          field: 'availability.timeRange.end',
          getValue: () => formData.availability.timeRange.end,
          setValue: (v: string) => {
            setFormData(prev => ({
              ...prev,
              availability: {
                ...prev.availability,
                timeRange: { ...prev.availability.timeRange, end: v },
              },
            }));
          },
          validation: (endValue: string) => {
            // Buscar valor atualizado do formData
            const startValue = formData.availability.timeRange.start;
            // #region agent log
            debugLog({location:'Chat.tsx:734',message:'TimeRange validation',data:{startValue,endValue,validationResult:validations.timeRange(startValue, endValue)},runId:'post-fix',hypothesisId:'I'});
            // #endregion
            return validations.timeRange(startValue, endValue);
          },
          errorMessage: 'O horário de fim deve ser maior que o horário de início',
        },
        {
          question: 'Por quanto tempo você pretende manter esse hábito?',
          type: 'periodselect' as const,
          field: 'period',
          getValue: () => formData.period,
          setValue: (v: { value: number; unit: 'weeks' | 'months' }) => {
            setFormData(prev => ({ ...prev, period: v }));
          },
          validation: validations.period,
          options: PERIOD_OPTIONS,
        },
        {
          question: 'ID do usuário (opcional)\n\nPadrão: "default"',
          type: 'text' as const,
          field: 'user_id',
          getValue: () => formData.user_id || '',
          setValue: (v: string) => {
            setFormData(prev => ({ ...prev, user_id: v || 'default' }));
          },
          required: false,
        },
      ];
    } else if (formData.hasExistingPlan === false) {
      return [
        ...baseQuestions,
        {
          question: 'Qual área da sua vida você deseja melhorar?',
          type: 'select' as const,
          field: 'area',
          getValue: () => formData.area || '',
          setValue: (v: string) => {
            setFormData(prev => ({ ...prev, area: v as any }));
          },
          validation: validations.area,
          options: AREA_OPTIONS,
        },
        {
          question: 'Por quanto tempo você pretende manter esse hábito?',
          type: 'periodselect' as const,
          field: 'period',
          getValue: () => formData.period,
          setValue: (v: { value: number; unit: 'weeks' | 'months' }) => {
            setFormData(prev => ({ ...prev, period: v }));
          },
          validation: validations.period,
          options: PERIOD_OPTIONS,
        },
        {
          question: 'Explique seu objetivo com detalhes\n\nDescreva sua "dor" atual, explique o que você pretende como solução e seja específico sobre o que deseja alcançar.',
          type: 'textarea' as const,
          field: 'objective',
          getValue: () => formData.objective || '',
          setValue: (v: string) => {
            setFormData(prev => ({ ...prev, objective: v }));
          },
          validation: validations.objective,
          errorMessage: 'O objetivo deve ter no mínimo 10 caracteres',
          minLength: 10,
        },
        {
          question: 'Quais dias da semana você tem disponível?',
          type: 'multiselect' as const,
          field: 'availability.days',
          getValue: () => formData.availability.days,
          setValue: (v: number[]) => {
            setFormData(prev => ({
              ...prev,
              availability: { ...prev.availability, days: v },
            }));
          },
          validation: validations.days,
          options: DAYS_OF_WEEK,
        },
        {
          question: 'Qual o horário de início? (formato HH:MM)',
          type: 'time' as const,
          field: 'availability.timeRange.start',
          getValue: () => formData.availability.timeRange.start,
          setValue: (v: string) => {
            setFormData(prev => ({
              ...prev,
              availability: {
                ...prev.availability,
                timeRange: { ...prev.availability.timeRange, start: v },
              },
            }));
          },
        },
        {
          question: 'Qual o horário de fim? (formato HH:MM)\n\nDeve ser maior que o horário de início.',
          type: 'time' as const,
          field: 'availability.timeRange.end',
          getValue: () => formData.availability.timeRange.end,
          setValue: (v: string) => {
            setFormData(prev => ({
              ...prev,
              availability: {
                ...prev.availability,
                timeRange: { ...prev.availability.timeRange, end: v },
              },
            }));
          },
          validation: (endValue: string) => {
            // Buscar valor atualizado do formData
            const startValue = formData.availability.timeRange.start;
            // #region agent log
            debugLog({location:'Chat.tsx:734',message:'TimeRange validation',data:{startValue,endValue,validationResult:validations.timeRange(startValue, endValue)},runId:'post-fix',hypothesisId:'I'});
            // #endregion
            return validations.timeRange(startValue, endValue);
          },
          errorMessage: 'O horário de fim deve ser maior que o horário de início',
        },
        {
          question: 'ID do usuário (opcional)\n\nPadrão: "default"',
          type: 'text' as const,
          field: 'user_id',
          getValue: () => formData.user_id || '',
          setValue: (v: string) => {
            setFormData(prev => ({ ...prev, user_id: v || 'default' }));
          },
          required: false,
        },
      ];
    }

    const result = baseQuestions;
    // #region agent log
    debugLog({location:'Chat.tsx:748',message:'getQuestions EXIT',data:{questionsCount:result.length,hasExistingPlan:formData.hasExistingPlan,firstQuestionType:result[0]?.type},runId:'run1',hypothesisId:'C'});
    // #endregion
    return result;
  };

  const questions = getQuestions();
  const currentQuestion = questions[currentStep];
  // #region agent log
  debugLog({location:'Chat.tsx:752',message:'currentQuestion CALC',data:{currentStep,questionsLength:questions.length,currentQuestionExists:!!currentQuestion,currentQuestionType:currentQuestion?.type},runId:'run1',hypothesisId:'D,E'});
  // #endregion

  // Função para verificar conflito de horário
  const hasTimeConflict = (timeRange: { start: string; end: string }): boolean => {
    try {
      const storedTasks = localStorage.getItem('tasks');
      if (!storedTasks) return false;

      const tasks = JSON.parse(storedTasks);
      if (!Array.isArray(tasks) || tasks.length === 0) return false;

      // Converter horários para minutos para facilitar comparação
      const timeToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      };

      const startMinutes = timeToMinutes(timeRange.start);
      const endMinutes = timeToMinutes(timeRange.end);

      // Verificar se alguma tarefa existente tem horário dentro do intervalo
      return tasks.some((task: any) => {
        if (!task.scheduledTime) return false;
        const taskMinutes = timeToMinutes(task.scheduledTime);
        // Verificar se o horário da tarefa está dentro do intervalo [start, end]
        return taskMinutes >= startMinutes && taskMinutes <= endMinutes;
      });
    } catch (error) {
      console.error('Erro ao verificar conflito de horário:', error);
      return false; // Em caso de erro, não forçar distribuição
    }
  };

  // Função para construir payload
  const buildPayload = (data: RoutineFormData) => {
    const payload: any = {
      hasExistingPlan: data.hasExistingPlan,
      availability: {
        days: data.availability.days,
        timeRange: {
          start: data.availability.timeRange.start,
          end: data.availability.timeRange.end,
        },
      },
    };

    if (data.hasExistingPlan) {
      payload.existingPlan = data.existingPlan;
      // Incluir período quando há plano existente
      if (data.period) {
        payload.period = data.period;
      }
    } else {
      payload.area = data.area;
      payload.objective = data.objective;
      
      // Incluir período sempre quando não há plano existente
      if (data.period) {
        payload.period = data.period;
      }
    }

    if (data.user_id && data.user_id !== 'default') {
      payload.user_id = data.user_id;
    }

    // Verificar conflito de horário e adicionar distributeTasksAcrossDays se necessário
    if (hasTimeConflict(data.availability.timeRange)) {
      payload.distributeTasksAcrossDays = true;
    }

    return payload;
  };

  // Validar se todas as perguntas foram respondidas
  const validateForm = (): boolean => {
    if (formData.hasExistingPlan === null) return false;
    
    if (formData.hasExistingPlan) {
      // Fluxo COM PLANO
      if (!formData.existingPlan || formData.existingPlan.length < 5) return false;
      if (!formData.availability.days || formData.availability.days.length === 0) return false;
      if (!formData.availability.timeRange.start) return false;
      if (!formData.availability.timeRange.end) return false;
      if (!validations.timeRange(formData.availability.timeRange.start, formData.availability.timeRange.end)) return false;
      // Validar período quando há plano existente
      if (!formData.period || !validations.period(formData.period)) return false;
    } else {
      // Fluxo SEM PLANO
      if (!formData.area) return false;
      
      // Validar período sempre quando não há plano existente
      if (!formData.period || !validations.period(formData.period)) return false;
      
      if (!formData.objective || formData.objective.length < 10) return false;
      if (!formData.availability.days || formData.availability.days.length === 0) return false;
      if (!formData.availability.timeRange.start) return false;
      if (!formData.availability.timeRange.end) return false;
      if (!validations.timeRange(formData.availability.timeRange.start, formData.availability.timeRange.end)) return false;
    }
    
    return true;
  };

  // Função para avançar
  const handleNext = (inputValue?: any) => {
    // #region agent log
    debugLog({location:'Chat.tsx:816',message:'handleNext ENTRY',data:{currentStep,questionsLength:questions.length,isLastStep:currentStep >= questions.length - 1,hasInputValue:inputValue !== undefined},runId:'post-fix',hypothesisId:'G'});
    // #endregion
    if (currentStep < questions.length - 1) {
      // #region agent log
      debugLog({location:'Chat.tsx:902',message:'handleNext ADVANCING step',data:{nextStep:currentStep + 1},runId:'post-fix',hypothesisId:'G'});
      // #endregion
      setCurrentStep(prev => prev + 1);
      // O useEffect vai cuidar de mostrar a próxima pergunta
    } else {
      // #region agent log
      debugLog({location:'Chat.tsx:822',message:'handleNext LAST STEP validating',data:{},runId:'post-fix',hypothesisId:'G'});
      // #endregion
      // Última pergunta, validar antes de enviar
      if (validateForm()) {
        // #region agent log
        debugLog({location:'Chat.tsx:825',message:'handleNext VALIDATION PASSED calling handleSubmit',data:{},runId:'post-fix',hypothesisId:'G'});
        // #endregion
        handleSubmit();
      } else {
        // #region agent log
        debugLog({location:'Chat.tsx:828',message:'handleNext VALIDATION FAILED',data:{},runId:'post-fix',hypothesisId:'G'});
        // #endregion
        // Mostrar mensagem de erro se faltar algo
        const errorMessage: ChatMessage = {
          id: `validation-error-${Date.now()}`,
          role: 'assistant',
          content: 'Por favor, preencha todos os campos obrigatórios antes de continuar.',
          timestamp: new Date(),
          type: 'text',
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  };

  // Mostrar pergunta atual
  const showCurrentQuestion = useCallback(() => {
    // #region agent log
    debugLog({location:'Chat.tsx:829',message:'showCurrentQuestion ENTRY',data:{currentStep,hasExistingPlan:formData.hasExistingPlan},runId:'run1',hypothesisId:'B'});
    // #endregion
    const questions = getQuestions();
    const question = questions[currentStep];
    // #region agent log
    debugLog({location:'Chat.tsx:832',message:'showCurrentQuestion question check',data:{questionExists:!!question,questionType:question?.type,questionsLength:questions.length},runId:'run1',hypothesisId:'B'});
    // #endregion
    if (!question) return;

    // Verificar se a pergunta já foi adicionada para evitar duplicação
    const questionId = `q-step-${currentStep}`;
    setMessages(prev => {
      const alreadyExists = prev.some(m => m.id === questionId);
      if (alreadyExists) return prev;

      const questionProps: QuestionStepProps = {
        question: question.question,
        type: question.type,
        field: question.field,
        value: question.getValue(),
        onChange: (value: any) => {
          (question.setValue as (v: any) => void)(value);
        },
        onNext: handleNext,
        getValue: question.getValue,
      };

      // Adicionar propriedades opcionais se existirem
      if ('validation' in question && question.validation) {
        questionProps.validation = question.validation as (value: any) => boolean;
      }
      if ('errorMessage' in question && typeof (question as any).errorMessage === 'string') {
        questionProps.errorMessage = (question as any).errorMessage as string;
      }
      if ('options' in question) {
        questionProps.options = (question as any).options;
      }
      if ('placeholder' in question && typeof (question as any).placeholder === 'string') {
        questionProps.placeholder = (question as any).placeholder as string;
      }
      if ('minLength' in question && typeof (question as any).minLength === 'number') {
        questionProps.minLength = (question as any).minLength as number;
      }
      if ('maxLength' in question && typeof (question as any).maxLength === 'number') {
        questionProps.maxLength = (question as any).maxLength as number;
      }
      if ('required' in question) {
        questionProps.required = (question as any).required !== false;
      } else {
        questionProps.required = true;
      }

      const questionMessage: ChatMessage = {
        id: questionId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        type: 'question',
        questionProps,
      };

      // #region agent log
      debugLog({location:'Chat.tsx:886',message:'showCurrentQuestion ADDING MESSAGE',data:{questionId,questionType:question.type},runId:'run1',hypothesisId:'B'});
      // #endregion
      return [...prev, questionMessage];
    });
  }, [currentStep, formData, handleNext]);

  // Iniciar fluxo - mostrar primeira pergunta
  useEffect(() => {
    // #region agent log
    debugLog({location:'Chat.tsx:909',message:'useEffect first question ENTRY',data:{currentStep,messagesLength:messages.length,conditionMet:currentStep === 0 && messages.length === 1},runId:'post-fix',hypothesisId:'A'});
    // #endregion
    if (currentStep === 0 && messages.length === 1) {
      const questions = getQuestions();
      // #region agent log
      debugLog({location:'Chat.tsx:914',message:'useEffect first question inside condition',data:{questionsLength:questions.length},runId:'post-fix',hypothesisId:'A'});
      // #endregion
      if (questions.length > 0) {
        const questionId = `q-step-${currentStep}`;
        const alreadyExists = messages.some(m => m.id === questionId);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.tsx:920',message:'useEffect first question checking exists',data:{alreadyExists,questionId},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        if (!alreadyExists) {
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.tsx:927',message:'useEffect first question SETTING TIMER',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          const timer = setTimeout(() => {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.tsx:930',message:'TIMER FIRED calling showCurrentQuestion',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            showCurrentQuestion();
          }, 1000);
          return () => {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.tsx:932',message:'TIMER CLEANUP',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            clearTimeout(timer);
          };
        }
      }
    }
  }, [currentStep, messages.length]);

  // Quando hasExistingPlan muda, avançar para próxima pergunta
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.tsx:939',message:'useEffect hasExistingPlan change',data:{hasExistingPlan:formData.hasExistingPlan,currentStep,willAdvance:formData.hasExistingPlan !== null && formData.hasExistingPlan !== undefined && currentStep === 0},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    if (formData.hasExistingPlan !== null && formData.hasExistingPlan !== undefined && currentStep === 0) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.tsx:941',message:'ADVANCING to step 1',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      setCurrentStep(1);
    }
  }, [formData.hasExistingPlan, currentStep]);

  // Quando currentStep muda, mostrar nova pergunta (exceto step 0 que já foi tratado)
  useEffect(() => {
    if (currentStep > 0) {
      const questions = getQuestions();
      if (questions.length > currentStep) {
        const questionId = `q-step-${currentStep}`;
        const alreadyExists = messages.some(m => m.id === questionId);
        
        if (!alreadyExists) {
          const timer = setTimeout(() => {
            showCurrentQuestion();
          }, 300);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [currentStep, messages, showCurrentQuestion]);

  // Enviar formulário
  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Adicionar mensagem de loading
    const loadingMessage: ChatMessage = {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      content: 'Gerando seu plano personalizado... ⏳',
      timestamp: new Date(),
      type: 'text',
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const payload = buildPayload(formData);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/generate-routine-from-json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.preview) {
        setApiResponse(data.preview);
        
        const previewMessage: ChatMessage = {
          id: `preview-${Date.now()}`,
          role: 'assistant',
          content: 'Aqui está seu plano personalizado! 🎉',
          timestamp: new Date(),
          type: 'preview',
          previewData: data.preview,
        };
        
        setMessages(prev => [...prev.filter(m => m.id !== loadingMessage.id), previewMessage]);
      } else {
        throw new Error('Resposta inválida da API');
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Desculpe, ocorreu um erro ao gerar seu plano. Por favor, tente novamente.\n\nErro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        timestamp: new Date(),
        type: 'text',
      };
      setMessages(prev => [...prev.filter(m => m.id !== loadingMessage.id), errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Aceitar plano
  const handleAcceptPlan = () => {
    if (!apiResponse) return;

    // Converter preview para Objective e Tasks
    const objectiveId = `obj${Date.now()}`;
    
    // Calcular total de horas baseado nas tarefas
    const totalMinutes = apiResponse.tasks.reduce((sum, task) => sum + task.planning.totalPlannedMinutes, 0);
    const totalHours = Math.round(totalMinutes / 60);
    
    // Encontrar datas de início e fim (usar schedule.startDate/endDate se disponíveis, senão usar da rule)
    const startDates = apiResponse.tasks.map(t => {
      const startDateStr = t.schedule.startDate || t.schedule.rule.startDate;
      return new Date(startDateStr);
    });
    const endDates = apiResponse.tasks.map(t => {
      const endDateStr = t.schedule.endDate || t.schedule.rule.endDate;
      return new Date(endDateStr);
    });
    const startDate = new Date(Math.min(...startDates.map(d => d.getTime())));
    const endDate = new Date(Math.max(...endDates.map(d => d.getTime())));

    // Mapear categoria da API para categoria do sistema
    const categoryMap: Record<string, 'study' | 'training' | 'health' | 'work'> = {
      'study': 'study',
      'training': 'training',
      'health': 'health',
      'work': 'work',
      'fitness': 'training',
      'personal': 'health',
      'outros': 'study',
    };
    const mappedCategory = categoryMap[apiResponse.objective.category] || 'study';

    // Criar Objective
    const newObjective = {
      id: objectiveId,
      title: apiResponse.objective.title,
      description: apiResponse.objective.description,
      category: mappedCategory,
      totalHours: totalHours,
      completedHours: 0,
      startDate: startDate,
      endDate: endDate,
      status: 'on-track' as const,
      tasks: [],
      createdAt: new Date(),
    };

    // Converter Tasks - Gerar todas as ocorrências baseadas na regra recorrente
    const newTasks: any[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetar horas para comparação de datas
    
    // #region agent log
    // Log das tarefas recebidas da API para verificar estrutura
    const taskSamples = apiResponse.tasks.slice(0, 2).map(t => ({
      title: t.title.substring(0, 30),
      scheduleStartDate: t.schedule.startDate || t.schedule.rule.startDate,
      scheduleEndDate: t.schedule.endDate || t.schedule.rule.endDate,
      ruleStartDate: t.schedule.rule.startDate,
      ruleEndDate: t.schedule.rule.endDate,
      daysOfWeek: t.schedule.rule.daysOfWeek,
    }));
    fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.tsx:1378',message:'handleAcceptPlan START task generation',data:{totalApiTasks:apiResponse.tasks.length,today:today.toISOString(),taskSamples},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-existing-plan',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
    
    apiResponse.tasks.forEach((task, taskIndex) => {
      // Usar startDate e endDate do schedule se disponíveis, senão usar da rule (compatibilidade)
      const scheduleStartDate = task.schedule.startDate || task.schedule.rule.startDate;
      const scheduleEndDate = task.schedule.endDate || task.schedule.rule.endDate;
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.tsx:1390',message:'Task date extraction',data:{taskIndex,title:task.title.substring(0,30),scheduleStartDate,scheduleEndDate,ruleStartDate:task.schedule.rule.startDate,ruleEndDate:task.schedule.rule.endDate,hasScheduleStartDate:!!task.schedule.startDate,hasScheduleEndDate:!!task.schedule.endDate},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-existing-plan',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
      
      const startDateObj = new Date(scheduleStartDate);
      startDateObj.setHours(0, 0, 0, 0);
      const endDateObj = new Date(scheduleEndDate);
      endDateObj.setHours(23, 59, 59, 999); // Incluir o último dia
      const scheduledTime = task.schedule.time;
      const daysOfWeek = task.schedule.rule.daysOfWeek || [];
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.tsx:1385',message:'Processing recurring task ENTRY',data:{taskIndex,taskTitle:task.title,scheduleStartDate:scheduleStartDate,scheduleEndDate:scheduleEndDate,startDate:startDateObj.toISOString(),endDate:endDateObj.toISOString(),daysOfWeek,scheduledTime,daysOfWeekType:typeof daysOfWeek[0]},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-task-generation',hypothesisId:'C,E'})}).catch(()=>{});
      // #endregion
      
      // Começar da data de início ou de hoje, o que for maior (não criar tarefas passadas)
      let currentDate = new Date(Math.max(startDateObj.getTime(), today.getTime()));
      currentDate.setHours(0, 0, 0, 0);
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.tsx:1399',message:'Date range setup',data:{taskIndex,startDateObj:startDateObj.toISOString(),endDateObj:endDateObj.toISOString(),currentDateStart:currentDate.toISOString(),today:today.toISOString(),dateRangeValid:currentDate <= endDateObj,daysDiff:Math.ceil((endDateObj.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-task-generation',hypothesisId:'A,D'})}).catch(()=>{});
      // #endregion
      
      let loopIteration = 0;
      let tasksCreatedForThisTask = 0;
      
      // Iterar por todos os dias no intervalo
      while (currentDate <= endDateObj) {
        loopIteration++;
        const currentDayOfWeek = currentDate.getDay(); // 0 = Domingo, 1 = Segunda, etc.
        const isDayIncluded = daysOfWeek.includes(currentDayOfWeek);
        
        // #region agent log
        if (loopIteration <= 10 || isDayIncluded || loopIteration % 7 === 0) { // Log primeiras 10 iterações, dias incluídos, ou a cada semana
          fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.tsx:1404',message:'While loop iteration',data:{taskIndex,loopIteration,currentDate:currentDate.toISOString(),currentDayOfWeek,daysOfWeek,isDayIncluded,currentDateBeforeAdvance:currentDate.toISOString()},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-task-generation',hypothesisId:'A,C'})}).catch(()=>{});
        }
        // #endregion
        
        // Verificar se este dia da semana está na lista de dias especificados
        if (isDayIncluded) {
          // Criar uma cópia explícita da data usando timestamp para garantir unicidade
          const currentDateTimestamp = currentDate.getTime();
          const taskScheduledDate = new Date(currentDateTimestamp); // Usar timestamp para criar nova instância
          taskScheduledDate.setHours(0, 0, 0, 0);
          
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.tsx:1427',message:'Creating task date copy',data:{taskIndex,loopIteration,currentDateBeforeCopy:currentDate.toISOString(),currentDateTimestamp,taskScheduledDateAfterCopy:taskScheduledDate.toISOString(),taskScheduledDateTimestamp:taskScheduledDate.getTime(),datesMatch:currentDateTimestamp === taskScheduledDate.getTime()},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-same-date-issue',hypothesisId:'A,C'})}).catch(()=>{});
          // #endregion
          
          // Criar tarefa para este dia (não precisa verificar duplicatas pois cada tarefa é única por data+horário+título)
          const newTask = {
            id: `t${Date.now()}-${taskIndex}-${currentDateTimestamp}-${Math.random().toString(36).substr(2, 9)}`,
            objectiveId: objectiveId,
            title: task.title,
            description: task.description,
            scheduledDate: new Date(currentDateTimestamp), // Criar nova instância usando timestamp
            scheduledTime: scheduledTime,
            durationMinutes: task.planning.sessionPlannedMinutes,
            completedMinutes: 0,
            status: 'pending' as const,
            isTimerRunning: false,
          };
          newTasks.push(newTask);
          tasksCreatedForThisTask++;
          
          // #region agent log
          // Verificar se a data na tarefa é realmente diferente das anteriores
          const previousTaskDates = newTasks.slice(0, -1).map(t => new Date(t.scheduledDate).toISOString().split('T')[0]);
          fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.tsx:1444',message:'Task created and pushed',data:{taskIndex,loopIteration,taskId:newTask.id,currentDateValue:currentDate.toISOString(),scheduledDateInTask:newTask.scheduledDate.toISOString(),scheduledDateDateOnly:newTask.scheduledDate.toISOString().split('T')[0],scheduledTime:newTask.scheduledTime,title:newTask.title.substring(0,30),tasksCreatedForThisTask,newTasksCount:newTasks.length,previousTaskDates},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-same-date-issue',hypothesisId:'A,C'})}).catch(()=>{});
          // #endregion
        }
        
        // Avançar para o próximo dia - criar nova instância para evitar mutação
        const dateBeforeAdvance = currentDate.toISOString();
        const dateBeforeAdvanceTimestamp = currentDate.getTime();
        currentDate = new Date(currentDate); // Criar nova instância antes de modificar
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(0, 0, 0, 0);
        const dateAfterAdvance = currentDate.toISOString();
        
        // #region agent log
        if (loopIteration <= 10) { // Log primeiras 10 iterações para verificar avanço de data
          fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.tsx:1453',message:'Date advanced in loop',data:{taskIndex,loopIteration,dateBeforeAdvance,dateBeforeAdvanceTimestamp,dateAfterAdvance,dateAfterAdvanceTimestamp:currentDate.getTime(),stillInRange:currentDate <= endDateObj},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-same-date-issue',hypothesisId:'A,D'})}).catch(()=>{});
        }
        // #endregion
        
        // #region agent log
        if (loopIteration <= 5) { // Log primeiras 5 iterações para verificar avanço de data
          fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.tsx:1436',message:'Date advanced in loop',data:{taskIndex,loopIteration,dateBeforeAdvance,dateAfterAdvance,stillInRange:currentDate <= endDateObj},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-task-generation',hypothesisId:'A'})}).catch(()=>{});
        }
        // #endregion
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.tsx:1438',message:'Finished processing task',data:{taskIndex,taskTitle:task.title,loopIterations:loopIteration,tasksCreatedForThisTask,totalNewTasks:newTasks.length},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-task-generation',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
    });
    
    // #region agent log
    // Extrair datas únicas para verificar se estão sendo criadas corretamente
    const uniqueDates = [...new Set(newTasks.map(t => t.scheduledDate.toISOString().split('T')[0]))];
    const dateCounts = newTasks.reduce((acc: Record<string, number>, t) => {
      const dateStr = t.scheduledDate.toISOString().split('T')[0];
      acc[dateStr] = (acc[dateStr] || 0) + 1;
      return acc;
    }, {});
    fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.tsx:1466',message:'Generated tasks from schedule',data:{totalTasks:newTasks.length,uniqueDatesCount:uniqueDates.length,uniqueDates,dateCounts,firstFewTasks:newTasks.slice(0,5).map(t => ({date:t.scheduledDate.toISOString().split('T')[0],time:t.scheduledTime,title:t.title.substring(0,30)}))},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-same-date-issue',hypothesisId:'ALL'})}).catch(()=>{});
    // #endregion

    // Salvar no localStorage
    try {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.tsx:1216',message:'handleAcceptPlan SAVING',data:{objectiveId,objectiveTitle:newObjective.title,tasksCount:newTasks.length},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'J'})}).catch(()=>{});
      // #endregion
      // Carregar objetivos existentes
      const existingObjectives = localStorage.getItem('objectives');
      const objectives = existingObjectives ? JSON.parse(existingObjectives) : [];
      objectives.push(newObjective);
      localStorage.setItem('objectives', JSON.stringify(objectives));
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.tsx:1222',message:'handleAcceptPlan SAVED objectives',data:{objectivesCount:objectives.length},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'J'})}).catch(()=>{});
      // #endregion

      // Carregar tarefas existentes
      const existingTasks = localStorage.getItem('tasks');
      const tasks = existingTasks ? JSON.parse(existingTasks) : [];
      
      // Converter datas para strings ISO antes de salvar para evitar problemas de serialização
      const tasksToSave = newTasks.map(t => ({
        ...t,
        scheduledDate: t.scheduledDate.toISOString(), // Converter Date para string ISO
      }));
      
      tasks.push(...tasksToSave);
      
      // #region agent log
      // Verificar como as datas estão sendo serializadas ao salvar
      const sampleTasks = tasksToSave.slice(0, 3).map(t => ({
        id: t.id,
        title: t.title.substring(0, 30),
        scheduledDateISO: t.scheduledDate, // Já é string agora
      }));
      fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.tsx:1525',message:'Saving tasks to localStorage',data:{totalNewTasks:newTasks.length,totalTasksToSave:tasksToSave.length,sampleTasks},timestamp:Date.now(),sessionId:'debug-session',runId:'debug-same-date-issue',hypothesisId:'ALL'})}).catch(()=>{});
      // #endregion
      
      localStorage.setItem('tasks', JSON.stringify(tasks));
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.tsx:1228',message:'handleAcceptPlan SAVED tasks',data:{tasksCount:tasks.length},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'J'})}).catch(()=>{});
      // #endregion
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.tsx:1230',message:'handleAcceptPlan ERROR',data:{error:error instanceof Error ? error.message : 'Unknown error'},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'J'})}).catch(()=>{});
      // #endregion
      console.error('Erro ao salvar no localStorage:', error);
    }

    const successMessage: ChatMessage = {
      id: `success-${Date.now()}`,
      role: 'assistant',
      content: 'Plano aceito! 🎉\n\nSeu plano foi salvo com sucesso. Você pode visualizá-lo na página de Objetivos.',
      timestamp: new Date(),
      type: 'text',
    };
    setMessages(prev => [...prev, successMessage]);

    // Redirecionar após 2 segundos
    setTimeout(() => {
      navigate('/objectives');
    }, 2000);
  };

  // Rejeitar plano
  const handleRejectPlan = () => {
    setFormData({
      availability: {
        days: [],
        timeRange: {
          start: '',
          end: '',
        },
      },
      period: undefined,
    });
    setCurrentStep(0);
    setApiResponse(null);
    setMessages(initialMessages);
    
    setTimeout(() => {
      showCurrentQuestion();
    }, 1000);
  };


  return (
    <MainLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 pb-6 border-b border-glass-border"
        >
          <div className="relative">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-neon flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-card" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Agente de Rotinas</h1>
            <p className="text-sm text-muted-foreground">Online • Pronto para ajudar</p>
          </div>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {(() => {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.tsx:1179',message:'RENDER messages list',data:{messagesCount:messages.length,messageTypes:messages.map(m => ({id:m.id,type:m.type})),questionMessages:messages.filter(m => m.type === 'question').length},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            return messages.map((message, index) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                index={index}
                onAcceptPlan={handleAcceptPlan}
                onRejectPlan={handleRejectPlan}
              />
            ));
          })()}
          <AnimatePresence>
            {isSubmitting && <TypingIndicator />}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions / YesNo Options - Above Input */}
        {(() => {
          const shouldRender = currentQuestion && currentQuestion.type === 'yesno' && !isSubmitting;
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/f79c4dbd-acd8-4407-a575-5704925c9884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.tsx:1181',message:'RENDER YesNo buttons check',data:{currentQuestionExists:!!currentQuestion,currentQuestionType:currentQuestion?.type,isSubmitting,willRender:shouldRender},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          if (!shouldRender) return null;
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-6 pb-4 border-t border-glass-border pt-4"
            >
              <div className="flex gap-2 justify-center flex-wrap">
                <Button
                  variant={formData.hasExistingPlan === true ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    currentQuestion.setValue(true);
                    setTimeout(() => handleNext(), 300);
                  }}
                  className="text-xs px-4 py-1.5 h-auto"
                >
                  SIM
                </Button>
                <Button
                  variant={formData.hasExistingPlan === false ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    currentQuestion.setValue(false);
                    setTimeout(() => handleNext(), 300);
                  }}
                  className="text-xs px-4 py-1.5 h-auto"
                >
                  NÃO
                </Button>
              </div>
            </motion.div>
          );
        })()}

        {/* Input Area - Hidden when yesno question is active */}
 
      </div>
    </MainLayout>
  );
}
