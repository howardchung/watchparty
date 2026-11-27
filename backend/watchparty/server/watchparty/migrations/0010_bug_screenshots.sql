ALTER TABLE bug_reports ADD COLUMN screenshots jsonb NOT NULL DEFAULT '[]'::jsonb;
