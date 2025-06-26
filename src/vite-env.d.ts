// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App';
// import { PostHogProvider } from 'posthog-js/react';

// // If you have global styles, uncomment the next line or adjust to your setup
// // import './index.css';

// const rootElement = document.getElementById('root');
// if (!rootElement) {
//   throw new Error("Failed to find the root element");
// }
// const root = ReactDOM.createRoot(rootElement);

// root.render(
//   <React.StrictMode>
//     <PostHogProvider
//       apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
//       options={{
//         api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
//         capture_exceptions: true, // enable Error Tracking
//         debug: import.meta.env.MODE === 'development',
//       }}
//     >
//       <App />
//     </PostHogProvider>
//   </React.StrictMode>
// );
