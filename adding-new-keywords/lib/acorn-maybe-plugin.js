const acorn = require("acorn")

function maybePlugin(Parser) {
  return class extends Parser {
    _readMaybe() {
      let ch, start = this.pos;
      do {
        ch = this.input.charCodeAt(++this.pos);
      } while (acorn.isIdentifierChar(ch));
      if (this.input.slice(start, this.pos) === 'maybe') {
        return true;
      }
      this.pos = start;
      return false;
    }

    readToken(code) {
      if (this._readMaybe()) {
        return this.finishToken(maybePlugin.tokTypes.maybe, 'maybe');
      }
      return super.readToken(code);
    }

    parseExprAtom(refShortHandDefaultPos) {
      if (this.type === maybePlugin.tokTypes.maybe) {
        const startPos = this.start, startLoc = this.startLoc;
        const node = this.startNodeAt(startPos, startLoc);
        node.children = [];
        this.next();
        if (this.type === acorn.tokTypes.braceL) {
          this.next();
          while (this.type !== acorn.tokTypes.braceR) {
            node.children.push(this.parseExpression());  
          }
          this.next();
        } else {
          node.children.push(this.parseExpression());
        }
        return this.finishNode(node, 'maybe');
      }
      return super.parseExprAtom(refShortHandDefaultPos);
    }
  }
}

maybePlugin.tokTypes = {
  maybe: new acorn.TokenType('maybe'),
}

module.exports = maybePlugin