/**
 * Applies the dark or light theme to the application.
 * @param {boolean} isDark - True if dark mode should be enabled.
 */
export const applyTheme = (isDark) => {
  const root = window.document.documentElement;
  if (isDark) {
    root.classList.add('dark');
    root.classList.remove('light');
    localStorage.setItem('dsa_tracker_theme', 'dark');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
    localStorage.setItem('dsa_tracker_theme', 'light');
  }
};
