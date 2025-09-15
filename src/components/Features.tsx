
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Calendar, Settings, Search, CheckCircle } from "lucide-react";

export const Features = () => {
  const features = [
    {
      icon: Shield,
      title: "Segurança e Privacidade",
      description: "Criptografia ponta-a-ponta e conformidade total com LGPD e diretrizes do CFP",
      color: "text-blue-600"
    },
    {
      icon: Search,
      title: "Busca Inteligente",
      description: "Algoritmos de matching que conectam pacientes aos profissionais mais adequados",
      color: "text-green-600"
    },
    {
      icon: Calendar,
      title: "Agendamento Integrado",
      description: "Sistema completo de agendamento com lembretes automáticos e sincronização",
      color: "text-purple-600"
    },
    {
      icon: Settings,
      title: "Gestão Profissional",
      description: "Ferramentas completas para gestão financeira, prontuários e relatórios",
      color: "text-orange-600"
    },
    {
      icon: Users,
      title: "Comunicação Segura",
      description: "Chat integrado com videoconferência segura para atendimentos remotos",
      color: "text-indigo-600"
    },
    {
      icon: CheckCircle,
      title: "Validação CRP",
      description: "Verificação automática de credenciais profissionais via sistema e-Psi",
      color: "text-red-600"
    }
  ];

  return (
    <section id="features" className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Recursos Avançados
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nossa plataforma oferece tudo que você precisa para uma experiência completa 
            e segura no atendimento psicológico digital
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 ${feature.color}`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
