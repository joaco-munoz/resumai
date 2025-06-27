import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { JobApplicationFormData, Interview } from "@/hooks/useJobApplications";
import { useCompanySuggestions } from "@/hooks/useCompanySuggestions";

interface JobApplicationFormProps {
  formData: JobApplicationFormData;
  setFormData: (data: JobApplicationFormData) => void;
  selectedInterview: Interview | null;
  isSubmitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export const JobApplicationForm = ({
  formData,
  setFormData,
  selectedInterview,
  isSubmitting,
  onSubmit,
  onCancel,
  onDelete
}: JobApplicationFormProps) => {
  const { companySuggestions, showSuggestions, setShowSuggestions, selectSuggestion } = 
    useCompanySuggestions(formData.company);

  const handleCompanySelect = (suggestion: { name: string; logo: string; domain: string }) => {
    const newCompanyName = selectSuggestion(suggestion);
    setFormData({ ...formData, company: newCompanyName });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="position">Posición *</Label>
          <Input
            id="position"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            placeholder="ej. Frontend Developer"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Empresa *</Label>
          <div className="relative">
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => {
                setFormData({ ...formData, company: e.target.value });
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="ej. TechCorp"
              autoComplete="off"
            />
            {showSuggestions && companySuggestions.length > 0 && (
              <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {companySuggestions.map((suggestion) => (
                  <button
                    key={suggestion.domain}
                    type="button"
                    className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50"
                    onClick={() => handleCompanySelect(suggestion)}
                  >
                    <img src={suggestion.logo} alt={suggestion.name} className="w-6 h-6 mr-2 rounded" />
                    <span className="text-sm text-gray-700">{suggestion.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="jobType">Tipo de Trabajo</Label>
          <Select value={formData.job_type} onValueChange={(value) => setFormData({ ...formData, job_type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
              <SelectItem value="Contract">Contrato</SelectItem>
              <SelectItem value="Internship">Práctica Profesional</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Ubicación</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="ej. Remote, Madrid, etc."
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Fecha Entrevista</Label>
          <Input
            id="date"
            type="date"
            value={formData.interview_date}
            onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="link">Enlace Entrevista</Label>
          <Input
            id="link"
            value={formData.interview_link}
            onChange={(e) => setFormData({ ...formData, interview_link: e.target.value })}
            placeholder="https://meet.google.com/..."
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Notas sobre la aplicación, contactos, etc."
          rows={3}
        />
      </div>
      
      <div className="flex gap-2 justify-between">
        <div>
          {selectedInterview && onDelete && (
            <Button 
              variant="destructive" 
              onClick={onDelete}
              disabled={isSubmitting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : (selectedInterview ? 'Actualizar' : 'Agregar')} Postulación
          </Button>
        </div>
      </div>
    </div>
  );
};
