import type {
    AdapterFilters,
    AdapterSort,
    DerivedAPI,
    IndexerAPI }            from '../common/index.js';

import type { DataHost }    from './data.js';

/**
 * Defines the shape of derived reducers constructor functions.
 */
export interface IDerivedReducerCtor<T>
{
    new (hostData: DataHost<any>, parentIndex: IndexerAPI<any, T>, options: object): IDerivedReducer<any, any, T>;
}

/**
 * Defines the interface for all derived reducers.
 */
export interface IDerivedReducer<D, K, T>
{
    /**
     * Returns the internal data of this instance. Be careful!
     *
     * Note: if an array is set as initial data then that array is used as the internal data. If any changes are
     * performed to the data externally do invoke {@link index.update} with `true` to recalculate the index and notify
     * all subscribers.
     *
     * @returns The internal data.
     */
    get data(): D | null;

    /**
     * @returns Derived public API.
     */
    get derived(): DerivedAPI<D, K, T>

    /**
     * @returns The filters adapter.
     */
    get filters(): AdapterFilters<T>;

    /**
     * @returns Returns the Indexer public API.
     */
    get index(): IndexerAPI<K, T>;

    /**
     * Returns whether this derived reducer is destroyed.
     */
    get destroyed(): boolean;

    /**
     * @returns Main data / items length or indexed length.
     */
    get length(): number;

    /**
     * @returns Gets current reversed state.
     */
    get reversed(): boolean;

    /**
     * @returns The sort adapter.
     */
    get sort(): AdapterSort<T>;

    /**
     * Sets reversed state and notifies subscribers.
     *
     * @param reversed - New reversed state.
     */
    set reversed(reversed: boolean);

    /**
     * Removes all derived reducers, subscriptions, and cleans up all resources.
     */
    destroy();

    /**
     * Subscribe to this IDerivedReducer.
     *
     * @param handler - Callback function that is invoked on update / changes. Receives derived reducer reference.
     *
     * @returns Unsubscribe function.
     */
    subscribe(handler: (value: IDerivedReducer<D, K, T>) => void): () => void;
}
