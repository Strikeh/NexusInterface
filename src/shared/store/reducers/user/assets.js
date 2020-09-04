import * as TYPE from 'consts/actionTypes';

const initialState = null;

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_ASSETS:
      return action.payload;

    case TYPE.CLEAR_CORE_INFO:
    case TYPE.LOGOUT:
      return initialState;

    default:
      return state;
  }
};
