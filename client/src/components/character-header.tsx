import { Cog } from "lucide-react";
import type { Character } from "@shared/schema";

interface CharacterHeaderProps {
  character: Character;
  dailyStats?: {
    xpGained: number;
    caloriesBurned: number;
    workoutsCompleted: number;
    totalWorkouts: number;
  };
}

export default function CharacterHeader({ character, dailyStats }: CharacterHeaderProps) {
  const xpPercentage = (character.currentXP / character.nextLevelXP) * 100;

  return (
    <header className="relative z-10 p-4 glass-effect">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img 
              src={character.avatarUrl} 
              alt="Character avatar" 
              className="w-16 h-16 rounded-full border-4 border-fantasy-gold shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 bg-fantasy-purple text-xs font-bold px-2 py-0.5 rounded-full border-2 border-fantasy-gold">
              {character.level}
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-fantasy-gold">{character.name}</h1>
            <p className="text-sm text-gray-300">{character.class}</p>
          </div>
        </div>
        <button className="text-fantasy-gold hover:text-yellow-300 transition-colors">
          <Cog className="w-6 h-6" />
        </button>
      </div>

      {/* XP Progress Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span>XP to Level {character.level + 1}</span>
          <span>{character.currentXP.toLocaleString()} / {character.nextLevelXP.toLocaleString()}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-fantasy-gold to-yellow-300 h-full rounded-full xp-bar-fill animate-pulse-glow" 
            style={{ width: `${xpPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Today's Stats */}
      {dailyStats && (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-fantasy-green bg-opacity-20 rounded-lg p-2">
            <div className="text-fantasy-green font-bold">+{dailyStats.xpGained}</div>
            <div className="text-xs text-gray-300">XP Today</div>
          </div>
          <div className="bg-fantasy-blue bg-opacity-20 rounded-lg p-2">
            <div className="text-fantasy-blue font-bold">{dailyStats.caloriesBurned}</div>
            <div className="text-xs text-gray-300">Calories</div>
          </div>
          <div className="bg-fantasy-purple bg-opacity-20 rounded-lg p-2">
            <div className="text-fantasy-purple font-bold">
              {dailyStats.workoutsCompleted}/{dailyStats.totalWorkouts}
            </div>
            <div className="text-xs text-gray-300">Quests</div>
          </div>
        </div>
      )}
    </header>
  );
}
