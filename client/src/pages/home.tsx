import { useQuery } from "@tanstack/react-query";
import CharacterHeader from "@/components/character-header";
import ActiveQuests from "@/components/active-quests";
import QuickActions from "@/components/quick-actions";
import ActivityFeed from "@/components/activity-feed";
import BottomNavigation from "@/components/bottom-navigation";
import XPNotification from "@/components/xp-notification";
import LevelUpModal from "@/components/level-up-modal";
import HealthSync from "@/components/health-sync";
import type { Character, Quest, Activity } from "@shared/schema";

export default function Home() {
  const { data: character } = useQuery<Character>({
    queryKey: ["/api/character"],
  });

  const { data: activeQuests } = useQuery<Quest[]>({
    queryKey: ["/api/quests/active"],
  });

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: dailyStats } = useQuery<{
    xpGained: number;
    caloriesBurned: number;
    workoutsCompleted: number;
    totalWorkouts: number;
  }>({
    queryKey: ["/api/stats/daily"],
  });

  if (!character) {
    return (
      <div className="max-w-sm mx-auto bg-slate-900 min-h-screen flex items-center justify-center">
        <div className="text-light-text">Loading your adventure...</div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto bg-slate-900 min-h-screen fantasy-bg relative overflow-hidden">
      {/* Background Pixel Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-2 h-2 bg-fantasy-gold rounded-sm animate-ping"></div>
        <div className="absolute top-32 right-8 w-1 h-1 bg-fantasy-purple rounded-sm animate-pulse"></div>
        <div className="absolute top-64 left-6 w-1.5 h-1.5 bg-fantasy-green rounded-sm animate-bounce"></div>
        <div className="absolute bottom-32 right-12 w-2 h-2 bg-fantasy-gold rounded-sm animate-ping delay-1000"></div>
        <div className="absolute top-20 right-20 w-1 h-1 bg-fantasy-blue rounded-sm animate-pulse delay-500"></div>
        <div className="absolute bottom-64 left-12 w-1.5 h-1.5 bg-fantasy-purple rounded-sm animate-bounce delay-700"></div>
      </div>

      <CharacterHeader character={character} dailyStats={dailyStats} />

      <main className="pb-20">
        {activeQuests && <ActiveQuests quests={activeQuests} />}
        <QuickActions />
        
        {/* Health Sync Section */}
        <section className="mb-6 px-4">
          <div className="rpg-card p-4">
            <HealthSync />
          </div>
        </section>
        
        {activities && (
          <section className="px-4">
            <div className="rpg-card p-4">
              <ActivityFeed activities={activities} />
            </div>
          </section>
        )}
      </main>

      <BottomNavigation currentPath="/" />
      <XPNotification />
      <LevelUpModal />
    </div>
  );
}
