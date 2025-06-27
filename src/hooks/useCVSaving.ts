import { useState } from 'react';

export const useCVSaving = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [savingProgress, setSavingProgress] = useState(80);
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);

  const startSaveAnimation = () => {
    setIsSaving(true);
    setShowSaveAnimation(true);
    setSavingProgress(80);
    
    // Animate progress from 80% to 100%
    const progressInterval = setInterval(() => {
      setSavingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return progressInterval;
  };

  const finishSaveAnimation = (progressInterval: NodeJS.Timeout) => {
    clearInterval(progressInterval);
    setIsSaving(false);
    setShowSaveAnimation(false);
    setSavingProgress(80);
  };

  const handleSaveWithAnimation = async (saveFunction: () => Promise<void>) => {
    const progressInterval = startSaveAnimation();

    // Wait for animation to complete
    setTimeout(async () => {
      await saveFunction();
      finishSaveAnimation(progressInterval);
    }, 1000);
  };

  return {
    isSaving,
    savingProgress,
    showSaveAnimation,
    handleSaveWithAnimation
  };
};
