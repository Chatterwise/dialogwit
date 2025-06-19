// import { useCallback, useRef } from "react";
// import { useAuth } from "../hooks/useAuth";

// export const useUsageLimitCheck = () => {
//   const { user, session } = useAuth();
//   const usageCheck = useUsageCheck();
//   const lastCheckTimeRef = useRef<Record<string, number>>({});
//   const THROTTLE_TIME = 60000; // 1 minute

//   const checkLimit = useCallback(
//     async (metricName: string): Promise<boolean> => {
//       if (!user || !session) {
//         console.log("No user or session, allowing action by default");
//         return true;
//       }

//       try {
//         const now = Date.now();
//         const lastCheck = lastCheckTimeRef.current[metricName] || 0;
//         if (now - lastCheck < THROTTLE_TIME) {
//           console.log(
//             `Throttled usage check for ${metricName}, using cached result`
//           );
//           return true;
//         }

//         lastCheckTimeRef.current[metricName] = now;
//         const result = await usageCheck.mutateAsync(metricName);
//         return result.allowed;
//       } catch (error) {
//         console.error("Failed to check usage limit:", error);
//         return true;
//       }
//     },
//     [user, session, usageCheck]
//   );

//   return { checkLimit, isLoading: usageCheck.isPending };
// };
