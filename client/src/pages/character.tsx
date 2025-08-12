import { useQuery } from "@tanstack/react-query";
import { Trophy, User, Star, Award, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/bottom-navigation";
import type { Character, Achievement } from "@shared/schema";
import { Link } from "wouter";

export default function CharacterPage() {
  const { data: character } = useQuery<Character>({
    queryKey: ["/api/character"],
  });

  const { data: achievements } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  if (!character) {
    return (
      <div className="max-w-sm mx-auto fantasy-bg min-h-screen flex items-center justify-center">
        <div className="text-light-text">Loading character...</div>
      </div>
    );
  }

  const xpPercentage = (character.currentXP / character.nextLevelXP) * 100;

  return (
    <div className="max-w-sm mx-auto fantasy-bg min-h-screen">
      <div className="rpg-card m-4 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10" /> {/* Spacer for centering */}
          <h1 className="rpg-title text-2xl flex items-center">
            <User className="mr-3 text-fantasy-gold" size={28} />
            Character Profile
          </h1>
          <Link to="/profile" className="rpg-button-secondary p-2 rounded" data-testid="button-profile-settings">
            <Settings size={20} />
          </Link>
        </div>
        <p className="rpg-text text-center">Your fitness journey</p>
      </div>

      <main className="p-4 pb-20">
        {/* Character Card */}
        <div className="rpg-card mb-6 p-6">
          <div className="flex items-center space-x-5 mb-6">
            <div className="relative">
              <img 
                src={character.avatarUrl} 
                alt="Character avatar" 
                className="w-24 h-24 rounded-full pixel-avatar"
              />
              <div className="absolute -bottom-3 -right-3 bg-fantasy-purple text-white text-sm font-bold px-3 py-2 rounded pixel-border">
                Lv.{character.level}
              </div>
            </div>
            <div>
              <h2 className="rpg-title text-2xl mb-1">{character.name}</h2>
              <p className="rpg-text text-lg text-fantasy-purple">{character.class}</p>
              <p className="rpg-text text-sm">Total XP: {character.totalXP.toLocaleString()}</p>
            </div>
          </div>

          {/* XP Progress */}
          <div className="mb-6">
            <div className="flex justify-between rpg-text mb-2">
              <span>Progress to Level {character.level + 1}</span>
              <span className="text-fantasy-gold font-bold">
                {character.currentXP.toLocaleString()} / {character.nextLevelXP.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-wood-brown rounded h-5 overflow-hidden pixel-border">
              <div 
                className="h-full xp-bar-fill rounded-sm"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Character Stats */}
        <div className="rpg-card p-4 mb-6">
          <h3 className="rpg-title text-fantasy-blue text-lg mb-4 text-center flex items-center justify-center">
            <Star className="mr-2" />
            Character Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rpg-card">
              <div className="text-xl rpg-title text-fantasy-green">{character.level}</div>
              <div className="text-xs rpg-text">Level</div>
            </div>
            <div className="text-center p-3 rpg-card">
              <div className="text-xl rpg-title text-fantasy-gold">{character.totalXP.toLocaleString()}</div>
              <div className="text-xs rpg-text">Total XP</div>
            </div>
            <div className="text-center p-3 rpg-card">
              <div className="text-xl rpg-title text-fantasy-purple">{achievements?.length || 0}</div>
              <div className="text-xs rpg-text">Achievements</div>
            </div>
            <div className="text-center p-3 rpg-card">
              <div className="text-xl rpg-title text-fantasy-blue">
                {Math.floor((Date.now() - new Date(character.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-xs rpg-text">Days Active</div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="rpg-card p-4">
          <h3 className="rpg-title text-fantasy-gold text-lg mb-4 text-center flex items-center justify-center">
            <Trophy className="mr-2" />
            Achievements
          </h3>
          {achievements && achievements.length > 0 ? (
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="rpg-card p-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className="rpg-title text-light-text">{achievement.name}</h3>
                      <p className="text-xs rpg-text">{achievement.description}</p>
                    </div>
                    <div className="text-fantasy-gold rpg-title text-sm">+{achievement.xpReward} XP</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 rpg-text">
              <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No achievements unlocked yet</p>
              <p className="text-sm">Complete quests to earn rewards!</p>
            </div>
          )}
        </div>
      </main>

      <BottomNavigation currentPath="/character" />
    </div>
  );
}
