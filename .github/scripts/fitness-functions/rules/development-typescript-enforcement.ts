import { DEVELOPMENT_FOLDERS_JS_REGEX } from '../common/constants';
import { filterDiffFileCreations, restrictedFilePresent } from '../common/shared';

function preventJavaScriptFileAdditionsInDevelopmentFolders(diff: string): boolean {
  const diffAdditions = filterDiffFileCreations(diff);
  if (restrictedFilePresent(diffAdditions, DEVELOPMENT_FOLDERS_JS_REGEX)) {
    return false;
  }
  return true;
}

export { preventJavaScriptFileAdditionsInDevelopmentFolders };
