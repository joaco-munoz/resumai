
import { Button } from "@/components/ui/button";
import Logo from "@/assets/Logo.png";

interface HeaderProps {
  onScrollToSection: (id: string) => void;
  onAuthNavigation: () => void;
  onSignUpNavigation: () => void;
}

export const Header = ({ onScrollToSection, onAuthNavigation, onSignUpNavigation }: HeaderProps) => {
  return (
    <header className="border-b shadow-lg border-slate-700/30 mx-80 bg-slate-900/95 backdrop-blur-md sticky top-2 z-50 rounded-3xl">
      <div className="w-full px-6 h-16 flex items-center justify-center">
        <div className="flex items-center justify-between w-full max-w-6xl">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={Logo} alt="ResumAI logo" className="w-16 h-16" />
            <span className="font-bold text-xl text-white">ResumAI</span>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-300 hover:text-white hover:bg-slate-800/50 font-medium text-base" 
              onClick={() => onScrollToSection("creador-cv")}
            >
              Creador CV
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-300 hover:text-white hover:bg-slate-800/50 font-medium text-base" 
              onClick={() => onScrollToSection("match-de-ofertas")}
            >
              Match de Ofertas
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-300 hover:text-white hover:bg-slate-800/50 font-medium text-base" 
              onClick={() => onScrollToSection("planes-simples")}
            >
              Precios
            </Button>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2">
            <Button 
              onClick={onAuthNavigation} 
              variant="ghost"
              size="sm" 
              className="text-slate-300 hover:text-white hover:bg-slate-800/50 font-medium text-base"
            >
              Iniciar Sesión
            </Button>
            <Button 
              onClick={onSignUpNavigation} 
              size="sm" 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-base"
            >
              Regístrate
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
