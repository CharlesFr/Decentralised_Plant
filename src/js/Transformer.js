var Transformer;

Transformer = (function() {
  function Transformer(x, y, a, s, stack) {
    this.x = x != null ? x : 0;
    this.y = y != null ? y : 0;
    this.a = a != null ? a : 0;
    this.s = s != null ? s : 1;
    this.stack = stack != null ? stack : [];
  }

  Transformer.prototype.push = function() {
    push();
    return this.stack.push([this.x, this.y, this.a, this.s]);
  };

  Transformer.prototype.pop = function() {
    var ref;
    pop();
    return ref = this.stack.pop(), this.x = ref[0], this.y = ref[1], this.a = ref[2], this.s = ref[3], ref;
  };

  Transformer.prototype.rotate = function(da) {
    rotate(da);
    return this.a += da;
  };

  Transformer.prototype.scale = function(ds) {
    scale(ds);
    return this.s *= ds;
  };

  Transformer.prototype.translate = function(dx, dy) {
    translate(dx, dy);
    this.x += this.s * dx * cos(this.a) - this.s * dy * sin(this.a);
    return this.y += this.s * dy * cos(this.a) + this.s * dx * sin(this.a);
  };

  return Transformer;

})();
