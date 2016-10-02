const { Promise, Immutable } = require('gitbook-core');
const { List } = Immutable;
const TYPES = require('./types');

/**
 * Start a search query
 * @param {String} q
 * @return {Action}
 */
function query(q) {
    return (dispatch, getState, { Navigation }) => {
        dispatch(Navigation.updateQuery({ q }));
    };
}


/**
 * Update results for a query
 * @param {String} q
 * @return {Action}
 */
function handleQuery(q) {
    if (!q) {
        return clear();
    }

    return (dispatch, getState, { Navigation }) => {
        const { handlers } = getState().search;
        dispatch({ type: TYPES.START, query: q });

        return Promise.reduce(
            handlers.toArray(),
            (results, handler) => {
                return Promise.resolve(handler(q))
                .then(handlerResults => results.concat(handlerResults));
            },
            List()
        )
        .then(
            results => {
                dispatch({ type: TYPES.END, query: q, results });
            }
        );
    };
}

/**
 * Clear the whole search
 * @return {Action}
 */
function clear() {
    return { type: TYPES.CLEAR };
}

/**
 * Register a search handler
 * @param {String} name
 * @param {Function} handler
 * @return {Action}
 */
function registerHandler(name, handler) {
    return { type: TYPES.REGISTER_HANDLER, name, handler };
}

/**
 * Unregister a search handler
 * @param {String} name
 * @return {Action}
 */
function unregisterHandler(name) {
    return { type: TYPES.UNREGISTER_HANDLER, name };
}

module.exports = {
    clear,
    query,
    handleQuery,
    registerHandler,
    unregisterHandler
};
