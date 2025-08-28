```diff
--- a/src/components/GeoLanguageModal.tsx
+++ b/src/components/GeoLanguageModal.tsx
@@ -40,24 +40,24 @@
   return (
     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
       <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl">
-        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
+        <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
           <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Language suggestion</h2>
         </div>
-        <div className="p-5 space-y-3 text-gray-700 dark:text-gray-300">
+        <div className="p-5 space-y-3 text-gray-600 dark:text-gray-300">
           <p>
             We use IP-based geolocation to suggest a language for a better experience.
           </p>
           <p>
-            It looks like your region prefers <strong className="font-semibold">{langName}</strong>.
+            It looks like your region prefers <strong className="font-semibold text-gray-900 dark:text-white">{langName}</strong>.
           </p>
           <p>
-            Would you like to switch from <span className="uppercase">{currentLanguage}</span> to <span className="uppercase">{suggested}</span>?
+            Would you like to switch from <span className="uppercase font-semibold text-gray-900 dark:text-white">{currentLanguage}</span> to <span className="uppercase font-semibold text-gray-900 dark:text-white">{suggested}</span>?
           </p>
         </div>
         <div className="p-5 pt-0 flex items-center justify-end gap-3">
-          <button onClick={decline} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
+          <button onClick={decline} className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
             Keep {currentLanguage.toUpperCase()}
           </button>
-          <button onClick={accept} className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700">
+          <button onClick={accept} className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600">
             Switch to {suggested.toUpperCase()}
           </button>
         </div>
```