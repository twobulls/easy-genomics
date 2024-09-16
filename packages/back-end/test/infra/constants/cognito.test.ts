import { cognitoPasswordRegex } from '../../../src/infra/constants/cognito';

describe('config password validation tests', () => {
  it('Empty string, should fail', () => {
    expect(cognitoPasswordRegex.test('')).toBe(false);
  });

  it('Missing special character, should fail', () => {
    expect(cognitoPasswordRegex.test('Inva1idPa55word')).toBe(false);
  });

  it('Invalid special character, should fail', () => {
    expect(cognitoPasswordRegex.test('Inva1idPa££word')).toBe(false);
  });

  it('Length too short, should fail', () => {
    expect(cognitoPasswordRegex.test('Inva1!d')).toBe(false);
  });

  it('No upper case characters, should fail', () => {
    expect(cognitoPasswordRegex.test('inva1!dpa55word')).toBe(false);
  });

  it('No lower case characters, should fail', () => {
    expect(cognitoPasswordRegex.test('INVA1!DPA55WORD')).toBe(false);
  });

  it('No numeric characters, should fail', () => {
    expect(cognitoPasswordRegex.test('Inval!dPassword')).toBe(false);
  });

  it('Valid Password, should pass', () => {
    expect(cognitoPasswordRegex.test('Val!dPa55word')).toBe(true);
  });

  it('Escaped characters in regex, should pass', () => {
    expect(cognitoPasswordRegex.test('Val!dPa55word\\/[]-^')).toBe(true);
  });
});
