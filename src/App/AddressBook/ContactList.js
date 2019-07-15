// External
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import { openModal } from 'actions/globalUI';
import AddEditContactModal from 'components/AddEditContactModal';
import Contact, { NewContactButton } from './Contact';

const ContactListComponent = styled.div(({ theme }) => ({
  gridArea: 'list',
  maxHeight: '100%',
  overflowY: 'auto',
  borderRight: `1px solid ${theme.mixer(0.125)}`,
  marginLeft: -30,
}));

const Separator = styled.div(({ theme }) => ({
  margin: '5px 30px',
  height: 1,
  background: theme.mixer(0.125),
}));

const mapStateToProps = ({
  addressBook,
  ui: {
    addressBook: { searchQuery },
  },
  core: {
    info: { connections },
  },
}) => ({
  addressBook,
  searchQuery,
  connections,
});

const actionCreators = { openModal };

/**
 * List of contacts
 *
 * @class ContactList
 * @extends {Component}
 */
@connect(
  mapStateToProps,
  actionCreators
)
class ContactList extends React.Component {
  createContact = () => {
    this.props.openModal(AddEditContactModal);
  };

  /**
   * Component's Renderable JSX
   *
   * @returns {JSX}
   * @memberof ContactList
   */
  render() {
    const { addressBook, searchQuery, connections } = this.props;

    return (
      <ContactListComponent>
        {Object.values(addressBook).map(contact =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.addresses.find(({ address }) => address === searchQuery) ? (
            <Contact key={contact.name} contact={contact} />
          ) : null
        )}
        {connections !== undefined && (
          <>
            <Separator />
            <NewContactButton onClick={this.createContact} />
          </>
        )}
      </ContactListComponent>
    );
  }
}

export default ContactList;
