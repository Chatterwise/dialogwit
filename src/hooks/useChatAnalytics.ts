import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

interface ChatAnalytics {
  totalMessages: number;
  todayMessages: number;
  weeklyMessages: number;
  avgResponseLength: number;
  chartData: {
    date: string;
    messages: number;
  }[];
}

export const useChatAnalytics = (chatbotId: string, period: '7d' | '30d' | '90d' = '7d') => {
  return useQuery({
    queryKey: ['chat_analytics', chatbotId, period],
    queryFn: async (): Promise<ChatAnalytics> => {
      // Calculate date ranges
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      // Build the query conditionally based on chatbotId
      let query = supabase
        .from('chat_messages')
        .select('created_at, message, response');

      // Filter by date range
      query = query.gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Only add chatbot_id filter if it's not 'all'
      if (chatbotId !== 'all') {
        query = query.eq('chatbot_id', chatbotId);
      }

      const { data: messages, error } = await query;

      if (error) throw error;

      // Calculate analytics
      const totalMessages = messages?.length || 0;
      
      const todayMessages = messages?.filter(
        msg => new Date(msg.created_at) >= yesterday
      ).length || 0;
      
      const weeklyMessages = messages?.filter(
        msg => new Date(msg.created_at) >= lastWeek
      ).length || 0;

      // Calculate average response length
      const avgResponseLength = messages && messages.length > 0
        ? Math.round(messages.reduce((sum, msg) => sum + msg.response.length, 0) / messages.length)
        : 0;

      // Group by day for chart data
      const messagesByDay = messages?.reduce((acc: Record<string, number>, message: any) => {
        const date = new Date(message.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {}) || {};

      // Get dates for the selected range
      const dates: string[] = [];
      const tempDate = new Date(startDate);
      while (tempDate <= endDate) {
        dates.push(tempDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        tempDate.setDate(tempDate.getDate() + 1);
      }

      // Create chart data with all dates in range
      const chartData = dates.map(date => ({
        date,
        messages: messagesByDay[date] || 0
      }));

      return {
        totalMessages,
        todayMessages,
        weeklyMessages,
        avgResponseLength,
        chartData
      };
    },
    enabled: !!chatbotId,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
};