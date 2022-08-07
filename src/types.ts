import type { IndexerAPI } from './common/index.js';

export interface IDerivedReducerCtor
{
   new (hostData: DataHost<any>, parentIndex: IndexerAPI<any, any>, options: object): IDerivedReducer;
}

export interface IDerivedReducer
{
    /**
     * @returns Returns the Indexer public API.
     */
    get index(): IndexerAPI<any, any>;
}

export type DataDynArray<T> = {
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

export type DataDynMap<K, T> = {
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

export type DataFilter<T> = {
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

export type DataHost<D> = (D | null)[];

export type DataIndexer<K, T> = {
    /**
     * - The index array.
     */
    index: K[] | null;
    /**
     * - Hashcode for current index content.
     */
    hash: number | null;
    /**
     * - Is iteration reversed?
     */
    reversed: boolean;
    /**
     * - Any associated parent index data.
     */
    parent?: IndexerAPI<K, T>;
};

export type DataSort<T> = {
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
 * -
 * A callback function that compares two values. Return > 0 to sort b before a; < 0 to sort a before b; or 0 to keep
 * original order of a & b.
 *
 * This function has an optional subscribe function that follows the Svelte store Subscriber pattern. If a subscribe
 * function is provided automatic updates to the reduced index is performed.
 */
export type CompareFn<T> = {
    (a: T, b: T): number;
    subscribe?: (handler: (value: any) => void) => () => void;
};

/**
 * -
 * Filter function that takes an element argument and returns a truthy value to keep it.
 *
 * This function has an optional subscribe function that follows the Svelte store Subscriber pattern. If a subscribe
 * function is provided automatic updates to the reduced index is performed.
 */
export type FilterFn<T> = {
    (element: T): boolean;
    subscribe?: (handler: (value: any) => void) => () => void;
};

/**
 * -
 */
export type DataDerived<T> = {
    /**
     * -
     */
    name?: string;
    /**
     * -
     */
    ctor?: IDerivedReducerCtor;
    /**
     * -
     */
    filters?: Iterable<FilterFn<T>>;
    /**
     * -
     */
    sort?: CompareFn<T>;
};

/**
 * -
 */
export type OptionsDerivedCreate<T> = string | IDerivedReducerCtor | DataDerived<T>;
