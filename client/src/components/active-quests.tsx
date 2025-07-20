import { Mountain } from "lucide-react";
import type { Quest } from "@shared/schema";

interface ActiveQuestsProps {
  quests: Quest[];
}

export default function ActiveQuests({ quests }: ActiveQuestsProps) {
  const getQuestGradient = (type: string) => {
    switch (type) {
      case 'cardio':
        return 'bg-gradient-to-r from-fantasy-purple to-purple-800';
      case 'nutrition':
        return 'bg-gradient-to-r from-fantasy-green to-green-700';
      case 'hydration':
        return 'bg-gradient-to-r from-fantasy-blue to-blue-700';
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-800';
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'cardio':
        return 'border-purple-400';
      case 'nutrition':
        return 'border-green-400';
      case 'hydration':
        return 'border-blue-400';
      default:
        return 'border-gray-400';
    }
  };

  const getProgressPercentage = (quest: Quest) => {
    return Math.min((quest.currentProgress / quest.targetValue) * 100, 100);
  };

  const getProgressText = (quest: Quest) => {
    switch (quest.type) {
      case 'hydration':
        return `${quest.currentProgress}/${quest.targetValue} glasses`;
      case 'cardio':
        return `${quest.currentProgress}/${quest.targetValue} min`;
      case 'nutrition':
        return `${quest.currentProgress}/${quest.targetValue}g protein`;
      default:
        return `${quest.currentProgress}/${quest.targetValue}`;
    }
  };

  return (
    <section className="mb-6 px-4">
      <div className="rpg-card p-4 mb-4">
        <h2 className="rpg-title text-xl flex items-center justify-center">
          <Mountain className="text-fantasy-purple mr-3" size={24} />
          Active Dungeons
        </h2>
      </div>
      
      <div className="space-y-4">
        {quests.map((quest) => (
          <div key={quest.id} className="rpg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="rpg-title text-lg">{quest.name}</h3>
              <span className="bg-fantasy-gold text-wood-dark px-3 py-1 rounded pixel-border font-bold text-sm">
                +{quest.xpReward} XP
              </span>
            </div>
            <p className="rpg-text text-sm mb-4">{quest.description}</p>
            <div className="flex justify-between items-center">
              <div className="flex-1 mr-4">
                <div className="bg-wood-brown rounded h-3 overflow-hidden pixel-border">
                  <div 
                    className="xp-bar-fill h-full rounded-sm transition-all duration-500" 
                    style={{ width: `${getProgressPercentage(quest)}%` }}
                  ></div>
                </div>
              </div>
              <span className="rpg-text text-sm font-bold">
                {getProgressText(quest)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
