import { callApi } from 'lib/tritiumApi';
import store from 'store';
import * as TYPE from 'consts/actionTypes';

export async function fetchAssetSchema(address) {
  const schema = await callApi('assets/get/schema', { address });
  store.dispatch({
    type: TYPE.SET_ASSET_SCHEMA,
    payload: {
      address,
      schema,
    },
  });
}

export function getAssetData(asset) {
  if (!asset) return asset;
  const { name, created, modified, address, owner, ownership, ...data } = asset;
  return data;
}
