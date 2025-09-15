
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Conectando
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  {" "}Mentes
                </span>
                <br />
                Transformando Vidas
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Plataforma digital integrada que conecta pacientes a psicólogos qualificados, 
                facilitando o acesso à saúde mental com segurança, transparência e eficiência.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground px-8 py-3"
              >
                Começar Agora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-primary text-primary hover:bg-accent"
              >
                <Play className="mr-2 w-5 h-5" />
                Ver Demonstração
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">500+</div>
                <div className="text-sm text-muted-foreground">Psicólogos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">2000+</div>
                <div className="text-sm text-muted-foreground">Pacientes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">98%</div>
                <div className="text-sm text-muted-foreground">Satisfação</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary to-accent rounded-3xl transform rotate-3"></div>
            <div className="relative bg-card rounded-3xl p-8 shadow-2xl">
              <img 
                src="/lovable-uploads/0b2c5215-c726-416c-bd3e-38f91fd8b0e7.png" 
                alt="Sessão de Psicoterapia - Profissional anotando durante consulta" 
                className="w-full h-64 object-cover rounded-2xl"
              />
              <div className="mt-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Atendimento seguro e confidencial</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-secondary rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Profissionais certificados pelo CFP</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Conformidade com LGPD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
