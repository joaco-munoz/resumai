
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
}

export const CVNamingModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  defaultName = "",
  isSaving = false 
}: CVNamingModalProps) => {
  const [cvName, setCvName] = useState(defaultName);

  const handleSave = () => {
    if (cvName.trim()) {
      onSave(cvName.trim());
    }
  };

  const handleClose = () => {
    setCvName(defaultName);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nombrar CV</DialogTitle>
          <DialogDescription>
            Ingresa un nombre para tu currículum vitae
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cv-name">Nombre del CV</Label>
            <Input
              id="cv-name"
              value={cvName}
              onChange={(e) => setCvName(e.target.value)}
              placeholder="Ej: CV Marketing Digital 2024"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && cvName.trim()) {
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
            disabled={!cvName.trim() || isSaving}
          >
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
