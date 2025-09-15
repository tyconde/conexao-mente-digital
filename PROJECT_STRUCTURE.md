# 📋 Projeto Psicólogos - Estrutura e Organização

## 📁 Estrutura de Pastas

### `/src` - Código fonte principal
```
src/
├── components/           # Componentes React reutilizáveis
├── hooks/               # Hooks personalizados para lógica de estado
├── pages/               # Páginas principais da aplicação
├── lib/                 # Utilitários e configurações
├── App.tsx             # Componente raiz da aplicação
├── main.tsx            # Ponto de entrada da aplicação
└── index.css           # Estilos globais e tokens do design system
```

### `/public` - Arquivos públicos
```
public/
├── lovable-uploads/     # Imagens enviadas pelos usuários
├── robots.txt          # Configuração para crawlers
└── favicon.ico         # Ícone da aplicação
```

## 🧩 Componentes (`/src/components`)

### Componentes Principais de Funcionalidade
- **`AuthModal.tsx`** - Modal de login/cadastro
- **`Navigation.tsx`** - Barra de navegação principal
- **`UserTypeSelector.tsx`** - Seletor de tipo de usuário (paciente/profissional)

### Componentes de Dashboard
- **`PatientAppointments.tsx`** - Lista de consultas do paciente
- **`ProfessionalMessages.tsx`** - Interface de mensagens do profissional
- **`AppointmentCalendar.tsx`** - Calendário para agendamentos
- **`Statistics.tsx`** - Estatísticas e gráficos
- **`ReportsSection.tsx`** - Seção de relatórios

### Componentes de Configuração
- **`ScheduleConfigModal.tsx`** - Configuração de horários do profissional
- **`PriceConfigModal.tsx`** - Configuração de preços
- **`ProntuarioModal.tsx`** - Modal de prontuários

### Componentes de Comunicação
- **`MessagesModal.tsx`** - Interface principal de mensagens
- **`NotificationBell.tsx`** - Sino de notificações

### Componentes de Utilidade
- **`ProfileImageUpload.tsx`** - Upload de foto de perfil
- **`DetailedAddressForm.tsx`** - Formulário de endereço detalhado
- **`FavoritesList.tsx`** - Lista de profissionais favoritos
- **`DashboardFilters.tsx`** - Filtros do dashboard

### Componentes de Interface
- **`Hero.tsx`** - Seção hero da página inicial
- **`Features.tsx`** - Seção de funcionalidades
- **`Footer.tsx`** - Rodapé da aplicação
- **`ProfessionalCard.tsx`** - Card de apresentação do profissional

### Componentes UI (`/src/components/ui`)
Componentes do shadcn/ui para interface:
- `button.tsx`, `input.tsx`, `card.tsx`, `dialog.tsx`, etc.
- Sistema de design baseado em Tailwind CSS

## 🎣 Hooks Personalizados (`/src/hooks`)

### Hooks de Autenticação e Usuário
- **`useAuth.tsx`** - Gerenciamento de autenticação e estado do usuário
- **`useRegisteredPsychologists.tsx`** - Lista de psicólogos cadastrados

### Hooks de Funcionalidades
- **`useAppointments.tsx`** - Gerenciamento de consultas
- **`useProfessionalAppointments.tsx`** - Consultas específicas do profissional
- **`useMessages.tsx`** - Sistema de mensagens entre usuários
- **`useNotifications.tsx`** - Sistema de notificações
- **`useFavorites.tsx`** - Gerenciamento de favoritos
- **`useProntuarios.tsx`** - Gerenciamento de prontuários
- **`usePatients.tsx`** - Gerenciamento de pacientes
- **`useAvailableSlots.tsx`** - Horários disponíveis para agendamento

### Hooks de Utilidade
- **`use-mobile.tsx`** - Detecção de dispositivos móveis
- **`use-toast.ts`** - Sistema de toast notifications

## 📄 Páginas (`/src/pages`)

- **`Index.tsx`** - Página inicial (landing page)
- **`PatientDashboard.tsx`** - Dashboard do paciente
- **`ProfessionalDashboard.tsx`** - Dashboard do profissional
- **`Profile.tsx`** - Página de perfil do usuário
- **`About.tsx`** - Página sobre
- **`Contact.tsx`** - Página de contato
- **`NotFound.tsx`** - Página 404

