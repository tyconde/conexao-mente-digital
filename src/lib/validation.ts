// Validações de formulário com mensagens amigáveis

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, message: "Por favor, insira seu e-mail." };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Por favor, insira um e-mail válido (ex: exemplo@email.com)." };
  }
  
  // Verificar domínio incompleto
  const domain = email.split('@')[1];
  if (domain && !domain.includes('.') || domain?.endsWith('.')) {
    return { isValid: false, message: "Ops! Parece que o e-mail está incompleto. Pode revisar?" };
  }
  
  return { isValid: true };
};

export interface PasswordStrength {
  minLength: boolean;
  hasLettersAndNumbers: boolean;
  hasUpperCase: boolean;
  hasSpecialChar: boolean;
}

export const checkPasswordStrength = (password: string): PasswordStrength => {
  return {
    minLength: password.length >= 8,
    hasLettersAndNumbers: /[a-zA-Z]/.test(password) && /[0-9]/.test(password),
    hasUpperCase: /[A-Z]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: "Por favor, crie uma senha." };
  }
  
  const strength = checkPasswordStrength(password);
  
  if (!strength.minLength) {
    return { isValid: false, message: "A senha deve ter pelo menos 8 caracteres." };
  }
  
  if (!strength.hasLettersAndNumbers) {
    return { isValid: false, message: "A senha deve conter letras e números." };
  }
  
  if (!strength.hasUpperCase) {
    return { isValid: false, message: "A senha deve conter pelo menos uma letra maiúscula." };
  }
  
  return { isValid: true };
};

export const validatePasswordConfirmation = (password: string, confirmation: string): ValidationResult => {
  if (password !== confirmation) {
    return { isValid: false, message: "As senhas não coincidem." };
  }
  return { isValid: true };
};

export const validateFullName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, message: "Por favor, digite seu nome completo." };
  }
  
  const trimmedName = name.trim();
  
  // Verificar se tem pelo menos 2 palavras
  const words = trimmedName.split(/\s+/);
  if (words.length < 2) {
    return { isValid: false, message: "Digite seu nome completo (nome e sobrenome)." };
  }
  
  // Verificar repetição de caracteres
  if (/(.)\1{5,}/.test(trimmedName)) {
    return { isValid: false, message: "Por favor, digite um nome válido." };
  }
  
  // Verificar se não é apenas números
  if (/^\d+$/.test(trimmedName)) {
    return { isValid: false, message: "O nome não pode conter apenas números." };
  }
  
  // Verificar se cada palavra tem pelo menos 2 caracteres
  if (words.some(word => word.length < 2)) {
    return { isValid: false, message: "Digite seu nome completo (nome e sobrenome)." };
  }
  
  return { isValid: true };
};

export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: false, message: "Por favor, digite seu telefone." };
  }
  
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length < 10) {
    return { isValid: false, message: "Por favor, digite um telefone válido." };
  }
  
  return { isValid: true };
};

export const validateCRP = (crp: string): ValidationResult => {
  if (!crp) {
    return { isValid: false, message: "Por favor, digite seu CRP." };
  }
  
  // Formato básico: XX/XXXXXX ou XX-XXXXXX
  const crpRegex = /^\d{2}[/-]\d{4,6}$/;
  
  if (!crpRegex.test(crp)) {
    return { isValid: false, message: "Por favor, digite um CRP válido (ex: 06/123456)." };
  }
  
  return { isValid: true };
};

// ===========================
// Funções de Formatação
// ===========================

export const formatPhone = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limited = numbers.slice(0, 11);
  
  // Aplica a formatação
  if (limited.length <= 2) {
    return limited;
  } else if (limited.length <= 6) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
  } else if (limited.length <= 10) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
  } else {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
  }
};

export const formatCRP = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 8 dígitos (2 do estado + 6 do número)
  const limited = numbers.slice(0, 8);
  
  // Aplica a formatação
  if (limited.length <= 2) {
    return limited;
  } else {
    return `${limited.slice(0, 2)}/${limited.slice(2)}`;
  }
};
