import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Mail, Linkedin } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import ExistingEmailModal from "./ExistingEmailModal";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signup");
  const [showExistingEmailModal, setShowExistingEmailModal] = useState(false);
  const { signUp, signIn, signInWithGoogle } = useAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signUp(email, password, name);
      
      if (error) {
        if (error.message.includes("User already registered")) {
          setShowExistingEmailModal(true);
        } else if (error.message.includes("Password should be at least")) {
          toast.error("La contraseña debe tener al menos 6 caracteres");
        } else if (error.message.includes("Invalid email")) {
          toast.error("Por favor ingresa un email válido");
        } else {
          toast.error("Error al crear la cuenta: " + error.message);
        }
      } else {
        toast.success("¡Cuenta creada exitosamente! Revisa tu email para confirmar tu cuenta.");
        onOpenChange(false);
        setEmail("");
        setPassword("");
        setName("");
      }
    } catch (error: any) {
      toast.error("Error inesperado al crear la cuenta");
      console.error("SignUp error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Email o contraseña incorrectos");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Por favor confirma tu email antes de iniciar sesión");
        } else {
          toast.error("Error al iniciar sesión: " + error.message);
        }
      } else {
        onOpenChange(false);
        setEmail("");
        setPassword("");
      }
    } catch (error: any) {
      toast.error("Error inesperado al iniciar sesión");
      console.error("SignIn error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      const { error } = await signInWithGoogle();
      
      if (error) {
        toast.error(`Error al conectar con Google: ${error.message}`);
      } else {
        toast.success("Conectando con Google...");
      }
    } catch (error: any) {
      toast.error("Error al conectar con Google");
      console.error("Google auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  const switchToSignIn = () => {
    setActiveTab("signin");
  };

  const switchToSignUp = () => {
    setActiveTab("signup");
  };

  const handleExistingEmailSignIn = () => {
    setShowExistingEmailModal(false);
    setActiveTab("signin");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-center text-white">
              {/* Will be set by tabs */}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700">
              <TabsTrigger value="signup" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300">
                Crear Cuenta
              </TabsTrigger>
              <TabsTrigger value="signin" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300">
                Iniciar Sesión
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signup" className="space-y-6 mt-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-white mb-1">Crear cuenta</h2>
                <p className="text-sm text-slate-400">Regístrate gratis y comienza en minutos</p>
              </div>

              {/* Google Login Button */}
              <Button 
                variant="outline" 
                className="w-full bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:border-slate-600"
                onClick={handleGoogleAuth}
                disabled={loading}
              >
                <Mail className="h-5 w-5 mr-3" />
                Continuar con Google
              </Button>

              <div className="relative">
                <Separator className="bg-slate-700" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-slate-900 px-3 text-sm text-slate-400 uppercase tracking-wider">
                    Or
                  </span>
                </div>
              </div>

              {/* Email Signup Form */}
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-sm font-medium text-slate-300">
                    Nombre completo
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium text-slate-300">
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-medium text-slate-300">
                    Contraseña
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                    required
                    minLength={6}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-white text-slate-900 hover:bg-slate-100 font-medium"
                  disabled={loading}
                >
                  {loading ? "Creando cuenta..." : "Crear cuenta"}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-sm text-slate-400">
                  ¿Ya tienes una cuenta?{" "}
                  <button 
                    onClick={switchToSignIn}
                    className="text-blue-400 hover:text-blue-300 underline font-medium"
                  >
                    Inicia sesión
                  </button>
                </p>
              </div>
            </TabsContent>

            <TabsContent value="signin" className="space-y-6 mt-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-white mb-1">Iniciar sesión</h2>
                <p className="text-sm text-slate-400">Accede a tu cuenta de ResumAI</p>
              </div>

              {/* Google Login Button */}
              <Button 
                variant="outline" 
                className="w-full bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:border-slate-600"
                onClick={handleGoogleAuth}
                disabled={loading}
              >
                <Mail className="h-5 w-5 mr-3" />
                Continuar con Google
              </Button>

              <div className="relative">
                <Separator className="bg-slate-700" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-slate-900 px-3 text-sm text-slate-400 uppercase tracking-wider">
                    Or
                  </span>
                </div>
              </div>

              {/* Email Login Form */}
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-sm font-medium text-slate-300">
                    Email
                  </Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password" className="text-sm font-medium text-slate-300">
                      Contraseña
                    </Label>
                    <button 
                      type="button"
                      className="text-sm text-blue-400 hover:text-blue-300 underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-white text-slate-900 hover:bg-slate-100 font-medium"
                  disabled={loading}
                >
                  {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-sm text-slate-400">
                  ¿No tienes una cuenta?{" "}
                  <button 
                    onClick={switchToSignUp}
                    className="text-blue-400 hover:text-blue-300 underline font-medium"
                  >
                    Crear cuenta
                  </button>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <ExistingEmailModal
        open={showExistingEmailModal}
        onOpenChange={setShowExistingEmailModal}
        onSignIn={handleExistingEmailSignIn}
        email={email}
      />
    </>
  );
};

export default AuthModal;
