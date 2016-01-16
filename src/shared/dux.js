/*
 (C) Copyright 2015 Hewlett Packard Enterprise Development LP

    Licensed under the Apache License, Version 2.0 (the "License"); you may
    not use this file except in compliance with the License. You may obtain
    a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
    License for the specific language governing permissions and limitations
    under the License.
*/

/*eslint no-console:0*/

export function mkFetchHandler(dispatch, failureType, successType) {
  return (error, result) => {
    if (error) {
      dispatch({ type: failureType, error });
    } else {
      dispatch({ type: successType, result });
    }
  };
}

export function mkFetchReducer(module, actions, specs) {

  const initialStore = {
    isFetching: false,
    lastUpdate: 0,
    lastError: null,
  };

  Object.getOwnPropertyNames(specs).forEach(k => {
    initialStore[k] = specs[k].initialValue;
  });

  function processProtectedParsers(result) {
    const store = {};
    Object.getOwnPropertyNames(specs).forEach(k => {
      try {
        store[k] = specs[k].protectedParser(result);
      } catch (e) {
        console.log(`DUX parsing failure in: ${module}, key: ${k}`);
        console.log(`Exception message: ${e.message}`);
      }
    });
    return store;
  }

  return (moduleStore = initialStore, action) => {
    switch (action.type) {

      case actions.FETCH_REQUEST:
        return { ...moduleStore, isFetching: true };

      case actions.FETCH_FAILURE:
        return { ...moduleStore, isFetching: false, lastError: action.error };

      case actions.FETCH_SUCCESS:
        const fetchedStore = processProtectedParsers(action.result);
        return {
          ...moduleStore,
          isFetching: false,
          lastError: null,
          lastUpdate: Date.now(),
          ...fetchedStore,
        };

      default:
        return moduleStore;
    }
  };
}
