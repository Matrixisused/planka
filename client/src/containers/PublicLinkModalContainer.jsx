/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PublicLinkModal from '../components/PublicLinkModal';
import entryActions from '../entry-actions';
import selectors from '../selectors';
import publicTokensSelectors from '../selectors/public-tokens';

const PublicLinkModalContainer = React.memo(() => {
  const dispatch = useDispatch();
  const modal = useSelector(selectors.selectCurrentModal);
  const boardId = modal?.params?.boardId;
  const listId = modal?.params?.listId;
  const cardId = modal?.params?.cardId;

  // Get existing token from ORM
  const publicToken = useSelector((state) => {
    if (boardId) {
      return publicTokensSelectors.selectPublicTokenForBoard(state, boardId);
    }
    if (listId) {
      return publicTokensSelectors.selectPublicTokenForList(state, listId);
    }
    if (cardId) {
      return publicTokensSelectors.selectPublicTokenForCard(state, cardId);
    }
    return null;
  });

  const handleCreate = useCallback(() => {
    if (boardId) {
      dispatch(entryActions.createPublicTokenForCurrentBoard());
    } else if (listId) {
      dispatch(entryActions.createPublicTokenForCurrentList(listId));
    } else if (cardId) {
      dispatch(entryActions.createPublicTokenForCurrentCard(cardId));
    }
  }, [dispatch, boardId, listId, cardId]);

  const handleDelete = useCallback(() => {
    if (boardId) {
      dispatch(entryActions.deletePublicTokenForCurrentBoard());
    } else if (listId) {
      dispatch(entryActions.deletePublicTokenForCurrentList(listId));
    } else if (cardId) {
      dispatch(entryActions.deletePublicTokenForCurrentCard(cardId));
    }
  }, [dispatch, boardId, listId, cardId]);

  const handleClose = useCallback(() => {
    dispatch(entryActions.closeModal());
  }, [dispatch]);

  return (
    <PublicLinkModal
      boardId={boardId}
      listId={listId}
      cardId={cardId}
      publicToken={publicToken}
      onCreate={handleCreate}
      onDelete={handleDelete}
      onClose={handleClose}
    />
  );
});

export default PublicLinkModalContainer;
