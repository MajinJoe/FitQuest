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
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-parchment border-4 border-wood-brown px-3 py-2" style={{ borderImage: 'linear-gradient(45deg, var(--wood-brown), var(--copper)) 1' }}>
      <div className="flex justify-between items-center">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link key={path} href={path}>
            <button 
              className={`flex flex-col items-center py-2 px-2 rounded transition-all duration-300 min-w-[60px] ${
                currentPath === path 
                  ? 'bg-fantasy-gold text-wood-dark border-2 border-wood-brown font-bold shadow-md' 
                  : 'rpg-text hover:text-fantasy-gold hover:scale-110'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-bold leading-tight">{label}</span>
            </button>
          </Link>
        ))}
      </div>
    </nav>
  );
}
