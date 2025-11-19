/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';
import { Input, Popup } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useForm, useNestedRef } from '../../../hooks';

import styles from './EditPriorityStep.module.scss';

const EditPriorityStep = React.memo(({ cardId, onBack, onClose }) => {
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);

  const defaultValue = useSelector((state) => selectCardById(state, cardId).priority);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [data, handleFieldChange] = useForm(() => ({
    priority: defaultValue !== null && defaultValue !== undefined ? String(defaultValue) : '',
  }));

  const [priorityFieldRef, handlePriorityFieldRef] = useNestedRef('inputRef');

  const handleSubmit = useCallback(() => {
    const priorityValue = data.priority.trim();

    let priority = null;
    if (priorityValue) {
      priority = parseInt(priorityValue, 10);

      if (Number.isNaN(priority) || priority < 0 || priority > 100) {
        priorityFieldRef.current.select();
        return;
      }
    }

    if (priority !== defaultValue) {
      dispatch(
        entryActions.updateCard(cardId, {
          priority,
        }),
      );
    }

    onClose();
  }, [cardId, onClose, defaultValue, dispatch, data, priorityFieldRef]);

  const handleClearClick = useCallback(() => {
    if (defaultValue !== null && defaultValue !== undefined) {
      dispatch(
        entryActions.updateCard(cardId, {
          priority: null,
        }),
      );
    }

    onClose();
  }, [cardId, onClose, defaultValue, dispatch]);

  useEffect(() => {
    priorityFieldRef.current.select();
  }, [priorityFieldRef]);

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.editPriority', {
          defaultValue: 'Редактировать приоритет',
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.fieldWrapper}>
            <div className={styles.fieldBox}>
              <div className={styles.text}>
                {t('common.priority', {
                  defaultValue: 'Приоритет',
                })}
                <span className={styles.hint}>
                  {' '}(0-100)
                </span>
              </div>
              <Input
                ref={handlePriorityFieldRef}
                name="priority"
                type="number"
                min="0"
                max="100"
                value={data.priority}
                maxLength={3}
                onChange={handleFieldChange}
                placeholder="0-100"
              />
            </div>
          </div>
          <Button positive content={t('action.save')} />
        </Form>
        <Button
          negative
          content={t('action.remove')}
          className={styles.deleteButton}
          onClick={handleClearClick}
        />
      </Popup.Content>
    </>
  );
});

EditPriorityStep.propTypes = {
  cardId: PropTypes.string.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

EditPriorityStep.defaultProps = {
  onBack: undefined,
};

export default EditPriorityStep;
