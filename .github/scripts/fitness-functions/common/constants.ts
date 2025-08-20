// Exclude checking for files in .github directory
const EXCLUDE_REGEX = /^.github/;

enum AUTOMATION_TYPE {
  CI = 'ci',
  PRE_COMMIT_HOOK = 'pre-commit-hook',
  PRE_PUSH_HOOK = 'pre-push-hook',
}

// only allow TS and TSX files in the app directory only
const APP_FOLDER_JS_REGEX = /^(app).*\.(js|jsx)$/;

const DEVELOPMENT_FOLDERS_JS_REGEX = /^(e2e|scripts|wdio).*\.(js|jsx)$/;

export { EXCLUDE_REGEX, APP_FOLDER_JS_REGEX, DEVELOPMENT_FOLDERS_JS_REGEX, AUTOMATION_TYPE };
