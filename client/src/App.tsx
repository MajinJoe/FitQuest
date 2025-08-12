import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Nutrition from "@/pages/nutrition";
import Workouts from "@/pages/workouts";
import ExerciseTracking from "@/pages/exercise-tracking";
import Character from "@/pages/character";
import Progress from "@/pages/progress";
import ProfileSettings from "@/pages/profile-settings";
import NotFound from "@/pages/not-found";

// Router component for handling application routes
function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/nutrition" component={Nutrition} />
      <Route path="/workouts" component={Workouts} />
      <Route path="/exercises" component={ExerciseTracking} />
      <Route path="/character" component={Character} />
      <Route path="/progress" component={Progress} />
      <Route path="/profile/settings" component={ProfileSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
