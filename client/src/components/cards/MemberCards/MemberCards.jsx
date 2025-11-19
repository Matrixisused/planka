/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Loader } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import Card from '../Card';

import styles from './MemberCards.module.scss';

const MemberCards = React.memo(() => {
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const cardIds = useSelector(selectors.selectMemberCardIds);
  const isFetching = useSelector(selectors.selectIsMemberCardsFetching);

  useEffect(() => {
    dispatch(entryActions.fetchMemberCards());
  }, [dispatch]);

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
        <h1 className={styles.title}>{t('common.memberCards', { defaultValue: 'Мои карточки' })}</h1>
      </div>
      <div className={styles.cards}>
        {cardIds.length === 0 ? (
          <div className={styles.empty}>
            {t('common.noMemberCards', { defaultValue: 'Нет карточек, где вы участник' })}
          </div>
        ) : (
          cardIds.map((cardId) => (
            <div key={cardId} className={styles.card}>
              <Card isInline id={cardId} />
            </div>
          ))
        )}
      </div>
    </div>
  );
});

export default MemberCards;
