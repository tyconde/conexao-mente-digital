import { 
  Briefcase, 
  Baby, 
  Building2, 
  Brain, 
  GraduationCap, 
  Users, 
  Trophy, 
  Hospital, 
  Scale,
  MessageCircle,
  Heart,
  Hand,
  Zap,
  CloudRain,
  BookOpen,
  Flower2,
  Ribbon,
  HeartHandshake,
  Pill,
  Apple,
  UserCircle,
  Sparkles,
  Shield,
  LucideIcon
} from "lucide-react";

// Especialidades tradicionais da psicologia (APENAS áreas de atuação)
export const PSYCHOLOGY_SPECIALTIES = [
  "Psicologia Clínica",
  "Psicologia Infantil",
  "Psicologia Organizacional",
  "Neuropsicologia",
  "Psicologia Escolar",
  "Psicologia Social",
  "Psicologia do Esporte",
  "Psicologia Hospitalar",
  "Psicanálise",
  "Terapia Cognitivo-Comportamental (TCC)",
  "Psicologia Familiar",
  "Psicologia Jurídica",
  "Psicologia do Trânsito",
  "Psicologia Comunitária",
  "Terapia de Casal",
  "Terapia de Grupo"
] as const;

export type PsychologySpecialty = typeof PSYCHOLOGY_SPECIALTIES[number];

// Badges de habilidades e familiaridades
export interface BadgeOption {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string; // Cor temática para o badge
}

export const PROFESSIONAL_BADGES: BadgeOption[] = [
  {
    id: "knowsLibras",
    label: "Fluente em Libras",
    icon: Hand,
    color: "blue"
  },
  {
    id: "isAutismFriendly",
    label: "Familiaridade com Autismo/TEA",
    icon: Brain,
    color: "purple"
  },
  {
    id: "isDownSyndromeFriendly",
    label: "Familiaridade com Síndrome de Down",
    icon: Heart,
    color: "blue"
  },
  {
    id: "isAdhdFriendly",
    label: "Familiaridade com TDAH",
    icon: Zap,
    color: "yellow"
  },
  {
    id: "isAnxietyDepressionFriendly",
    label: "Ansiedade e Depressão",
    icon: CloudRain,
    color: "indigo"
  },
  {
    id: "isLearningDisorderFriendly",
    label: "Transtornos de Aprendizagem",
    icon: BookOpen,
    color: "green"
  },
  {
    id: "isGriefFriendly",
    label: "Luto e Perdas",
    icon: Flower2,
    color: "slate"
  },
  {
    id: "isWomenFocused",
    label: "Atendimento para Mulheres",
    icon: Ribbon,
    color: "pink"
  },
  {
    id: "isChildrenFocused",
    label: "Atendimento Infantil",
    icon: Baby,
    color: "cyan"
  },
  {
    id: "isTeenFocused",
    label: "Atendimento para Adolescentes",
    icon: UserCircle,
    color: "violet"
  },
  {
    id: "isElderlyFocused",
    label: "Atendimento para Idosos",
    icon: Users,
    color: "amber"
  },
  {
    id: "isCoupleTherapyFocused",
    label: "Terapia de Casal",
    icon: HeartHandshake,
    color: "rose"
  },
  {
    id: "isAddictionFriendly",
    label: "Dependência Química",
    icon: Pill,
    color: "red"
  },
  {
    id: "isEatingDisorderFriendly",
    label: "Transtornos Alimentares",
    icon: Apple,
    color: "lime"
  },
  {
    id: "isLgbtqiaFriendly",
    label: "Atendimento Afirmativo LGBTQIA+",
    icon: Sparkles,
    color: "rainbow"
  },
  {
    id: "isTraumaFriendly",
    label: "Traumas e TEPT",
    icon: Shield,
    color: "orange"
  },
  {
    id: "isBurnoutFriendly",
    label: "Burnout e Estresse Ocupacional",
    icon: Briefcase,
    color: "gray"
  },
  {
    id: "isPregnancyPostpartumFriendly",
    label: "Gestação e Pós-parto",
    icon: Heart,
    color: "pink"
  }
];

export type BadgeId = typeof PROFESSIONAL_BADGES[number]['id'];
