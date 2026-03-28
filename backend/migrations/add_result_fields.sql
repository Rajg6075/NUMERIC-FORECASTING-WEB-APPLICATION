-- Add new columns to results table
ALTER TABLE results ADD COLUMN IF NOT EXISTS result_type VARCHAR(20) DEFAULT 'both';
ALTER TABLE results ADD COLUMN IF NOT EXISTS open_result VARCHAR(50);
ALTER TABLE results ADD COLUMN IF NOT EXISTS close_result VARCHAR(50);
