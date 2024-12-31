import typescript       from '@rollup/plugin-typescript';
import { generateDTS }  from '@typhonjs-build-test/esm-d-ts';

// Produce sourcemaps or not.
const s_SOURCEMAP = true;

export default () =>
{
   return [{   // This bundle is for the Node distribution.
         input: 'src/index.ts',
         output: [{
            file: `./dist/index.js`,
            format: 'es',
            generatedCode: { constBindings: true },
            sourcemap: s_SOURCEMAP,
         }],
         plugins: [
            typescript({ include: ['src/**/*'] }),
            generateDTS.plugin({ importsResolve: true })
         ]
      }
   ];
};
