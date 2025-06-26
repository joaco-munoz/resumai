
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Star } from "lucide-react";
import { toast } from "sonner";

interface WaitlistSectionProps {
  email: string;
  setEmail: (email: string) => void;
  handleWaitlistSubmit: (e: React.FormEvent) => Promise<void>;
}

export const WaitlistSection = ({ email, setEmail, handleWaitlistSubmit }: WaitlistSectionProps) => {

  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Listo para destacar?</h2>
        <p className="text-lg md:text-xl mb-8 text-blue-100">
          Únete a miles de profesionales que ya consiguen más entrevistas
        </p>
        
        <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto flex gap-4">
          <Input 
            type="email" 
            placeholder="tu@email.com" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60 text-base" 
            required 
          />
          <Button type="submit" variant="secondary" className="bg-white text-blue-600 hover:bg-slate-100 text-base">
            Únete
          </Button>
        </form>
        
        <div className="flex items-center justify-center gap-8 mt-12 text-blue-200">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span className="text-base">Plataforma Beta</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            <span className="text-base">5/5 estrellas</span>
          </div>
        </div>
      </div>
    </section>
  );
};
