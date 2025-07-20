import { useEffect, useState } from "react";
import { Star } from "lucide-react";

export default function XPNotification() {
  const [isVisible, setIsVisible] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);

  useEffect(() => {
    const handleXPGain = (event: CustomEvent) => {
      const { amount, leveledUp } = event.detail;
      setXpAmount(amount);
      setIsVisible(true);

      // Hide notification after 2 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 2000);

      // Show level up modal if leveled up
      if (leveledUp) {
        setTimeout(() => {
          const levelUpEvent = new CustomEvent('showLevelUp', { 
            detail: { newLevel: event.detail.newLevel }
          });
          window.dispatchEvent(levelUpEvent);
        }, 2100);
      }
    };

    window.addEventListener('showXPGain', handleXPGain as EventListener);
    
    return () => {
      window.removeEventListener('showXPGain', handleXPGain as EventListener);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-fantasy-gold text-dark-slate font-bold py-3 px-6 rounded-full shadow-lg animate-level-up z-50">
      <Star className="inline w-4 h-4 mr-2" />
      +{xpAmount} XP Gained!
    </div>
  );
}
