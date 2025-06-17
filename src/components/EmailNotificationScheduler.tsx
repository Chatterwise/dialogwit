import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useEmail } from '../hooks/useEmail';
import { supabase } from '../lib/supabase';

// This component handles scheduling of email notifications
// It should be mounted in a parent component that's always rendered when user is logged in
export const EmailNotificationScheduler: React.FC = () => {
  const { user } = useAuth();
  const { getEmailSettings, isLoadingSettings } = useEmail();
  const [lastDailyCheck, setLastDailyCheck] = useState<Date | null>(null);
  const [lastWeeklyCheck, setLastWeeklyCheck] = useState<Date | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check for daily digest
  useEffect(() => {
    if (!user || isLoadingSettings || !getEmailSettings || isProcessing) return;
    
    if (!getEmailSettings.enable_notifications || !getEmailSettings.daily_digest) return;
    
    const now = new Date();
    
    // Only check once per day
    if (lastDailyCheck && 
        lastDailyCheck.getDate() === now.getDate() && 
        lastDailyCheck.getMonth() === now.getMonth() && 
        lastDailyCheck.getFullYear() === now.getFullYear()) {
      return;
    }
    
    // Set the time to check (e.g., 8:00 AM)
    const checkHour = 8;
    const checkTime = new Date();
    checkTime.setHours(checkHour, 0, 0, 0);
    
    // If it's past the check time, schedule for today
    // Otherwise, schedule for yesterday
    if (now.getHours() >= checkHour) {
      sendDailyDigest();
      setLastDailyCheck(now);
    }
  }, [user, getEmailSettings, isLoadingSettings, isProcessing, lastDailyCheck]);

  // Check for weekly report
  useEffect(() => {
    if (!user || isLoadingSettings || !getEmailSettings || isProcessing) return;
    
    if (!getEmailSettings.enable_notifications || !getEmailSettings.weekly_report) return;
    
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Only check once per week (on Monday)
    if (lastWeeklyCheck && 
        now.getTime() - lastWeeklyCheck.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return;
    }
    
    // Send weekly report on Monday
    if (dayOfWeek === 1) {
      // Set the time to check (e.g., 9:00 AM)
      const checkHour = 9;
      const checkTime = new Date();
      checkTime.setHours(checkHour, 0, 0, 0);
      
      // If it's past the check time, schedule for today
      if (now.getHours() >= checkHour) {
        sendWeeklyReport();
        setLastWeeklyCheck(now);
      }
    }
  }, [user, getEmailSettings, isLoadingSettings, isProcessing, lastWeeklyCheck]);

  const sendDailyDigest = async () => {
    if (!user) return;
    
    setIsProcessing(true);
    try {
      // Check if required environment variables are available
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        console.warn('VITE_SUPABASE_URL not configured, skipping daily digest');
        setIsProcessing(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.warn('No active session, skipping daily digest');
        setIsProcessing(false);
        return;
      }

      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/email/daily-digest`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        const result = await response.json();
        console.log('Daily digest result:', result);
        
        // Log if email was skipped due to domain issues
        if (result.message && result.message.includes('unverified')) {
          console.log('Daily digest skipped due to unverified email domain');
        }
      } catch (err) {
        console.error('Error sending daily digest:', err);
        // Don't throw the error to prevent breaking the component
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const sendWeeklyReport = async () => {
    if (!user) return;
    
    setIsProcessing(true);
    try {
      // Check if required environment variables are available
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        console.warn('VITE_SUPABASE_URL not configured, skipping weekly report');
        setIsProcessing(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.warn('No active session, skipping weekly report');
        setIsProcessing(false);
        return;
      }

      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/email/weekly-report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        const result = await response.json();
        console.log('Weekly report result:', result);
        
        // Log if email was skipped due to domain issues
        if (result.message && result.message.includes('unverified')) {
          console.log('Weekly report skipped due to unverified email domain');
        }
      } catch (err) {
        console.error('Error sending weekly report:', err);
        // Don't throw the error to prevent breaking the component
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // This component doesn't render anything
  return null;
};