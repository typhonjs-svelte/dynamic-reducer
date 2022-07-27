/**
 * @param {object}                        opts - Test options
 *
 * @param {import('../../../../../types/index.js')}   opts.Module - Module to test
 */
export function run({ Module })
{
   const { DynMapReducer } = Module;

   describe(`(Map) Performance Test`, () =>
   {
      it(`large`, () =>
      {
         const modulo = 2;

         // 10k number pairs
         const data = new Map([...Array(10000).keys()].map((index) => [index, index]));

         // 10k string / number pairs
         // const data = new Map([...Array(10000).keys()].map((index) => [`${index}`, index]));

         const filterDynamicModulo = { id: 'dynamic modulo', filter: (value) => value % modulo === 0, weight: 0.1 };

         const dynMap = new DynMapReducer({ data });

         let startTime;

         dynMap.filters.add(filterDynamicModulo);

         // dynMap.sort.set((a, b) => b - a);

         const repeat = 5000;

         let totalTime = 0;

         for (let cntr = repeat; --cntr >= 0;)
         {
            startTime = performance.now();
            dynMap.index.update();
            totalTime += performance.now() - startTime;
         }

         console.log(`! Total time (iterations - ${repeat}): ${totalTime / repeat}`);
      });
   });
}
