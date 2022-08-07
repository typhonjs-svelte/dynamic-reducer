import type { AdapterDerived }  from '../adapter/AdapterDerived.js';

import type {
    IDerivedReducer,
    OptionsDerivedCreate }      from '../../types.js';

export class DerivedAPI<K, T>
{
    /**
     * @param options -
     *
     * @returns Newly created derived reducer.
     */
    create: (options: OptionsDerivedCreate<T>) => IDerivedReducer;

    /**
     * Deletes and destroys a derived reducer.
     *
     * @param name - Name of the derived reducer
     */
    delete: (name: string) => boolean;

    /**
     * Returns an existing derived reducer.
     *
     * @param name - Name of derived reducer.
     */
    get: (name: string) => IDerivedReducer

    constructor(adapterDerived: AdapterDerived<any, K, T>)
    {
        this.create = adapterDerived.create.bind(adapterDerived);
        this.delete = adapterDerived.delete.bind(adapterDerived);
        this.get = adapterDerived.get.bind(adapterDerived);

        Object.freeze(this);
    }
}
