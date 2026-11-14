//---------------------------------------------------------------------
//
// QR Code Generator for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
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

var qrcode = function() {

  //---------------------------------------------------------------------
  // qrcode
  //---------------------------------------------------------------------

  /**
   * qrcode
   * @param typeNumber 1 to 40
   * @param errorCorrectionLevel 'L','M','Q','H'
   */
  var qrcode = function(typeNumber, errorCorrectionLevel) {

    var PAD0 = 0xEC;
    var PAD1 = 0x11;

    var _typeNumber = typeNumber;
    var _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
    var _modules = null;
    var _moduleCount = 0;
    var _dataCache = null;
    var _dataList = [];

    var _this = {};

    var makeImpl = function(test, maskPattern) {

      _moduleCount = _typeNumber * 4 + 17;
      _modules = function(moduleCount) {
        var modules = new Array(moduleCount);
        for (var row = 0; row < moduleCount; row += 1) {
          modules[row] = new Array(moduleCount);
          for (var col = 0; col < moduleCount; col += 1) {
            modules[row][col] = null;
          }
        }
        return modules;
      }(_moduleCount);

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
PLIB.rechnen=function(pos,leistungen,saisons){
  const s=Math.max(1,Math.min(5,+saisons||1)), rab=s>=3?.10:s===2?.05:0; let jahr=0,einmal=0,spende=0; const aus=[];
  (pos||[]).forEach(e=>{ const l=leistungen.find(x=>x.key===e.key); if(!l)return; const menge=Math.max(1,Math.min(99,+e.menge||1));
    const einzel=(l.art==='spende'||l.art==='sonstiges'||l.preis==null||e.preis!=null&&e.preis!=='')?(+e.preis||0):+l.preis;
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
   Beta 0.80/0.81 · Logo-Werkstatt (gemeinsam für Trikot- und Bandencreator)
   Ein Partnerlogo (PNG, JPG, SVG, Data-URL) wird im Browser analysiert und aufbereitet:
   - Hintergrund weg: weiße oder einfarbige Flächen am Rand werden durchsichtig (Flutfüllung vom Rand aus)
   - Zuschnitt auf das Logo (ohne leeren Rand)
   - Originalfarben: die wichtigsten Farben mit Anteil, hell oder dunkel, empfohlene Variante je Untergrund
   - Varianten: original, weiss, schwarz, farbe (beliebige Einfarbigkeit, z. B. Vereinsblau)
     Bei weiss/schwarz werden helle Innenflächen (z. B. weiße Schrift im farbigen Kasten) ausgespart, damit Details bleiben.
   Alles passiert auf dem Gerät, nichts verlässt den Browser.
   ===================================================================== */
const LOGO = (() => {
  const cache = new Map();
  function laden(src){
    if(cache.has(src)) return cache.get(src);
    const p = new Promise((ok, nein) => { const i = new Image(); i.decoding = 'async';
      if(!/^data:|^blob:/.test(src)) i.crossOrigin = 'anonymous';
      i.onload = () => ok(i); i.onerror = () => nein(new Error('Logo lässt sich nicht laden')); i.src = src; });
    cache.set(src, p); p.catch(() => cache.delete(src)); return p;
  }
  function leinwand(w, h){ const c = document.createElement('canvas'); c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0); return c; }
  function hex(r, g, b){ return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join(''); }
  function lum(r, g, b){ const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); }
  // Bild in eine Arbeitsfläche (höchstens 1200 px lange Seite, SVG ohne Maß bekommt 800 px)
  function raster(img, max = 1200){
    let w = img.naturalWidth || img.width || 800, h = img.naturalHeight || img.height || 400;
    const s = Math.min(1, max / Math.max(w, h)); w = Math.round(w * s); h = Math.round(h * s);
    const c = leinwand(w, h), x = c.getContext('2d', { willReadFrequently:true }); x.drawImage(img, 0, 0, w, h); return c;
  }
  // Hintergrund vom Rand her entfernen, wenn der Rand einfarbig ist (weiß, hellgrau oder eine Flächenfarbe)
  function freistellen(c, tol = 38){
    const x = c.getContext('2d', { willReadFrequently:true }), { width:w, height:h } = c, d = x.getImageData(0, 0, w, h), p = d.data;
    const randDurchsichtig = (() => { let n = 0, t = 0; for(let i = 0; i < w; i++){ [i, (h - 1) * w + i].forEach(k => { t++; if(p[k * 4 + 3] < 20) n++; }); } return n / t > .6; })();
    if(randDurchsichtig) return { c, entfernt:false };
    // häufigste Randfarbe
    const zaehl = new Map(); const rand = []; for(let i = 0; i < w; i++){ rand.push(i, (h - 1) * w + i); } for(let j = 0; j < h; j++){ rand.push(j * w, j * w + w - 1); }
    rand.forEach(k => { const q = ((p[k * 4] >> 4) << 8) | ((p[k * 4 + 1] >> 4) << 4) | (p[k * 4 + 2] >> 4); zaehl.set(q, (zaehl.get(q) || 0) + 1); });
    let best = 0, bq = 0; zaehl.forEach((v, q) => { if(v > best){ best = v; bq = q; } });
    if(best / rand.length < .55) return { c, entfernt:false };
    let br = 0, bg = 0, bb = 0, bn = 0; rand.forEach(k => { const q = ((p[k * 4] >> 4) << 8) | ((p[k * 4 + 1] >> 4) << 4) | (p[k * 4 + 2] >> 4); if(q === bq){ br += p[k * 4]; bg += p[k * 4 + 1]; bb += p[k * 4 + 2]; bn++; } });
    br /= bn; bg /= bn; bb /= bn;
    const nah = k => Math.abs(p[k * 4] - br) + Math.abs(p[k * 4 + 1] - bg) + Math.abs(p[k * 4 + 2] - bb) < tol * 1.6;
    const weg = new Uint8Array(w * h), st = []; rand.forEach(k => { if(nah(k)){ weg[k] = 1; st.push(k); } });
    while(st.length){ const k = st.pop(), xx = k % w, yy = (k / w) | 0;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = xx + dx, ny = yy + dy; if(nx < 0 || ny < 0 || nx >= w || ny >= h) return; const n = ny * w + nx; if(!weg[n] && nah(n)){ weg[n] = 1; st.push(n); } }); }
    // weiche Kante: Pixel neben dem Hintergrund halb durchsichtig
    for(let k = 0; k < w * h; k++){ if(weg[k]){ p[k * 4 + 3] = 0; continue; }
      const xx = k % w, yy = (k / w) | 0; let n = 0; if(xx > 0 && weg[k - 1]) n++; if(xx < w - 1 && weg[k + 1]) n++; if(yy > 0 && weg[k - w]) n++; if(yy < h - 1 && weg[k + w]) n++;
      if(n) p[k * 4 + 3] = Math.min(p[k * 4 + 3], 255 - n * 45); }
    x.putImageData(d, 0, 0); return { c, entfernt:true, hintergrund:hex(br | 0, bg | 0, bb | 0) };
  }
  function zuschneiden(c, pad = .03){
    const x = c.getContext('2d', { willReadFrequently:true }), { width:w, height:h } = c, p = x.getImageData(0, 0, w, h).data;
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for(let y = 0; y < h; y++) for(let i = 0; i < w; i++){ if(p[(y * w + i) * 4 + 3] > 24){ if(i < x0) x0 = i; if(i > x1) x1 = i; if(y < y0) y0 = y; if(y > y1) y1 = y; } }
    if(x1 < 0) return c;
    const m = Math.round(Math.max(x1 - x0, y1 - y0) * pad); x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(w - 1, x1 + m); y1 = Math.min(h - 1, y1 + m);
    const n = leinwand(x1 - x0 + 1, y1 - y0 + 1); n.getContext('2d').drawImage(c, x0, y0, n.width, n.height, 0, 0, n.width, n.height); return n;
  }
  // Farben zählen (grob in 4-Bit je Kanal), nur sichtbare Pixel
  function farben(c){
    const p = c.getContext('2d', { willReadFrequently:true }).getImageData(0, 0, c.width, c.height).data, m = new Map(); let n = 0;
    const schritt = Math.max(1, Math.floor(c.width * c.height / 60000));
    for(let k = 0; k < p.length / 4; k += schritt){ if(p[k * 4 + 3] < 128) continue; n++;
      const q = ((p[k * 4] >> 4) << 8) | ((p[k * 4 + 1] >> 4) << 4) | (p[k * 4 + 2] >> 4); const e = m.get(q) || { n:0, r:0, g:0, b:0 }; e.n++; e.r += p[k * 4]; e.g += p[k * 4 + 1]; e.b += p[k * 4 + 2]; m.set(q, e); }
    let L = [...m.values()].map(e => ({ r:e.r / e.n | 0, g:e.g / e.n | 0, b:e.b / e.n | 0, n:e.n }));
    // ähnliche Farben zusammenfassen
    const zus = []; L.sort((a, b) => b.n - a.n).forEach(f => { const z = zus.find(g => Math.abs(g.r - f.r) + Math.abs(g.g - f.g) + Math.abs(g.b - f.b) < 60); if(z){ z.n += f.n; } else zus.push({ ...f }); });
    return zus.filter(f => f.n / Math.max(1, n) > .015).slice(0, 6).map(f => ({ hex:hex(f.r, f.g, f.b), anteil:Math.round(f.n / Math.max(1, n) * 100), hell:lum(f.r, f.g, f.b) > .55 }));
  }
  // Einfarbig (0.81): Abstand zu Weiß als weiche Deckung. Farbiges und Dunkles wird voll, Weißes im Logo fällt weg (bleibt als Aussparung),
  // Kanten bleiben glatt. Ist das Logo selbst überwiegend hell (weiße Schrift), wird alles Sichtbare eingefärbt.
  const sst = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  function einfarbig(c, farbe){
    const n = leinwand(c.width, c.height), x = n.getContext('2d', { willReadFrequently:true }); x.drawImage(c, 0, 0);
    const d = x.getImageData(0, 0, n.width, n.height), p = d.data;
    let hell = 0, dunkel = 0; for(let k = 0; k < p.length; k += 4){ if(p[k + 3] < 128) continue; if(lum(p[k], p[k + 1], p[k + 2]) > .78) hell++; else dunkel++; }
    const nurHell = hell / Math.max(1, hell + dunkel) >= .6;
    const [r, g, b] = [1, 3, 5].map(i => parseInt(farbe.slice(i, i + 2), 16));
    for(let k = 0; k < p.length; k += 4){ const a = p[k + 3] / 255; if(!a){ continue; }
      let deck = a;
      if(!nurHell){ const m = Math.min(p[k], p[k + 1], p[k + 2]) / 255 * a + (1 - a); deck = sst(.1, .42, 1 - m); }
      p[k] = r; p[k + 1] = g; p[k + 2] = b; p[k + 3] = Math.round(deck * 255); }
    x.putImageData(d, 0, 0); return n;
  }
  // Mitgelieferte Logos (kit/logos/name.png) haben eine von Hand geprüfte weiße Fassung unter kit/logos/weiss/name.png
  function weissDatei(src){ const m = /^(.*?)(kit\/logos\/)([a-z0-9-]+)\.png(\?.*)?$/.exec(String(src || '')); return m ? m[1] + m[2] + 'weiss/' + m[3] + '.png' : null; }
  const merk = new Map();
  // Aufbereiten: freistellen, zuschneiden, analysieren. Ergebnis wird je Quelle gemerkt.
  async function aufbereiten(src){
    if(merk.has(src)) return merk.get(src);
    const pr = (async () => {
      const img = await laden(src); const r = raster(img); const f = freistellen(r); const c = zuschneiden(f.c);
      const F = farben(c), dunkelAnteil = F.filter(x => !x.hell).reduce((s, x) => s + x.anteil, 0);
      return { quelle:src, c, breite:c.width, hoehe:c.height, seiten:c.width / Math.max(1, c.height), farben:F, hintergrundEntfernt:f.entfernt, hintergrund:f.hintergrund || null,
        hell:dunkelAnteil < 35, empfehlung: dunkelAnteil < 35 ? 'auf dunklem Grund im Original, sonst weiß' : 'auf hellem Grund im Original, auf Farbe weiß' };
    })();
    merk.set(src, pr); pr.catch(() => merk.delete(src)); return pr;
  }
  // Variante als Leinwand: original | weiss | schwarz | farbe:#rrggbb
  async function variante(src, art = 'original'){
    const a = await aufbereiten(src);
    if(art === 'original') return a.c;
    const k = art + '|' + src; if(merk.has(k)) return merk.get(k);
    const wd = art === 'weiss' && weissDatei(src);
    if(wd){ try{ const w = (await aufbereiten(wd)).c; merk.set(k, w); return w; }catch(e){ /* sonst selbst rechnen */ } }
    const farbe = art === 'weiss' ? '#ffffff' : art === 'schwarz' ? '#111111' : (art.startsWith('farbe:') ? art.slice(6) : '#ffffff');
    const c = einfarbig(a.c, farbe); merk.set(k, c); return c;
  }
  async function alsDataUrl(src, art, max = 1024){
    const c = await variante(src, art); const s = Math.min(1, max / Math.max(c.width, c.height));
    if(s >= 1) return c.toDataURL('image/png'); const n = leinwand(c.width * s, c.height * s); n.getContext('2d').drawImage(c, 0, 0, n.width, n.height); return n.toDataURL('image/png');
  }
  // Datei vom Gerät (input type=file) als Data-URL, höchstens 2 MB
  function dateiLesen(f){ return new Promise((ok, nein) => { if(!f) return nein(new Error('Keine Datei'));
    if(!/^image\/(png|jpeg|webp|svg\+xml)$/.test(f.type)) return nein(new Error('Bitte ein Bild (PNG, JPG, WebP oder SVG)'));
    if(f.size > 2 * 1024 * 1024) return nein(new Error('Das Logo ist größer als 2 MB'));
    const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = () => nein(new Error('Datei lässt sich nicht lesen')); r.readAsDataURL(f); }); }
  return { laden, aufbereiten, variante, alsDataUrl, dateiLesen, lum, hex };
})();

/* =====================================================================
   Beta 0.80 · Bandencreator: Gestaltung, Druckdaten und Platzszene
   Gemeinsam für die App (svm79.js) und die Partner-Präsentation (partner.js), braucht LOGO (logolib.js).
   - Feste Regeln, damit alle Banden zusammenpassen: Sicherheitsabstand, Logo-Zone, Name und Slogan, Kontaktleiste unten,
     im Partner-CI-Stil rechts der Vereinsabsender (Doppel-Logo, „SV/BSC MÖRLENBACH“, Handschrift „Mörlenbach steht zusammen!“
     mit dem einen orangen Unterstrich). Schriften und Farben aus dem Corporate Design Manual.
   - Alles in Millimetern. layout() liefert eine Liste von Bausteinen (Fläche, Linie, Bild, Text, Strich) mit ihren Kästen,
     daraus malen (Canvas), svg (Vektor mit eingebetteten Schriften), pdf (Originalgröße mit 2 cm Beschnitt und Schnittmarken).
   - Text passt immer: Schrift wird kleiner (auch zweizeilig), nie abgeschnitten. Lesbar heißt: Versalhöhe ≥ Abstand / 250.
   - szene(): die Bande am Spielfeldrand in Perspektive mit Nachbarbanden im Einheitslook, Rasen und Tageslicht.
   Nichts verlässt das Gerät.
   ===================================================================== */
const BANDE = (() => {
  const C = { marine:'#1d2760', orange:'#e8741f', tinte:'#1c1c22', grau:'#3a3a44', himmel:'#8fc9ec', weiss:'#ffffff' };
  const FORMATE = {
    '300x80':  { w:3000, h:800,  t:'3,00 × 0,80 m', k:'3 m', lang:'3 m lang, 80 cm hoch', std:true },
    '400x80':  { w:4000, h:800,  t:'4,00 × 0,80 m', k:'4 m', lang:'4 m lang, 80 cm hoch' },
    '500x80':  { w:5000, h:800,  t:'5,00 × 0,80 m', k:'5 m', lang:'5 m lang, 80 cm hoch', hinweis:'Maß der heutigen Banden: zwei Platten zu je 2,50 m' },
    '600x80':  { w:6000, h:800,  t:'6,00 × 0,80 m', k:'6 m', lang:'6 m lang, 80 cm hoch' },
    '200x100': { w:2000, h:1000, t:'2,00 × 1,00 m', k:'Partnerwand', lang:'Feld der Partnerwand, 2 m breit, 1 m hoch', wand:true } };
  const BESCHNITT = 20;           // mm je Seite
  const LAYOUTS = [['links', 'Logo links'], ['mitte', 'Logo groß'], ['claim', 'Mit Slogan']];
  const FAM = { c:"'BandeC','Barlow Condensed','PZC','BarlowC','Arial Narrow',sans-serif", t:"'BandeT','Barlow','InterV',Arial,sans-serif", h:"'BandeH','Caveat','PZHand',cursive" };
  const ABSENDER = 'SV/BSC MÖRLENBACH', HAND = 'Mörlenbach steht zusammen!';
  const SCHRIFTEN = [['BandeC', 'barlowc-900.woff2', '900'], ['BandeT', 'barlow-500.woff2', '500'], ['BandeT', 'barlow-600.woff2', '600'], ['BandeT', 'barlow-700.woff2', '700'], ['BandeH', 'caveat-700.woff2', '700']];

  /* ---------- Farben ---------- */
  const rgb = h => { h = String(h || '').replace('#', ''); if(h.length === 3) h = h.split('').map(x => x + x).join(''); const n = parseInt(h, 16) || 0; return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const lum = h => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; const [r, g, b] = rgb(h); return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  const kontrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const sl = h => { const [r, g, b] = rgb(h).map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn; return { s:d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1)), l }; };
  const textAuf = bg => kontrast(bg, C.weiss) >= kontrast(bg, C.tinte) ? C.weiss : C.tinte;
  // Firmenfarbe aus dem Logo: die häufigste kräftige Farbe, sonst die dunkelste, sonst Marine
  function akzent(farben){
    const L = (farben || []).map(f => Object.assign({}, f, sl(f.hex))).filter(f => f.s > .3 && f.l > .12 && f.l < .82);
    if(L.length) return L.sort((a, b) => b.anteil - a.anteil)[0].hex;
    const d = (farben || []).filter(f => lum(f.hex) < .2).sort((a, b) => b.anteil - a.anteil)[0];
    return d ? d.hex : C.marine;
  }

  /* ---------- Schriften und Messen ---------- */
  let schriftP = null, basisJetzt = 'partner/';
  function schriften(basis){
    if(basis) basisJetzt = basis; if(schriftP) return schriftP;
    if(typeof FontFace === 'undefined' || !document.fonts) return (schriftP = Promise.resolve());
    schriftP = Promise.all(SCHRIFTEN.map(([fam, f, w]) => new FontFace(fam, `url(${basisJetzt}${f})`, { weight:w }).load().then(x => { document.fonts.add(x); }).catch(() => {})))
      .then(() => { MESS.clear(); });
    return schriftP;
  }
  const MESS = new Map(); let MC = null;
  const font = (f, fs) => `${f.w} ${fs}px ${FAM[f.fam]}`;
  // Maße bei 100 px Schriftgröße; Laufweite (ls, in em) zählt mit
  function mess(text, f){
    const k = f.fam + f.w + '|' + (f.ls || 0) + '|' + text; if(MESS.has(k)) return MESS.get(k);
    if(!MC) MC = document.createElement('canvas').getContext('2d');
    MC.font = font(f, 100); const m = MC.measureText(text), n = [...text].length;
    const r = { w:m.width + (f.ls || 0) * 100 * Math.max(0, n - 1), a:m.actualBoundingBoxAscent || 72, d:m.actualBoundingBoxDescent || 0, l:m.actualBoundingBoxLeft || 0 };
    MESS.set(k, r); return r;
  }
  const versal = f => mess('H', f).a / 100;     // Versalhöhe je mm Schriftgröße
  const lesbarAus = (f, fs) => Math.round(versal(f) * fs / 4) ;   // Meter: Versalhöhe (mm) mal 250 / 1000
  const sauber = t => String(t == null ? '' : t).replace(/\s*[–—]\s*/g, ' · ').replace(/\s+/g, ' ').trim();
  const webKurz = w => sauber(w).replace(/^https?:\/\//i, '').replace(/\/+$/, '');

  // Text in einen Kasten einpassen: eine oder zwei Zeilen, die größere Schrift gewinnt (zwei Zeilen erst ab 15 % Gewinn).
  function einpassen(text, f, maxW, maxH, maxFs, zeilen = 2, lh = .92){
    text = sauber(text); if(!text || maxW <= 0 || maxH <= 0) return null;
    const opts = [[text]], w = text.split(' ');
    if(zeilen >= 2 && w.length > 1){ let best = null;
      for(let i = 1; i < w.length; i++){ const a = w.slice(0, i).join(' '), b = w.slice(i).join(' '), m = Math.max(mess(a, f).w, mess(b, f).w); if(!best || m < best.m) best = { m, L:[a, b] }; }
      opts.push(best.L); }
    let best = null;
    opts.forEach(L => {
      const wMax = Math.max(...L.map(z => mess(z, f).w)) / 100, a = Math.max(...L.map(z => mess(z, f).a)) / 100, d = Math.max(...L.map(z => mess(z, f).d)) / 100;
      const hPer = (L.length - 1) * lh + a + d, fs = Math.max(1, Math.min(maxFs, maxW / wMax, maxH / hPer));
      if(!best || fs > best.fs * (L.length > 1 ? 1.06 : 1)) best = { L, fs, wMax, a, d, hPer, lh, f };
    });
    best.w = best.wMax * best.fs; best.h = best.hPer * best.fs; return best;
  }
  // Textbaustein an Position (x je nach Ausrichtung, y = Oberkante)
  function textOp(p, x, y, align, fill, rolle, extra){
    const box = { x:align === 'c' ? x - p.w / 2 : align === 'r' ? x - p.w : x, y, w:p.w, h:p.h };
    return Object.assign({ t:'text', lines:p.L, f:p.f, fs:p.fs, lh:p.lh, a:p.a, x, y, align, fill, rolle, box }, extra || {});
  }

  /* ---------- Layout ---------- */
  // spec: { format, stil:'ci'|'original', layout, firma, name, claim, web, telefon, branche, kontakt, nameAn, logoFarbe:'marine'|'schwarz', akzent }
  // res:  { logo:{w,h,hell,farben}, wappen:{w,h} }  (aus vorbereiten)
  function layout(spec, res){
    spec = spec || {}; res = res || {};
    const F = FORMATE[spec.format] || FORMATE['300x80'], W = F.w, H = F.h, ci = spec.stil !== 'original';
    const ops = [], info = { warn:[], kontrast:[], lesbar:{} };
    const m = Math.round(H * .075), logo = res.logo && res.logo.w ? res.logo : null;
    const web = webKurz(spec.web), tel = sauber(spec.telefon), kText = [web, tel].filter(Boolean).join('   ·   ');
    const kontakt = spec.kontakt !== false && !!kText;
    const bandH = Math.round(H * (kontakt || ci ? .2 : .05));
    const name = sauber(spec.name || spec.firma), claim = sauber(spec.claim);
    const nameAn = spec.nameAn != null ? !!spec.nameAn : !logo;   // das Logo trägt den Namen meist schon, ohne Logo steht er groß da
    // Farben
    let bg = C.weiss, band, bandText, nameF, claimF, ak = null;
    if(ci){ band = C.marine; bandText = C.weiss; nameF = C.marine; claimF = C.grau; }
    else { ak = (/^#[0-9a-fA-F]{6}$/.test(spec.akzent || '') ? spec.akzent : null) || akzent(logo && logo.farben);
      if(logo && logo.hell){ bg = lum(ak) < .16 ? ak : C.tinte; nameF = C.weiss; claimF = '#e9ebf1'; band = C.weiss; bandText = kontrast(bg, C.weiss) >= 4.5 ? bg : C.tinte; }
      else { nameF = C.tinte; claimF = C.grau; band = ak; bandText = textAuf(ak); } }
    ops.push({ t:'rect', x:-BESCHNITT, y:-BESCHNITT, w:W + 2 * BESCHNITT, h:H + 2 * BESCHNITT, fill:bg, rolle:'grund' });
    ops.push({ t:'rect', x:-BESCHNITT, y:H - bandH, w:W + 2 * BESCHNITT, h:bandH + BESCHNITT, fill:band, rolle:'leiste' });
    const yTop = m, yBot = H - bandH - Math.round(m * .8), Hu = yBot - yTop;
    let x0 = m, x1 = W - m, wap = null;
    // Vereinsabsender (nur Partner-CI): Doppel-Logo, Kurzabsender, Handschrift mit orangem Unterstrich
    if(ci){
      const aw = Math.round(Math.min(720, Math.max(460, W * .2))), ax = W - m - aw, gD = Math.round(H * .06), cx = ax + aw / 2;
      ops.push({ t:'linie', x1:ax - gD, y1:yTop + Hu * .05, x2:ax - gD, y2:yBot - Hu * .05, w:4, stroke:C.marine, rolle:'trenner' });
      x1 = ax - 2 * gD;
      const wr = res.wappen && res.wappen.h ? res.wappen.w / res.wappen.h : 1.759;
      const svF = { fam:'c', w:900, ls:.03 }, hF = { fam:'h', w:700 };
      let ah = Math.min(Hu * .42, aw / wr), k = 1, sv, hd, g1, g2, us, tot;
      for(let i = 0; i < 4; i++){
        sv = einpassen(ABSENDER, svF, aw, Hu * .14 * k, H * .085 * k, 1);
        hd = einpassen(HAND, hF, aw * .98, Hu * .2 * k, H * .1 * k, 1, .95);
        if(hd.fs < H * .07 * k) hd = einpassen(HAND, hF, aw * .98, Hu * .36 * k, H * .1 * k, 2, .95);
        g1 = ah * .16; g2 = H * .035 * k; us = H * .04 * k; tot = ah + g1 + sv.h + g2 + hd.h + us;
        if(tot <= Hu + .5) break; const s = Hu / tot; ah *= s; k *= s;
      }
      let y = yTop + (Hu - tot) / 2;
      wap = { t:'img', key:'wappen', x:cx - ah * wr / 2, y, w:ah * wr, h:ah, rolle:'wappen' }; ops.push(wap); y += ah + g1;
      ops.push(textOp(sv, cx, y, 'c', C.marine, 'absender')); y += sv.h + g2;
      const hop = textOp(hd, cx, y, 'c', C.marine, 'hand', { rot:-2.5 }); ops.push(hop);
      const lw = mess(hd.L[hd.L.length - 1], hF).w / 100 * hd.fs, uy = y + hd.h + us * .35;
      ops.push({ t:'strich', pts:[[cx - lw * .46, uy + us * .1], [cx, uy - us * .12], [cx + lw * .48, uy - us * .02]], w:H * .011, stroke:C.orange, rolle:'unterstrich',
        box:{ x:cx - lw * .46, y:uy - us * .25, w:lw * .94, h:us * .5 } });
      info.wappenHoehe = Math.round(ah);
    }
    const aw = x1 - x0, quer = aw / Hu >= 2.1, cxA = x0 + aw / 2;
    const NAME = name.toUpperCase(), lay = spec.layout === 'mitte' || spec.layout === 'claim' ? spec.layout : 'links';
    const nF = { fam:'c', w:900 }, cF = { fam:'t', w:600 }, lF = { fam:'t', w:700, ls:.08 };
    const logoBox = (mw, mh) => { if(!logo) return null; const r = logo.w / logo.h; let w = mw, h = w / r; if(h > mh){ h = mh; w = h * r; } return { w, h }; };
    const stapel = (teile, x, y, align) => { let yy = y; teile.forEach(([p, fill, rolle, gap]) => { if(!p) return; ops.push(textOp(p, x, yy, align, fill, rolle)); yy += p.h + (gap || 0); }); };
    const hoehe = teile => teile.reduce((s, [p, , , gap], i) => s + (p ? p.h + (i < teile.length - 1 ? gap || 0 : 0) : 0), 0);
    let logoOp = null;
    if(lay === 'links'){
      const tx = [nameAn || !logo ? NAME : '', claim].filter(Boolean).length;
      if(quer){
        const lb = logoBox(tx ? aw * .46 : aw, Hu * .92), gT = Math.round(H * .08);
        if(lb){ logoOp = { t:'img', key:'logo', x:tx ? x0 : cxA - lb.w / 2, y:yTop + (Hu - lb.h) / 2, w:lb.w, h:lb.h, rolle:'logo' }; ops.push(logoOp); }
        const tX = lb ? x0 + lb.w + gT : x0, tw = x1 - tX, beide = (nameAn || !logo) && claim;
        const pn = nameAn || !logo ? einpassen(NAME, nF, tw, Hu * (beide ? .58 : .86), Hu * (logo ? .5 : .62), 2) : null;
        const pc = claim ? einpassen(claim, cF, tw, Hu * (pn ? .3 : .5), Hu * (pn ? .18 : .26), 2, 1.08) : null;
        const T = [[pn, nameF, 'name', Hu * .07], [pc, claimF, 'claim', 0]];
        if(pn || pc) stapel(T, tX, yTop + (Hu - hoehe(T)) / 2, 'l');
      } else {
        const lb = logoBox(aw, Hu * (tx ? .5 : .9)), g = Hu * .07;
        const pn = nameAn || !logo ? einpassen(NAME, nF, aw, Hu * (lb ? (claim ? .26 : .38) : (claim ? .6 : .9)), Hu * .4, 2) : null;
        const pc = claim ? einpassen(claim, cF, aw, Hu * (lb ? .14 : .3), Hu * .12, 2, 1.08) : null;
        const T = [[pn, nameF, 'name', Hu * .05], [pc, claimF, 'claim', 0]], th = hoehe(T), tot = (lb ? lb.h + (th ? g : 0) : 0) + th;
        let y = yTop + (Hu - tot) / 2;
        if(lb){ logoOp = { t:'img', key:'logo', x:x0, y, w:lb.w, h:lb.h, rolle:'logo' }; ops.push(logoOp); y += lb.h + g; }
        stapel(T, x0, y, 'l');
      }
    } else if(lay === 'mitte'){
      const unten = claim || (nameAn && logo ? name : '');
      if(logo){
        const g = Hu * .07, pc = unten ? einpassen(unten, claim ? cF : { fam:'c', w:900 }, aw * .9, Hu * .2, Hu * .16, 1) : null;
        const lb = logoBox(ci ? aw * .86 : aw * .9, Hu * (pc ? .94 - (pc.h + g) / Hu : .94)), tot = lb.h + (pc ? g + pc.h : 0);
        let y = yTop + (Hu - tot) / 2;
        logoOp = { t:'img', key:'logo', x:cxA - lb.w / 2, y, w:lb.w, h:lb.h, rolle:'logo' }; ops.push(logoOp); y += lb.h + g;
        if(pc) ops.push(textOp(pc, cxA, y, 'c', claim ? claimF : nameF, claim ? 'claim' : 'name'));
      } else {
        const pn = einpassen(NAME, nF, aw, Hu * (claim ? .62 : .9), Hu * .7, 2), pc = claim ? einpassen(claim, cF, aw * .9, Hu * .26, Hu * .2, 2, 1.08) : null;
        const T = [[pn, nameF, 'name', Hu * .07], [pc, claimF, 'claim', 0]]; stapel(T, cxA, yTop + (Hu - hoehe(T)) / 2, 'c');
      }
    } else {
      // Mit Slogan: der Slogan ist die große Zeile, darüber klein der Name; ohne Slogan die Branche, sonst der Name
      const head = (claim || sauber(spec.branche) || name).toUpperCase(), label = (claim || spec.branche) && (nameAn || !logo) ? NAME : '';
      if(quer){
        const lr = logo ? logo.w / logo.h : 1, lb = logoBox(aw * Math.min(.46, Math.max(.32, .32 + (lr - 2) * .04)), Hu * .66), gT = Math.round(H * .08);
        if(lb){ logoOp = { t:'img', key:'logo', x:x0, y:yTop + (Hu - lb.h) / 2, w:lb.w, h:lb.h, rolle:'logo' }; ops.push(logoOp); }
        const tX = lb ? x0 + lb.w + gT : x0, tw = x1 - tX;
        const pl = label ? einpassen(label, lF, tw, Hu * .12, Hu * .1, 1) : null, ph = einpassen(head, nF, tw, Hu * (pl ? .7 : .88), Hu * .38, 2, .9);
        const T = [[pl, ci ? C.marine : C.grau, 'label', Hu * .06], [ph, ci ? C.tinte : nameF, 'name', 0]];
        stapel(T, tX, yTop + (Hu - hoehe(T)) / 2, 'l');
      } else {
        const lb = logoBox(aw * .7, Hu * .38), g = Hu * .07;
        const pl = label ? einpassen(label, lF, aw, Hu * .1, Hu * .08, 1) : null, ph = einpassen(head, nF, aw, Hu * (lb ? .4 : .7), Hu * .3, 2, .9);
        const T = [[pl, ci ? C.marine : C.grau, 'label', Hu * .04], [ph, ci ? C.tinte : nameF, 'name', 0]], th = hoehe(T), tot = (lb ? lb.h + g : 0) + th;
        let y = yTop + (Hu - tot) / 2;
        if(lb){ logoOp = { t:'img', key:'logo', x:x0, y, w:lb.w, h:lb.h, rolle:'logo' }; ops.push(logoOp); y += lb.h + g; }
        stapel(T, x0, y, 'l');
      }
    }
    // Schutzraum zwischen Partnerlogo und Doppel-Logo: mindestens die halbe Höhe der größeren Marke
    if(logoOp && wap){
      const brauch = () => .5 * Math.max(logoOp.h, wap.h);
      for(let i = 0; i < 12 && wap.x - (logoOp.x + logoOp.w) < brauch(); i++){
        const cx = logoOp.x + logoOp.w / 2, cy = logoOp.y + logoOp.h / 2, s = .92; logoOp.w *= s; logoOp.h *= s;
        logoOp.x = lay === 'mitte' ? cx - logoOp.w / 2 : logoOp.x; logoOp.y = cy - logoOp.h / 2; }
      info.schutzraum = Math.round(wap.x - (logoOp.x + logoOp.w)); info.schutzraumNoetig = Math.round(.5 * Math.max(logoOp.h, wap.h));
    }
    if(logoOp) logoOp.box = { x:logoOp.x, y:logoOp.y, w:logoOp.w, h:logoOp.h };
    if(wap) wap.box = { x:wap.x, y:wap.y, w:wap.w, h:wap.h };
    // Kontaktleiste
    if(kontakt){
      const kF = { fam:'t', w:600 }, mitte = lay === 'mitte', kw = mitte ? aw : W - 2 * m;
      const p = einpassen(kText, kF, kw, bandH * .66, bandH * .6, 1);
      ops.push(textOp(p, mitte ? cxA : x0, H - bandH + (bandH - p.h) / 2, mitte ? 'c' : 'l', bandText, 'kontakt'));
    }
    // Auswertung: Kontrast und Lesbarkeit je Text
    ops.filter(o => o.t === 'text').forEach(o => {
      const auf = o.rolle === 'kontakt' ? band : bg; info.kontrast.push({ rolle:o.rolle, text:o.fill, grund:auf, wert:Math.round(kontrast(o.fill, auf) * 10) / 10 });
      const d = lesbarAus(o.f, o.fs); if(!info.lesbar[o.rolle] || d < info.lesbar[o.rolle]) info.lesbar[o.rolle] = d; });
    const haupt = info.lesbar.name || 0;
    if(haupt && haupt < 30) info.warn.push('Der große Text ist nur aus ' + haupt + ' m lesbar. Kürzer wird er größer.');
    if(info.lesbar.kontakt && info.lesbar.kontakt < 15) info.warn.push('Die Kontaktzeile ist nur aus ' + info.lesbar.kontakt + ' m lesbar. Lass die Telefonnummer oder die Website weg.');
    if(!logo && spec.logoGewollt) info.warn.push('Das Logo fehlt noch. Bis dahin steht der Name als Schriftzug.');
    return { W, H, B:BESCHNITT, rand:m, leiste:bandH, format:spec.format in FORMATE ? spec.format : '300x80', stil:ci ? 'ci' : 'original', layout:lay, ops, info, farben:{ grund:bg, leiste:band, akzent:ak } };
  }

  /* ---------- Malen (Canvas, 1 Einheit = 1 mm, Ursprung = Endformat oben links) ---------- */
  function malen(x, L, res){
    res = res || {};
    L.ops.forEach(o => {
      if(o.t === 'rect'){ x.fillStyle = o.fill; x.fillRect(o.x, o.y, o.w, o.h); }
      else if(o.t === 'linie'){ x.strokeStyle = o.stroke; x.lineWidth = o.w; x.lineCap = 'round'; x.beginPath(); x.moveTo(o.x1, o.y1); x.lineTo(o.x2, o.y2); x.stroke(); }
      else if(o.t === 'strich'){ const [a, b, c] = o.pts; x.strokeStyle = o.stroke; x.lineWidth = o.w; x.lineCap = 'round'; x.beginPath(); x.moveTo(a[0], a[1]); x.quadraticCurveTo(b[0], b[1], c[0], c[1]); x.stroke(); }
      else if(o.t === 'img'){ const im = o.key === 'logo' ? res.logoBild : res.wappenBild; if(im) try{ x.drawImage(im, o.x, o.y, o.w, o.h); }catch(e){} }
      else if(o.t === 'text'){
        x.save(); x.fillStyle = o.fill; x.font = font(o.f, o.fs); x.textBaseline = 'alphabetic';
        if(o.rot){ const cx = o.box.x + o.box.w / 2, cy = o.box.y + o.box.h / 2; x.translate(cx, cy); x.rotate(o.rot * Math.PI / 180); x.translate(-cx, -cy); }
        o.lines.forEach((z, i) => { const lw = mess(z, o.f).w / 100 * o.fs, sx = o.align === 'c' ? o.x - lw / 2 : o.align === 'r' ? o.x - lw : o.x, by = o.y + o.a * o.fs + i * o.lh * o.fs;
          if(o.f.ls){ let xx = sx; [...z].forEach(ch => { x.fillText(ch, xx, by); xx += mess(ch, o.f).w / 100 * o.fs + o.f.ls * o.fs; }); }
          else x.fillText(z, sx, by); });
        x.restore(); }
    });
  }
  // Fertiges Bild der Bande; mitBeschnitt: mit 2 cm Rand
  function bild(L, res, pxProMm, mitBeschnitt){
    const b = mitBeschnitt ? L.B : 0, c = document.createElement('canvas');
    c.width = Math.max(1, Math.round((L.W + 2 * b) * pxProMm)); c.height = Math.max(1, Math.round((L.H + 2 * b) * pxProMm));
    const x = c.getContext('2d'); x.setTransform(pxProMm, 0, 0, pxProMm, b * pxProMm, b * pxProMm); malen(x, L, res); return c;
  }

  /* ---------- Vorbereiten: Schriften, Logo (Variante je Stil) und Doppel-Logo ---------- */
  const bilder = new Map();
  function laden(src){ if(bilder.has(src)) return bilder.get(src);
    const p = new Promise((ok, nein) => { const i = new Image(); i.decoding = 'async'; i.onload = () => ok(i); i.onerror = () => nein(new Error('Bild fehlt')); i.src = src; });
    bilder.set(src, p); p.catch(() => bilder.delete(src)); return p; }
  async function vorbereiten(spec, o){
    o = o || {}; await schriften(o.basis);
    const res = {}, ci = spec.stil !== 'original';
    if(spec.logo && typeof LOGO !== 'undefined'){
      try{ const a = await LOGO.aufbereiten(spec.logo); const art = ci ? 'farbe:' + (spec.logoFarbe === 'schwarz' ? C.tinte : C.marine) : 'original';
        const c = await LOGO.variante(spec.logo, art); res.logo = { w:c.width, h:c.height, hell:a.hell, farben:a.farben }; res.logoBild = c; res.analyse = a; }
      catch(e){ res.logoFehler = e.message || 'Logo lässt sich nicht laden'; } }
    if(ci){ try{ const w = await laden(o.wappen || 'plakat/wappen/svbsc-moerlenbach.webp'); res.wappenBild = w; res.wappen = { w:w.naturalWidth || 1379, h:w.naturalHeight || 784 }; }
      catch(e){ try{ const w = await laden('partner/svbsc.png'); res.wappenBild = w; res.wappen = { w:w.naturalWidth, h:w.naturalHeight }; }catch(_){} } }
    return res;
  }

  /* ---------- Druckansicht: flach, mit Beschnitt, Schnittmarken und Maßen ---------- */
  function flach(cv, L, res, o){
    o = o || {}; const dpr = Math.min(2, window.devicePixelRatio || 1), r = cv.getBoundingClientRect();
    const Wc = Math.max(10, Math.round(r.width * dpr)), Hc = Math.max(10, Math.round(r.height * dpr)); cv.width = Wc; cv.height = Hc;
    const x = cv.getContext('2d'), pad = 46 * dpr, B = L.B;
    x.fillStyle = '#efe9dd'; x.fillRect(0, 0, Wc, Hc);
    const s = Math.min((Wc - 2 * pad) / (L.W + 2 * B), (Hc - 2 * pad - 22 * dpr) / (L.H + 2 * B)), ox = (Wc - (L.W + 2 * B) * s) / 2 + B * s, oy = (Hc - (L.H + 2 * B) * s) / 2 - 8 * dpr + B * s;
    x.save(); x.shadowColor = 'rgba(20,27,71,.25)'; x.shadowBlur = 18 * dpr; x.shadowOffsetY = 6 * dpr; x.fillStyle = '#fff'; x.fillRect(ox - B * s, oy - B * s, (L.W + 2 * B) * s, (L.H + 2 * B) * s); x.restore();
    x.save(); x.setTransform(s, 0, 0, s, ox, oy); x.beginPath(); x.rect(-B, -B, L.W + 2 * B, L.H + 2 * B); x.clip(); malen(x, L, res); x.restore();
    // Beschnitt aufhellen, Endformat als Linie
    x.fillStyle = 'rgba(239,233,221,.62)';
    x.fillRect(ox - B * s, oy - B * s, (L.W + 2 * B) * s, B * s); x.fillRect(ox - B * s, oy + L.H * s, (L.W + 2 * B) * s, B * s);
    x.fillRect(ox - B * s, oy, B * s, L.H * s); x.fillRect(ox + L.W * s, oy, B * s, L.H * s);
    x.strokeStyle = 'rgba(28,28,34,.55)'; x.lineWidth = 1 * dpr; x.strokeRect(ox, oy, L.W * s, L.H * s);
    if(o.raster){ x.save(); x.setLineDash([6 * dpr, 5 * dpr]); x.strokeStyle = '#e8741f'; x.lineWidth = 1.2 * dpr; x.strokeRect(ox + L.rand * s, oy + L.rand * s, (L.W - 2 * L.rand) * s, (L.H - L.leiste - 1.8 * L.rand) * s); x.restore(); }
    // Schnittmarken
    x.strokeStyle = '#1c1c22'; x.lineWidth = 1 * dpr; const mk = 14 * dpr, ab = B * s + 3 * dpr;
    [[ox, oy, -1, -1], [ox + L.W * s, oy, 1, -1], [ox, oy + L.H * s, -1, 1], [ox + L.W * s, oy + L.H * s, 1, 1]].forEach(([px, py, sx, sy]) => {
      x.beginPath(); x.moveTo(px + sx * ab, py); x.lineTo(px + sx * (ab + mk), py); x.moveTo(px, py + sy * ab); x.lineTo(px, py + sy * (ab + mk)); x.stroke(); });
    // Maße
    const F = FORMATE[L.format]; x.fillStyle = '#3a3a44'; x.strokeStyle = '#3a3a44'; x.font = `600 ${12 * dpr}px ${FAM.t}`; x.textAlign = 'center'; x.textBaseline = 'middle';
    const yM = oy + (L.H + B) * s + 16 * dpr, pf = (x1, y1, x2, y2) => { x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke(); };
    pf(ox, yM, ox + L.W * s, yM); pf(ox, yM - 5 * dpr, ox, yM + 5 * dpr); pf(ox + L.W * s, yM - 5 * dpr, ox + L.W * s, yM + 5 * dpr);
    const tB = (L.W / 10) + ' cm', tw = x.measureText(tB).width + 14 * dpr; x.fillStyle = '#efe9dd'; x.fillRect(ox + L.W * s / 2 - tw / 2, yM - 9 * dpr, tw, 18 * dpr); x.fillStyle = '#3a3a44'; x.fillText(tB, ox + L.W * s / 2, yM);
    const xM = ox + (L.W + B) * s + 16 * dpr; pf(xM, oy, xM, oy + L.H * s); pf(xM - 5 * dpr, oy, xM + 5 * dpr, oy); pf(xM - 5 * dpr, oy + L.H * s, xM + 5 * dpr, oy + L.H * s);
    x.save(); x.translate(xM, oy + L.H * s / 2); x.rotate(-Math.PI / 2); const tH = (L.H / 10) + ' cm', th = x.measureText(tH).width + 12 * dpr; x.fillStyle = '#efe9dd'; x.fillRect(-th / 2, -9 * dpr, th, 18 * dpr); x.fillStyle = '#3a3a44'; x.fillText(tH, 0, 0); x.restore();
    x.textAlign = 'left'; x.textBaseline = 'alphabetic'; x.font = `600 ${11 * dpr}px ${FAM.t}`; x.fillStyle = '#5b5b66';
    const fz = [`Endformat ${F ? F.t : ''}`, 'Beschnitt 2 cm je Seite', o.raster ? 'gestrichelt: Sicherheitsabstand' : ''].filter(Boolean);
    while(fz.length > 1 && x.measureText(fz.join(' · ')).width > Wc - 24 * dpr) fz.pop();
    x.fillText(fz.join(' · '), 12 * dpr, Hc - 10 * dpr);
  }

  /* ---------- Platzszene: Bandenreihe am Spielfeldrand, Tageslicht ---------- */
  // o: { haupt:{L,res}, nachbarn:[{L,res}] (optional), unscharf:true }. Gibt die Kamera zurück (für Tests).
  // o.nachbarFest (0.99.24): die wirklichen Nachbarn je Platz neben der eigenen Bande, { '-1':{L,res}, '1':{frei:true,nr:7}, '2':false … }.
  //   {L,res} = Bande, {frei,nr} = freier Platz mit Nummer, null = neutrale Bande, false = hier endet die Reihe.
  function szene(cv, o){
    const dpr = Math.min(2, window.devicePixelRatio || 1), r = cv.getBoundingClientRect();
    const Wc = Math.max(10, Math.round(r.width * dpr)), Hc = Math.max(10, Math.round(r.height * dpr)); cv.width = Wc; cv.height = Hc;
    const x = cv.getContext('2d'), L = o.haupt.L, wB = L.W / 1000, hB = L.H / 1000, lift = L.H > 900 ? .25 : .07, luecke = .07;
    // Kamera: schräg vor der Bandenreihe, Augenhöhe, Blick auf die Mitte der Bande
    const yaw = .44, d = Math.max(3.4, wB * 1.08 + .9), P = [-Math.sin(yaw) * d, 1.25, -Math.cos(yaw) * d], T = [wB * .02, lift + hB * .5, 0];
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], norm = a => { const l = Math.hypot(...a); return a.map(v => v / l); };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const f = norm(sub(T, P)), ri = norm(cross([0, 1, 0], f)), up = cross(f, ri);
    const cam = Q => { const v = sub(Q, P); return [dot(v, ri), dot(v, up), dot(v, f)]; };
    const schmal = Wc / Hc < 1.25; let foc = 1; const cx = Wc * .5, cy = Hc * (schmal ? .53 : .57);
    { const a = cam([-wB / 2, lift, 0]), b = cam([wB / 2, lift, 0]); const span = Math.abs(b[0] / b[2] - a[0] / a[2]); foc = Wc * (schmal ? .9 : .64) / span; }
    const pr = Q => { const c = cam(Q); return [cx + foc * c[0] / c[2], cy - foc * c[1] / c[2], c[2]]; };
    const NAH = .25;
    // Polygon am Boden zeichnen, vorher an der Nahebene abschneiden
    const poly = (pts, fill) => { let C = pts.map(cam), out = [];
      for(let i = 0; i < C.length; i++){ const a = C[i], b = C[(i + 1) % C.length], ia = a[2] > NAH, ib = b[2] > NAH; if(ia) out.push(a);
        if(ia !== ib){ const t = (NAH - a[2]) / (b[2] - a[2]); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, NAH]); } }
      if(out.length < 3) return; x.beginPath(); out.forEach((c, i) => { const sx = cx + foc * c[0] / c[2], sy = cy - foc * c[1] / c[2]; i ? x.lineTo(sx, sy) : x.moveTo(sx, sy); }); x.closePath(); x.fillStyle = fill; x.fill(); };
    const horizont = cy - foc * dot(norm([f[0], 0, f[2]]), up) / dot(norm([f[0], 0, f[2]]), f);
    let seed = 7; const zuf = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    // Himmel
    let g = x.createLinearGradient(0, 0, 0, horizont); g.addColorStop(0, '#8fbfe2'); g.addColorStop(.7, '#cfe3f0'); g.addColorStop(1, '#eef3f3'); x.fillStyle = g; x.fillRect(0, 0, Wc, horizont + 2);
    x.save(); x.globalAlpha = .55; x.fillStyle = '#ffffff'; for(let i = 0; i < 6; i++){ const wx = zuf() * Wc, wy = horizont * (.12 + zuf() * .45), rw = Wc * (.08 + zuf() * .1);
      for(let k = 0; k < 5; k++){ x.beginPath(); x.ellipse(wx + (k - 2) * rw * .35, wy + Math.sin(k) * rw * .05, rw * (.32 + zuf() * .2), rw * (.12 + zuf() * .06), 0, 0, Math.PI * 2); x.fill(); } } x.restore();
    // Odenwald: zwei Hügelketten am Horizont
    [['#b4c7c0', .12, 0], ['#9bb3a6', .07, 1.3]].forEach(([farbe, hoch, ph]) => { x.fillStyle = farbe; x.beginPath(); x.moveTo(0, horizont + 2);
      for(let i = 0; i <= 80; i++){ const t = i / 80; x.lineTo(t * Wc, horizont - Hc * hoch * (.62 + .25 * Math.sin(t * 5.1 + ph) + .13 * Math.sin(t * 11.3 + ph * 2))); }
      x.lineTo(Wc, horizont + 2); x.closePath(); x.fill(); });
    // Gelände hinter den Banden und Baumreihe
    poly([[-80, 0, .2], [120, 0, .2], [120, 0, 60], [-80, 0, 60]], '#7a9a57');
    // Baumreihe weit hinter dem Platz: viele überlappende Kronen, kurze Stämme
    const baeume = []; for(let i = 0; i < 130; i++) baeume.push({ bx:-90 + i * 2.1 + zuf() * 1.6, bz:72 + zuf() * 18, bh:3.2 + zuf() * 2.4, br:2.2 + zuf() * 1.3, gr:['#7d9d70', '#728f66', '#86a479', '#6c8a60', '#8aa87e'][i % 5] });
    baeume.sort((a, b) => b.bz - a.bz).forEach(t => { const fu = pr([t.bx, 0, t.bz]), ko = pr([t.bx, t.bh, t.bz]), rr = foc * t.br / Math.max(.1, fu[2]); if(fu[2] < NAH || fu[0] < -rr * 2 || fu[0] > Wc + rr * 2) return;
      x.fillStyle = '#4e5a40'; x.fillRect(fu[0] - rr * .07, ko[1], rr * .14, fu[1] - ko[1]);
      x.fillStyle = t.gr; [[0, 0, 1, 1.15], [-.55, .35, .7, .75], [.6, .3, .7, .8]].forEach(([dx, dy, a, b]) => { x.beginPath(); x.ellipse(ko[0] + dx * rr, ko[1] + dy * rr, rr * a, rr * b, 0, 0, Math.PI * 2); x.fill(); });
      x.fillStyle = 'rgba(255,248,220,.08)'; x.beginPath(); x.ellipse(ko[0] - rr * .35, ko[1] - rr * .3, rr * .5, rr * .55, 0, 0, Math.PI * 2); x.fill(); });
    g = x.createLinearGradient(0, horizont - Hc * .2, 0, horizont + Hc * .03); g.addColorStop(0, 'rgba(232,240,242,0)'); g.addColorStop(1, 'rgba(232,240,242,.45)'); x.fillStyle = g; x.fillRect(0, horizont - Hc * .2, Wc, Hc * .23);   // Dunst
    // Weg hinter den Banden und eine Hecke, damit die Fläche nicht leer wirkt
    poly([[-80, 0, .9], [120, 0, .9], [120, 0, 2.6], [-80, 0, 2.6]], '#c9c0a8');
    poly([[-80, 0, 2.6], [120, 0, 2.6], [120, 0, 3.1], [-80, 0, 3.1]], 'rgba(90,110,60,.35)');
    { const hz = 15, hh = 1.1, A = pr([-12, 0, hz]), Bp = pr([90, 0, hz]), A2 = pr([-12, hh, hz]), B2 = pr([90, hh, hz]);
      if(A[2] > NAH && Bp[2] > NAH){ x.fillStyle = "#5a7d47"; x.beginPath(); x.moveTo(A[0], A[1]); x.lineTo(Bp[0], Bp[1]); x.lineTo(B2[0], B2[1]); x.lineTo(A2[0], A2[1]); x.closePath(); x.fill();
        x.fillStyle = "#66894f"; for(let i = 0; i < 120; i++){ const hx = -12 + i * .85, q = pr([hx, hh * (.85 + zuf() * .2), hz]); if(q[2] < NAH || q[0] < -40 || q[0] > Wc + 40) continue; const rr = foc * (.32 + zuf() * .18) / q[2]; x.beginPath(); x.ellipse(q[0], q[1], rr, rr * .8, 0, 0, Math.PI * 2); x.fill(); } } }
    // Spielfeld vor den Banden: Grundfarbe, Mähstreifen, Seitenlinie
    poly([[-80, 0, -60], [120, 0, -60], [120, 0, 0], [-80, 0, 0]], '#5c9443');
    for(let i = -16; i < 24; i += 2) poly([[i * 5, 0, -60], [i * 5 + 5, 0, -60], [i * 5 + 5, 0, 0], [i * 5, 0, 0]], 'rgba(255,255,255,.055)');
    poly([[-80, 0, -1.9], [120, 0, -1.9], [120, 0, -1.78], [-80, 0, -1.78]], 'rgba(250,250,245,.9)');
    poly([[-80, 0, -.02], [120, 0, -.02], [120, 0, .25], [-80, 0, .25]], '#6c8a4c');
    // Banden: Haupt in der Mitte, links eine, rechts mehrere Nachbarn (gleiches Format, Einheitslook)
    const nb = o.nachbarn || [], reihe = [];
    const nLinks = 2, nRechts = Math.max(4, Math.ceil(26 / (wB + luecke)));
    const fest = o.nachbarFest || null;
    for(let i = -nLinks; i <= nRechts; i++){ const x0 = -wB / 2 + i * (wB + luecke); if(fest && i !== 0 && fest[i] === false) continue;
      reihe.push({ i, x0, x1:x0 + wB, haupt:i === 0, q:i === 0 ? o.haupt : fest ? (fest[i] || null) : nb.length ? nb[(i + nLinks + nb.length * 4) % nb.length] : null }); }
    reihe.sort((a, b) => cam([b.x0 + wB / 2, 0, 0])[2] - cam([a.x0 + wB / 2, 0, 0])[2]);
    const tex = new Map(), texFuer = (q, ppm, unscharf) => { const k = q; if(tex.has(k)) return tex.get(k);
      let c; if(q){ c = bild(q.L, q.res, ppm, false); if(unscharf && 'filter' in x){ const u = document.createElement('canvas'); u.width = c.width; u.height = c.height; const ux = u.getContext('2d'); ux.filter = `blur(${Math.max(1, c.width / 520)}px)`; ux.drawImage(c, 0, 0); c = u; } }
      else c = platzhalter(L, ppm); tex.set(k, c); return c; };
    // freier Platz: leere Tafel mit Nummer, damit man sieht, was neben der eigenen Bande noch zu haben ist
    const texFrei = (q, ppm) => { const k = 'frei:' + q.nr + ':' + (q.frei ? 1 : 0); if(tex.has(k)) return tex.get(k); const c = freiTafel(L, ppm, q); tex.set(k, c); return c; };
    let hauptBox = null;
    reihe.forEach(b => {
      const a0 = cam([b.x0, 0, 0]), a1 = cam([b.x1, 0, 0]); if(a0[2] < NAH && a1[2] < NAH) return;
      // Kontaktschatten auf dem Rasen (Sonne von links hinten)
      poly([[b.x0 - .05, 0, -.02], [b.x1 + .05, 0, -.02], [b.x1 + .25, 0, -.42], [b.x0 + .1, 0, -.42]], 'rgba(28,46,20,.2)');
      poly([[b.x0, 0, -.01], [b.x1, 0, -.01], [b.x1, 0, -.12], [b.x0, 0, -.12]], 'rgba(20,32,14,.22)');
      // Pfosten unter der Platte
      [b.x0 + wB * .08, b.x1 - wB * .08].forEach(px => { const u = pr([px, 0, .02]), v = pr([px, lift + .02, .02]); x.strokeStyle = '#4b4f55'; x.lineWidth = Math.max(1, foc * .035 / u[2]); x.beginPath(); x.moveTo(u[0], u[1]); x.lineTo(v[0], v[1]); x.stroke(); });
      const breitPx = Math.abs(pr([b.x1, lift, 0])[0] - pr([b.x0, lift, 0])[0]);
      const ppm = b.haupt ? Math.min(1.2, Math.max(.25, breitPx * 1.4 / L.W)) : Math.min(.35, Math.max(.08, breitPx * 1.2 / L.W));
      const t = b.q && !b.q.L ? texFrei(b.q, ppm) : texFuer(b.q, ppm, !b.haupt && o.unscharf !== false);
      // Perspektivisch in senkrechten Streifen
      const n = Math.max(8, Math.ceil(breitPx / (2 * dpr)));
      for(let k = 0; k < n; k++){ const u0 = k / n, u1 = (k + 1) / n, X0 = b.x0 + u0 * wB, X1 = b.x0 + u1 * wB;
        const p0 = pr([X0, lift + hB, 0]), p1 = pr([X1, lift + hB, 0]), q0 = pr([X0, lift, 0]); if(p0[2] < NAH || p1[2] < NAH) continue;
        const sx = u0 * t.width, sw = Math.max(1, (u1 - u0) * t.width), dw = p1[0] - p0[0] + .6;
        x.drawImage(t, sx, 0, sw, t.height, p0[0], p0[1], dw, q0[1] - p0[1]); }
      const ol = pr([b.x0, lift + hB, 0]), or = pr([b.x1, lift + hB, 0]), ul = pr([b.x0, lift, 0]), ur = pr([b.x1, lift, 0]);
      // Licht: links etwas heller, Dunst nach hinten, feine Oberkante
      x.save(); x.beginPath(); x.moveTo(ol[0], ol[1]); x.lineTo(or[0], or[1]); x.lineTo(ur[0], ur[1]); x.lineTo(ul[0], ul[1]); x.closePath(); x.clip();
      g = x.createLinearGradient(ol[0], 0, or[0], 0); g.addColorStop(0, 'rgba(255,250,235,.06)'); g.addColorStop(1, 'rgba(30,40,60,.045)'); x.fillStyle = g; x.fillRect(Math.min(ol[0], ul[0]) - 2, Math.min(ol[1], or[1]) - 2, Math.abs(or[0] - ol[0]) + 4, Math.max(ul[1], ur[1]) - Math.min(ol[1], or[1]) + 4);
      const dist = cam([b.x0 + wB / 2, 0, 0])[2], dunst = Math.min(.32, Math.max(0, (dist - d) / 60));
      if(dunst > 0){ x.fillStyle = `rgba(226,236,240,${dunst})`; x.fillRect(Math.min(ol[0], ul[0]) - 2, Math.min(ol[1], or[1]) - 2, Math.abs(or[0] - ol[0]) + 4, Math.max(ul[1], ur[1]) - Math.min(ol[1], or[1]) + 4); }
      x.restore();
      x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = Math.max(1, dpr * .8); x.beginPath(); x.moveTo(ol[0], ol[1]); x.lineTo(or[0], or[1]); x.stroke();
      x.strokeStyle = 'rgba(0,0,0,.18)'; x.beginPath(); x.moveTo(ul[0], ul[1]); x.lineTo(ur[0], ur[1]); x.stroke();
      if(b.haupt) hauptBox = { x:Math.min(ol[0], ul[0]) / dpr, y:Math.min(ol[1], or[1]) / dpr, w:(Math.max(or[0], ur[0]) - Math.min(ol[0], ul[0])) / dpr, h:(Math.max(ul[1], ur[1]) - Math.min(ol[1], or[1])) / dpr };
    });
    // leichte Vignette, damit der Blick auf der Bande bleibt
    g = x.createRadialGradient(Wc * .5, Hc * .55, Math.min(Wc, Hc) * .35, Wc * .5, Hc * .55, Math.max(Wc, Hc) * .75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,20,30,.16)'); x.fillStyle = g; x.fillRect(0, 0, Wc, Hc);
    return { hauptBox, horizont:horizont / dpr };
  }
  // Freier oder namenloser Platz neben der eigenen Bande: helle Tafel mit der laufenden Nummer und „frei“
  function freiTafel(L, ppm, q){
    const c = document.createElement('canvas'); c.width = Math.max(4, Math.round(L.W * ppm)); c.height = Math.max(2, Math.round(L.H * ppm)); const x = c.getContext('2d'); x.scale(ppm, ppm);
    const H = L.H, W = L.W, m = H * .09; x.fillStyle = q.frei ? '#f6f3ec' : '#fff'; x.fillRect(0, 0, W, H);
    x.strokeStyle = 'rgba(29,39,96,.55)'; x.lineWidth = H * .022; x.setLineDash([H * .12, H * .08]); x.strokeRect(m, m, W - 2 * m, H - 2 * m); x.setLineDash([]);
    x.fillStyle = 'rgba(29,39,96,.8)'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `700 ${Math.round(H * .34)}px BandeT,Barlow,sans-serif`;
    x.fillText(q.frei ? `Bande ${q.nr} · frei` : `Bande ${q.nr}`, W / 2, H / 2, W - 4 * m);
    return c;
  }
  // Nachbarbande ohne Daten: Einheitslook mit ruhigen Formen statt fremder Namen
  function platzhalter(L, ppm){
    const c = document.createElement('canvas'); c.width = Math.max(4, Math.round(L.W * ppm)); c.height = Math.max(2, Math.round(L.H * ppm)); const x = c.getContext('2d'); x.scale(ppm, ppm);
    const H = L.H, W = L.W, band = H * .19, m = H * .075; x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.fillStyle = C.marine; x.fillRect(0, H - band, W, band);
    const aw = Math.min(720, Math.max(460, W * .2)); x.fillStyle = 'rgba(29,39,96,.85)'; x.fillRect(W - m - aw * .75, H * .2, aw * .5, H * .26); x.fillStyle = 'rgba(232,116,31,.8)'; x.fillRect(W - m - aw * .7, H * .62, aw * .4, H * .02);
    x.fillStyle = 'rgba(28,28,34,.72)'; x.beginPath(); x.ellipse(m + H * .28, H * .37, H * .22, H * .22, 0, 0, Math.PI * 2); x.fill();
    x.fillRect(m + H * .65, H * .24, (W - aw - m * 3 - H * .65) * .7, H * .15); x.fillStyle = 'rgba(28,28,34,.35)'; x.fillRect(m + H * .65, H * .47, (W - aw - m * 3 - H * .65) * .5, H * .07);
    x.fillStyle = 'rgba(255,255,255,.7)'; x.fillRect(m, H - band * .62, W * .3, band * .24);
    if('filter' in x){ const u = document.createElement('canvas'); u.width = c.width; u.height = c.height; const ux = u.getContext('2d'); ux.filter = `blur(${Math.max(1, c.width / 300)}px)`; ux.drawImage(c, 0, 0); return u; }
    return c;
  }

  /* ---------- Druckdaten ---------- */
  const dateiName = (L, spec, endung) => 'bande-' + (sauber(spec.firma || spec.name || 'partner').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'partner') + '-' + L.format + '.' + endung;
  // PDF in Originalgröße: Seite = Endformat + 2 × 2 cm Beschnitt + 2 × 1,2 cm für die Schnittmarken.
  // TrimBox = Endformat, BleedBox = mit Beschnitt. Über 5 m Seitenlänge mit UserUnit 2 (PDF erlaubt höchstens 5,08 m je Einheit).
  async function pdf(L, res, spec, o){
    o = o || {}; const J = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF; if(!J) throw new Error('Das PDF-Werkzeug fehlt.');
    const B = L.B, M = 12, pw = L.W + 2 * B + 2 * M, ph = L.H + 2 * B + 2 * M, uu = Math.max(pw, ph) / 25.4 * 72 > 14400 ? 2 : 1, dpi = o.dpi || 100, ppm = dpi / 25.4;
    const doc = new J({ orientation:pw >= ph ? 'l' : 'p', unit:'mm', format:[pw / uu, ph / uu], userUnit:uu, compress:true });
    doc.setProperties({ title:'Bande ' + sauber(spec.firma || spec.name) + ' ' + (FORMATE[L.format] || {}).t, subject:'Druckdaten Bande, SV/BSC Mörlenbach', creator:'Sportzentrale SV/BSC Mörlenbach' });
    const gw = Math.round((L.W + 2 * B) * ppm), gh = Math.round((L.H + 2 * B) * ppm), T = 2048;
    for(let k = 0; k * T < gw; k++){ const tw = Math.min(T, gw - k * T), c = document.createElement('canvas'); c.width = tw; c.height = gh;
      const x = c.getContext('2d'); x.setTransform(ppm, 0, 0, ppm, B * ppm - k * T, B * ppm); malen(x, L, res);
      doc.addImage(c.toDataURL('image/jpeg', .93), 'JPEG', (M + k * T / ppm) / uu, M / uu, (tw / ppm) / uu, (gh / ppm) / uu, 'k' + k, 'FAST');
      c.width = c.height = 1; if(o.fortschritt) o.fortschritt((k + 1) * T / gw); await new Promise(z => setTimeout(z, 0)); }
    // Schnittmarken (außerhalb des Beschnitts) und Angaben im Rand
    doc.setDrawColor(0, 0, 0); doc.setLineWidth(.25 / uu);
    const tx = [M + B, M + B + L.W], ty = [M + B, M + B + L.H];
    tx.forEach(xx => ty.forEach(yy => { const sx = xx < pw / 2 ? -1 : 1, sy = yy < ph / 2 ? -1 : 1;
      doc.line((xx + sx * (B + 1)) / uu, yy / uu, (xx + sx * (B + M - 1)) / uu, yy / uu); doc.line(xx / uu, (yy + sy * (B + 1)) / uu, xx / uu, (yy + sy * (B + M - 1)) / uu); }));
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9 / uu); doc.setTextColor(60, 60, 68);
    doc.text(`SV/BSC Mörlenbach · Bande ${sauber(spec.firma || spec.name)} · Endformat ${(FORMATE[L.format] || {}).t} · Beschnitt 2 cm je Seite · ${dpi} dpi bei 1:1 · RGB · Marine Pantone 2758 C, Orange Pantone 158 C`, (M + B) / uu, (M * .55) / uu);
    const k = 72 / 25.4 / uu, pc = doc.internal.getCurrentPageInfo().pageContext;
    pc.trimBox = { bottomLeftX:(M + B) * k, bottomLeftY:(M + B) * k, topRightX:(M + B + L.W) * k, topRightY:(M + B + L.H) * k };
    pc.bleedBox = { bottomLeftX:M * k, bottomLeftY:M * k, topRightX:(M + 2 * B + L.W) * k, topRightY:(M + 2 * B + L.H) * k };
    return { blob:doc.output('blob'), name:dateiName(L, spec, 'pdf'), seite:{ breite:pw, hoehe:ph, userUnit:uu } };
  }
  // PNG mit Beschnitt; die Auflösung bleibt unter 16 Mio. Pixeln (auch für iPhone), höchstens 100 dpi
  function png(L, res, spec){
    const B = L.B, ppm = Math.min(100 / 25.4, Math.sqrt(15.5e6 / ((L.W + 2 * B) * (L.H + 2 * B)))), c = bild(L, res, ppm, true);
    return new Promise(ok => c.toBlob(b => ok({ blob:b, name:dateiName(L, spec, 'png'), breite:c.width, hoehe:c.height, dpi:Math.round(ppm * 25.4) }), 'image/png'));
  }
  // SVG: Flächen und Schrift als Vektor, Schriften eingebettet, Logo und Doppel-Logo als Bild
  const fontCache = new Map();
  async function fontDaten(datei){ if(fontCache.has(datei)) return fontCache.get(datei);
    const p = fetch(basisJetzt + datei).then(r => { if(!r.ok) throw new Error(); return r.blob(); }).then(b => new Promise(ok => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(b); })).catch(() => null);
    fontCache.set(datei, p); return p; }
  const xe = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const r2 = v => Math.round(v * 100) / 100;
  // Farben im SVG nur als #rgb/#rrggbb oder rgb(a)-Zahlen, alles andere wird zu Schwarz
  const fa = c => /^#[0-9a-fA-F]{3,8}$|^rgba?\([\d.,\s%]+\)$|^none$/.test(String(c || '')) ? c : '#1c1c22';
  async function svg(L, res, spec){
    const B = L.B, fonts = await Promise.all(SCHRIFTEN.map(async ([fam, f, w]) => { const u = await fontDaten(f); return u ? `@font-face{font-family:'${fam}';font-weight:${w};src:url(${u.replace(/^data:[^;]*;/, 'data:font/woff2;')}) format('woff2');}` : ''; }));
    const bildUrl = im => { if(!im) return null; const c = document.createElement('canvas'); c.width = im.naturalWidth || im.width; c.height = im.naturalHeight || im.height; c.getContext('2d').drawImage(im, 0, 0); return c.toDataURL('image/png'); };
    const lu = bildUrl(res.logoBild), wu = bildUrl(res.wappenBild), famName = f => FAM[f.fam].replace(/"/g, "'");
    const teile = L.ops.map(o => {
      if(o.t === 'rect') return `<rect x="${r2(o.x)}" y="${r2(o.y)}" width="${r2(o.w)}" height="${r2(o.h)}" fill="${fa(o.fill)}"/>`;
      if(o.t === 'linie') return `<line x1="${r2(o.x1)}" y1="${r2(o.y1)}" x2="${r2(o.x2)}" y2="${r2(o.y2)}" stroke="${fa(o.stroke)}" stroke-width="${r2(+o.w || 0)}" stroke-linecap="round"/>`;
      if(o.t === 'strich'){ const [a, b, c] = o.pts; return `<path d="M${r2(a[0])} ${r2(a[1])}Q${r2(b[0])} ${r2(b[1])} ${r2(c[0])} ${r2(c[1])}" fill="none" stroke="${fa(o.stroke)}" stroke-width="${r2(o.w)}" stroke-linecap="round"/>`; }
      if(o.t === 'img'){ const u = o.key === 'logo' ? lu : wu; return u ? `<image x="${r2(o.x)}" y="${r2(o.y)}" width="${r2(o.w)}" height="${r2(o.h)}" preserveAspectRatio="none" href="${u}"/>` : ''; }
      if(o.t === 'text'){ const anchor = o.align === 'c' ? 'middle' : o.align === 'r' ? 'end' : 'start', rot = o.rot ? ` transform="rotate(${o.rot} ${r2(o.box.x + o.box.w / 2)} ${r2(o.box.y + o.box.h / 2)})"` : '';
        return `<text font-family="${famName(o.f)}" font-weight="${o.f.w}" font-size="${r2(o.fs)}" fill="${fa(o.fill)}" text-anchor="${anchor}"${o.f.ls ? ` letter-spacing="${r2(o.f.ls * o.fs)}"` : ''}${rot}>` +
          o.lines.map((z, i) => `<tspan x="${r2(o.x)}" y="${r2(o.y + o.a * o.fs + i * o.lh * o.fs)}">${xe(z)}</tspan>`).join('') + '</text>'; }
      return ''; }).join('\n');
    const s = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${L.W + 2 * B}mm" height="${L.H + 2 * B}mm" viewBox="${-B} ${-B} ${L.W + 2 * B} ${L.H + 2 * B}">\n` +
      `<title>${xe('Bande ' + sauber(spec.firma || spec.name) + ', ' + (FORMATE[L.format] || {}).t + ', mit 2 cm Beschnitt')}</title>\n<style>${fonts.join('')}</style>\n${teile}\n</svg>\n`;
    return { blob:new Blob([s], { type:'image/svg+xml' }), name:dateiName(L, spec, 'svg'), text:s };
  }

  return { C, FORMATE, LAYOUTS, BESCHNITT, schriften, vorbereiten, layout, malen, bild, flach, szene, pdf, png, svg, akzent, kontrast, lum, mess, einpassen, sauber, laden };
})();
