
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Mail, User } from "lucide-react";
import { toast } from "sonner";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Connect to Supabase when integration is set up
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("¡Cuenta creada exitosamente!");
      onOpenChange(false);
      // TODO: Redirect to dashboard
    } catch (error) {
      toast.error("Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Connect to Supabase when integration is set up
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("¡Bienvenido de nuevo!");
      onOpenChange(false);
      // TODO: Redirect to dashboard
    } catch (error) {
      toast.error("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = (provider: 'google' | 'linkedin') => {
    // TODO: Connect to Supabase when integration is set up
    toast.info(`Conexión con ${provider} estará disponible pronto`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 justify-center mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-xl gradient-text">ResumAI</DialogTitle>
          </div>
          <DialogDescription className="text-center">
            Crea tu cuenta y comienza a generar CVs profesionales con IA
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="signup" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signup">Crear Cuenta</TabsTrigger>
            <TabsTrigger value="signin">Iniciar Sesión</TabsTrigger>
          </TabsList>

          <TabsContent value="signup">
            <Card className="border-0 shadow-none">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl">Crear cuenta</CardTitle>
                <CardDescription>
                  Regístrate gratis y comienza en minutos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nombre completo</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Tu nombre"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Contraseña</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800"
                    disabled={loading}
                  >
                    {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      O continúa con
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => handleSocialAuth('google')}
                    disabled={loading}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Google
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleSocialAuth('linkedin')}
                    disabled={loading}
                  >
                    <User className="h-4 w-4 mr-2" />
                    LinkedIn
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signin">
            <Card className="border-0 shadow-none">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl">Iniciar sesión</CardTitle>
                <CardDescription>
                  Accede a tu cuenta de CVMaster AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Contraseña</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800"
                    disabled={loading}
                  >
                    {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      O continúa con
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => handleSocialAuth('google')}
                    disabled={loading}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Google
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleSocialAuth('linkedin')}
                    disabled={loading}
                  >
                    <User className="h-4 w-4 mr-2" />
                    LinkedIn
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
