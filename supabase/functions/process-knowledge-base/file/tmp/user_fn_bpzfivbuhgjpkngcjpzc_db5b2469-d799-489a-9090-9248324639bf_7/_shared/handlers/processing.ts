import { createEmbeddings, OpenAIError } from '../utils/openai.ts';
import { chunkText } from '../utils/chunking.ts';
import { batchInsertChunks } from '../utils/database.ts';
export async function processKnowledgeItemWithChunking(item, supabaseClient, options = {}) {
  const { maxChunkLength = 1000, overlapLength = 200, batchSize = 20 } = options;
  try {
    // Get user ID for the chatbot to track token usage
    const { data: chatbot } = await supabaseClient.from('chatbots').select('user_id').eq('id', item.chatbot_id).single();
    const userId = chatbot?.user_id;
    // Chunk the content
    const chunks = chunkText(item.content, {
      maxLength: maxChunkLength,
      overlapLength: overlapLength
    });
    console.log(`Processing ${chunks.length} chunks for knowledge base item ${item.id}`);
    let totalTokensUsed = 0;
    let totalCostEstimate = 0;
    let hasEmbeddings = false;
    // Check if we should create embeddings (if OpenAI is configured and user has token allowance)
    let shouldCreateEmbeddings = true;
    if (userId) {
      // Estimate tokens needed for embeddings
      const estimatedTokens = chunks.reduce((total, chunk)=>{
        return total + Math.ceil(chunk.content.length / 4) // Rough token estimation
        ;
      }, 0);
      // Check token limits
      const limitCheck = await supabaseClient.rpc('check_token_limit', {
        p_user_id: userId,
        p_metric_name: 'embedding_tokens_per_month',
        p_estimated_tokens: estimatedTokens
      });
      if (!limitCheck.allowed) {
        console.log(`Embedding token limit would be exceeded for user ${userId}. Skipping embeddings.`);
        shouldCreateEmbeddings = false;
      }
    }
    // Process chunks in batches
    for(let i = 0; i < chunks.length; i += batchSize){
      const batch = chunks.slice(i, i + batchSize);
      let embeddings = [];
      let batchTokenUsage = {
        prompt_tokens: 0,
        total_tokens: 0
      };
      if (shouldCreateEmbeddings) {
        try {
          // Create embeddings for this batch
          const embeddingResult = await createEmbeddings(batch.map((chunk)=>chunk.content), {
            batchSize: Math.min(batchSize, 20)
          } // OpenAI embedding batch limit
          );
          embeddings = embeddingResult.embeddings;
          batchTokenUsage = embeddingResult.usage;
          totalTokensUsed += batchTokenUsage.total_tokens;
          hasEmbeddings = true;
          // Calculate cost for this batch
          const batchCost = batchTokenUsage.total_tokens / 1000 * 0.0001 // $0.0001 per 1K tokens for embeddings
          ;
          totalCostEstimate += batchCost;
          console.log(`Batch ${Math.floor(i / batchSize) + 1}: Created ${embeddings.length} embeddings using ${batchTokenUsage.total_tokens} tokens`);
        } catch (error) {
          if (error instanceof OpenAIError) {
            console.error(`OpenAI error in batch ${Math.floor(i / batchSize) + 1}:`, error.message);
            // Continue without embeddings for this batch
            embeddings = new Array(batch.length).fill(null);
          } else {
            throw error;
          }
        }
      } else {
        // No embeddings - just create null array
        embeddings = new Array(batch.length).fill(null);
      }
      // Prepare chunks for database insertion
      const chunksToInsert = batch.map((chunk, index)=>({
          chatbot_id: item.chatbot_id,
          knowledge_base_id: item.id,
          content: chunk.content,
          embedding: embeddings[index],
          chunk_index: chunk.index,
          source_url: item.filename || null,
          metadata: {
            content_type: item.content_type,
            filename: item.filename,
            chunk_length: chunk.content.length,
            has_embedding: embeddings[index] !== null,
            processed_at: new Date().toISOString()
          }
        }));
      // Insert chunks into database
      await batchInsertChunks(supabaseClient, chunksToInsert);
      // Track token usage for this batch
      if (userId && batchTokenUsage.total_tokens > 0) {
        await supabaseClient.rpc('track_token_usage', {
          p_user_id: userId,
          p_metric_name: 'embedding_tokens_per_month',
          p_token_count: batchTokenUsage.total_tokens,
          p_metadata: {
            knowledge_base_id: item.id,
            chatbot_id: item.chatbot_id,
            batch_size: batch.length,
            content_type: item.content_type,
            filename: item.filename
          }
        });
      }
      // Add delay between batches to respect rate limits
      if (i + batchSize < chunks.length) {
        await new Promise((resolve)=>setTimeout(resolve, 200));
      }
    }
    console.log(`Completed processing: ${chunks.length} chunks, ${totalTokensUsed} tokens used, estimated cost: $${totalCostEstimate.toFixed(6)}`);
    return {
      chunksCreated: chunks.length,
      tokensUsed: totalTokensUsed,
      costEstimate: totalCostEstimate,
      hasEmbeddings
    };
  } catch (error) {
    console.error('Error processing knowledge item:', error);
    throw error;
  }
}
export async function processKnowledgeBase(chatbotId, supabaseClient, options = {}) {
  // Get unprocessed knowledge base items
  const { data: knowledgeItems, error } = await supabaseClient.from('knowledge_base').select('*').eq('chatbot_id', chatbotId).eq('processed', false);
  if (error) {
    throw new Error(`Failed to retrieve knowledge base items: ${error.message}`);
  }
  if (!knowledgeItems || knowledgeItems.length === 0) {
    return {
      itemsProcessed: 0,
      totalChunks: 0,
      totalTokensUsed: 0,
      totalCostEstimate: 0,
      hasEmbeddings: false
    };
  }
  let totalChunks = 0;
  let totalTokensUsed = 0;
  let totalCostEstimate = 0;
  let hasAnyEmbeddings = false;
  let itemsProcessed = 0;
  // Process each knowledge base item
  for (const item of knowledgeItems){
    try {
      const result = await processKnowledgeItemWithChunking(item, supabaseClient, options);
      totalChunks += result.chunksCreated;
      totalTokensUsed += result.tokensUsed;
      totalCostEstimate += result.costEstimate;
      if (result.hasEmbeddings) {
        hasAnyEmbeddings = true;
      }
      // Mark item as processed
      await supabaseClient.from('knowledge_base').update({
        processed: true
      }).eq('id', item.id);
      itemsProcessed++;
      console.log(`Processed knowledge base item ${item.id}: ${result.chunksCreated} chunks, ${result.tokensUsed} tokens`);
    } catch (error) {
      console.error(`Error processing knowledge base item ${item.id}:`, error);
      // Mark as processed even with error to avoid reprocessing
      await supabaseClient.from('knowledge_base').update({
        processed: true
      }).eq('id', item.id);
      // Continue with other items
      itemsProcessed++;
    }
  }
  return {
    itemsProcessed,
    totalChunks,
    totalTokensUsed,
    totalCostEstimate,
    hasEmbeddings: hasAnyEmbeddings
  };
}
