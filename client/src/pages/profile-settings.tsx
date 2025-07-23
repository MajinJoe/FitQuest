import { useState } from "react";
import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Camera, User, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Character, UpdateCharacterProfile } from "@shared/schema";

// Fantasy character avatar options - pixel art style
const AVATAR_OPTIONS = [
  // Knight
  "data:image/svg+xml;base64," + btoa(`
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#2D4A3E"/>
      <!-- Helmet -->
      <rect x="25" y="15" width="50" height="40" fill="#4A5D23"/>
      <rect x="30" y="20" width="40" height="30" fill="#5A6D33"/>
      <!-- Visor -->
      <rect x="35" y="25" width="30" height="15" fill="#1A1A1A"/>
      <rect x="40" y="28" width="4" height="3" fill="#FF6B35"/>
      <rect x="56" y="28" width="4" height="3" fill="#FF6B35"/>
      <!-- Plume -->
      <rect x="45" y="10" width="10" height="8" fill="#D63031"/>
      <!-- Body armor -->
      <rect x="30" y="55" width="40" height="35" fill="#636E72"/>
      <rect x="35" y="60" width="30" height="25" fill="#74B9FF"/>
      <!-- Cross emblem -->
      <rect x="47" y="65" width="6" height="15" fill="#FDCB6E"/>
      <rect x="42" y="70" width="16" height="5" fill="#FDCB6E"/>
    </svg>
  `),
  
  // Wizard
  "data:image/svg+xml;base64," + btoa(`
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#1A1A2E"/>
      <!-- Hat -->
      <polygon points="50,10 35,50 65,50" fill="#6C5CE7"/>
      <rect x="30" y="45" width="40" height="8" fill="#74B9FF"/>
      <!-- Stars on hat -->
      <circle cx="45" cy="30" r="2" fill="#FDCB6E"/>
      <circle cx="55" cy="35" r="1.5" fill="#FDCB6E"/>
      <!-- Face -->
      <rect x="35" y="50" width="30" height="25" fill="#FFEAA7"/>
      <!-- Eyes -->
      <rect x="40" y="58" width="4" height="4" fill="#0984E3"/>
      <rect x="56" y="58" width="4" height="4" fill="#0984E3"/>
      <!-- Beard -->
      <rect x="35" y="68" width="30" height="15" fill="#DDD"/>
      <!-- Robes -->
      <rect x="25" y="75" width="50" height="25" fill="#A29BFE"/>
      <rect x="30" y="80" width="40" height="20" fill="#6C5CE7"/>
      <!-- Staff -->
      <rect x="15" y="20" width="3" height="60" fill="#8B4513"/>
      <circle cx="16" cy="18" r="4" fill="#00B894"/>
    </svg>
  `),
  
  // Orc Warrior
  "data:image/svg+xml;base64," + btoa(`
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#2D1B1B"/>
      <!-- Head -->
      <rect x="30" y="20" width="40" height="35" fill="#7CB342"/>
      <!-- Ears -->
      <polygon points="25,30 30,25 30,40" fill="#689F38"/>
      <polygon points="70,25 75,30 70,40" fill="#689F38"/>
      <!-- Eyes -->
      <rect x="35" y="30" width="6" height="6" fill="#D32F2F"/>
      <rect x="59" y="30" width="6" height="6" fill="#D32F2F"/>
      <!-- Tusks -->
      <rect x="42" y="45" width="3" height="8" fill="#FFF"/>
      <rect x="55" y="45" width="3" height="8" fill="#FFF"/>
      <!-- Nose -->
      <rect x="47" y="38" width="6" height="4" fill="#689F38"/>
      <!-- Body armor -->
      <rect x="25" y="55" width="50" height="35" fill="#424242"/>
      <rect x="30" y="60" width="40" height="25" fill="#795548"/>
      <!-- Spikes -->
      <rect x="35" y="55" width="4" height="8" fill="#757575"/>
      <rect x="45" y="55" width="4" height="8" fill="#757575"/>
      <rect x="55" y="55" width="4" height="8" fill="#757575"/>
    </svg>
  `),
  
  // Elf Ranger
  "data:image/svg+xml;base64," + btoa(`
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#1B3A1B"/>
      <!-- Head -->
      <rect x="32" y="25" width="36" height="30" fill="#FFEAA7"/>
      <!-- Pointed ears -->
      <polygon points="28,35 32,30 32,45" fill="#FFEAA7"/>
      <polygon points="68,30 72,35 68,45" fill="#FFEAA7"/>
      <!-- Hair -->
      <rect x="30" y="20" width="40" height="15" fill="#8D6E63"/>
      <!-- Eyes -->
      <rect x="38" y="33" width="4" height="4" fill="#4CAF50"/>
      <rect x="58" y="33" width="4" height="4" fill="#4CAF50"/>
      <!-- Hood -->
      <polygon points="50,15 25,50 75,50" fill="#2E7D32"/>
      <rect x="20" y="45" width="60" height="8" fill="#4CAF50"/>
      <!-- Green cloak -->
      <rect x="20" y="55" width="60" height="35" fill="#388E3C"/>
      <rect x="25" y="60" width="50" height="25" fill="#2E7D32"/>
      <!-- Bow -->
      <rect x="75" y="30" width="3" height="40" fill="#8D6E63"/>
      <path d="M77 30 Q85 50 77 70" stroke="#654321" stroke-width="2" fill="none"/>
    </svg>
  `),
  
  // Dwarf
  "data:image/svg+xml;base64," + btoa(`
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#3E2723"/>
      <!-- Head -->
      <rect x="30" y="30" width="40" height="25" fill="#FFEAA7"/>
      <!-- Helmet -->
      <rect x="25" y="25" width="50" height="20" fill="#607D8B"/>
      <rect x="20" y="30" width="60" height="8" fill="#455A64"/>
      <!-- Eyes -->
      <rect x="36" y="38" width="4" height="4" fill="#1976D2"/>
      <rect x="60" y="38" width="4" height="4" fill="#1976D2"/>
      <!-- Nose -->
      <rect x="47" y="42" width="6" height="4" fill="#FFE082"/>
      <!-- Beard -->
      <rect x="25" y="50" width="50" height="30" fill="#8D6E63"/>
      <rect x="30" y="55" width="40" height="25" fill="#6D4C41"/>
      <!-- Body -->
      <rect x="30" y="80" width="40" height="20" fill="#FF5722"/>
      <!-- Hammer -->
      <rect x="10" y="60" width="15" height="8" fill="#9E9E9E"/>
      <rect x="15" y="50" width="5" height="25" fill="#8D6E63"/>
    </svg>
  `),
  
  // Rogue/Assassin
  "data:image/svg+xml;base64," + btoa(`
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#0D0D0D"/>
      <!-- Hood -->
      <polygon points="50,10 20,55 80,55" fill="#212121"/>
      <rect x="15" y="50" width="70" height="8" fill="#424242"/>
      <!-- Face (partially hidden) -->
      <rect x="35" y="40" width="30" height="20" fill="#FFE0B2"/>
      <!-- Mask -->
      <rect x="30" y="45" width="40" height="10" fill="#212121"/>
      <!-- Eyes -->
      <rect x="38" y="47" width="4" height="3" fill="#F44336"/>
      <rect x="58" y="47" width="4" height="3" fill="#F44336"/>
      <!-- Dark cloak -->
      <rect x="20" y="58" width="60" height="35" fill="#424242"/>
      <rect x="25" y="63" width="50" height="30" fill="#212121"/>
      <!-- Daggers -->
      <rect x="15" y="70" width="2" height="12" fill="#9E9E9E"/>
      <rect x="83" y="70" width="2" height="12" fill="#9E9E9E"/>
      <rect x="14" y="69" width="4" height="3" fill="#8D6E63"/>
      <rect x="82" y="69" width="4" height="3" fill="#8D6E63"/>
    </svg>
  `),
  
  // Paladin
  "data:image/svg+xml;base64," + btoa(`
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#E8F5E8"/>
      <!-- Helmet with wings -->
      <rect x="25" y="20" width="50" height="35" fill="#ECEFF1"/>
      <polygon points="20,30 25,25 25,40" fill="#FFC107"/>
      <polygon points="75,25 80,30 75,40" fill="#FFC107"/>
      <!-- Visor -->
      <rect x="30" y="30" width="40" height="15" fill="#37474F"/>
      <!-- Holy glow around head -->
      <circle cx="50" cy="37" r="32" fill="#FFF9C4" opacity="0.3"/>
      <!-- Armor -->
      <rect x="25" y="55" width="50" height="35" fill="#CFD8DC"/>
      <rect x="30" y="60" width="40" height="25" fill="#FFF"/>
      <!-- Holy symbol -->
      <rect x="47" y="65" width="6" height="15" fill="#FFD700"/>
      <rect x="42" y="70" width="16" height="5" fill="#FFD700"/>
      <circle cx="50" cy="72" r="3" fill="#FFF" opacity="0.8"/>
      <!-- Sword -->
      <rect x="75" y="40" width="4" height="30" fill="#9E9E9E"/>
      <rect x="72" y="35" width="10" height="8" fill="#8D6E63"/>
    </svg>
  `),
  
  // Barbarian
  "data:image/svg+xml;base64," + btoa(`
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#5D4037"/>
      <!-- Wild hair -->
      <rect x="25" y="15" width="50" height="25" fill="#3E2723"/>
      <rect x="20" y="20" width="60" height="15" fill="#5D4037"/>
      <!-- Face -->
      <rect x="30" y="35" width="40" height="25" fill="#FFAB91"/>
      <!-- War paint -->
      <rect x="32" y="40" width="8" height="3" fill="#D32F2F"/>
      <rect x="60" y="40" width="8" height="3" fill="#D32F2F"/>
      <rect x="45" y="37" width="10" height="3" fill="#D32F2F"/>
      <!-- Eyes -->
      <rect x="36" y="42" width="4" height="4" fill="#8BC34A"/>
      <rect x="60" y="42" width="4" height="4" fill="#8BC34A"/>
      <!-- Scars -->
      <rect x="38" y="50" width="12" height="1" fill="#8D6E63"/>
      <!-- Fur clothing -->
      <rect x="20" y="60" width="60" height="30" fill="#8D6E63"/>
      <rect x="25" y="65" width="50" height="20" fill="#A1887F"/>
      <!-- Battle axe -->
      <rect x="10" y="50" width="12" height="8" fill="#616161"/>
      <rect x="14" y="45" width="4" height="25" fill="#8D6E63"/>
    </svg>
  `),
];



