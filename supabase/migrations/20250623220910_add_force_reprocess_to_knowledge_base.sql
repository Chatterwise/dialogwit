-- Add force_reprocess column to knowledge_base table
alter table knowledge_base
add column force_reprocess boolean default false;
