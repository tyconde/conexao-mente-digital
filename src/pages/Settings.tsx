import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AccessibilitySettings } from "@/components/AccessibilitySettings";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Configurações e Acessibilidade
          </h1>
          <p className="text-muted-foreground">
            Personalize sua experiência na plataforma com opções de tema, tamanho de fonte e contraste
          </p>
        </div>
        <AccessibilitySettings />
      </main>
      <Footer />
    </div>
  );
};

export default Settings;
