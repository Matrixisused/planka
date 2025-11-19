/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { usePopup } from '../../../../lib/popup';
import { push } from '../../../../lib/redux-router';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import Paths from '../../../../constants/Paths';
import { BoardContexts, BoardViews } from '../../../../constants/Enums';
import { BoardViewIcons } from '../../../../constants/Icons';
import ActionsStep from './ActionsStep';

import styles from './RightSide.module.scss';

const RightSide = React.memo(() => {
  const board = useSelector(selectors.selectCurrentBoard);

  const dispatch = useDispatch();

  const handleSelectViewClick = useCallback(
    ({ currentTarget: { value: view } }) => {
      dispatch(entryActions.updateViewInCurrentBoard(view));
    },
    [dispatch],
  );

  const handleMentionedCardsClick = useCallback(() => {
    dispatch(push(Paths.MENTIONED_CARDS));
  }, [dispatch]);

  const ActionsPopup = usePopup(ActionsStep);

  const views = [BoardViews.GRID, BoardViews.LIST];
  if (board.context === BoardContexts.BOARD) {
    views.unshift(BoardViews.KANBAN);
  }

  return (
    <>
      <div className={styles.action}>
        <button
          type="button"
          className={classNames(styles.button, styles.buttonMentioned)}
          onClick={handleMentionedCardsClick}
          title="Карточки с упоминаниями"
        >
          <Icon fitted name="at" />
        </button>
      </div>
      <div className={styles.action}>
        <div className={styles.buttonGroup}>
          {views.map((view) => (
            <button
              key={view}
              type="button"
              value={view}
              disabled={view === board.view}
              className={styles.button}
              onClick={handleSelectViewClick}
            >
              <Icon fitted name={BoardViewIcons[view]} />
            </button>
          ))}
        </div>
      </div>
      <div className={styles.action}>
        <ActionsPopup>
          <button type="button" className={styles.button}>
            <Icon fitted name="ellipsis vertical" />
          </button>
        </ActionsPopup>
      </div>
    </>
  );
});

export default RightSide;
