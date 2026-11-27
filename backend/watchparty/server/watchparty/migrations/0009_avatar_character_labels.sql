-- Rename current character labels without changing identities, avatars, ownership or chat snapshots.
CREATE TEMP TABLE renamed_avatar_labels (avatar text PRIMARY KEY, english text NOT NULL, persian text NOT NULL) ON COMMIT DROP;
INSERT INTO renamed_avatar_labels(avatar,english,persian) VALUES
  ('cloud','TV Boy','پسر تلویزیونی'),
  ('ember','Alien Employee','کارمند فضایی'),
  ('orbit','Wolf Barista','گرگ باریستا');
UPDATE identities i SET name = CASE WHEN i.language = 'fa' THEN c.persian ELSE c.english END, updated_at = now()
FROM renamed_avatar_labels c WHERE i.avatar = c.avatar;
UPDATE memberships m SET display_name = CASE WHEN i.language = 'fa' THEN c.persian ELSE c.english END
FROM identities i, renamed_avatar_labels c WHERE m.identity_id = i.id AND m.avatar = c.avatar;
