/** Stable avatar IDs; display names are labels, never identity keys. See docs/avatar-names.md. */
export const avatarNames = {
  comet: "Ice Queen",
  mint: "Frog Wizard",
  sunny: "Skeleton Detective",
  berry: "Captain Octopus",
  cloud: "TV Boy",
  ember: "Alien Employee",
  nova: "Robot Poet",
  orbit: "Wolf Barista",
  prism: "Professor Fox",
  echo: "Bookworm Dragon",
  spark: "Frankie",
  bloom: "Mummy Barista",
} as const;

export const persianAvatarNames: Record<keyof typeof avatarNames, string> = {
  comet: "ملکهٔ یخی",
  mint: "قورباغهٔ جادوگر",
  sunny: "کارآگاه اسکلتی",
  berry: "کاپیتان اختاپوس",
  cloud: "پسر تلویزیونی",
  ember: "کارمند فضایی",
  nova: "ربات شاعر",
  orbit: "گرگ باریستا",
  prism: "پروفسور روباه",
  echo: "اژدهای کتاب‌خوان",
  spark: "فرانکی",
  bloom: "مومیایی باریستا",
};
