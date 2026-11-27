-- Preserve IDs, credentials, ownership and historical chat snapshots.
CREATE TEMP TABLE avatar_name_catalog (avatar text PRIMARY KEY, name text NOT NULL) ON COMMIT DROP;
INSERT INTO avatar_name_catalog(avatar,name) VALUES
  ('comet','Ice Queen'),
  ('mint','Frog Wizard'),
  ('sunny','Skeleton Detective'),
  ('berry','Captain Octopus'),
  ('cloud','Gamer TV'),
  ('ember','Alien Scientist'),
  ('nova','Robot Poet'),
  ('orbit','Coffee Wolf'),
  ('prism','Professor Fox'),
  ('echo','Bookworm Dragon'),
  ('spark','Frankie'),
  ('bloom','Mummy Barista');
UPDATE identities SET avatar = lower(avatar);
UPDATE identities SET avatar = 'comet' WHERE avatar NOT IN (SELECT avatar FROM avatar_name_catalog);
UPDATE identities i SET name = c.name, updated_at = now() FROM avatar_name_catalog c WHERE i.avatar = c.avatar;
UPDATE memberships SET avatar = lower(avatar);
UPDATE memberships SET avatar = 'comet' WHERE avatar NOT IN (SELECT avatar FROM avatar_name_catalog);
UPDATE memberships m SET display_name = c.name FROM avatar_name_catalog c WHERE m.avatar = c.avatar;
