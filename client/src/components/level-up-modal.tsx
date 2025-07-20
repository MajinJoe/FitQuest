import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function LevelUpModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [newLevel, setNewLevel] = useState(0);

  useEffect(() => {
    const handleLevelUp = (event: CustomEvent) => {
      setNewLevel(event.detail.newLevel);
      setIsVisible(true);
    };

    window.addEventListener('showLevelUp', handleLevelUp as EventListener);
    
    return () => {
      window.removeEventListener('showLevelUp', handleLevelUp as EventListener);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-fantasy-gold to-yellow-600 rounded-2xl p-8 text-center max-w-sm mx-4 animate-level-up">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-3xl font-bold text-dark-slate mb-2">LEVEL UP!</h2>
        <p className="text-dark-slate mb-4">You've reached Level {newLevel}!</p>
        <p className="text-sm text-gray-800 mb-6">New abilities and rewards unlocked!</p>
        <Button 
          onClick={handleClose}
          className="bg-dark-slate text-fantasy-gold hover:bg-slate-700"
        >
          Continue Adventure
        </Button>
      </div>
    </div>
  );
}
