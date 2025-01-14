import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

import Form from 'components/Form';
import ControlledModal from 'components/ControlledModal';
import FormField from 'components/FormField';
import Spinner from 'components/Spinner';
import { formSubmit, required } from 'lib/form';
import { confirmPin, openSuccessDialog } from 'lib/dialog';
import { loadNameRecords, selectUsername } from 'lib/user';
import { callApi } from 'lib/tritiumApi';
import { userIdRegex } from 'consts/misc';

__ = __context('TransferName');

const Prefix = styled.span(({ theme }) => ({
  color: theme.mixer(0.5),
}));

const Name = styled.span(({ theme }) => ({
  color: theme.foreground,
}));

const initialValues = {
  recipient: '',
};

export default function TransferNameModal({ nameRecord }) {
  const username = useSelector(selectUsername);
  return (
    <ControlledModal maxWidth={600}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>{__('Transfer name')}</ControlledModal.Header>
          <ControlledModal.Body>
            <Form
              name="transfer-name"
              initialValues={initialValues}
              onSubmit={formSubmit({
                submit: async ({ recipient }) => {
                  const pin = await confirmPin();

                  const params = { pin, address: nameRecord.address };
                  if (userIdRegex.test(recipient)) {
                    params.destination = recipient;
                  } else {
                    params.username = recipient;
                  }

                  if (pin) {
                    return await callApi('names/transfer/name', params);
                  }
                },
                onSuccess: async (result) => {
                  if (!result) return; // Submission was cancelled
                  loadNameRecords();
                  closeModal();
                  openSuccessDialog({
                    message: __('Name has been transferred'),
                  });
                },
                errorMessage: __('Error transferring name'),
              })}
            >
              <FormField label={__('Name')}>
                {nameRecord.global ? null : nameRecord.namespace ? (
                  <Prefix>{nameRecord.namespace + '::'}</Prefix>
                ) : (
                  <Prefix>{username + ':'}</Prefix>
                )}
                <Name>{nameRecord.name}</Name>
              </FormField>

              <FormField connectLabel label={__('Transfer to')}>
                <Form.TextField
                  name="recipient"
                  autoFocus
                  placeholder={__('Recipient username or user ID')}
                  validate={required()}
                />
              </FormField>

              <Form.SubmitButton skin="primary" wide uppercase className="mt3">
                {({ submitting }) =>
                  submitting ? (
                    <span>
                      <Spinner className="mr0_4" />
                      <span className="v-align">
                        {__('Transferring name')}...
                      </span>
                    </span>
                  ) : (
                    __('Transfer name')
                  )
                }
              </Form.SubmitButton>
            </Form>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
