/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';
import { Input, Popup } from '../../lib/custom-ui';

import selectors from '../../selectors';
import { useField, useNestedRef } from '../../hooks';
import UserAvatar from '../users/UserAvatar';

import styles from './CardMembershipsStep.module.scss';

const CardMembershipsStep = React.memo(
  ({ currentUserIds, onUserSelect, onUserDeselect, onBack }) => {
    const allUsers = useSelector(selectors.selectActiveUsers);
    const cardMemberships = useSelector(selectors.selectCardMembershipsForCurrentCard);
    const [t] = useTranslation();
    const [search, handleSearchChange] = useField('');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedRole, setSelectedRole] = useState('editor');
    const [canComment, setCanComment] = useState(false);

    // Combine currentUserIds with cardMembership userIds
    const allMemberUserIds = useMemo(() => {
      const membershipUserIds = cardMemberships.map(cm => cm.userId);
      return [...new Set([...currentUserIds, ...membershipUserIds])];
    }, [currentUserIds, cardMemberships]);

    const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);

    const filteredUsers = useMemo(
      () =>
        allUsers.filter(
          (user) =>
            !allMemberUserIds.includes(user.id) &&
            (user.name.toLowerCase().includes(cleanSearch) ||
              (user.username && user.username.includes(cleanSearch)) ||
              (user.email && user.email.toLowerCase().includes(cleanSearch))),
        ),
      [allUsers, allMemberUserIds, cleanSearch],
    );

    const [searchFieldRef, handleSearchFieldRef] = useNestedRef('inputRef');

    const handleUserClick = useCallback((userId) => {
      setSelectedUserId(userId);
    }, []);

    const handleRoleChange = useCallback((e, { value }) => {
      setSelectedRole(value);
      if (value === 'editor') {
        setCanComment(false);
      }
    }, []);

    const handleCanCommentChange = useCallback((e, { checked }) => {
      setCanComment(checked);
    }, []);

    const handleAddClick = useCallback(
      (e) => {
        e.preventDefault();
        if (selectedUserId) {
          onUserSelect(selectedUserId, {
            role: selectedRole,
            canComment: selectedRole === 'viewer' ? canComment : undefined,
          });
          setSelectedUserId(null);
          setSelectedRole('editor');
          setCanComment(false);
        }
      },
      [selectedUserId, selectedRole, canComment, onUserSelect],
    );

    const handleRemoveClick = useCallback(
      (e, userId) => {
        e.stopPropagation();
        onUserDeselect(userId);
      },
      [onUserDeselect],
    );

    const currentUsers = useMemo(
      () => allUsers.filter((user) => allMemberUserIds.includes(user.id)),
      [allUsers, allMemberUserIds],
    );

    return (
      <>
        <Popup.Header onBack={onBack}>
          {t('common.members', {
            context: 'title',
          })}
        </Popup.Header>
        <Popup.Content>
          {currentUsers.length > 0 && (
            <div className={styles.currentMembers}>
              <div className={styles.subtitle}>{t('common.currentMembers')}</div>
              {currentUsers.map((user) => (
                <div key={user.id} className={styles.userItem}>
                  <UserAvatar id={user.id} size="small" />
                  <span className={styles.userName}>{user.name}</span>
                  <Button
                    size="mini"
                    basic
                    icon="close"
                    className={styles.removeButton}
                    onClick={(e) => handleRemoveClick(e, user.id)}
                  />
                </div>
              ))}
            </div>
          )}

          <div className={styles.subtitle}>{t('common.addMember', { context: 'title' })}</div>
          <Input
            fluid
            ref={handleSearchFieldRef}
            value={search}
            placeholder={t('common.searchUsers')}
            maxLength={128}
            icon="search"
            onChange={handleSearchChange}
            className={styles.searchInput}
          />

          {selectedUserId ? (
            <div className={styles.roleSelection}>
              <div className={styles.selectedUser}>
                <UserAvatar id={selectedUserId} size="small" />
                <span className={styles.userName}>
                  {allUsers.find((u) => u.id === selectedUserId)?.name}
                </span>
              </div>

              <div>
                <Form.Field>
                  <label>{t('common.role')}</label>
                  <Form.Select
                    fluid
                    value={selectedRole}
                    options={[
                      { key: 'editor', text: t('common.editor'), value: 'editor' },
                      { key: 'viewer', text: t('common.viewer'), value: 'viewer' },
                    ]}
                    onChange={handleRoleChange}
                  />
                </Form.Field>

                {selectedRole === 'viewer' && (
                  <Form.Field>
                    <Form.Checkbox
                      label={t('common.canComment')}
                      checked={canComment}
                      onChange={handleCanCommentChange}
                    />
                  </Form.Field>
                )}

                <Button positive fluid onClick={handleAddClick}>
                  {t('action.addMember')}
                </Button>
                <Button basic fluid onClick={() => setSelectedUserId(null)}>
                  {t('action.cancel')}
                </Button>
              </div>
            </div>
          ) : (
            filteredUsers.length > 0 && (
              <div className={styles.users}>
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={styles.userItem}
                    onClick={() => handleUserClick(user.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <UserAvatar id={user.id} size="small" />
                    <span className={styles.userName}>{user.name}</span>
                    {user.email && <span className={styles.userEmail}>({user.email})</span>}
                  </div>
                ))}
              </div>
            )
          )}
        </Popup.Content>
      </>
    );
  },
);

CardMembershipsStep.propTypes = {
  currentUserIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onUserSelect: PropTypes.func.isRequired,
  onUserDeselect: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

CardMembershipsStep.defaultProps = {
  onBack: undefined,
};

export default CardMembershipsStep;
