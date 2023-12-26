import { combineReducers } from 'redux';

import market from './market';
import common from './common';
import addressBook from './addressBook';
import settings from './settings';
import theme from './theme';
import ui from './ui';
import modules from './modules';
import moduleStates from './moduleStates';
import core from './core';
import user from './user';
import updater from './updater';
import activeAppModuleName from './activeAppModuleName';
import bootstrap from './bootstrap';
import failedModules from './failedModules';
import assetSchemas from './assetSchemas';
import sessions from './sessions';
import moduleDownloads from './moduleDownloads';
import featuredModules from './featuredModules';

export default function createRootReducer() {
  return combineReducers({
    core,
    user,
    market,
    common,
    addressBook,
    settings,
    theme,
    ui,
    modules,
    moduleStates,
    failedModules,
    updater,
    activeAppModuleName,
    bootstrap,
    assetSchemas,
    sessions,
    moduleDownloads,
    featuredModules,
  });
}
