const acorn = require('acorn');
const walk = require('acorn-walk');
const escodegen = require('escodegen');
const nothrowPlugin = require('./lib/acorn-nothrow');

const nothrowParser = acorn.Parser.extend(nothrowPlugin);

const transpileNothrow = (code) => {
  const ast = nothrowParser.parse(code, {
    ecmaVersion: 2020
  });

  walk.recursive(ast, {}, {
    NothrowStatement(node, state, c) {
      node.type = 'TryStatement';
      node.handler = new acorn.Node({ options: {} }, 0);
      node.handler.type = 'CatchClause';
      node.handler.start = node.block.end + 1;
      node.handler.end = node.block.end + 9;
      node.handler.param = null;
      node.handler.body = new acorn.Node({ options: {} }, 0);
      node.handler.body.type = 'BlockStatement';
      node.handler.body.start = node.block.end + 7;
      node.handler.body.end = node.block.end + 9;
      node.handler.body.body = [];
      c(node.block, state);
    }
  }, walk.base);

  return escodegen.generate(ast);
}

console.log(transpileNothrow(`
  nothrow {
    console.log(undefinedVariable + 3)
    try {
      if (true) {
        nothrow {
          console.log('another thing', wrong)
        }
      }
    } catch (e) {}
  }
`));
