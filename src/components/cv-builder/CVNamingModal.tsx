
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CVNamingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cvName: string) => void;
  defaultName?: string;
  isSaving?: boolean;
  isReport?: boolean; // New prop to differentiate between CV and Report
}

export const CVNamingModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  defaultName = "",
  isSaving = false,
  isReport = false
}: CVNamingModalProps) => {
  const [name, setName] = useState(defaultName);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  const handleClose = () => {
    setName(defaultName);
    onClose();
  };

  // Update content based on whether it's for CV or Report
  const title = isReport ? "Nombrar Informe" : "Nombrar CV";
  const description = isReport 
    ? "Ingresa un nombre para tu informe de JobMatcher"
    : "Ingresa un nombre para tu currículum vitae";
  const label = isReport ? "Nombre del Informe" : "Nombre del CV";
  const placeholder = isReport 
    ? "Ej: Informe - Desarrollador Frontend 2024"
    : "Ej: CV Marketing Digital 2024";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name-input">{label}</Label>
            <Input
              id="name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={placeholder}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim()) {
                  handleSave();
                }
              }}
            />
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={isSaving}
          >
            Atrás
          </Button>
          <Button 
            type="button" 
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
          >
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
