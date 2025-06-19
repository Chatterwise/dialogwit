// import React, { useState, useEffect } from 'react'
// import { Clock, Zap, X, AlertTriangle } from 'lucide-react'
// import { useAuth } from '../hooks/useAuth'
// import { Link } from 'react-router-dom'
// import {
//   useUserSubscription,
//   isOnTrial,
//   getTrialDaysRemaining,
//   isTrialExpiringSoon
// } from '../hooks/useBilling'
// import { useStripeSubscription } from '../hooks/useStripe'

// export const TrialNotifications = () => {
//   const { user } = useAuth()
//   const { data: subscriptionData } = useUserSubscription(user?.id || '')
//   const { data: stripeSubscription } = useStripeSubscription()
//   const [dismissed, setDismissed] = useState<Record<string, boolean>>({})

//   // Check if user is on trial from Stripe data
//   const onTrial = stripeSubscription?.subscription_status === 'trialing'

//   // Calculate days remaining in trial
//   const getDaysRemaining = () => {
//     if (!stripeSubscription?.current_period_end) return 0

//     const trialEnd = new Date(stripeSubscription.current_period_end * 1000)
//     const now = new Date()
//     const diffTime = trialEnd.getTime() - now.getTime()
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

//     return Math.max(0, diffDays)
//   }

//   const daysRemaining = getDaysRemaining()
//   const expiringSoon = daysRemaining <= 3

//   // Load dismissed notifications from localStorage
//   useEffect(() => {
//     const stored = localStorage.getItem('dismissedTrialNotifications')
//     if (stored) {
//       setDismissed(JSON.parse(stored))
//     }
//   }, [])

//   // Save dismissed notifications to localStorage
//   const dismissNotification = (type: string) => {
//     const newDismissed = { ...dismissed, [type]: true }
//     setDismissed(newDismissed)
//     localStorage.setItem('dismissedTrialNotifications', JSON.stringify(newDismissed))
//   }

//   // Clear dismissed notifications when trial status changes
//   useEffect(() => {
//     if (!onTrial) {
//       setDismissed({})
//       localStorage.removeItem('dismissedTrialNotifications')
//     }
//   }, [onTrial])

//   if (!onTrial) return null

//   // Different notification types based on days remaining
//   const getNotificationType = () => {
//     if (daysRemaining <= 1) return 'critical'
//     if (daysRemaining <= 3) return 'urgent'
//     if (daysRemaining <= 7) return 'warning'
//     return 'info'
//   }

//   const notificationType = getNotificationType()

//   // Don't show if dismissed (except for critical)
//   if (dismissed[notificationType] && notificationType !== 'critical') {
//     return null
//   }

//   const getNotificationConfig = () => {
//     switch (notificationType) {
//       case 'critical':
//         return {
//           title: 'Trial Expires Today!',
//           message: 'Your free trial expires today. Upgrade now to continue using all features.',
//           bgColor: 'bg-red-50',
//           borderColor: 'border-red-200',
//           textColor: 'text-red-900',
//           subtextColor: 'text-red-700',
//           buttonColor: 'bg-red-600 hover:bg-red-700',
//           icon: AlertTriangle,
//           iconColor: 'text-red-600',
//           canDismiss: false
//         }
//       case 'urgent':
//         return {
//           title: 'Trial Ending Soon',
//           message: `Only ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left in your free trial. Don't lose access to your chatbots!`,
//           bgColor: 'bg-orange-50',
//           borderColor: 'border-orange-200',
//           textColor: 'text-orange-900',
//           subtextColor: 'text-orange-700',
//           buttonColor: 'bg-orange-600 hover:bg-orange-700',
//           icon: Clock,
//           iconColor: 'text-orange-600',
//           canDismiss: true
//         }
//       case 'warning':
//         return {
//           title: 'Trial Reminder',
//           message: `${daysRemaining} days remaining in your free trial. Upgrade to continue enjoying premium features.`,
//           bgColor: 'bg-yellow-50',
//           borderColor: 'border-yellow-200',
//           textColor: 'text-yellow-900',
//           subtextColor: 'text-yellow-700',
//           buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
//           icon: Clock,
//           iconColor: 'text-yellow-600',
//           canDismiss: true
//         }
//       default:
//         return {
//           title: 'Free Trial Active',
//           message: `${daysRemaining} days remaining in your free trial. Explore all features!`,
//           bgColor: 'bg-blue-50',
//           borderColor: 'border-blue-200',
//           textColor: 'text-blue-900',
//           subtextColor: 'text-blue-700',
//           buttonColor: 'bg-blue-600 hover:bg-blue-700',
//           icon: Clock,
//           iconColor: 'text-blue-600',
//           canDismiss: true
//         }
//     }
//   }

//   const config = getNotificationConfig()
//   const Icon = config.icon

//   return (
//     <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 mb-6`}>
//       <div className="flex items-start">
//         <Icon className={`h-5 w-5 ${config.iconColor} mt-0.5 mr-3`} />
//         <div className="flex-1">
//           <h4 className={`text-sm font-medium ${config.textColor}`}>
//             {config.title}
//           </h4>
//           <p className={`text-sm ${config.subtextColor} mt-1`}>
//             {config.message}
//           </p>
//           <div className="mt-3 flex items-center space-x-3">
//             <Link
//               to="/pricing"
//               className={`inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white ${config.buttonColor} transition-colors`}
//             >
//               <Zap className="h-4 w-4 mr-1" />
//               Upgrade Now
//             </Link>
//             {config.canDismiss && (
//               <button
//                 onClick={() => dismissNotification(notificationType)}
//                 className={`text-sm ${config.subtextColor} hover:${config.textColor}`}
//               >
//                 Remind me later
//               </button>
//             )}
//           </div>
//         </div>
//         {config.canDismiss && (
//           <button
//             onClick={() => dismissNotification(notificationType)}
//             className={`${config.iconColor} hover:${config.textColor} ml-2`}
//           >
//             <X className="h-4 w-4" />
//           </button>
//         )}
//       </div>
//     </div>
//   )
// }

// // Hook for trial status
// export const useTrialStatus = () => {
//   const { user } = useAuth()
//   const { data: stripeSubscription } = useStripeSubscription()

//   const onTrial = stripeSubscription?.subscription_status === 'trialing'

//   const getDaysRemaining = () => {
//     if (!stripeSubscription?.current_period_end) return 0

//     const trialEnd = new Date(stripeSubscription.current_period_end * 1000)
//     const now = new Date()
//     const diffTime = trialEnd.getTime() - now.getTime()
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

//     return Math.max(0, diffDays)
//   }

//   const daysRemaining = getDaysRemaining()
//   const expiringSoon = daysRemaining <= 3

//   return {
//     onTrial,
//     daysRemaining,
//     expiringSoon,
//     subscription: stripeSubscription
//   }
// }
