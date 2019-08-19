// External
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field, InfoForm } from 'redux-form';
import styled from '@emotion/styled';
import { history } from 'store';

// Internal
import Modal from 'components/Modal';
import Button from 'components/Button';
import Panel from 'components/Panel';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import FieldSet from 'components/FieldSet';
import { updateSettings } from 'actions/settings';
import * as Tritium from 'lib/tritium-api';
import {
  openConfirmDialog,
  openModal,
  showNotification,
  openErrorDialog,
} from 'actions/overlays';
import * as TYPE from 'consts/actionTypes';


const LoginModalComponent = styled(Modal)({
  padding: '1px',
});

const LoginFieldSet = styled(FieldSet)({
  maxWidth: '50%',
  margin: '0 auto',
});

var ldldldl = false;

@connect(
  null,
  dispatch => ({
    turnOnTritium: onOff => dispatch(updateSettings({ tritium: onOff })),
    tempTurnOffLogIn: () => dispatch({ type: 'TEMP_LOG_IN', payload: true }),
    setUserGenesis: returnData => {
      dispatch({ type: TYPE.TRITIUM_SET_USER_GENESIS, payload: returnData });
    },
    setUserName: returnData => {
      dispatch({ type: TYPE.TRITIUM_SET_USER_NAME, payload: returnData });
    },
  })
)
class LoginComponent extends React.Component {
  close = () => {
    this.props.goBack();
    this.closeModal();
  };

  asddfgh = () => {
    this.props.onCloseCreate();
    this.closeModal();
  };

  legacyClose = () => {
    this.props.tempTurnOffLogIn();
    this.props.onCloseLegacy();
    this.closeModal();
  };

  onSubmit = (values, _, props) => {
    console.log(props);
  };

  askdkdkdk = () => {
    console.log(ldldldl);
    this.props.turnOnTritium(ldldldl);
    ldldldl = !ldldldl;
  };

  render() {
    const { handleSubmit, submitting } = this.props;
    console.log(this);
    return (
      <LoginModalComponent
        fullScreen
        assignClose={close => {
          this.closeModal = close;
        }}
        {...this.props}
      >
        <Modal.Header>Tritium User</Modal.Header>
        <Modal.Body>
          <Panel title={'Login'}>
            <LoginForm closeModal={this.close} {...this.props} />
            <div
              style={{
                marginLeft: 'auto',
                marginRight: 'auto',
                display: 'grid',
                alignItems: 'center',
                gridTemplateColumns: 'auto auto',
                gridTemplateRows: 'auto',
                gridGap: '1em .5em',
              }}
            >
              <Button
                skin="primary"
                type="submit"
                wide
                onClick={this.asddfgh}
                style={{ fontSize: 17, marginTop: '5px' }}
              >
                Create Account
              </Button>
              <Button
                skin="primary"
                onClick={() => this.props.onCloseForgot()}
                style={{ fontSize: 17, padding: '5px' }}
              >
                Forgot Password/Pin
              </Button>
              <Button
                skin="primary"
                onClick={this.legacyClose}
                style={{ fontSize: 17, padding: '5px' }}
              >
                Legacy Mode
              </Button>
              <Button
                skin="primary"
                onClick={() => this.props.onCloseTest()}
                style={{ fontSize: 17, padding: '5px' }}
              >
                Test Show recovery
              </Button>
              <Button
                wide
                skin="primary"
                onClick={this.close}
                style={{ fontSize: 17, padding: '5px' }}
              >
                Test Close Go To Overview
              </Button>
              <Button
                wide
                skin="primary"
                onClick={this.askdkdkdk}
                style={{ fontSize: 17, padding: '5px' }}
              >
                Test toggle tritium switch
              </Button>
            </div>
          </Panel>
        </Modal.Body>
      </LoginModalComponent>
    );
  }
}

export default LoginComponent;

@reduxForm({
  form: 'login',
  destroyOnUnmount: false,
  initialValues: {
    username: '',
    password: '',
    pin: '',
    callback: () => {},
  },
  validate: ({ username, password, pin }, props) => {
    const errors = {};
    console.log(`${username} , ${password} , ${pin}`);

    if (!username) {
      errors.username = 'UserName';
    }
    if (!password) {
      errors.password = 'Password';
    }
    if (!pin) {
      errors.pin = 'Pin';
    }
    return errors;
  },
  onSubmit: async ({ username, password, pin }, dispatch, props) => {
    console.log('ONSUBMIT');
    console.log(props);
    const asdgh = await Tritium.PROMISE(
      'API',
      { api: 'users', verb: 'login', noun: 'user' },
      [{ username: username, password: password, pin: pin }]
    );
    console.log(asdgh);
    return asdgh;
  },
  onSubmitSuccess: async (result, dispatch, props) => {
    console.log('SUCESSS');
    props.setUserGenesis(result.data.result.genesis);
    props.setUserName(props.values.username);
     showNotification('Logged In', 'success');
    console.log('PASS');

    props.turnOnTritium(true);
    props.closeModal();
  },
  onSubmitFail: (errors, dispatch, submitError) => {
    console.log('FAIL');
    if (!errors || !Object.keys(errors).length) {
      let note = submitError || 'Error';
      if (
        submitError === 'Error: The wallet passphrase entered was incorrect.'
      ) {
        note = 'Bad Passowrd';
      } else if (submitError === 'value is type null, expected int') {
        note = 'Futur Date';
      }
       openErrorDialog({
        message: 'Logged In Error',
        note: note,
      });
    }
  },
})
class LoginForm extends React.Component {
  render() {
    const { handleSubmit, submitting } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <LoginFieldSet legend="Login">
          <FormField connectLabel label={'Username'}>
            <Field
              component={TextField.RF}
              name="username"
              type="text"
              placeholder={'Username'}
            />
          </FormField>
          <FormField connectLabel label={'Password'}>
            <Field
              component={TextField.RF}
              name="password"
              type="text"
              placeholder={'Password'}
            />
          </FormField>
          <FormField connectLabel label={'Pin'}>
            <Field
              component={TextField.RF}
              name="pin"
              type="text"
              placeholder={'Pin'}
            />
          </FormField>
          <div style={{ padding: '5px', paddingTop: '10px' }}>
            <Button
              skin="primary"
              onClick={handleSubmit}
              wide
              disabled={submitting}
              style={{ fontSize: 17, padding: '5px' }}
            >
              Login With Tritium
            </Button>
          </div>
        </LoginFieldSet>
      </form>
    );
  }
}
