
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";

interface ProfileHeaderProps {
  displayName: string;
  email: string;
  avatarUrl: string;
  memberSince: string;
  getInitials: (name: string) => string;
}

export const ProfileHeader = ({ 
  displayName, 
  email, 
  avatarUrl, 
  memberSince, 
  getInitials 
}: ProfileHeaderProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-6">
          <Avatar className="w-20 h-20">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="text-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{displayName}</h2>
            <p className="text-gray-600">{email}</p>
            <p className="text-sm text-gray-500 mt-1">
              Miembro desde {memberSince}
            </p>
          </div>
          <Button variant="outline">
            Cambiar Foto
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
};
