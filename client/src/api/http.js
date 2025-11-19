/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import Config from '../constants/Config';

const http = {};

// TODO: add all methods
['GET', 'POST', 'PATCH', 'DELETE'].forEach((method) => {
  http[method.toLowerCase()] = (url, data, headers) => {
    let body;
    let requestHeaders = headers || {};

    if (data) {
      if (method === 'PATCH') {
        // For PATCH, send JSON if data is an object
        if (data instanceof FormData) {
          body = data;
        } else {
          body = JSON.stringify(data);
          requestHeaders = {
            ...requestHeaders,
            'Content-Type': 'application/json',
          };
        }
      } else {
        // For other methods, use FormData
        if (data instanceof FormData) {
          body = data;
        } else {
          body = Object.keys(data).reduce((result, key) => {
            result.append(key, data[key]);
            return result;
          }, new FormData());
        }
      }
    }

    return fetch(`${Config.SERVER_BASE_URL}/api${url}`, {
      method,
      headers: requestHeaders,
      body,
      credentials: 'include',
    })
      .then((response) =>
        response.json().then((responseBody) => ({
          body: responseBody,
          isError: response.status !== 200,
        })),
      )
      .then(({ body: responseBody, isError }) => {
        if (isError) {
          throw responseBody;
        }

        return responseBody;
      });
  };
});

export default http;
