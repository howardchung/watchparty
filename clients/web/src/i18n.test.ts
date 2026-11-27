import { afterEach, describe, expect, it } from 'vitest';
import { normalizeLanguage, setLanguage, t } from './i18n';
import { identityModel, profileBody } from './data/contracts';

afterEach(() => setLanguage('en'));
describe('Persian localization', () => {
  it('round-trips the backend profile language and safely falls back for unsupported tags', () => {
    const identity = identityModel({ id: 'guest', name: 'نیکا', avatar: 'COMET', language: 'fa' });
    expect(identity.language).toBe('فارسی');
    expect(profileBody(identity)).toMatchObject({ name: 'ملکهٔ یخی', language: 'fa' });
    expect(normalizeLanguage('de')).toBe('en');
    expect(identityModel({ id: 'guest', name: 'Mira', avatar: 'COMET', language: 'de' }).language).toBe('English');
  });
  it('translates controls and interpolates mixed-direction user names without translating their content', () => {
    setLanguage('fa');
    expect(t('Create a party')).toBe('ساخت دورهمی');
    expect(t('{name} is away', { name: 'Mira / میرا' })).toBe('Mira / میرا حضور ندارد');
    setLanguage('en');
    expect(t('Create a party')).toBe('Start a party');
  });
});
