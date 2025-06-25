import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Nombres de meses en español
const mesesEnEspañol = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

interface DatePickerEsProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export const DatePickerEs = ({
  value,
  onChange,
  disabled = false,
  className = '',
  placeholder = 'Seleccionar fecha'
}: DatePickerEsProps) => {
  // Parse the initial value (YYYY-MM format expected)
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    if (value) {
      const dateParts = value.split('-');
      return parseInt(dateParts[0], 10);
    }
    return new Date().getFullYear();
  });

  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    if (value) {
      const dateParts = value.split('-');
      return parseInt(dateParts[1], 10) - 1; // Month is 0-indexed in JavaScript
    }
    return new Date().getMonth();
  });

  const [isOpen, setIsOpen] = useState(false);

  // Format the display value
  const displayValue = value 
    ? `${mesesEnEspañol[selectedMonth]} ${selectedYear}`
    : placeholder;

  // Years range (from current year - 50 to current year + 5)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 55 }, (_, i) => currentYear + 5 - i);

  // Handle selection of a month
  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    
    // Format the date as YYYY-MM
    const month = (monthIndex + 1).toString().padStart(2, '0');
    const formattedDate = `${selectedYear}-${month}`;
    
    onChange(formattedDate);
    setIsOpen(false);
  };

  // Handle selection of a year
  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    
    // Format the date as YYYY-MM
    const month = (selectedMonth + 1).toString().padStart(2, '0');
    const formattedDate = `${year}-${month}`;
    
    onChange(formattedDate);
    // Don't close the popover to allow month selection after year
  };

  // Move to previous year
  const prevYear = () => {
    setSelectedYear(selectedYear - 1);
  };

  // Move to next year
  const nextYear = () => {
    setSelectedYear(selectedYear + 1);
  };

  return (
    <Popover open={isOpen && !disabled} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={`w-full justify-start text-left font-normal ${className}`}
          onClick={() => setIsOpen(true)}
        >
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="space-y-3 p-3">
          {/* Year selector */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={prevYear}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-semibold">{selectedYear}</div>
            <Button variant="outline" size="sm" onClick={nextYear}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Month grid */}
          <div className="grid grid-cols-3 gap-2">
            {mesesEnEspañol.map((month, index) => (
              <Button
                key={month}
                variant={selectedMonth === index ? "default" : "outline"}
                size="sm"
                onClick={() => handleMonthSelect(index)}
                className="focus:bg-blue-600 focus:text-white"
              >
                {month.substring(0, 3)}
              </Button>
            ))}
          </div>

          {/* Year list */}
          <div className="max-h-[200px] overflow-y-auto">
            <div className="grid grid-cols-4 gap-1">
              {years.map((year) => (
                <Button
                  key={year}
                  variant={selectedYear === year ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleYearSelect(year)}
                  className="focus:bg-blue-600 focus:text-white"
                >
                  {year}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
