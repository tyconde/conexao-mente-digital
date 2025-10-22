
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Home, Shield, Heart, Users, Clock, MapPin, Award } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const About = () => {
  const testimonials = [
    {
      name: "Maria Silva",
      role: "Paciente há 8 meses",
      rating: 5,
      comment: "O PsiConnect facilitou muito minha busca por ajuda psicológica. A plataforma é intuitiva e me conectou com uma profissional excepcional que realmente me entende.",
      avatar: "MS"
    },
    {
      name: "João Santos",
      role: "Paciente há 1 ano",
      rating: 5,
      comment: "Poder escolher entre atendimento presencial e online foi fundamental para mim. A segurança da plataforma e a qualidade dos profissionais me deram total confiança.",
      avatar: "JS"
    },
    {
      name: "Dr. Ana Oliveira",
      role: "Psicóloga CRP 06/12345",
      rating: 5,
      comment: "Como profissional, valorizo muito a organização da plataforma. O sistema de agendamentos e prontuários digitais otimizou completamente minha prática clínica.",
      avatar: "AO"
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Segurança e Privacidade",
      description: "Todos os profissionais são verificados pelo CRP e os dados são protegidos com criptografia de ponta. Conformidade total com a LGPD."
    },
    {
      icon: Heart,
      title: "Cuidado Humanizado",
      description: "Conectamos pessoas a profissionais qualificados priorizando o match ideal entre paciente e terapeuta para melhores resultados."
    },
    {
      icon: Users,
      title: "Comunidade Ativa",
      description: "Mais de 250 psicólogos verificados e mais de 2.500 pacientes atendidos mensalmente em nossa plataforma."
    },
    {
      icon: Clock,
      title: "Disponibilidade Flexível",
      description: "Agendamentos 24/7 com horários flexíveis, incluindo opções de atendimento presencial e online para sua conveniência."
    },
    {
      icon: MapPin,
      title: "Cobertura Nacional",
      description: "Profissionais em todas as regiões do Brasil, garantindo acesso à saúde mental independente da sua localização."
    },
    {
      icon: Award,
      title: "Qualidade Comprovada",
      description: "Sistema de avaliações e feedback contínuo que garante a excelência no atendimento e satisfação dos usuários."
    }
  ];

  const stats = [
    { value: "250+", label: "Psicólogos Verificados" },
    { value: "2.500+", label: "Pacientes Ativos" },
    { value: "12.000+", label: "Consultas Realizadas" },
    { value: "4.8", label: "Nota Média (★★★★★)" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Sobre o PsiConnect</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Democratizando o acesso à saúde mental através da tecnologia e cuidado humanizado
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = "/"}
            className="flex items-center"
          >
            <Home className="w-4 h-4 mr-2" />
            Início
          </Button>
        </div>

        {/* Missão e Visão */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Heart className="w-6 h-6 mr-2 text-primary" />
                Nossa Missão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">
                Democratizar o acesso à saúde mental, conectando pacientes a psicólogos qualificados 
                através de uma plataforma segura, eficiente e humanizada. Acreditamos que toda pessoa 
                merece ter acesso a cuidados de qualidade para sua saúde mental.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Award className="w-6 h-6 mr-2 text-primary" />
                Nossa Visão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">
                Ser a principal plataforma de saúde mental no Brasil, reconhecida pela excelência 
                no atendimento, inovação tecnológica e impacto positivo na vida das pessoas, 
                tornando o cuidado psicológico mais acessível e efetivo.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Características e Diferenciais */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Por que escolher o PsiConnect?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <feature.icon className="w-6 h-6 mr-3 text-primary" />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Depoimentos */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Depoimentos Reais
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Avatar className="w-12 h-12 mr-4">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {testimonial.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{testimonial.name}</h3>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-foreground text-sm italic">"{testimonial.comment}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Estatísticas */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Nosso Impacto em Números</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map((stat, index) => (
                <div key={index}>
                  <h3 className="text-3xl font-bold text-primary mb-2">{stat.value}</h3>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Compromisso com a Qualidade */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Nosso Compromisso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-foreground leading-relaxed mb-6">
                No PsiConnect, acreditamos que a saúde mental é um direito fundamental. 
                Por isso, trabalhamos incansavelmente para garantir que nossa plataforma 
                ofereça não apenas conveniência, mas também segurança, qualidade e resultados reais.
              </p>
              <p className="text-foreground leading-relaxed">
                Cada profissional em nossa rede é cuidadosamente verificado, e cada recurso 
                é desenvolvido pensando no bem-estar de nossos usuários. Juntos, estamos 
                construindo um futuro onde o cuidado com a saúde mental é acessível a todos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default About;
