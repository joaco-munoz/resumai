import { forwardRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FAQ } from "../../types/landing";

interface FAQSectionProps {
  faqItems: FAQ[];
}

export const FAQSection = forwardRef<HTMLDivElement, FAQSectionProps>(({ faqItems }, ref) => {
  return (
    <section id="preguntas-frecuentes" ref={ref} className="py-20 bg-blue-950/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-white">Preguntas Frecuentes</h2>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-6">
          {faqItems.map((item, index) => (
            <Card key={index} className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-lg text-white">{item.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
});

FAQSection.displayName = "FAQSection";
