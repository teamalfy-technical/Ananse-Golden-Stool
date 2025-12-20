import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  isVisible: boolean;
}

export function SplashScreen({ isVisible }: SplashScreenProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          data-testid="splash-screen"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full h-full flex items-center justify-center p-4"
          >
            <img
              src="/cover.png"
              alt="Ananse: The Golden Deception"
              className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
              style={{ maxWidth: "min(100%, 500px)" }}
            />
          </motion.div>
          
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3.5, ease: "linear" }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-full"
            style={{ maxWidth: "200px" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
