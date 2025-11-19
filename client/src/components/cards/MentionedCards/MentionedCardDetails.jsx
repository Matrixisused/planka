/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { createSelector } from 'redux-orm';
import { createSelector as createReselectSelector } from 'reselect';

import selectors from '../../../selectors';
import orm from '../../../orm';
import TaskList from '../Card/TaskList';

import styles from './MentionedCardDetails.module.scss';

const makeSelectAttachmentIdsByCardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);
      if (!cardModel) {
        return [];
      }
      return cardModel.getAttachmentsQuerySet().toRefArray().map((attachment) => attachment.id);
    },
  );

const makeSelectTaskListIdsByCardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);
      if (!cardModel) {
        return [];
      }
      return cardModel.getTaskListsQuerySet().toRefArray().map((taskList) => taskList.id);
    },
  );

const MentionedCardDetails = React.memo(({ cardId }) => {
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);
  const selectTaskListIdsByCardId = useMemo(() => makeSelectTaskListIdsByCardId(), []);
  const selectAttachmentIdsByCardId = useMemo(() => makeSelectAttachmentIdsByCardId(), []);

  const card = useSelector((state) => selectCardById(state, cardId));
  const taskListIds = useSelector((state) => selectTaskListIdsByCardId(state, cardId));
  const attachmentIds = useSelector((state) => selectAttachmentIdsByCardId(state, cardId));

  if (!card) {
    return null;
  }

  const hasDetails = taskListIds.length > 0 || attachmentIds.length > 0;

  if (!hasDetails) {
    return null;
  }

  return (
    <div className={styles.details}>
      {taskListIds.map((taskListId) => (
        <div key={taskListId} className={styles.taskList}>
          <TaskList id={taskListId} />
        </div>
      ))}
      {attachmentIds.length > 0 && (
        <div className={styles.attachments}>
          <AttachmentsForCard attachmentIds={attachmentIds} />
        </div>
      )}
    </div>
  );
});

const AttachmentsForCard = React.memo(({ attachmentIds }) => {
  const selectAttachmentById = useMemo(() => selectors.makeSelectAttachmentById(), []);

  const selectAttachments = useMemo(
    () =>
      createReselectSelector(
        [(state) => state, () => attachmentIds],
        (state) => {
          if (!attachmentIds || attachmentIds.length === 0) {
            return [];
          }
          return attachmentIds.map((id) => selectAttachmentById(state, id)).filter(Boolean);
        },
      ),
    [attachmentIds, selectAttachmentById],
  );

  const attachments = useSelector(selectAttachments);

  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className={styles.attachmentsList}>
      {attachments.map((attachment) => (
        <AttachmentItem key={attachment.id} attachment={attachment} />
      ))}
    </div>
  );
});

AttachmentsForCard.propTypes = {
  attachmentIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const AttachmentItem = React.memo(({ attachment }) => {
  const handleClick = () => {
    if (attachment.type === 'FILE') {
      window.open(attachment.data.url, '_blank');
    } else if (attachment.type === 'LINK') {
      window.open(attachment.data.url, '_blank');
    }
  };

  return (
    <div className={styles.attachmentItem} onClick={handleClick}>
      <div className={styles.attachmentIcon}>
        {attachment.type === 'FILE' ? '📎' : '🔗'}
      </div>
      <div className={styles.attachmentName}>{attachment.name}</div>
    </div>
  );
});

AttachmentItem.propTypes = {
  attachment: PropTypes.object.isRequired,
};

MentionedCardDetails.propTypes = {
  cardId: PropTypes.string.isRequired,
};

export default MentionedCardDetails;
