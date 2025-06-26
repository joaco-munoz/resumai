import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface HeaderProps {
  onScrollToSection: (id: string) => void;
  onAuthNavigation: () => void;
  onSignUpNavigation: () => void;
}

export const Header = ({ onScrollToSection, onAuthNavigation, onSignUpNavigation }: HeaderProps) => {
  return (
    <header className="border-b border-slate-700/30 bg-slate-900/95 backdrop-blur-md sticky top-0 z-50 rounded-3xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-2xl text-white">ResumAI</span>
        </div>
        
        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-300 hover:text-white hover:bg-slate-800/50 font-medium text-lg" 
            onClick={() => onScrollToSection("creador-cv")}
          >
            Creador CV
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-300 hover:text-white hover:bg-slate-800/50 font-medium text-lg" 
            onClick={() => onScrollToSection("match-de-ofertas")}
          >
            Match de Ofertas
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-300 hover:text-white hover:bg-slate-800/50 font-medium text-lg" 
            onClick={() => onScrollToSection("planes-simples")}
          >
            Precios
          </Button>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <Button 
            onClick={onAuthNavigation} 
            variant="ghost"
            size="sm" 
            className="text-slate-300 hover:text-white hover:bg-slate-800/50 font-medium text-lg"
          >
            Iniciar Sesión
          </Button>
          <Button 
            onClick={onSignUpNavigation} 
            size="sm" 
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
          >
            Regístrate
          </Button>
        </div>
      </div>
    </header>
  );
};
