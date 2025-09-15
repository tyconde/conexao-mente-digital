
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Home, Clock } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Mensagem enviada com sucesso! Retornaremos em breve.");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Entre em Contato</h1>
            <p className="text-xl text-gray-600">
              Estamos aqui para ajudar você
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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Informações de Contato */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-3 text-primary" />
                  <div>
                    <p className="font-medium">Telefone</p>
                    <p className="text-gray-600">(14) 3234-5678</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-3 text-primary" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">contato@psiconnect.com.br</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-3 text-primary" />
                  <div>
                    <p className="font-medium">Endereço</p>
                    <p className="text-gray-600">
                      Rua das Flores, 123<br />
                      Centro - Bauru, SP<br />
                      CEP: 17010-120
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-3 text-primary" />
                  <div>
                    <p className="font-medium">Horário de Atendimento</p>
                    <p className="text-gray-600">
                      Segunda a Sexta: 8h às 18h<br />
                      Sábado: 8h às 12h
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Localização - Centro de Bauru</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-64 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14684.794239806358!2d-49.07636765000001!3d-22.31468405!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94bf0b13b7b9f5e7%3A0x7b8f8b8f8b8f8b8f!2sCentro%2C%20Bauru%20-%20SP!5e0!3m2!1spt!2sbr!4v1700000000000!5m2!1spt!2sbr"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localização Centro de Bauru"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulário de Contato */}
          <Card>
            <CardHeader>
              <CardTitle>Envie uma Mensagem</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="subject">Assunto</Label>
                  <Input
                    id="subject"
                    placeholder="Assunto da sua mensagem"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    placeholder="Digite sua mensagem aqui..."
                    rows={6}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Enviar Mensagem
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
