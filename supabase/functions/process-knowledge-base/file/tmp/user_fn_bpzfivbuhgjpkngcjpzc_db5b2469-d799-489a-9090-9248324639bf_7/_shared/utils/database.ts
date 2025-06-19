export async function batchInsertChunks(supabaseClient, chunks) {
  const batchSize = 100 // Supabase recommended batch size
  ;
  for(let i = 0; i < chunks.length; i += batchSize){
    const batch = chunks.slice(i, i + batchSize);
    const { error } = await supabaseClient.from('kb_chunks').insert(batch);
    if (error) {
      throw new Error(`Failed to insert chunk batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
    }
    console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}`);
  }
}
export async function searchSimilarChunks(supabaseClient, queryEmbedding, chatbotId, options = {}) {
  const { matchThreshold = 0.7, matchCount = 5 } = options;
  const { data, error } = await supabaseClient.rpc('search_similar_chunks', {
    query_embedding: queryEmbedding,
    target_chatbot_id: chatbotId,
    match_threshold: matchThreshold,
    match_count: matchCount
  });
  if (error) {
    throw new Error(`Vector search failed: ${error.message}`);
  }
  return data || [];
}
export async function fallbackTextSearch(supabaseClient, query, chatbotId, limit = 3) {
  const searchTerms = query.split(' ').filter((term)=>term.length > 2).join(' | ');
  const { data, error } = await supabaseClient.from('kb_chunks').select('content').eq('chatbot_id', chatbotId).textSearch('content', searchTerms).limit(limit);
  if (error) {
    console.error('Fallback text search error:', error);
    return [];
  }
  return data || [];
}
export async function getChatbot(supabaseClient, botId) {
  const { data: chatbot, error } = await supabaseClient.from('chatbots').select('*').eq('id', botId).eq('status', 'ready').single();
  if (error || !chatbot) {
    throw new Error('Chatbot not found or not ready');
  }
  return chatbot;
}
export async function saveChatMessage(supabaseClient, chatbotId, message, response, userIp) {
  const { error } = await supabaseClient.from('chat_messages').insert({
    chatbot_id: chatbotId,
    message,
    response,
    user_ip: userIp
  });
  if (error) {
    console.error('Failed to save chat message:', error);
  // Don't throw - this shouldn't break the chat flow
  }
}
export async function updateChatbotStatus(supabaseClient, chatbotId, status, knowledgeBaseProcessed) {
  const updates = {
    status
  };
  if (knowledgeBaseProcessed !== undefined) {
    updates.knowledge_base_processed = knowledgeBaseProcessed;
  }
  const { error } = await supabaseClient.from('chatbots').update(updates).eq('id', chatbotId);
  if (error) {
    throw new Error(`Failed to update chatbot status: ${error.message}`);
  }
}
