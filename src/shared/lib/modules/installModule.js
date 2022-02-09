import { join, dirname, normalize } from 'path';
import fs from 'fs';

import store from 'store';
import * as TYPE from 'consts/actionTypes';
import { showNotification, openModal } from 'lib/ui';
import GA from 'lib/googleAnalytics';
import { updateSettings } from 'lib/settings';
import ModuleDetailsModal from 'components/ModuleDetailsModal';
import { modulesDir } from 'consts/paths';
import { walletDataDir } from 'consts/paths';
import ensureDirExists from 'utils/ensureDirExists';
import deleteDirectory from 'utils/promisified/deleteDirectory';
import extractZip from 'utils/promisified/extractZip';
import extractTarball from 'utils/promisified/extractTarball';
import { confirm, openSuccessDialog, openErrorDialog } from 'lib/dialog';

import { loadModuleFromDir, loadDevModuleFromDir } from './module';

__ = __context('Settings.Modules');

// Temp directory for extracting module before installing
const tempModuleDir = join(walletDataDir, '.temp_module');
const supportedExtensions = ['.zip', '.tar.gz'];

/**
 * Copy a module file from source to dest
 *
 * @param {*} file - file's relative path from source
 * @param {*} source
 * @param {*} dest
 * @returns
 */
function copyFile(file, source, dest) {
  return fs.promises.copyFile(join(source, file), join(dest, file));
}

/**
 * Copy all files of a module from source to the destination
 * including nxs_package.json and repo_info.json
 *
 * @param {*} files
 * @param {*} source
 * @param {*} dest
 * @returns
 */
async function copyModule(files, source, dest) {
  // Create all the missing sub-directories sequentially first
  // The creations would be duplicated if they're parallel
  for (let file of files) {
    const dir = dirname(join(dest, file));
    await ensureDirExists(dir);
  }

  const promises = [
    copyFile('nxs_package.json', source, dest),
    ...files.map((file) => copyFile(file, source, dest)),
  ];
  if (fs.existsSync(join(source, 'repo_info.json'))) {
    promises.push(copyFile('repo_info.json', source, dest));
  }
  return await Promise.all(promises);
}

/**
 * Install a module from a directory
 *
 * @param {string} path
 * @returns
 */
async function doInstall(path) {
  let module;
  try {
    module = await loadModuleFromDir(path);
  } catch (err) {
    openErrorDialog({
      message: __('Failed to load module'),
      note: err.message,
    });
  }

  if (!module) return;

  openModal(ModuleDetailsModal, {
    module,
    forInstall: true,
    install: async () => {
      try {
        const dest = join(modulesDir, module.info.name);
        if (fs.existsSync(dest)) {
          const agreed = await confirm({
            question: __('Overwrite module?'),
            note: __('A module with the same directory name already exists'),
          });
          if (!agreed) return;

          await deleteDirectory(dest, { glob: false });
        }

        await copyModule(module.info.files, path, dest);
        GA.SendEvent('Modules', 'installModule', 'name', module.info.name);

        openSuccessDialog({
          message: __('Module has been successfully installed'),
          note: __(
            'The wallet will now be refreshed for the new module to take effect'
          ),
          onClose: () => {
            location.reload();
          },
        });
      } catch (err) {
        console.error(err);
        showNotification(__('Error copying module files'), 'error');
        return;
      }
    },
  });
}

/**
 * Install a module from either an archive file or a directory.
 * In case of an archive file, it will be extracted to a
 * temp directory then continue to install from that directory.
 *
 * @export
 * @param {string} path
 * @returns
 */
export async function installModule(path) {
  try {
    if (!fs.existsSync(path)) {
      showNotification(__('Cannot find module'), 'error');
      return;
    }
    let sourcePath = path;

    if ((await fs.promises.stat(path)).isFile()) {
      if (!supportedExtensions.some((ext) => path.endsWith(ext))) {
        showNotification(__('Unsupported file type'), 'error');
        return;
      }

      if (fs.existsSync(tempModuleDir)) {
        await deleteDirectory(tempModuleDir);
      }

      if (path.endsWith('.zip')) {
        await extractZip(path, { dir: tempModuleDir });
      } else if (path.endsWith('.tar.gz')) {
        await extractTarball(path, tempModuleDir);
      }
      sourcePath = tempModuleDir;

      // In case the module is wrapped inside a sub directory of the archive file
      const subItems = await fs.promises.readdir(tempModuleDir);
      if (subItems.length === 1) {
        const subItemPath = join(tempModuleDir, subItems[0]);
        if ((await fs.promises.stat(subItemPath)).isDirectory()) {
          sourcePath = subItemPath;
        }
      }
    } else {
      const sourcePath = normalize(path);
      if (sourcePath.startsWith(normalize(modulesDir))) {
        showNotification(__('Cannot install from this location'), 'error');
        return;
      }
    }

    await doInstall(sourcePath);
  } catch (err) {
    console.error(err);
    showNotification(__('An unknown error occurred'), 'error');
    return;
  }
}

