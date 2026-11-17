
      setupPositionProbePattern(0, 0);
      setupPositionProbePattern(_moduleCount - 7, 0);
      setupPositionProbePattern(0, _moduleCount - 7);
      setupPositionAdjustPattern();
      setupTimingPattern();
      setupTypeInfo(test, maskPattern);

      if (_typeNumber >= 7) {
        setupTypeNumber(test);
      }

      if (_dataCache == null) {
        _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
      }

      mapData(_dataCache, maskPattern);
    };

    var setupPositionProbePattern = function(row, col) {

      for (var r = -1; r <= 7; r += 1) {

        if (row + r <= -1 || _moduleCount <= row + r) continue;

        for (var c = -1; c <= 7; c += 1) {

          if (col + c <= -1 || _moduleCount <= col + c) continue;

          if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
              || (0 <= c && c <= 6 && (r == 0 || r == 6) )
              || (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
            _modules[row + r][col + c] = true;
          } else {
            _modules[row + r][col + c] = false;
          }
        }
      }
    };

    var getBestMaskPattern = function() {

      var minLostPoint = 0;
      var pattern = 0;

      for (var i = 0; i < 8; i += 1) {

        makeImpl(true, i);

        var lostPoint = QRUtil.getLostPoint(_this);

        if (i == 0 || minLostPoint > lostPoint) {
          minLostPoint = lostPoint;
          pattern = i;
        }
      }

      return pattern;
    };

    var setupTimingPattern = function() {

      for (var r = 8; r < _moduleCount - 8; r += 1) {
        if (_modules[r][6] != null) {
          continue;
        }
        _modules[r][6] = (r % 2 == 0);
      }

      for (var c = 8; c < _moduleCount - 8; c += 1) {
        if (_modules[6][c] != null) {
          continue;
        }
        _modules[6][c] = (c % 2 == 0);
      }
    };

    var setupPositionAdjustPattern = function() {

      var pos = QRUtil.getPatternPosition(_typeNumber);

      for (var i = 0; i < pos.length; i += 1) {

        for (var j = 0; j < pos.length; j += 1) {

          var row = pos[i];
          var col = pos[j];

          if (_modules[row][col] != null) {
            continue;
          }

          for (var r = -2; r <= 2; r += 1) {

            for (var c = -2; c <= 2; c += 1) {

              if (r == -2 || r == 2 || c == -2 || c == 2
                  || (r == 0 && c == 0) ) {
                _modules[row + r][col + c] = true;
              } else {
                _modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    };

    var setupTypeNumber = function(test) {

      var bits = QRUtil.getBCHTypeNumber(_typeNumber);

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
      }

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
      }
    };

    var setupTypeInfo = function(test, maskPattern) {

      var data = (_errorCorrectionLevel << 3) | maskPattern;
      var bits = QRUtil.getBCHTypeInfo(data);

      // vertical
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 6) {
          _modules[i][8] = mod;
        } else if (i < 8) {
          _modules[i + 1][8] = mod;
        } else {
          _modules[_moduleCount - 15 + i][8] = mod;
        }
      }

      // horizontal
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 8) {
          _modules[8][_moduleCount - i - 1] = mod;
        } else if (i < 9) {
          _modules[8][15 - i - 1 + 1] = mod;
        } else {
          _modules[8][15 - i - 1] = mod;
        }
      }

      // fixed module
      _modules[_moduleCount - 8][8] = (!test);
    };

    var mapData = function(data, maskPattern) {

      var inc = -1;
      var row = _moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;
      var maskFunc = QRUtil.getMaskFunction(maskPattern);

      for (var col = _moduleCount - 1; col > 0; col -= 2) {

        if (col == 6) col -= 1;

        while (true) {

          for (var c = 0; c < 2; c += 1) {

            if (_modules[row][col - c] == null) {

              var dark = false;

              if (byteIndex < data.length) {
                dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
              }

              var mask = maskFunc(row, col - c);

              if (mask) {
                dark = !dark;
              }

              _modules[row][col - c] = dark;
              bitIndex -= 1;

              if (bitIndex == -1) {
                byteIndex += 1;
                bitIndex = 7;
              }
            }
          }

          row += inc;

          if (row < 0 || _moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    };

    var createBytes = function(buffer, rsBlocks) {

      var offset = 0;

      var maxDcCount = 0;
      var maxEcCount = 0;

      var dcdata = new Array(rsBlocks.length);
      var ecdata = new Array(rsBlocks.length);

      for (var r = 0; r < rsBlocks.length; r += 1) {

        var dcCount = rsBlocks[r].dataCount;
        var ecCount = rsBlocks[r].totalCount - dcCount;

        maxDcCount = Math.max(maxDcCount, dcCount);
        maxEcCount = Math.max(maxEcCount, ecCount);

        dcdata[r] = new Array(dcCount);

        for (var i = 0; i < dcdata[r].length; i += 1) {
          dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
        }
        offset += dcCount;

        var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
        var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

        var modPoly = rawPoly.mod(rsPoly);
        ecdata[r] = new Array(rsPoly.getLength() - 1);
        for (var i = 0; i < ecdata[r].length; i += 1) {
          var modIndex = i + modPoly.getLength() - ecdata[r].length;
          ecdata[r][i] = (modIndex >= 0)? modPoly.getAt(modIndex) : 0;
        }
      }

      var totalCodeCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalCodeCount += rsBlocks[i].totalCount;
      }

      var data = new Array(totalCodeCount);
      var index = 0;

      for (var i = 0; i < maxDcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < dcdata[r].length) {
            data[index] = dcdata[r][i];
            index += 1;
          }
        }
      }

      for (var i = 0; i < maxEcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < ecdata[r].length) {
            data[index] = ecdata[r][i];
            index += 1;
          }
        }
      }

      return data;
    };

    var createData = function(typeNumber, errorCorrectionLevel, dataList) {

      var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel);

      var buffer = qrBitBuffer();

      for (var i = 0; i < dataList.length; i += 1) {
        var data = dataList[i];
        buffer.put(data.getMode(), 4);
        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
        data.write(buffer);
      }

      // calc num max data.
      var totalDataCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalDataCount += rsBlocks[i].dataCount;
      }

      if (buffer.getLengthInBits() > totalDataCount * 8) {
        throw 'code length overflow. ('
          + buffer.getLengthInBits()
          + '>'
          + totalDataCount * 8
          + ')';
      }

      // end code
      if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
        buffer.put(0, 4);
      }

      // padding
      while (buffer.getLengthInBits() % 8 != 0) {
        buffer.putBit(false);
      }

      // padding
      while (true) {

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD0, 8);

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD1, 8);
      }

      return createBytes(buffer, rsBlocks);
    };

    _this.addData = function(data, mode) {

      mode = mode || 'Byte';

      var newData = null;

      switch(mode) {
      case 'Numeric' :
        newData = qrNumber(data);
        break;
      case 'Alphanumeric' :
        newData = qrAlphaNum(data);
        break;
      case 'Byte' :
        newData = qr8BitByte(data);
        break;
      case 'Kanji' :
        newData = qrKanji(data);
        break;
      default :
        throw 'mode:' + mode;
      }

      _dataList.push(newData);
      _dataCache = null;
    };

    _this.isDark = function(row, col) {
      if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
        throw row + ',' + col;
      }
      return _modules[row][col];
    };

    _this.getModuleCount = function() {
      return _moduleCount;
    };

    _this.make = function() {
      if (_typeNumber < 1) {
        var typeNumber = 1;

        for (; typeNumber < 40; typeNumber++) {
          var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, _errorCorrectionLevel);
          var buffer = qrBitBuffer();

          for (var i = 0; i < _dataList.length; i++) {
            var data = _dataList[i];
            buffer.put(data.getMode(), 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
            data.write(buffer);
          }

          var totalDataCount = 0;
          for (var i = 0; i < rsBlocks.length; i++) {
            totalDataCount += rsBlocks[i].dataCount;
          }

          if (buffer.getLengthInBits() <= totalDataCount * 8) {
            break;
          }
        }

        _typeNumber = typeNumber;
      }

      makeImpl(false, getBestMaskPattern() );
    };

    _this.createTableTag = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var qrHtml = '';

      qrHtml += '<table style="';
      qrHtml += ' border-width: 0px; border-style: none;';
      qrHtml += ' border-collapse: collapse;';
      qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
      qrHtml += '">';
      qrHtml += '<tbody>';

      for (var r = 0; r < _this.getModuleCount(); r += 1) {

        qrHtml += '<tr>';

        for (var c = 0; c < _this.getModuleCount(); c += 1) {
          qrHtml += '<td style="';
          qrHtml += ' border-width: 0px; border-style: none;';
          qrHtml += ' border-collapse: collapse;';
          qrHtml += ' padding: 0px; margin: 0px;';
          qrHtml += ' width: ' + cellSize + 'px;';
          qrHtml += ' height: ' + cellSize + 'px;';
          qrHtml += ' background-color: ';
          qrHtml += _this.isDark(r, c)? '#000000' : '#ffffff';
          qrHtml += ';';
          qrHtml += '"/>';
        }

        qrHtml += '</tr>';
      }

      qrHtml += '</tbody>';
      qrHtml += '</table>';

      return qrHtml;
    };

    _this.createSvgTag = function(cellSize, margin, alt, title) {

      var opts = {};
      if (typeof arguments[0] == 'object') {
        // Called by options.
        opts = arguments[0];
        // overwrite cellSize and margin.
        cellSize = opts.cellSize;
        margin = opts.margin;
        alt = opts.alt;
        title = opts.title;
      }

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      // Compose alt property surrogate
      alt = (typeof alt === 'string') ? {text: alt} : alt || {};
      alt.text = alt.text || null;
      alt.id = (alt.text) ? alt.id || 'qrcode-description' : null;

      // Compose title property surrogate
      title = (typeof title === 'string') ? {text: title} : title || {};
      title.text = title.text || null;
      title.id = (title.text) ? title.id || 'qrcode-title' : null;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var c, mc, r, mr, qrSvg='', rect;

      rect = 'l' + cellSize + ',0 0,' + cellSize +
        ' -' + cellSize + ',0 0,-' + cellSize + 'z ';

      qrSvg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
      qrSvg += !opts.scalable ? ' width="' + size + 'px" height="' + size + 'px"' : '';
      qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '" ';
      qrSvg += ' preserveAspectRatio="xMinYMin meet"';
      qrSvg += (title.text || alt.text) ? ' role="img" aria-labelledby="' +
          escapeXml([title.id, alt.id].join(' ').trim() ) + '"' : '';
      qrSvg += '>';
      qrSvg += (title.text) ? '<title id="' + escapeXml(title.id) + '">' +
          escapeXml(title.text) + '</title>' : '';
      qrSvg += (alt.text) ? '<description id="' + escapeXml(alt.id) + '">' +
          escapeXml(alt.text) + '</description>' : '';
      qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
      qrSvg += '<path d="';

      for (r = 0; r < _this.getModuleCount(); r += 1) {
        mr = r * cellSize + margin;
        for (c = 0; c < _this.getModuleCount(); c += 1) {
          if (_this.isDark(r, c) ) {
            mc = c*cellSize+margin;
            qrSvg += 'M' + mc + ',' + mr + rect;
          }
        }
      }

      qrSvg += '" stroke="transparent" fill="black"/>';
      qrSvg += '</svg>';

      return qrSvg;
    };

    _this.createDataURL = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      return createDataURL(size, size, function(x, y) {
        if (min <= x && x < max && min <= y && y < max) {
          var c = Math.floor( (x - min) / cellSize);
          var r = Math.floor( (y - min) / cellSize);
          return _this.isDark(r, c)? 0 : 1;
        } else {
          return 1;
        }
      } );
    };

    _this.createImgTag = function(cellSize, margin, alt) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;

      var img = '';
      img += '<img';
      img += '\u0020src="';
      img += _this.createDataURL(cellSize, margin);
      img += '"';
      img += '\u0020width="';
      img += size;
      img += '"';
      img += '\u0020height="';
      img += size;
      img += '"';
      if (alt) {
        img += '\u0020alt="';
        img += escapeXml(alt);
        img += '"';
      }
      img += '/>';

      return img;
    };

    var escapeXml = function(s) {
      var escaped = '';
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charAt(i);
        switch(c) {
        case '<': escaped += '&lt;'; break;
        case '>': escaped += '&gt;'; break;
        case '&': escaped += '&amp;'; break;
        case '"': escaped += '&quot;'; break;
        default : escaped += c; break;
        }
      }
      return escaped;
    };

    var _createHalfASCII = function(margin) {
      var cellSize = 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r1, r2, p;

      var blocks = {
        '██': '█',
        '█ ': '▀',
        ' █': '▄',
        '  ': ' '
      };

      var blocksLastLineNoMargin = {
        '██': '▀',
        '█ ': '▀',
        ' █': ' ',
        '  ': ' '
      };

      var ascii = '';
      for (y = 0; y < size; y += 2) {
        r1 = Math.floor((y - min) / cellSize);
        r2 = Math.floor((y + 1 - min) / cellSize);
        for (x = 0; x < size; x += 1) {
          p = '█';

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r1, Math.floor((x - min) / cellSize))) {
            p = ' ';
          }

          if (min <= x && x < max && min <= y+1 && y+1 < max && _this.isDark(r2, Math.floor((x - min) / cellSize))) {
            p += ' ';
          }
          else {
            p += '█';
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          ascii += (margin < 1 && y+1 >= max) ? blocksLastLineNoMargin[p] : blocks[p];
        }

        ascii += '\n';
      }

      if (size % 2 && margin > 0) {
        return ascii.substring(0, ascii.length - size - 1) + Array(size+1).join('▀');
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.createASCII = function(cellSize, margin) {
      cellSize = cellSize || 1;

      if (cellSize < 2) {
        return _createHalfASCII(margin);
      }

      cellSize -= 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r, p;

      var white = Array(cellSize+1).join('██');
      var black = Array(cellSize+1).join('  ');

      var ascii = '';
      var line = '';
      for (y = 0; y < size; y += 1) {
        r = Math.floor( (y - min) / cellSize);
        line = '';
        for (x = 0; x < size; x += 1) {
          p = 1;

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r, Math.floor((x - min) / cellSize))) {
            p = 0;
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          line += p ? white : black;
        }

        for (r = 0; r < cellSize; r += 1) {
          ascii += line + '\n';
        }
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.renderTo2dContext = function(context, cellSize) {
      cellSize = cellSize || 2;
      var length = _this.getModuleCount();
      for (var row = 0; row < length; row++) {
        for (var col = 0; col < length; col++) {
          context.fillStyle = _this.isDark(row, col) ? 'black' : 'white';
          context.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
        }
      }
    }

    return _this;
  };

  //---------------------------------------------------------------------
  // qrcode.stringToBytes
  //---------------------------------------------------------------------

  qrcode.stringToBytesFuncs = {
    'default' : function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        bytes.push(c & 0xff);
      }
      return bytes;
    }
  };

  qrcode.stringToBytes = qrcode.stringToBytesFuncs['default'];

  //---------------------------------------------------------------------
  // qrcode.createStringToBytes
  //---------------------------------------------------------------------

  /**
   * @param unicodeData base64 string of byte array.
   * [16bit Unicode],[16bit Bytes], ...
   * @param numChars
   */
  qrcode.createStringToBytes = function(unicodeData, numChars) {

    // create conversion map.

    var unicodeMap = function() {

      var bin = base64DecodeInputStream(unicodeData);
      var read = function() {
        var b = bin.read();
        if (b == -1) throw 'eof';
        return b;
      };

      var count = 0;
      var unicodeMap = {};
      while (true) {
        var b0 = bin.read();
        if (b0 == -1) break;
        var b1 = read();
        var b2 = read();
        var b3 = read();
        var k = String.fromCharCode( (b0 << 8) | b1);
        var v = (b2 << 8) | b3;
        unicodeMap[k] = v;
        count += 1;
      }
      if (count != numChars) {
        throw count + ' != ' + numChars;
      }

      return unicodeMap;
    }();

    var unknownChar = '?'.charCodeAt(0);

    return function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        if (c < 128) {
          bytes.push(c);
        } else {
          var b = unicodeMap[s.charAt(i)];
          if (typeof b == 'number') {
            if ( (b & 0xff) == b) {
              // 1byte
              bytes.push(b);
            } else {
              // 2bytes
              bytes.push(b >>> 8);
              bytes.push(b & 0xff);
            }
          } else {
            bytes.push(unknownChar);
          }
        }
      }
      return bytes;
    };
  };

  //---------------------------------------------------------------------
  // QRMode
  //---------------------------------------------------------------------

  var QRMode = {
    MODE_NUMBER :    1 << 0,
    MODE_ALPHA_NUM : 1 << 1,
    MODE_8BIT_BYTE : 1 << 2,
    MODE_KANJI :     1 << 3
  };

  //---------------------------------------------------------------------
  // QRErrorCorrectionLevel
  //---------------------------------------------------------------------

  var QRErrorCorrectionLevel = {
    L : 1,
    M : 0,
    Q : 3,
    H : 2
  };

  //---------------------------------------------------------------------
  // QRMaskPattern
  //---------------------------------------------------------------------

  var QRMaskPattern = {
    PATTERN000 : 0,
    PATTERN001 : 1,
    PATTERN010 : 2,
    PATTERN011 : 3,
    PATTERN100 : 4,
    PATTERN101 : 5,
    PATTERN110 : 6,
    PATTERN111 : 7
  };

  //---------------------------------------------------------------------
  // QRUtil
  //---------------------------------------------------------------------

  var QRUtil = function() {

    var PATTERN_POSITION_TABLE = [
      [],
      [6, 18],
      [6, 22],
      [6, 26],
      [6, 30],
      [6, 34],
      [6, 22, 38],
      [6, 24, 42],
      [6, 26, 46],
      [6, 28, 50],
      [6, 30, 54],
      [6, 32, 58],
      [6, 34, 62],
      [6, 26, 46, 66],
      [6, 26, 48, 70],
      [6, 26, 50, 74],
      [6, 30, 54, 78],
      [6, 30, 56, 82],
      [6, 30, 58, 86],
      [6, 34, 62, 90],
      [6, 28, 50, 72, 94],
      [6, 26, 50, 74, 98],
      [6, 30, 54, 78, 102],
      [6, 28, 54, 80, 106],
      [6, 32, 58, 84, 110],
      [6, 30, 58, 86, 114],
      [6, 34, 62, 90, 118],
      [6, 26, 50, 74, 98, 122],
      [6, 30, 54, 78, 102, 126],
      [6, 26, 52, 78, 104, 130],
      [6, 30, 56, 82, 108, 134],
      [6, 34, 60, 86, 112, 138],
      [6, 30, 58, 86, 114, 142],
      [6, 34, 62, 90, 118, 146],
      [6, 30, 54, 78, 102, 126, 150],
      [6, 24, 50, 76, 102, 128, 154],
      [6, 28, 54, 80, 106, 132, 158],
      [6, 32, 58, 84, 110, 136, 162],
      [6, 26, 54, 82, 110, 138, 166],
      [6, 30, 58, 86, 114, 142, 170]
    ];
    var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
    var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

    var _this = {};

    var getBCHDigit = function(data) {
      var digit = 0;
      while (data != 0) {
        digit += 1;
        data >>>= 1;
      }
      return digit;
    };

    _this.getBCHTypeInfo = function(data) {
      var d = data << 10;
      while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
        d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15) ) );
      }
      return ( (data << 10) | d) ^ G15_MASK;
    };

    _this.getBCHTypeNumber = function(data) {
      var d = data << 12;
      while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
        d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18) ) );
      }
      return (data << 12) | d;
    };

    _this.getPatternPosition = function(typeNumber) {
      return PATTERN_POSITION_TABLE[typeNumber - 1];
    };

    _this.getMaskFunction = function(maskPattern) {

      switch (maskPattern) {

      case QRMaskPattern.PATTERN000 :
        return function(i, j) { return (i + j) % 2 == 0; };
      case QRMaskPattern.PATTERN001 :
        return function(i, j) { return i % 2 == 0; };
      case QRMaskPattern.PATTERN010 :
        return function(i, j) { return j % 3 == 0; };
      case QRMaskPattern.PATTERN011 :
        return function(i, j) { return (i + j) % 3 == 0; };
      case QRMaskPattern.PATTERN100 :
        return function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0; };
      case QRMaskPattern.PATTERN101 :
        return function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
      case QRMaskPattern.PATTERN110 :
        return function(i, j) { return ( (i * j) % 2 + (i * j) % 3) % 2 == 0; };
      case QRMaskPattern.PATTERN111 :
        return function(i, j) { return ( (i * j) % 3 + (i + j) % 2) % 2 == 0; };

      default :
        throw 'bad maskPattern:' + maskPattern;
      }
    };

    _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
      var a = qrPolynomial([1], 0);
      for (var i = 0; i < errorCorrectLength; i += 1) {
        a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0) );
      }
      return a;
    };

    _this.getLengthInBits = function(mode, type) {

      if (1 <= type && type < 10) {

        // 1 - 9

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 10;
        case QRMode.MODE_ALPHA_NUM : return 9;
        case QRMode.MODE_8BIT_BYTE : return 8;
        case QRMode.MODE_KANJI     : return 8;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 27) {

        // 10 - 26

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 12;
        case QRMode.MODE_ALPHA_NUM : return 11;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 10;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 41) {

        // 27 - 40

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 14;
        case QRMode.MODE_ALPHA_NUM : return 13;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 12;
        default :
          throw 'mode:' + mode;
        }

      } else {
        throw 'type:' + type;
      }
    };

    _this.getLostPoint = function(qrcode) {

      var moduleCount = qrcode.getModuleCount();

      var lostPoint = 0;

      // LEVEL1

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount; col += 1) {

          var sameCount = 0;
          var dark = qrcode.isDark(row, col);

          for (var r = -1; r <= 1; r += 1) {

            if (row + r < 0 || moduleCount <= row + r) {
              continue;
            }

            for (var c = -1; c <= 1; c += 1) {

              if (col + c < 0 || moduleCount <= col + c) {
                continue;
              }

              if (r == 0 && c == 0) {
                continue;
              }

              if (dark == qrcode.isDark(row + r, col + c) ) {
                sameCount += 1;
              }
            }
          }

          if (sameCount > 5) {
            lostPoint += (3 + sameCount - 5);
          }
        }
      };

      // LEVEL2

      for (var row = 0; row < moduleCount - 1; row += 1) {
        for (var col = 0; col < moduleCount - 1; col += 1) {
          var count = 0;
          if (qrcode.isDark(row, col) ) count += 1;
          if (qrcode.isDark(row + 1, col) ) count += 1;
          if (qrcode.isDark(row, col + 1) ) count += 1;
          if (qrcode.isDark(row + 1, col + 1) ) count += 1;
          if (count == 0 || count == 4) {
            lostPoint += 3;
          }
        }
      }

      // LEVEL3

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount - 6; col += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row, col + 1)
              &&  qrcode.isDark(row, col + 2)
              &&  qrcode.isDark(row, col + 3)
              &&  qrcode.isDark(row, col + 4)
              && !qrcode.isDark(row, col + 5)
              &&  qrcode.isDark(row, col + 6) ) {
            lostPoint += 40;
          }
        }
      }

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount - 6; row += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row + 1, col)
              &&  qrcode.isDark(row + 2, col)
              &&  qrcode.isDark(row + 3, col)
              &&  qrcode.isDark(row + 4, col)
              && !qrcode.isDark(row + 5, col)
              &&  qrcode.isDark(row + 6, col) ) {
            lostPoint += 40;
          }
        }
      }

      // LEVEL4

      var darkCount = 0;

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount; row += 1) {
          if (qrcode.isDark(row, col) ) {
            darkCount += 1;
          }
        }
      }

      var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
      lostPoint += ratio * 10;

      return lostPoint;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // QRMath
  //---------------------------------------------------------------------

  var QRMath = function() {

    var EXP_TABLE = new Array(256);
    var LOG_TABLE = new Array(256);

    // initialize tables
    for (var i = 0; i < 8; i += 1) {
      EXP_TABLE[i] = 1 << i;
    }
    for (var i = 8; i < 256; i += 1) {
      EXP_TABLE[i] = EXP_TABLE[i - 4]
        ^ EXP_TABLE[i - 5]
        ^ EXP_TABLE[i - 6]
        ^ EXP_TABLE[i - 8];
    }
    for (var i = 0; i < 255; i += 1) {
      LOG_TABLE[EXP_TABLE[i] ] = i;
    }

    var _this = {};

    _this.glog = function(n) {

      if (n < 1) {
        throw 'glog(' + n + ')';
      }

      return LOG_TABLE[n];
    };

    _this.gexp = function(n) {

      while (n < 0) {
        n += 255;
      }

      while (n >= 256) {
        n -= 255;
      }

      return EXP_TABLE[n];
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrPolynomial
  //---------------------------------------------------------------------

  function qrPolynomial(num, shift) {

    if (typeof num.length == 'undefined') {
      throw num.length + '/' + shift;
    }

    var _num = function() {
      var offset = 0;
      while (offset < num.length && num[offset] == 0) {
        offset += 1;
      }
      var _num = new Array(num.length - offset + shift);
      for (var i = 0; i < num.length - offset; i += 1) {
        _num[i] = num[i + offset];
      }
      return _num;
    }();

    var _this = {};

    _this.getAt = function(index) {
      return _num[index];
    };

    _this.getLength = function() {
      return _num.length;
    };

    _this.multiply = function(e) {

      var num = new Array(_this.getLength() + e.getLength() - 1);

      for (var i = 0; i < _this.getLength(); i += 1) {
        for (var j = 0; j < e.getLength(); j += 1) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i) ) + QRMath.glog(e.getAt(j) ) );
        }
      }

      return qrPolynomial(num, 0);
    };

    _this.mod = function(e) {

      if (_this.getLength() - e.getLength() < 0) {
        return _this;
      }

      var ratio = QRMath.glog(_this.getAt(0) ) - QRMath.glog(e.getAt(0) );

      var num = new Array(_this.getLength() );
      for (var i = 0; i < _this.getLength(); i += 1) {
        num[i] = _this.getAt(i);
      }

      for (var i = 0; i < e.getLength(); i += 1) {
        num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i) ) + ratio);
      }

      // recursive call
      return qrPolynomial(num, 0).mod(e);
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // QRRSBlock
  //---------------------------------------------------------------------

  var QRRSBlock = function() {

    var RS_BLOCK_TABLE = [

      // L
      // M
      // Q
      // H

      // 1
      [1, 26, 19],
      [1, 26, 16],
      [1, 26, 13],
      [1, 26, 9],

      // 2
      [1, 44, 34],
      [1, 44, 28],
      [1, 44, 22],
      [1, 44, 16],

      // 3
      [1, 70, 55],
      [1, 70, 44],
      [2, 35, 17],
      [2, 35, 13],

      // 4
      [1, 100, 80],
      [2, 50, 32],
      [2, 50, 24],
      [4, 25, 9],

      // 5
      [1, 134, 108],
      [2, 67, 43],
      [2, 33, 15, 2, 34, 16],
      [2, 33, 11, 2, 34, 12],

      // 6
      [2, 86, 68],
      [4, 43, 27],
      [4, 43, 19],
      [4, 43, 15],

      // 7
      [2, 98, 78],
      [4, 49, 31],
      [2, 32, 14, 4, 33, 15],
      [4, 39, 13, 1, 40, 14],

      // 8
      [2, 121, 97],
      [2, 60, 38, 2, 61, 39],
      [4, 40, 18, 2, 41, 19],
      [4, 40, 14, 2, 41, 15],

      // 9
      [2, 146, 116],
      [3, 58, 36, 2, 59, 37],
      [4, 36, 16, 4, 37, 17],
      [4, 36, 12, 4, 37, 13],

      // 10
      [2, 86, 68, 2, 87, 69],
      [4, 69, 43, 1, 70, 44],
      [6, 43, 19, 2, 44, 20],
      [6, 43, 15, 2, 44, 16],

      // 11
      [4, 101, 81],
      [1, 80, 50, 4, 81, 51],
      [4, 50, 22, 4, 51, 23],
      [3, 36, 12, 8, 37, 13],

      // 12
      [2, 116, 92, 2, 117, 93],
      [6, 58, 36, 2, 59, 37],
      [4, 46, 20, 6, 47, 21],
      [7, 42, 14, 4, 43, 15],

      // 13
      [4, 133, 107],
      [8, 59, 37, 1, 60, 38],
      [8, 44, 20, 4, 45, 21],
      [12, 33, 11, 4, 34, 12],

      // 14
      [3, 145, 115, 1, 146, 116],
      [4, 64, 40, 5, 65, 41],
      [11, 36, 16, 5, 37, 17],
      [11, 36, 12, 5, 37, 13],

      // 15
      [5, 109, 87, 1, 110, 88],
      [5, 65, 41, 5, 66, 42],
      [5, 54, 24, 7, 55, 25],
      [11, 36, 12, 7, 37, 13],

      // 16
      [5, 122, 98, 1, 123, 99],
      [7, 73, 45, 3, 74, 46],
      [15, 43, 19, 2, 44, 20],
      [3, 45, 15, 13, 46, 16],

      // 17
      [1, 135, 107, 5, 136, 108],
      [10, 74, 46, 1, 75, 47],
      [1, 50, 22, 15, 51, 23],
      [2, 42, 14, 17, 43, 15],

      // 18
      [5, 150, 120, 1, 151, 121],
      [9, 69, 43, 4, 70, 44],
      [17, 50, 22, 1, 51, 23],
      [2, 42, 14, 19, 43, 15],

      // 19
      [3, 141, 113, 4, 142, 114],
      [3, 70, 44, 11, 71, 45],
      [17, 47, 21, 4, 48, 22],
      [9, 39, 13, 16, 40, 14],

      // 20
      [3, 135, 107, 5, 136, 108],
      [3, 67, 41, 13, 68, 42],
      [15, 54, 24, 5, 55, 25],
      [15, 43, 15, 10, 44, 16],

      // 21
      [4, 144, 116, 4, 145, 117],
      [17, 68, 42],
      [17, 50, 22, 6, 51, 23],
      [19, 46, 16, 6, 47, 17],

      // 22
      [2, 139, 111, 7, 140, 112],
      [17, 74, 46],
      [7, 54, 24, 16, 55, 25],
      [34, 37, 13],

      // 23
      [4, 151, 121, 5, 152, 122],
      [4, 75, 47, 14, 76, 48],
      [11, 54, 24, 14, 55, 25],
      [16, 45, 15, 14, 46, 16],

      // 24
      [6, 147, 117, 4, 148, 118],
      [6, 73, 45, 14, 74, 46],
      [11, 54, 24, 16, 55, 25],
      [30, 46, 16, 2, 47, 17],

      // 25
      [8, 132, 106, 4, 133, 107],
      [8, 75, 47, 13, 76, 48],
      [7, 54, 24, 22, 55, 25],
      [22, 45, 15, 13, 46, 16],

      // 26
      [10, 142, 114, 2, 143, 115],
      [19, 74, 46, 4, 75, 47],
      [28, 50, 22, 6, 51, 23],
      [33, 46, 16, 4, 47, 17],

      // 27
      [8, 152, 122, 4, 153, 123],
      [22, 73, 45, 3, 74, 46],
      [8, 53, 23, 26, 54, 24],
      [12, 45, 15, 28, 46, 16],

      // 28
      [3, 147, 117, 10, 148, 118],
      [3, 73, 45, 23, 74, 46],
      [4, 54, 24, 31, 55, 25],
      [11, 45, 15, 31, 46, 16],

      // 29
      [7, 146, 116, 7, 147, 117],
      [21, 73, 45, 7, 74, 46],
      [1, 53, 23, 37, 54, 24],
      [19, 45, 15, 26, 46, 16],

      // 30
      [5, 145, 115, 10, 146, 116],
      [19, 75, 47, 10, 76, 48],
      [15, 54, 24, 25, 55, 25],
      [23, 45, 15, 25, 46, 16],

      // 31
      [13, 145, 115, 3, 146, 116],
      [2, 74, 46, 29, 75, 47],
      [42, 54, 24, 1, 55, 25],
      [23, 45, 15, 28, 46, 16],

      // 32
      [17, 145, 115],
      [10, 74, 46, 23, 75, 47],
      [10, 54, 24, 35, 55, 25],
      [19, 45, 15, 35, 46, 16],

      // 33
      [17, 145, 115, 1, 146, 116],
      [14, 74, 46, 21, 75, 47],
      [29, 54, 24, 19, 55, 25],
      [11, 45, 15, 46, 46, 16],

      // 34
      [13, 145, 115, 6, 146, 116],
      [14, 74, 46, 23, 75, 47],
      [44, 54, 24, 7, 55, 25],
      [59, 46, 16, 1, 47, 17],

      // 35
      [12, 151, 121, 7, 152, 122],
      [12, 75, 47, 26, 76, 48],
      [39, 54, 24, 14, 55, 25],
      [22, 45, 15, 41, 46, 16],

      // 36
      [6, 151, 121, 14, 152, 122],
      [6, 75, 47, 34, 76, 48],
      [46, 54, 24, 10, 55, 25],
      [2, 45, 15, 64, 46, 16],

      // 37
      [17, 152, 122, 4, 153, 123],
      [29, 74, 46, 14, 75, 47],
      [49, 54, 24, 10, 55, 25],
      [24, 45, 15, 46, 46, 16],

      // 38
      [4, 152, 122, 18, 153, 123],
      [13, 74, 46, 32, 75, 47],
      [48, 54, 24, 14, 55, 25],
      [42, 45, 15, 32, 46, 16],

      // 39
      [20, 147, 117, 4, 148, 118],
      [40, 75, 47, 7, 76, 48],
      [43, 54, 24, 22, 55, 25],
      [10, 45, 15, 67, 46, 16],

      // 40
      [19, 148, 118, 6, 149, 119],
      [18, 75, 47, 31, 76, 48],
      [34, 54, 24, 34, 55, 25],
      [20, 45, 15, 61, 46, 16]
    ];

    var qrRSBlock = function(totalCount, dataCount) {
      var _this = {};
      _this.totalCount = totalCount;
      _this.dataCount = dataCount;
      return _this;
    };

    var _this = {};

    var getRsBlockTable = function(typeNumber, errorCorrectionLevel) {

      switch(errorCorrectionLevel) {
      case QRErrorCorrectionLevel.L :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
      case QRErrorCorrectionLevel.M :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
      case QRErrorCorrectionLevel.Q :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
      case QRErrorCorrectionLevel.H :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
      default :
        return undefined;
      }
    };

    _this.getRSBlocks = function(typeNumber, errorCorrectionLevel) {

      var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);

      if (typeof rsBlock == 'undefined') {
        throw 'bad rs block @ typeNumber:' + typeNumber +
            '/errorCorrectionLevel:' + errorCorrectionLevel;
      }

      var length = rsBlock.length / 3;

      var list = [];

      for (var i = 0; i < length; i += 1) {

        var count = rsBlock[i * 3 + 0];
        var totalCount = rsBlock[i * 3 + 1];
        var dataCount = rsBlock[i * 3 + 2];

        for (var j = 0; j < count; j += 1) {
          list.push(qrRSBlock(totalCount, dataCount) );
        }
      }

      return list;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrBitBuffer
  //---------------------------------------------------------------------

  var qrBitBuffer = function() {

    var _buffer = [];
    var _length = 0;

    var _this = {};

    _this.getBuffer = function() {
      return _buffer;
    };

    _this.getAt = function(index) {
      var bufIndex = Math.floor(index / 8);
      return ( (_buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
    };

    _this.put = function(num, length) {
      for (var i = 0; i < length; i += 1) {
        _this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
      }
    };

    _this.getLengthInBits = function() {
      return _length;
    };

    _this.putBit = function(bit) {

      var bufIndex = Math.floor(_length / 8);
      if (_buffer.length <= bufIndex) {
        _buffer.push(0);
      }

      if (bit) {
        _buffer[bufIndex] |= (0x80 >>> (_length % 8) );
      }

      _length += 1;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrNumber
  //---------------------------------------------------------------------

  var qrNumber = function(data) {

    var _mode = QRMode.MODE_NUMBER;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var data = _data;

      var i = 0;

      while (i + 2 < data.length) {
        buffer.put(strToNum(data.substring(i, i + 3) ), 10);
        i += 3;
      }

      if (i < data.length) {
        if (data.length - i == 1) {
          buffer.put(strToNum(data.substring(i, i + 1) ), 4);
        } else if (data.length - i == 2) {
          buffer.put(strToNum(data.substring(i, i + 2) ), 7);
        }
      }
    };

    var strToNum = function(s) {
      var num = 0;
      for (var i = 0; i < s.length; i += 1) {
        num = num * 10 + chatToNum(s.charAt(i) );
      }
      return num;
    };

    var chatToNum = function(c) {
      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      }
      throw 'illegal char :' + c;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrAlphaNum
  //---------------------------------------------------------------------

  var qrAlphaNum = function(data) {

    var _mode = QRMode.MODE_ALPHA_NUM;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var s = _data;

      var i = 0;

      while (i + 1 < s.length) {
        buffer.put(
          getCode(s.charAt(i) ) * 45 +
          getCode(s.charAt(i + 1) ), 11);
        i += 2;
      }

      if (i < s.length) {
        buffer.put(getCode(s.charAt(i) ), 6);
      }
    };

    var getCode = function(c) {

      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      } else if ('A' <= c && c <= 'Z') {
        return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
      } else {
        switch (c) {
        case ' ' : return 36;
        case '$' : return 37;
        case '%' : return 38;
        case '*' : return 39;
        case '+' : return 40;
        case '-' : return 41;
        case '.' : return 42;
        case '/' : return 43;
        case ':' : return 44;
        default :
          throw 'illegal char :' + c;
        }
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qr8BitByte
  //---------------------------------------------------------------------

  var qr8BitByte = function(data) {

    var _mode = QRMode.MODE_8BIT_BYTE;
    var _data = data;
    var _bytes = qrcode.stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _bytes.length;
    };

    _this.write = function(buffer) {
      for (var i = 0; i < _bytes.length; i += 1) {
        buffer.put(_bytes[i], 8);
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrKanji
  //---------------------------------------------------------------------

  var qrKanji = function(data) {

    var _mode = QRMode.MODE_KANJI;
    var _data = data;

    var stringToBytes = qrcode.stringToBytesFuncs['SJIS'];
    if (!stringToBytes) {
      throw 'sjis not supported.';
    }
    !function(c, code) {
      // self test for sjis support.
      var test = stringToBytes(c);
      if (test.length != 2 || ( (test[0] << 8) | test[1]) != code) {
        throw 'sjis not supported.';
      }
    }('\u53cb', 0x9746);

    var _bytes = stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return ~~(_bytes.length / 2);
    };

    _this.write = function(buffer) {

      var data = _bytes;

      var i = 0;

      while (i + 1 < data.length) {

        var c = ( (0xff & data[i]) << 8) | (0xff & data[i + 1]);

        if (0x8140 <= c && c <= 0x9FFC) {
          c -= 0x8140;
        } else if (0xE040 <= c && c <= 0xEBBF) {
          c -= 0xC140;
        } else {
          throw 'illegal char at ' + (i + 1) + '/' + c;
        }

        c = ( (c >>> 8) & 0xff) * 0xC0 + (c & 0xff);

        buffer.put(c, 13);

        i += 2;
      }

      if (i < data.length) {
        throw 'illegal char at ' + (i + 1);
      }
    };

    return _this;
  };

  //=====================================================================
  // GIF Support etc.
  //

  //---------------------------------------------------------------------
  // byteArrayOutputStream
  //---------------------------------------------------------------------

  var byteArrayOutputStream = function() {

    var _bytes = [];

    var _this = {};

    _this.writeByte = function(b) {
      _bytes.push(b & 0xff);
    };

    _this.writeShort = function(i) {
      _this.writeByte(i);
      _this.writeByte(i >>> 8);
    };

    _this.writeBytes = function(b, off, len) {
      off = off || 0;
      len = len || b.length;
      for (var i = 0; i < len; i += 1) {
        _this.writeByte(b[i + off]);
      }
    };

    _this.writeString = function(s) {
      for (var i = 0; i < s.length; i += 1) {
        _this.writeByte(s.charCodeAt(i) );
      }
    };

    _this.toByteArray = function() {
      return _bytes;
    };

    _this.toString = function() {
      var s = '';
      s += '[';
      for (var i = 0; i < _bytes.length; i += 1) {
        if (i > 0) {
          s += ',';
        }
        s += _bytes[i];
      }
      s += ']';
      return s;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64EncodeOutputStream
  //---------------------------------------------------------------------

  var base64EncodeOutputStream = function() {

    var _buffer = 0;
    var _buflen = 0;
    var _length = 0;
    var _base64 = '';

    var _this = {};

    var writeEncoded = function(b) {
      _base64 += String.fromCharCode(encode(b & 0x3f) );
    };

    var encode = function(n) {
      if (n < 0) {
        // error.
      } else if (n < 26) {
        return 0x41 + n;
      } else if (n < 52) {
        return 0x61 + (n - 26);
      } else if (n < 62) {
        return 0x30 + (n - 52);
      } else if (n == 62) {
        return 0x2b;
      } else if (n == 63) {
        return 0x2f;
      }
      throw 'n:' + n;
    };

    _this.writeByte = function(n) {

      _buffer = (_buffer << 8) | (n & 0xff);
      _buflen += 8;
      _length += 1;

      while (_buflen >= 6) {
        writeEncoded(_buffer >>> (_buflen - 6) );
        _buflen -= 6;
      }
    };

    _this.flush = function() {

      if (_buflen > 0) {
        writeEncoded(_buffer << (6 - _buflen) );
        _buffer = 0;
        _buflen = 0;
      }

      if (_length % 3 != 0) {
        // padding
        var padlen = 3 - _length % 3;
        for (var i = 0; i < padlen; i += 1) {
          _base64 += '=';
        }
      }
    };

    _this.toString = function() {
      return _base64;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64DecodeInputStream
  //---------------------------------------------------------------------

  var base64DecodeInputStream = function(str) {

    var _str = str;
    var _pos = 0;
    var _buffer = 0;
    var _buflen = 0;

    var _this = {};

    _this.read = function() {

      while (_buflen < 8) {

        if (_pos >= _str.length) {
          if (_buflen == 0) {
            return -1;
          }
          throw 'unexpected end of file./' + _buflen;
        }

        var c = _str.charAt(_pos);
        _pos += 1;

        if (c == '=') {
          _buflen = 0;
          return -1;
        } else if (c.match(/^\s$/) ) {
          // ignore if whitespace.
          continue;
        }

        _buffer = (_buffer << 6) | decode(c.charCodeAt(0) );
        _buflen += 6;
      }

      var n = (_buffer >>> (_buflen - 8) ) & 0xff;
      _buflen -= 8;
      return n;
    };

    var decode = function(c) {
      if (0x41 <= c && c <= 0x5a) {
        return c - 0x41;
      } else if (0x61 <= c && c <= 0x7a) {
        return c - 0x61 + 26;
      } else if (0x30 <= c && c <= 0x39) {
        return c - 0x30 + 52;
      } else if (c == 0x2b) {
        return 62;
      } else if (c == 0x2f) {
        return 63;
      } else {
        throw 'c:' + c;
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // gifImage (B/W)
  //---------------------------------------------------------------------

  var gifImage = function(width, height) {

    var _width = width;
    var _height = height;
    var _data = new Array(width * height);

    var _this = {};

    _this.setPixel = function(x, y, pixel) {
      _data[y * _width + x] = pixel;
    };

    _this.write = function(out) {

      //---------------------------------
      // GIF Signature

      out.writeString('GIF87a');

      //---------------------------------
      // Screen Descriptor

      out.writeShort(_width);
      out.writeShort(_height);

      out.writeByte(0x80); // 2bit
      out.writeByte(0);
      out.writeByte(0);

      //---------------------------------
      // Global Color Map

      // black
      out.writeByte(0x00);
      out.writeByte(0x00);
      out.writeByte(0x00);

      // white
      out.writeByte(0xff);
      out.writeByte(0xff);
      out.writeByte(0xff);

      //---------------------------------
      // Image Descriptor

      out.writeString(',');
      out.writeShort(0);
      out.writeShort(0);
      out.writeShort(_width);
      out.writeShort(_height);
      out.writeByte(0);

      //---------------------------------
      // Local Color Map

      //---------------------------------
      // Raster Data

      var lzwMinCodeSize = 2;
      var raster = getLZWRaster(lzwMinCodeSize);

      out.writeByte(lzwMinCodeSize);

      var offset = 0;

      while (raster.length - offset > 255) {
        out.writeByte(255);
        out.writeBytes(raster, offset, 255);
        offset += 255;
      }

      out.writeByte(raster.length - offset);
      out.writeBytes(raster, offset, raster.length - offset);
      out.writeByte(0x00);

      //---------------------------------
      // GIF Terminator
      out.writeString(';');
    };

    var bitOutputStream = function(out) {

      var _out = out;
      var _bitLength = 0;
      var _bitBuffer = 0;

      var _this = {};

      _this.write = function(data, length) {

        if ( (data >>> length) != 0) {
          throw 'length over';
        }

        while (_bitLength + length >= 8) {
          _out.writeByte(0xff & ( (data << _bitLength) | _bitBuffer) );
          length -= (8 - _bitLength);
          data >>>= (8 - _bitLength);
          _bitBuffer = 0;
          _bitLength = 0;
        }

        _bitBuffer = (data << _bitLength) | _bitBuffer;
        _bitLength = _bitLength + length;
      };

      _this.flush = function() {
        if (_bitLength > 0) {
          _out.writeByte(_bitBuffer);
        }
      };

      return _this;
    };

    var getLZWRaster = function(lzwMinCodeSize) {

      var clearCode = 1 << lzwMinCodeSize;
      var endCode = (1 << lzwMinCodeSize) + 1;
      var bitLength = lzwMinCodeSize + 1;

      // Setup LZWTable
      var table = lzwTable();

      for (var i = 0; i < clearCode; i += 1) {
        table.add(String.fromCharCode(i) );
      }
      table.add(String.fromCharCode(clearCode) );
      table.add(String.fromCharCode(endCode) );

      var byteOut = byteArrayOutputStream();
      var bitOut = bitOutputStream(byteOut);

      // clear code
      bitOut.write(clearCode, bitLength);

      var dataIndex = 0;

      var s = String.fromCharCode(_data[dataIndex]);
      dataIndex += 1;

      while (dataIndex < _data.length) {

        var c = String.fromCharCode(_data[dataIndex]);
        dataIndex += 1;

        if (table.contains(s + c) ) {

          s = s + c;

        } else {

          bitOut.write(table.indexOf(s), bitLength);

          if (table.size() < 0xfff) {

            if (table.size() == (1 << bitLength) ) {
              bitLength += 1;
            }

            table.add(s + c);
          }

          s = c;
        }
      }

      bitOut.write(table.indexOf(s), bitLength);

      // end code
      bitOut.write(endCode, bitLength);

      bitOut.flush();

      return byteOut.toByteArray();
    };

    var lzwTable = function() {

      var _map = {};
      var _size = 0;

      var _this = {};

      _this.add = function(key) {
        if (_this.contains(key) ) {
          throw 'dup key:' + key;
        }
        _map[key] = _size;
        _size += 1;
      };

      _this.size = function() {
        return _size;
      };

      _this.indexOf = function(key) {
        return _map[key];
      };

      _this.contains = function(key) {
        return typeof _map[key] != 'undefined';
      };

      return _this;
    };

    return _this;
  };

  var createDataURL = function(width, height, getPixel) {
    var gif = gifImage(width, height);
    for (var y = 0; y < height; y += 1) {
      for (var x = 0; x < width; x += 1) {
        gif.setPixel(x, y, getPixel(x, y) );
      }
    }

    var b = byteArrayOutputStream();
    gif.write(b);

    var base64 = base64EncodeOutputStream();
    var bytes = b.toByteArray();
    for (var i = 0; i < bytes.length; i += 1) {
      base64.writeByte(bytes[i]);
    }
    base64.flush();

    return 'data:image/gif;base64,' + base64;
  };

  //---------------------------------------------------------------------
  // returns qrcode function.

  return qrcode;
}();

// multibyte support
!function() {

  qrcode.stringToBytesFuncs['UTF-8'] = function(s) {
    // http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
    function toUTF8Array(str) {
      var utf8 = [];
      for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6),
              0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
          i++;
          // UTF-16 encodes 0x10000-0x10FFFF by
          // subtracting 0x10000 and splitting the
          // 20 bits of 0x0-0xFFFFF into two halves
          charcode = 0x10000 + (((charcode & 0x3ff)<<10)
            | (str.charCodeAt(i) & 0x3ff));
          utf8.push(0xf0 | (charcode >>18),
              0x80 | ((charcode>>12) & 0x3f),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
      }
      return utf8;
    }
    return toUTF8Array(s);
  };

}();

(function (factory) {
  if (typeof define === 'function' && define.amd) {
      define([], factory);
  } else if (typeof exports === 'object') {
      module.exports = factory();
  }
}(function () {
    return qrcode;
}));
//---------------------------------------------------------------------
//
// QR Code Generator for JavaScript UTF8 Support (optional)
//
// Copyright (c) 2011 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//  http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------

!function(qrcode) {

  //---------------------------------------------------------------------
  // overwrite qrcode.stringToBytes
  //---------------------------------------------------------------------

  qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];

}(qrcode);

/* =====================================================================
   Partner-Engine · gemeinsame Bausteine für App und Präsentation (Beta 0.64)
   - Vertragsbausteine (Klauseln) und ihre Auswahl je nach gebuchten Leistungen
   - Girocode (EPC-QR) für Überweisungen mit richtigem Betrag und Verwendungszweck
   - Preisrechnung wie auf dem Server (private.partner_rechnen), damit die Anzeige stimmt
   Hinweis: Die Vertragstexte sind ein Muster. Vor dem ersten Einsatz einmal juristisch prüfen lassen.
   ===================================================================== */
const PLIB={};
PLIB.ZIELE={jugend:'Jugend fördern',sichtbarkeit:'Sichtbar in der Region',netzwerk:'Netzwerk und Kontakte',mitarbeiter:'Mitarbeiter gewinnen',region:'Heimat und Region',
  gemeinschaft:'Gemeinschaft erleben',events:'Bei Events dabei',exklusiv:'Exklusiv in der Branche',digital:'Online präsent',spende:'Einfach helfen',bildung:'Gute Ausbildung'};
PLIB.BEREICHE={verein:'Der ganze Verein',erste:'1. Mannschaft',zweite:'2. Mannschaft',jugend:'Jugend',events:'Events'};
PLIB.EINHEIT={saison:'je Saison',einmalig:'einmalig',spieltag:'je Spieltag',stueck:'je Stück',frei:''};
PLIB.eur=(n,dez)=>{ const r=Math.round((+n||0)*100)/100; return r.toLocaleString('de-DE',{minimumFractionDigits:dez||!Number.isInteger(r)?2:0,maximumFractionDigits:2})+'\u00a0€'; };

// ---------- Preis rechnen (gleiche Regeln wie der Server) ----------
// Partner des Tages richtet sich nach dem Paket in der Auswahl (höchstes gilt): Club 20 €, Premium und 1896 Partner 40 € unter dem Grundpreis (189 / 169 / 149 €).
PLIB.sotdPreis=function(l,pos){ const k=(pos||[]).map(e=>e&&e.key), pk=['p1896','premium','club','supporter'].find(x=>k.includes(x)), b=+l.preis;
  return pk==='club'?Math.max(0,b-20):pk==='premium'||pk==='p1896'?Math.max(0,b-40):b; };
PLIB.rechnen=function(pos,leistungen,saisons){
  const s=Math.max(1,Math.min(5,+saisons||1)), rab=s>=3?.10:s===2?.05:0; let jahr=0,einmal=0,spende=0; const aus=[];
  (pos||[]).forEach(e=>{ const l=leistungen.find(x=>x.key===e.key); if(!l)return; const menge=Math.max(1,Math.min(99,+e.menge||1));
    const einzel=(l.art==='spende'||l.art==='sonstiges'||l.preis==null||e.preis!=null&&e.preis!=='')?(+e.preis||0):(l.key==='sotd'?PLIB.sotdPreis(l,pos):+l.preis);
    let summe;
    if(l.einheit==='saison'&&['paket','flaeche','patenschaft'].includes(l.art)){ summe=Math.round(einzel*menge*(1-rab)*100)/100; jahr+=summe; }
    else if(l.art==='spende'){ summe=einzel*menge; spende+=summe; }
    else { summe=einzel*menge; einmal+=summe; }
    aus.push(Object.assign({},e,{titel:l.art==='sonstiges'&&e.text?e.text:l.titel,einzel,menge,summe,einheit:l.einheit,rabatt:l.einheit==='saison'?rab:0})); });
  return {positionen:aus,saisons:s,rabatt:rab,netto_jahr:Math.round(jahr*100)/100,einmalig:Math.round(einmal*100)/100,spende:Math.round(spende*100)/100,
    netto_gesamt:Math.round((jahr*s+einmal)*100)/100,erste_rechnung:Math.round((jahr+einmal)*100)/100};
};

// ---------- Vertragsbausteine ----------
// [Schlüssel, Überschrift, Text]. {…} wird beim Anzeigen ersetzt.
PLIB.KLAUSELN={
  gegenstand:['Vertragsgegenstand','Der Partner unterstützt die Fußballabteilung des Vereins. Der Verein erbringt dafür die Leistungen, die in der Leistungsübersicht stehen. Art, Umfang und Platzierung der Werbung stimmen die Parteien vor der Umsetzung ab. Mit seiner Unterschrift bietet der Partner dem Verein den Abschluss dieses Vertrags verbindlich an. An dieses Angebot ist er vier Wochen ab seiner Unterschrift gebunden, weil der Vorstand des Vereins ehrenamtlich arbeitet und nicht jeden Tag zusammenkommt. Der Vertrag kommt zustande, wenn eine vertretungsberechtigte Person des Vereins innerhalb dieser Frist gegenzeichnet. Eine besondere Erklärung der Annahme gegenüber dem Partner ist dafür nicht nötig (§ 151 BGB). Der Verein schickt dem Partner den Vertrag dann mit beiden Unterschriften. Zeichnet der Verein nicht innerhalb der Frist gegen, ist der Partner nicht mehr gebunden. Der Partner schließt den Vertrag als Unternehmer (§ 14 BGB) für sein Unternehmen ab.'],
  laufzeit_fest:['Laufzeit','Der Vertrag beginnt am {beginn} und endet am {ende} von selbst. Eine Kündigung ist nicht nötig. Über eine Verlängerung sprechen die Parteien rechtzeitig vorher.'],
  laufzeit_auto:['Laufzeit und Verlängerung','Der Vertrag beginnt am {beginn} und läuft bis {ende}. Er verlängert sich um jeweils eine Saison, wenn keine Partei bis zum {frist_datum} in Textform kündigt, zum Beispiel per Mail an {mail}. In den Jahren danach ist jeweils der 31. März der letzte Tag für die Kündigung. Die Verlängerung gilt nur für Leistungen, die je Saison berechnet werden. Einmalige Leistungen werden nicht erneut berechnet. Für die Verlängerung gelten die Preise der letzten Saison ohne Laufzeitvorteil. Möchte der Verein die Preise ändern, sagt er das dem Partner spätestens vier Wochen vor dem letzten Kündigungstag in Textform. Der Partner kann dann bis zu diesem Tag kündigen.'],
  laufzeit_einmal:['Laufzeit','Der Vertrag gilt für die einmaligen Leistungen aus der Leistungsübersicht. Er endet, wenn sie erbracht sind. Eine Kündigung ist nicht nötig.'],
  verguetung_einmal:['Vergütung und Zahlung','Der Partner zahlt die Vergütung aus der Leistungsübersicht. Alle Beträge sind Nettobeträge, dazu kommt die gesetzliche Umsatzsteuer. Die Rechnung stellt der Verein, sobald der Vertrag geschlossen ist. Sie ist innerhalb von 14 Tagen ohne Abzug zahlbar. Der Partner ist einverstanden, dass er Rechnungen als PDF per Mail bekommt. Sobald das Gesetz es verlangt, schickt der Verein sie als E-Rechnung.'],
  verguetung:['Vergütung und Zahlung','Der Partner zahlt die Vergütung aus der Leistungsübersicht. Alle Beträge sind Nettobeträge, dazu kommt die gesetzliche Umsatzsteuer. Die erste Rechnung stellt der Verein, sobald der Vertrag geschlossen ist. Beginnt die Laufzeit erst danach, ist die erste Rechnung zum Beginn der Laufzeit fällig. Beginnt der Vertrag während einer laufenden Saison, wird der Saisonpreis voll berechnet. Jede weitere Rechnung folgt zu Beginn der nächsten Saison. Rechnungen sind innerhalb von 14 Tagen ohne Abzug zahlbar. Der Partner ist einverstanden, dass er Rechnungen als PDF per Mail bekommt. Sobald das Gesetz es verlangt, schickt der Verein sie als E-Rechnung.'],
  werbemittel:['Logo und Werbemittel','Der Partner stellt sein Logo in druckfähiger Form zur Verfügung. Er versichert, dass er die Rechte an Logo und Namen hat. Er stellt den Verein von Ansprüchen Dritter frei, die darauf beruhen, dass diese Zusicherung nicht stimmt. Der Verein darf Namen und Logo für die vereinbarten Leistungen und für Berichte über die Partnerschaft nutzen. Bevor etwas gedruckt oder veröffentlicht wird, zeigt der Verein dem Partner einen Entwurf. Nach Vertragsende nimmt der Verein das Logo innerhalb von vier Wochen aus seinen digitalen Medien. Gedruckte Kleidung und Banden bleiben in Gebrauch, bis sie ersetzt werden. Kommt das Logo später, beginnen Druck und Bestellung entsprechend später. An der Vergütung ändert das nichts. Der Partner darf auf die Partnerschaft mit dem Verein hinweisen und dafür das Wappen des Vereins in der vom Verein freigegebenen Form nutzen, solange der Vertrag läuft, und nur so, dass nicht der Eindruck entsteht, der Verein empfehle bestimmte Produkte.'],
  bande:['Werbebande','Herstellung und Montage der Bande übernimmt der Verein, soweit sie in der gebuchten Leistung enthalten sind. Beschädigungen durch Dritte oder Witterung beseitigt der Verein in angemessener Zeit. Die genaue Platzierung richtet sich nach Paket und Verfügbarkeit.'],
  trikot:['Trikot und Spielkleidung','Der Verein bestellt die Kleidung über seinen Ausrüster. Wo das Logo genau sitzt, stimmen beide Seiten vor der Bestellung ab. Hat der Partner nicht ausdrücklich die Trikotbrust gebucht und ist sie schon an einen anderen Partner vergeben, kommt das Logo an eine andere gut sichtbare Stelle. Es bleibt dort, solange die Kleidung getragen wird.'],
  jugend:['Jugend','Leistungen für Jugendmannschaften kommen den Kindern und Jugendlichen unmittelbar zugute. Werbung für Tabak, Alkohol, Glücksspiel und vergleichbare Produkte ist auf Jugendkleidung und in Jugendmedien ausgeschlossen. Fotos von Kindern und Jugendlichen veröffentlicht der Verein nur mit Einwilligung der Eltern, ab 14 Jahren auch mit Einwilligung der Jugendlichen selbst. Der Partner nutzt solche Fotos nur, wenn der Verein sie ihm ausdrücklich für diesen Zweck freigegeben hat und die Einwilligung diese Nutzung umfasst.'],
  exklusiv:['Branchenexklusivität','Der Verein nimmt in der Laufzeit keinen weiteren Partner aus der Branche {branche} in dieselbe Partnerstufe auf.'],
  laufzeitvorteil:['Laufzeitvorteil','Für die vereinbarte Laufzeit gelten die Preise dieses Vertrags unverändert. Die gebuchten Plätze sind für den Partner bis zum Vertragsende reserviert.'],
  events:['Veranstaltungen','Muss eine Veranstaltung ausfallen, ohne dass der Verein etwas dafür kann, holt er die Leistung bei einer vergleichbaren Veranstaltung nach. Ist das nicht möglich, erstattet der Verein den Anteil, der auf die ausgefallene Leistung entfällt.'],
  ausfall:['Wenn etwas nicht klappt','Kann der Verein eine gebuchte Leistung dauerhaft nicht erbringen, etwa weil eine Mannschaft abgemeldet wird, bietet er dem Partner eine gleichwertige Leistung an. Möchte der Partner das nicht, erstattet der Verein den Anteil, der auf die nicht erbrachte Leistung entfällt.'],
  spielausfall:['Spielbetrieb','Fällt einmal ein Spiel oder Training aus, etwa wegen Witterung oder einer Entscheidung des Verbands, ändert das an der Vergütung nichts. Das gilt auch für die üblichen Pausen im Sommer und im Winter. Ruht der Spielbetrieb darüber hinaus wegen einer behördlichen Anordnung oder einer Entscheidung des Verbands länger als zwei Monate am Stück, holt der Verein die betroffenen Leistungen nach oder erstattet nach Wahl des Partners den Anteil, der auf diese Zeit entfällt.'],
  werte:['Werte','Beide Parteien achten darauf, dem Ansehen der jeweils anderen nicht zu schaden. Werbung, die gegen gesetzliche Vorgaben oder die Werte des Vereins verstößt, ist ausgeschlossen.'],
  kuendigung:['Kündigung aus wichtigem Grund','Aus wichtigem Grund können beide Parteien jederzeit fristlos kündigen, zum Beispiel wenn eine Partei dem Ruf der anderen schwer schadet oder eine fällige Zahlung trotz Mahnung mehr als zwei Monate aussteht.'],
  haftung:['Haftung','Beide Parteien haften einander nach den gesetzlichen Vorschriften.'],
  datenschutz:['Datenschutz','Der Verein verarbeitet die Angaben des Partners, die Unterschrift und die Rechnungen, um die Partnerschaft zu vereinbaren und durchzuführen (Art. 6 Abs. 1 lit. b DSGVO) und um gesetzliche Aufbewahrungspflichten zu erfüllen (Art. 6 Abs. 1 lit. c DSGVO). Er bewahrt sie auf, solange die Partnerschaft läuft, und danach so lange, wie das Gesetz es verlangt: Rechnungen acht Jahre, Verträge und geschäftliche Mails sechs Jahre, jeweils ab Ende des Jahres. Der Partner hat das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Widerspruch und Datenübertragbarkeit. Er kann sich beim Hessischen Beauftragten für Datenschutz und Informationsfreiheit beschweren. Mehr dazu steht in den Datenschutzhinweisen der Partnerseite.'],
  schluss:['Schlussbestimmungen','Änderungen und Ergänzungen halten die Parteien in Textform fest, eine Mail genügt. Ist eine Bestimmung unwirksam, gilt der Rest des Vertrags weiter. Es gilt deutsches Recht. Erfüllungsort ist Mörlenbach. Sind beide Parteien Kaufleute, ist Gerichtsstand der Sitz des Vereins (§ 38 ZPO).'],
  spende:['Spende','Die Spendenzusage ist eine freiwillige Absicht, keine rechtliche Verpflichtung. Sie ist von allen Leistungen des Vereins unabhängig: Der Verein erbringt dafür keine Gegenleistung, und an gebuchten Leistungen ändert sich nichts, wenn die Spende ausbleibt. Der Verein setzt sie für {zweck} ein. Eine Zuwendungsbestätigung stellt der Verein nach Zahlungseingang aus, soweit er als gemeinnützig anerkannt ist und die steuerlichen Voraussetzungen vorliegen.'],
  spende_ohne:['Spende','Die Spendenzusage ist eine freiwillige Absicht, keine rechtliche Verpflichtung. Sie ist von allen Leistungen des Vereins unabhängig: Der Verein erbringt dafür keine Gegenleistung, und an gebuchten Leistungen ändert sich nichts, wenn die Spende ausbleibt. Der Verein setzt sie für {zweck} ein. Eine Zuwendungsbestätigung kann der Verein dafür nicht ausstellen.']
};
PLIB.klauselnFuer=function(pos,leistungen,opt){
  opt=opt||{}; const keys=(pos||[]).map(p=>p.key), L=k=>leistungen.find(x=>x.key===k)||{}, bereiche=new Set(keys.map(k=>L(k).bereich));
  const nurSpende=keys.length&&keys.every(k=>k==='spende');
  if(nurSpende)return ['spende','datenschutz','schluss'];
  const saisonal=keys.some(x=>{ const l=L(x); return l.einheit==='saison'&&['paket','flaeche','patenschaft'].includes(l.art); });
  const k=['gegenstand',saisonal?(opt.auto?'laufzeit_auto':'laufzeit_fest'):'laufzeit_einmal',saisonal?'verguetung':'verguetung_einmal','werbemittel'];
  if(keys.some(x=>/^(club|premium|p1896|bande_)/.test(x)))k.push('bande');
  if(keys.some(x=>/^(brust_|aermel_|trikot_|aufwaerm_)/.test(x)))k.push('trikot');
  if(bereiche.has('jugend')||keys.some(x=>['zeltlager','ferienspiele'].includes(x)))k.push('jugend');
  if(keys.includes('p1896'))k.push('exklusiv');
  if(bereiche.has('events')||keys.some(x=>['matchball','sotd'].includes(x)))k.push('events');
  if(bereiche.has('erste')||bereiche.has('zweite')||keys.some(x=>/^(club|premium|p1896)$/.test(x)))k.push('spielausfall');
  if((+opt.saisons||1)>=2&&keys.some(x=>{ const l=L(x); return l.einheit==='saison'&&['paket','flaeche','patenschaft'].includes(l.art); }))k.push('laufzeitvorteil');
  if(keys.some(x=>x!=='spende'))k.push('ausfall');
  if(keys.includes('spende'))k.push('spende');
  k.push('werte','kuendigung','haftung','datenschutz','schluss');
  return k;
};
PLIB.klauselText=function(key,w){ const K=PLIB.KLAUSELN[key]; if(!K)return null; w=w||{};
  let t=K[1]; if(key==='exklusiv'&&!w.branche)t='Der Verein nimmt in der Laufzeit keinen weiteren Partner aus derselben Branche wie der Partner in dieselbe Partnerstufe auf.';
  return [K[0],t.replace(/\{(\w+)\}/g,(m,n)=>w[n]!=null&&w[n]!==''?w[n]:'…')]; };

// ---------- Girocode (EPC069-12, Version 002) ----------
PLIB.girocode=function(o){
  const name=String(o.name||'').replace(/\s+/g,' ').trim().slice(0,70), iban=String(o.iban||'').replace(/\s/g,'').toUpperCase(), bic=String(o.bic||'').replace(/\s/g,'').toUpperCase();
  const betrag=Math.round((+o.betrag||0)*100)/100, zweck=String(o.zweck||'').replace(/\s+/g,' ').trim().slice(0,140);
  if(!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(iban)||!name||!(betrag>=0.01&&betrag<=999999999.99))return null;
  return ['BCD','002','1','SCT',bic,name,iban,'EUR'+betrag.toFixed(2),'','',zweck].join('\n');
};
// QR als SVG (braucht vendor/qrcode.js)
PLIB.qrSvg=function(text,px){
  if(typeof qrcode!=='function'||!text)return '';
  const q=qrcode(0,'M'); q.addData(text); q.make(); const n=q.getModuleCount(), r=4, g=n+r*2; let d='';
  for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(q.isDark(y,x))d+=`M${x+r} ${y+r}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g} ${g}" width="${px||200}" height="${px||200}" shape-rendering="crispEdges" role="img" aria-label="Girocode zum Überweisen"><rect width="${g}" height="${g}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
};
PLIB.qrMatrix=function(text){ if(typeof qrcode!=='function'||!text)return null; const q=qrcode(0,'M'); q.addData(text); q.make(); const n=q.getModuleCount(); return {n,dark:(y,x)=>q.isDark(y,x)}; };
PLIB.ibanSchoen=s=>String(s||'').replace(/\s/g,'').replace(/(.{4})/g,'$1 ').trim();

// ---------- Rechnung als PDF (jsPDF), mit Girocode ----------
// V: der Vertrag zur Rechnung (für den Leistungszeitraum). Ohne Angabe sucht die App ihn in den geladenen Verträgen.
PLIB.rechnungPdf=function(jsPDF,R,vd,V){
  if(!V){ try{ V=((typeof PE!=='undefined'&&PE&&PE.d&&PE.d.vertraege)||[]).find(x=>x.id===R.vertrag)||null; }catch(e){ V=null; } }
  const doc=new jsPDF({unit:'pt',format:'a4'}), W=doc.internal.pageSize.getWidth(), H=doc.internal.pageSize.getHeight(), L=56;
  const navy=[20,27,71], or=[232,116,31], grau=[100,104,120], tinte=[20,24,36];
  const pz=s=>String(s==null?'':s).replace(/[−–—]/g,'-').replace(/[„“”]/g,'"');
  const t=(s,x,y,o)=>doc.text(pz(s),x,y,o||{});
  doc.setFillColor(...navy); doc.rect(0,0,W,8,'F'); doc.setFillColor(...or); doc.rect(0,8,W,3,'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(...grau); t((vd.name||'SV/BSC Mörlenbach').toUpperCase(),L,44);
  doc.setFont('helvetica','normal'); t([vd.abteilung,vd.strasse,vd.ort].filter(Boolean).join(' · '),L,57);
  const E=R.empfaenger||{}; let y=110; doc.setFontSize(10.5); doc.setTextColor(...tinte);
  [E.firma,E.ansprech,E.strasse,E.ort].filter(Boolean).forEach(z=>{ t(z,L,y); y+=15; });
  doc.setFont('helvetica','bold'); doc.setFontSize(22); doc.setTextColor(...navy); t(R.art==='spende'?'SPENDENZUSAGE':'RECHNUNG',L,220);
  doc.setFont('helvetica','normal'); doc.setFontSize(9.5); doc.setTextColor(...grau);
  const datum=d=>{ const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(d||'')); return m?m[3]+'.'+m[2]+'.'+m[1]:String(d||''); };
  t('Nr. '+R.nr,W-L,192,{align:'right'}); t('Datum '+datum(R.datum),W-L,206,{align:'right'}); if(V&&V.nr&&V.nr!==R.nr)t('Vertrag '+V.nr,W-L,220,{align:'right'});
  // Leistungszeitraum wie auf der Rechnung aus der Mail: je Saison bis zum Saisonende, sonst Leistung ab Beginn
  const iso=d=>String(d||'').slice(0,10), saisonEnde=(von,bis)=>{ const d=new Date(iso(von)+'T12:00:00'), y=d.getMonth()>=6?d.getFullYear()+1:d.getFullYear(), e=y+'-06-30'; return bis&&iso(bis)<e?iso(bis):e; };
  const von=iso(R.zeit_von||(V&&V.beginn)||R.datum), bis=R.zeit_bis||saisonEnde(von,V&&V.ende);
  y=262; doc.setDrawColor(220,214,204); doc.line(L,y-14,W-L,y-14);
  doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(...grau); t('LEISTUNG',L,y); t('BETRAG',W-L,y,{align:'right'}); y+=18;
  doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(...tinte);
  (R.positionen||[]).forEach(p=>{ const z=doc.splitTextToSize(pz(p.titel+(p.mannschaft?', '+p.mannschaft:'')+(p.menge>1?', '+p.menge+' ×':'')+(p.rabatt?', Laufzeitvorteil '+Math.round(p.rabatt*100)+' %':'')+(p.key==='spende'||p.einheit==='frei'?'':p.einheit==='saison'?', Leistungszeitraum '+datum(von)+' bis '+datum(bis):', Leistung ab '+datum(von))),W-2*L-110);
    t(z,L,y); t(PLIB.eur(p.summe,true),W-L,y,{align:'right'}); y+=14*z.length+6; });
  doc.line(L,y,W-L,y); y+=18;
  const sum=(a,b,fett)=>{ doc.setFont('helvetica',fett?'bold':'normal'); doc.setFontSize(fett?11.5:10); t(a,W-L-200,y); t(b,W-L,y,{align:'right'}); y+=17; };
  if(R.art!=='spende'){ sum('Netto',PLIB.eur(R.netto,true)); if(+R.ust_satz>0)sum('Umsatzsteuer '+(+R.ust_satz)+' %',PLIB.eur(Math.round((R.brutto-R.netto)*100)/100,true)); }
  sum('Gesamt',PLIB.eur(R.brutto,true),true);
  y+=10; doc.setFont('helvetica','normal'); doc.setFontSize(9.5); doc.setTextColor(...grau);
  const hinweis=R.art==='spende'?('Danke für die Spende.'+((vd||{}).gemeinnuetzig===true?' Die Zuwendungsbestätigung schicken wir nach Zahlungseingang.':''))
    :(+R.ust_satz>0?'':'Kein Ausweis von Umsatzsteuer. ')+'Vorausrechnung: Die Leistungen erbringen wir im genannten Zeitraum. Bitte überweist den Betrag bis '+datum(R.faellig)+' mit dem Verwendungszweck.';
  const hz=doc.splitTextToSize(pz(hinweis),W-2*L); t(hz,L,y); y+=hz.length*13+18;
  // Bank und Girocode
  const gc=PLIB.girocode({name:vd.kontoinhaber||vd.name,iban:vd.iban,bic:vd.bic,betrag:R.brutto,zweck:R.zweck});
  doc.setFillColor(247,244,238); doc.roundedRect(L,y,W-2*L,128,8,8,'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(...grau); t('ÜBERWEISUNG',L+16,y+22);
  doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(...tinte);
  const zeilen=[['Empfänger',vd.kontoinhaber||vd.name],['IBAN',PLIB.ibanSchoen(vd.iban)],['BIC',vd.bic],['Bank',vd.bank],['Betrag',PLIB.eur(R.brutto,true)],['Zweck',R.zweck]];
  let yy=y+40; zeilen.forEach(([a,b])=>{ if(!b)return; doc.setTextColor(...grau); t(a,L+16,yy); doc.setTextColor(...tinte); t(doc.splitTextToSize(pz(b),W-2*L-230)[0],L+80,yy); yy+=14; });
  const M=gc&&PLIB.qrMatrix(gc);
  if(M){ const s=104, m=s/(M.n+8), x0=W-L-16-s, y0=y+12; doc.setFillColor(255,255,255); doc.rect(x0,y0,s,s,'F'); doc.setFillColor(0,0,0);
    for(let r=0;r<M.n;r++)for(let c=0;c<M.n;c++)if(M.dark(r,c))doc.rect(x0+(c+4)*m,y0+(r+4)*m,m+.15,m+.15,'F');
    doc.setFontSize(7); doc.setTextColor(...grau); t('Mit der Banking-App scannen',x0+s/2,y0+s+10,{align:'center'}); }
  doc.setFontSize(7); doc.setTextColor(...grau);
  t([vd.name,vd.register,vd.steuernr?'St.-Nr. '+vd.steuernr:'',vd.ustid?'USt-IdNr. '+vd.ustid:'',vd.finanzamt?'Finanzamt '+vd.finanzamt:''].filter(Boolean).join(' · '),L,H-36);
  t([vd.email,vd.web].filter(Boolean).join(' · '),L,H-24);
  return doc;
};

/* =====================================================================
   Sportzentrale Beta 0.64 · Partner-Steuerung (Partner-Engine)
   Reiter im Partnerbereich (nach der Zentrale), für Abteilungsleitung und Partner-Team:
   - Heute: was der Wächter fragt (Verlängerung, Nachfassen, fehlende Laufzeit, Vorrecht, Zahlung, Spendenquittung, Warteliste), mit Antwort per Tipp
   - Belegung: jede Fläche und jedes Angebot je Bereich, Jugend als Raster je Mannschaft, Warteliste, Basakci-Vorrecht
   - Laufzeiten: alle Verträge nach Ablauf sortiert, Verlängerungsstand
   - Rechnungen: offen, bezahlt, PDF mit Girocode
   - Katalog: Preise und Plätze pflegen, Vorschläge freigeben
   - Team: wer im Partner-Team ist (Abteilungsleitung schaltet frei)
   - Vereinsdaten: Bank, Steuer und Vertragsangaben (seit 0.72 die einzige Stelle dafür)
   ===================================================================== */
const PE={d:null,v:'heute',t:0,laedt:null,err:null};
const peE=s=>svEsc(s==null?'':String(s));
const peEur=(n,d)=>PLIB.eur(n,d);
const peDat=d=>{ if(!d)return ''; try{ return new Date(String(d).slice(0,10)+'T12:00:00').toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'}); }catch(e){ return d; } };
const peTage=d=>Math.round((new Date(String(d).slice(0,10)+'T12:00:00')-new Date(svtHeute()+'T12:00:00'))/864e5);
const peFirma=id=>{ const p=(PE.d&&PE.d.partner||[]).find(x=>x.id===id); return p?p.firma:''; };
const peL=k=>(PE.d&&PE.d.leistungen||[]).find(x=>x.key===k)||{titel:k};
const peM=id=>{ const m=(PE.d&&PE.d.mannschaften||[]).find(x=>x.id===id); return m?m.kurz||m.name:(id||''); };
// [Icon (SVI), Wort, Reihenfolge]: Verlängerung und Zahlungen stehen immer oben
const PE_ART={verlaengerung:['refresh','Verlängerung',1],zahlung:['wallet','Zahlung',2],nachfassen:['mail','Angebot nachfassen',3],vorrecht:['clock','Vorrecht',4],quittung:['file','Zuwendungsbestätigung',5],warteliste:['users','Warteliste',6],danke:['heart','Danke sagen',7],laufzeit:['cal','Laufzeit fehlt',8]};
const PE_VST={offen:'offen',verlaengert:'verlängert',ueberlegt:'überlegt noch',beendet:'verlängert nicht'};

// Ein gemeinsames Ladeversprechen: Wer während des Ladens kommt (Zentrale im Hintergrund, dann Steuerung), wartet auf dasselbe
function peLaden(force){
  if(PE.laedt)return PE.laedt;
  if(!force&&PE.d&&Date.now()-PE.t<20000)return Promise.resolve(PE.d);
  PE.laedt=svtRpc('partner_engine_laden',{}).then(d=>{ PE.d=d; PE.t=Date.now(); PE.err=null; return d; },e=>{ PE.err=e.message||String(e); return null; }).finally(()=>{ PE.laedt=null; });
  return PE.laedt;
}
async function peNeu(){ await peLaden(true); peZeigen(); }
async function peRpc(fn,args,ok){ try{ const r=await svtRpc(fn,args); if(ok)kToast(ok); await peNeu(); return r; }catch(e){ kToast('⚠️ '+(e.message||e)); try{ e.gezeigt=true; }catch(_){} throw e; } }

// ---------- Einhängen: Reiter „Steuerung“ steht fest in SPO_REITER (svm26); den Kopfknopf „Termin vorbereiten“ gibt es nur noch in der Zentrale ----------
{ const _b=spoBody; spoBody=function(){ if(SPO.view==='steuerung'){ const B=document.getElementById('spoB'); if(B)peRender(B); return; } return _b.apply(this,arguments); }; }

async function peRender(B){
  if(!PE.d){ B.innerHTML='<div class="card"><div class="empty">Lade die Partner-Steuerung …</div></div>'; await peLaden(); if(SPO.view!=='steuerung'||!B.isConnected)return; }
  if(!PE.d){ B.innerHTML=`<div class="card"><div class="empty">Konnte nicht laden: ${peE(PE.err||'unbekannt')}</div></div>`; return; }
  const D=PE.d, h=svtHeute(), aktiv=D.vertraege.filter(v=>v.status==='aktiv'&&(!v.ende||v.ende>=h)&&v.art!=='spende');   // geschlossen erst mit der Gegenzeichnung
  const summe=aktiv.reduce((a,v)=>a+(+v.netto_jahr||0),0), bald=aktiv.filter(v=>v.ende&&peTage(v.ende)<=365).length;
  const offenR=D.rechnungen.filter(r=>r.status==='offen'), nK=peKarten(D).jetzt, ueberf=offenR.some(r=>r.art!=='spende'&&r.faellig&&r.faellig<h);   // Spenden sind freiwillig: nie rot
  const nSp=offenR.filter(r=>r.art==='spende').length, nRe=offenR.length-nSp, nP=new Set(aktiv.map(v=>v.sponsor)).size;
  const reO=offenR.filter(r=>r.art!=='spende'), spO=offenR.filter(r=>r.art==='spende');
  const offenTxt=`offen · ${nRe} Rechnung${nRe===1?'':'en'}`+(nSp?`<small class="pe-spz">Dazu ${nSp} Spendenzusage${nSp===1?'':'n'} über ${peEur(spO.reduce((a,r)=>a+(+r.brutto||0),0))}, freiwillig</small>`:'');
  B.innerHTML=`${peSteuerFehlt()?`<div class="pe-steuer" role="note"><span>${SVI('info')} Steuernummer fehlt, Rechnungen warten.</span><button type="button" class="btn ghost sm" data-pev="verein">Vereinsdaten öffnen</button></div>`:''}<div class="pe-kpis">
      <button type="button" class="pe-kpi" data-pev="laufzeiten"><b>${aktiv.length}</b><span>${aktiv.length===1?'Vertrag':'Verträge'} bei ${nP} ${nP===1?'Partner':'Partnern'}</span></button>
      <button type="button" class="pe-kpi" data-pev="laufzeiten"><b>${peEur(summe)}</b><span>netto je Saison</span></button>
      <button type="button" class="pe-kpi${bald?' warn':''}" data-pev="laufzeiten"><b>${bald}</b><span>laufen in 12 Monaten aus</span></button>
      <button type="button" class="pe-kpi" data-pev="heute"><b>${nK}</b><span>${nK===1?'Sache':'Sachen'} zu tun</span></button>
      <button type="button" class="pe-kpi voll${ueberf?' rot':offenR.length?' warn':''}" data-pev="rechnungen"><b>${peEur(reO.reduce((a,r)=>a+(+r.brutto||0),0))}</b><span>${offenTxt}</span></button>
    </div>
    <div class="svt-chips pe-sub" role="tablist">${[['heute','Zu tun'],['belegung','Belegung'],['laufzeiten','Laufzeiten'],['rechnungen','Rechnungen'],['katalog','Katalog'],['team','Team'],['verein','Vereinsdaten']]
      .map(([k,l])=>`<button type="button" role="tab" aria-selected="${PE.v===k}" class="${PE.v===k?'on':''}" data-pev="${k}">${l}${k==='heute'&&nK?` <i class="pe-n">${nK}</i>`:''}</button>`).join('')}</div>
    <div id="peB"></div>`;
  B.querySelectorAll('[data-pev]').forEach(b=>b.onclick=()=>{ PE.v=b.dataset.pev; peRender(B); });
  peZeigenIn(B.querySelector('#peB'));
}
function peZeigen(){ const B=document.getElementById('spoB'); if(B&&SPO.view==='steuerung')peRender(B); }
function peZeigenIn(H){ try{ ({heute:peHeute,belegung:peBelegung,laufzeiten:peLaufzeiten,rechnungen:peRechnungen,katalog:peKatalog,team:peTeam,verein:peVerein}[PE.v]||peHeute)(H); }
  catch(e){ console.warn(e); H.innerHTML='<div class="card"><div class="empty">Fehler beim Anzeigen.</div></div>'; } }

// ---------- Heute: Fragen des Wächters ----------
// Verträge, die der Partner unterschrieben hat und der Verein noch gegenzeichnen muss
// Seit 0.74: die Unterschrift des Partners ist sein Angebot, geschlossen ist der Vertrag erst mit der Gegenzeichnung (bzw. „Annehmen“ ohne digitale Unterschrift des Partners)
function peGegen(D){ return (D.vertraege||[]).filter(v=>v.status==='unterschrieben'&&!v.hat_unterschrift_verein&&!v.gegengezeichnet_am&&v.art!=='spende'); }
const PE_VERTRETEN='Mit deiner Unterschrift nimmst du das Angebot für den Verein an. Unterschreibe nur, wenn du den Verein vertreten darfst (Vorstand nach § 26 BGB oder mit Vollmacht).';
const PE_NICHT_GZ='Gegenzeichnen kann nur, wer für den Verein unterschreiben darf. Sag der Abteilungsleitung kurz Bescheid.';
// Bindefrist: vier Wochen ab der Unterschrift des Partners (der Server rechnet gebunden_bis in deutscher Zeit)
const peAbgelaufen=v=>!!(v&&v.gebunden_bis&&v.gebunden_bis<svtHeute());
// Frist je Zeile: gebunden bis …, ab 7 Tagen vorher „noch N Tage“, bei zwei Unterschriften „1 von 2“
function peGzFrist(v){ if(peAbgelaufen(v))return ' · <em class="pe-ab">abgelaufen</em>'; let t=''; if(v.gebunden_bis){ const n=peTage(v.gebunden_bis); t=' · gebunden bis '+peE(peDat(v.gebunden_bis).slice(0,6))+(n<=7?` · <em class="pe-bald">noch ${n===1?'1 Tag':n+' Tage'}</em>`:''); }
  return t+(v.erste_unterschrift&&v.erste_unterschrift.name?' · 1 von 2 Unterschriften':''); }
const PE_ABGELAUFEN='Die Bindefrist ist abgelaufen. Schick ein neues Angebot oder lass die Firma über die Präsentation neu unterschreiben. Diesen Vertrag dann mit „Nicht annehmen“ schließen, das gibt die Plätze frei.';
// Knopf je Vertrag: mit digitaler Unterschrift des Partners gegenzeichnen, sonst (Zusage auf Papier oder mündlich) annehmen
const peIchSchon=v=>!!(v&&v.erste_unterschrift&&PE.d&&v.erste_unterschrift.von===PE.d.ich);
const peGzKnopf=(v,cls)=>peIchSchon(v)?`<small class="pe-zweite">Deine Unterschrift ist da, es fehlt die zweite</small>`:peAbgelaufen(v)?`<button type="button" class="btn sm ghost" data-peab="${peE(v.id)}">Nicht annehmen</button>`:v.hat_unterschrift_partner?`<button type="button" class="btn sm${cls||''}" data-pegz="${peE(v.id)}">Gegenzeichnen</button>`:`<button type="button" class="btn sm${cls||''}" data-peann="${peE(v.id)}">Annehmen</button>`;
// Jetzt oder später? Verlängerungen mit mehr als drei Monaten Restlaufzeit gehören unter „Später“.
function peTeilen(D){ const h=svtHeute(), rang=a=>(PE_ART[a.art]||[0,0,9])[2];
  const wartet=new Set(peGegen(D).map(v=>v.id));   // Rechnung erst nach der Gegenzeichnung: Rechnungsfragen zu wartenden Verträgen ausblenden
  const A=D.aufgaben.filter(a=>!(a.vertrag&&wartet.has(a.vertrag)&&(a.art==='zahlung'||/^bindefrist/.test(a.schluessel||'')))).sort((a,b)=>rang(a)-rang(b)||(a.faellig<b.faellig?-1:a.faellig>b.faellig?1:0));
  const frueh=a=>{ if(a.art!=='verlaengerung')return false; const v=a.vertrag&&D.vertraege.find(x=>x.id===a.vertrag); return !!(v&&v.ende&&peTage(v.ende)>92); };
  return {A,jetzt:A.filter(a=>a.faellig<=h&&!frueh(a)),spaeter:A.filter(a=>a.faellig>h||frueh(a))}; }
// Gleichartige Fragen bündeln: fehlende Laufzeiten mehrerer Firmen sind eine Karte, Verlängerungen einer Firma mit mehreren Verträgen auch
function peGruppen(L){ const out=[], vl={}, lz=[], seen=new Set();
  L.forEach(a=>{ if(a.art==='laufzeit'){ if(!seen.has(a.sponsor)){ seen.add(a.sponsor); lz.push(a); } return; }
    if(a.art==='verlaengerung'&&a.sponsor){ if(vl[a.sponsor]){ vl[a.sponsor].push(a); return; } vl[a.sponsor]=[a]; out.push(vl[a.sponsor]); return; }
    out.push([a]); });
  if(lz.length>=2)out.push({buendel:lz}); else lz.forEach(a=>out.push([a]));
  return out; }
// Karten zählen, nicht Einträge: so viele, wie unter „Jetzt dran“ stehen
function peKarten(D){ const t=peTeilen(D); return {jetzt:peGruppen(t.jetzt).length+(peGegen(D).length?1:0),spaeter:peGruppen(t.spaeter).length}; }
// Was jetzt wirklich ansteht, in fester Reihenfolge, z. B. „8 Verträge unterschreiben, 1 Rechnung, 1 Warteliste“
function peFragenText(D){ return peFragenTeile(D).join(', '); }
function peFragenTeile(D){ const t=peTeilen(D).jetzt, n=art=>t.filter(a=>a.art===art).length, nG=peGegen(D).length, nL=new Set(t.filter(a=>a.art==='laufzeit').map(a=>a.sponsor)).size;
  const z=(k,e,m)=>k?k+' '+(k===1?e:m):'';
  return [nG?z(nG,'Vertrag','Verträge')+' gegenzeichnen':'',z(n('zahlung'),'Rechnung','Rechnungen'),z(n('warteliste'),'freier Platz','freie Plätze'),z(nL,'fehlende Laufzeit','fehlende Laufzeiten'),
    z(n('verlaengerung'),'Verlängerung','Verlängerungen'),(n('nachfassen')?z(n('nachfassen'),'Angebot','Angebote')+' nachfassen':''),z(n('vorrecht'),'Vorrecht','Vorrechte'),z(n('quittung'),'Bestätigung','Bestätigungen'),z(n('danke'),'Danke','Danke')].filter(Boolean); }
// Rechnungen mit Umsatzsteuer brauchen Steuernummer oder USt-IdNr. des Vereins
function peSteuerFehlt(){ const v=(PE.d&&PE.d.verein)||{}, ust=v.ust_satz==null||v.ust_satz===''?19:+v.ust_satz; return ust>0&&!String(v.steuernr||'').trim()&&!String(v.ustid||'').trim(); }
function peGem(){ const g=(PE.d&&PE.d.verein||{}).gemeinnuetzig; return g===true||g==='true'; }
const PE_NUR_LEITUNG='Abschlüsse und Laufzeiten trägt die Abteilungsleitung ein.';
function peHeute(H){
  const D=PE.d, h=svtHeute(), dv=!!D.darf_vertrag, dg=!!D.darf_gegenzeichnen, {A,jetzt,spaeter}=peTeilen(D), G=peGegen(D).sort((a,b)=>peAbgelaufen(a)-peAbgelaufen(b)||String(a.gebunden_bis||'9').localeCompare(String(b.gebunden_bis||'9')));   // dringendste zuerst, abgelaufene ans Ende
  const karte=(a,grp)=>{ const [ic,art]=PE_ART[a.art]||['info',a.art], v=a.vertrag&&D.vertraege.find(x=>x.id===a.vertrag), saisonRe=/^saisonrechnung:/.test(a.schluessel||'');
    const kn=[], mehr=[], gid=grp&&grp.length>1?` data-grp="${grp.map(x=>x.id).join(',')}"`:'';
    const k=(akt,l,cls)=>kn.push(`<button type="button" class="btn ${cls||'ghost'} sm" data-pea="${akt}" data-id="${a.id}"${gid}>${l}</button>`);
    const m=(akt,l)=>mehr.push(`<button type="button" class="btn ghost sm" data-pea="${akt}" data-id="${a.id}"${gid}>${l}</button>`);
    let hin='', text=a.text, titel=a.titel, klein=art, standard=true;
    if(a.art==='nachfassen'&&v&&/^bindefrist/.test(a.schluessel||'')){ standard=false;   // Bindefrist: gegenzeichnen bzw. annehmen, oder nicht annehmen
      if(/^bindefrist-ab:/.test(a.schluessel)||peAbgelaufen(v)){ if(dv)k('v-ab','Nicht annehmen …',''); else hin=PE_NUR_LEITUNG; m('erledigt','Erledigt'); }
      else { if(dg)kn.push(peGzKnopf(v)); else hin=PE_NICHT_GZ; if(dv)k('v-ab','Nicht annehmen …'); m('spaeter7','In 7 Tagen'); } }
    else if(a.art==='verlaengerung'&&v){ standard=false; k('verl-msg',SVI('mail')+' Nachricht schreiben',''); if(dg){ k('verl-ja','Verlängert bis …'); k('verl-nein','Verlängert nicht'); m('verl-ueb','Überlegt noch'); } else hin='Verlängern kann nur, wer den Verein vertreten darf. Sag dem Vorstand kurz Bescheid.'; m('spaeter14','In 2 Wochen');
      const f=peFirma(v.sponsor), t=v.ende?peTage(v.ende):null, mon=t!=null?Math.round(t/30.4):null, n=grp?grp.length:1;
      const wann=t==null?'':mon<=0?'in wenigen Tagen':mon===1?'in einem Monat':'in '+mon+' Monaten';
      if(n>1){ titel=`Verlängerung mit ${f}`; klein=art+` · ${n} Verträge`; }
      text=v.ende?(t<0?`${n>1?'Der erste der '+n+' Verträge ist':'Der Vertrag ist'} am ${peDat(v.ende)} ausgelaufen. Schon mit ${f} gesprochen? Schreib ihnen kurz oder trag ein, wie es aussieht.`
        :`${n>1?'Die '+n+' Verträge laufen ab':'Der Vertrag läuft am'} ${peDat(v.ende)} aus, also ${wann}. Schon mit ${f} gesprochen? Schreib ihnen kurz oder trag ein, wie es aussieht.${n>1?' Deine Antwort gilt für alle '+n+' Verträge.':''}`):a.text; }
    else if(a.art==='nachfassen'&&v){ if(dv){ k('ang-ja','Zugesagt …',''); k('ang-nein','Abgelehnt'); } else hin=PE_NUR_LEITUNG; k('spaeter7','Noch offen'); }
    else if(a.art==='laufzeit'){ if(dv)k('laufzeit','Laufzeit eintragen',''); else hin=PE_NUR_LEITUNG; }
    else if(a.art==='vorrecht'&&a.belegung){ k('vr-ja','Übernimmt',''); k('vr-nein','Verzichtet'); }
    else if(a.art==='zahlung'&&/^rechnung-steuernr:/.test(a.schluessel||'')){ standard=false;   // Rechnung wartet auf die Steuernummer: Text und Knopf aus dem heutigen Stand, nicht aus dem Text des Wächters
      const teile=String(a.schluessel).split(':'), saison=teile.length>2, nr=v&&v.nr||'', welche=saison?'die Rechnung der Saison ab '+peDat(teile[2]):'die erste Rechnung';
      titel=(saison?'Saisonrechnung':'Erste Rechnung')+' für '+(peFirma(a.sponsor||(v&&v.sponsor))||nr);
      if(peSteuerFehlt()){ text=`Für ${welche}${nr?' von '+nr:''} fehlt noch die Steuernummer des Vereins.`; k('zu-verein','Steuernummer eintragen',''); }
      else { text=`Die Steuernummer ist eingetragen. Leg jetzt ${welche}${nr?' zu Vertrag '+nr:''} an.`; if(dv)k('re-nach',SVI('file')+' Rechnung anlegen',''); else hin=PE_NUR_LEITUNG; }
      m('spaeter14','In 2 Wochen'); }
    else if(a.art==='zahlung'&&a.rechnung&&/^spende:/.test(a.schluessel||'')){ standard=false; k('bezahlt','Ist eingegangen',''); k('spende-nein','Kommt nicht'); }
    else if(a.art==='zahlung'&&a.rechnung&&saisonRe){ standard=false; k('re-pdf',SVI('download')+' PDF',''); k('erledigt','Ist raus'); m('spaeter7','In 7 Tagen'); }
    else if(a.art==='zahlung'&&a.rechnung){ k('bezahlt','Ist bezahlt',''); k('spaeter7','Nochmal erinnern'); }
    else if(a.art==='quittung'&&a.rechnung){ if(peGem())k('quittung','Bestätigung erstellt',''); else hin='Gemeinnützigkeit noch offen, Bestätigung erst nach Klärung.'; }
    else if(a.art==='warteliste'){ const w=peWarteAus(a);
      if(w&&w.W.length){ standard=false; titel=`Ein Platz als ${w.titel} ist frei`; const nm=w.W.map(x=>peFirma(x.sponsor)).filter(Boolean);
        text=`Als Erste wartet ${nm[0]}${nm.length>1?', danach '+nm.slice(1,3).join(', ')+(nm.length>3?' und '+(nm.length-3)+' weitere':''):''}.`;
        k('warte-msg',SVI('mail')+` Nachricht an ${peE(nm[0].split(/\s+/).slice(0,2).join(' '))} schreiben`,''); k('zur-belegung','Zur Belegung'); m('spaeter14','In 2 Wochen'); m('erledigt','Erledigt'); }
      else k('zur-belegung','Zur Belegung',''); }
    if(standard){ k('erledigt','Erledigt'); if(!kn.join('').includes('spaeter7'))k('spaeter14','In 2 Wochen'); }
    return `<article class="pe-auf art-${peE(a.art)}"><div class="pe-auf-k"><span class="pe-ic" aria-hidden="true">${SVI(ic)}</span><div><small>${peE(klein)}${a.faellig<h?` · seit ${peDat(a.faellig)}`:''}</small><b>${peE(titel)}</b></div></div>
      ${text?`<p>${peE(text)}</p>`:''}${hin?`<p class="pe-hinw">${peE(hin)}</p>`:''}<div class="pe-auf-b">${kn.join('')}${mehr.length?`<details class="pd-mehr pe-mehr"><summary aria-label="Weitere Antworten">…</summary><div>${mehr.join('')}</div></details>`:''}</div></article>`; };
  // Gegenzeichnen: eine Karte, bei mehreren Verträgen je Vertrag eine Zeile mit kleinem Knopf. Nur ein Orange auf der Karte.
  const gkarte=()=>{ if(!G.length)return ''; const NICHT=PE_NICHT_GZ;
    const SATZ='Die Firmen haben schon unterschrieben und warten auf eure Unterschrift. Erst damit ist der Vertrag geschlossen. Danach geht er mit beiden Unterschriften und der ersten Rechnung per Mail raus.';
    if(G.length===1){ const v=G[0], f=peFirma(v.sponsor);
      return `<article class="pe-auf art-gegen"><div class="pe-auf-k"><span class="pe-ic" aria-hidden="true">${SVI('check')}</span><div><small>Wartet auf eure Unterschrift</small><b>${peE(f)} hat unterschrieben</b></div></div>
        <p>Vertrag ${peE(v.nr)}${v.unterschrieben_am?', unterschrieben am '+peDat(v.unterschrieben_am):''}${v.erste_unterschrift&&v.erste_unterschrift.name?', erste Unterschrift für den Verein von '+peE(v.erste_unterschrift.name):''}. Erst mit eurer Unterschrift ist der Vertrag geschlossen. Danach geht er mit beiden Unterschriften und der ersten Rechnung per Mail raus.</p>
        <div class="pe-auf-b">${dg?peGzKnopf(v):`<p class="pe-hinw">${NICHT}</p>`}</div>${peAbgelaufen(v)?`<p class="pe-hinw">${peE(PE_ABGELAUFEN)}</p>`:v.gebunden_bis?`<p class="pe-hinw">An die Unterschrift gebunden bis ${peDat(v.gebunden_bis)}.</p>`:''}</article>`; }
    return `<article class="pe-auf art-gegen pe-buendel"><div class="pe-auf-k"><span class="pe-ic" aria-hidden="true">${SVI('check')}</span><div><small>Wartet auf eure Unterschrift</small><b>${G.length} Verträge zum Gegenzeichnen</b></div></div>
      <p>${SATZ}</p>${dg?'':`<p class="pe-hinw">${NICHT}</p>`}
      <div class="pe-bdl pe-gz">${G.map((v,i)=>`<div class="pe-bdz"><div><b>${peE(peFirma(v.sponsor))}</b><small>${peE(v.nr)}${peGzFrist(v)}</small></div>${dg?peGzKnopf(v,i?' ghost':''):''}</div>`).join('')}</div></article>`; };
  const liste=L=>peGruppen(L).map(g=>{ if(!g.buendel)return karte(g[0],g); const lz=g.buendel, auf=PE.lzAuf?' open':'';
    return `<article class="pe-auf art-laufzeit pe-buendel"><div class="pe-auf-k"><span class="pe-ic" aria-hidden="true">${SVI('cal')}</span><div><small>Laufzeit fehlt</small><b>Bei ${lz.length} Partnern fehlt noch die Laufzeit</b></div></div>
      <p>Einmal nachtragen, dann erinnert dich die App rechtzeitig an die Verlängerung.</p>${dv?'':`<p class="pe-hinw">${PE_NUR_LEITUNG}</p>`}
      <details class="pe-bd"${auf}><summary>Alle ${lz.length} zeigen</summary><div class="pe-bdl">${lz.map(a=>{ const f=peFirma(a.sponsor)||String(a.titel||'').replace(/^Laufzeit von |\s*fehlt$/g,''), j=peAusJahr(a.sponsor);
        return `<div class="pe-bdz"><div><b>${peE(f)}</b>${j?`<small>Laut Ausrüstung bis ${peE(j)}</small>`:''}</div>${dv?`<button type="button" class="btn sm" data-pea="laufzeit" data-id="${a.id}">Eintragen</button>`:''}</div>`; }).join('')}</div></details></article>`; }).join('');
  const nJ=peKarten(D);
  // Später zugeklappt, mit Zusammenfassung: „6 Verlängerungen bis 30.06.2027“
  const spSum=()=>{ const n=nJ.spaeter, nurV=spaeter.every(a=>a.art==='verlaengerung');
    if(nurV){ const E=spaeter.map(a=>(D.vertraege.find(v=>v.id===a.vertrag)||{}).ende).filter(Boolean).sort(), nv=spaeter.length; return `${nv} ${nv===1?'Verlängerung':'Verlängerungen'}${E.length?' bis '+peDat(E[E.length-1]):''}`; }
    return `${n} ${n===1?'Frage':'Fragen'} für später`; };
  H.innerHTML=`${nJ.jetzt?`<h3 class="pe-h">Zu tun <i>${nJ.jetzt}</i></h3><div class="pe-liste">${gkarte()}${liste(jetzt)}</div>`
      :`<div class="card pe-ruhe"><b>Alles erledigt.</b><p>Die App schaut jeden Morgen gegen 9 Uhr nach Verlängerungen, Angeboten, Laufzeiten, Vorrechten und Zahlungen. Sobald etwas ansteht, steht es hier und kommt als Mitteilung aufs Handy.</p></div>`}
    ${spaeter.length?`<details class="pe-spaet"${PE.spAuf?' open':''}><summary><span>Später</span> ${peE(spSum())} · <u>${PE.spAuf?'zuklappen':'zeigen'}</u></summary><div class="pe-liste klein">${liste(spaeter)}</div></details>`:''}`;
  H.querySelectorAll('details.pe-bd').forEach(d=>d.ontoggle=()=>{ PE.lzAuf=d.open; });
  const sp=H.querySelector('details.pe-spaet'); if(sp)sp.ontoggle=()=>{ PE.spAuf=sp.open; const u=sp.querySelector('summary u'); if(u)u.textContent=sp.open?'zuklappen':'zeigen'; };
  H.querySelectorAll('[data-pea]').forEach(b=>b.onclick=()=>paEinmal(b,()=>peAntwort(b.dataset.pea,A.find(x=>x.id===b.dataset.id),b.dataset.grp?b.dataset.grp.split(',').map(id=>A.find(x=>x.id===id)).filter(Boolean):null)));
  H.querySelectorAll('[data-pegz]').forEach(b=>b.onclick=()=>peGegenzeichnen(D.vertraege.find(v=>v.id===b.dataset.pegz)));
  H.querySelectorAll('[data-peann]').forEach(b=>b.onclick=()=>peAnnehmen(D.vertraege.find(v=>v.id===b.dataset.peann)));
  H.querySelectorAll('[data-peab]').forEach(b=>b.onclick=()=>peAblehnen(D.vertraege.find(v=>v.id===b.dataset.peab)));
}
// Warteliste-Frage: Fläche aus dem Schlüssel des Wächters („warte:<leistung>:<mannschaft oder ->:<Woche>“), Wartende in der Reihenfolge, in der sie sich gemeldet haben
function peWarteAus(a){ const t=String(a&&a.schluessel||'').split(':'); if(t[0]!=='warte'||t.length<3)return null;
  const key=t[1], mann=t[2]==='-'?null:t[2], l=peL(key), W=((PE.d&&PE.d.warteliste)||[]).filter(w=>w.leistung===key&&(w.mannschaft||'')===(mann||'')&&w.status==='wartet').sort((x,y)=>(x.seit<y.seit?-1:x.seit>y.seit?1:0));
  return {key,mann,titel:l.titel+(mann?' '+peM(mann):''),W}; }
// Jahr aus der Ausrüstung, wenn dort für diesen Partner schon eins steht (z. B. Trikotsatz bis 2027)
function peAusJahr(sponsor){ const A=(typeof SPO!=='undefined'&&SPO.A)||[]; const J=A.filter(a=>a.sponsor_id===sponsor&&a.jahr).map(a=>+a.jahr); return J.length?Math.max(...J):null; }
// Blätter mit Antwort: Wird das Blatt anders geschlossen (✕, daneben tippen), kommt trotzdem eine Antwort (null bzw. false), damit kein Knopf gesperrt bleibt
function peBeimSchliessen(fertig){ const O=document.getElementById('overlay'); if(!O||typeof MutationObserver==='undefined')return;
  const mo=new MutationObserver(()=>{ if(!O.classList.contains('open')){ mo.disconnect(); fertig(); } }); mo.observe(O,{attributes:true,attributeFilter:['class']}); }
function peDatumFrage(titel,text,vorgabe){ return new Promise(res=>{ let fertig=false; const ende=v=>{ if(fertig)return; fertig=true; res(v); };
  const M=svModal(`<div class="og-form pa-blatt"><div class="pa-bk"><h2>${peE(titel)}</h2><button type="button" class="pa-bx" id="peDx">Abbrechen</button></div>${text?`<p>${peE(text)}</p>`:''}
    <label class="pe-f"><span>Datum</span><input type="date" id="peDf" value="${peE(vorgabe||svtHeute())}"></label>
    <label class="pe-f"><span>Notiz (freiwillig)</span><input id="peDn" maxlength="200"></label>
    <div class="btnrow sbact"><button class="btn" type="button" id="peDok">Speichern</button></div></div>`);
  M.querySelector('#peDok').onclick=()=>{ const d=M.querySelector('#peDf').value, n=M.querySelector('#peDn').value.trim(); ende(d?{d,n}:null); closeOverlay(); };
  M.querySelector('#peDx').onclick=()=>{ ende(null); closeOverlay(); };
  peBeimSchliessen(()=>ende(null)); }); }
// Datum lokal (svtHeute ist lokal), nie über toISOString: sonst wird zwischen 0 und 2 Uhr aus „in 7 Tagen“ der falsche Tag
function pePlus(tage){ return paDatPlus(svtHeute(),tage); }
async function peAntwort(akt,a,grp){
  if(!a)return; const v=a.vertrag&&PE.d.vertraege.find(x=>x.id===a.vertrag);
  // Verlängerungen einer Firma mit mehreren Verträgen: eine Antwort gilt für alle
  const G=grp&&grp.length>1?grp:[a], VV=G.map(x=>x.vertrag&&PE.d.vertraege.find(y=>y.id===x.vertrag)).filter(Boolean);
  const alle=async(fn,args,ok)=>{ for(const x of VV.slice(0,-1))await svtRpc(fn,args(x)); await peRpc(fn,args(VV[VV.length-1]),ok); };
  try{
    if(akt==='verl-ja'){ const vor=v&&v.ende?paJahrPlus(v.ende,1):paJahrPlus(svtHeute(),1);   // 30.06. bleibt 30.06., auch über ein Schaltjahr
      const r=await peDatumFrage('Verlängert bis wann?','Genau das Datum, bis zu dem die Verlängerung gilt. Ein Tag macht bei der nächsten Erinnerung den Unterschied.',vor); if(!r)return;
      await alle('partner_verlaengerung',x=>({p_vertrag:x.id,p_status:'verlaengert',p_bis:r.d,p_notiz:r.n||null}),'✓ Verlängerung gespeichert'); }
    else if(akt==='verl-ueb')await alle('partner_verlaengerung',x=>({p_vertrag:x.id,p_status:'ueberlegt',p_bis:null,p_notiz:null}),'Notiert: überlegt noch. Die App fragt in 14 Tagen wieder.');
    else if(akt==='verl-nein'){ if(!await peBestaetigen('Verlängert nicht?','Die Flächen werden zum Vertragsende frei, die Warteliste bekommt Bescheid.'))return;
      await alle('partner_verlaengerung',x=>({p_vertrag:x.id,p_status:'beendet',p_bis:null,p_notiz:null}),'Notiert: verlängert nicht'); }
    else if(akt==='ang-ja'){ const r=await peDatumFrage('Zugesagt am?','An welchem Tag genau hat der Partner zugesagt? Die Plätze sind damit für ihn belegt. Geschlossen ist der Vertrag, wenn ihn jemand mit Vertretungsrecht für den Verein annimmt.'); if(!r)return;
      await peRpc('partner_vertrag_status',{p_vertrag:v.id,p_status:'unterschrieben',p_datum:r.d,p_notiz:r.n||null},'✓ Zusage notiert. Geschlossen ist der Vertrag, sobald jemand mit Vertretungsrecht ihn oben unter „Wartet auf eure Unterschrift“ annimmt.'); }
    else if(akt==='ang-nein'){ if(!await peBestaetigen('Angebot ablehnen?','Die angebotenen Flächen werden wieder frei, und die Firma steht danach auf Abgesagt. Zurücknehmen geht nur in den nächsten zehn Minuten.',{ja:'Ja, ablehnen'}))return;
      await svtRpc('partner_vertrag_status',{p_vertrag:v.id,p_status:'abgelehnt',p_datum:null,p_notiz:null}); await peNeu();
      kToast('Angebot abgelehnt','Rückgängig',async()=>{ try{ await peRpc('partner_vertrag_status',{p_vertrag:v.id,p_status:'angebot',p_datum:null,p_notiz:null},'Angebot gilt wieder'); }catch(e){} }); }
    else if(akt==='v-ab'){ peAblehnen(v); }
    else if(akt==='spende-nein'){ if(!await peBestaetigen('Spende kommt nicht?','Die Zusage war freiwillig. Sie wird als „kommt nicht“ vermerkt, eine Mahnung gibt es nicht.',{ja:'Ja, vermerken'}))return;
      await peRpc('partner_spende_entfaellt',{p_id:a.rechnung},'Vermerkt: Spende kommt nicht'); }
    else if(akt==='laufzeit')peLaufzeitForm(a.sponsor);
    else if(akt==='verl-msg'){ if(!SPO.loaded)await spoLoad(); const x=SPO.S.find(s=>s.id===a.sponsor); if(!x){ kToast('Firma nicht gefunden'); return; } pzNachricht(Object.assign({},x,{_ende:v&&v.ende,_aufgabe:a.id,_aufgaben:G.map(y=>y.id)}),'verlaengerung'); }
    else if(akt==='warte-msg'){ const w=peWarteAus(a); if(!w||!w.W.length){ PE.v='belegung'; peZeigen(); return; } if(!SPO.loaded)await spoLoad();
      const x=SPO.S.find(s=>s.id===w.W[0].sponsor); if(!x){ kToast('Firma nicht gefunden'); return; } pzNachricht(Object.assign({},x,{_platz:w.titel,_aufgabe:a.id}),'warteliste'); }
    else if(akt==='zu-verein'){ PE.v='verein'; peZeigen(); }
    else if(akt==='re-nach'){
      if(peSteuerFehlt()){ kToast('Bitte zuerst Steuernummer oder USt-IdNr. unter Vereinsdaten eintragen. Danach hier „Rechnung anlegen“.'); PE.v='verein'; peZeigen(); return; }
      const saison=String(a.schluessel||'').split(':').length>2;
      const r=await svtRpc(saison?'partner_saisonrechnung_nachholen':'partner_erstrechnung_nachholen',{p_vertrag:a.vertrag}), neu=saison?(+r||0)>0:!!(r&&r.neu);
      kToast(neu?'✓ Rechnung angelegt. Das PDF gibt es unter Rechnungen.':'Es war keine Rechnung offen. Alle Rechnungen zu diesem Vertrag stehen unter Rechnungen.'); await peNeu(); }
    else if(akt==='re-pdf'){ const r=PE.d.rechnungen.find(x=>x.id===a.rechnung); if(r)await peRechnungPdf(r); }
    else if(akt==='vr-ja'){ // in einem Schritt: belegt bis Saisonende, Frage erledigt. Danach gleich die Laufzeit eintragen.
      const r=await svtRpc('partner_vorrecht_uebernehmen',{p_aufgabe:a.id}); kToast('✓ Übernommen, belegt bis '+peDat(r&&r.bis)); await peNeu();
      if(PE.d.darf_vertrag&&r)peLaufzeitForm(r.sponsor,{key:r.leistung,mannschaft:r.mannschaft}); }
    else if(akt==='vr-nein'){ if(!await peBestaetigen('Verzichtet auf das Vorrecht?','Die Fläche ist danach frei, die Warteliste ist dran.'))return;
      await peRpc('partner_vorrecht_verzicht',{p_aufgabe:a.id},'Verzicht notiert. Die Fläche ist frei, die Warteliste ist dran.'); }
    else if(akt==='bezahlt'){ const r=await peDatumFrage('Bezahlt am?','Tag des Zahlungseingangs.'); if(!r)return; await peRpc('partner_rechnung_bezahlt',{p_id:a.rechnung,p_datum:r.d,p_bezahlt:true},'✓ Zahlung verbucht'); }
    else if(akt==='quittung')await peRpc('partner_quittung_erstellt',{p_id:a.rechnung},'✓ Notiert');
    else if(akt==='zur-belegung'){ PE.v='belegung'; peZeigen(); }
    else if(akt==='spaeter7'||akt==='spaeter14'){ for(const x of G.slice(1))await svtRpc('partner_aufgabe_erledigen',{p_id:x.id,p_antwort:null,p_status:'erledigt',p_neu:pePlus(akt==='spaeter7'?7:14)});
      await peRpc('partner_aufgabe_erledigen',{p_id:a.id,p_antwort:null,p_status:'erledigt',p_neu:pePlus(akt==='spaeter7'?7:14)},'Kommt wieder'); }
    else if(akt==='erledigt')await peRpc('partner_aufgabe_erledigen',{p_id:a.id,p_antwort:null,p_status:'erledigt',p_neu:null},'✓ Erledigt');
  }catch(e){ if(e&&!e.gezeigt)kToast('⚠️ '+(e.message||e)); }
}
function peBestaetigen(titel,text,o){ return new Promise(res=>{ let fertig=false; const ende=v=>{ if(fertig)return; fertig=true; res(v); };
  const M=svModal(`<div class="og-form pa-blatt"><div class="pa-bk"><h2>${peE(titel)}</h2></div><p>${peE(text)}</p><div class="btnrow sbact"><button class="btn" type="button" id="peBj">${peE((o&&o.ja)||'Ja')}</button><button class="btn ghost" type="button" id="peBn">Abbrechen</button></div></div>`);
  M.querySelector('#peBj').onclick=()=>{ ende(true); closeOverlay(); }; M.querySelector('#peBn').onclick=()=>{ ende(false); closeOverlay(); };
  peBeimSchliessen(()=>ende(false)); }); }

// ---------- Gegenzeichnen und Annehmen: für den Verein, nur wer laut Vereinsdaten vertreten darf, mit Name, Funktion und Bestätigung ----------
// Bei Vertretung durch zwei gemeinsam (Satzung) ist die erste Unterschrift nur vorgemerkt; geschlossen ist der Vertrag mit der zweiten.
// Geschlossen ist er rechtlich erst, wenn die Firma ihn bekommt: geht die Mail nicht raus, sagt die App das deutlich und die Akte bietet „Vertrag erneut schicken“.
function peVertretungFelder(v){ const vd=PE.d.verein||{}, ich=PE.d.vertretung||{}, e1=v.erste_unterschrift;
  const regel=vd.vertretung==='zwei_vorsitz'?'Laut Satzung vertreten zwei Personen gemeinsam, eine davon ist Erste oder stellvertretende Vorsitzende.':vd.vertretung==='zwei'?'Laut Satzung vertreten zwei Personen gemeinsam.':vd.vertretung==='einzeln'?'Laut Satzung vertritt eine Person allein.':'Wie der Verein laut Satzung vertreten wird, steht noch nicht in den Vereinsdaten (XX).';
  return `<label class="pe-f"><span>Name (für den Verein)</span><input id="peGn" maxlength="120" value="${peE((typeof SVU!=='undefined'&&SVU.name)||'')}"></label>
    <label class="pe-f"><span>Funktion</span><input id="peGf" maxlength="120" list="peGfl" value="${peE(ich.funktion||(ich.art==='vollmacht'?'mit Vollmacht des Vorstands':'Vorstand nach § 26 BGB'))}"><datalist id="peGfl"><option value="Vorstand nach § 26 BGB"><option value="mit Vollmacht des Vorstands"></datalist></label>
    <p class="note small">${peE(regel)}${e1&&e1.name?` Erste Unterschrift: ${peE(e1.name)}${e1.funktion?' ('+peE(e1.funktion)+')':''}.`:''}</p>
    <label class="pe-sw2 pe-recht-h"><input type="checkbox" id="peGh"> Ich darf den Verein bei diesem Vertrag vertreten.</label>`; }
function peVertretungWerte(M){ const wer=M.querySelector('#peGn').value.trim(), fkt=M.querySelector('#peGf').value.trim();
  if(wer.length<3){ kToast('Bitte den Namen eintragen, wer für den Verein unterschreibt.'); return null; }
  if(fkt.length<3){ kToast('Bitte die Funktion eintragen, in der du für den Verein unterschreibst.'); return null; }
  if(!M.querySelector('#peGh').checked){ kToast('Bitte bestätigen, dass du den Verein bei diesem Vertrag vertreten darfst.'); return null; }
  return {wer,fkt}; }
const PE_MAIL_FEHLT='Deine Unterschrift ist gespeichert, aber die Mail an die Firma ging nicht raus. Geschlossen ist der Vertrag erst, wenn die Firma ihn mit beiden Unterschriften bekommt. Bitte in der Akte auf „Vertrag erneut schicken“ tippen oder das PDF selbst schicken.';
// Nach dem Eintragen: erste von zwei Unterschriften, schon erledigt, oder geschlossen (dann die Mail)
async function peNachUnterschrift(g,v,f,wort){
  if(g&&g.schon){ closeOverlay(); await peNeu(); kToast('Schon gegengezeichnet am '+peDat(g.gegengezeichnet_am)+'. Die Firma hat den Vertrag mit beiden Unterschriften bereits bekommen.'); return; }
  if(g&&g.fehlt_zweite){ closeOverlay(); await peNeu(); kToast('Deine Unterschrift ist vorgemerkt. Laut Satzung braucht es eine zweite Person, dann ist der Vertrag geschlossen.'); return; }
  let mail=null; try{ const {data,error}=await SVB.sb.functions.invoke('partner-deck',{body:{vertrag:v.id}}); if(error)throw error; mail=data; }catch(e){ mail={ok:false,fehler:e.message||String(e)}; }
  closeOverlay(); await peNeu();
  kToast(mail&&mail.ok?wort+'. '+f+' bekommt den Vertrag mit beiden Unterschriften, damit ist er geschlossen.':PE_MAIL_FEHLT+(mail&&mail.fehler?' ('+mail.fehler+')':'')); }
function peGegenzeichnen(v){ if(!v)return; const f=peFirma(v.sponsor);
  const M=svModal(`<div class="og-form pe-form pa-blatt"><div class="pa-bk"><h2>Gegenzeichnen</h2><button type="button" class="pa-bx" onclick="closeOverlay()">Abbrechen</button></div>
    <p>Vertrag <b>${peE(v.nr)}</b> mit <b>${peE(f)}</b>${v.unterschrieben_am?`, vom Partner unterschrieben am ${peDat(v.unterschrieben_am)}`:''}${v.gebunden_bis?`, gebunden bis ${peDat(v.gebunden_bis)}`:''}. Unterschreib hier für den Verein. Danach bekommt die Firma den Vertrag mit beiden Unterschriften per Mail.</p>
    ${peVertretungFelder(v)}
    <div class="pe-f"><span>Unterschrift</span><div class="spo-sig pe-sig" id="peGs"></div></div>
    <p class="note small">Datum der Gegenzeichnung: heute, ${peDat(svtHeute())}.</p>
    <p class="pe-recht" role="note">${peE(PE_VERTRETEN)}</p>
    <div class="btnrow sbact"><button class="btn" type="button" id="peGok">${SVI('check')} Gegenzeichnen und verschicken</button>${PE.d.darf_vertrag?'<button class="btn ghost" type="button" id="peGab">Nicht annehmen …</button>':''}</div></div>`);
  const ab=M.querySelector('#peGab'); if(ab)ab.onclick=()=>{ closeOverlay(); setTimeout(()=>peAblehnen(v),250); };
  let gezeichnet=false; spoSigPad(M.querySelector('#peGs'),d=>{ gezeichnet=!!d; },null);
  const ok=M.querySelector('#peGok'); ok.onclick=()=>paEinmal(ok,async()=>{
    const w=peVertretungWerte(M); if(!w)return;
    if(!gezeichnet){ kToast('Bitte unterschreiben.'); return; }
    const c=M.querySelector('#peGs canvas'), o=document.createElement('canvas'); o.width=600; o.height=Math.round(600*c.height/c.width); o.getContext('2d').drawImage(c,0,0,o.width,o.height);
    let g=null; try{ g=await svtRpc('partner_vertrag_gegenzeichnen',{p_vertrag:v.id,p_unterschrift:o.toDataURL('image/png'),p_unterzeichner:w.wer,p_funktion:w.fkt}); }catch(e){ kToast('⚠️ '+(e.message||e)); return; }
    await peNachUnterschrift(g,v,f,'Gegengezeichnet');
  },'Speichert …'); }

// ---------- Annehmen: Zusage ohne digitale Unterschrift des Partners (Papier, mündlich) für den Verein annehmen ----------
function peAnnehmen(v){ if(!v)return; const f=peFirma(v.sponsor);
  const M=svModal(`<div class="og-form pe-form pa-blatt"><div class="pa-bk"><h2>Für den Verein annehmen</h2><button type="button" class="pa-bx" onclick="closeOverlay()">Abbrechen</button></div>
    <p>Vertrag <b>${peE(v.nr)}</b> mit <b>${peE(f)}</b>${v.unterschrieben_am?`, zugesagt am ${peDat(v.unterschrieben_am)}`:''}. Mit „Annehmen“ ist der Vertrag geschlossen, sobald die Firma ihn bekommt. Die erste Rechnung entsteht und die Firma bekommt den Vertrag per Mail.</p>
    ${peVertretungFelder(v)}
    <p class="pe-recht" role="note">Mit „Annehmen“ nimmst du das Angebot für den Verein an. Nimm nur an, wenn du den Verein vertreten darfst (Vorstand nach § 26 BGB oder mit Vollmacht).</p>
    <div class="btnrow sbact"><button class="btn" type="button" id="peAok">${SVI('check')} Annehmen</button>${PE.d.darf_vertrag?'<button class="btn ghost" type="button" id="peAab">Nicht annehmen …</button>':''}</div></div>`);
  const ab=M.querySelector('#peAab'); if(ab)ab.onclick=()=>{ closeOverlay(); setTimeout(()=>peAblehnen(v),250); };
  const ok=M.querySelector('#peAok'); ok.onclick=()=>paEinmal(ok,async()=>{
