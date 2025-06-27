import { useState, useEffect } from 'react';

interface CompanySuggestion {
  name: string;
  logo: string;
  domain: string;
}

export const useCompanySuggestions = (companyName: string) => {
  const [companySuggestions, setCompanySuggestions] = useState<CompanySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch company suggestions when the user types in the company field
  useEffect(() => {
    const query = companyName.trim();
    if (query.length < 2) {
      setCompanySuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        
        if (!res.ok) return;
        
        const data = await res.json();
        setCompanySuggestions(data.slice(0, 8));
      } catch (err) {
        console.error('Error fetching company suggestions', err);
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [companyName]);

  const selectSuggestion = (suggestion: CompanySuggestion) => {
    setShowSuggestions(false);
    return suggestion.name;
  };

  return {
    companySuggestions,
    showSuggestions,
    setShowSuggestions,
    selectSuggestion
  };
};
