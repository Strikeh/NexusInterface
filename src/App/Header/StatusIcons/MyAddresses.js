// External
import React from 'react';
import styled from '@emotion/styled';

// Internal
import Tooltip from 'components/Tooltip';
import userIcon from 'images/user.sprite.svg';
import UIController from 'components/UIController';
import StatusIcon from 'components/StatusIcon';
import MyAddressesModal from 'components/MyAddressesModal';
import { timing } from 'styles';
import * as color from 'utils/color';

const MyAddressesIcon = styled(StatusIcon)(({ theme }) => ({
  cursor: 'pointer',
  color: theme.primary,
  transitionProperty: 'color, filter',
  transitionDuration: timing.normal,

  '&:hover': {
    color: color.lighten(theme.primary, 0.2),
    filter: `drop-shadow(0 0 3px ${color.fade(theme.primary, 0.5)})`,
  },
}));

/**
 * Returns JSX of My Addresses
 *
 *@returns {JSX} JSX
 */
const MyAddresses = () => (
  <Tooltip.Trigger
    align="end"
    tooltip="My Addresses"
    style={{ transform: 'translateX(12px)' }}
  >
    <MyAddressesIcon
      icon={userIcon}
      onClick={() => {
        UIController.openModal(MyAddressesModal);
      }}
    />
  </Tooltip.Trigger>
);

export default MyAddresses;