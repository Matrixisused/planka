/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  TOKEN_NOT_FOUND: {
    tokenNotFound: 'Public token not found',
  },
  TOKEN_EXPIRED: {
    tokenExpired: 'Public token has expired',
  },
  TOKEN_INACTIVE: {
    tokenInactive: 'Public token is inactive',
  },
  FILE_ATTACHMENT_NOT_FOUND: {
    fileAttachmentNotFound: 'File attachment not found',
  },
};

const INLINE_MIME_TYPES_SET = new Set([
  'application/pdf',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/opus',
  'audio/mp4',
  'audio/x-aac',
  'video/mp4',
  'video/ogg',
  'video/webm',
]);

module.exports = {
  inputs: {
    token: {
      type: 'string',
      required: true,
    },
    id: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    tokenNotFound: {
      responseType: 'notFound',
    },
    tokenExpired: {
      responseType: 'forbidden',
    },
    tokenInactive: {
      responseType: 'forbidden',
    },
    fileAttachmentNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs, exits) {
    const publicAccessToken = await PublicAccessToken.qm.getOneByToken(inputs.token);

    if (!publicAccessToken) {
      throw Errors.TOKEN_NOT_FOUND;
    }

    if (!publicAccessToken.isActive) {
      throw Errors.TOKEN_INACTIVE;
    }

    if (publicAccessToken.expiresAt && new Date(publicAccessToken.expiresAt) < new Date()) {
      throw Errors.TOKEN_EXPIRED;
    }

    const { attachment, board } = await sails.helpers.attachments
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.FILE_ATTACHMENT_NOT_FOUND);

    if (attachment.type !== Attachment.Types.FILE) {
      throw Errors.FILE_ATTACHMENT_NOT_FOUND;
    }

    // Verify that the attachment belongs to a board accessible via this token
    let boardId;
    if (publicAccessToken.boardId) {
      boardId = publicAccessToken.boardId;
    } else if (publicAccessToken.listId) {
      const list = await List.qm.getOneById(publicAccessToken.listId);
      if (list) {
        boardId = list.boardId;
      }
    } else if (publicAccessToken.cardId) {
      const card = await Card.qm.getOneById(publicAccessToken.cardId);
      if (card) {
        boardId = card.boardId;
      }
    }

    if (!boardId) {
      throw Errors.FILE_ATTACHMENT_NOT_FOUND;
    }

    if (boardId !== board.id) {
      throw Errors.FILE_ATTACHMENT_NOT_FOUND;
    }

    // Verify that the attachment belongs to a card accessible via this token
    if (publicAccessToken.cardId && attachment.cardId !== publicAccessToken.cardId) {
      throw Errors.FILE_ATTACHMENT_NOT_FOUND;
    }

    if (publicAccessToken.listId) {
      const card = await Card.qm.getOneById(attachment.cardId);
      if (!card || card.listId !== publicAccessToken.listId) {
        throw Errors.FILE_ATTACHMENT_NOT_FOUND;
      }
    }

    const fileManager = sails.hooks['file-manager'].getInstance();

    let readStream;
    try {
      readStream = await fileManager.read(
        `${sails.config.custom.attachmentsPathSegment}/${attachment.data.uploadedFileId}/${attachment.data.filename}`,
      );
    } catch (error) {
      throw Errors.FILE_ATTACHMENT_NOT_FOUND;
    }

    if (attachment.data.mimeType) {
      this.res.type(attachment.data.mimeType);
    }
    if (!INLINE_MIME_TYPES_SET.has(attachment.data.mimeType) && !attachment.data.image) {
      this.res.set('Content-Disposition', 'attachment');
    }
    this.res.set('Cache-Control', 'private, max-age=86400, no-transform');

    return exits.success(readStream);
  },
};
