const tsj = require('ts-json-schema-generator');
const { parseSchema } = require('json-schema-to-zod');
const fs = require('fs');

let outputPath = '../src/app/schema/nextflow-tower/output.zod.ts';

try {
  const config = {
    path: '../src/app/types/nf-tower/nextflow-tower-openapi-spec.d.ts',
    tsconfig: '../tsconfig.json',
    type: '*', // Root type
  };

  const schema = tsj.createGenerator(config).createSchema(config.type);
  const output = parseSchema(schema).code;
  fs.writeFileSync(outputPath, output);

  console.log('Zod schema has been generated successfully.');
} catch (err) {
  console.error('Error generating Zod schema:', err);
}
