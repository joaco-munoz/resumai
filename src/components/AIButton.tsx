
import React from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "primary" | "secondary";
  className?: string;
  children?: React.ReactNode;
}

const AIButton: React.FC<AIButtonProps> = ({
  onClick,
  isLoading = false,
  disabled = false,
  size = "sm",
  variant = "primary",
  className,
  children
}) => {
  const baseClasses = "relative overflow-hidden transition-all duration-300 font-medium";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl border-0",
    secondary: "bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 border border-gray-300 hover:border-gray-400"
  };

  const sizeClasses = {
    sm: "h-8 px-3 text-xs",
    default: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base"
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        "group",
        className
      )}
    >
      <div className="flex items-center gap-2 relative z-10">
        {isLoading ? (
          <div className="animate-spin">
            <Zap className="h-4 w-4" />
          </div>
        ) : (
          <Sparkles className="h-4 w-4 group-hover:animate-pulse" />
        )}
        <span>
          {isLoading ? 'Mejorando...' : (children || 'Mejorar con IA')}
        </span>
      </div>
      
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
    </Button>
  );
};

export default AIButton;
