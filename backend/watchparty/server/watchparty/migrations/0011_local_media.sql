ALTER TABLE streams ADD COLUMN source_kind text NOT NULL DEFAULT 'URL' CHECK (source_kind IN ('URL', 'LOCAL_FILE'));
ALTER TABLE streams ADD COLUMN file_name text NOT NULL DEFAULT '';
