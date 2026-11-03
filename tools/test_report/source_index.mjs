// Read syntax without importing the application or executing tests.
import fs from 'node:fs';
import path from 'node:path';
import ts from '../../dashboard/node_modules/typescript/lib/typescript.js';

const root = process.argv[2] || 'dashboard';
const tests = [];
const targets = [];
const files = [];
const strings = (node) =>
  node && ts.isArrayLiteralExpression(node)
    ? node.elements.filter(ts.isStringLiteralLike).map((item) => item.text)
    : [];
const properties = (node) =>
  node && ts.isObjectLiteralExpression(node)
    ? Object.fromEntries(
        node.properties
          .filter(ts.isPropertyAssignment)
          .map((prop) => [prop.name.text, prop.initializer])
      )
    : {};
function walk(file) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  const source = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const isTest = /\.(test|spec|stories)\.tsx?$/.test(file);
  if (isTest) {
    const imports = [];
    for (const statement of source.statements) {
      if (
        !ts.isImportDeclaration(statement) ||
        !statement.moduleSpecifier.text.startsWith('.')
      )
        continue;
      const imported = path.posix.normalize(
        path.posix.join(
          path.posix.dirname(file),
          statement.moduleSpecifier.text
        )
      );
      const resolved = ['', '.ts', '.tsx', '/index.ts', '/index.tsx']
        .map((ext) => imported + ext)
        .find(
          (candidate) =>
            fs.existsSync(path.join(root, candidate)) &&
            fs.statSync(path.join(root, candidate)).isFile()
        );
      if (resolved) imports.push(resolved);
    }
    files.push({ file, imports: [...new Set(imports)].sort() });
  }
  function visit(node) {
    if (isTest && ts.isCallExpression(node)) {
      const callee = node.expression.getText(source);
      const name = node.arguments[0];
      if (
        /^(test|it)(\.(each|skip|todo|only)(\([\s\S]*\))?)*$/.test(callee) &&
        name &&
        ts.isStringLiteralLike(name)
      ) {
        tests.push({
          file,
          line: source.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          callLine:
            source.getLineAndCharacterOfPosition(node.expression.end - 1).line +
            1,
          name: name.text,
          tags: strings(properties(node.arguments[1]).tags)
            .concat(
              strings(properties(node.arguments[1]).tag),
              properties(node.arguments[1]).tag?.text || []
            )
            .map((tag) => tag.replace(/^@/, '')),
          start: name.end,
          kind: 'test',
        });
      }
    }
    if (
      isTest &&
      file.includes('.stories.') &&
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      /^[A-Z]/.test(node.name.text) &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      const props = properties(node.initializer);
      tests.push({
        file,
        line: source.getLineAndCharacterOfPosition(node.getStart()).line + 1,
        name: props.name?.text || node.name.text,
        export: node.name.text,
        tags: strings(props.tags),
        start: node.initializer.getStart() + 1,
        kind: 'story',
      });
    }
    if (!isTest && ts.isPropertyAssignment(node)) {
      const key = node.name.text;
      if (
        file === 'src/App.tsx' &&
        key === 'path' &&
        ts.isStringLiteralLike(node.initializer)
      )
        targets.push({
          id: `route:${node.initializer.text}`,
          group: 'route',
          source: file,
        });
      const props = properties(node.initializer);
      if (
        file === 'src/state/questionDefinition.ts' &&
        props.type &&
        ts.isStringLiteralLike(props.type)
      )
        targets.push({
          id: `question:${key}`,
          group: 'question',
          source: file,
        });
      if (
        file === 'src/state/questionDefinition.ts' &&
        key === '見積もりモード'
      )
        strings(props.selections).forEach((mode) =>
          targets.push({ id: `mode:${mode}`, group: 'mode', source: file })
        );
      if (
        file === 'playwright.config.ts' &&
        key === 'name' &&
        ts.isStringLiteralLike(node.initializer)
      )
        targets.push({
          id: `device:${node.initializer.text}`,
          group: 'device',
          source: file,
        });
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}
function scan(dir) {
  for (const item of fs.readdirSync(path.join(root, dir), {
    withFileTypes: true,
  })) {
    const file = path.posix.join(dir, item.name);
    if (item.isDirectory()) scan(file);
    else if (/\.tsx?$/.test(file)) walk(file);
  }
}
scan('src');
scan('e2e');
walk('playwright.config.ts');
for (const file of fs.readdirSync(
  path.join(root, 'src/components/questions/template')
)) {
  if (/QuestionTemplate\.tsx$/.test(file))
    targets.push({
      id: `template:${file.replace('.tsx', '')}`,
      group: 'template',
      source: `src/components/questions/template/${file}`,
    });
}
for (const file of fs.readdirSync(path.join(root, 'src/components/errors'))) {
  if (/Error\.tsx$/.test(file))
    targets.push({
      id: `error:${file.replace('.tsx', '')}`,
      group: 'error',
      source: `src/components/errors/${file}`,
    });
}
for (const [name, file] of [
  ['給付', 'benefit'],
  ['貸付', 'loan'],
  ['窓口', 'helpDesk'],
]) {
  if (fs.existsSync(path.join(root, `src/components/result/${file}.tsx`)))
    targets.push({
      id: `result:${name}`,
      group: 'result',
      source: `src/components/result/${file}.tsx`,
    });
}
const calculate = fs.readFileSync(
  path.join(root, 'src/hooks/calculate.ts'),
  'utf8'
);
for (const match of calculate.matchAll(/VITE_BRANCH\s*===\s*'([^']+)'/g))
  targets.push({
    id: `environment:${match[1]}`,
    group: 'environment',
    source: 'src/hooks/calculate.ts',
  });
console.log(JSON.stringify({ tests, targets, files }));
