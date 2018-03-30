
// import * as fs from 'fs';

class UtBrowserManager {

}

class UtSystemBrowser {

}

class UtBrowserInstaller {
  path?: string;
  driverPath?: string;
  browserPath?: string;
  utExtensionPath?: string;
  ublockExtensionPath?: string;

  download() {

  }

  downloadDriver() {

  }

  downloadBrowser() {

  }

  copyBrowser() {

  }

  downloadUtExtension() {

  }

  downloadUBlockExtension() {

  }

  extractFiles() {

  }

  cleanup() {

  }
}

enum UtBrowserBundleError {
  FAILED_TO_DOWNLOAD_DRIVER,
  FAILED_TO_DOWNLOAD_BROWSER,
  FAILED_TO_COPY_BROWSER,
  FAILED_TO_DOWNLOAD_UT_EXTENSION,
  FAILED_TO_DOWNLOAD_UBLOCK_EXTENSION,
  FAILED_TO_CREATE_DIRECTORY,
}