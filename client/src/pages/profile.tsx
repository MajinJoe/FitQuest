import { useState } from "react";
import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Save, Camera, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import type { User as UserType, Character } from "@shared/schema";
import { Link } from "wouter";

const profileFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters"),
  profileImageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

// Predefined avatar options (fantasy pixel art style)
const avatarOptions = [
  {
    name: "Knight",
    url: "data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%232D4A3E%22/%3E%3Crect%20x%3D%2225%22%20y%3D%2215%22%20width%3D%2250%22%20height%3D%2240%22%20fill%3D%22%234A5D23%22/%3E%3Crect%20x%3D%2230%22%20y%3D%2220%22%20width%3D%2240%22%20height%3D%2230%22%20fill%3D%22%235A6D33%22/%3E%3Crect%20x%3D%2235%22%20y%3D%2225%22%20width%3D%2230%22%20height%3D%2215%22%20fill%3D%22%231A1A1A%22/%3E%3Crect%20x%3D%2240%22%20y%3D%2228%22%20width%3D%224%22%20height%3D%223%22%20fill%3D%22%23FF6B35%22/%3E%3Crect%20x%3D%2256%22%20y%3D%2228%22%20width%3D%224%22%20height%3D%223%22%20fill%3D%22%23FF6B35%22/%3E%3Crect%20x%3D%2245%22%20y%3D%2210%22%20width%3D%2210%22%20height%3D%228%22%20fill%3D%22%23D63031%22/%3E%3Crect%20x%3D%2230%22%20y%3D%2255%22%20width%3D%2240%22%20height%3D%2235%22%20fill%3D%22%23636E72%22/%3E%3Crect%20x%3D%2235%22%20y%3D%2260%22%20width%3D%2230%22%20height%3D%2225%22%20fill%3D%22%2374B9FF%22/%3E%3Crect%20x%3D%2247%22%20y%3D%2265%22%20width%3D%226%22%20height%3D%2215%22%20fill%3D%22%23FDCB6E%22/%3E%3Crect%20x%3D%2242%22%20y%3D%2270%22%20width%3D%2216%22%20height%3D%225%22%20fill%3D%22%23FDCB6E%22/%3E%3C/svg%3E",
  },
  {
    name: "Wizard",
    url: "data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%232D1B69%22/%3E%3Crect%20x%3D%2230%22%20y%3D%2210%22%20width%3D%2240%22%20height%3D%2250%22%20fill%3D%22%23F39C12%22/%3E%3Crect%20x%3D%2235%22%20y%3D%2220%22%20width%3D%2230%22%20height%3D%2220%22%20fill%3D%22%23E74C3C%22/%3E%3Crect%20x%3D%2240%22%20y%3D%2225%22%20width%3D%224%22%20height%3D%223%22%20fill%3D%22%23000%22/%3E%3Crect%20x%3D%2256%22%20y%3D%2225%22%20width%3D%224%22%20height%3D%223%22%20fill%3D%22%23000%22/%3E%3Crect%20x%3D%2248%22%20y%3D%2232%22%20width%3D%224%22%20height%3D%222%22%20fill%3D%22%23000%22/%3E%3Crect%20x%3D%2240%22%20y%3D%225%22%20width%3D%2220%22%20height%3D%2210%22%20fill%3D%22%239B59B6%22/%3E%3Crect%20x%3D%2230%22%20y%3D%2260%22%20width%3D%2240%22%20height%3D%2235%22%20fill%3D%22%233498DB%22/%3E%3Crect%20x%3D%2245%22%20y%3D%2270%22%20width%3D%2210%22%20height%3D%2220%22%20fill%3D%22%23F1C40F%22/%3E%3C/svg%3E",
  },
  {
    name: "Orc",
    url: "data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%234A4A4A%22/%3E%3Crect%20x%3D%2225%22%20y%3D%2215%22%20width%3D%2250%22%20height%3D%2240%22%20fill%3D%22%2327AE60%22/%3E%3Crect%20x%3D%2230%22%20y%3D%2220%22%20width%3D%2240%22%20height%3D%2230%22%20fill%3D%22%2316A085%22/%3E%3Crect%20x%3D%2235%22%20y%3D%2225%22%20width%3D%2230%22%20height%3D%2215%22%20fill%3D%22%23E74C3C%22/%3E%3Crect%20x%3D%2240%22%20y%3D%2228%22%20width%3D%224%22%20height%3D%223%22%20fill%3D%22%23000%22/%3E%3Crect%20x%3D%2256%22%20y%3D%2228%22%20width%3D%224%22%20height%3D%223%22%20fill%3D%22%23000%22/%3E%3Crect%20x%3D%2220%22%20y%3D%2210%22%20width%3D%228%22%20height%3D%225%22%20fill%3D%22%23F1C40F%22/%3E%3Crect%20x%3D%2272%22%20y%3D%2210%22%20width%3D%228%22%20height%3D%225%22%20fill%3D%22%23F1C40F%22/%3E%3Crect%20x%3D%2230%22%20y%3D%2255%22%20width%3D%2240%22%20height%3D%2235%22%20fill%3D%22%238E44AD%22/%3E%3C/svg%3E",
  },
  {
    name: "Elf",
    url: "data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%2327AE60%22/%3E%3Crect%20x%3D%2225%22%20y%3D%2215%22%20width%3D%2250%22%20height%3D%2240%22%20fill%3D%22%23F39C12%22/%3E%3Crect%20x%3D%2230%22%20y%3D%2220%22%20width%3D%2240%22%20height%3D%2230%22%20fill%3D%22%23E8C547%22/%3E%3Crect%20x%3D%2235%22%20y%3D%2225%22%20width%3D%2230%22%20height%3D%2215%22%20fill%3D%22%233498DB%22/%3E%3Crect%20x%3D%2240%22%20y%3D%2228%22%20width%3D%224%22%20height%3D%223%22%20fill%3D%22%23000%22/%3E%3Crect%20x%3D%2256%22%20y%3D%2228%22%20width%3D%224%22%20height%3D%223%22%20fill%3D%22%23000%22/%3E%3Crect%20x%3D%2220%22%20y%3D%2215%22%20width%3D%2210%22%20height%3D%228%22%20fill%3D%22%23E8C547%22/%3E%3Crect%20x%3D%2270%22%20y%3D%2215%22%20width%3D%2210%22%20height%3D%228%22%20fill%3D%22%23E8C547%22/%3E%3Crect%20x%3D%2230%22%20y%3D%2255%22%20width%3D%2240%22%20height%3D%2235%22%20fill%3D%22%2316A085%22/%3E%3C/svg%3E",
  },
  {
    name: "Dwarf",
    url: "data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%23795548%22/%3E%3Crect%20x%3D%2225%22%20y%3D%2215%22%20width%3D%2250%22%20height%3D%2240%22%20fill%3D%22%23D2691E%22/%3E%3Crect%20x%3D%2230%22%20y%3D%2220%22%20width%3D%2240%22%20height%3D%2230%22%20fill%3D%22%23CD853F%22/%3E%3Crect%20x%3D%2235%22%20y%3D%2225%22%20width%3D%2230%22%20height%3D%2215%22%20fill%3D%22%23A0522D%22/%3E%3Crect%20x%3D%2240%22%20y%3D%2228%22%20width%3D%224%22%20height%3D%223%22%20fill%3D%22%23000%22/%3E%3Crect%20x%3D%2256%22%20y%3D%2228%22%20width%3D%224%22%20height%3D%223%22%20fill%3D%22%23000%22/%3E%3Crect%20x%3D%2225%22%20y%3D%2240%22%20width%3D%2250%22%20height%3D%2215%22%20fill%3D%22%238B4513%22/%3E%3Crect%20x%3D%2230%22%20y%3D%2255%22%20width%3D%2240%22%20height%3D%2235%22%20fill%3D%22%236A5ACD%22/%3E%3C/svg%3E",
  },
  {
    name: "Rogue",
    url: "data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%232F2F2F%22/%3E%3Crect%20x%3D%2225%22%20y%3D%2215%22%20width%3D%2250%22%20height%3D%2240%22%20fill%3D%22%23000%22/%3E%3Crect%20x%3D%2230%22%20y%3D%2220%22%20width%3D%2240%22%20height%3D%2230%22%20fill%3D%22%23333%22/%3E%3Crect%20x%3D%2235%22%20y%3D%2225%22%20width%3D%2230%22%20height%3D%2215%22%20fill%3D%22%234A4A4A%22/%3E%3Crect%20x%3D%2240%22%20y%3D%2228%22%20width%3D%224%22%20height%3D%223%22%20fill%3D%22%23E74C3C%22/%3E%3Crect%20x%3D%2256%22%20y%3D%2228%22%20width%3D%224%22%20height%3D%223%22%20fill%3D%22%23E74C3C%22/%3E%3Crect%20x%3D%2235%22%20y%3D%225%22%20width%3D%2230%22%20height%3D%2215%22%20fill%3D%22%23000%22/%3E%3Crect%20x%3D%2230%22%20y%3D%2255%22%20width%3D%2240%22%20height%3D%2235%22%20fill%3D%22%235D4E75%22/%3E%3C/svg%3E",
  },
  {
    name: "Paladin",
    url: "data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%23FFD700%22/%3E%3Crect%20x%3D%2225%22%20y%3D%2215%22%20width%3D%2250%22%20height%3D%2240%22%20fill%3D%22%23F8F8FF%22/%3E%3Crect%20x%3D%2230%22%20y%3D%2220%22%20width%3D%2240%22%20height%3D%2230%22%20fill%3D%22%23F0F0F0%22/%3E%3Crect%20x%3D%2235%22%20y%3D%2225%22%20width%3D%2230%22%20height%3D%2215%22%20fill%3D%22%234682B4%22/%3E%3Crect%20x%3D%2240%22%20y%3D%2228%22%20width%3D%224%22%20height%3D%223%22%20fill%3D%22%23000%22/%3E%3Crect%20x%3D%2256%22%20y%3D%2228%22%20width%3D%224%22%20height%3D%223%22%20fill%3D%22%23000%22/%3E%3Crect%20x%3D%2240%22%20y%3D%2210%22%20width%3D%2220%22%20height%3D%2210%22%20fill%3D%22%23FFD700%22/%3E%3Crect%20x%3D%2230%22%20y%3D%2255%22%20width%3D%2240%22%20height%3D%2235%22%20fill%3D%22%23C0C0C0%22/%3E%3C/svg%3E",
  },
  {
    name: "Barbarian",
    url: "data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%238B4513%22/%3E%3Crect%20x%3D%2225%22%20y%3D%2215%22%20width%3D%2250%22%20height%3D%2240%22%20fill%3D%22%23D2691E%22/%3E%3Crect%20x%3D%2230%22%20y%3D%2220%22%20width%3D%2240%22%20height%3D%2230%22%20fill%3D%22%23CD853F%22/%3E%3Crect%20x%3D%2235%22%20y%3D%2225%22%20width%3D%2230%22%20height%3D%2215%22%20fill%3D%22%23A0522D%22/%3E%3Crect%20x%3D%2240%22%20y%3D%2228%22%20width%3D%224%22%20height%3D%223%22%20fill%3D%22%23FF4500%22/%3E%3Crect%20x%3D%2256%22%20y%3D%2228%22%20width%3D%224%22%20height%3D%223%22%20fill%3D%22%23FF4500%22/%3E%3Crect%20x%3D%2230%22%20y%3D%225%22%20width%3D%2240%22%20height%3D%2215%22%20fill%3D%22%23654321%22/%3E%3Crect%20x%3D%2230%22%20y%3D%2255%22%20width%3D%2240%22%20height%3D%2235%22%20fill%3D%22%238B0000%22/%3E%3C/svg%3E",
  },
];

