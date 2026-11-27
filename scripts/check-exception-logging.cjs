// Enforce handled-exception coverage in active application sources.
// Run after installing backend dev dependencies: node scripts/check-exception-logging.cjs
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'backend/watchparty/node_modules/typescript/lib/typescript.js'));
const failures = [];
let boundaries = 0;
function files(directory, accept) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return entry.name.startsWith('.') || ['node_modules', 'build', 'tests', 'designs'].includes(entry.name) ? [] : files(file, accept);
    return accept(file) ? [file] : [];
  });
}
const loggerFiles = new Set(['clients/web/src/data/sessionLog.ts', 'backend/watchparty/server/watchparty/diagnostics.ts']);
for (const base of ['clients/web/src', 'backend/watchparty/server']) {
  for (const file of files(path.join(root, base), p => /\.tsx?$/.test(p) && !p.includes('.test.'))) {
    const relative = path.relative(root, file);
    // These are the nonthrowing logging boundaries, including console serialization fallback.
    if (loggerFiles.has(relative)) continue;
    const source = fs.readFileSync(file, 'utf8');
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    const check = (node, body) => {
      boundaries++;
      // Expression-bodied callbacks can be the logging adapter themselves.
      let first = ts.isBlock(body) ? body.statements[0] : body;
      // A catch can rethrow errors outside its recovery path before logging the handled case.
      if (first && ts.isCatchClause(node) && ts.isIfStatement(first) && !first.elseStatement &&
          ts.isThrowStatement(first.thenStatement) && node.variableDeclaration &&
          first.thenStatement.expression?.getText(ast) === node.variableDeclaration.name.getText(ast)) {
        first = body.statements[1];
      }
      if (relative.endsWith('/reportPrivacy.ts') && ts.isCatchClause(node) &&
          node.parent.tryBlock?.getText(ast).includes('safeRecord(JSON.parse(data))')) return; // Omitted-record marker; never log rejected input.
      if (!first || !/^logHandledException\(/.test(first.getText(ast))) {
        failures.push(`${relative}:${ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1}`);
      }
    };
    const visit = node => {
      if (ts.isCatchClause(node)) check(node, node.block);
      if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
        const method = node.expression.name.text;
        const handler = method === 'catch' ? node.arguments[0] : method === 'then' ? node.arguments[1] : undefined;
        if (handler) {
          if (ts.isArrowFunction(handler) || ts.isFunctionExpression(handler)) check(handler, handler.body);
          else failures.push(`${relative}: named rejection handler needs an explicit logging adapter`);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(ast);
  }
}
// Strip comments and strings while preserving source offsets (not an application-code transform).
const mask = text => text.replace(/"""[\s\S]*?"""|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\/[^\n]*|\/\*[\s\S]*?\*\//g, value => value.replace(/[^\n]/g, ' '));
for (const file of files(path.join(root, 'clients/native'), p => /\/src\/[^/]*Main\/.*\.kt$/.test(p))) {
  if (/\/diagnostics\/HandledExceptions\.kt$/.test(file)) continue; // Nonthrowing sink + logged Result adapter.
  const source = fs.readFileSync(file, 'utf8');
  const code = mask(source);
  const relative = path.relative(root, file);
  for (const match of code.matchAll(/\bcatch\s*\([^)]*\)\s*\{/g)) {
    boundaries++;
    if (!/^\s*(logHandledException|reportException)\s*\(/.test(code.slice(match.index + match[0].length))) {
      failures.push(`${relative}:${code.slice(0, match.index).split('\n').length}`);
    }
  }
  for (const match of code.matchAll(/\brunCatching\s*\{/g)) {
    boundaries++;
    // The pure domain coordinator reports through its injected adapter after each Result.
    const line = source.slice(match.index, source.indexOf('\n', match.index));
    if (!line.includes('.onFailure { reportException(')) failures.push(`${relative}: unlogged runCatching`);
  }
}
if (failures.length) {
  console.error('Unlogged handled-exception boundaries:\n' + failures.join('\n'));
  process.exitCode = 1;
} else console.log(`PASS: ${boundaries} handled-exception boundaries covered across browser, native and active backend sources.`);
