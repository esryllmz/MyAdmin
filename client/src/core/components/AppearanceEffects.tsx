import { useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/core/store/store";

/**
 * Applies the Appearance settings (density/font size/reduced motion) to <html> as data
 * attributes/classes so the CSS in index.css can react to them globally — mounted once at the
 * app root. Theme (light/dark) is handled separately by ThemeProvider; sidebar collapse is
 * read directly from the same slice by <Sidebar>.
 */
export const AppearanceEffects = () => {
  const { density, fontSize, reducedMotion } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    document.documentElement.setAttribute("data-density", density);
  }, [density]);

  useEffect(() => {
    document.documentElement.setAttribute("data-font-size", fontSize);
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reducedMotion);
  }, [reducedMotion]);

  return null;
};
