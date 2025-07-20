import { useQuery } from "@tanstack/react-query";
import { Trophy, User, Star, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import BottomNavigation from "@/components/bottom-navigation";
import type { Character, Achievement } from "@shared/schema";

export default function CharacterPage() {
  const { data: character } = useQuery<Character>({
    queryKey: ["/api/character"],
  });

  const { data: achievements } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  if (!character) {
    return (
      <div className="max-w-sm mx-auto bg-slate-900 min-h-screen flex items-center justify-center">
        <div className="text-light-text">Loading character...</div>
      </div>
    );
  }

  const xpPercentage = (character.currentXP / character.nextLevelXP) * 100;

  return (
    <div className="max-w-sm mx-auto bg-slate-900 min-h-screen fantasy-bg">
      <header className="p-4 glass-effect">
        <h1 className="text-2xl font-bold text-fantasy-gold flex items-center">
          <User className="mr-2" />
          Character Profile
        </h1>
        <p className="text-gray-300">Your fitness journey</p>
      </header>

      <main className="p-4 pb-20">
        {/* Character Card */}
        <Card className="mb-6 bg-gradient-to-br from-slate-800 to-slate-700 border-fantasy-gold">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <img 
                  src={character.avatarUrl} 
                  alt="Character avatar" 
                  className="w-20 h-20 rounded-full border-4 border-fantasy-gold shadow-lg"
                />
                <div className="absolute -bottom-2 -right-2 bg-fantasy-purple text-white text-sm font-bold px-3 py-1 rounded-full border-2 border-fantasy-gold">
                  Lv.{character.level}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-fantasy-gold">{character.name}</h2>
                <p className="text-gray-300">{character.class}</p>
                <p className="text-sm text-gray-400">Total XP: {character.totalXP.toLocaleString()}</p>
              </div>
            </div>

            {/* XP Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">Progress to Level {character.level + 1}</span>
                <span className="text-fantasy-gold font-bold">
                  {character.currentXP.toLocaleString()} / {character.nextLevelXP.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={xpPercentage} 
                className="h-3 bg-gray-700"
              />
            </div>
          </CardContent>
        </Card>

        {/* Character Stats */}
        <Card className="mb-6 bg-slate-800 border-fantasy-blue">
          <CardHeader>
            <CardTitle className="text-fantasy-blue flex items-center">
              <Star className="mr-2" />
              Character Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-slate-700 rounded-lg">
                <div className="text-xl font-bold text-fantasy-green">{character.level}</div>
                <div className="text-xs text-gray-400">Level</div>
              </div>
              <div className="text-center p-3 bg-slate-700 rounded-lg">
                <div className="text-xl font-bold text-fantasy-gold">{character.totalXP.toLocaleString()}</div>
                <div className="text-xs text-gray-400">Total XP</div>
              </div>
              <div className="text-center p-3 bg-slate-700 rounded-lg">
                <div className="text-xl font-bold text-fantasy-purple">{achievements?.length || 0}</div>
                <div className="text-xs text-gray-400">Achievements</div>
              </div>
              <div className="text-center p-3 bg-slate-700 rounded-lg">
                <div className="text-xl font-bold text-fantasy-blue">
                  {Math.floor((Date.now() - new Date(character.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-xs text-gray-400">Days Active</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="bg-slate-800 border-fantasy-gold">
          <CardHeader>
            <CardTitle className="text-fantasy-gold flex items-center">
              <Trophy className="mr-2" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {achievements && achievements.length > 0 ? (
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-light-text">{achievement.name}</h3>
                      <p className="text-xs text-gray-400">{achievement.description}</p>
                    </div>
                    <div className="text-fantasy-gold font-bold text-sm">+{achievement.xpReward} XP</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No achievements unlocked yet.</p>
                <p className="text-sm">Complete quests to earn rewards!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNavigation currentPath="/character" />
    </div>
  );
}
