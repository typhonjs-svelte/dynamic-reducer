import type {
    DerivedAPI,
    IndexerAPI }                from '../common';

import type {
    IDynAdapterFilters,
    IDynAdapterSort,

    DynArrayData,
    DynMapData,
    DynDataHost,
    DynDataOptions }            from './';

import type { DynMapReducer }   from '../map';
import type { DynArrayReducer } from '../array';

/**
 * Defines the shape of dynamic array constructor functions.
 */
export interface IDynArrayReducerCtor<T>
{
    new (data?: Iterable<T> | DynArrayData<T>): DynArrayReducer<T>;
}

/**
 * Defines the shape of dynamic map constructor functions.
 */
export interface IDynMapReducerCtor<K, T>
{
    new (data?: Map<K, T> | DynMapData<K, T>): DynMapReducer<K, T>;
}

/**
 * Defines the shape of derived reducers constructor functions.
 */
export interface IDynDerivedReducerCtor<T>
{
    new (hostData: DynDataHost<any>, parentIndex: IndexerAPI<any, T>, options: DynDataOptions<T>): IDynDerivedReducer<any, any, T>;
}

/**
 * Defines the interface for all derived reducers.
 */
export interface IDynDerivedReducer<D, K, T>
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
    get filters(): IDynAdapterFilters<T>;

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
    get sort(): IDynAdapterSort<T>;

    /**
     * Sets reversed state and notifies subscribers.
     *
     * @param reversed - New reversed state.
     */
    set reversed(reversed: boolean);

    /**
     * Removes all derived reducers, subscriptions, and cleans up all resources.
     */
    destroy(): void;

    /**
     * Subscribe to this IDerivedReducer.
     *
     * @param handler - Callback function that is invoked on update / changes. Receives derived reducer reference.
     *
     * @returns Unsubscribe function.
     */
    subscribe(handler: (value: IDynDerivedReducer<D, K, T>) => void): () => void;
}
