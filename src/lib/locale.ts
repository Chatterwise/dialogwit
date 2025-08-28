```diff
--- a/src/lib/locale.ts
+++ b/src/lib/locale.ts
@@ -1,10 +1,24 @@
-export function getGeoLanguageSuggestion() {
-  // Placeholder for actual geolocation logic
-  // In a real app, you'd use a service to get the user's country/language
-  // For now, let's just return 'es' as a dummy suggestion
-  return Promise.resolve('es');
+export function getStoredPreferredLanguage(): string | null {
+  if (typeof window === 'undefined') return null;
+  return localStorage.getItem('preferred_language');
 }
 
+export function setStoredPreferredLanguage(lang: string) {
+  if (typeof window === 'undefined') return;
+  localStorage.setItem('preferred_language', lang);
+}
+
+export async function getGeoLanguageSuggestion(): Promise<string | null> {
+  // In a real application, you would use a geolocation API to determine the user's language.
+  // For this example, we'll simulate a suggestion.
+  // You could use a service like ip-api.com or a similar one.
+  // Example: fetch('http://ip-api.com/json').then(res => res.json()).then(data => data.countryCode);
+
+  // For demonstration purposes, let's suggest 'es' (Spanish) if the current browser language is not Spanish,
+  // or 'en' (English) otherwise.
+  const browserLang = navigator.language.split('-')[0];
+  return browserLang === 'en' ? 'es' : 'en';
+}
+
```