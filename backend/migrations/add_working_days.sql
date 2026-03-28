-- Add working_days column to games table
ALTER TABLE games ADD COLUMN IF NOT EXISTS working_days INTEGER DEFAULT 7;
