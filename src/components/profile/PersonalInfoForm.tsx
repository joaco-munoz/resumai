
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, Linkedin, Globe, Save } from "lucide-react";

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  github: string;
  jobTitle: string;
  company: string;
  bio: string;
  avatarUrl: string;
}

interface PersonalInfoFormProps {
  profileData: ProfileData;
  isSaving: boolean;
  onInputChange: (field: string, value: string) => void;
  onSave: () => void;
}

export const PersonalInfoForm = ({ 
  profileData, 
  isSaving, 
  onInputChange, 
  onSave 
}: PersonalInfoFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Información Personal
        </CardTitle>
        <CardDescription>
          Esta información se utilizará para rellenar automáticamente tus CVs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nombre completo
            </Label>
            <Input
              id="fullName"
              value={profileData.fullName}
              onChange={(e) => onInputChange('fullName', e.target.value)}
              placeholder="Tu nombre completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              onChange={(e) => onInputChange('email', e.target.value)}
              placeholder="tu@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Teléfono
            </Label>
            <Input
              id="phone"
              value={profileData.phone}
              onChange={(e) => onInputChange('phone', e.target.value)}
              placeholder="+34 600 123 456"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Ubicación
            </Label>
            <Input
              id="location"
              value={profileData.location}
              onChange={(e) => onInputChange('location', e.target.value)}
              placeholder="Ciudad, País"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobTitle" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Puesto de trabajo
            </Label>
            <Input
              id="jobTitle"
              value={profileData.jobTitle}
              onChange={(e) => onInputChange('jobTitle', e.target.value)}
              placeholder="Tu puesto actual"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Empresa
            </Label>
            <Input
              id="company"
              value={profileData.company}
              onChange={(e) => onInputChange('company', e.target.value)}
              placeholder="Tu empresa actual"
            />
          </div>
        </div>

        {/*<Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Enlaces Profesionales</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                value={profileData.linkedin}
                onChange={(e) => onInputChange('linkedin', e.target.value)}
                placeholder="linkedin.com/in/tuperfil"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Sitio web
              </Label>
              <Input
                id="website"
                value={profileData.website}
                onChange={(e) => onInputChange('website', e.target.value)}
                placeholder="tusitio.com"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="github" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                GitHub
              </Label>
              <Input
                id="github"
                value={profileData.github}
                onChange={(e) => onInputChange('github', e.target.value)}
                placeholder="github.com/tuperfil"
              />
            </div>
          </div>
        </div>
          */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={onSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-brand-500 to-brand-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
