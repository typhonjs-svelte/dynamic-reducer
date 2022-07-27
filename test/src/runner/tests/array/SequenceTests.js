/**
 * @param {object}                        opts - Test options
 *
 * @param {import('../../../../../types/index.js')}   opts.Module - Module to test
 */
export function run({ Module })
{
   const { DynArrayReducer } = Module;

   describe(`(Array) SequenceTest`, () =>
   {
      it(`does it work`, () =>
      {
         const data = [0, 1, 2, 3, 4, 5, 6];
         const filterLessTwo = (value) => value > 2;
         const filterDynamicModulo = { id: 'dynamic modulo', filter: (value) => value % modulo === 0, weight: 0.1 };

         const arrayReducer = new DynArrayReducer({ data });

         const unsubscribe = arrayReducer.subscribe(
          () => console.log(`!!!! arrayReducer update: ${JSON.stringify([...arrayReducer])}`));

         let modulo = 2;

         console.log(`!! filters.add`);
         arrayReducer.filters.add({ id: '> 2', filter: filterLessTwo });

         console.log(`!! sort.set`);
         arrayReducer.sort.set((a, b) => b - a);

         console.log(`!! data.push(7)`);
         data.push(7);
         arrayReducer.index.update();

         console.log(`!! data.pop`);
         data.pop();
         arrayReducer.index.update();

         console.log(`!! filters.add`);
         arrayReducer.filters.add(filterDynamicModulo);

         modulo = 3;

         console.log(`!! index.update`);
         arrayReducer.index.update();

         console.log(`!! filter iterator:\n${JSON.stringify([...arrayReducer.filters], null, 3)}`);

         console.log(`!! filters.removeById`);
         // arrayReducer.filters.remove();
         // arrayReducer.filters.removeBy(({ weight }) => weight > 0.5);
         // arrayReducer.filters.removeById('A');
         arrayReducer.filters.removeById('dynamic modulo');

         console.log(`!! filter iterator:\n${JSON.stringify([...arrayReducer.filters], null, 3)}`);

         console.log(`!! filters.clear`);
         arrayReducer.filters.clear();

         console.log(`!! data.push(10)`);
         data.push(10);
         arrayReducer.index.update();

         console.log(`!! sort.reset`);
         arrayReducer.sort.reset();

         console.log(`!! data.length = 0`);
         data.length = 0;
         arrayReducer.index.update();

         unsubscribe();
      });
   });
}
