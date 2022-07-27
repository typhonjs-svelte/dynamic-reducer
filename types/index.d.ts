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
    data: Iterable<T>;
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
 * Provides the storage and sequencing of managed filters. Each filter added may be a bespoke function or a
 * {@link FilterData} object containing an `id`, `filter`, and `weight` attributes; `filter` is the only required
 * attribute.
 *
 * The `id` attribute can be anything that creates a unique ID for the filter; recommended strings or numbers. This
 * allows filters to be removed by ID easily.
 *
 * The `weight` attribute is a number between 0 and 1 inclusive that allows filters to be added in a
 * predictable order which is especially handy if they are manipulated at runtime. A lower weighted filter always runs
 * before a higher weighted filter. For speed and efficiency always set the heavier / more inclusive filter with a
 * lower weight; an example of this is a keyword / name that will filter out many entries making any further filtering
 * faster. If no weight is specified the default of '1' is assigned and it is appended to the end of the filters list.
 *
 * This class forms the public API which is accessible from the `.filters` getter in the main DynArrayReducer instance.
 * ```
 * const dynArray = new DynArrayReducer([...]);
 * dynArray.filters.add(...);
 * dynArray.filters.clear();
 * dynArray.filters.length;
 * dynArray.filters.remove(...);
 * dynArray.filters.removeBy(...);
 * dynArray.filters.removeById(...);
 * ```
 *
 * @template T
 */
declare class AdapterFilters<T> {
    /**
     * @param {Function} indexUpdate - update function for the indexer.
     *
     * @returns {[AdapterFilters<T>, {filters: FilterData<T>[]}]} Returns this and internal storage for filter adapters.
     */
    constructor(indexUpdate: Function);
    /**
     * @returns {number} Returns the length of the
     */
    get length(): number;
    /**
     * @param {...(FilterFn<T>|FilterData<T>)}   filters -
     */
    add(...filters: (FilterFn<T> | FilterData<T>)[]): void;
    clear(): void;
    /**
     * @param {...(FilterFn<T>|FilterData<T>)}   filters -
     */
    remove(...filters: (FilterFn<T> | FilterData<T>)[]): void;
    /**
     * Remove filters by the provided callback. The callback takes 3 parameters: `id`, `filter`, and `weight`.
     * Any truthy value returned will remove that filter.
     *
     * @param {function(*, FilterFn<T>, number): boolean} callback - Callback function to evaluate each filter entry.
     */
    removeBy(callback: (arg0: any, arg1: FilterFn<T>, arg2: number) => boolean): void;
    removeById(...ids: any[]): void;
    /**
     * Provides an iterator for filters.
     *
     * @returns {Generator<number|undefined, FilterData<T>, *>} Generator / iterator of filters.
     * @yields {FilterData<T>}
     */
    [Symbol.iterator](): Generator<number | undefined, FilterData<T>, any>;
    #private;
}

/**
 * @template T
 */
declare class AdapterSort<T> {
    /**
     * @param {Function} indexUpdate - Function to update indexer.
     *
     * @returns {[AdapterSort<T>, {compareFn: CompareFn<T>}]} This and the internal sort adapter data.
     */
    constructor(indexUpdate: Function);
    /**
     * @param {CompareFn<T>|SortData<T>}  data -
     *
     * A callback function that compares two values. Return > 0 to sort b before a;
     * < 0 to sort a before b; or 0 to keep original order of a & b.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#parameters
     */
    set(data: CompareFn<T> | SortData<T>): void;
    reset(): void;
    #private;
}

/**
 * Provides a managed array with non-destructive reducing / filtering / sorting capabilities with subscription /
 * Svelte store support.
 *
 * @template T
 */
declare class DynArrayReducer<T> {
    /**
     * Provides a utility method to determine if the given data is iterable / implements iterator protocol.
     *
     * @param {*}  data - Data to verify as iterable.
     *
     * @returns {boolean} Is data iterable.
     */
    static "__#3@#isIterable"(data: any): boolean;
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
    get filters(): AdapterFilters<T>;
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
    get sort(): AdapterSort<T>;
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

export { DynArrayReducer };
