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