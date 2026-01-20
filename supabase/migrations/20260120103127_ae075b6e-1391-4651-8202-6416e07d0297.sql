-- Add photo_type column to job_photos table for reliable categorization
ALTER TABLE job_photos 
ADD COLUMN IF NOT EXISTS photo_type TEXT CHECK (photo_type IN ('before', 'after', 'other')) DEFAULT 'other';

-- Add index for efficient querying by job and type
CREATE INDEX IF NOT EXISTS idx_job_photos_type ON job_photos(job_id, photo_type);