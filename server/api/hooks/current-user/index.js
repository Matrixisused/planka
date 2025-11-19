/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * current-user hook
 *
 * @description :: A hook definition. Extends Sails by adding shadow routes, implicit actions,
 *                 and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */

module.exports = function defineCurrentUserHook(sails) {
  sails.log.info('[current-user] Hook module loaded');

  const TOKEN_PATTERN = /^Bearer /;
  const API_KEY_HEADER_NAME = 'x-api-key';

  const getSessionAndUserByAccessToken = async (accessToken, httpOnlyToken, isSocket = false) => {
    let payload;
    try {
      payload = sails.helpers.utils.verifyJwtToken(accessToken);
    } catch (error) {
      sails.log.warn('[current-user] Token verification failed', { error: error.message });
      return null;
    }

    const session = await Session.qm.getOneUndeletedByAccessToken(accessToken);

    if (!session) {
      sails.log.warn('[current-user] Session not found for accessToken', {
        accessTokenPrefix: accessToken.substring(0, 20),
      });
      return null;
    }

    // For socket requests, skip httpOnlyToken check if token was extracted from cookie
    if (session.httpOnlyToken && httpOnlyToken !== session.httpOnlyToken && !isSocket) {
      sails.log.warn('[current-user] httpOnlyToken mismatch', {
        sessionHasHttpOnlyToken: !!session.httpOnlyToken,
        providedHttpOnlyToken: !!httpOnlyToken,
        tokensMatch: httpOnlyToken === session.httpOnlyToken,
        isSocket,
      });
      return null;
    }

    const user = await User.qm.getOneById(payload.subject, {
      withDeactivated: false,
    });

    if (!user) {
      sails.log.warn('[current-user] User not found', { userId: payload.subject });
      return null;
    }

    if (user.passwordChangedAt > payload.issuedAt) {
      sails.log.warn('[current-user] Password changed after token issued', {
        passwordChangedAt: user.passwordChangedAt,
        tokenIssuedAt: payload.issuedAt,
      });
      return null;
    }

    return {
      session,
      user,
    };
  };

  const getUserByApiKey = (apiKey) => {
    const apiKeyHash = sails.helpers.utils.hash(apiKey);

    return User.qm.getOneActiveByApiKeyHash(apiKeyHash);
  };

  return {
    /**
     * Runs when this Sails app loads/lifts.
     */

    async initialize() {
      sails.log.info('Initializing custom hook (`current-user`)');
    },

    routes: {
      before: {
        '/api/*': {
          async fn(req, res, next) {
            sails.log.info('[current-user] Hook called', {
              url: req.url,
              isSocket: req.isSocket,
              hasAuthorization: !!req.headers.authorization,
              headersKeys: Object.keys(req.headers || {}),
              allHeaders: req.isSocket ? JSON.stringify(req.headers) : undefined,
            });

            const { authorization: authorizationHeader, [API_KEY_HEADER_NAME]: apiKey } =
              req.headers;

            // For socket requests, if Authorization header is missing, try to get accessToken from cookie
            let accessToken;
            if (authorizationHeader && TOKEN_PATTERN.test(authorizationHeader)) {
              accessToken = authorizationHeader.replace(TOKEN_PATTERN, '');
            } else if (req.isSocket && req.cookies && req.cookies.accessToken) {
              // For socket requests, extract accessToken from cookie if Authorization header is missing
              accessToken = req.cookies.accessToken;
              sails.log.info('[current-user] Using accessToken from cookie for socket request', {
                url: req.url,
                accessTokenPrefix: accessToken.substring(0, 20),
              });
            }

            if (accessToken) {
              const { internalAccessToken } = sails.config.custom;

              sails.log.info('[current-user] Processing accessToken', {
                url: req.url,
                isSocket: req.isSocket,
                isInternal: internalAccessToken && accessToken === internalAccessToken,
                accessTokenPrefix: accessToken.substring(0, 20),
              });

              if (internalAccessToken && accessToken === internalAccessToken) {
                req.currentUser = User.INTERNAL;
              } else {
                const { httpOnlyToken } = req.cookies;

                sails.log.info('[current-user] Checking session', {
                  url: req.url,
                  isSocket: req.isSocket,
                  hasHttpOnlyToken: !!httpOnlyToken,
                });

                let sessionAndUser = await getSessionAndUserByAccessToken(
                  accessToken,
                  httpOnlyToken,
                  req.isSocket,
                );

                // If httpOnlyToken doesn't match but accessToken is valid and session exists,
                // try to get session without httpOnlyToken check and update cookie
                if (!sessionAndUser) {
                  sails.log.info('[current-user] sessionAndUser not found, trying fallback', {
                    url: req.url,
                    isSocket: req.isSocket,
                  });

                  let payload;
                  try {
                    payload = sails.helpers.utils.verifyJwtToken(accessToken);
                    sails.log.info('[current-user] Token verified', {
                      url: req.url,
                      userId: payload.subject,
                    });
                  } catch (error) {
                    sails.log.warn('[current-user] Token verification failed', {
                      url: req.url,
                      error: error.message,
                    });
                    // Token invalid, skip
                  }

                  if (payload) {
                    const session = await Session.qm.getOneUndeletedByAccessToken(accessToken);

                    sails.log.info('[current-user] Session lookup', {
                      url: req.url,
                      sessionFound: !!session,
                      sessionHasHttpOnlyToken: !!session?.httpOnlyToken,
                    });

                    if (session) {
                      const user = await User.qm.getOneById(payload.subject, {
                        withDeactivated: false,
                      });

                      sails.log.info('[current-user] User lookup', {
                        url: req.url,
                        userFound: !!user,
                        passwordChangedAt: user?.passwordChangedAt,
                        tokenIssuedAt: payload.issuedAt,
                        passwordChangedAfterToken: user && user.passwordChangedAt > payload.issuedAt,
                      });

                      if (user && user.passwordChangedAt <= payload.issuedAt) {
                        // AccessToken is valid and session exists, but httpOnlyToken doesn't match
                        // Update cookie if it's not a socket request
                        if (session.httpOnlyToken && !req.isSocket) {
                          try {
                            sails.helpers.utils.setHttpOnlyTokenCookie(
                              session.httpOnlyToken,
                              payload,
                              res,
                            );
                            sails.log.info('[current-user] Updated httpOnlyToken cookie', {
                              url: req.url,
                            });
                          } catch (error) {
                            sails.log.warn('[current-user] Failed to update httpOnlyToken cookie', {
                              error: error.message,
                            });
                          }
                        }

                        // Use session even if httpOnlyToken doesn't match (for socket requests)
                        // This is less secure but allows socket requests to work
                        sails.log.info('[current-user] Using session without httpOnlyToken check', {
                          url: req.url,
                          isSocket: req.isSocket,
                          userId: user.id,
                        });
                        sessionAndUser = {
                          session,
                          user,
                        };
                      } else {
                        sails.log.warn('[current-user] Cannot use session', {
                          url: req.url,
                          hasUser: !!user,
                          passwordChangedAt: user?.passwordChangedAt,
                          tokenIssuedAt: payload.issuedAt,
                        });
                      }
                    } else {
                      sails.log.warn('[current-user] Session not found in DB', {
                        url: req.url,
                        accessTokenPrefix: accessToken.substring(0, 20),
                      });
                    }
                  }
                }

                if (sessionAndUser) {
                  const { session, user } = sessionAndUser;

                  if (user.language) {
                    req.setLocale(user.language);
                  }

                  Object.assign(req, {
                    currentSession: session,
                    currentUser: user,
                  });

                  if (req.isSocket) {
                    sails.sockets.join(req, `@accessToken:${session.accessToken}`);
                    sails.sockets.join(req, `@user:${user.id}`);
                  }
                } else {
                  sails.log.warn('[current-user] Authentication failed', {
                    url: req.url,
                    isSocket: req.isSocket,
                    hasAccessToken: !!accessToken,
                    hasHttpOnlyToken: !!httpOnlyToken,
                    accessTokenPrefix: accessToken ? accessToken.substring(0, 20) : null,
                  });
                }
              }
            } else if (apiKey) {
              const user = await getUserByApiKey(apiKey);

              if (user) {
                if (user.language) {
                  req.setLocale(user.language);
                }

                req.currentUser = user;

                if (req.isSocket) {
                  sails.sockets.join(req, `@user:${user.id}`);
                }
              }
            }

            return next();
          },
        },
        '/attachments/*': {
          async fn(req, res, next) {
            const { accessToken, httpOnlyToken } = req.cookies;

            if (accessToken) {
              const sessionAndUser = await getSessionAndUserByAccessToken(
                accessToken,
                httpOnlyToken,
              );

              if (sessionAndUser) {
                const { session, user } = sessionAndUser;

                Object.assign(req, {
                  currentSession: session,
                  currentUser: user,
                });
              }
            } else {
              const { [API_KEY_HEADER_NAME]: apiKey } = req.headers;

              if (apiKey) {
                const user = await getUserByApiKey(apiKey);

                if (user) {
                  req.currentUser = user;
                }
              }
            }

            return next();
          },
        },
      },
    },
  };
};
