import {
  generateModifyFilesDiff,
  generateCreateFileDiff,
} from '../common/test-data';
import { preventJavaScriptFileAdditionsInDevelopmentFolders } from './development-typescript-enforcement';

describe('preventJavaScriptFileAdditionsInDevelopmentFolders()', (): void => {
  it('should pass when receiving an empty diff', (): void => {
    const testDiff = '';

    const hasRulePassed = preventJavaScriptFileAdditionsInDevelopmentFolders(testDiff);

    expect(hasRulePassed).toBe(true);
  });

  it('should pass when TypeScript files are added to development directories', (): void => {
    const testDiff = [
      generateCreateFileDiff('e2e/test.ts', 'yada yada yada yada'),
      generateCreateFileDiff('scripts/build.ts', 'yada yada yada yada'),
      generateCreateFileDiff('wdio/helper.ts', 'yada yada yada yada'),
    ].join('');

    const hasRulePassed = preventJavaScriptFileAdditionsInDevelopmentFolders(testDiff);

    expect(hasRulePassed).toBe(true);
  });

  it('should fail when JavaScript files are added to e2e directory', (): void => {
    const testDiff = [
      generateCreateFileDiff('e2e/test.js', 'yada yada yada yada'),
    ].join('');

    const hasRulePassed = preventJavaScriptFileAdditionsInDevelopmentFolders(testDiff);

    expect(hasRulePassed).toBe(false);
  });

  it('should fail when JSX files are added to scripts directory', (): void => {
    const testDiff = [
      generateCreateFileDiff('scripts/component.jsx', 'yada yada yada yada'),
    ].join('');

    const hasRulePassed = preventJavaScriptFileAdditionsInDevelopmentFolders(testDiff);

    expect(hasRulePassed).toBe(false);
  });

  it('should fail when JavaScript files are added to wdio directory', (): void => {
    const testDiff = [
      generateCreateFileDiff('wdio/config.js', 'yada yada yada yada'),
    ].join('');

    const hasRulePassed = preventJavaScriptFileAdditionsInDevelopmentFolders(testDiff);

    expect(hasRulePassed).toBe(false);
  });

  it('should pass when JavaScript files are added to other directories', (): void => {
    const testDiff = [
      generateCreateFileDiff('babel.config.js', 'yada yada yada yada'),
      generateCreateFileDiff('metro.config.js', 'yada yada yada yada'),
      generateCreateFileDiff('locales/i18n.js', 'yada yada yada yada'),
    ].join('');

    const hasRulePassed = preventJavaScriptFileAdditionsInDevelopmentFolders(testDiff);

    expect(hasRulePassed).toBe(true);
  });

  it('should pass when modifying existing JavaScript files in development directories', (): void => {
    const testDiff = [
      generateModifyFilesDiff('e2e/existing-test.js', 'yada yada yada yada'),
    ].join('');

    const hasRulePassed = preventJavaScriptFileAdditionsInDevelopmentFolders(testDiff);

    expect(hasRulePassed).toBe(true);
  });
});
