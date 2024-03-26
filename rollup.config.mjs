import typescript          from '@rollup/plugin-typescript';
import { generateDTS }     from '@typhonjs-build-test/esm-d-ts';
import { importsResolve }  from "@typhonjs-build-test/rollup-plugin-pkg-imports";

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
            importsResolve(),
            typescript(),
            generateDTS.plugin()
         ]
      }
   ];
};
