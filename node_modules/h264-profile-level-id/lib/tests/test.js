"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../");
describe('parseProfileLevelId()', () => {
    test('parse level', () => {
        expect((0, __1.parseProfileLevelId)('42e01f')?.level).toBe(__1.Level.L3_1);
        expect((0, __1.parseProfileLevelId)('42e00b')?.level).toBe(__1.Level.L1_1);
        expect((0, __1.parseProfileLevelId)('42f00b')?.level).toBe(__1.Level.L1_b);
        expect((0, __1.parseProfileLevelId)('42C02A')?.level).toBe(__1.Level.L4_2);
        expect((0, __1.parseProfileLevelId)('640c34')?.level).toBe(__1.Level.L5_2);
    });
    test('Profile.ConstrainedBaseline', () => {
        expect((0, __1.parseProfileLevelId)('42e01f')?.profile).toBe(__1.Profile.ConstrainedBaseline);
        expect((0, __1.parseProfileLevelId)('42C02A')?.profile).toBe(__1.Profile.ConstrainedBaseline);
        expect((0, __1.parseProfileLevelId)('4de01f')?.profile).toBe(__1.Profile.ConstrainedBaseline);
        expect((0, __1.parseProfileLevelId)('58f01f')?.profile).toBe(__1.Profile.ConstrainedBaseline);
    });
    test('Profile.Baseline', () => {
        expect((0, __1.parseProfileLevelId)('42a01f')?.profile).toBe(__1.Profile.Baseline);
        expect((0, __1.parseProfileLevelId)('58A01F')?.profile).toBe(__1.Profile.Baseline);
    });
    test('Profile.Main', () => {
        expect((0, __1.parseProfileLevelId)('4D401f')?.profile).toBe(__1.Profile.Main);
    });
    test('Profile.High', () => {
        expect((0, __1.parseProfileLevelId)('64001f')?.profile).toBe(__1.Profile.High);
    });
    test('Profile.ConstrainedHigh', () => {
        expect((0, __1.parseProfileLevelId)('640c1f')?.profile).toBe(__1.Profile.ConstrainedHigh);
    });
    test('invalid value', () => {
        /* Malformed strings. */
        // @ts-expect-error --- Invalid empty argument.
        expect((0, __1.parseProfileLevelId)()).toBeUndefined();
        expect((0, __1.parseProfileLevelId)('')).toBeUndefined();
        expect((0, __1.parseProfileLevelId)(' 42e01f')).toBeUndefined();
        expect((0, __1.parseProfileLevelId)('4242e01f')).toBeUndefined();
        expect((0, __1.parseProfileLevelId)('e01f')).toBeUndefined();
        expect((0, __1.parseProfileLevelId)('gggggg')).toBeUndefined();
        /* Invalid level. */
        expect((0, __1.parseProfileLevelId)('42e000')).toBeUndefined();
        expect((0, __1.parseProfileLevelId)('42e00f')).toBeUndefined();
        expect((0, __1.parseProfileLevelId)('42e0ff')).toBeUndefined();
        /* Invalid profile. */
        expect((0, __1.parseProfileLevelId)('42e11f')).toBeUndefined();
        expect((0, __1.parseProfileLevelId)('58601f')).toBeUndefined();
        expect((0, __1.parseProfileLevelId)('64e01f')).toBeUndefined();
    });
});
describe('profileLevelIdToString()', () => {
    test('various', () => {
        expect((0, __1.profileLevelIdToString)(new __1.ProfileLevelId(__1.Profile.ConstrainedBaseline, __1.Level.L3_1))).toBe('42e01f');
        expect((0, __1.profileLevelIdToString)(new __1.ProfileLevelId(__1.Profile.Baseline, __1.Level.L1))).toBe('42000a');
        expect((0, __1.profileLevelIdToString)(new __1.ProfileLevelId(__1.Profile.Main, __1.Level.L3_1))).toBe('4d001f');
        expect((0, __1.profileLevelIdToString)(new __1.ProfileLevelId(__1.Profile.ConstrainedHigh, __1.Level.L4_2))).toBe('640c2a');
        expect((0, __1.profileLevelIdToString)(new __1.ProfileLevelId(__1.Profile.High, __1.Level.L4_2))).toBe('64002a');
    });
    test('Level.L1_b', () => {
        expect((0, __1.profileLevelIdToString)(new __1.ProfileLevelId(__1.Profile.ConstrainedBaseline, __1.Level.L1_b))).toBe('42f00b');
        expect((0, __1.profileLevelIdToString)(new __1.ProfileLevelId(__1.Profile.Baseline, __1.Level.L1_b))).toBe('42100b');
        expect((0, __1.profileLevelIdToString)(new __1.ProfileLevelId(__1.Profile.Main, __1.Level.L1_b))).toBe('4d100b');
    });
    test('round trip', () => {
        expect((0, __1.profileLevelIdToString)((0, __1.parseProfileLevelId)('42e01f'))).toBe('42e01f');
        expect((0, __1.profileLevelIdToString)((0, __1.parseProfileLevelId)('42E01F'))).toBe('42e01f');
        expect((0, __1.profileLevelIdToString)((0, __1.parseProfileLevelId)('4d100b'))).toBe('4d100b');
        expect((0, __1.profileLevelIdToString)((0, __1.parseProfileLevelId)('4D100B'))).toBe('4d100b');
        expect((0, __1.profileLevelIdToString)((0, __1.parseProfileLevelId)('640c2a'))).toBe('640c2a');
        expect((0, __1.profileLevelIdToString)((0, __1.parseProfileLevelId)('640C2A'))).toBe('640c2a');
    });
    test('invalid value', () => {
        expect((0, __1.profileLevelIdToString)(new __1.ProfileLevelId(__1.Profile.High, __1.Level.L1_b))).toBeUndefined();
        expect((0, __1.profileLevelIdToString)(new __1.ProfileLevelId(__1.Profile.ConstrainedHigh, __1.Level.L1_b))).toBeUndefined();
        expect((0, __1.profileLevelIdToString)(new __1.ProfileLevelId(255, __1.Level.L3_1))).toBeUndefined();
    });
});
describe('parseSdpProfileLevelId()', () => {
    test('empty value', () => {
        const profile_level_id = (0, __1.parseSdpProfileLevelId)();
        expect(profile_level_id).toBeDefined();
        expect(profile_level_id?.profile).toBe(__1.Profile.ConstrainedBaseline);
        expect(profile_level_id?.level).toBe(__1.Level.L3_1);
    });
    test('Profile.ConstrainedHigh', () => {
        const params = { 'profile-level-id': '640c2a' };
        const profile_level_id = (0, __1.parseSdpProfileLevelId)(params);
        expect(profile_level_id).toBeDefined();
        expect(profile_level_id?.profile).toBe(__1.Profile.ConstrainedHigh);
        expect(profile_level_id?.level).toBe(__1.Level.L4_2);
    });
    test('invalid value', () => {
        const params = { 'profile-level-id': 'foobar' };
        expect((0, __1.parseSdpProfileLevelId)(params)).toBeUndefined();
    });
});
describe('isSameProfile()', () => {
    test('same profile', () => {
        expect((0, __1.isSameProfile)({ foo: 'foo' }, { bar: 'bar' })).toBe(true);
        expect((0, __1.isSameProfile)({ 'profile-level-id': '42e01f' }, { 'profile-level-id': '42C02A' })).toBe(true);
        expect((0, __1.isSameProfile)({ 'profile-level-id': '42a01f' }, { 'profile-level-id': '58A01F' })).toBe(true);
        expect((0, __1.isSameProfile)({ 'profile-level-id': '42e01f' }, undefined)).toBe(true);
    });
    test('not same profile', () => {
        expect((0, __1.isSameProfile)(undefined, { 'profile-level-id': '4d001f' })).toBe(false);
        expect((0, __1.isSameProfile)({ 'profile-level-id': '42a01f' }, { 'profile-level-id': '640c1f' })).toBe(false);
        expect((0, __1.isSameProfile)({ 'profile-level-id': '42000a' }, { 'profile-level-id': '64002a' })).toBe(false);
    });
});
describe('isSameProfileAndLevel()', () => {
    test('same profile and level', () => {
        expect((0, __1.isSameProfileAndLevel)({ foo: 'foo' }, { bar: 'bar' })).toBe(true);
        expect((0, __1.isSameProfileAndLevel)({ 'profile-level-id': '42e01f' }, { 'profile-level-id': '42f01f' })).toBe(true);
        expect((0, __1.isSameProfileAndLevel)({ 'profile-level-id': '42a01f' }, { 'profile-level-id': '58A01F' })).toBe(true);
        expect((0, __1.isSameProfileAndLevel)({ 'profile-level-id': '42e01f' }, undefined)).toBe(true);
    });
    test('not same profile', () => {
        expect((0, __1.isSameProfileAndLevel)(undefined, { 'profile-level-id': '4d001f' })).toBe(false);
        expect((0, __1.isSameProfileAndLevel)({ 'profile-level-id': '42a01f' }, { 'profile-level-id': '640c1f' })).toBe(false);
        expect((0, __1.isSameProfileAndLevel)({ 'profile-level-id': '42000a' }, { 'profile-level-id': '64002a' })).toBe(false);
    });
});
describe('generateProfileLevelIdStringForAnswer()', () => {
    test('empty SDP answer', () => {
        expect((0, __1.generateProfileLevelIdStringForAnswer)(undefined, undefined)).toBeUndefined();
    });
    test('level symmetry capped', () => {
        const low_level = {
            'profile-level-id': '42e015',
        };
        const high_level = {
            'profile-level-id': '42e01f',
        };
        expect((0, __1.generateProfileLevelIdStringForAnswer)(low_level, high_level)).toBe('42e015');
        expect((0, __1.generateProfileLevelIdStringForAnswer)(high_level, low_level)).toBe('42e015');
    });
    test('Profile.ConstrainedBaseline with level asymmetry', () => {
        const local_params = {
            'profile-level-id': '42e01f',
            'level-asymmetry-allowed': '1',
        };
        const remote_params = {
            'profile-level-id': '42e015',
            'level-asymmetry-allowed': '1',
        };
        expect((0, __1.generateProfileLevelIdStringForAnswer)(local_params, remote_params)).toBe('42e01f');
    });
});
describe('supportedLevel()', () => {
    test('valid values', () => {
        expect((0, __1.supportedLevel)(640 * 480, 25)).toBe(__1.Level.L2_1);
        expect((0, __1.supportedLevel)(1280 * 720, 30)).toBe(__1.Level.L3_1);
        expect((0, __1.supportedLevel)(1920 * 1280, 60)).toBe(__1.Level.L4_2);
    });
    test('invalid values', () => {
        expect((0, __1.supportedLevel)(0, 0)).toBeUndefined();
        // All levels support fps > 5.
        expect((0, __1.supportedLevel)(1280 * 720, 5)).toBeUndefined();
        // All levels support frame sizes > 183 * 137.
        expect((0, __1.supportedLevel)(183 * 137, 30)).toBeUndefined();
    });
});
