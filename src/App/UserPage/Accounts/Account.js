import styled from '@emotion/styled';

import Link from 'components/Link';
import NexusAddress from 'components/NexusAddress';
import QRButton from 'components/QRButton';
import TokenName from 'components/TokenName';
import { formatNumber } from 'lib/intl';
import { openModal } from 'lib/ui';
import AccountDetailsModal from './AccountDetailsModal';
import AccountHistoryModal from './AccountHistoryModal';
import RenameAccountModal from './RenameAccountModal';
import { totalBalance } from './utils';

__ = __context('User.Accounts');

const AccountComponent = styled.div(({ theme }) => ({
  padding: '1em 0 1.5em',
}));

const AccountName = styled.span(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.foreground,
}));

const UnNamed = styled(AccountName)(({ theme }) => ({
  fontStyle: 'italic',
  color: theme.mixer(0.8),
}));

export default function Account({ account }) {
  return (
    <AccountComponent>
      <div className="flex space-between">
        <div>
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => {
              openModal(AccountDetailsModal, { account });
            }}
          >
            {account.name ? (
              <AccountName>{account.name}</AccountName>
            ) : (
              <UnNamed>{__('Unnamed account')}</UnNamed>
            )}

            <span>
              {' '}
              ({formatNumber(totalBalance(account))}{' '}
              <TokenName account={account} />)
            </span>
          </span>
        </div>
        <div>
          {account.name !== 'default' && (
            <Link
              as="a"
              onClick={() => {
                openModal(RenameAccountModal, { account });
              }}
            >
              {__('Rename')}
            </Link>
          )}
          &nbsp;&nbsp;
          <Link
            as="a"
            onClick={() => {
              openModal(AccountDetailsModal, { account });
            }}
          >
            {__('Details')}
          </Link>
          &nbsp;&nbsp;
          <Link
            as="a"
            onClick={() => {
              openModal(AccountHistoryModal, { account });
            }}
          >
            {__('History')}
          </Link>
        </div>
      </div>
      <NexusAddress
        className="mt1"
        address={account.address}
        label={
          <div className="flex center space-between">
            <span>
              {__(
                '<b>%{account_name}</b> account address',
                {
                  account_name: account.name || __('Unnamed'),
                },
                {
                  b: (text) =>
                    account.name ? (
                      <strong>{text}</strong>
                    ) : (
                      <UnNamed>{text}</UnNamed>
                    ),
                }
              )}
            </span>
            <QRButton address={account.address} />
          </div>
        }
      />
    </AccountComponent>
  );
}
