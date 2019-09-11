import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Button from 'components/Button';
import { switchUserTab } from 'actions/ui';
import { updateSettings } from 'actions/settings';
import { restartCore } from 'actions/core';
import confirm from 'utils/promisified/confirm';

import QuestionMark from './QuestionMark';

const StakingWrapper = styled.div(({ theme }) => ({
  maxWidth: 400,
  margin: '0 auto',
  paddingTop: 15,
  color: theme.mixer(0.75),
}));

const Line = styled.div(
  {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '.4em',
  },
  ({ bold, theme }) =>
    bold && {
      fontWeight: 'bold',
      color: theme.foreground,
    }
);

@connect(
  state => ({
    stakeInfo: state.core.stakeInfo,
    stakingEnabled: state.settings.enableStaking,
  }),
  { switchUserTab, updateSettings, restartCore }
)
export default class Staking extends React.Component {
  constructor(props) {
    super(props);
    props.switchUserTab('Staking');
  }

  switchStaking = async () => {
    const { stakingEnabled, updateSettings, restartCore } = this.props;
    const confirmed = await confirm({
      question: __('Restart Core?'),
      note: __('Nexus Core needs to restart for this change to take effect'),
      labelYes: stakingEnabled ? __('Disable staking') : __('Enable staking'),
      labelNo: __('Cancel'),
    });
    if (confirmed) {
      updateSettings({ enableStaking: !stakingEnabled });
      restartCore();
    }
  };

  render() {
    const { stakeInfo, stakingEnabled } = this.props;

    return (
      !!stakeInfo && (
        <StakingWrapper>
          <Line bold>
            <div>{__('Status')}</div>
            <div>{stakeInfo.staking ? __('Staking') : __('Not staking')}</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Stake balance')}</span>
              <QuestionMark
                tooltip={__(
                  'The amount of NXS currently staked in the trust account'
                )}
              />
            </div>
            <div>{stakeInfo.stake} NXS</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Stake Rate')}</span>
              <QuestionMark
                tooltip={__(
                  'The current annual reward rate earned for staking'
                )}
              />
            </div>
            <div>{stakeInfo.stakerate} %</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Trust Weight')}</span>
              <QuestionMark
                tooltip={__(
                  'The percentage of the maximum Trust Score, which is gradually built over time when you consistently operate your node in an honest, trustworthy, and timely manner'
                )}
              />
            </div>
            <div>{stakeInfo.trustweight} %</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Block Weight')}</span>
              <QuestionMark
                tooltip={__(
                  'Block Weight depends on the time passed since you received a Trust transaction and will be reset everytime you receive a Trust transaction. Otherwise, Block Weight will reach 100% after 3 days and your Trust Score will start decaying until you receive another Trust transaction'
                )}
              />
            </div>
            <div>{stakeInfo.blockweight} %</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Stake Weight')}</span>
              <QuestionMark
                tooltip={__(
                  'Stake Weight depends on Trust Weight and Block Weight. Along with your Stake balance, Stake Weight affects how frequent you receive a Trust transaction'
                )}
              />
            </div>
            <div>{stakeInfo.stakeweight} %</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Unstaked balance')}</span>
              <QuestionMark
                tooltip={__(
                  'The current NXS balance of the trust account that is not staked. You can spend this amount without affecting your Trust Score'
                )}
              />
            </div>
            <div>{stakeInfo.balance} NXS</div>
          </Line>
          <div className="mt1 flex space-between">
            <Button disabled={!stakeInfo.stake && !stakeInfo.balance}>
              {__('Adjust stake balance')}
            </Button>
            <Button
              skin={stakingEnabled ? 'default' : 'primary'}
              onClick={this.switchStaking}
            >
              {stakingEnabled ? __('Disable staking') : __('Enable staking')}
            </Button>
          </div>
        </StakingWrapper>
      )
    );
  }
}