export default function ProfileSettings() {
  const [, setLocation] = useLocation();
  const [characterName, setCharacterName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: character, isLoading } = useQuery<Character>({
    queryKey: ["/api/character"],
  });

  // Set initial values when character loads
  React.useEffect(() => {
    if (character && !characterName && !selectedAvatar) {
      setCharacterName(character.name);
      setSelectedAvatar(character.avatarUrl);
    }
  }, [character, characterName, selectedAvatar]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateCharacterProfile) => {
      const response = await fetch("/api/character/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/character"] });
      toast({
        title: "Profile updated!",
        description: "Your character profile has been successfully updated.",
      });
      setLocation("/character");
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!characterName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a character name.",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate({
      name: characterName.trim(),
      avatarUrl: selectedAvatar,
    });
  };

  // This logic is now in useEffect above

  if (isLoading) {
    return (
      <div className="max-w-sm mx-auto bg-slate-900 min-h-screen flex items-center justify-center">
        <div className="text-light-text">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto bg-slate-900 min-h-screen fantasy-bg">
      {/* Header */}
      <div className="rpg-card m-4 p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLocation("/character")}
            className="rpg-button px-3 py-2 rounded"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="rpg-title text-xl">Profile Settings</h1>
        </div>
      </div>

      {/* Profile Form */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Selection */}
          <div className="rpg-card p-6">
            <div className="rpg-title text-lg flex items-center gap-3 mb-4">
              <Camera className="h-6 w-6 text-fantasy-gold" />
              Profile Picture
            </div>
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={selectedAvatar}
                    alt="Selected avatar"
                    className="w-28 h-28 rounded-full pixel-avatar"
                  />
                  <button
                    type="button"
                    onClick={() => setIsAvatarSelectorOpen(!isAvatarSelectorOpen)}
                    className="absolute -bottom-2 -right-2 rpg-button p-3 rounded-full"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {isAvatarSelectorOpen && (
                <div className="grid grid-cols-4 gap-3 p-4 rpg-card">
                  {AVATAR_OPTIONS.map((avatarUrl, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(avatarUrl);
                        setIsAvatarSelectorOpen(false);
                      }}
                      className={`relative overflow-hidden rounded-full transition-transform hover:scale-105 ${
                        selectedAvatar === avatarUrl
                          ? "ring-4 ring-fantasy-gold pixel-avatar"
                          : "ring-2 ring-wood-brown pixel-avatar"
                      }`}
                    >
                      <img
                        src={avatarUrl}
                        alt={`Avatar option ${index + 1}`}
                        className="w-14 h-14 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Character Name */}
          <div className="rpg-card p-6">
            <div className="rpg-title text-lg flex items-center gap-3 mb-4">
              <User className="h-6 w-6 text-fantasy-gold" />
              Character Name
            </div>
            <div className="space-y-3">
              <Label htmlFor="characterName" className="rpg-text">
                Choose your character name
              </Label>
              <Input
                id="characterName"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="Enter your character name"
                className="bg-parchment border-wood-brown text-wood-dark placeholder-wood-brown pixel-border font-mono font-bold"
                maxLength={30}
              />
              <p className="rpg-text text-xs">
                {characterName.length}/30 characters
              </p>
            </div>
          </div>

          {/* Character Class Info */}
          {character && (
            <div className="rpg-card p-6">
              <div className="text-center space-y-3">
                <p className="rpg-text">Your Current Class</p>
                <p className="rpg-title text-fantasy-purple text-xl">
                  {character.class}
                </p>
                <p className="rpg-text text-sm">
                  Level {character.level} • {character.totalXP.toLocaleString()} Total XP
                </p>
              </div>
            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="w-full rpg-button py-4 text-lg rounded-lg"
          >
            <Save className="h-5 w-5 mr-3" />
            {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}