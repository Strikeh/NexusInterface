// External
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import Icon from 'components/Icon';
import Arrow from 'components/Arrow';
import Overlay from 'components/Overlay';
import userIcon from 'images/user.sprite.svg';
import { timing } from 'styles';
import * as color from 'utils/color';

import StatusIcon from './StatusIcon';
import UserDropdown from './UserDropdown';

const UserControlComponent = styled(StatusIcon)(
  ({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    color: theme.primary,
    transitionProperty: 'color, filter',
    transitionDuration: timing.normal,

    '&:hover': {
      color: color.lighten(theme.primary, 0.2),
      filter: `drop-shadow(0 0 3px ${color.fade(theme.primary, 0.5)})`,
    },
  }),
  ({ loggedIn }) => ({
    opacity: loggedIn ? 1 : 0.7,
  })
);

/**
 * Returns JSX of My Addresses
 *
 *@returns {JSX} JSX
 */
@connect(({ currentUser }) => ({ currentUser }))
class UserControl extends React.Component {
  state = {
    open: false,
  };

  controlRef = React.createRef();

  openDropdown = () => {
    this.setState({ open: true });
  };

  closeDropdown = () => {
    this.setState({ open: false });
  };

  getDropdownStyle = () => {
    const el = this.controlRef.current;
    if (!el) return {};

    const rect = el.getBoundingClientRect();
    return {
      top: rect.bottom + 18,
      right: window.innerWidth - rect.right,
    };
  };

  render() {
    return (
      <>
        <UserControlComponent
          ref={this.controlRef}
          onClick={this.openDropdown}
          loggedIn={!!this.props.currentUser}
        >
          <Icon icon={userIcon} />
          <Arrow
            direction="down"
            width={10}
            height={6}
            style={{ marginLeft: 5 }}
          />
        </UserControlComponent>
        {this.state.open && (
          <Overlay onBackgroundClick={this.closeDropdown}>
            <UserDropdown style={this.getDropdownStyle()} />
          </Overlay>
        )}
      </>
    );
  }
}

export default UserControl;