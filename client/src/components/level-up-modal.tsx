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

  const encouragementMessages = [
    "You've come a long way on your fitness journey, traveler!",
    "Your dedication to wellness grows stronger with each step!",
    "The path to health mastery reveals itself to those who persist!",
    "Your body and spirit grow mightier through your commitment!",
    "Every workout brings you closer to your legendary potential!",
    "Your fitness journey inspires others to follow in your footsteps!",
    "Through discipline and determination, you forge ahead!"
  ];

  const getRandomEncouragement = () => {
    return encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="rpg-card max-w-lg w-full mx-4 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-fantasy-gold/20 to-yellow-600/20"></div>
        
        {/* Content */}
        <div className="relative p-8 text-center">
          <div className="text-7xl mb-6 animate-bounce">⚔️</div>
          <h2 className="rpg-title text-4xl mb-4 text-fantasy-gold">
            LEVEL UP!
          </h2>
          <div className="mb-6">
            <p className="rpg-text text-xl mb-2">
              You've reached Level {newLevel}!
            </p>
            <p className="rpg-text text-base italic mb-4 text-fantasy-gold/90">
              {getRandomEncouragement()}
            </p>
            <div className="flex items-center justify-center space-x-2 text-fantasy-gold/80">
              <span className="text-sm">✨ New abilities unlocked ✨</span>
            </div>
          </div>
          <Button 
            onClick={handleClose}
            className="bg-fantasy-gold text-wood-dark hover:bg-fantasy-gold/90 font-bold px-8 py-3 text-lg pixel-border"
            data-testid="button-continue-adventure"
          >
            Continue Your Quest
          </Button>
        </div>
      </div>
    </div>
  );
}
