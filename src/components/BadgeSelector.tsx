import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { PROFESSIONAL_BADGES, BadgeId } from "@/constants/professionalData";

interface BadgeSelectorProps {
  selectedBadges: BadgeId[];
  onChange: (badges: BadgeId[]) => void;
  disabled?: boolean;
}

export const BadgeSelector = ({ selectedBadges, onChange, disabled = false }: BadgeSelectorProps) => {
  const handleToggleBadge = (badgeId: BadgeId) => {
    if (selectedBadges.includes(badgeId)) {
      onChange(selectedBadges.filter(id => id !== badgeId));
    } else {
      onChange([...selectedBadges, badgeId]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base mb-2 block">Habilidades e Familiaridades</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Selecione as habilidades específicas e áreas de familiaridade que você possui. 
          Estas serão destacadas no seu perfil como badges especiais.
        </p>

        {/* Badges selecionadas */}
        {selectedBadges.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
            {selectedBadges.map((badgeId) => {
              const badge = PROFESSIONAL_BADGES.find(b => b.id === badgeId);
              if (!badge) return null;
              const Icon = badge.icon;
              
              return (
                <Badge key={badgeId} variant="secondary" className="gap-1.5 py-1.5 px-3">
                  <Icon className="w-3.5 h-3.5" />
                  {badge.label}
                </Badge>
              );
            })}
          </div>
        )}

        {/* Grid de badges disponíveis */}
        <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto p-3 border rounded-lg bg-card">
          {PROFESSIONAL_BADGES.map((badge) => {
            const Icon = badge.icon;
            
            return (
              <div key={badge.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                <Checkbox
                  id={badge.id}
                  checked={selectedBadges.includes(badge.id as BadgeId)}
                  onCheckedChange={() => handleToggleBadge(badge.id as BadgeId)}
                  disabled={disabled}
                />
                <label
                  htmlFor={badge.id}
                  className="flex items-center gap-2 text-sm leading-tight cursor-pointer flex-1"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{badge.label}</span>
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
