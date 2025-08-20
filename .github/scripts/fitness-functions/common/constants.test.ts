import { EXCLUDE_REGEX, DEVELOPMENT_FOLDERS_JS_REGEX } from './constants';

describe('Regular Expressions used in Fitness Functions', (): void => {
  describe(`EXCLUDE_REGEX "${EXCLUDE_REGEX}"`, (): void => {
    const PATHS_IT_SHOULD_MATCH = [
      '.github/file.js',
      '.github/file.ts',
      '.github/path/file.js',
      '.github/much/longer/path/file.js',
    ];

    const PATHS_IT_SHOULD_NOT_MATCH = [
      'file.js',
      'file.ts',
      'app/file.ts',
      'app/.github/file.ts',
    ];

    describe('included paths', (): void => {
      PATHS_IT_SHOULD_MATCH.forEach((path: string): void => {
        it(`should match "${path}"`, (): void => {
          const result = EXCLUDE_REGEX.test(path);

          expect(result).toStrictEqual(true);
        });
      });
    });

    describe('excluded paths', (): void => {
      PATHS_IT_SHOULD_NOT_MATCH.forEach((path: string): void => {
        it(`should not match "${path}"`, (): void => {
          const result = EXCLUDE_REGEX.test(path);

          expect(result).toStrictEqual(false);
        });
      });
    });
  });

  describe(`DEVELOPMENT_FOLDERS_JS_REGEX`, (): void => {
    const PATHS_IT_SHOULD_MATCH = [
      'e2e/test.js',
      'e2e/specs/test.jsx',
      'e2e/pages/deep/path/component.js',
      'scripts/build.js',
      'scripts/utils/helper.jsx',
      'wdio/config.js',
      'wdio/step-definitions/test.jsx',
    ];

    const PATHS_IT_SHOULD_NOT_MATCH = [
      'e2e/test.ts',
      'e2e/specs/test.tsx',
      'scripts/build.ts',
      'wdio/config.ts',
      'app/test.js',
      'babel.config.js',
      'metro.config.js',
      'locales/i18n.js',
      'other/test.js',
    ];

    describe('included paths', (): void => {
      PATHS_IT_SHOULD_MATCH.forEach((path: string): void => {
        it(`should match "${path}"`, (): void => {
          const result = DEVELOPMENT_FOLDERS_JS_REGEX.test(path);

          expect(result).toStrictEqual(true);
        });
      });
    });

    describe('excluded paths', (): void => {
      PATHS_IT_SHOULD_NOT_MATCH.forEach((path: string): void => {
        it(`should not match "${path}"`, (): void => {
          const result = DEVELOPMENT_FOLDERS_JS_REGEX.test(path);

          expect(result).toStrictEqual(false);
        });
      });
    });
  });
});
