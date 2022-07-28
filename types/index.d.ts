type DataDynArray<T> = {
    /**
     * -
     */
    data?: Iterable<T>;
    /**
     * -
     */
    filters?: Iterable<FilterFn<T> | DataFilter<T>>;
    /**
     * -
     */
    sort?: CompareFn<T>;
};
type DataDynMap<K, T> = {
    /**
     * -
     */
    data?: Map<K, T>;
    /**
     * -
     */
    filters?: Iterable<FilterFn<T> | DataFilter<T>>;
    /**
     * -
     */
    sort?: CompareFn<T>;
};
type DataFilter<T> = {
    /**
     * - An ID associated with this filter. Can be used to remove the filter.
     */
    id?: any;
    /**
     * - Filter function that takes a value argument and returns a truthy value to
     *   keep it.
     */
    filter: FilterFn<T>;
    /**
     * - A number between 0 and 1 inclusive to position this filter against others.
     */
    weight?: number;
    /**
     * - Optional subscribe function following the Svelte store / subscribe pattern.
     */
    subscribe?: Function;
};
type DataHost<D> = [(D | null)];
type DataSort<T> = {
    /**
     * - An ID associated with this filter. Can be used to remove the filter.
     */
    id?: any;
    /**
     * - A callback function that compares two values.
     */
    compare: CompareFn<T>;
    /**
     * - Optional subscribe function following the Svelte store / subscribe pattern.
     */
    subscribe?: Function;
};
/**
 * - A callback function that compares two values. Return > 0 to sort b
 * before a; * < 0 to sort a before b; or 0 to keep original order of a & b.
 */
type CompareFn<T> = (arg0: T, arg1: T) => boolean;
/**
 * - Filter function that takes a value argument and returns a truthy value to
 *                                            keep it.
 */
type FilterFn<T> = (arg0: T) => boolean;
type IndexerAPI<K> = Iterable<K>;

/**
 * Provides a managed array with non-destructive reducing / filtering / sorting capabilities with subscription /
 * Svelte store support.
 *
 * @template T
 */
declare class DynArrayReducer<T> {
    /**
     * Initializes DynArrayReducer. Any iterable is supported for initial data. Take note that if `data` is an array it
     * will be used as the host array and not copied. All non-array iterables otherwise create a new array / copy.
     *
     * @param {Iterable<T>|DataDynArray<T>}   [data] - Data iterable to store if array or copy otherwise.
     */
    constructor(data?: Iterable<T> | DataDynArray<T>);
    /**
     * Returns the internal data of this instance. Be careful!
     *
     * Note: if an array is set as initial data then that array is used as the internal data. If any changes are
     * performed to the data externally do invoke {@link index.update} with `true` to recalculate the index and notify
     * all subscribers.
     *
     * @returns {T[]|null} The internal data.
     */
    get data(): T[];
    /**
     * @returns {AdapterFilters<T>} The filters adapter.
     */
    get filters(): any;
    /**
     * Returns the Indexer public API.
     *
     * @returns {IndexerAPI<number>} Indexer API - is also iterable.
     */
    get index(): IndexerAPI<number>;
    /**
     * Gets the main data / items length.
     *
     * @returns {number} Main data / items length.
     */
    get length(): number;
    /**
     * Sets reversed state and notifies subscribers.
     *
     * @param {boolean} reversed - New reversed state.
     */
    set reversed(arg: boolean);
    /**
     * Gets current reversed state.
     *
     * @returns {boolean} Reversed state.
     */
    get reversed(): boolean;
    /**
     * @returns {AdapterSort<T>} The sort adapter.
     */
    get sort(): any;
    /**
     * Removes internal data and pushes new data. This does not destroy any initial array set to internal data unless
     * `replace` is set to true.
     *
     * @param {T[] | Iterable<T> | null} data - New data to set to internal data.
     *
     * @param {boolean} [replace=false] - New data to set to internal data.
     */
    setData(data: T[] | Iterable<T> | null, replace?: boolean): void;
    /**
     *
     * @param {function(DynArrayReducer<T>): void} handler - Callback function that is invoked on update / changes.
     *                                                       Receives `this` reference.
     *
     * @returns {(function(): void)} Unsubscribe function.
     */
    subscribe(handler: (arg0: DynArrayReducer<T>) => void): (() => void);
    /**
     * Provides an iterator for data stored in DynArrayReducer.
     *
     * @returns {Generator<*, T, *>} Generator / iterator of all data.
     * @yields {T}
     */
    [Symbol.iterator](): Generator<any, T, any>;
    #private;
}

/**
 * Provides a managed Map with non-destructive reducing / filtering / sorting capabilities with subscription /
 * Svelte store support.
 *
 * @template K
 *
 * @template T
 */
declare class DynMapReducer<K, T> {
    /**
     * Initializes DynMapReducer. Any iterable is supported for initial data. Take note that if `data` is a Map it
     * will be used as the host map and not copied.
     *
     * @param {Map<K, T>|DataDynMap<T>}   [data] - Source map.
     */
    constructor(data?: Map<K, T> | DataDynMap<T>);
    /**
     * Returns the internal data of this instance. Be careful!
     *
     * TODO: UPDATE
     * Note: if an array is set as initial data then that array is used as the internal data. If any changes are
     * performed to the data externally do invoke {@link index.update} with `true` to recalculate the index and notify
     * all subscribers.
     *
     * @returns {Map<K, T>|null} The internal data.
     */
    get data(): Map<K, T>;
    /**
     * @returns {AdapterFilters<T>} The filters adapter.
     */
    get filters(): any;
    /**
     * Returns the Indexer public API.
     *
     * @returns {IndexerAPI<K>} Indexer API - is also iterable.
     */
    get index(): IndexerAPI<K>;
    /**
     * Gets the main data map length / size.
     *
     * @returns {number} Main data map length / size.
     */
    get length(): number;
    /**
     * Sets reversed state and notifies subscribers.
     *
     * @param {boolean} reversed - New reversed state.
     */
    set reversed(arg: boolean);
    /**
     * Gets current reversed state.
     *
     * @returns {boolean} Reversed state.
     */
    get reversed(): boolean;
    /**
     * @returns {AdapterSort<T>} The sort adapter.
     */
    get sort(): any;
    /**
     * Removes internal data and pushes new data. This does not destroy any initial array set to internal data unless
     * `replace` is set to true.
     *
     * @param {Map<K, T> | null} data - New data to set to internal data.
     *
     * @param {boolean} [replace=false] - New data to set to internal data.
     */
    setData(data: Map<K, T> | null, replace?: boolean): void;
    /**
     *
     * @param {function(DynMapReducer<T>): void} handler - Callback function that is invoked on update / changes.
     *                                                       Receives `this` reference.
     *
     * @returns {(function(): void)} Unsubscribe function.
     */
    subscribe(handler: (arg0: DynMapReducer<T, any>) => void): (() => void);
    /**
     * Provides an iterator for data stored in DynMapReducer.
     *
     * @returns {Generator<*, T, *>} Generator / iterator of all data.
     * @yields {T}
     */
    [Symbol.iterator](): Generator<any, T, any>;
    #private;
}

export { DynArrayReducer, DynMapReducer };
