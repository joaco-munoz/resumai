
import { forwardRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Feature } from "../../types/landing";

interface FeaturesSectionProps {
  features: Feature[];
}

export const FeaturesSection = forwardRef<HTMLDivElement, FeaturesSectionProps>(({ features }, ref) => {
  return (
    <section id="caracteristicas-principales" ref={ref} className="py-20 bg-blue-950/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-slate-700 bg-slate-800/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 hover:-translate-y-2"
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-slate-700/50 rounded-2xl w-fit">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base text-slate-300">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
});

FeaturesSection.displayName = "FeaturesSection";
