
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface SkillInputProps {
  onAddSkill: (skill: string) => void;
  existingSkills: string[];
}

export const SkillInput = ({ onAddSkill, existingSkills }: SkillInputProps) => {
  const [newSkill, setNewSkill] = useState("");

  const handleAddSkill = () => {
    const trimmedSkill = newSkill.trim();
    if (trimmedSkill !== "" && !existingSkills.includes(trimmedSkill)) {
      onAddSkill(trimmedSkill);
      setNewSkill("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const isDisabled = !newSkill.trim() || existingSkills.includes(newSkill.trim());

  return (
    <div className="flex gap-2">
      <Input
        value={newSkill}
        onChange={(e) => setNewSkill(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Escribe una habilidad (ej. React, Python, Marketing Digital)"
        className="flex-1"
      />
      <Button 
        onClick={handleAddSkill} 
        size="sm" 
        disabled={isDisabled}
        className="shrink-0"
      >
        <Plus className="h-4 w-4 mr-2" />
        Agregar
      </Button>
    </div>
  );
};
