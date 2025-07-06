
import { Instagram, Linkedin } from "lucide-react";
import Logo from "@/assets/Logo - copia.png";

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src={Logo} alt="ResumAI logo" className="w-16 h-16" />
            <span className="font-bold text-xl">ResumAI</span>
          </div>

          <div className="flex items-center justify-center gap-6">
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors flex items-center justify-center">
              <Instagram className="h-6 w-6" />
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors flex items-center justify-center">
              <Linkedin className="h-6 w-6" />
            </a>
          </div>

          <div className="text-slate-400 text-sm text-center md:text-right">
            <p>© 2025 ResumAI. Todos los derechos reservados.</p>
            <p>resumai.support@gmail.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
