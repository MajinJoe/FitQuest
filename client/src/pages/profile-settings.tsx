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

// Predefined avatar options
const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
  "https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
  "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
  "https://images.unsplash.com/photo-1581803118522-7b72a50f7e9f?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
  "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
  "https://images.unsplash.com/photo-1605993439219-9d09d2020fa5?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
  "https://images.unsplash.com/photo-1594736797933-d0a9ba7a9c9f?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
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
    <div className="max-w-sm mx-auto bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/character")}
            className="text-fantasy-gold hover:text-yellow-300"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-light-text">Profile Settings</h1>
        </div>
      </div>

      {/* Profile Form */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Selection */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-light-text flex items-center gap-2">
                <Camera className="h-5 w-5 text-fantasy-gold" />
                Profile Picture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={selectedAvatar}
                    alt="Selected avatar"
                    className="w-24 h-24 rounded-full border-4 border-fantasy-gold shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setIsAvatarSelectorOpen(!isAvatarSelectorOpen)}
                    className="absolute -bottom-2 -right-2 bg-fantasy-gold text-slate-900 p-2 rounded-full hover:bg-yellow-300 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {isAvatarSelectorOpen && (
                <div className="grid grid-cols-4 gap-2 p-4 bg-slate-700 rounded-lg">
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
                          ? "ring-4 ring-fantasy-gold"
                          : "ring-2 ring-slate-600"
                      }`}
                    >
                      <img
                        src={avatarUrl}
                        alt={`Avatar option ${index + 1}`}
                        className="w-12 h-12 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Character Name */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-light-text flex items-center gap-2">
                <User className="h-5 w-5 text-fantasy-gold" />
                Character Name
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="characterName" className="text-gray-300">
                  Choose your character name
                </Label>
                <Input
                  id="characterName"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="Enter your character name"
                  className="bg-slate-700 border-slate-600 text-gray-200 placeholder-gray-500"
                  maxLength={30}
                />
                <p className="text-xs text-gray-400">
                  {characterName.length}/30 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Character Class Info */}
          {character && (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <p className="text-gray-400 text-sm">Your Current Class</p>
                  <p className="text-fantasy-purple font-semibold text-lg">
                    {character.class}
                  </p>
                  <p className="text-xs text-gray-500">
                    Level {character.level} • {character.totalXP.toLocaleString()} Total XP
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <Button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="w-full bg-gradient-to-r from-fantasy-gold to-yellow-500 hover:from-yellow-500 hover:to-fantasy-gold text-slate-900 font-bold py-3"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}