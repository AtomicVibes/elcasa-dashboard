export const THEME_STORAGE_KEY = 'global-app-theme';

export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}"),r=t==="light"||t==="dark"?t:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";r==="light"?document.documentElement.classList.remove("dark"):document.documentElement.classList.add("dark");document.documentElement.style.colorScheme=r}catch(e){document.documentElement.classList.add("dark")}})()`;
