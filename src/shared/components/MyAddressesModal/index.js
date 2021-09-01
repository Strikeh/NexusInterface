// External
import { Component } from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import ControlledModal from 'components/ControlledModal';
import TextField from 'components/TextField';
import Icon from 'components/Icon';
import Button from 'components/Button';
import searchIcon from 'icons/search.svg';
import plusIcon from 'icons/plus.svg';

import Account from './Account';
import NewAddressForm from './NewAddressForm';
import Tooltip from 'components/Tooltip';
import { showNotification } from 'lib/ui';
import { loadAccounts, updateAccountBalances } from 'lib/user';
import rpc from 'lib/rpc';

__ = __context('MyAddresses');

const MyAddressesModalComponent = styled(ControlledModal)({
  // set a fixed height so that the modal won't jump when the search query changes
  height: '80%',
});

const Search = styled.div({
  marginBottom: '1em',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'stretch',
});

const Buttons = styled.div({
  marginTop: '2em',
  marginBottom: '1em',
});

/**
 * Handles the My Address from header
 *
 * @class MyAddressesModal
 * @extends {React.Component}
 */
@connect((state) => ({
  myAccounts: state.myAccounts,
  locale: state.settings.locale,
  blockCount: state.core.info.blocks,
}))
class MyAddressesModal extends Component {
  state = {
    searchQuery: '',
    creatingAddress: false,
  };

  componentDidMount() {
    loadAccounts();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.blockCount !== this.props.blockCount) {
      updateAccountBalances();
    }
  }
  /**
   * Handle search changes
   *
   * @memberof MyAddressesModal
   */
  handleChange = (e) => {
    this.setState({
      searchQuery: e.target.value,
    });
  };

  checkwallet = async () => {
    try {
      await rpc('checkwallet', []);
    } catch (err) {
      console.log(err);
      showNotification(__('Check wallet failed'), 'error');
      return;
    }
    showNotification(__('Check wallet pass'), 'success');
  };

  /**
   * Filter the Accounts
   *
   * @memberof MyAddressesModal
   */
  filteredAccounts = () => {
    const allAccounts = this.props.myAccounts || [];
    return allAccounts.filter((acc) => {
      const accName = acc.account || __('My Account');
      const searchedName = accName.toLowerCase();
      const query = this.state.searchQuery.toLowerCase();
      return searchedName.indexOf(query) >= 0;
    });
  };

  /**
   * Start Creating
   *
   * @memberof MyAddressesModal
   */
  startCreating = () => {
    this.setState({
      creatingAddress: true,
    });
  };

  /**
   * End Creating
   *
   * @memberof MyAddressesModal
   */
  endCreating = () => {
    this.setState({
      creatingAddress: false,
    });
  };

  /**
   * React Render
   *
   * @returns
   * @memberof MyAddressesModal
   */
  render() {
    return (
      <MyAddressesModalComponent>
        <ControlledModal.Header>My Addresses</ControlledModal.Header>
        <ControlledModal.Body>
          <Search>
            <TextField
              left={<Icon icon={searchIcon} className="mr0_4" />}
              placeholder="Search account"
              value={this.state.searchQuery}
              onChange={this.handleChange}
              style={{ width: 300 }}
            />
            <Tooltip.Trigger tooltip={__("Check wallet's integrity")}>
              <Button fitHeight onClick={this.checkwallet}>
                {__('Check wallet')}
              </Button>
            </Tooltip.Trigger>
          </Search>
          {this.filteredAccounts().map((acc) => (
            <Account
              key={acc.account}
              account={acc}
              searchQuery={this.state.searchQuery}
            />
          ))}

          {this.state.creatingAddress ? (
            <NewAddressForm finish={this.endCreating} />
          ) : (
            <Buttons>
              <Button onClick={this.startCreating}>
                <Icon icon={plusIcon} className="mr0_4" />
                {__('Create new address')}
              </Button>
            </Buttons>
          )}
        </ControlledModal.Body>
      </MyAddressesModalComponent>
    );
  }
}

export default MyAddressesModal;
