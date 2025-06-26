import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Mail, Github, ArrowLeft, Rocket, Search, BadgeCheck, FileText } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const isSignUpFromUrl = searchParams.get('mode') === 'signup';
  const [isSignUp, setIsSignUp] = useState(isSignUpFromUrl);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { signUp, signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Rotating tips state
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [fadeClass, setFadeClass] = useState("opacity-100");

  const tips = [
    {
      text: "Despega tu carrera con un CV turbo-cargado por IA",
      icon: Rocket,
    },
    {
      text: "Explora ofertas y encuentra tu match perfecto en segundos",
      icon: Search,
    },
    {
      text: "Traspasa los filtros ATS con tu pase VIP ResumAI",
      icon: BadgeCheck,
    },
    {
      text: "Aterriza entrevistas con versiones ilimitadas de tu CV",
      icon: FileText,
    },
  ] as const;

  const CurrentIcon = tips[currentTipIndex].icon;

  useEffect(() => {
    setIsSignUp(isSignUpFromUrl);
  }, [isSignUpFromUrl]);

  // Tips rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeClass("opacity-0");
      
      setTimeout(() => {
        setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
        setFadeClass("opacity-100");
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, [tips.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignUp) {
        if (!agreedToTerms) {
          toast.error("Debes aceptar los términos de servicio y política de privacidad");
          setLoading(false);
          return;
        }
        
        const { error } = await signUp(email, password, name);
        
        if (error) {
          if (error.message.includes("User already registered")) {
            toast.error("Este email ya está registrado. Intenta iniciar sesión.");
          } else if (error.message.includes("Password should be at least")) {
            toast.error("La contraseña debe tener al menos 6 caracteres");
          } else if (error.message.includes("Invalid email")) {
            toast.error("Por favor ingresa un email válido");
          } else {
            toast.error("Error al crear la cuenta: " + error.message);
          }
        } else {
          toast.success("¡Cuenta creada exitosamente! Revisa tu email para confirmar tu cuenta.");
          navigate("/app");
        }
      } else {
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
  
          navigate("/app");
        }
      }
    } catch (error: any) {
      toast.error("Error inesperado");
      console.error("Auth error:", error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex">
      {/* Left side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Back to home link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isSignUp ? "Crea tu cuenta" : "Bienvenida/o de vuelta"}
            </h1>
            <p className="text-slate-400">
              {isSignUp 
                ? "Regístrate gratis y comienza en minutos" 
                : "Accede a tu cuenta de ResumAI"
              }
            </p>
          </div>

          {/* Social Auth Buttons */}
          <div className="space-y-3 mb-6">
            <Button 
              variant="outline" 
              className="w-full bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700/50 hover:border-slate-600 h-12"
              onClick={handleGoogleAuth}
              disabled={loading}
            >
              <img
                src="https://developers.google.com/static/identity/images/g-logo.png"
                srcSet="https://developers.google.com/static/identity/images/g-logo.png 1x, https://developers.google.com/static/identity/images/g-logo-2x.png 2x"
                alt="Google G"
                className="h-5 w-5 mr-3 rounded-full"
              />
              Continuar con Google
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <Separator className="bg-slate-700" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-slate-900 px-3 text-sm text-slate-400 uppercase tracking-wider">
                O
              </span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-slate-300">
                  Nombre completo
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nombre y Apellido"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500 h-12"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500 h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-300">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500 h-12"
                required
                minLength={6}
              />
            </div>

            {isSignUp && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label htmlFor="terms" className="text-sm text-slate-400">
                  Acepto los{" "}
                  <a href="#" className="text-blue-400 hover:text-blue-300 underline">
                    Términos de Servicio
                  </a>{" "}
                  y la{" "}
                  <a href="#" className="text-blue-400 hover:text-blue-300 underline">
                    Política de Privacidad
                  </a>
                </Label>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-white text-slate-900 hover:bg-slate-100 font-semibold h-12 mt-6"
              disabled={loading}
            >
              {loading 
                ? (isSignUp ? "Creando cuenta..." : "Ingresando...") 
                : (isSignUp ? "Crea tu cuenta" : "Ingresar")
              }
            </Button>
          </form>

          {/* Switch between sign up / sign in */}
          <div className="text-center mt-6">
            <p className="text-sm text-slate-400">
              {isSignUp ? "Ya tienes una cuenta?" : "No tienes una cuenta?"}{" "}
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-400 hover:text-blue-300 underline font-medium"
              >
                {isSignUp ? "Ingresar" : "Regístrate"}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Gradient with Rotating Tips */}
      <div className="flex-1 bg-gradient-to-br from-blue-800 via-blue-600 to-sky-500 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        {/* Rotating Tips */}
        <div className="relative z-10 text-center px-8 max-w-md">
          <div className="mb-6">
            <CurrentIcon className="h-16 w-16 text-white/80 mx-auto mb-4" />
          </div>
          
          <h2 
            className={`text-3xl font-bold text-white mb-4 transition-opacity duration-300 ${fadeClass}`}
          >
            {tips[currentTipIndex].text}
          </h2>
          
          <div className="flex justify-center space-x-2 mt-6">
            {tips.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentTipIndex 
                    ? 'bg-white' 
                    : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
