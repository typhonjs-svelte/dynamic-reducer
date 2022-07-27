/**
 * @param {object}                        opts - Test options
 *
 * @param {import('../../../../../types/index.js')}   opts.Module - Module to test
 */
export function run({ Module })
{
   const { DynArrayReducer } = Module;

   describe(`(Array) Performance Test`, () =>
   {
      it(`large`, () =>
      {
         const modulo = 2;
         const data = [...Array(10000).keys()];
         const filterDynamicModulo = { id: 'dynamic modulo', filter: (value) => value % modulo === 0, weight: 0.1 };

         const arrayReducer = new DynArrayReducer({ data });

         let startTime;

         arrayReducer.filters.add(filterDynamicModulo);

         // arrayReducer.sort.set((a, b) => b - a);

         const repeat = 5000;

         let totalTime = 0;

         for (let cntr = repeat; --cntr >= 0;)
         {
            startTime = performance.now();
            arrayReducer.index.update();
            totalTime += performance.now() - startTime;
         }

         console.log(`! Total time (iterations - ${repeat}): ${totalTime / repeat}`);
      });
   });
}
