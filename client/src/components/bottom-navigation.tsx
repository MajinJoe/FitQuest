import { Home, Utensils, Dumbbell, User, TrendingUp } from "lucide-react";
import { Link } from "wouter";

interface BottomNavigationProps {
  currentPath: string;
}

export default function BottomNavigation({ currentPath }: BottomNavigationProps) {
  const navItems = [
    { path: "/", icon: Home, label: "Quest Hub" },
    { path: "/nutrition", icon: Utensils, label: "Nutrition" },
    { path: "/exercises", icon: Dumbbell, label: "Exercises" },
    { path: "/character", icon: User, label: "Character" },
    { path: "/progress", icon: TrendingUp, label: "Progress" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-slate-900 border-t border-slate-700 glass-effect">
      <div className="flex justify-around py-2">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link key={path} href={path}>
            <button 
              className={`flex flex-col items-center py-2 px-4 transition-colors ${
                currentPath === path 
                  ? 'text-fantasy-gold' 
                  : 'text-gray-400 hover:text-light-text'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs">{label}</span>
            </button>
          </Link>
        ))}
      </div>
    </nav>
  );
}
