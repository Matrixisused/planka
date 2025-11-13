/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Header, Icon, Loader, Message, Segment } from 'semantic-ui-react';
import api from '../../api';

import styles from './PublicBoard.module.scss';

const PublicBoard = React.memo(() => {
  const { token } = useParams();
  const [t] = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [boardData, setBoardData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await api.getPublicBoard(token);
        setBoardData(data);
      } catch (err) {
        setError(err.message || t('common.error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, t]);

  if (isLoading) {
    return (
      <Container className={styles.container}>
        <Loader active size="large">
          {t('common.loading')}
        </Loader>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className={styles.container}>
        <Message negative>
          <Message.Header>{t('common.error')}</Message.Header>
          <p>{error}</p>
        </Message>
      </Container>
    );
  }

  if (!boardData) {
    return null;
  }

  const { item: board, included } = boardData;

  // Filter lists to show only finite lists (not archive/trash) with cards
  const visibleLists = included.lists
    ? included.lists
        .filter((list) => {
          // Check if list has type property and is not infinite (archive/trash)
          const isFinite = list.type !== 'ARCHIVE' && list.type !== 'TRASH';
          // Check if list has cards
          const hasCards = included.cards.some((card) => card.listId === list.id);
          return isFinite && hasCards;
        })
        .sort((a, b) => a.position - b.position)
    : [];

  return (
    <div className={styles.wrapper}>
      <Container className={styles.container}>
        <Segment className={styles.header}>
          <Header as="h1" className={styles.boardTitle}>
            <Icon name="clipboard outline" />
            <Header.Content>
              {board.name}
              <Header.Subheader className={styles.subtitle}>
                {t('common.publicView')}
              </Header.Subheader>
            </Header.Content>
          </Header>
        </Segment>

        {visibleLists.length > 0 && (
          <div className={styles.lists}>
            {visibleLists.map((list) => {
              const listCards = included.cards.filter((card) => card.listId === list.id);
              return (
                <div key={list.id} className={styles.list}>
                  <Header as="h3" className={styles.listHeader}>
                    {list.name}
                  </Header>
                  <div className={styles.cards}>
                    {listCards.map((card) => (
                        <div key={card.id} className={styles.card}>
                          <Header as="h4" className={styles.cardTitle}>
                            {card.name}
                          </Header>
                          {card.description && (
                            <div className={styles.cardDescription}>{card.description}</div>
                          )}
                          {card.dueDate && (
                            <div className={styles.cardMeta}>
                              <Icon name="calendar outline" />
                              {new Date(card.dueDate).toLocaleDateString()}
                            </div>
                          )}
                          {included.taskLists &&
                            included.taskLists
                              .filter((tl) => tl.cardId === card.id)
                              .map((taskList) => {
                                const tasks = included.tasks.filter(
                                  (task) => task.taskListId === taskList.id,
                                );
                                if (tasks.length === 0) return null;
                                return (
                                  <div key={taskList.id} className={styles.taskList}>
                                    <Header as="h5" className={styles.taskListTitle}>
                                      {taskList.name}
                                    </Header>
                                    <ul>
                                      {tasks.map((task) => (
                                        <li key={task.id} className={styles.task}>
                                          <Icon
                                            name={
                                              task.isCompleted ? 'check square' : 'square outline'
                                            }
                                          />
                                          <span>{task.name}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                );
                              })}
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
});

export default PublicBoard;
