import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-10 h-10" />; // Placeholder

  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex items-center justify-center h-10 w-10 rounded-full border-2 border-foreground bg-card shadow-[3px_3px_0_0_hsl(var(--foreground))] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_0_hsl(var(--foreground))] transition-all overflow-hidden"
      whileTap={{ scale: 0.9 }}
      aria-label="Toggle dark mode"
    >
      <motion.div
        initial={false}
        animate={{
          y: isDark ? -30 : 0,
          opacity: isDark ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="absolute"
      >
        <Sun className="h-5 w-5" strokeWidth={2.5} />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          y: isDark ? 0 : 30,
          opacity: isDark ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="absolute"
      >
        <Moon className="h-5 w-5" strokeWidth={2.5} />
      </motion.div>
    </motion.button>
  );
}
