// eslint-disable-next-line import/no-namespace
import * as FileSystem from 'expo-file-system';

interface EntryScriptWeb3Interface {
  entryScriptWeb3: string | null;
  init(): Promise<string>;
  get(): Promise<string>;
}

const EntryScriptWeb3: EntryScriptWeb3Interface = {
  entryScriptWeb3: null,
  async init(): Promise<string> {
    this.entryScriptWeb3 = await FileSystem.readAsStringAsync(
      `${FileSystem.bundleDirectory}InpageBridgeWeb3.js`,
    );
    return this.entryScriptWeb3;
  },
  async get(): Promise<string> {
    if (this.entryScriptWeb3) return this.entryScriptWeb3;

    return await this.init();
  },
};

export default EntryScriptWeb3;
