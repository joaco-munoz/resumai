import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CVBuilderHeaderProps {
  currentCvId?: string;
}

export const CVBuilderHeader: React.FC<CVBuilderHeaderProps> = ({ currentCvId }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/app/cvs');
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-3xl font-bold text-blue-600">
            {currentCvId ? 'Editando CV' : 'Creando nuevo CV'}
          </div>
        </div>
      </div>
    </div>
  );
};
