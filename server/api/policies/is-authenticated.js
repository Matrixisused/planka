/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const TOKEN_PATTERN = /^Bearer /;

const getSessionAndUserByAccessToken = async (accessToken, httpOnlyToken, isSocket = false) => {
  let payload;
  try {
    payload = sails.helpers.utils.verifyJwtToken(accessToken);
  } catch (error) {
    return null;
  }

  const session = await Session.qm.getOneUndeletedByAccessToken(accessToken);

  if (!session) {
    return null;
  }

  // For socket requests, skip httpOnlyToken check if session exists
  if (session.httpOnlyToken && httpOnlyToken !== session.httpOnlyToken && !isSocket) {
    return null;
  }

  const user = await User.qm.getOneById(payload.subject, {
    withDeactivated: false,
  });

  if (!user) {
    return null;
  }

  if (user.passwordChangedAt > payload.issuedAt) {
    return null;
  }

  return {
    session,
    user,
  };
};

module.exports = async function isAuthenticated(req, res, proceed) {
  sails.log.info('[is-authenticated] Policy check', {
    url: req.url,
    isSocket: req.isSocket,
    hasCurrentUser: !!req.currentUser,
    userId: req.currentUser?.id,
  });

  // If currentUser is not set (e.g., for socket requests), try to set it
  if (!req.currentUser && req.isSocket) {
    const { authorization: authorizationHeader } = req.headers;

    if (authorizationHeader && TOKEN_PATTERN.test(authorizationHeader)) {
      const accessToken = authorizationHeader.replace(TOKEN_PATTERN, '');
      const { httpOnlyToken } = req.cookies;

      sails.log.info('[is-authenticated] Trying to authenticate socket request', {
        url: req.url,
        hasHttpOnlyToken: !!httpOnlyToken,
      });

      let sessionAndUser = await getSessionAndUserByAccessToken(accessToken, httpOnlyToken, true);

      // If httpOnlyToken doesn't match but accessToken is valid and session exists,
      // use session without httpOnlyToken check for socket requests
      if (!sessionAndUser) {
        let payload;
        try {
          payload = sails.helpers.utils.verifyJwtToken(accessToken);
        } catch {
          // Token invalid, skip
        }

        if (payload) {
          const session = await Session.qm.getOneUndeletedByAccessToken(accessToken);

          if (session) {
            const user = await User.qm.getOneById(payload.subject, {
              withDeactivated: false,
            });

            if (user && user.passwordChangedAt <= payload.issuedAt) {
              sails.log.info('[is-authenticated] Using session without httpOnlyToken check for socket', {
                url: req.url,
                userId: user.id,
              });
              sessionAndUser = {
                session,
                user,
              };
            }
          }
        }
      }

      if (sessionAndUser) {
        const { session, user } = sessionAndUser;

        Object.assign(req, {
          currentSession: session,
          currentUser: user,
        });

        sails.log.info('[is-authenticated] currentUser set for socket request', {
          url: req.url,
          userId: user.id,
        });
      }
    }
  }

  if (!req.currentUser) {
    sails.log.warn('[is-authenticated] No currentUser, returning unauthorized', {
      url: req.url,
      isSocket: req.isSocket,
    });
    // TODO: provide separate error for API keys?
    return res.unauthorized('Access token is missing, invalid or expired');
  }

  sails.log.info('[is-authenticated] User authenticated, proceeding', {
    url: req.url,
    userId: req.currentUser.id,
  });

  return proceed();
};
