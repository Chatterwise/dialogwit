create table if not exists rag_settings (
  chatbot_id uuid primary key references chatbots(id) on delete cascade,
  enable_citations boolean default false,
  max_retrieved_chunks integer default 3,
  similarity_threshold numeric default 0.7,
  enable_streaming boolean default false,
  model text default 'gpt-3.5-turbo',
  temperature numeric default 0.7,
  max_tokens integer default 500,
  chunk_char_limit integer default 200,
  min_word_count integer default 5,
  stopwords text[] default array['hi', 'hello', 'hey', 'yo', 'hola', 'ok', 'okay', 'hmm', 'yes', 'no'],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Automatically update updated_at on row change
create or replace function update_rag_settings_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_update_rag_settings_updated_at
before update on rag_settings
for each row
execute procedure update_rag_settings_updated_at();
