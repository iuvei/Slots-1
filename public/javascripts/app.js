// Generated by CoffeeScript 1.6.3
(function() {
  var Slots,
    _this = this,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Slots = {};

  Slots.config = {
    targetFPS: 60,
    width: 500,
    height: 400,
    buttons: {
      src: '/images/buttons_sheet.png',
      width: 100,
      height: 50,
      x: 200,
      y: 325
    },
    symbols: {
      src: '/images/symbols_sheet.png',
      width: 100,
      height: 100
    },
    reel: {
      width: 100,
      height: 300,
      regX: 0,
      regY: 0,
      spinDuration: 0.4,
      spinDelay: 0.5,
      speed: 2000
    },
    payouts: [
      {
        symbol: 0,
        probability: 5,
        wins: [50, 300, 1000]
      }, {
        symbol: 1,
        probability: 10,
        wins: [40, 200, 750]
      }, {
        symbol: 2,
        probability: 10,
        wins: [30, 100, 500]
      }, {
        symbol: 3,
        probability: 10,
        wins: [20, 50, 300]
      }, {
        symbol: 4,
        probability: 30,
        wins: [10, 40, 200]
      }, {
        symbol: 5,
        probability: 30,
        wins: [5, 25, 100]
      }, {
        symbol: 6,
        probability: 30,
        wins: [5, 25, 100]
      }, {
        symbol: 7,
        probability: 30,
        wins: [5, 25, 100]
      }, {
        symbol: 8,
        probability: 10,
        wins: [50, 300, 1000]
      }, {
        symbol: 9,
        probability: 5,
        wins: [400, 1200, 4000]
      }
    ],
    lines: {
      matches: [[1, 1, 1, 1, 1], [2, 2, 2, 2, 2], [0, 0, 0, 0, 0], [2, 1, 0, 1, 2], [0, 1, 2, 1, 0], [1, 2, 2, 2, 1], [1, 0, 0, 0, 1], [2, 2, 1, 0, 0], [0, 0, 1, 2, 2]]
    }
  };

  Slots.load = function() {
    var canvas, manifest;
    canvas = document.createElement('canvas');
    canvas.width = this.config.width;
    canvas.height = this.config.height;
    document.body.appendChild(canvas);
    this.stage = new createjs.Stage(canvas);
    this.stage.enableMouseOver(10);
    manifest = [
      {
        id: 'symbols',
        src: this.config.symbols.src
      }, {
        id: 'buttons',
        src: this.config.buttons.src
      }
    ];
    this.loader = new createjs.LoadQueue(false);
    this.loader.addEventListener('complete', this.init);
    return this.loader.loadManifest(manifest);
  };

  Slots.init = function() {
    Slots.calculator = new Slots.Calculator;
    Slots.symbolBuilder = new Slots.SymbolBuilder;
    Slots.state = new Slots.State;
    createjs.Ticker.timingMod = createjs.Ticker.RAF_SYNCHED;
    createjs.Ticker.setFPS(Slots.config.targetFPS);
    return createjs.Ticker.addEventListener('tick', Slots.state.tick);
  };

  Slots.Calculator = (function() {
    function Calculator(opts) {
      if (opts == null) {
        opts = {};
      }
      this.payouts = opts.payouts || Slots.config.payouts;
      this.lines = opts.lines || Slots.config.lines;
      this.payouts.sort(function(a, b) {
        if (a.probability < b.probability) {
          return 1;
        }
        if (a.probability > b.probability) {
          return -1;
        }
        return 0;
      });
      this.probabilityTotal = this.payouts.reduce((function(a, b) {
        return a + b.probability;
      }), 0);
    }

    Calculator.prototype.spawnValue = function() {
      var ceil, floor, num, payout, _i, _len, _ref;
      num = Math.random() * this.probabilityTotal;
      ceil = 0;
      _ref = this.payouts;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        payout = _ref[_i];
        floor = ceil;
        ceil += payout.probability;
        if ((floor <= num && num < ceil)) {
          return payout.symbol;
        }
      }
      return payout.symbol;
    };

    Calculator.prototype.checkWins = function(results, opts) {
      var lastSymbol, line, lineI, matched, reelI, reelJ, symbolI, symbolJ, _i, _j, _k, _len, _len1, _len2, _ref;
      results.winnings = 0;
      results.flash = {};
      results.lines = [];
      _ref = this.lines.matches;
      for (lineI = _i = 0, _len = _ref.length; _i < _len; lineI = ++_i) {
        line = _ref[lineI];
        if (lineI >= opts.numLinesBet) {
          break;
        }
        lastSymbol = null;
        matched = 1;
        for (reelI = _j = 0, _len1 = line.length; _j < _len1; reelI = ++_j) {
          symbolI = line[reelI];
          if (lastSymbol === null) {
            lastSymbol = results.values[reelI][symbolI];
          } else {
            if (lastSymbol === results.values[reelI][symbolI]) {
              matched++;
              lastSymbol = results.values[reelI][symbolI];
            } else {
              break;
            }
          }
        }
        if (matched >= 3) {
          results.lines.push(lineI);
          for (reelJ = _k = 0, _len2 = line.length; _k < _len2; reelJ = ++_k) {
            symbolJ = line[reelJ];
            if (reelJ >= matched) {
              break;
            }
          }
        }
      }
      return results;
    };

    Calculator.prototype.getSpinResults = function(opts) {
      var defer, i, j, results, _i, _j;
      defer = $.Deferred();
      results = {};
      results.values = [];
      for (i = _i = 0; _i <= 4; i = ++_i) {
        for (j = _j = 0; _j <= 2; j = ++_j) {
          if (!results.values[i]) {
            results.values[i] = [];
          }
          results.values[i][j] = this.spawnValue();
        }
      }
      results = this.checkWins(results, opts);
      setTimeout((function() {
        return defer.resolve(results);
      }), 500);
      return defer.promise();
    };

    return Calculator;

  })();

  Slots.State = (function() {
    function State() {
      this.tick = __bind(this.tick, this);
      this.handleSpinResults = __bind(this.handleSpinResults, this);
      this.spin = __bind(this.spin, this);
      this.initReels();
      this.initButtons();
    }

    State.prototype.initReels = function() {
      var i, _i;
      this.reels = [];
      for (i = _i = 0; _i <= 4; i = ++_i) {
        this.reels[i] = new Slots.Reel({
          position: i
        });
        Slots.stage.addChild(this.reels[i].container);
      }
    };

    State.prototype.initButtons = function() {
      var config, image, numFrames, sheet, _i, _j, _ref, _ref1, _results, _results1;
      config = Slots.config.buttons;
      image = Slots.loader.getResult('buttons');
      numFrames = Math.floor(image.width / config.width);
      sheet = new createjs.SpriteSheet({
        images: [image],
        frames: {
          width: config.width,
          height: config.height,
          count: numFrames
        },
        animations: {
          "static": 0,
          flash: {
            frames: (function() {
              _results1 = [];
              for (var _j = 0, _ref1 = numFrames - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; 0 <= _ref1 ? _j++ : _j--){ _results1.push(_j); }
              return _results1;
            }).apply(this).concat((function() {
              _results = [];
              for (var _i = _ref = numFrames - 2; _ref <= 1 ? _i <= 1 : _i >= 1; _ref <= 1 ? _i++ : _i--){ _results.push(_i); }
              return _results;
            }).apply(this))
          }
        }
      });
      this.spinButton = new createjs.Sprite(sheet, 'static');
      this.spinButton.framerate = 30;
      this.spinButton.width = config.width;
      this.spinButton.height = config.height;
      this.spinButton.x = config.x;
      this.spinButton.y = config.y;
      this.spinButton.addEventListener('mouseover', function() {
        return document.body.style.cursor = 'pointer';
      });
      this.spinButton.addEventListener('mouseout', function() {
        return document.body.style.cursor = 'default';
      });
      this.spinButton.addEventListener('click', this.spin);
      return Slots.stage.addChild(this.spinButton);
    };

    State.prototype.spin = function() {
      var reel, _i, _len, _ref;
      if (this.spinningReelCount > 0) {
        return;
      }
      this.spinningReelCount = 5;
      _ref = this.reels;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        reel = _ref[_i];
        reel.startSpin();
      }
      this.spinButton.gotoAndPlay('flash');
      return Slots.calculator.getSpinResults({
        numLinesBet: 9
      }).done(this.handleSpinResults);
    };

    State.prototype.handleSpinResults = function(results) {
      var i, reel, _i, _len, _ref,
        _this = this;
      _ref = this.reels;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        reel = _ref[i];
        reel.completeSpin({
          values: results.values[i]
        }).done(function() {
          return _this.completeSpin(results);
        });
      }
    };

    State.prototype.completeSpin = function(results) {
      this.spinningReelCount--;
      if (this.spinningReelCount !== 0) {
        return;
      }
      this.spinButton.gotoAndPlay('static');
      return console.log(results);
    };

    State.prototype.tick = function(evt) {
      var deltaS;
      deltaS = evt.delta / 1000;
      this.reels.forEach(function(reel) {
        return reel.update(deltaS);
      });
      Slots.stage.update(evt);
    };

    return State;

  })();

  Slots.Reel = (function() {
    Reel.prototype.isSpinning = false;

    function Reel(opts) {
      var config, i, symbol, _i;
      config = {};
      _.extend(config, Slots.config.reel, opts);
      this.spinDuration = config.spinDuration;
      this.spinDelay = config.spinDelay;
      this.position = config.position;
      this.speed = config.speed;
      this.container = new createjs.Container;
      this.container.y = config.regY;
      this.container.x = config.position * config.width + config.regX;
      this.container.width = config.width;
      this.container.height = config.height;
      this.container.name = "reel" + this.position;
      this.blurFilter = new createjs.BlurFilter(0, 10, 1);
      for (i = _i = 0; _i <= 3; i = ++_i) {
        symbol = Slots.symbolBuilder.newSprite();
        symbol.y = symbol.height * i;
        this.container.addChild(symbol);
      }
      this.container.cache(0, 0, this.container.width, this.container.height);
    }

    Reel.prototype.startSpin = function() {
      this.values = null;
      this.isSpinning = true;
      this.isFinalPass = false;
      this.timeSpinning = 0;
      this.defer = $.Deferred();
      return this.container.filters = [this.blurFilter];
    };

    Reel.prototype.completeSpin = function(opts) {
      this.values = opts.values.concat(Slots.calculator.spawnValue());
      if (this.timeSpinning > this.spinDuration) {
        this.timeSpinning = this.spinDuration;
      }
      this.timeSpinning -= this.spinDelay * this.position;
      return this.defer.promise();
    };

    Reel.prototype.update = function(deltaS) {
      var deltaPixels, i, lastSymbol, symbol, threshhold, top, _i, _len, _ref;
      if (!this.isSpinning) {
        return;
      }
      this.timeSpinning += deltaS;
      this.isFinalPass = this.timeSpinning >= this.spinDuration && this.values;
      deltaPixels = this.speed * deltaS;
      top = this.container.children[0].y - deltaPixels;
      if (this.isFinalPass && this.values.length === 0) {
        if (top < 0) {
          top = 0;
          this.isSpinning = false;
          this.container.filters = null;
          this.defer.resolve();
        }
      } else {
        threshhold = -this.container.children[0].height;
        if (top <= threshhold) {
          top += this.container.children[0].height;
          this.container.removeChildAt(0);
          lastSymbol = _.last(this.container.children);
          if (this.isFinalPass) {
            symbol = Slots.symbolBuilder.newSprite(this.values.shift());
          } else {
            symbol = Slots.symbolBuilder.newSprite();
          }
          symbol.y = lastSymbol.y + lastSymbol.height;
          this.container.addChild(symbol);
        }
      }
      _ref = this.container.children;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        symbol = _ref[i];
        symbol.y = top + (i * symbol.height);
      }
      return this.container.updateCache();
    };

    return Reel;

  })();

  Slots.SymbolBuilder = (function() {
    SymbolBuilder.prototype.config = {};

    function SymbolBuilder(opts) {
      _.extend(this.config, Slots.config.symbols, opts);
      this.config.image = this.config.image || Slots.loader.getResult('symbols');
      this.config.numSymbols = Math.floor(this.config.image.height / this.config.height);
      this.config.numFramesPerSymbol = Math.floor(this.config.image.width / this.config.width);
    }

    SymbolBuilder.prototype.newSprite = function(value) {
      var firstFrame, lastFrame, sheet, sprite, _i, _j, _ref, _ref1, _results, _results1;
      if (value == null) {
        value = Slots.calculator.spawnValue();
      }
      firstFrame = value * this.config.numFramesPerSymbol;
      lastFrame = (value + 1) * this.config.numFramesPerSymbol - 1;
      sheet = new createjs.SpriteSheet({
        images: [this.config.image],
        frames: {
          width: this.config.width,
          height: this.config.height,
          count: this.config.numSymbols * this.config.numFramesPerSymbol
        },
        animations: {
          "static": firstFrame,
          flash: {
            frames: (function() {
              _results1 = [];
              for (var _j = firstFrame; firstFrame <= lastFrame ? _j <= lastFrame : _j >= lastFrame; firstFrame <= lastFrame ? _j++ : _j--){ _results1.push(_j); }
              return _results1;
            }).apply(this).concat((function() {
              _results = [];
              for (var _i = _ref = lastFrame - 1, _ref1 = firstFrame + 1; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; _ref <= _ref1 ? _i++ : _i--){ _results.push(_i); }
              return _results;
            }).apply(this))
          }
        }
      });
      sprite = new createjs.Sprite(sheet, 'static');
      sprite.framerate = 30;
      sprite.width = this.config.width;
      sprite.height = this.config.height;
      return sprite;
    };

    return SymbolBuilder;

  })();

  Slots.load();

}).call(this);
