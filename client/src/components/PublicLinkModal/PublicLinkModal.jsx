/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form, Icon, Input, Message, Modal } from 'semantic-ui-react';

const PublicLinkModal = React.memo(
  ({ boardId, listId, cardId, publicToken, onCreate, onDelete, onClose }) => {
    const [t] = useTranslation();
    const [copiedToClipboard, setCopiedToClipboard] = useState(false);

    const handleCreate = useCallback(() => {
      onCreate();
    }, [onCreate]);

    const handleDelete = useCallback(() => {
      onDelete();
    }, [onDelete]);

    const handleCopyLink = useCallback(() => {
      const url = `${window.location.origin}/public/${publicToken.token}`;
      navigator.clipboard.writeText(url);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    }, [publicToken]);

    const publicUrl = publicToken
      ? `${window.location.origin}/public/${publicToken.token}`
      : null;

    return (
      <Modal open onClose={onClose} size="small" closeIcon>
        <Modal.Header>{t('common.publicLink', { context: 'title' })}</Modal.Header>
        <Modal.Content>
          {!publicToken ? (
            <>
              <p>{t('common.publicLinkDescription')}</p>
              <Button
                primary
                onClick={handleCreate}
                icon
                labelPosition="left"
              >
                <Icon name="linkify" />
                {t('action.createPublicLink')}
              </Button>
            </>
          ) : (
            <>
              <Form>
                <Form.Field>
                  <label>{t('common.publicUrl')}</label>
                  <Input
                    fluid
                    readOnly
                    value={publicUrl}
                    action={{
                      color: 'teal',
                      labelPosition: 'right',
                      icon: 'copy',
                      content: t('action.copy'),
                      onClick: handleCopyLink,
                    }}
                  />
                </Form.Field>
              </Form>
              {copiedToClipboard && (
                <Message positive>
                  <Icon name="check" />
                  {t('common.copiedToClipboard')}
                </Message>
              )}
              <Message warning>
                <Icon name="warning sign" />
                {t('common.publicLinkWarning')}
              </Message>
              <Button
                negative
                onClick={handleDelete}
                icon
                labelPosition="left"
              >
                <Icon name="trash" />
                {t('action.deletePublicLink')}
              </Button>
            </>
          )}
        </Modal.Content>
      </Modal>
    );
  },
);

PublicLinkModal.propTypes = {
  boardId: PropTypes.string,
  listId: PropTypes.string,
  cardId: PropTypes.string,
  publicToken: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onCreate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

PublicLinkModal.defaultProps = {
  boardId: undefined,
  listId: undefined,
  cardId: undefined,
  publicToken: undefined,
};

export default PublicLinkModal;
