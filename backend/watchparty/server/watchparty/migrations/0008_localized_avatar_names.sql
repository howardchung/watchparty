-- Localize existing Persian profiles; keep credentials, ownership and chat snapshots.
CREATE TEMP TABLE persian_avatar_names (avatar text PRIMARY KEY, name text NOT NULL) ON COMMIT DROP;
INSERT INTO persian_avatar_names(avatar,name) VALUES
  ('comet','ملکهٔ یخی'),
  ('mint','قورباغهٔ جادوگر'),
  ('sunny','کارآگاه اسکلتی'),
  ('berry','کاپیتان اختاپوس'),
  ('cloud','تلویزیون گیمر'),
  ('ember','دانشمند فضایی'),
  ('nova','ربات شاعر'),
  ('orbit','گرگ قهوه‌دوست'),
  ('prism','پروفسور روباه'),
  ('echo','اژدهای کتاب‌خوان'),
  ('spark','فرانکی'),
  ('bloom','مومیایی باریستا');
UPDATE identities i SET name = c.name, updated_at = now()
FROM persian_avatar_names c WHERE i.avatar = c.avatar AND i.language = 'fa';
UPDATE memberships m SET display_name = c.name
FROM identities i, persian_avatar_names c
WHERE m.identity_id = i.id AND i.language = 'fa' AND m.avatar = c.avatar;
