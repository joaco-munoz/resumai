
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ExistingEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignIn: () => void;
  email: string;
}

const ExistingEmailModal = ({ open, onOpenChange, onSignIn, email }: ExistingEmailModalProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Email ya registrado</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            El email <span className="font-medium text-white">{email}</span> ya se encuentra registrado en nuestra plataforma.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={() => onOpenChange(false)}
            className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
          >
            Atrás
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onSignIn}
            className="bg-white text-slate-900 hover:bg-slate-100"
          >
            Iniciar sesión
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ExistingEmailModal;