## 🗄️ Dados Armazenados no LocalStorage

### Dados de Usuários (Devem migrar para banco de dados)

#### `registeredUsers` - Lista de usuários cadastrados
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  type: "patient" | "professional";
  crp?: string;              // Apenas profissionais
  specialty?: string;        // Apenas profissionais
  password: string;          // ⚠️ CRÍTICO: Senhas em texto plano
  profileImage?: string;     // Base64 da foto de perfil
}
```

#### `currentUser` - Usuário logado atualmente
```typescript
interface CurrentUser {
  // Mesma estrutura do User, mas sem o campo password
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  type: "patient" | "professional";
  crp?: string;
  specialty?: string;
  profileImage?: string;
}
```

### Dados de Configurações Profissionais

#### `professional_settings_{userId}` - Configurações individuais
```typescript
interface ProfessionalSettings {
  attendanceTypes: {
    remoto: boolean;
    presencial: boolean;
  };
  address: string;           // Endereço do consultório
  schedule?: {               // Horários de atendimento
    [day: string]: {
      start: string;
      end: string;
      enabled: boolean;
    }
  }
}
```

#### `professionalPrices` - Preços dos profissionais
```typescript
interface ProfessionalPrices {
  [userId: number]: number;  // Preço por sessão
}
```

### Dados de Consultas e Agendamentos

#### `appointments` - Lista de consultas agendadas
```typescript
interface Appointment {
  id: number;
  patientId: number;
  professionalId: number;
  patientName: string;
  professionalName: string;
  date: string;              // ISO date string
  time: string;              // Horário da consulta
  type: "remoto" | "presencial";
  notes?: string;
  status: "agendada" | "concluida" | "cancelada";
  price?: number;
}
```

### Dados de Comunicação

#### `conversations` - Conversas entre usuários
```typescript
interface Conversation {
  id: string;                // Format: "patientId-professionalId"
  patientId: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

interface Message {
  id: number;
  senderId: string;
  senderName: string;
  senderType: "patient" | "professional";
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: string;
  read: boolean;
  appointmentId?: number;
}
```

### Dados de Relacionamento

#### `favorites_{userId}` - Lista de favoritos por usuário
```typescript
interface Favorite {
  id: number;
  userId: number;            // ID do usuário que favoritou
  professionalId: number;    // ID do profissional favoritado
  addedAt: string;          // Data de adição
}
```

#### `prontuarios` - Prontuários médicos
```typescript
interface Prontuario {
  id: number;
  patientId: number;
  professionalId: number;
  appointmentId?: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}
```

#### `notifications_{userId}` - Notificações por usuário
```typescript
interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: "appointment" | "message" | "system";
  read: boolean;
  createdAt: string;
  appointmentId?: number;
}
```

## ⚠️ Problemas de Segurança Identificados

### 🔴 CRÍTICOS
1. **Senhas em texto plano** - Armazenadas sem criptografia no localStorage
2. **Dados sensíveis no cliente** - Informações médicas no navegador
3. **Sem autenticação real** - Sistema baseado apenas em localStorage
4. **Dados não sincronizados** - Usuários diferentes não veem as mesmas informações

### 🟡 IMPORTANTES  
1. **Imagens em Base64** - Podem ser muito grandes para localStorage
2. **Sem backup** - Dados podem ser perdidos facilmente
3. **Sem validação server-side** - Qualquer dado pode ser inserido
4. **Performance** - LocalStorage não é otimizado para grandes volumes

## 🎯 Recomendações para Migração

### Prioridade 1 - Segurança
- Migrar autenticação para sistema seguro
- Criptografar senhas com hash
- Implementar sessões e tokens JWT

### Prioridade 2 - Dados Críticos
- Migrar usuários e perfis
- Migrar consultas e agendamentos
- Migrar mensagens e conversas

### Prioridade 3 - Funcionalidades
- Migrar prontuários e dados médicos
- Migrar favoritos e preferências
- Implementar notificações em tempo real

### Prioridade 4 - Otimização
- Sistema de upload de imagens
- Cache inteligente
- Sincronização offline