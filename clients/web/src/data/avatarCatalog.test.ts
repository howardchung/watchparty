import { describe, expect, it } from 'vitest';
import fa from '../fa.json';
import { setLanguage } from '../i18n';
import { avatarName, avatarOptions } from './avatarCatalog';
import { profileBody } from './contracts';

describe('avatar names follow the saved or draft profile language', () => {
  it('uses all twelve Persian names even while the interface is still English', () => {
    setLanguage('en');
    for (const avatar of avatarOptions) {
      expect(avatarName(avatar.id, 'fa')).toBe(fa[avatar.label]);
      expect(profileBody({ avatarId: avatar.id, language: 'فارسی', name: 'Old name' }).name).toBe(fa[avatar.label]);
      expect(avatarName(avatar.id, 'en')).toBe(avatar.label);
    }
  });
});
