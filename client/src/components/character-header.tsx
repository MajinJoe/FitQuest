import { Cog } from "lucide-react";
import { Link } from "wouter";
import type { Character } from "@shared/schema";

interface CharacterHeaderProps {
  character: Character;
  dailyStats?: {
    xpGained: number;
    calories: number;
    caloriesBurned: number;
    workoutsCompleted: number;
    totalWorkouts: number;
  };
}

export default function CharacterHeader({ character, dailyStats }: CharacterHeaderProps) {
  const xpPercentage = (character.currentXP / character.nextLevelXP) * 100;

  return (
    <div className="rpg-card m-4 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img 
              src={character.avatarUrl} 
              alt="Character avatar" 
              className="w-20 h-20 rounded-full pixel-avatar"
            />
            <div className="absolute -bottom-2 -right-2 bg-fantasy-purple text-white text-xs font-bold px-2 py-1 rounded pixel-border">
              Lv.{character.level}
            </div>
          </div>
          <div>
            <h1 className="rpg-title text-xl">{character.name}</h1>
            <p className="rpg-text text-sm">{character.class}</p>
          </div>
        </div>
        <Link href="/profile/settings">
          <button className="rpg-button px-3 py-2 rounded">
            <Cog className="w-5 h-5" />
          </button>
        </Link>
      </div>

      {/* XP Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between rpg-text text-sm mb-2">
          <span>Experience to Level {character.level + 1}</span>
          <span>{character.currentXP.toLocaleString()} / {character.nextLevelXP.toLocaleString()}</span>
        </div>
        <div className="w-full bg-wood-brown rounded h-4 overflow-hidden pixel-border">
          <div 
            className="h-full xp-bar-fill rounded-sm" 
            style={{ width: `${xpPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Today's Stats */}
      {dailyStats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rpg-card bg-fantasy-green bg-opacity-10 p-3 text-center">
            <div className="rpg-title text-fantasy-green text-lg">+{dailyStats.xpGained}</div>
            <div className="rpg-text text-xs">XP Today</div>
          </div>
          <div className="rpg-card bg-fantasy-blue bg-opacity-10 p-3 text-center">
            <div className="rpg-title text-fantasy-blue text-lg">{dailyStats.calories || 0}</div>
            <div className="rpg-text text-xs">Calories</div>
          </div>
          <div className="rpg-card bg-fantasy-purple bg-opacity-10 p-3 text-center">
            <div className="rpg-title text-fantasy-purple text-lg">
              {dailyStats.workoutsCompleted}/{dailyStats.totalWorkouts}
            </div>
            <div className="rpg-text text-xs">Quests</div>
          </div>
        </div>
      )}
    </div>
  );
}
