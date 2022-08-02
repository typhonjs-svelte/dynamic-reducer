// Data -------------------------------------------------------------------------------------------------------------

/**
 * @template T
 *
 * @typedef {object} DataDynArray
 *
 * @property {Iterable<T>}                         [data] -
 *
 * @property {Iterable<FilterFn<T>|DataFilter<T>>} [filters] -
 *
 * @property {CompareFn<T>}                        [sort] -
 */

/**
 * @template K
 *
 * @template T
 *
 * @typedef {object} DataDynMap
 *
 * @property {Map<K, T>}                           [data] -
 *
 * @property {Iterable<FilterFn<T>|DataFilter<T>>} [filters] -
 *
 * @property {CompareFn<T>}                        [sort] -
 */

/**
 * @template T
 *
 * @typedef {object} DataFilter
 *
 * @property {*}           [id=undefined] - An ID associated with this filter. Can be used to remove the filter.
 *
 * @property {FilterFn<T>} filter - Filter function that takes a value argument and returns a truthy value to
 *                                  keep it.
 *
 * @property {number}      [weight=1] - A number between 0 and 1 inclusive to position this filter against others.
 *
 * @property {Function}    [subscribe] - Optional subscribe function following the Svelte store / subscribe pattern.
 */

/**
 * @template D
 *
 * @typedef {(D|null)[]} DataHost
 */

/**
 * @template K
 *
 * @template T
 *
 * @typedef {object} DataIndexer
 *
 * @property {K[]|null}   index - The index array.
 *
 * @property {number|null}   hash - Hashcode for current index content.
 *
 * @property {boolean}   reversed - Is iteration reversed?
 *
 * @property {Readonly<APIImplIndexer> & {indexData: DataIndexer<K, T>}}   [parent] - Any associated parent AdapterIndexer.
 */

/**
 * @template T
 *
 * @typedef {object} DataSort
 *
 * @property {*}              [id=undefined] - An ID associated with this filter. Can be used to remove the filter.
 *
 * @property {CompareFn<T>}   compare - A callback function that compares two values.
 *
 * @property {Function} [subscribe] - Optional subscribe function following the Svelte store / subscribe pattern.
 */

// Functions ---------------------------------------------------------------------------------------------------------

/**
 * @template T
 *
 * @typedef {function(T, T): boolean} CompareFn - A callback function that compares two values. Return > 0 to sort b
 * before a; * < 0 to sort a before b; or 0 to keep original order of a & b.
 *
 * @property {Function} [subscribe] - Optional subscribe function following the Svelte store / subscribe pattern.
 */

/**
 * @template T
 *
 * @typedef {function(T): boolean} FilterFn - Filter function that takes a value argument and returns a truthy value to
 *                                            keep it.
 *
 * @property {Function} [subscribe] - Optional subscribe function following the Svelte store / subscribe pattern.
 */

// Public API --------------------------------------------------------------------------------------------------------

/**
 * @template C
 *
 * @typedef {new () => C} DerivedImpl
 */

/**
 * @template C
 * @template T
 *
 * @typedef {object} DataDerived
 *
 * @property {string} [name] -
 *
 * @property {DerivedImpl<C>} [impl] -
 *
 * @property {Iterable<FilterFn<T>>} [filters] -
 *
 * @property {CompareFn} [sort] -
 */

/**
 * @template C
 * @template T
 *
 * @typedef {string | DerivedImpl<C> | DataDerived<C, T>} OptionsDerivedCreate -
 */

/**
 * @template C
 * @template T
 *
 * @typedef {object} APIDerived
 *
 * @property {(options: OptionsDerivedCreate<C, T>) => C}   create -
 *
 * @property {(name: string) => boolean} delete -
 *
 * @property {(name: string) => C}       get -
 */

/**
 * @typedef {object} APIImplIndexer
 *
 * @property {number|null}                hash - Current hash value of the index.
 *
 * @property {boolean}                    isActive - Returns whether the indexer is active (IE filter or sort function active).
 *
 * @property {number}                     length - Getter returning length of reduced / indexed elements.
 *
 * @property {(force?:boolean) => void}   update - Manually invoke an update of the index.
 */

/**
 * @template K
 *
 * @typedef {Readonly<APIImplIndexer & Iterable<K>>} APIIndexer
 */
