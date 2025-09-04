import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    if (theme === "dark") {
      return <Moon className="h-4 w-4" />;
    } else if (theme === "light") {
      return <Sun className="h-4 w-4" />;
    } else {
      return <Sun className="h-4 w-4" />; // system default to sun
    }
  };

  const getLabel = () => {
    if (theme === "dark") {
      return "ダークモード";
    } else if (theme === "light") {
      return "ライトモード";
    } else {
      return "システム";
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="flex items-center gap-2"
    >
      {getIcon()}
      <span className="text-sm">{getLabel()}</span>
    </Button>
  );
}