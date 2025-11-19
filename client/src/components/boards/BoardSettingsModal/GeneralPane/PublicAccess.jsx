/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form, Icon, Input, Message, Segment } from 'semantic-ui-react';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import publicTokensSelectors from '../../../../selectors/public-tokens';

import styles from './PublicAccess.module.scss';

const PublicAccess = React.memo(() => {
  const selectBoardById = useMemo(() => selectors.makeSelectBoardById(), []);

  const boardId = useSelector((state) => selectors.selectCurrentModal(state).params.id);
  const board = useSelector((state) => selectBoardById(state, boardId));
  const publicToken = useSelector((state) =>
    publicTokensSelectors.selectPublicTokenForBoard(state, boardId),
  );

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const handleCreate = useCallback(() => {
    dispatch(entryActions.createPublicTokenForCurrentBoard());
  }, [dispatch]);

  const handleDelete = useCallback(() => {
    dispatch(entryActions.deletePublicTokenForCurrentBoard());
  }, [dispatch]);

  const handleCopyLink = useCallback(() => {
    if (publicToken) {
      const url = `${window.location.origin}/public/${publicToken.token}`;
      navigator.clipboard.writeText(url);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    }
  }, [publicToken]);

  const publicUrl = publicToken
    ? `${window.location.origin}/public/${publicToken.token}`
    : null;

  return (
    <Segment basic>
      <div className={styles.section}>
        <h4 className={styles.title}>{t('common.publicAccess', { context: 'title' })}</h4>
        {!publicToken ? (
          <>
            <p className={styles.description}>{t('common.publicAccessDescription')}</p>
            <Button
              primary
              onClick={handleCreate}
              icon
              labelPosition="left"
              className={styles.button}
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
              <Message positive size="small" className={styles.message}>
                <Icon name="check" />
                {t('common.copiedToClipboard')}
              </Message>
            )}
            <Message warning size="small" className={styles.message}>
              <Icon name="warning sign" />
              {t('common.publicLinkWarning')}
            </Message>
            <Button
              negative
              onClick={handleDelete}
              icon
              labelPosition="left"
              className={styles.button}
            >
              <Icon name="trash" />
              {t('action.deletePublicLink')}
            </Button>
          </>
        )}
      </div>
    </Segment>
  );
});

export default PublicAccess;
