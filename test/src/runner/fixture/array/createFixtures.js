/**
 * @param {import('../../../../../types')} Module -
 *
 * @returns {{CustomDerivedReducer: CustomDerivedReducer}}
 */
export function createFixtures(Module)
{
   const { DerivedArrayReducer } = Module;

   const CustomDerivedReducer = class extends DerivedArrayReducer
   {

   }

   return {
      CustomDerivedReducer
   }
}
