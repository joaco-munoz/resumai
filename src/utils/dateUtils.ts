
export const formatDateToSpanish = (dateString: string): string => {
  if (!dateString) return '';
  
  const [year, month] = dateString.split('-');
  
  const monthNames = {
    '01': 'Enero',
    '02': 'Febrero',
    '03': 'Marzo',
    '04': 'Abril',
    '05': 'Mayo',
    '06': 'Junio',
    '07': 'Julio',
    '08': 'Agosto',
    '09': 'Septiembre',
    '10': 'Octubre',
    '11': 'Noviembre',
    '12': 'Diciembre'
  };
  
  return `${monthNames[month as keyof typeof monthNames]} ${year}`;
};
