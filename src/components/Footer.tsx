
import { Brain } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img 
                  src="/lovable-uploads/35c9da52-94c6-4c5d-9f32-eb34fe45c5ed.png" 
                  alt="PsiConnect" 
                  className="w-6 h-6"
                />
              </div>
              <span className="text-xl font-bold">PsiConnect</span>
            </div>
            <p className="text-gray-400">
              Democratizando o acesso à saúde mental através da tecnologia.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Pacientes</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-white transition-colors">Encontrar Psicólogo</a></li>
              <li><a href="/about" className="hover:text-white transition-colors">Como Funciona</a></li>
              <li><a href="/" className="hover:text-white transition-colors">Preços</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Suporte</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Profissionais</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-white transition-colors">Cadastrar-se</a></li>
              <li><a href="/about" className="hover:text-white transition-colors">Recursos</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Central de Ajuda</a></li>
              <li><a href="/about" className="hover:text-white transition-colors">Webinars</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/about" className="hover:text-white transition-colors">Sobre</a></li>
              <li><a href="/about" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="/about" className="hover:text-white transition-colors">Carreiras</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contato</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © 2024 PsiConnect. Todos os direitos reservados.
          </div>
          <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Termos</a>
            <a href="#" className="hover:text-white transition-colors">LGPD</a>
            <a href="#" className="hover:text-white transition-colors">CFP</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
