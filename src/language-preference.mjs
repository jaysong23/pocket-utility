const supported = ['ko', 'en', 'ja'];
export const languageKey = 'pocket-language';
export function preferredLanguage(saved, languages = []) {
  if (supported.includes(saved)) return saved;
  for (const value of languages) {
    const code = String(value).toLowerCase().split(/[-_]/)[0];
    if (supported.includes(code)) return code;
  }
  return 'en';
}
export function rememberLanguage(language) {
  if (!supported.includes(language)) return;
  try { localStorage.setItem(languageKey, language); } catch {}
}
// Only the entry page negotiates language. Explicit tool/language links stay shareable.
export function applyInitialLanguage() {
  const base = document.querySelector('meta[name="site-base"]')?.content || '/';
  if (location.pathname !== base && location.pathname !== base.replace(/\/$/, '')) return;
  let saved;
  try { saved = localStorage.getItem(languageKey); } catch {}
  const language = preferredLanguage(saved, navigator.languages?.length ? navigator.languages : [navigator.language]);
  if (language !== 'ko') history.replaceState({}, '', base + language + '/' + location.search + location.hash);
  document.documentElement.lang = language;
}
