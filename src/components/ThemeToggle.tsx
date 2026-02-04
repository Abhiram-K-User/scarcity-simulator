import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { motion } from 'framer-motion';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full glassmorphic p-1 cursor-pointer hover-lift"
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, rgba(0, 245, 255, 0.2), rgba(139, 92, 246, 0.2))'
            : 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(59, 130, 246, 0.2))'
        }}
        transition={{ duration: 0.3 }}
      />
      
      <motion.div
        className="relative w-5 h-5 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center"
        animate={{
          x: theme === 'dark' ? 24 : 0
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30
        }}
      >
        {theme === 'dark' ? (
          <Moon className="w-3 h-3 text-cyan-400" />
        ) : (
          <Sun className="w-3 h-3 text-amber-500" />
        )}
      </motion.div>
    </motion.button>
  );
};
