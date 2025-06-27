import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Interview {
  id: string;
  position: string;
  company: string;
  status: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected';
  notes?: string;
  interview_date?: string;
  interview_link?: string;
  applied_date: string;
  job_type?: string;
  location?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  cv_id?: string;
  company_logo?: string;
}

export interface JobApplicationFormData {
  position: string;
  company: string;
  notes: string;
  interview_date: string;
  interview_link: string;
  job_type: string;
  location: string;
}

export const useJobApplications = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<JobApplicationFormData>({
    position: '',
    company: '',
    notes: '',
    interview_date: '',
    interview_link: '',
    job_type: '',
    location: ''
  });

  const resetForm = () => {
    setFormData({
      position: '',
      company: '',
      notes: '',
      interview_date: '',
      interview_link: '',
      job_type: '',
      location: ''
    });
    setSelectedInterview(null);
  };

  // Fetch job applications from Supabase with CV information
  const fetchInterviews = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('job_applications_tracking')
        .select(`
          *,
          cvs!job_applications_tracking_cv_id_fkey (
            id,
            title,
            content
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching interviews:', error);
        toast.error('Error al cargar las postulaciones');
        return;
      }

      const formattedData: Interview[] = data.map(item => ({
        id: item.id,
        position: item.position,
        company: item.company,
        status: item.status as Interview['status'],
        notes: item.notes || '',
        interview_date: item.interview_date || '',
        interview_link: item.interview_link || '',
        applied_date: item.applied_date,
        job_type: item.job_type || '',
        location: item.location || '',
        created_at: item.created_at,
        updated_at: item.updated_at,
        user_id: item.user_id,
        cv_id: item.cv_id || undefined,
        company_logo: item.cvs?.content?.companyLogo || undefined
      }));

      setInterviews(formattedData);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast.error('Error al cargar las postulaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [user]);

  const handleAddInterview = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para añadir postulaciones");
      return;
    }

    if (!formData.position || !formData.company) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('job_applications_tracking')
        .insert({
          user_id: user.id,
          position: formData.position,
          company: formData.company,
          status: 'saved',
          notes: formData.notes || null,
          interview_date: formData.interview_date || null,
          interview_link: formData.interview_link || null,
          job_type: formData.job_type || null,
          location: formData.location || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding interview:', error);
        toast.error('Error al añadir la postulación');
        return;
      }

      await fetchInterviews();
      resetForm();
      toast.success("Postulación añadida al tablero");
    } catch (error) {
      console.error('Error adding interview:', error);
      toast.error('Error al añadir la postulación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditInterview = (interview: Interview) => {
    setSelectedInterview(interview);
    setFormData({
      position: interview.position,
      company: interview.company,
      notes: interview.notes || '',
      interview_date: interview.interview_date || '',
      interview_link: interview.interview_link || '',
      job_type: interview.job_type || '',
      location: interview.location || ''
    });
  };

  const handleUpdateInterview = async () => {
    if (!selectedInterview || !user) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('job_applications_tracking')
        .update({
          position: formData.position,
          company: formData.company,
          notes: formData.notes || null,
          interview_date: formData.interview_date || null,
          interview_link: formData.interview_link || null,
          job_type: formData.job_type || null,
          location: formData.location || null
        })
        .eq('id', selectedInterview.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating interview:', error);
        toast.error('Error al actualizar la postulación');
        return;
      }

      // If there's a linked CV, update it as well
      if (selectedInterview.cv_id && (selectedInterview.position !== formData.position || selectedInterview.company !== formData.company)) {
        await updateLinkedCV(selectedInterview.cv_id, formData.position, formData.company);
      }

      await fetchInterviews();
      resetForm();
      toast.success("Postulación actualizada");
    } catch (error) {
      console.error('Error updating interview:', error);
      toast.error('Error al actualizar la postulación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateLinkedCV = async (cvId: string, newPosition: string, newCompany: string) => {
    try {
      // Get current CV data
      const { data: cvData, error: fetchError } = await supabase
        .from('cvs')
        .select('content, title')
        .eq('id', cvId)
        .single();

      if (fetchError) {
        console.error('Error fetching CV:', fetchError);
        return;
      }

      // Update CV title and content
      const newTitle = `${newPosition} en ${newCompany}`;
      const updatedContent = {
        ...cvData.content,
        jobTitle: newPosition,
        companyName: newCompany
      };

      const { error: updateError } = await supabase
        .from('cvs')
        .update({
          title: newTitle,
          content: updatedContent,
          last_updated: new Date().toISOString()
        })
        .eq('id', cvId);

      if (updateError) {
        console.error('Error updating linked CV:', updateError);
      }
    } catch (error) {
      console.error('Error updating linked CV:', error);
    }
  };

  const handleDeleteInterview = async () => {
    if (!selectedInterview || !user) return;

    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('job_applications_tracking')
        .delete()
        .eq('id', selectedInterview.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting interview:', error);
        toast.error('Error al eliminar la postulación');
        return;
      }

      await fetchInterviews();
      resetForm();
      toast.success("Postulación eliminada correctamente");
    } catch (error) {
      console.error('Error deleting interview:', error);
      toast.error('Error al eliminar la postulación');
    } finally {
      setIsDeleting(false);
    }
  };

  const updateInterviewStatus = async (interviewId: string, newStatus: Interview['status']) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('job_applications_tracking')
        .update({ status: newStatus })
        .eq('id', interviewId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating status:', error);
        toast.error('Error al mover la postulación');
        return false;
      }

      // Update local state immediately for better UX
      setInterviews(prev => prev.map(interview =>
        interview.id === interviewId
          ? { ...interview, status: newStatus }
          : interview
      ));

      return true;
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al mover la postulación');
      return false;
    }
  };

  return {
    interviews,
    loading,
    selectedInterview,
    isSubmitting,
    isDeleting,
    formData,
    setFormData,
    resetForm,
    handleAddInterview,
    handleEditInterview,
    handleUpdateInterview,
    handleDeleteInterview,
    updateInterviewStatus,
    fetchInterviews
  };
};
