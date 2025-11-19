/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Loader, Button, Icon } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import Card from '../Card';
import MentionedCardDetails from './MentionedCardDetails';
import { log } from '../../../utils/logger';

import styles from './MentionedCards.module.scss';

const MentionedCards = () => {
  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [showDetails, setShowDetails] = useState(true);

  const cardIds = useSelector(selectors.selectMentionedCardIds);
  const isFetching = useSelector(selectors.selectIsMentionedCardsFetching);
  const isInitializing = useSelector(selectors.selectIsInitializing);
  const accessToken = useSelector(selectors.selectAccessToken);

  const handleToggleDetails = useCallback(() => {
    setShowDetails((prev) => !prev);
  }, []);

  useEffect(() => {
    log('MentionedCards', 'useEffect: isInitializing', isInitializing, 'accessToken', !!accessToken);
    if (!isInitializing && accessToken) {
      log('MentionedCards', 'useEffect: dispatching fetchMentionedCards');
      dispatch(entryActions.fetchMentionedCards());
    } else {
      log('MentionedCards', 'useEffect: skipping fetch, isInitializing:', isInitializing, 'accessToken:', !!accessToken);
    }
  }, [dispatch, isInitializing, accessToken]);

  if (isFetching) {
    return (
      <div className={styles.wrapper}>
        <Loader active size="huge" />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('common.mentionedCards', { defaultValue: 'Карточки с упоминаниями' })}</h1>
        <Button
          icon
          onClick={handleToggleDetails}
          className={styles.toggleButton}
          title={showDetails ? 'Скрыть подробности' : 'Показать подробности'}
        >
          <Icon name={showDetails ? 'chevron up' : 'chevron down'} />
        </Button>
      </div>
      <div className={styles.cards}>
        {cardIds.length === 0 ? (
          <div className={styles.empty}>
            {t('common.noMentionedCards', { defaultValue: 'Нет карточек с упоминаниями' })}
          </div>
        ) : (
          cardIds.map((cardId) => (
            <div key={cardId} className={styles.card}>
              <Card isInline id={cardId}>
                {showDetails && <MentionedCardDetails key={`${cardId}-${showDetails}`} cardId={cardId} />}
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MentionedCards;
