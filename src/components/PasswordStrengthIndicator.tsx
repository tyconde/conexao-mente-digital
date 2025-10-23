import { Check, X } from "lucide-react";
import { checkPasswordStrength, PasswordStrength } from "@/lib/validation";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const strength = checkPasswordStrength(password);

  const requirements = [
    { key: "minLength", label: "Mínimo de 8 caracteres", met: strength.minLength },
    { key: "hasLettersAndNumbers", label: "Contém letras e números", met: strength.hasLettersAndNumbers },
    { key: "hasUpperCase", label: "Contém letra maiúscula", met: strength.hasUpperCase },
  ];

  // Só mostra se o usuário começou a digitar
  if (!password) return null;

  return (
    <div className="mt-2 space-y-1 text-sm" role="status" aria-live="polite">
      {requirements.map((req) => (
        <div
          key={req.key}
          className={`flex items-center gap-2 transition-colors ${
            req.met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
          }`}
        >
          {req.met ? (
            <Check className="w-4 h-4" aria-label="Requisito atendido" />
          ) : (
            <X className="w-4 h-4" aria-label="Requisito não atendido" />
          )}
          <span>{req.label}</span>
        </div>
      ))}
    </div>
  );
};
