import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

// Scroll progress bar
function useScrollProgress() {
  const rafId = useRef<number>(0);

  useEffect(() => {
    const bar = document.getElementById("scroll-progress");
    if (!bar) return;

    function update() {
      if (!bar) return;
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      bar.style.transform = `scaleX(${progress})`;
      bar.style.width = "100%";
    }

    function onScroll() {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, []);
}

export function Layout({ children }: LayoutProps) {
  useScrollProgress();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <motion.main
        className="flex-1"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}
