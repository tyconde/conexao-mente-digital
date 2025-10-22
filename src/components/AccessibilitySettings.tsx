import { Moon, Sun, Type, Contrast } from "lucide-react";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

const FONT_SIZES = [
  { value: 'small', label: 'Pequeno', size: 14 },
  { value: 'medium', label: 'Médio', size: 16 },
  { value: 'large', label: 'Grande', size: 18 },
  { value: 'extra-large', label: 'Extra Grande', size: 20 },
];

export const AccessibilitySettings = () => {
  const { theme, fontSize, contrast, setTheme, setFontSize, setContrast } = useAccessibility();

  const fontSizeIndex = FONT_SIZES.findIndex(f => f.value === fontSize);

  const handleFontSizeChange = (value: number[]) => {
    const newSize = FONT_SIZES[value[0]].value as typeof fontSize;
    setFontSize(newSize);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Theme Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Modo de Tema
          </CardTitle>
          <CardDescription>
            Escolha entre modo claro ou escuro para melhor conforto visual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="theme-mode" className="text-base">
              Modo Escuro
            </Label>
            <Switch
              id="theme-mode"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              aria-label="Alternar modo escuro"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
              className="flex-1"
              aria-pressed={theme === 'light'}
            >
              <Sun className="mr-2 h-4 w-4" />
              Claro
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
              className="flex-1"
              aria-pressed={theme === 'dark'}
            >
              <Moon className="mr-2 h-4 w-4" />
              Escuro
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Font Size */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Tamanho da Fonte
          </CardTitle>
          <CardDescription>
            Ajuste o tamanho do texto para melhor legibilidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="font-size-slider" className="text-base">
                Tamanho: {FONT_SIZES[fontSizeIndex].label}
              </Label>
              <span className="text-sm text-muted-foreground">
                {FONT_SIZES[fontSizeIndex].size}px
              </span>
            </div>
            <Slider
              id="font-size-slider"
              min={0}
              max={3}
              step={1}
              value={[fontSizeIndex]}
              onValueChange={handleFontSizeChange}
              className="w-full"
              aria-label="Controle de tamanho da fonte"
              aria-valuemin={0}
              aria-valuemax={3}
              aria-valuenow={fontSizeIndex}
              aria-valuetext={FONT_SIZES[fontSizeIndex].label}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Pequeno</span>
              <span>Médio</span>
              <span>Grande</span>
              <span>Extra Grande</span>
            </div>
          </div>
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-center">
              Este é um exemplo de texto com o tamanho selecionado
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contrast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Contrast className="h-5 w-5" />
            Contraste
          </CardTitle>
          <CardDescription>
            Ative o modo de alto contraste para melhor visualização
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="high-contrast" className="text-base">
              Alto Contraste
            </Label>
            <Switch
              id="high-contrast"
              checked={contrast === 'high'}
              onCheckedChange={(checked) => setContrast(checked ? 'high' : 'normal')}
              aria-label="Alternar alto contraste"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            O modo de alto contraste aumenta a diferença entre cores para melhor legibilidade,
            especialmente útil para pessoas com baixa visão ou daltonismo.
          </p>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>♿ Navegação por Teclado:</strong> Todos os elementos são navegáveis usando Tab,
            Enter e Espaço. As preferências são salvas automaticamente no seu navegador.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