export default function ProfilePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");

  // Get current user data
  const { data: user, isLoading: userLoading } = useQuery<UserType>({
    queryKey: ["/api/user"],
  });

  // Get character data for display
  const { data: character } = useQuery<Character>({
    queryKey: ["/api/character"],
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || "",
      profileImageUrl: user?.profileImageUrl || "",
    },
  });

  // Reset form when user data loads
  React.useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        profileImageUrl: user.profileImageUrl || "",
      });
      setSelectedAvatar(user.profileImageUrl || "");
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return apiRequest("/api/user/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated!",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/character"] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    // Use selected avatar if no custom URL provided
    const profileData = {
      ...data,
      profileImageUrl: selectedAvatar || data.profileImageUrl,
    };
    updateProfileMutation.mutate(profileData);
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    form.setValue("profileImageUrl", ""); // Clear custom URL when avatar selected
  };

  if (userLoading) {
    return (
      <div className="max-w-sm mx-auto fantasy-bg min-h-screen flex items-center justify-center">
        <div className="text-light-text">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-sm mx-auto fantasy-bg min-h-screen flex items-center justify-center">
        <div className="text-light-text">User not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto fantasy-bg min-h-screen">
      <div className="rpg-card m-4 p-4">
        <div className="flex items-center justify-between mb-2">
          <Link to="/character" className="rpg-button-secondary p-2 rounded" data-testid="button-back">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="rpg-title text-xl flex items-center">
            <User className="mr-2 text-fantasy-gold" size={24} />
            Profile Settings
          </h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
        <p className="rpg-text text-center text-sm">Customize your adventure identity</p>
      </div>

      <main className="p-4 pb-20">
        {/* Current Profile Card */}
        <Card className="rpg-card mb-6" data-testid="card-current-profile">
          <CardHeader>
            <CardTitle className="rpg-title text-lg text-center">Current Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative">
              <img 
                src={selectedAvatar || user.profileImageUrl || avatarOptions[0].url} 
                alt="Profile avatar" 
                className="w-20 h-20 rounded-full pixel-avatar border-4 border-fantasy-gold"
                data-testid="img-current-avatar"
              />
              {character && (
                <div className="absolute -bottom-2 -right-2 bg-fantasy-purple text-white text-xs font-bold px-2 py-1 rounded pixel-border">
                  Lv.{character.level}
                </div>
              )}
            </div>
            <div className="text-center">
              <h3 className="rpg-title text-lg" data-testid="text-current-username">{user.username}</h3>
              <p className="rpg-text text-sm opacity-70">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Edit Form */}
        <Card className="rpg-card mb-6" data-testid="card-edit-profile">
          <CardHeader>
            <CardTitle className="rpg-title text-lg">Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Username Field */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="rpg-text font-bold">Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your username" 
                          {...field} 
                          className="rpg-input"
                          data-testid="input-username"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Avatar Selection */}
                <div className="space-y-3">
                  <Label className="rpg-text font-bold">Choose Avatar</Label>
                  <div className="grid grid-cols-4 gap-3">
                    {avatarOptions.map((avatar, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleAvatarSelect(avatar.url)}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          selectedAvatar === avatar.url 
                            ? 'border-fantasy-gold bg-fantasy-gold/20' 
                            : 'border-wood-brown/30 hover:border-fantasy-gold/50'
                        }`}
                        data-testid={`button-avatar-${avatar.name.toLowerCase()}`}
                      >
                        <img 
                          src={avatar.url} 
                          alt={avatar.name}
                          className="w-full h-auto rounded pixel-avatar"
                        />
                        <span className="text-xs rpg-text mt-1 block">{avatar.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Avatar URL */}
                <FormField
                  control={form.control}
                  name="profileImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="rpg-text font-bold flex items-center">
                        <Camera className="w-4 h-4 mr-2" />
                        Custom Avatar URL (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/avatar.jpg" 
                          {...field} 
                          className="rpg-input"
                          data-testid="input-avatar-url"
                          onChange={(e) => {
                            field.onChange(e);
                            if (e.target.value) {
                              setSelectedAvatar(e.target.value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full rpg-button"
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-profile"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}