export async function addDevModule(dirPath) {
  const {
    modules,
    settings: { devModulePaths },
  } = store.getState();
  if (devModulePaths.includes(dirPath)) {
    openErrorDialog({
      message: __('Directory has already been added'),
    });
    return;
  }

  let module;
  try {
    module = await loadDevModuleFromDir(dirPath);
  } catch (err) {
    openErrorDialog({
      message: __('Failed to load development module'),
      note: err.message,
    });
  }
  if (!module) return;

  if (modules[module.info.name]) {
    openErrorDialog({
      message: __('A module with the same name already exists'),
    });
    return;
  }

  updateSettings({
    devModulePaths: [dirPath, ...devModulePaths],
  });
  store.dispatch({
    type: TYPE.ADD_DEV_MODULE,
    payload: module,
  });
  openSuccessDialog({
    message: __('Development module has been added'),
  });
}

import https from 'https';
import axios from 'axios';

function downloadFile({ url, filePath, onProgress }) {
  return new Promise((resolve, reject) => {
    https
      .get(url)
      .setTimeout(180000)
      .on('response', (response) => {
        const totalSize = parseInt(response.headers['content-length'], 10);

        let downloaded = 0;
        const file = fs.createWriteStream(filePath);

        response
          .on('data', (chunk) => {
            downloaded += chunk.length;
            timerId = onProgress({ downloaded, totalSize });
          })
          .on('close', () => {
            resolve(true);
          })
          .on('error', (err) => {
            reject(err);
          })
          .pipe(file);
      })
      .on('error', (err) => {
        reject(err);
      })
      .on('timeout', function () {
        if (downloadRequest) downloadRequest.abort();
        reject(new Error('Request timeout!'));
      })
      .on('abort', function () {
        if (fs.existsSync(fileLocation)) {
          fs.unlink(fileLocation, (err) => {
            if (err) console.error(err);
          });
        }
        resolve(false);
      });
  });
}

export async function downloadModulePackage({
  moduleName,
  owner,
  repo,
  releaseId,
  onProgress,
}) {
  try {
    const { data: releaseAssets } = await axios.get(
      `https://api.github.com//repos/${owner}/${repo}/releases/${releaseId}/assets`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    const asset = releaseAssets.find(
      ({ name }) =>
        name.startsWith(moduleName) &&
        (name.endsWith('.zip') || name.endsWith('.tar.gz'))
    );
    if (!asset) {
      openErrorDialog({
        message: __('Cannot find module archive file among assets'),
      });
      return;
    }
    const filePath = join(walletDataDir, '.downloads', asset.name);
    const completed = await downloadFile({
      url: asset.browser_download_url,
      filePath,
      onProgress,
    });
    if (completed) {
      await installModule(filePath);
    }
  } catch (err) {}
}

export async function download(module) {
  const repoId = `${module.owner}/${module.repo}`;
  const url = `https://api.github.com/repos/${repoId}/releases/latest`;
  try {
    const response = await axios.get(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });
    const data = response.data;
    const assets = data.assets;
    if (assets.length == 0) throw 'Nothing to download';
    let tarzip;
    for (let i = 0; i < assets.length; i++) {
      const element = assets[i];
      if (
        element.content_type === 'application/x-gzip' ||
        element.content_type === 'application/x-zip'
      ) {
        tarzip = element.browser_download_url;
        break;
      }
    }

    console.log(tarzip);
    const file = fs.createWriteStream(
      join(
        walletDataDir,
        'modules',
        `${module.repo}_TEMP.${tarzip.endsWith('gz') ? 'tar.gz' : 'zip'}`
      )
    );
    console.log(file);
    const request = await https.get(tarzip, async function (response) {
      console.log(response);
      if (response.statusCode === 302) {
        const request2 = await https.get(
          response.headers.location,
          async function (response) {
            console.log(response);
            response.pipe(file);
            setTimeout(async () => {
              await installModule(file.path);
            }, 1000);
          }
        );
      } else {
        response.pipe(file);
      }
    });
  } catch (e) {
    console.log('error', e);
  }
}
