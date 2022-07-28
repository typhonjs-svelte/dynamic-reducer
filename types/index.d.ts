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
type DynArrayData<T> = {
    /**
     * -
     */
    data?: Iterable<T>;
    /**
     * -
     */
    filters?: Iterable<FilterFn<T> | FilterData<T>>;
    /**
     * -
     */
    sort?: CompareFn<T>;
};
type DynMapData<T> = {
    /**
     * -
     */
    data?: Map<any, T>;
    /**
     * -
     */
    filters?: Iterable<FilterFn<T> | FilterData<T>>;
    /**
     * -
     */
    sort?: CompareFn<T>;
};
type FilterData<T> = {
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
type SortData<T> = {
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
type IndexerAPI = {
    /**
     * - Current hash value of the index.
     */
    hash: number | null;
    /**
     * - Returns whether the indexer is active (IE filter or sort function active).
     */
    isActive: boolean;
    /**
     * - Getter returning length of reduced / indexed elements.
     */
    length: number;
    /**
     * - Manually invoke an update of the index.
     */
    update: (force?: boolean) => void;
};

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
     * @param {Iterable<T>|DynArrayData<T>}   [data] - Data iterable to store if array or copy otherwise.
     */
    constructor(data?: Iterable<T> | DynArrayData<T>);
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
     * @returns {IndexerAPI & Iterable<number>} Indexer API - is also iterable.
     */
    get index(): IndexerAPI & Iterable<number>;
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
 * @template T
 */
declare class DynMapReducer<T> {
    /**
     * Initializes DynMapReducer. Any iterable is supported for initial data. Take note that if `data` is a Map it
     * will be used as the host map and not copied.
     *
     * @param {Map<*, T>|DynMapData<T>}   [data] - Source map.
     */
    constructor(data?: Map<any, T> | DynMapData<T>);
    /**
     * Returns the internal data of this instance. Be careful!
     *
     * TODO: UPDATE
     * Note: if an array is set as initial data then that array is used as the internal data. If any changes are
     * performed to the data externally do invoke {@link index.update} with `true` to recalculate the index and notify
     * all subscribers.
     *
     * @returns {Map<*, T>|null} The internal data.
     */
    get data(): Map<any, T>;
    /**
     * @returns {AdapterFilters<T>} The filters adapter.
     */
    get filters(): any;
    /**
     * Returns the Indexer public API.
     *
     * @returns {IndexerAPI & Iterable<number>} Indexer API - is also iterable.
     */
    get index(): IndexerAPI & Iterable<number>;
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
     * @param {Map<S, T> | null} data - New data to set to internal data.
     *
     * @param {boolean} [replace=false] - New data to set to internal data.
     */
    setData(data: Map<any, T> | null, replace?: boolean): void;
    /**
     *
     * @param {function(DynMapReducer<T>): void} handler - Callback function that is invoked on update / changes.
     *                                                       Receives `this` reference.
     *
     * @returns {(function(): void)} Unsubscribe function.
     */
    subscribe(handler: (arg0: DynMapReducer<T>) => void): (() => void);
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
