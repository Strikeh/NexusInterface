// External
import { Component } from 'react';
import { connect } from 'react-redux';
import memoize from 'utils/memoize';
import styled from '@emotion/styled';

// Internal
import AutoSuggest from 'components/AutoSuggest';
import FormField from 'components/FormField';
import Button from 'components/Button';
import Icon from 'components/Icon';
import AddEditContactModal from 'components/AddEditContactModal';
import { openModal } from 'lib/ui';
import { callApi } from 'lib/tritiumApi';
import { addressRegex } from 'consts/misc';
import plusIcon from 'icons/plus.svg';
import { getAddressNameMap, getRecipientSuggestions } from './selectors';

__ = __context('Send');

const RecipientName = styled.span(({ theme }) => ({
  textTransform: 'none',
  color: theme.primary,
}));

const EmptyMessage = styled.div(({ theme }) => ({
  fontSize: '.9em',
  color: theme.mixer(0.625),
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const filterSuggestions = memoize((suggestions, inputValue) => {
  if (!suggestions) return [];
  if (!inputValue) return suggestions;
  const query = inputValue.toLowerCase();
  return suggestions.filter(
    ({ address, name }) =>
      (!!name && name.toLowerCase().includes(query)) ||
      (!!address && address.toLowerCase().includes(query))
  );
});

const mapStateToProps = ({ addressBook, user }, { source }) => {
  return {
    suggestions: getRecipientSuggestions(
      addressBook,
      user?.accounts,
      source?.account?.address
    ),
    addressNameMap: getAddressNameMap(addressBook, user.accounts),
  };
};

/**
 * The Recipient Field in the Send Page
 *
 * @class RecipientField
 * @extends {Component}
 */
@connect(mapStateToProps)
class RecipientField extends Component {
  /**
   *Handle Select Address
   *
   * @memberof RecipientField
   */
  handleSelect = (address) => {
    this.props.change(this.props.input.name, address);
  };

  /**
   * Opens the Add/Edit Contact Modal
   *
   * @memberof RecipientField
   */
  createContact = () => {
    openModal(AddEditContactModal);
  };

  addToContact = async () => {
    const address = this.props.input.value;
    let isMine = false;
    try {
      const result = await callApi('system/validate/address', {
        address,
      });
      isMine = result.is_mine;
    } catch (err) {
      console.error(err);
    }
    const prefill = isMine
      ? { notMine: [], mine: [{ address, label: '' }] }
      : { notMine: [{ address, label: '' }] };
    openModal(AddEditContactModal, { prefill });
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof RecipientField
   */
  render() {
    const { addressNameMap, input, meta, suggestions } = this.props;
    const recipientName = addressNameMap[input.value];
    const isAddress = addressRegex.test(input.value);

    return (
      <FormField
        label={
          <>
            <span>
              {__('Send to')}
              &nbsp;&nbsp;
            </span>
            <RecipientName>{recipientName}</RecipientName>
            {!recipientName && isAddress && (
              <Button skin="plain-link-primary" onClick={this.addToContact}>
                <Icon icon={plusIcon} style={{ fontSize: '0.9em' }} />
                <span className="v-align ml0_4">
                  {__('Add to Address Book')}
                </span>
              </Button>
            )}
          </>
        }
      >
        <AutoSuggest.RF
          input={input}
          meta={meta}
          inputProps={{
            placeholder: __('Recipient Address/Name'),
            skin: 'filled-inverted',
          }}
          suggestions={suggestions}
          onSelect={this.handleSelect}
          filterSuggestions={filterSuggestions}
          emptyFiller={
            suggestions.length === 0 && (
              <EmptyMessage>
                {__('Your address book is empty')}
                <Button as="a" skin="hyperlink" onClick={this.createContact}>
                  <Icon
                    icon={plusIcon}
                    className="mr0_4"
                    style={{ fontSize: '.8em' }}
                  />
                  <span className="v-align">{__('Create new contact')}</span>
                </Button>
              </EmptyMessage>
            )
          }
        />
      </FormField>
    );
  }
}
export default RecipientField;
