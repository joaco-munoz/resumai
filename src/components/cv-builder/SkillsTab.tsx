
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { CVData } from "@/types/cv";
import { SkillInput } from "./SkillInput";
import { CVNamingModal } from "./CVNamingModal";

interface SkillsTabProps {
  cvData: CVData;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  goToPreviousTab: () => void;
  saveCV: (cvName: string) => Promise<void>;
  saveAndRedirectToJobMatcher: (cvName: string) => Promise<void>;
  isExistingCV?: boolean; // New prop to determine if this is an existing CV
}

export const SkillsTab = ({ 
  cvData, 
  addSkill, 
  removeSkill, 
  goToPreviousTab, 
  saveCV,
  saveAndRedirectToJobMatcher,
  isExistingCV = false
}: SkillsTabProps) => {
  const [showNamingModal, setShowNamingModal] = useState(false);
  const [modalAction, setModalAction] = useState<'save' | 'saveAndRedirect'>('save');
  const [isSaving, setIsSaving] = useState(false);

  const generateDefaultName = () => {
    const fullName = cvData.personalInfo.fullName || "Mi CV";
    const timestamp = new Date().toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${fullName} - ${timestamp}`;
  };

  const handleSaveCV = () => {
    // Always show naming modal for new CVs
    setModalAction('save');
    setShowNamingModal(true);
  };

  const handleSaveAndRedirect = () => {
    // Always show naming modal for new CVs
    setModalAction('saveAndRedirect');
    setShowNamingModal(true);
  };

  // This function is no longer needed since we always show modal for new CVs

  const handleModalSave = async (cvName: string) => {
    setIsSaving(true);
    try {
      if (modalAction === 'save') {
        await saveCV(cvName);
      } else {
        await saveAndRedirectToJobMatcher(cvName);
      }
      setShowNamingModal(false);
    } catch (error) {
      console.error('Error saving CV:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleModalClose = () => {
    if (!isSaving) {
      setShowNamingModal(false);
    }
  };

  // For new CVs from editor, always show "Guardar CV" labels
  const saveButtonLabel = "Guardar CV";
  const saveAndRedirectLabel = "Guardar CV e ir al Match de ofertas";

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Habilidades</CardTitle>
          <CardDescription>
            Añade habilidades medibles—herramientas, métodos y soft skills—para demostrar tu expertise y potenciar el match.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SkillInput 
            onAddSkill={addSkill}
            existingSkills={cvData.skills}
          />

          <div className="flex flex-wrap gap-2">
            {cvData.skills.map((skill) => (
              <Badge key={skill} variant="outline" className="text-sm flex items-center gap-1">
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {cvData.skills.length === 0 && (
              <p className="text-gray-500 text-sm">No hay habilidades agregadas. Escribe una habilidad arriba y haz clic en "Agregar".</p>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={goToPreviousTab}>
              Atrás
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleSaveCV}
                disabled={isSaving}
              >
                {isSaving && modalAction === 'save' ? "Guardando..." : saveButtonLabel}
              </Button>
              <Button 
                onClick={handleSaveAndRedirect}
                disabled={isSaving}
              >
                {isSaving && modalAction === 'saveAndRedirect' ? "Guardando..." : saveAndRedirectLabel}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Show naming modal for new CVs */}
      <CVNamingModal
        isOpen={showNamingModal}
        onClose={handleModalClose}
        onSave={handleModalSave}
        defaultName={generateDefaultName()}
        isSaving={isSaving}
      />
    </>
  );
};
