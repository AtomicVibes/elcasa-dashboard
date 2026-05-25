/**
 * Theme Initialization Script
 * 
 * This script must run BEFORE React hydration to prevent theme flash.
 * It reads the persisted theme preference and applies it to the document root.
 * 
 * This is injected via a script tag in the root layout to execute before component render.
 */

(function themeInitialization() {
  try {
    const THEME_KEY = 'global-app-theme';
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';

    // Apply theme class to document root immediately
    if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {
    // localStorage not available (e.g., in SSR context)
    // Silently fail - default to dark theme
    document.documentElement.classList.add('dark');
  }
})();
