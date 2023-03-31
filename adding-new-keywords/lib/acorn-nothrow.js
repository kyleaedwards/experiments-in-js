const acorn = require("acorn")

function nothrowPlugin(Parser) {
  return class extends Parser {
    _readNothrow() {
      let ch, start = this.pos;
      do {
        ch = this.input.charCodeAt(++this.pos);
      } while (acorn.isIdentifierChar(ch));
      if (this.input.slice(start, this.pos) === 'nothrow') {
        return true;
      }
      this.pos = start;
      return false;
    }

    readToken(code) {
      if (this._readNothrow()) {
        return this.finishToken(nothrowPlugin.tokTypes.nothrow, 'nothrow');
      }
      return super.readToken(code);
    }

    parseStatement(...args) {
      if (this.type === nothrowPlugin.tokTypes.nothrow) {
        const startPos = this.start, startLoc = this.startLoc;
        const node = this.startNodeAt(startPos, startLoc);
        this.next();
        if (this.type === acorn.tokTypes.braceL) {
          node.block = this.parseStatement();
        } else {
          return this.raise(`Unexpected token ${this.value}`)
        }
        return this.finishNode(node, 'NothrowStatement');
      }
      return super.parseStatement(...args)
    }
  }
}

nothrowPlugin.tokTypes = {
  nothrow: new acorn.TokenType('nothrow'),
}

module.exports = nothrowPlugin