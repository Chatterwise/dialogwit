// import React from "react";
// import { Mail, AlertTriangle } from "lucide-react";
// import { Link } from "react-router-dom";
// import { useAuth } from "../hooks/useAuth";

// interface EmailUsageDisplayProps {
//   showDetails?: boolean;
// }

// export const EmailUsageDisplay: React.FC<EmailUsageDisplayProps> = ({
//   showDetails = true,
// }) => {
//   const { user } = useAuth();
// //   const { data: subscriptionData } = useUserSubscription(user?.id || "");
// //   const { hasActiveSubscription } = useSubscriptionStatus();

//   const usage = []//subscriptionData?.usage || [];
//   const subscription = []//subscriptionData?.subscription;
//   const currentPlan = "free//subscription?.subscription_plans;

//   // Get email usage
//   const emailUsage =
//     usage.find((u) => u.metric_name === "emails_per_month")?.metric_value || 0;

//   // Get email limit from plan
//   const getEmailLimit = () => {
//     if (currentPlan?.limits?.emails_per_month) {
//       return currentPlan.limits.emails_per_month;
//     }

//     // Default to free plan limit
//     return 50;
//   };

//   const emailLimit = getEmailLimit();
//   const emailPercentage = Math.min((emailUsage / emailLimit) * 100, 100);
//   const isApproachingLimit = emailPercentage >= 80;
//   const isAtLimit = emailPercentage >= 100;

//   // Simple display for when showDetails is false
//   if (!showDetails) {
//     return (
//       <div className="flex items-center">
//         <Mail
//           className={`h-4 w-4 mr-1 ${
//             isAtLimit
//               ? "text-red-500 dark:text-red-400"
//               : isApproachingLimit
//               ? "text-yellow-500 dark:text-yellow-400"
//               : "text-green-500 dark:text-green-400"
//           }`}
//         />
//         <span className="text-sm">
//           {emailUsage.toLocaleString()} / {emailLimit.toLocaleString()} emails
//         </span>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center">
//           <Mail className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
//           <h3 className="text-lg font-medium text-gray-900 dark:text-white">
//             Email Usage
//           </h3>
//         </div>
//         {isApproachingLimit && !isAtLimit && (
//           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
//             Approaching Limit
//           </span>
//         )}
//         {isAtLimit && (
//           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
//             Limit Reached
//           </span>
//         )}
//       </div>

//       <div className="space-y-4">
//         <div className="flex items-center justify-between">
//           <span className="text-sm text-gray-600 dark:text-gray-400">
//             Monthly Usage
//           </span>
//           <span className="text-sm font-medium text-gray-900 dark:text-white">
//             {emailUsage.toLocaleString()} / {emailLimit.toLocaleString()}
//           </span>
//         </div>

//         <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//           <div
//             className={`h-2 rounded-full transition-all duration-300 ${
//               isAtLimit
//                 ? "bg-red-500 dark:bg-red-600"
//                 : isApproachingLimit
//                 ? "bg-yellow-500 dark:bg-yellow-600"
//                 : "bg-green-500 dark:bg-green-600"
//             }`}
//             style={{ width: `${emailPercentage}%` }}
//           />
//         </div>

//         {isApproachingLimit && (
//           <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-4">
//             <div className="flex items-start">
//               <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2" />
//               <div>
//                 <p className="text-sm text-yellow-700 dark:text-yellow-300">
//                   {isAtLimit
//                     ? "You've reached your email limit for this month."
//                     : "You're approaching your email limit for this month."}
//                 </p>
//                 {!hasActiveSubscription && (
//                   <Link
//                     to="/pricing"
//                     className="text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100 mt-1 inline-block"
//                   >
//                     Upgrade your plan →
//                   </Link>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
