
import { useState } from "react";
import { CVSelector } from "@/components/job-matcher/CVSelector";
import { JobMatcherCVsSection } from "@/components/JobMatcherCVsSection";
import { JobMatcherReportsSection } from "@/components/JobMatcherReportsSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, FileText, BarChart3 } from "lucide-react";
import Dock from "@/components/ui/Dock";
import HeaderBrand from "@/components/HeaderBrand";

export default function JobMatcher() {
  const [selectedCVId, setSelectedCVId] = useState<string | null>(null);
  const [selectedCVTitle, setSelectedCVTitle] = useState<string>("");

  const handleCVSelect = (cvId: string, cvTitle: string) => {
    setSelectedCVId(cvId);
    setSelectedCVTitle(cvTitle);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <HeaderBrand />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="font-bold text-3xl gradient-text mb-2 flex items-center gap-2">
            <Target className="h-8 w-8" />
            Match de Ofertas
          </h1>
          <p className="text-gray-600">
            Encuentra trabajos compatibles con tu CV y genera informes de compatibilidad
          </p>
        </div>

        <Tabs defaultValue="cvs" className="w-full mt-8">
          <TabsList className="w-full">
            <TabsTrigger value="cvs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Currículums
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Informes
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="cvs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Selecciona un currículum</CardTitle>
              </CardHeader>
              <CardContent>
                <CVSelector 
                  selectedCVId={selectedCVId}
                  onCVSelect={handleCVSelect}
                />
              </CardContent>
            </Card>
            
            {selectedCVId && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Análisis para: {selectedCVTitle}</h2>
                <p className="text-gray-600 mb-4">Contenido del análisis aparecerá aquí...</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="reports" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Informes de Compatibilidad</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Los informes generados aparecerán aquí...</p>
              </CardContent>
            </Card>
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
