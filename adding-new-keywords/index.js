const { Parser } = require("acorn")
const maybePlugin = require('./lib/acorn-maybe-plugin')

const ParserWithMaybe = Parser.extend(
  maybePlugin
)

const ast = ParserWithMaybe.parse(`
maybe {
  console.log(undefinedVariable + 3)
}
`, {
ecmaVersion: 2020
})

console.log(ast.body[0].expression.children[0])