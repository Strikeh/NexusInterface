import { useEffect, useState } from 'react';

import NexusAddress from 'components/NexusAddress';
import Icon from 'components/Icon';
import { lookupAddress } from 'lib/addressBook';
import { callApi } from 'lib/tritiumApi';
import contactIcon from 'icons/address-book.svg';

function useAddressLabel(address) {
  const [name, setName] = useState(null);
  const contact = lookupAddress(address);
  useEffect(() => {
    if (!address) {
      setName(null);
      return;
    }
    if (!contact) {
      // If address is not saved in address book, look up its name
      callApi('names/reverse/lookup', { address })
        .then(({ name }) => setName(name))
        .catch((err) => {
          console.error('lookup address', err);
        });
    } else if (name) {
      // If address is in address book, display contact name so reset name state to null
      setName(null);
      // If name is already null, no need to do anything
    }
  }, [address]);

  if (contact) {
    return (
      <span>
        <Icon icon={contactIcon} className="mr0_4" />
        <span className="v-align">
          {contact.name}
          {contact.label ? ` - ${contact.label}` : ''}
        </span>
      </span>
    );
  } else {
    return name;
  }
}

export default function RecipientAddress({ address }) {
  const label = useAddressLabel(address);

  return !!address && <NexusAddress label={label} address={address} />;
}
