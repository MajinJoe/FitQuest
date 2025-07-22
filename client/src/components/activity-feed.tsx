import { ScrollText } from "lucide-react";
import { Apple, Dumbbell, Trophy, Zap } from "lucide-react";
import type { Activity } from "@shared/schema";

interface ActivityFeedProps {
  activities: Activity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'nutrition':
        return <Apple className="w-4 h-4" />;
      case 'workout':
        return <Dumbbell className="w-4 h-4" />;
      case 'achievement':
        return <Trophy className="w-4 h-4 text-dark-slate" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const getActivityBorderColor = (type: string) => {
    switch (type) {
      case 'nutrition':
        return 'border-fantasy-green';
      case 'workout':
        return 'border-fantasy-purple';
      case 'achievement':
        return 'border-fantasy-gold';
      default:
        return 'border-fantasy-blue';
    }
  };

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'nutrition':
        return 'bg-fantasy-green';
      case 'workout':
        return 'bg-fantasy-purple';
      case 'achievement':
        return 'bg-fantasy-gold';
      default:
        return 'bg-fantasy-blue';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
  };

  return (
    <div className="rpg-card p-4">
      <h2 className="rpg-title text-xl flex items-center justify-center mb-4">
        <ScrollText className="text-fantasy-gold mr-3" size={24} />
        Adventure Log
      </h2>
      
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="rpg-card p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`${getActivityBgColor(activity.type)} rounded p-2 pixel-border`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div>
                  <p className="rpg-text font-bold">{activity.description}</p>
                  <p className="rpg-text text-xs opacity-75">{formatTimeAgo(new Date(activity.createdAt))}</p>
                </div>
              </div>
              <span className="bg-fantasy-gold text-wood-dark px-2 py-1 rounded pixel-border font-bold text-sm">+{activity.xpGained} XP</span>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="text-center py-8 rpg-text">
            <p>No activities yet today.</p>
            <p className="text-sm">Start your adventure!</p>
          </div>
        )}
      </div>
    </div>
  );
}
