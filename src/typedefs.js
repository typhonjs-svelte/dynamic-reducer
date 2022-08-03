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
 * @template K, T
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
 * @template K, T
 *
 * @typedef {object} DataIndexer
 *
 * @property {K[]|null}       index - The index array.
 *
 * @property {number|null}    hash - Hashcode for current index content.
 *
 * @property {boolean}        reversed - Is iteration reversed?
 *
 * @property {APIIndexer<K>}  [parent] - Any associated parent AdapterIndexer.
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
 * @typedef {{(a: T, b: T): boolean, subscribe?: (handler: (value: any) => void) => () => void}} CompareFn -
 * A callback function that compares two values. Return > 0 to sort b before a; < 0 to sort a before b; or 0 to keep
 * original order of a & b.
 *
 * This function has an optional subscribe function that follows the Svelte store Subscriber pattern. If a subscribe
 * function is provided automatic updates to the reduced index is performed.
 */

/**
 * @template T
 *
 * @typedef {{(element: T): boolean, subscribe?: (handler: (value: any) => void) => () => void}} FilterFn -
 * Filter function that takes an element argument and returns a truthy value to keep it.
 *
 * This function has an optional subscribe function that follows the Svelte store Subscriber pattern. If a subscribe
 * function is provided automatic updates to the reduced index is performed.
 */

// Public API --------------------------------------------------------------------------------------------------------

/**
 * @template C
 *
 * @typedef {new () => C} DerivedReducerCtor -
 */

/**
 * @template C, T
 *
 * @typedef {object} DataDerived
 *
 * @property {string} [name] -
 *
 * @property {DerivedReducerCtor<C>} [ctor] -
 *
 * @property {Iterable<FilterFn<T>>} [filters] -
 *
 * @property {CompareFn<T>} [sort] -
 */

/**
 * @template C, T
 *
 * @typedef {string | DerivedReducerCtor<C> | DataDerived<C, T>} OptionsDerivedCreate -
 */

/**
 * @template C, T
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
 * @typedef {APIImplIndexer & Iterable<K>} APIIndexer
 */
