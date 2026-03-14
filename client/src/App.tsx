import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GameProvider, useGame } from "./contexts/GameContext";
import WelcomeScreen from "./pages/WelcomeScreen";
import WorldMap from "./pages/WorldMap";
import LevelSelect from "./pages/LevelSelect";
import GameScreen from "./pages/GameScreen";
import RewardScreen from "./pages/RewardScreen";
import ScreenTimeReminder from "./pages/ScreenTimeReminder";

function GameRouter() {
  const { screen } = useGame();

  switch (screen) {
    case "welcome":
      return <WelcomeScreen />;
    case "worldMap":
      return <WorldMap />;
    case "levelSelect":
      return <LevelSelect />;
    case "game":
      return <GameScreen />;
    case "reward":
      return <RewardScreen />;
    case "screenTimeReminder":
      return <ScreenTimeReminder />;
    default:
      return <WelcomeScreen />;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <GameProvider>
            <GameRouter />
          </GameProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
