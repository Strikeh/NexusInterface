import * as TYPE from 'consts/actionTypes';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.UPDATE_FORM_INSTANCE:
      return { ...state, [action.payload.formName]: action.payload.instance };

    default:
      return state;
  }
};