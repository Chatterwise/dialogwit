import { generateEmbedding, OpenAIError } from '../utils/openai.ts';
import { chunkText, validateChunkSize } from '../utils/chunking.ts';
import { batchInsertChunks } from '../utils/database.ts';
export async function processKnowledgeBaseWithRAG(knowledgeBase, chatbotId, model, supabaseClient, userId) {
  try {
    // Validate OpenAI API key first
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new OpenAIError('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable to enable RAG processing.');
    }
    let totalChunks = 0;
    let totalTokensUsed = 0;
    let embeddingsCreated = 0;
    // Process each knowledge base item
    for (const item of knowledgeBase){
      console.log(`Processing KB item: ${item.id}`);
      // Chunk the content
      const chunks = chunkText(item.content, {
        maxLength: 800,
        overlapLength: 100,
        preserveParagraphs: true,
        preserveSentences: true
      });
      // Validate chunk sizes
      if (!validateChunkSize(chunks)) {
        console.warn(`Some chunks for item ${item.id} may be too large`);
      }
      totalChunks += chunks.length;
      console.log(`Created ${chunks.length} chunks for item ${item.id}`);
      // Process chunks in batches to avoid rate limits and improve efficiency
      const batchSize = 20 // Increased batch size for better efficiency
      ;
      const chunksToInsert = [];
      for(let i = 0; i < chunks.length; i += batchSize){
        const batch = chunks.slice(i, i + batchSize);
        try {
          // Create embeddings for the batch
          const embeddingResponse = await generateEmbedding(batch);
          totalTokensUsed += embeddingResponse.usage?.total_tokens || 0;
          // Prepare chunk data for batch insert
          for(let j = 0; j < batch.length; j++){
            const chunkIndex = i + j;
            const embedding = embeddingResponse.data[j].embedding;
            chunksToInsert.push({
              chatbot_id: chatbotId,
              knowledge_base_id: item.id,
              content: batch[j],
              embedding: embedding,
              chunk_index: chunkIndex,
              source_url: item.filename ? `file://${item.filename}` : undefined,
              metadata: {
                content_type: item.content_type,
                original_length: item.content.length,
                chunk_length: batch[j].length
              }
            });
            embeddingsCreated++;
          }
          console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)} for item ${item.id}`);
          // Add delay to respect rate limits (reduced due to larger batches)
          await new Promise((resolve)=>setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error processing batch starting at chunk ${i} for item ${item.id}:`, error);
          if (error instanceof OpenAIError && error.status === 429) {
            // Rate limit hit, wait longer and retry
            console.log('Rate limit hit, waiting 10 seconds...');
            await new Promise((resolve)=>setTimeout(resolve, 10000));
            i -= batchSize // Retry this batch
            ;
            continue;
          }
          // For other errors, continue with next batch
          throw error;
        }
      }
      // Batch insert all chunks for this knowledge base item
      if (chunksToInsert.length > 0) {
        await batchInsertChunks(supabaseClient, chunksToInsert);
        console.log(`Inserted ${chunksToInsert.length} chunks for item ${item.id}`);
      }
    }
    console.log(`RAG processing completed with ${model}`);
    console.log(`Processed ${knowledgeBase.length} knowledge base items`);
    console.log(`Created ${totalChunks} chunks with ${embeddingsCreated} embeddings`);
    console.log(`Used ${totalTokensUsed} tokens`);
    // Insert token usage into usage_tracking
    const now = new Date();
    const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    if (userId && totalTokensUsed > 0) {
      const { data: userSub } = await supabaseClient.from('user_subscriptions').select('id').eq('user_id', userId).eq('status', 'active').maybeSingle();
      const subscriptionId = userSub?.id ?? null;
      console.log("👀 Subscription ID for usage_tracking:", subscriptionId);

      await supabaseClient.rpc('track_token_usage', {
        p_user_id: userId,
        p_metric_name: 'chat_tokens_per_month',
        p_token_count: totalTokensUsed,
        p_metadata: {
          model,
          processing_type: 'training',
          subscription_id: subscriptionId
        }
      });

      if (error) {
        console.error("❌ Failed to insert usage_tracking:", error);
      } else {
        console.log("✅ usage_tracking recorded:", {
          user_id: userId,
          tokens: totalTokensUsed,
          subscription_id: subscriptionId,
          period: periodStart.toISOString()
        });
      }
    } else {
      console.warn("⚠️ Skipped usage tracking insert (missing user or tokens = 0)", {
        userId,
        totalTokensUsed
      });
    }
    return {
      model,
      knowledgeBaseItems: knowledgeBase.length,
      totalChunks,
      embeddingsCreated,
      tokensUsed: totalTokensUsed,
      processingType: 'RAG (Retrieval-Augmented Generation)'
    };
  } catch (error) {
    if (error instanceof OpenAIError) {
      // Re-throw OpenAI errors with clear message
      throw error;
    }
    console.error('RAG processing error:', error);
    throw new Error(`RAG processing failed: ${error.message}`);
  }
}
export async function processKnowledgeItemWithChunking(item, supabaseClient) {
  console.log(`Processing knowledge item: ${item.id}`);
  console.log(`Content type: ${item.content_type}`);
  console.log(`Content length: ${item.content.length} characters`);
  // Chunk the content
  const chunks = chunkText(item.content, {
    maxLength: 800,
    overlapLength: 100,
    preserveParagraphs: true,
    preserveSentences: true
  });
  console.log(`Created ${chunks.length} chunks`);
  try {
    // Validate OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new OpenAIError('OpenAI API key is not configured');
    }
    // Process chunks in batches
    const batchSize = 20;
    const chunksToInsert = [];
    for(let i = 0; i < chunks.length; i += batchSize){
      const batch = chunks.slice(i, i + batchSize);
      try {
        // Create embeddings for the batch
        const embeddingResponse = await generateEmbedding(batch);
        // Prepare chunk data for batch insert
        for(let j = 0; j < batch.length; j++){
          const chunkIndex = i + j;
          const embedding = embeddingResponse.data[j].embedding;
          chunksToInsert.push({
            chatbot_id: item.chatbot_id,
            knowledge_base_id: item.id,
            content: batch[j],
            embedding: embedding,
            chunk_index: chunkIndex,
            source_url: item.filename ? `file://${item.filename}` : undefined,
            metadata: {
              content_type: item.content_type,
              original_length: item.content.length,
              chunk_length: batch[j].length
            }
          });
        }
        console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}`);
        // Add delay to respect rate limits
        await new Promise((resolve)=>setTimeout(resolve, 500));
      } catch (error) {
        if (error instanceof OpenAIError && error.status === 429) {
          // Rate limit hit, wait and retry
          console.log('Rate limit hit, waiting 10 seconds...');
          await new Promise((resolve)=>setTimeout(resolve, 10000));
          i -= batchSize // Retry this batch
          ;
          continue;
        }
        console.error(`Error processing batch starting at chunk ${i}:`, error);
        throw error;
      }
    }
    // Batch insert all chunks
    if (chunksToInsert.length > 0) {
      await batchInsertChunks(supabaseClient, chunksToInsert);
    }
  } catch (error) {
    if (error instanceof OpenAIError) {
      // For missing API key, store chunks without embeddings
      console.log('OpenAI API key not found, storing chunks without embeddings');
      const chunksToInsert = chunks.map((chunk, index)=>({
          chatbot_id: item.chatbot_id,
          knowledge_base_id: item.id,
          content: chunk,
          embedding: null,
          chunk_index: index,
          source_url: item.filename ? `file://${item.filename}` : undefined,
          metadata: {
            content_type: item.content_type,
            original_length: item.content.length,
            chunk_length: chunk.length
          }
        }));
      await batchInsertChunks(supabaseClient, chunksToInsert);
    } else {
      throw error;
    }
  }
  console.log(`Finished processing item: ${item.id}`);
}
