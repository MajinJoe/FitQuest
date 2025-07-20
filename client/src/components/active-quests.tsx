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
    <section className="mb-6">
      <h2 className="text-xl font-bold mb-4 flex items-center text-light-text">
        <Mountain className="text-fantasy-purple mr-2" />
        Active Dungeons
      </h2>
      
      <div className="space-y-3">
        {quests.map((quest) => (
          <div key={quest.id} className={`${getQuestGradient(quest.type)} rounded-xl p-4 border ${getBorderColor(quest.type)}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-light-text">{quest.name}</h3>
              <span className="bg-fantasy-gold text-dark-slate px-2 py-1 rounded-full text-xs font-bold">
                +{quest.xpReward} XP
              </span>
            </div>
            <p className="text-sm text-gray-200 mb-3">{quest.description}</p>
            <div className="flex justify-between items-center">
              <div className="flex-1 mr-3">
                <div className="bg-black bg-opacity-30 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-fantasy-green to-green-400 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${getProgressPercentage(quest)}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-xs text-gray-200">{getProgressText(quest)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
