
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PersonalInfoForm } from "@/components/profile/PersonalInfoForm";
import { AccountStats } from "@/components/profile/AccountStats";
import { FlowSubscription } from "@/components/profile/FlowSubscription";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, CreditCard, BarChart3 } from "lucide-react";
import Dock from "@/components/ui/Dock";
import HeaderBrand from "@/components/HeaderBrand";

export default function Profile() {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <HeaderBrand />
      
      <div className="container mx-auto px-4 py-6">
        <ProfileHeader />
        
        <Tabs defaultValue="personal" className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Información Personal
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Suscripción
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Estadísticas
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="mt-6">
            <PersonalInfoForm />
          </TabsContent>
          
          <TabsContent value="subscription" className="mt-6">
            <FlowSubscription />
          </TabsContent>
          
          <TabsContent value="stats" className="mt-6">
            <AccountStats />
          </TabsContent>
        </Tabs>
      </div>

      <Dock 
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
      />
    </div>
  );
}
