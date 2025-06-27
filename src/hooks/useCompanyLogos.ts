import { useState, useEffect } from "react";

interface CompanySuggestion {
  name: string;
  logo: string;
  domain: string;
}

export const useCompanyLogos = () => {
  const [logoEditCvId, setLogoEditCvId] = useState<string | null>(null);
  const [logoQuery, setLogoQuery] = useState<string>("");
  const [logoSuggestions, setLogoSuggestions] = useState<CompanySuggestion[]>([]);
  const [logoMap, setLogoMap] = useState<Record<string, string>>({});

  // Fetch company suggestions
  useEffect(() => {
    const query = logoQuery.trim();
    if (logoEditCvId === null || query.length < 2) {
      setLogoSuggestions([]);
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
        setLogoSuggestions(data.slice(0, 8));
      } catch (err) {
        console.error('Error fetching company suggestions', err);
      }
    }, 300);
    
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [logoQuery, logoEditCvId]);

  const initializeLogoMap = (cvs: any[]) => {
    const newLogoMap: Record<string, string> = {};
    cvs.forEach(cvItem => {
      const logoUrl = cvItem.content?.company_logo;
      if (logoUrl) newLogoMap[cvItem.id] = logoUrl;
    });
    setLogoMap(newLogoMap);
  };

  const updateLogoMap = (cvId: string, logoUrl: string) => {
    setLogoMap(prev => ({ ...prev, [cvId]: logoUrl }));
  };

  const startLogoEdit = (cvId: string) => {
    setLogoEditCvId(cvId);
    setLogoQuery("");
  };

  const cancelLogoEdit = () => {
    setLogoEditCvId(null);
    setLogoQuery("");
  };

  return {
    logoEditCvId,
    logoQuery,
    logoSuggestions,
    logoMap,
    setLogoQuery,
    initializeLogoMap,
    updateLogoMap,
    startLogoEdit,
    cancelLogoEdit
  };
};
