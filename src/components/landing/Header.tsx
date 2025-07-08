
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Logo from "@/assets/Logo.png";
import { Menu, X } from "lucide-react";

interface HeaderProps {
  onScrollToSection: (id: string) => void;
  onAuthNavigation: () => void;
  onSignUpNavigation: () => void;
}

export const Header = ({ onScrollToSection, onAuthNavigation, onSignUpNavigation }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavClick = (id: string) => {
    onScrollToSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="border-b shadow-lg border-slate-700/30 mx-4 sm:mx-8 md:mx-16 lg:mx-32 xl:mx-80 bg-slate-900/95 backdrop-blur-md sticky top-2 z-50 rounded-3xl">
      <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-center">
        <div className="flex items-center justify-between w-full max-w-6xl">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={Logo} alt="ResumAI logo" className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16" />
            <span className="font-bold text-lg sm:text-xl text-white">ResumAI</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-300 hover:text-white hover:bg-slate-800/50 font-medium text-sm lg:text-base" 
              onClick={() => onScrollToSection("creador-cv")}
            >
              Creador CV
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-300 hover:text-white hover:bg-slate-800/50 font-medium text-sm lg:text-base" 
              onClick={() => onScrollToSection("match-de-ofertas")}
            >
              Match de Ofertas
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-300 hover:text-white hover:bg-slate-800/50 font-medium text-sm lg:text-base" 
              onClick={() => onScrollToSection("planes-simples")}
            >
              Precios
            </Button>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Button 
              onClick={onAuthNavigation} 
              variant="ghost"
              size="sm" 
              className="text-slate-300 hover:text-white hover:bg-slate-800/50 font-medium text-sm lg:text-base"
            >
              Iniciar Sesión
            </Button>
            <Button 
              onClick={onSignUpNavigation} 
              size="sm" 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium px-4 lg:px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-sm lg:text-base"
            >
              Regístrate
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Button 
              onClick={onSignUpNavigation}
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium px-3 py-1 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-sm mr-2"
            >
              Regístrate
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-slate-800/50" 
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-md border-t border-slate-700/30 rounded-b-3xl overflow-hidden">
          <div className="px-4 py-4 space-y-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-300 hover:text-white hover:bg-slate-800/50 font-medium text-base w-full justify-start" 
              onClick={() => handleNavClick("creador-cv")}
            >
              Creador CV
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-300 hover:text-white hover:bg-slate-800/50 font-medium text-base w-full justify-start" 
              onClick={() => handleNavClick("match-de-ofertas")}
            >
              Match de Ofertas
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-300 hover:text-white hover:bg-slate-800/50 font-medium text-base w-full justify-start" 
              onClick={() => handleNavClick("planes-simples")}
            >
              Precios
            </Button>
            <Button 
              onClick={onAuthNavigation} 
              variant="ghost"
              size="sm" 
              className="text-slate-300 hover:text-white hover:bg-slate-800/50 font-medium text-base w-full justify-start"
            >
              Iniciar Sesión
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
