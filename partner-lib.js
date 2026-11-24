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
// Partner des Tages richtet sich nach dem Paket in der Auswahl (höchstes gilt): Club 20 €, Premium und 1896 Partner 40 € unter dem Grundpreis (189 / 169 / 149 €).
PLIB.sotdPreis=function(l,pos){ const k=(pos||[]).map(e=>e&&e.key), pk=['p1896','premium','club','supporter'].find(x=>k.includes(x)), b=+l.preis;
  return pk==='club'?Math.max(0,b-20):pk==='premium'||pk==='p1896'?Math.max(0,b-40):b; };
PLIB.TRIKOT_KEYS=['aermel_erste','aermel_zweite','aermel_jugend','trikot_jugend','aermel_anzug_l','aermel_anzug_r'];
PLIB.rechnen=function(pos,leistungen,saisons,opt){
  const s=Math.max(1,Math.min(5,+saisons||1)), rab=s>=3?.10:s===2?.05:0, fassung=+(opt&&opt.abrechnung_fassung)===1?1:0;
  let jahr=0,einmal=0,spende=0,trikot=0,saisonPos=0,mitRab=false; const aus=[];
  (pos||[]).forEach(e=>{ const l=leistungen.find(x=>x.key===e.key); if(!l)return; const menge=Math.max(1,Math.min(99,+e.menge||1));
    const einzel=(l.art==='spende'||l.art==='sonstiges'||l.preis==null||e.preis!=null&&e.preis!=='')?(+e.preis||0):(l.key==='sotd'?PLIB.sotdPreis(l,pos):+l.preis);
    let summe; const saison=l.einheit==='saison'&&['paket','flaeche','patenschaft'].includes(l.art), rp=saison&&!e.fest?rab:0;
    if(saison){ summe=Math.round(einzel*menge*(1-rp)*100)/100; jahr+=summe; saisonPos++; if(rp>0)mitRab=true; }
    else if(l.art==='spende'){ summe=einzel*menge; spende+=summe; }
    else { summe=einzel*menge; einmal+=summe; if(fassung&&PLIB.TRIKOT_KEYS.includes(l.key))trikot+=summe; }
    aus.push(Object.assign({},e,{titel:l.art==='sonstiges'&&e.text?e.text:l.titel,einzel,menge,summe,einheit:l.einheit,rabatt:rp})); });
  return {positionen:aus,saisons:s,rabatt:saisonPos&&!mitRab?0:rab,hat_saison:saisonPos>0,abrechnung_fassung:fassung,
    netto_jahr:Math.round(jahr*100)/100,einmalig:Math.round(einmal*100)/100,spende:Math.round(spende*100)/100,
    trikot_netto:Math.round(trikot*100)/100,standard_einmalig:Math.round((einmal-trikot)*100)/100,
    netto_gesamt:Math.round((jahr*s+einmal)*100)/100,erste_rechnung:Math.round((jahr+einmal-trikot)*100)/100};
};

// ---------- Rechnungsmonat (seit 0.99.81) ----------
// Im Vertrag steht, in welchem Monat der Verein die Rechnung je Saison stellt (Vorgabe August, kurz nach dem Saisonstart am 1. Juli).
// Rechnungstag der Saison: der Erste des Monats innerhalb der Saison. Gleich gerechnet wie private.partner_rechnung_tag und
// private.partner_rechnung_satz (197_rechnung_monat.sql): Der Server schreibt den Satz beim Anlegen des Vertrags noch einmal selbst.
PLIB.MONATE=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
PLIB.RECHNUNG_MONAT=8;
PLIB.rechnungTag=function(monat,beginn){ const b=String(beginn||'').slice(0,10), j=+b.slice(0,4), m=+b.slice(5,7), sj=m>=7?j:j-1, ab=((+monat||PLIB.RECHNUNG_MONAT)+5)%12, mi=6+ab;
  return (sj+Math.floor(mi/12))+'-'+String(mi%12+1).padStart(2,'0')+'-01'; };
PLIB.rechnungSatz=function(monat,beginn,heute){ const n=PLIB.MONATE[(+monat||PLIB.RECHNUNG_MONAT)-1], t=PLIB.rechnungTag(monat,beginn);
  return 'Der Verein stellt die Rechnung für jede Saison jeweils im '+n+'. '+(t>String(heute||'').slice(0,10)?'Die erste Rechnung kommt im '+n+' '+t.slice(0,4)+', frühestens aber, sobald der Vertrag geschlossen ist.':'Die erste Rechnung stellt er, sobald der Vertrag geschlossen ist, weil die Saison schon läuft.'); };

// ---------- Vertragsbausteine ----------
// [Schlüssel, Überschrift, Text]. {…} wird beim Anzeigen ersetzt.
PLIB.KLAUSELN={
  gegenstand:['Vertragsgegenstand','Der Partner unterstützt die Fußballabteilung des Vereins. Der Verein erbringt dafür die Leistungen, die in der Leistungsübersicht stehen. Art, Umfang und Platzierung der Werbung stimmen die Parteien vor der Umsetzung ab. Mit seiner Unterschrift bietet der Partner dem Verein den Abschluss dieses Vertrags verbindlich an. An dieses Angebot ist er vier Wochen ab seiner Unterschrift gebunden, weil der Vorstand des Vereins ehrenamtlich arbeitet und nicht jeden Tag zusammenkommt. Der Vertrag kommt zustande, wenn eine vertretungsberechtigte Person des Vereins innerhalb dieser Frist gegenzeichnet. Eine besondere Erklärung der Annahme gegenüber dem Partner ist dafür nicht nötig (§ 151 BGB). Der Verein schickt dem Partner den Vertrag dann mit beiden Unterschriften. Zeichnet der Verein nicht innerhalb der Frist gegen, ist der Partner nicht mehr gebunden. Der Partner schließt den Vertrag als Unternehmer (§ 14 BGB) für sein Unternehmen ab.'],
  laufzeit_fest:['Laufzeit','Der Vertrag beginnt am {beginn} und endet am {ende} von selbst. Eine Kündigung ist nicht nötig. Über eine Verlängerung sprechen die Parteien rechtzeitig vorher.'],
  laufzeit_auto:['Laufzeit und Verlängerung','Der Vertrag beginnt am {beginn} und läuft bis {ende}. Er verlängert sich um jeweils eine Saison, wenn keine Partei bis zum {frist_datum} in Textform kündigt, zum Beispiel per Mail an {mail}. In den Jahren danach ist jeweils der 31. März der letzte Tag für die Kündigung. Die Verlängerung gilt nur für Leistungen, die je Saison berechnet werden. Einmalige Leistungen werden nicht erneut berechnet. Für die Verlängerung gelten die Preise der letzten Saison ohne Laufzeitvorteil. Möchte der Verein die Preise ändern, sagt er das dem Partner spätestens vier Wochen vor dem letzten Kündigungstag in Textform. Der Partner kann dann bis zu diesem Tag kündigen.'],
  laufzeit_einmal:['Laufzeit','Der Vertrag gilt für die einmaligen Leistungen aus der Leistungsübersicht. Er endet, wenn sie erbracht sind. Eine Kündigung ist nicht nötig.'],
  verguetung_einmal:['Vergütung und Zahlung','Der Partner zahlt die Vergütung aus der Leistungsübersicht. Alle Beträge sind Nettobeträge, dazu kommt die gesetzliche Umsatzsteuer. Die Rechnung stellt der Verein, sobald der Vertrag geschlossen ist. Sie ist innerhalb von 14 Tagen ohne Abzug zahlbar. Der Partner ist einverstanden, dass er Rechnungen als PDF per Mail bekommt. Sobald das Gesetz es verlangt, schickt der Verein sie als E-Rechnung.'],
  verguetung:['Vergütung und Zahlung','Der Partner zahlt die Vergütung aus der Leistungsübersicht. Alle Beträge sind Nettobeträge, dazu kommt die gesetzliche Umsatzsteuer. {rechnung} Beginnt der Vertrag während einer laufenden Saison, wird der Saisonpreis voll berechnet. Einmalige Leistungen stehen in der ersten Rechnung. Rechnungen sind innerhalb von 14 Tagen ohne Abzug zahlbar. Der Partner ist einverstanden, dass er Rechnungen als PDF per Mail bekommt. Sobald das Gesetz es verlangt, schickt der Verein sie als E-Rechnung.'],
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
PLIB.KLAUSELN.trikot_abrechnung=['Getrennte Trikotrechnung','Trikots und Ärmel rechnen wir getrennt ab, sobald die Stückzahlen feststehen und der Verein sie bestätigt hat. Die Beträge in der Leistungsübersicht sind Richtwerte. Ohne eine eigene Vereinbarung bleiben diese Beträge maßgeblich. Einen abweichenden Endbetrag vereinbaren Verein und Partner anhand der Stückzahlen in Textform. Die Stückzahl allein ändert den Preis nicht.'];
PLIB.KOSTENFREI_TEXT='Die Leistungen aus der Leistungsübersicht sind für die vereinbarte Laufzeit kostenfrei. Es fällt kein Zahlbetrag an. Der Verein stellt dafür keine Rechnung. Eine spätere Vergütung braucht eine eigene Vereinbarung zwischen Verein und Partner in Textform.';
PLIB.preisHinweis=function(p){ return [p&&+p.nachlass>0?(+p.nachlass).toLocaleString('de-DE',{maximumFractionDigits:2})+' % Nachlass':'',p&&+p.rabatt>0&&+p.einzel>0?Math.round(+p.rabatt*100)+' % Laufzeitvorteil':''].filter(Boolean).join(', '); };
PLIB.klauselnFuer=function(pos,leistungen,opt){
  opt=opt||{}; const keys=(pos||[]).map(p=>p.key), L=k=>leistungen.find(x=>x.key===k)||{}, bereiche=new Set(keys.map(k=>L(k).bereich));
  const nurSpende=keys.length&&keys.every(k=>k==='spende');
  if(nurSpende)return ['spende','datenschutz','schluss'];
  const saisonal=keys.some(x=>{ const l=L(x); return l.einheit==='saison'&&['paket','flaeche','patenschaft'].includes(l.art); });
  const k=['gegenstand',saisonal?(opt.auto?'laufzeit_auto':'laufzeit_fest'):'laufzeit_einmal',saisonal?'verguetung':'verguetung_einmal','werbemittel'];
  if(keys.some(x=>/^(club|premium|p1896|bande_)/.test(x)))k.push('bande');
  if(keys.some(x=>/^(brust_|aermel_|trikot_|aufwaerm_)/.test(x)))k.push('trikot');
  if(+opt.abrechnung_fassung===1&&keys.some(x=>PLIB.TRIKOT_KEYS.includes(x)))k.push('trikot_abrechnung');
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
  let t=K[1]; if(w.kostenfrei===true&&['verguetung','verguetung_einmal'].includes(key))return [K[0],PLIB.KOSTENFREI_TEXT];
  if(w.nur_einmalig===true&&key==='verguetung')t=PLIB.KLAUSELN.verguetung_einmal[1];
  if(key==='exklusiv'&&!w.branche)t='Der Verein nimmt in der Laufzeit keinen weiteren Partner aus derselben Branche wie der Partner in dieselbe Partnerstufe auf.';
  if(w.trikot_abrechnung){
    if(key==='verguetung')t=t.replace('Einmalige Leistungen stehen in der ersten Rechnung.','Andere einmalige Leistungen stehen in der ersten Rechnung.');
    if(key==='verguetung_einmal'||w.nur_einmalig===true&&key==='verguetung')t=t.replace('Die Rechnung stellt der Verein, sobald der Vertrag geschlossen ist.','Für andere einmalige Leistungen stellt der Verein die Rechnung, sobald der Vertrag geschlossen ist. Trikots und Ärmel werden nach bestätigter Stückzahl getrennt abgerechnet.');
  }
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
  const t=(s,x,y,o)=>doc.text(Array.isArray(s)?s.map(pz):pz(s),x,y,o||{});
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
  const fortsetzen=()=>{doc.addPage();doc.setFillColor(...navy);doc.rect(0,0,W,8,'F');doc.setFillColor(...or);doc.rect(0,8,W,3,'F');doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(...grau);t((vd.name||'SV/BSC Mörlenbach').toUpperCase(),L,44);doc.setFont('helvetica','normal');t('Nr. '+R.nr+' · Fortsetzung',L,60);y=98;doc.setFontSize(10);doc.setTextColor(...tinte);};
  y=262; doc.setDrawColor(220,214,204); doc.line(L,y-14,W-L,y-14);
  doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(...grau); t('LEISTUNG',L,y); t('BETRAG',W-L,y,{align:'right'}); y+=18;
  doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(...tinte);
  (R.positionen||[]).forEach(p=>{ const z=doc.splitTextToSize(pz(p.titel+(p.mannschaft?', '+p.mannschaft:'')+(p.menge>1?', '+p.menge+' ×':'')+(PLIB.preisHinweis(p)?', '+PLIB.preisHinweis(p):'')+(p.stueckzahl?', bestätigte Stückzahl '+p.stueckzahl:'')+(p.endbetrag_vereinbart?', Endbetrag vereinbart am '+datum(p.vereinbarung_am)+', ursprünglicher Richtwert '+PLIB.eur(p.ursprung_summe,true):'')+(p.key==='spende'||p.einheit==='frei'?'':p.einheit==='saison'?', Leistungszeitraum '+datum(von)+' bis '+datum(bis):', Leistung ab '+datum(von))),W-2*L-110);
    if(y+14*z.length+6>H-74)fortsetzen();
    t(z,L,y); t(PLIB.eur(p.summe,true),W-L,y,{align:'right'}); y+=14*z.length+6; });
  if(y+270>H-74)fortsetzen();
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
  for(let seite=1;seite<=doc.internal.getNumberOfPages();seite++){doc.setPage(seite);
  doc.setFontSize(7); doc.setTextColor(...grau);
  t([vd.name,vd.register,vd.steuernr?'St.-Nr. '+vd.steuernr:'',vd.ustid?'USt-IdNr. '+vd.ustid:'',vd.finanzamt?'Finanzamt '+vd.finanzamt:''].filter(Boolean).join(' · '),L,H-36);
  t([vd.email,vd.web].filter(Boolean).join(' · '),L,H-24);}
  return doc;
};

// Bandenlogo aus der Firmenvorbereitung auch im freigegebenen Angebot gleich setzen.
(function(root){
  'use strict';
  // Nur klar getrennte Blöcke anbieten. Das obere Zeichen muss kompakt sein
  // und von einem breiteren Schriftblock durch transparente Zeilen getrennt sein.
  function markenteile({data,width,height}){
    if(width<32||height<32||width>3*height)return null;
    const streifen=[];let block=null;
    for(let y=0;y<height;y++){
      let links=width,rechts=-1;
      for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>0){
        if(links===width)links=x;rechts=x;
      }
      if(rechts<0){block=null;continue;}
      if(!block){block={links,rechts,oben:y,unten:y};streifen.push(block);}
      block.links=Math.min(links,block.links);block.rechts=Math.max(rechts,block.rechts);block.unten=y;
    }
    if(streifen.length<2)return null;
    const oben=streifen[0],unten=streifen.slice(1),luecke=unten[0].oben-oben.unten-1;
    if(luecke<Math.max(3,.055*height)||unten.some((s,i)=>i&&s.oben-unten[i-1].unten-1>=.85*luecke))return null;
    const box=s=>{
      const x=Math.min(...s.map(b=>b.links)),y=s[0].oben;
      return {x,y,w:Math.max(...s.map(b=>b.rechts))-x+1,h:s[s.length-1].unten-y+1};
    };
    const zeichen=box([oben]),schrift=box(unten);
    if(zeichen.w/zeichen.h>2.25||zeichen.h<height*.24||schrift.w<width*.5||schrift.w/schrift.h<2)return null;
    return {zeichen,schrift};
  }

  function querfassung(quelle,{zeichen,schrift}){
    const h=Math.min(schrift.h,Math.floor(zeichen.h/.84)),symbolH=h*.84;
    const symbolW=zeichen.w*symbolH/zeichen.h,textW=schrift.w*h/schrift.h,xText=symbolW+h*.30;
    const c=root.BD_RENDER.canvas(Math.ceil(xText+textW),h),x=c.getContext('2d');
    x.imageSmoothingQuality='high';
    x.drawImage(quelle,zeichen.x,zeichen.y,zeichen.w,zeichen.h,0,(h-symbolH)/2,symbolW,symbolH);
    x.drawImage(quelle,schrift.x,schrift.y,schrift.w,schrift.h,xText,0,textW,h);
    return c;
  }

  async function aufbereiten(src){
    const R=root.BD_RENDER,C=root.BD_CORE;
    if(!C.isRaster(src))return null;
    const im=await R.image(src),mass=Math.min(1,1600/Math.max(im.naturalWidth,im.naturalHeight));
    const cv=R.canvas(Math.max(1,Math.round(im.naturalWidth*mass)),Math.max(1,Math.round(im.naturalHeight*mass)));
    const ctx=cv.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingQuality='high';
    ctx.drawImage(im,0,0,cv.width,cv.height);
    let r;
    try{r=C.cutout(ctx.getImageData(0,0,cv.width,cv.height).data,cv.width,cv.height);}
    catch(_){return {original:cv,quer:null};}
    cv.width=r.width;cv.height=r.height;ctx.putImageData(new ImageData(r.data,r.width,r.height),0,0);
    const teile=r.confidence==='prüfen'?null:markenteile(r);
    return {original:cv,quer:teile?querfassung(cv,teile):null};
  }

  async function grundentwurf(cv,firma,breite,hoehe){
    const C=root.BD_CORE,R=root.BD_RENDER,doc=C.create(firma);
    doc.width=breite;doc.height=hoehe;
    const asset={name:firma,kind:'raster',src:cv.toDataURL('image/png'),width:cv.width,height:cv.height};
    doc.assets.marke=await R.analyseAsset(asset);
    return C.template(doc,'kante',{asset:'marke',nameAn:false});
  }

  async function layout(d,logo){
    const bilder=d?.elements.filter(e=>e.type==='image')||[];
    const einzeln=bilder.length===1?d.assets[bilder[0].asset]:null;
    const src=d?(einzeln&&!einzeln.vector?einzeln.src:null):logo;
    let quelle=null;
    if(src)try{quelle=await aufbereiten(src);}catch(err){if(!d)throw err;}
    return quelle;
  }
  root.PARTNER_MOTIVLAYOUT={layout,grundentwurf};
})(window);

// Kompakte, rein lesende Ansicht des persönlichen Angebots.
(function(root){
  'use strict';
  const pakete = ['supporter','club','premium','p1896'];
  const namen = {heim:'Heimtrikot',auswaerts:'Auswärtstrikot',anzug:'Trainingsanzug'};
  function quelle(d, heute){
    if(!d?.deck || d.deck.passung?.demo) return null;
    const vertragsdatum = d.abschluss?.art === 'vertrag' ? d.abschluss.am : null;
    const dokumente = [['angebot',d.angebot,'bis'],['konditionen',d.konditionen,'gueltig_bis']];
    for(const [art,wert,frist] of dokumente){
      if(!wert?.positionen?.length || (wert[frist] && String(wert[frist]).slice(0,10)<heute)) continue;
      if(vertragsdatum && !(wert.erstellt_am && Date.parse(wert.erstellt_am)>Date.parse(vertragsdatum))) continue;
      return {art,wert};
    }
    const entwurf=d.deck.passung?.angebotsentwurf;
    return (!vertragsdatum || Date.parse(entwurf?.erstellt_am)>Date.parse(vertragsdatum)) && entwurf && (pakete.includes(entwurf.paket)||entwurf.paket==='nur_aermel'&&entwurf.kleidung?.length>0) ? {art:'entwurf',wert:entwurf} : null;
  }
  function element(tag,klasse,text){
    const e=document.createElement(tag);
    if(klasse)e.className=klasse;
    if(text!=null)e.textContent=text;
    return e;
  }
  function knopf(text,klasse,aktion){
    const b=element('button',klasse,text);b.type='button';b.onclick=aktion;return b;
  }
  function oeffnen(o){
    if(document.getElementById('pdDirektangebot'))return;
    const fokus=document.activeElement, dialog=element('dialog','da-dialog');
    dialog.id='pdDirektangebot';dialog.setAttribute('aria-labelledby','daFirma');
    dialog.addEventListener('close',()=>{dialog.remove();if(fokus?.isConnected)fokus.focus();},{once:true});
    const kopf=element('header','da-kopf');
    const wappen=element('img');wappen.src='partner/wappen.png';wappen.alt='SV/BSC Mörlenbach';
    kopf.append(wappen,element('span','da-rubrik',o.entwurf?'Gesprächsentwurf':'Euer Angebot'),knopf('Schließen','da-close',()=>dialog.close()));
    const titel=element('h1','',o.firma);titel.id='daFirma';
    const body=element('div','da-inhalt');
    body.append(titel);
    if(o.metadaten)body.append(element('p','da-meta',o.metadaten));
    const leistungen=element('section','da-leistungen');leistungen.setAttribute('aria-label','Angebotene Leistungen');
    for(const pos of o.positionen){
      const detail=element('details','da-leistung'),sum=element('summary');
      const bez=element('span','da-leistungstitel',pos.titel);
      if(pos.menge>1)bez.append(element('small','',pos.menge+' Stück'));
      sum.append(bez);
      if(pos.preis)sum.append(element('span','da-preis',pos.preis));
      const info=element('span','da-info','i');info.setAttribute('aria-hidden','true');sum.append(info);
      const inhalt=element('div','da-details');
      const zeilen = String(pos.beschreibung || '').split(/(?:\n+|(?<=[.!?])\s+(?=[A-ZÄÖÜ]))/u).map(x=>x.trim()).filter(Boolean);
      if(zeilen.length>1){
        const ul=element('ul');zeilen.forEach(x=>ul.append(element('li','',x)));inhalt.append(ul);
      }else inhalt.append(element('p','',zeilen[0]||'Weitere Einzelheiten besprechen wir mit euch.'));
      detail.append(sum,inhalt);leistungen.append(detail);
    }
    body.append(leistungen);
    if(o.summe)body.append(element('p','da-summe',o.summe));
    if(o.hinweis)body.append(element('p','da-hinweis',o.hinweis));
    // Jede Ansicht lädt unabhängig. Ein abgelöster oder geschlossener Entwurf erhält keine fremden Bilder.
    function foto(el,malen,alt){
      const melding=element('span','da-laden','Vorschau wird geladen …');el.append(melding);
      const laden=async()=>{
        try{
          const cv=await malen();
          if(!el.isConnected)return;
          cv.setAttribute('role','img');cv.setAttribute('aria-label',alt);el.replaceChildren(cv);
        }catch(_){
          if(!el.isConnected)return;
          el.replaceChildren(knopf('Vorschau erneut laden','da-link',laden));
        }
      };
      laden();
    }
    const medien=element('section','da-medien');medien.setAttribute('aria-label','Euer Auftritt');
    body.append(medien);
    function bild(container,title,sub,malen){
      const fig=element('figure','da-motiv'),fläche=element('div','da-foto'),cap=element('figcaption');
      cap.append(element('strong','',title),element('span','',sub));fig.append(fläche,cap);container.append(fig);
      foto(fläche,malen,title+', '+sub);
    }
    const fuss=element('footer','da-fuss');
    if(o.weiter)fuss.append(knopf('Angebotsdetails öffnen','da-haupt',()=>{dialog.close();o.weiter();}));
    if(o.teilen)fuss.append(knopf('Angebot teilen','da-link',o.teilen));
    dialog.append(kopf,body,fuss);document.body.append(dialog);dialog.showModal();
    if(o.bande){
      bild(medien,'Eure Bande','Entwurf am Spielfeldrand',o.bande);
      if(o.stadion)medien.append(knopf('Im 3D-Stadion ansehen','da-link',o.stadion));
    }
    if(o.aermel){
      const block=element('div','da-aermel');medien.append(block);
      const laden=async()=>{
        block.replaceChildren(element('p','da-meta','Ärmelplätze werden geprüft …'));
        try{
          const plaetze=await o.aermel.plaetze();
          if(!block.isConnected)return;
          block.replaceChildren();
          if(!plaetze.length){block.append(element('p','da-hinweis','Aktuell ist für diese Auswahl kein Ärmel frei.'));return;}
          for(const p of plaetze){
            const seite=p.seite==='aermel_l'?'Linker Ärmel':'Rechter Ärmel';
            bild(block,namen[p.art],p.name+' · '+seite,()=>o.aermel.bild(p));
          }
        }catch(_){if(block.isConnected)block.replaceChildren(knopf('Ärmelplätze erneut prüfen','da-link',laden));}
      };
      laden();
      if(o.aermel.waehlen)medien.append(knopf('Freie Ärmel ansehen','da-link',o.aermel.waehlen));
    }
  }
  root.PARTNER_ANGEBOT={quelle,oeffnen,namen,pakete};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.PARTNER_ANGEBOT;
})(typeof window==='undefined'?globalThis:window);

// Vereinstermin: ein Deck bekommt einen besprechbaren Vorschlag, ohne etwas zu reservieren.
(function(root){
  'use strict';
  root.PARTNER_ENTWURF={oeffnen(o){
    if(document.querySelector('#pdEntwurfEditor'))return;
    const dialog=document.createElement('dialog'),fokus=document.activeElement;
    dialog.id='pdEntwurfEditor';dialog.className='da-dialog';dialog.setAttribute('aria-labelledby','daEditorTitel');
    dialog.innerHTML='<div class="da-inhalt"><h2 id="daEditorTitel">Angebot vorbereiten</h2><form class="da-form"><label>Partnerstufe<select name="paket" required></select></label><label><input type="checkbox" name="aermel"> Ärmel zeigen</label><div data-wahl></div><fieldset hidden><legend>Kleidungsstücke an diesem Ärmel</legend></fieldset><p data-stand role="status"></p><div class="da-fuss"><button class="da-haupt" type="submit">Entwurf speichern</button><button class="da-link" type="button" data-zu>Schließen</button></div></form></div>';
    const form=dialog.querySelector('form'),felder=form.elements,wahl=form.querySelector('[data-wahl]'),satz=form.querySelector('fieldset'),status=form.querySelector('[data-stand]'),send=form.querySelector('[type=submit]');
    const alt=o.alt||{},kleidung=Array.isArray(alt.kleidung)?alt.kleidung:[];
    let frei=[],platz=null,laden=false,schreibt=false,erster=true;
    for(const p of o.pakete)felder.paket.add(new Option(p.titel,p.key));
    felder.paket.value=o.pakete.some(p=>p.key===alt.paket)?alt.paket:o.pakete[0]?.key||'';
    felder.aermel.checked=kleidung.length>0||felder.paket.value==='nur_aermel';
    felder.aermel.disabled=felder.paket.value==='nur_aermel';
    const pruefen=()=>{send.disabled=schreibt||!felder.paket.value||(felder.aermel.checked&&(laden||!platz||!satz.querySelector('input:checked')));};
    function auswahl(p){
      const gleicherPlatz=platz&&p&&platz.team===p.team&&platz.seite===p.seite;
      const vorher=Array.from(satz.querySelectorAll('input:checked'),i=>i.value);
      const fruehereAuswahl=erster&&kleidung.length?((p?.team===alt.team&&p?.seite===alt.seite)?kleidung:[]):gleicherPlatz?vorher:null;
      const wahl=root.PARTNER_AERMEL.kleidungswahl(frei,p,fruehereAuswahl);
      platz=p;satz.replaceChildren();satz.hidden=!p;
      if(erster&&kleidung.length&&(!p||alt.team!==p.team||alt.seite!==p.seite||kleidung.some(a=>!frei.some(x=>x.team===alt.team&&x.seite===alt.seite&&x.art===a))))
        status.textContent='Die frühere Auswahl ist teilweise vergeben. Bitte die freien Kleidungsstücke vor dem Speichern prüfen.';
      if(p){
        const legend=document.createElement('legend');legend.textContent='Kleidungsstücke an diesem Ärmel';satz.append(legend);
        for(const a of wahl.arten){
          const l=document.createElement('label'),i=document.createElement('input');i.type='checkbox';i.value=a;
          i.checked=wahl.gewaehlt.includes(a);
          l.append(i,document.createTextNode(' '+root.PARTNER_ANGEBOT.namen[a]));satz.append(l);
        }
      }
      erster=false;pruefen();
    }
    function zeigen(){
      wahl.hidden=!felder.aermel.checked;satz.hidden=true;
      if(felder.aermel.checked&&!laden)root.PARTNER_AERMEL.wahl(wahl,frei,platz||{team:alt.team,seite:alt.seite,art:kleidung[0]},auswahl);
      pruefen();
    }
    form.onchange=pruefen;felder.aermel.onchange=zeigen;
    felder.paket.onchange=()=>{
      felder.aermel.disabled=felder.paket.value==='nur_aermel';
      if(felder.aermel.disabled&&!felder.aermel.checked){felder.aermel.checked=true;zeigen();}
      else pruefen();
    };
    form.querySelector('[data-zu]').onclick=()=>dialog.close();
    form.onsubmit=async e=>{
      e.preventDefault();if(send.disabled)return;
      schreibt=true;pruefen();status.textContent='Wird gespeichert …';
      try{
        const entwurf={paket:felder.paket.value};
        if(felder.aermel.checked)Object.assign(entwurf,{team:platz.team,seite:platz.seite,kleidung:Array.from(satz.querySelectorAll('input:checked'),i=>i.value)});
        await o.speichern(entwurf);dialog.close();
      }catch(err){status.textContent=err.message||'Speichern fehlgeschlagen.';}
      finally{schreibt=false;pruefen();}
    };
    dialog.addEventListener('close',()=>{dialog.remove();if(fokus?.isConnected)fokus.focus();},{once:true});
    document.body.append(dialog);dialog.showModal();laden=true;zeigen();
    o.plaetze().then(rows=>{frei=rows;}).catch(()=>{status.textContent='Die Ärmelplätze sind gerade nicht erreichbar. Zum erneuten Laden die Vorbereitung wieder öffnen.';})
      .finally(()=>{laden=false;if(dialog.isConnected)zeigen();});
  }};
})(window);

// Ein konkreter Ärmel ist immer Mannschaft, Satz und Seite aus Trägersicht.
(function(root){
  'use strict';
  const SEITEN={aermel_l:'Linker Ärmel',aermel_r:'Rechter Ärmel'};
  const ARTEN={heim:'Heimtrikot',auswaerts:'Auswärtstrikot',anzug:'Trainingsanzug'};

  function freie(daten,{leistungen,anzug,ohneJugend=false,naechste=true}={}){
    if(!Array.isArray(daten?.saetze)||!Array.isArray(daten?.plaetze)||!Array.isArray(daten?.mannschaften)||!Array.isArray(leistungen))
      throw Error('Der Stand der Ärmelplätze fehlt.');
    const teams=new Map(daten.mannschaften.map(m=>[m.id,m]));
    const satzPlaetze=new Map();
    for(const p of daten.plaetze){
      if(!Object.hasOwn(SEITEN,p.platz))continue;
      if(!satzPlaetze.has(p.satz))satzPlaetze.set(p.satz,[]);
      satzPlaetze.get(p.satz).push(p);
    }
    const kapazitaet=new Map(leistungen.map(l=>[l.key,l]));
    const anzugTeams=new Set((anzug?.plaetze||[]).filter(p=>p.angeboten!==false).map(p=>p.team+':'+p.seite));
    const frei=[];
    for(const s of daten.saetze){
      const m=teams.get(s.mannschaft);
      if(!m||m.id==='mini'||m.id==='muster'||s.muster||!Object.hasOwn(ARTEN,s.art))continue;
      const jugend=m.art==='jugend';
      if(jugend?ohneJugend:!['h1','h2'].includes(m.id))continue;
      for(const p of satzPlaetze.get(s.id)||[]){
        if(p.status!=='frei')continue;
        if(jugend){
          const anzugKey=p.platz==='aermel_l'?'aermel_anzug_l':'aermel_anzug_r';
          const l=kapazitaet.get(s.art==='anzug'?anzugKey:'aermel_jugend');
          const anzahl=(naechste?l?.frei_je_naechste:l?.frei_je)?.[m.id];
          if(!(anzahl>0)||s.art==='anzug'&&!anzugTeams.has(m.id+':'+p.platz))continue;
        }else if(s.art!=='anzug'){
          // Alte Erwachsenenpositionen können nur die ganze Mannschaft sperren.
          // Bei der Zweiten gibt es Decks ohne diesen alten pauschalen Katalogeintrag.
          const l=kapazitaet.get(m.id==='h1'?'aermel_erste':'aermel_zweite');
          if(l&&(naechste?l.frei_naechste:l.frei)===0)continue;
        }
        frei.push({team:m.id,name:m.name,art:s.art,seite:p.platz,platz:s.id+':'+p.platz});
      }
    }
    const teamSort=new Map(daten.mannschaften.map((m,i)=>[m.id,i]));
    const arten=Object.keys(ARTEN),seiten=Object.keys(SEITEN);
    return frei.sort((a,b)=>teamSort.get(a.team)-teamSort.get(b.team)||arten.indexOf(a.art)-arten.indexOf(b.art)||seiten.indexOf(a.seite)-seiten.indexOf(b.seite));
  }

  // Jeder nachfolgende Filter enthält nur noch tatsächlich passende Kombinationen.
  function filtern(plaetze,wunsch={},folge=['team','art','seite']){
    let treffer=plaetze;
    const optionen={};
    for(const feld of folge){
      const moeglich=[...new Set(treffer.map(p=>p[feld]))];
      optionen[feld]=moeglich;
      const wert=moeglich.includes(wunsch[feld])?wunsch[feld]:moeglich[0];
      treffer=treffer.filter(p=>p[feld]===wert);
    }
    return {platz:treffer[0]||null,optionen};
  }
  function kleidungswahl(plaetze,platz,bisher){
    const arten=platz?Object.keys(ARTEN).filter(art=>plaetze.some(p=>p.team===platz.team&&p.seite===platz.seite&&p.art===art)):[];
    return {arten,gewaehlt:bisher==null?arten.slice():arten.filter(art=>bisher.includes(art))};
  }
  function wahl(container,plaetze,bevorzugt,onChange){
    const doc=container.ownerDocument;
    const teamNamen=new Map(plaetze.map(p=>[p.team,p.name]));
    const sprachfeld={team:'Mannschaft',art:'Kleidungsstück',seite:'Ärmelseite'};
    const titel=(feld,wert)=>feld==='team'?teamNamen.get(wert):feld==='art'?ARTEN[wert]:SEITEN[wert];
    const rahmen=doc.createElement('div');rahmen.className='pa-wahl';
    container.replaceChildren(rahmen);
    if(!plaetze.length){
      const p=doc.createElement('p');p.textContent='Aktuell ist hier kein Ärmel frei.';rahmen.append(p);onChange(null);return;
    }
    let folge=['team','art','seite'],wunsch=bevorzugt||{};
    const modus=doc.createElement('button');modus.type='button';modus.className='pa-modus';
    const felder=doc.createElement('div');felder.className='pa-felder';rahmen.append(felder,modus);
    function zeigen(fokus){
      const {platz,optionen}=filtern(plaetze,wunsch,folge);
      wunsch=platz;
      felder.replaceChildren();
      for(const feld of folge){
        const label=doc.createElement('label');label.append(sprachfeld[feld]);
        const select=doc.createElement('select');select.dataset.paFeld=feld;
        for(const wert of optionen[feld]){const o=doc.createElement('option');o.value=wert;o.textContent=titel(feld,wert);select.append(o);}
        select.value=platz[feld];select.onchange=()=>{wunsch={...platz,[feld]:select.value};zeigen(feld);};
        label.append(select);felder.append(label);
        if(fokus===feld)select.focus({preventScroll:true});
      }
      modus.hidden=teamNamen.size<2||new Set(plaetze.map(p=>p.seite)).size<2;
      modus.textContent=folge[0]==='team'?'Nach Ärmelseite suchen':'Nach Mannschaft suchen';
      onChange(platz);
    }
    modus.onclick=()=>{folge=folge[0]==='team'?['seite','art','team']:['team','art','seite'];zeigen(folge[0]);};
    zeigen();
  }
  const api={freie,filtern,kleidungswahl,wahl,ARTEN,SEITEN};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PARTNER_AERMEL=api;
})(typeof window==='undefined'?globalThis:window);

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
    let rand = []; for(let i = 0; i < w; i++) rand.push(i, (h - 1) * w + i);
    for(let j = 1; j < h - 1; j++) rand.push(j * w, j * w + w - 1);
    // Alpha wird über die ganze Fläche geprüft, nicht nur an den Bildkanten.
    // Kleine Außenstreifen oder abgerundete Ecken einer sonst geschlossenen
    // Bildfläche sind noch kein freigestelltes Logo. Transparente Pixel zählen
    // bei der folgenden Farberkennung nie als schwarzer Hintergrund.
    let sichtbar = 0, x0 = w, y0 = h, x1 = -1, y1 = -1;
    for(let k = 0; k < w * h; k++){ if(p[k * 4 + 3] < 20) continue; sichtbar++;
      const xx = k % w, yy = (k / w) | 0; x0 = Math.min(x0, xx); y0 = Math.min(y0, yy); x1 = Math.max(x1, xx); y1 = Math.max(y1, yy); }
    const alpha = sichtbar < w * h;
    if(alpha){
      if(!sichtbar || sichtbar / ((x1 - x0 + 1) * (y1 - y0 + 1)) < .9) return { c, entfernt:false };
      rand = rand.filter(k => p[k * 4 + 3] >= 20);
      if(!rand.length) return { c, entfernt:false };
    }
    // häufigste Randfarbe
    const zaehl = new Map();
    rand.forEach(k => { const q = ((p[k * 4] >> 4) << 8) | ((p[k * 4 + 1] >> 4) << 4) | (p[k * 4 + 2] >> 4); zaehl.set(q, (zaehl.get(q) || 0) + 1); });
    let best = 0, bq = 0; zaehl.forEach((v, q) => { if(v > best){ best = v; bq = q; } });
    if(best / rand.length < .55) return { c, entfernt:false };
    let br = 0, bg = 0, bb = 0, bn = 0; rand.forEach(k => { const q = ((p[k * 4] >> 4) << 8) | ((p[k * 4 + 1] >> 4) << 4) | (p[k * 4 + 2] >> 4); if(q === bq){ br += p[k * 4]; bg += p[k * 4 + 1]; bb += p[k * 4 + 2]; bn++; } });
    br /= bn; bg /= bn; bb /= bn;
    const nah = k => p[k * 4 + 3] >= 20 && Math.abs(p[k * 4] - br) + Math.abs(p[k * 4 + 1] - bg) + Math.abs(p[k * 4 + 2] - bb) < tol * 1.6;
    // Eine einfarbige sichtbare Fläche mit Alpha-Rand kann selbst die Marke sein.
    if(alpha){ let anders = false; for(let k = 0; k < w * h; k++) if(p[k * 4 + 3] >= 20 && !nah(k)){ anders = true; break; }
      if(!anders) return { c, entfernt:false }; }
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
  function einfarbig(c, farbe, hintergrund){
    const n = leinwand(c.width, c.height), x = n.getContext('2d', { willReadFrequently:true }); x.drawImage(c, 0, 0);
    const d = x.getImageData(0, 0, n.width, n.height), p = d.data;
    let hell = 0, dunkel = 0; for(let k = 0; k < p.length; k += 4){ if(p[k + 3] < 128) continue; if(lum(p[k], p[k + 1], p[k + 2]) > .78) hell++; else dunkel++; }
    const nurHell = hell / Math.max(1, hell + dunkel) >= .6;
    const [r, g, b] = [1, 3, 5].map(i => parseInt(farbe.slice(i, i + 2), 16));
    const bg = /^#[0-9a-f]{6}$/i.test(hintergrund || '') ? [1, 3, 5].map(i => parseInt(hintergrund.slice(i, i + 2), 16)) : null;
    for(let k = 0; k < p.length; k += 4){ const a = p[k + 3] / 255; if(!a){ continue; }
      let deck = a;
      if(!nurHell){ const m = Math.min(p[k], p[k + 1], p[k + 2]) / 255 * a + (1 - a); deck = sst(.1, .42, 1 - m); }
      // Ein dunkler Bildhintergrund kann auch in geschlossenen Buchstaben oder einem Fenster liegen.
      // Nur die beim Freistellen erkannte Farbe aussparen, nicht pauschal alle dunklen Markenteile.
      if(bg) deck *= sst(16, 64, Math.abs(p[k] - bg[0]) + Math.abs(p[k + 1] - bg[1]) + Math.abs(p[k + 2] - bg[2]));
      p[k] = r; p[k + 1] = g; p[k + 2] = b; p[k + 3] = Math.round(deck * 255); }
    x.putImageData(d, 0, 0); return n;
  }
  // Mitgelieferte Logos (kit/logos/name.png) haben eine von Hand geprüfte weiße Fassung unter kit/logos/weiss/name.png
  function weissDatei(src){ const m = /^(.*?)(kit\/logos\/)([a-z0-9-]+)\.png(\?.*)?$/.exec(String(src || '')); return m ? m[1] + m[2] + 'weiss/' + m[3] + '.png' : null; }
  const merk = new Map();
  function sichtbar(c){ const p = c.getContext('2d', { willReadFrequently:true }).getImageData(0, 0, c.width, c.height).data;
    for(let i = 3; i < p.length; i += 4) if(p[i] > 24) return true; return false; }
  // Aufbereiten: freistellen, zuschneiden, analysieren. Ergebnis wird je Quelle gemerkt.
  async function aufbereiten(src){
    if(merk.has(src)) return merk.get(src);
    const pr = (async () => {
      const img = await laden(src); const r = raster(img);
      if(!sichtbar(r)) throw new Error('Die Logodatei enthält keine sichtbare Grafik. Bitte lade ein anderes Logo hoch.');
      const f = freistellen(r); const c = zuschneiden(f.c);
      if(!sichtbar(c)) throw new Error('Beim Freistellen bleibt keine sichtbare Marke übrig. Bitte nutze ein PNG mit transparentem Hintergrund.');
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
    // Weiß ausgesparte Flächen können nach der Umfärbung leer sein. Den Druck dann erneut einpassen,
    // sonst bestimmt die frühere Fläche die Größe und das sichtbare Zeichen wird unnötig klein.
    const c = zuschneiden(einfarbig(a.c, farbe, a.hintergrund));
    if(!sichtbar(c)) throw new Error('Diese Logo-Fassung ist leer. Bitte wähle ein anderes Logo.');
    merk.set(k, c); return c;
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

/* Trainingsanzug: dieselbe fotobasierte Ärmelvorlage für jede Firma.
   Originale bleiben erhalten. Das Logo wird schwarz auf den Stoff gesetzt. */
(function(root){
  'use strict';
  const SEITEN={
    aermel_l:{datei:'aermel-links.webp',feld:[[.503,.352],[.737,.370],[.755,.554],[.485,.542]]},
    aermel_r:{datei:'aermel-rechts.webp',feld:[[.257,.370],[.493,.352],[.514,.542],[.238,.554]]}
  };
  const cache=new Map();let zuletzt=null;
  function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  function bild(src){if(cache.has(src))return cache.get(src);const p=new Promise((ok,nein)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=()=>nein(Error('Die Anzugvorschau konnte nicht geladen werden. Bitte versuche es erneut.'));if(!/^data:|^blob:/.test(src))im.crossOrigin='anonymous';im.src=src;});cache.set(src,p);p.catch(()=>cache.delete(src));return p;}
  function feld(seite,w,h){const s=SEITEN[seite];if(!s)throw Error('Bitte einen linken oder rechten Ärmel wählen.');return s.feld.map(([x,y])=>[x*w,y*h]);}
  function punkt(q,u,v){return [(1-v)*((1-u)*q[0][0]+u*q[1][0])+v*((1-u)*q[3][0]+u*q[2][0]),(1-v)*((1-u)*q[0][1]+u*q[1][1])+v*((1-u)*q[3][1]+u*q[2][1])];}
  function aufdruck(x,im,q,seite,variante,trikot){const iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height,w=(Math.hypot(q[1][0]-q[0][0],q[1][1]-q[0][1])+Math.hypot(q[2][0]-q[3][0],q[2][1]-q[3][1]))/2,h=(Math.hypot(q[3][0]-q[0][0],q[3][1]-q[0][1])+Math.hypot(q[2][0]-q[1][0],q[2][1]-q[1][1]))/2,s=Math.min(w/iw,h/ih),uw=iw*s/w,vh=ih*s/h,u0=(1-uw)/2,v0=(1-vh)/2;
    // Ein durchgehender Aufdruck statt einzeln geglätteter Dreiecke: keine hellen Maschennähte im Logo.
    const r=[[u0,v0],[u0+uw,v0],[u0+uw,v0+vh],[u0,v0+vh]].map(([u,v])=>punkt(q,u,v)),ox=Math.floor(Math.min(...r.map(p=>p[0]))),oy=Math.floor(Math.min(...r.map(p=>p[1]))),W=Math.ceil(Math.max(...r.map(p=>p[0])))-ox,H=Math.ceil(Math.max(...r.map(p=>p[1])))-oy;
    // Vor dem Abtasten verkleinern: dünne Striche bleiben auch bei großen Originaldateien glatt.
    const sw=Math.min(iw,Math.max(1,Math.ceil(W*1.5))),sh=Math.max(1,Math.round(ih*sw/iw));
    const sc=canvas(sw,sh),sx=sc.getContext('2d');
    sx.imageSmoothingQuality='high';sx.drawImage(im,0,0,sw,sh);
    const maske=sx.getImageData(0,0,sw,sh).data;
    const stoff=x.getImageData(ox,oy,W,H),pixel=stoff.data;
    const licht=new Float32Array(W*H);
    for(let i=0;i<licht.length;i++)licht[i]=(pixel[i*4]+2*pixel[i*4+1]+pixel[i*4+2])/4;
    const mittel=licht.reduce((sum,l)=>sum+l,0)/licht.length;
    const A=r[0],B=[r[1][0]-A[0],r[1][1]-A[1]],C=[r[3][0]-A[0],r[3][1]-A[1]],D=[r[2][0]-r[1][0]-r[3][0]+A[0],r[2][1]-r[1][1]-r[3][1]+A[1]];
    const radius=Math.max(2,Math.round(x.canvas.width*.007));
    const hell=(px,py)=>licht[Math.min(H-1,Math.max(0,py))*W+Math.min(W-1,Math.max(0,px))];
    // Falten aus einer verkleinerten Lichtkarte ableiten. Einzelne Maschen dürfen
    // feine Buchstaben nicht verziehen, bleiben aber in der Druckhelligkeit sichtbar.
    let faltenLicht=hell;
    if(trikot){
      const klein=canvas(Math.max(2,Math.ceil(W/radius)),Math.max(2,Math.ceil(H/radius)));
      const k=klein.getContext('2d');k.imageSmoothingQuality='high';
      k.drawImage(x.canvas,ox,oy,W,H,0,0,klein.width,klein.height);
      const farben=k.getImageData(0,0,klein.width,klein.height).data;
      const wert=(a,b)=>{const i=(b*klein.width+a)*4;return (farben[i]+2*farben[i+1]+farben[i+2])/4;};
      faltenLicht=(px,py)=>{
        const u=Math.max(0,Math.min(klein.width-1,(px+.5)*klein.width/W-.5));
        const v=Math.max(0,Math.min(klein.height-1,(py+.5)*klein.height/H-.5));
        const a=Math.floor(u),b=Math.floor(v),a1=Math.min(klein.width-1,a+1),b1=Math.min(klein.height-1,b+1);
        const du=u-a,dv=v-b;
        return (wert(a,b)*(1-du)+wert(a1,b)*du)*(1-dv)+(wert(a,b1)*(1-du)+wert(a1,b1)*du)*dv;
      };
    }
    const aussen=seite==='aermel_r'?-1:1;
    // Projektion eines zylindrischen Ärmels, leicht von vorn gesehen. Die äußere Kante läuft um den Arm.
    const mitte=aussen*.16,halbwinkel=.75*uw;
    const links=Math.sin(mitte-halbwinkel),bogen=Math.sin(mitte+halbwinkel)-links;
    for(let py=0;py<H;py++)for(let px=0;px<W;px++){
      const X=ox+px+.5,Y=oy+py+.5;
      let u=(X-A[0])/B[0],v=(Y-A[1])/C[1];
      for(let i=0;i<5;i++){
        const ex=A[0]+B[0]*u+C[0]*v+D[0]*u*v-X,ey=A[1]+B[1]*u+C[1]*v+D[1]*u*v-Y;
        const du=[B[0]+D[0]*v,B[1]+D[1]*v],dv=[C[0]+D[0]*u,C[1]+D[1]*u],det=du[0]*dv[1]-dv[0]*du[1];
        if(Math.abs(det)<1e-8)break;
        u-=(ex*dv[1]-ey*dv[0])/det;v-=(ey*du[0]-ex*du[1])/det;
      }
      if(u<0||u>1||v<0||v>1)continue;
      const horizontal=(Math.asin(links+u*bogen)-mitte+halbwinkel)/(2*halbwinkel);
      const lx=faltenLicht(px+radius,py)-faltenLicht(px-radius,py),ly=faltenLicht(px,py+radius)-faltenLicht(px,py-radius);
      const kanten=4*u*(1-u), innen=4*v*(1-v);
      u=horizontal+kanten*lx*.00030;
      v+=innen*(.038*kanten+ly*.00040);
      const tx=Math.max(0,Math.min(sw-1,u*sw-.5)),ty=Math.max(0,Math.min(sh-1,v*sh-.5));
      const ix=Math.floor(tx),iy=Math.floor(ty),dx=tx-ix,dy=ty-iy;
      const texel=(xx,yy,c)=>maske[(yy*sw+xx)*4+c];
      const alpha=(xx,yy)=>texel(xx,yy,3)/255;
      const deckung=(alpha(ix,iy)*(1-dx)+alpha(Math.min(ix+1,sw-1),iy)*dx)*(1-dy)
        +(alpha(ix,Math.min(iy+1,sh-1))*(1-dx)+alpha(Math.min(ix+1,sw-1),Math.min(iy+1,sh-1))*dx)*dy;
      // Das schwarze Transfermaterial übernimmt Licht, Schatten und die feine Struktur des Fotos.
      const l=hell(px,py),detail=l-(hell(px-1,py)+hell(px+1,py)+hell(px,py-1)+hell(px,py+1))/4;
      const schwarz=Math.min(55,Math.max(9,12+(l-155)*.29+detail*.8));
      const pos=(py*W+px)*4;
      if(!deckung)continue;
      const gewebelicht=Math.max(.55,Math.min(1.03,.91+(l-mittel)/230+detail/420));
      for(let c=0;c<3;c++){
        let tinte=schwarz;
        if(variante!=='schwarz'){
          const farbe=(xx,yy)=>texel(xx,yy,c)*alpha(xx,yy);
          const x1=Math.min(ix+1,sw-1),y1=Math.min(iy+1,sh-1);
          const wert=((farbe(ix,iy)*(1-dx)+farbe(x1,iy)*dx)*(1-dy)
            +(farbe(ix,y1)*(1-dx)+farbe(x1,y1)*dx)*dy)/deckung;
          tinte=schwarz+(255-schwarz)*(wert/255)*gewebelicht;
        }
        pixel[pos+c]+=deckung*(tinte-pixel[pos+c]);
      }
    }
    x.putImageData(stoff,ox,oy);
  }
  const TRIKOT={
    heim:{datei:'heim.webp',feld:[[.331,.285],[.605,.312],[.591,.642],[.288,.606]]},
    auswaerts:{datei:'auswaerts.webp',feld:[[.324,.265],[.634,.285],[.630,.628],[.277,.617]]}
  };
  function trikotFeld(art,seite,w,h){
    const trikot=TRIKOT[art];
    if(!trikot||!SEITEN[seite])throw Error('Bitte Trikot und Ärmelseite wählen.');
    const q=trikot.feld.map(([u,v])=>[u*w,v*h]);
    return seite==='aermel_l'?[1,0,3,2].map(i=>[w-q[i][0],q[i][1]]):q;
  }
  async function druckbild(o,variante){
    if(o.logo){
      if(typeof LOGO==='undefined')throw Error('Die Logoaufbereitung wird noch geladen. Bitte versuche es erneut.');
      return bild(await LOGO.alsDataUrl(o.logo,variante,1600));
    }
    const c=canvas(1200,280),x=c.getContext('2d'),name=String(o.firma||'Euer Name').trim().slice(0,120);
    x.fillStyle=variante==='schwarz'?'#111':variante.startsWith('farbe:')?variante.slice(6):'#fff';
    x.textAlign='center';x.textBaseline='middle';x.font='700 100px BarlowC,Arial,sans-serif';
    const breite=x.measureText(name).width;
    if(breite>1120)x.font='700 '+Math.floor(100*1120/breite)+'px BarlowC,Arial,sans-serif';
    x.fillText(name,600,140);
    return c;
  }
  async function motiv(o,trikot){
    const seite=o.seite||'aermel_r',seitenDaten=SEITEN[seite];
    if(!seitenDaten)throw Error('Bitte einen linken oder rechten Ärmel wählen.');
    const w=Math.max(360,Math.min(1536,Math.round(+o.breite||1200))),h=Math.round(w*2/3);
    const c=canvas(w,h),x=c.getContext('2d'),kit=o.kit||'kit/';
    const foto=await bild(kit+(trikot?'trikot-aermel/'+trikot.datei:'anzug/'+seitenDaten.datei));
    const spiegeln=trikot&&seite==='aermel_l';
    x.save();
    if(spiegeln){x.translate(w,0);x.scale(-1,1);}
    x.drawImage(foto,0,0,w,h);x.restore();
    if(o.leer)return c;
    let q=trikot?trikotFeld(o.art||'heim',seite,w,h):feld(seite,w,h);
    const groesse=Math.max(.5,Math.min(1.5,Number(o.groesse)||1));
    // Beim Trikot umschreibt das Viereck die maximale freie Fläche bis zu den Nähten.
    const faktor=trikot?(groesse<=1?.8*groesse:.8+.4*(groesse-1)):Math.min(1.12,groesse);
    const rand=(1-faktor)/2;
    q=[[rand,rand],[1-rand,rand],[1-rand,1-rand],[rand,1-rand]].map(([u,v])=>punkt(q,u,v));
    const variante=trikot?(o.variante||'weiss'):'schwarz';
    aufdruck(x,await druckbild(o,variante),q,seite,variante,trikot);
    return c;
  }
  const zeichnen=(o={})=>motiv(o,null);
  async function trikotDetail(o={}){
    const trikot=TRIKOT[o.art||'heim'];
    if(!trikot)throw Error('Bitte ein Heim- oder Auswärtstrikot wählen.');
    return motiv(o,trikot);
  }
  async function angebot(o={}){
    const artikel={heim:'Heimtrikot',auswaerts:'Auswärtstrikot',anzug:'Trainingsanzug'};
    if(!Object.hasOwn(artikel,o.art)||!Object.hasOwn(SEITEN,o.seite))throw Error('Bitte Kleidungsstück und Ärmel auswählen.');
    if(!o.logo)throw Error('Für diese Ärmelvorschau fehlt die Druckfassung des Firmenlogos.');
    const cv=await (o.art==='anzug'?zeichnen(o):trikotDetail({...o,variante:'weiss'}));
    cv.setAttribute('role','img');
    cv.setAttribute('aria-label',(o.firma||'Euer Logo')+' auf dem '+(o.seite==='aermel_l'?'linken':'rechten')+' Ärmel · '+artikel[o.art]);
    return cv;
  }
  async function bilder(firma,logo,kit='kit/'){const key=JSON.stringify([firma,logo||null,kit]);if(zuletzt?.key===key)return zuletzt.p;const job={key,p:null};zuletzt=job;job.p=(async()=>{const b={gesamt_foto:true};for(const seite of Object.keys(SEITEN)){const c=await zeichnen({firma,logo,seite,kit,breite:1200});b[seite]=c.toDataURL('image/webp',.94);b[seite==='aermel_l'?'gesamt_l':'gesamt_r']=b[seite];c.width=c.height=1;}return b;})().catch(e=>{if(zuletzt===job)zuletzt=null;throw e;});return job.p;}
  const api={zeichnen,trikotDetail,trikotFeld,bilder,feld,punkt,angebot};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TRAININGSANZUG=api;
})(typeof window!=='undefined'?window:globalThis);

/* =====================================================================
   Beta 0.80 · Bandencreator: Gestaltung, Druckdaten und Platzszene
   Gemeinsam für die App (svm79.js) und die Partner-Präsentation (partner.js), braucht LOGO (logolib.js).
   - Feste Regeln, damit alle Banden zusammenpassen: Sicherheitsabstand, großes Logo, bei Bedarf ein ausdrücklich bestätigter Symbolname,
     Partner-CI heißt: weiße Bande, Marine, Logo einfarbig. Seit 0.99.38 steht KEIN Vereinsabsender mehr auf der Bande (kein Wappen,
     kein „SV/BSC“, keine Handschrift): Auf die Bande gehört nur der Partner. Schriften und Farben aus dem Corporate Design Manual.
   - Alles in Millimetern. layout() liefert eine Liste von Bausteinen (Fläche, Linie, Bild, Text, Strich) mit ihren Kästen,
     daraus malen (Canvas), svg (Vektor mit eingebetteten Schriften), pdf (Originalgröße mit 2 cm Beschnitt und Schnittmarken).
   - Text passt immer: Schrift wird kleiner (auch zweizeilig), nie abgeschnitten. Lesbar heißt: Versalhöhe ≥ Abstand / 250.
   - szene(): die Bande am Spielfeldrand in Perspektive mit Nachbarbanden im Einheitslook, Rasen und Tageslicht.
   Nichts verlässt das Gerät.
   ===================================================================== */
const BANDE = (() => {
  const C = { marine:'#1d2760', orange:'#e8741f', tinte:'#1c1c22', grau:'#3a3a44', himmel:'#8fc9ec', weiss:'#ffffff' };
  const FORMATE = {
    '250x80':  { w:2500, h:800,  t:'2,50 × 0,80 m', k:'2,5 m', lang:'2,5 m lang, 80 cm hoch', paket:'Einzelbande', hinweis:'Einzelbande: eine Platte, 2,50 × 0,80 m (Pakete Club und Premium)' },
    '300x80':  { w:3000, h:800,  t:'3,00 × 0,80 m', k:'3 m', lang:'3 m lang, 80 cm hoch', std:true },
    '400x80':  { w:4000, h:800,  t:'4,00 × 0,80 m', k:'4 m', lang:'4 m lang, 80 cm hoch' },
    '500x80':  { w:5000, h:800,  t:'5,00 × 0,80 m', k:'5 m', lang:'5 m lang, 80 cm hoch', paket:'Doppelbande', hinweis:'Doppelbande: zwei Platten zu je 2,50 m, zusammen 5,00 × 0,80 m (Paket 1896 Partner, Maß der heutigen Banden)' },
    '600x80':  { w:6000, h:800,  t:'6,00 × 0,80 m', k:'6 m', lang:'6 m lang, 80 cm hoch' },
    '200x100': { w:2000, h:1000, t:'2,00 × 1,00 m', k:'Partnerwand', lang:'Feld der Partnerwand, 2 m breit, 1 m hoch', wand:true } };
  // Welche Bande zu welchem Paket gehört (Albert, 16.11.2026): Einzelbande 2500 × 800 mm für Club und Premium, Doppelbande 5000 × 800 mm
  // nur für 1896 Partner, Supporter hat keine Bande. Die Reihenfolge ist die der Pakete.
  const PAKETE = [
    { key:'supporter', t:'Supporter', format:null },
    { key:'club', t:'Club', format:'250x80' },
    { key:'premium', t:'Premium', format:'250x80' },
    { key:'p1896', t:'1896 Partner', format:'500x80' } ];
  const BESCHNITT = 20;           // mm je Seite
  const LAYOUTS = [['links', 'Logo links'], ['mitte', 'Logo groß']];
  const FAM = { c:"'BandeC','Barlow Condensed','PZC','BarlowC','Arial Narrow',sans-serif", t:"'BandeT','Barlow','InterV',Arial,sans-serif", h:"'BandeH','Caveat','PZHand',cursive" };
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
  const firmenKey = value => sauber(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  function muster(spec){
    spec = spec || {}; if(['normal', 'bb', 'moerlens'].includes(spec.pattern)) return spec.pattern;
    const firma = firmenKey(spec.firma || spec.name);
    return firma === 'bbbernsbaltz' ? 'bb' : ['morlens', 'moerlens','bbbernsbaltzmorlens','bbbernsbaltzmoerlens'].includes(firma) ? 'moerlens' : 'normal';
  }
  // The legacy page also runs without BD_CORE. Keep recognition limited to complete contact lines.
  function kontaktZeile(value){
    if(typeof BD_CORE !== 'undefined' && BD_CORE.isContactText) return BD_CORE.isContactText(value);
    const t = String(value == null ? '' : value).trim(); if(!t) return false;
    if(/[\r\n]/.test(t)) return t.split(/\r?\n/).some(kontaktZeile);
    const label = t.match(/^(telefon|tel\.?|telefax|fax|mobil|handy|phone|e[ -]?mail|mail|internet|website|homepage|web|url)\s*(?::\s*|\s+)(.+)$/i), v = (label ? label[2] : t).trim();
    if(/^(?:https?:\/\/|www\.)[^\s<>]+$/i.test(v) || /^(?:mailto:)?[^\s@<>]+@(?:[\p{L}\p{N}-]+\.)+[\p{L}]{2,63}$/iu.test(v) || /^(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]*[\p{L}\p{N}])?\.)+[\p{L}]{2,63}(?::\d{1,5})?(?:[/?#][^\s<>]*)?$/iu.test(v)) return true;
    const phone = v.replace(/^tel:/i, '').trim(), digits = phone.replace(/\D/g, ''), named = /^tel:/i.test(v) || !!(label && /^(?:telefon|tel\.?|telefax|fax|mobil|handy|phone)$/i.test(label[1]));
    if(/^[+\d().\s/-]+$/.test(phone) && digits.length >= (named ? 3 : 7) && digits.length <= 18 && (named || /^(?:\+|0)/.test(phone))) return true;
    const parts = t.split(/\s*[;|·•]\s*/); return parts.length > 1 && parts.every(kontaktZeile);
  }
  const ohneKontakt = value => String(value == null ? '' : value).split(/\r?\n/).filter(line => !kontaktZeile(line)).join(' ');
  function druckOps(L){
    return L.ops.flatMap(o => {
      if(['kontakt', 'web', 'telefon', 'fax', 'leiste'].includes(o.rolle)) return [];
      if(o.rolle === 'claim' && (L.pattern !== 'moerlens' || o.lines.join(' ') !== 'Restobar & Patisserie')) return [];
      if(o.t !== 'text') return [o]; const lines = o.lines.filter(line => !kontaktZeile(line));
      return lines.some(line => String(line).trim()) ? [lines.length === o.lines.length ? o : Object.assign({}, o, { lines })] : [];
    });
  }
  // A logo occupies the safe area. Only confirmed symbols get a separate company name.
  function layout(spec, res){
    spec = spec || {}; res = res || {};
    const F = FORMATE[spec.format] || FORMATE['300x80'], W = F.w, H = F.h, ci = spec.stil !== 'original';
    const ops = [], info = { warn:[], kontrast:[], lesbar:{} }, m = Math.round(Math.min(W, H) * .08), Hu = H - 2 * m, aw = W - 2 * m, x0 = m, cx = W / 2;
    const logo = res.logo && res.logo.w > 0 && res.logo.h > 0 ? res.logo : null, pattern = muster(spec), name = sauber(ohneKontakt(spec.name || spec.firma)), nameAn = spec.nameAn === true && pattern === 'normal';
    const lay = spec.layout === 'mitte' || spec.layout === 'claim' ? 'mitte' : 'links', nF = { fam:'c', w:900 }, cF = { fam:'t', w:600 };
    const ak = ci ? null : (/^#[0-9a-fA-F]{6}$/.test(spec.akzent || '') ? spec.akzent : null) || akzent(logo && logo.farben);
    const bg = !ci && logo && logo.hell ? (lum(ak) < .16 ? ak : C.tinte) : C.weiss, nameF = ci ? C.marine : textAuf(bg), claimF = nameF;
    ops.push({ t:'rect', x:-BESCHNITT, y:-BESCHNITT, w:W + 2 * BESCHNITT, h:H + 2 * BESCHNITT, fill:bg, rolle:'grund' });
    const logoBox = (mw, mh) => { if(!logo) return null; const scale = Math.min(mw / logo.w, mh / logo.h); return { w:logo.w * scale, h:logo.h * scale }; };
    const img = (b, x, y) => ops.push({ t:'img', key:'logo', x, y, w:b.w, h:b.h, rolle:'logo', box:{ x, y, w:b.w, h:b.h } });
    const txt = (p, x, y, rolle, fill = nameF) => { if(p) ops.push(textOp(p, x, y, 'c', fill, rolle)); };
    if(!logo){
      const p = einpassen(name.toUpperCase(), nF, aw, Hu, Hu / .7, 2); if(p) txt(p, cx, m + (Hu - p.h) / 2, 'name');
    } else if(pattern === 'bb'){
      const lw = Math.min(aw * .32, Hu * 1.45), gap = Math.min(H * .10, aw * .04), sw = (aw - lw - 2 * gap) / 2, b = logoBox(lw, Hu);
      img(b, cx - b.w / 2, m + (Hu - b.h) / 2);
      const fs = Math.min(Hu * .85, sw / (Math.max(mess('EVENT', nF).w, mess('KREATIV', nF).w) / 100));
      const left = einpassen('EVENT', nF, sw, Hu, fs, 1), right = einpassen('KREATIV', nF, sw, Hu, fs, 1);
      txt(left, x0 + sw / 2, (H - left.h) / 2, 'event'); txt(right, W - m - sw / 2, (H - right.h) / 2, 'kreativ');
    } else if(pattern === 'moerlens'){
      const claim = einpassen('Restobar & Patisserie', cF, aw, Hu * .22, H * .19, 1), gap = H * .05, b = logoBox(aw, Hu - claim.h - gap), y = m + (Hu - b.h - claim.h - gap) / 2;
      img(b, cx - b.w / 2, y); txt(claim, cx, y + b.h + gap, 'claim', claimF);
    } else if(nameAn && name){
      if(lay === 'mitte'){
        const p = einpassen(name.toUpperCase(), nF, aw, Hu * .22, Hu * .3, 1), gap = H * .05, b = logoBox(aw, Hu - p.h - gap), y = m + (Hu - b.h - p.h - gap) / 2;
        img(b, cx - b.w / 2, y); txt(p, cx, y + b.h + gap, 'name');
      } else {
        const b = logoBox(Math.min(aw * .35, Hu * 1.45), Hu), gap = Math.min(H * .1, aw * .06), tx = x0 + b.w + gap, tw = W - m - tx, p = einpassen(name.toUpperCase(), nF, tw, Hu, Hu / .7, 2);
        img(b, x0, m + (Hu - b.h) / 2); if(p) txt(p, tx + tw / 2, m + (Hu - p.h) / 2, 'name');
      }
    } else { const b = logoBox(aw, Hu); img(b, cx - b.w / 2, m + (Hu - b.h) / 2); }
    ops.filter(o => o.t === 'text').forEach(o => {
      info.kontrast.push({ rolle:o.rolle, text:o.fill, grund:bg, wert:Math.round(kontrast(o.fill, bg) * 10) / 10 });
      const distance = lesbarAus(o.f, o.fs); if(!info.lesbar[o.rolle] || distance < info.lesbar[o.rolle]) info.lesbar[o.rolle] = distance;
    });
    if(info.lesbar.name && info.lesbar.name < 30) info.warn.push('Der große Text ist nur aus ' + info.lesbar.name + ' m lesbar. Kürzer wird er größer.');
    if(!logo && spec.logoGewollt) info.warn.push('Das Logo fehlt noch. Bis dahin steht der Name als Schriftzug.');
    return { W, H, B:BESCHNITT, rand:m, leiste:0, kontakt:false, pattern, format:spec.format in FORMATE ? spec.format : '300x80', stil:ci ? 'ci' : 'original', layout:lay, ops, info, farben:{ grund:bg, leiste:ak, akzent:ak } };
  }

  /* ---------- Malen (Canvas, 1 Einheit = 1 mm, Ursprung = Endformat oben links) ---------- */
  function malen(x, L, res){
    res = res || {};
    druckOps(L).forEach(o => {
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
      try{ const a = await LOGO.aufbereiten(spec.logo); const art = ci ? 'farbe:' + (muster(spec)==='bb' ? C.orange : spec.logoFarbe === 'schwarz' ? C.tinte : C.marine) : 'original';
        const c = await LOGO.variante(spec.logo, art); res.logo = { w:c.width, h:c.height, hell:a.hell, farben:a.farben }; res.logoBild = c; res.analyse = a; }
      catch(e){ res.logoFehler = e.message || 'Logo lässt sich nicht laden'; } }
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
    if(o.raster){ x.save(); x.setLineDash([6 * dpr, 5 * dpr]); x.strokeStyle = '#e8741f'; x.lineWidth = 1.2 * dpr; x.strokeRect(ox + L.rand * s, oy + L.rand * s, (L.W - 2 * L.rand) * s, (L.H - 2 * L.rand) * s); x.restore(); }
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
    x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = '#86a05e'; x.fillRect(0, 0, Wc, Hc);   // nichts vom letzten Bild darf stehen bleiben
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
    const teile = druckOps(L).map(o => {
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

  /* ---------- Die Reihe, wie sie heute hängt (0.99.25) ----------
     Albert, 14.11.2026: „Kannst du mir das dreidimensional darstellen, wer jetzt gerade wie wo ist? So originalgetreu wie möglich.“
     Blick vom Rasen über die Laufbahn auf die Bandenreihe. Jede Tafel in ihrer wirklichen Länge und mit ihrem Foto, Lücken bleiben
     Lücken, freie Plätze sind gestrichelt. o: { tafeln:[{ id, x0, l, h, img, frei, nr, name, farbe, an, ring }], kamX, abstand, blick }.
     x in Metern entlang der Reihe. Rückgabe: { boxen:[{ id, x, y, w, h }], pxm } in CSS-Pixeln. */
  const REIHE_TEX = new Map(), REIHE_H = 192, REIHE_RAND = new Map();
  // Farbe am Rand eines Fotos (links, rechts, oben, unten): der Mittelwert eines schmalen Streifens knapp innerhalb der Kante
  function reiheRand(img, seite){ const k = img.src + '|' + seite; if(REIHE_RAND.has(k)) return REIHE_RAND.get(k);
    let f = '#f7f5ef'; try{ const iw = img.naturalWidth, ih = img.naturalHeight, d = Math.max(1, Math.round(Math.min(iw, ih) * .04)), c = document.createElement('canvas'), x = c.getContext('2d', { willReadFrequently:true });
      const quer = seite === 'o' || seite === 'u'; c.width = quer ? 24 : 1; c.height = quer ? 1 : 24;
      if(seite === 'l') x.drawImage(img, d, 0, d, ih, 0, 0, 1, 24); else if(seite === 'r') x.drawImage(img, iw - 2 * d, 0, d, ih, 0, 0, 1, 24);
      else if(seite === 'o') x.drawImage(img, 0, d, iw, d, 0, 0, 24, 1); else x.drawImage(img, 0, ih - 2 * d, iw, d, 0, 0, 24, 1);
      const p = x.getImageData(0, 0, c.width, c.height).data, n = p.length / 4, K = [[], [], []]; for(let i = 0; i < n; i++){ K[0].push(p[i * 4]); K[1].push(p[i * 4 + 1]); K[2].push(p[i * 4 + 2]); }
      const med = a => { a.sort((u, v) => u - v); return a[Math.floor(a.length / 2)]; };   // Median: ein Buchstabe oder ein Grashalm am Rand färbt die Fläche nicht um
      f = '#' + K.map(a => med(a).toString(16).padStart(2, '0')).join(''); }catch(e){}
    REIHE_RAND.set(k, f); return f; }
  // Eine Tafel der Reihe als Bild. Das Foto wird NIE verzogen (Albert, 14.11.2026: „teilweise zu schlecht, verzogen“): Es behält sein Seitenverhältnis.
  // Passt es fast (bis 7 %), füllt es die Tafel; sonst steht es ganz in der Mitte, und daneben läuft die Farbe seines Randes weiter (eine ruhige Fläche,
  // kein gestreckter Bildrand). Hat der Platz eine Grundfarbe (bandenplaetze.farbe), gilt ein sauberes Schild mit dem Namen statt eines Fotos:
  // so für Tafeln ohne Foto und für Fotos, die nur einen Ausschnitt zeigen.
  function reiheTex(t){
    const k = [t.id, t.img ? t.img.src : '', t.name, t.platztext||'', t.frei ? 1 : 0, t.l, t.farbe || '', t.nr].join('|'); if(REIHE_TEX.has(k)) return REIHE_TEX.get(k);
    const H = REIHE_H, W = Math.max(80, Math.round(t.l / (t.h || .8) * H)), c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    const hell = f => { const m = /^#(..)(..)(..)$/.exec(f || ''); return !m || (parseInt(m[1], 16) * .299 + parseInt(m[2], 16) * .587 + parseInt(m[3], 16) * .114) > 150; };
    // Schrift auf dem Schild: so groß wie möglich. Ein langer Name bricht an der Leerstelle nahe der Mitte in zwei Zeilen, wenn er dadurch größer wird.
    const text = (s, farbe, gr) => { const schrift = fs => `800 ${fs}px BandeT,Barlow,sans-serif`, pass = (Z, max) => { x.font = schrift(max); const w = Math.max(...Z.map(z => x.measureText(z).width)); return w > W * .88 ? max * W * .88 / w : max; };
      const T = String(s).replace(/([a-zäöüß])([A-ZÄÖÜ])/g, '$1 $2').split(/\s+/).filter(Boolean), gross = z => z.toUpperCase();   // Teile: Wörter, dazu die Naht in Namen wie „SparkassenVersicherung“
      s = gross(String(s)); let Z = [s], fs = pass(Z, H * (gr || .46));
      if(fs < H * .32 && T.length > 1){ let best = null; for(let i = 1; i < T.length; i++){ const a = gross(T.slice(0, i).join(' ')), b = gross(T.slice(i).join(' ')), d = Math.abs(a.length - b.length); if(!best || d < best.d) best = { d, Z:[a, b] }; }
        const f2 = pass(best.Z, H * .36); if(f2 > fs * 1.15){ Z = best.Z; fs = f2; } }
      x.font = schrift(fs); x.fillStyle = farbe; x.textAlign = 'center'; x.textBaseline = 'middle'; Z.forEach((z, i) => x.fillText(z, W / 2, H / 2 + (i - (Z.length - 1) / 2) * fs * 1.12 + fs * .04)); };
    const foto = !t.frei && !t.farbe && t.img && t.img.naturalWidth > 0;
    if(t.frei){ const e = H / 96; x.fillStyle = 'rgba(246,243,236,.82)'; x.fillRect(0, 0, W, H); x.strokeStyle = 'rgba(29,39,96,.7)'; x.lineWidth = 4 * e; x.setLineDash([14 * e, 9 * e]); x.strokeRect(5 * e, 5 * e, W - 10 * e, H - 10 * e); x.setLineDash([]); text(t.platztext||'frei', 'rgba(29,39,96,.95)', .42); }
    else if(foto){ const iw = t.img.naturalWidth, ih = t.img.naturalHeight, ai = iw / ih, ab = W / H;
      if(Math.abs(ai / ab - 1) <= .07) x.drawImage(t.img, 0, 0, W, H);
      else { const f = Math.min(W / iw, H / ih), w = Math.round(iw * f), h = Math.round(ih * f), l = Math.round((W - w) / 2), o = Math.round((H - h) / 2);
        if(l > 0){ x.fillStyle = reiheRand(t.img, 'l'); x.fillRect(0, 0, l + 1, H); x.fillStyle = reiheRand(t.img, 'r'); x.fillRect(l + w - 1, 0, W - l - w + 1, H); }
        if(o > 0){ x.fillStyle = reiheRand(t.img, 'o'); x.fillRect(0, 0, W, o + 1); x.fillStyle = reiheRand(t.img, 'u'); x.fillRect(0, o + h - 1, W, H - o - h + 1); }
        x.drawImage(t.img, l, o, w, h); } }
    else { const bg = t.farbe || '#ffffff'; x.fillStyle = bg; x.fillRect(0, 0, W, H); text(String(t.name || ''), hell(bg) ? C.marine : '#ffffff'); }
    if(!t.frei && !t.farbe && t.img && !t.img.naturalWidth) return c;   // Foto lädt noch: nicht merken
    REIHE_TEX.set(k, c); return c;
  }
  function reihe(cv, o){
    const dpr = Math.min(2, window.devicePixelRatio || 1), r = cv.getBoundingClientRect();
    const Wc = Math.max(10, Math.round(r.width * dpr)), Hc = Math.max(10, Math.round(r.height * dpr)); if(cv.width !== Wc) cv.width = Wc; if(cv.height !== Hc) cv.height = Hc;
    const x = cv.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    const T = o.tafeln || [], kx = +o.kamX || 0, d = o.abstand || 15, yaw = o.blick != null ? o.blick : .3, LIFT = .22, RAIL = 1.1, NAH = .3;
    const P = [kx - Math.sin(yaw) * d, 1.65, -Math.cos(yaw) * d], Z = [kx + .4, .6, 0];
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], norm = a => { const l = Math.hypot(...a); return a.map(v => v / l); };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const f = norm(sub(Z, P)), ri = norm(cross([0, 1, 0], f)), up = cross(f, ri), cam = Q => { const v = sub(Q, P); return [dot(v, ri), dot(v, up), dot(v, f)]; };
    const schmal = r.width < 560, breit = schmal ? 6.8 : 12.5,   /* seit 0.99.34 näher dran: am Handy füllt eine Bande von 5 m gut zwei Drittel der Breite */ cx = Wc * .5, cy = Hc * (schmal ? .5 : .5);
    let foc; { const a = cam([kx - breit / 2, LIFT, 0]), b = cam([kx + breit / 2, LIFT, 0]); foc = Wc * .96 / Math.abs(b[0] / b[2] - a[0] / a[2]); }
    const pr = Q => { const c = cam(Q); return [cx + foc * c[0] / c[2], cy - foc * c[1] / c[2], c[2]]; };
    const poly = (pts, fill) => { const Cc = pts.map(cam), out = [];
      for(let i = 0; i < Cc.length; i++){ const a = Cc[i], b = Cc[(i + 1) % Cc.length], ia = a[2] > NAH, ib = b[2] > NAH; if(ia) out.push(a);
        if(ia !== ib){ const t = (NAH - a[2]) / (b[2] - a[2]); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, NAH]); } }
      if(out.length < 3) return; x.beginPath(); out.forEach((c, i) => { const sx = cx + foc * c[0] / c[2], sy = cy - foc * c[1] / c[2]; i ? x.lineTo(sx, sy) : x.moveTo(sx, sy); }); x.closePath(); x.fillStyle = fill; x.fill(); };
    const linie = (A, B, farbe, dick) => { const a = cam(A), b = cam(B); if(a[2] < NAH && b[2] < NAH) return; let p = a, q = b;
      if(a[2] < NAH){ const t = (NAH - a[2]) / (b[2] - a[2]); p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, NAH]; } if(b[2] < NAH){ const t = (NAH - b[2]) / (a[2] - b[2]); q = [b[0] + (a[0] - b[0]) * t, b[1] + (a[1] - b[1]) * t, NAH]; }
      x.strokeStyle = farbe; x.lineWidth = Math.max(1, foc * dick / ((p[2] + q[2]) / 2)); x.beginPath(); x.moveTo(cx + foc * p[0] / p[2], cy - foc * p[1] / p[2]); x.lineTo(cx + foc * q[0] / q[2], cy - foc * q[1] / q[2]); x.stroke(); };
    const hz = norm([f[0], 0, f[2]]), horizont = cy - foc * dot(hz, up) / dot(hz, f), zuf = i => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
    const L0 = kx - 110, L1 = kx + 130;
    // Himmel und Hügel (der Himmel vom 14.11.: klar und blau)
    x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = '#86a05e'; x.fillRect(0, 0, Wc, Hc);   // nichts vom letzten Bild darf stehen bleiben
    let g = x.createLinearGradient(0, 0, 0, horizont); g.addColorStop(0, '#5f9fe0'); g.addColorStop(.75, '#a9cdee'); g.addColorStop(1, '#dfeaf2'); x.fillStyle = g; x.fillRect(0, 0, Wc, horizont + 2);
    x.fillStyle = '#9fb48f'; x.beginPath(); x.moveTo(0, horizont + 2); for(let i = 0; i <= 60; i++){ const t = i / 60, w = (kx * .012) + t * 4.2; x.lineTo(t * Wc, horizont - Hc * .075 * (.6 + .3 * Math.sin(w * 1.7) + .16 * Math.sin(w * 3.9 + 1))); } x.lineTo(Wc, horizont + 2); x.closePath(); x.fill();
    // Gelände hinter den Banden, Weg, Bäume in Herbstfarben (Spielplatz und Wiese)
    poly([[L0, 0, .3], [L1, 0, .3], [L1, 0, 90], [L0, 0, 90]], '#86a05e');
    poly([[L0, 0, 1.2], [L1, 0, 1.2], [L1, 0, 3.4], [L0, 0, 3.4]], '#cfc6ad');
    // Zaun und Hecke hinter dem Weg
    { const A0 = pr([kx - 70, 0, 4]), A1 = pr([kx + 100, 0, 4]), B0 = pr([kx - 70, 1.5, 4]), B1 = pr([kx + 100, 1.5, 4]); if(A0[2] > NAH && A1[2] > NAH){ x.fillStyle = '#6f8a52'; x.beginPath(); x.moveTo(A0[0], A0[1]); x.lineTo(A1[0], A1[1]); x.lineTo(B1[0], B1[1]); x.lineTo(B0[0], B0[1]); x.closePath(); x.fill(); } }
    const B = []; for(let i = Math.floor((kx - 95) / 2.6); i <= Math.ceil((kx + 125) / 2.6); i++) B.push({ bx:i * 2.6 + zuf(i) * 1.8, bz:38 + zuf(i + 500) * 45, bh:6 + zuf(i + 900) * 5, br:2.6 + zuf(i + 1300) * 1.8, gr:['#7d9d70', '#a3a354', '#c08d3e', '#cfa94c', '#93703f', '#6c8a60', '#b9792f'][Math.floor(zuf(i + 77) * 7)] });
    B.sort((a, b) => b.bz - a.bz).forEach(t => { const fu = pr([t.bx, 0, t.bz]), ko = pr([t.bx, t.bh, t.bz]); if(fu[2] < NAH) return; const rr = foc * t.br / fu[2]; if(fu[0] < -rr * 2 || fu[0] > Wc + rr * 2) return;
      x.fillStyle = '#5a4a36'; x.fillRect(fu[0] - rr * .06, ko[1], rr * .12, fu[1] - ko[1]);
      x.fillStyle = t.gr; [[0, 0, 1, 1.1], [-.55, .4, .7, .72], [.6, .35, .72, .78]].forEach(([dx, dy, a, b]) => { x.beginPath(); x.ellipse(ko[0] + dx * rr, ko[1] + dy * rr, rr * a, rr * b, 0, 0, Math.PI * 2); x.fill(); }); });
    g = x.createLinearGradient(0, horizont - Hc * .16, 0, horizont + Hc * .02); g.addColorStop(0, 'rgba(226,236,240,0)'); g.addColorStop(1, 'rgba(226,236,240,.35)'); x.fillStyle = g; x.fillRect(0, horizont - Hc * .16, Wc, Hc * .18);
    // Rasen, Seitenlinie, Laufbahn, Streifen vor den Banden
    poly([[L0, 0, -70], [L1, 0, -70], [L1, 0, -8.4], [L0, 0, -8.4]], '#5c9443');
    for(let i = Math.floor(L0 / 5); i < L1 / 5; i += 2) poly([[i * 5, 0, -70], [i * 5 + 5, 0, -70], [i * 5 + 5, 0, -8.4], [i * 5, 0, -8.4]], 'rgba(255,255,255,.05)');
    poly([[L0, 0, -10.1], [L1, 0, -10.1], [L1, 0, -9.98], [L0, 0, -9.98]], 'rgba(250,250,245,.9)');
    poly([[L0, 0, -8.4], [L1, 0, -8.4], [L1, 0, -1.1], [L0, 0, -1.1]], '#b56a45');
    [-6.6, -4.8, -3].forEach(z => poly([[L0, 0, z - .03], [L1, 0, z - .03], [L1, 0, z + .03], [L0, 0, z + .03]], 'rgba(255,235,215,.16)'));
    poly([[L0, 0, -1.1], [L1, 0, -1.1], [L1, 0, .3], [L0, 0, .3]], '#7f8f4c');
    // Geländer: Pfosten alle 2,5 m und der Holm, an dem die Tafeln hängen
    const xa = Math.min(...T.map(t => t.x0), kx) - 12, xb = Math.max(...T.map(t => t.x0 + t.l), kx) + 12;
    for(let px = Math.ceil(Math.max(xa, kx - 60) / 2.5) * 2.5; px <= Math.min(xb, kx + 80); px += 2.5) linie([px, 0, .04], [px, RAIL, .04], 'rgba(235,235,230,.9)', .05);
    linie([Math.max(xa, kx - 60), RAIL, .04], [Math.min(xb, kx + 80), RAIL, .04], 'rgba(245,245,240,.95)', .06);
    // Tafeln von hinten nach vorn
    const boxen = [];
    T.slice().sort((a, b) => cam([b.x0 + b.l / 2, 0, 0])[2] - cam([a.x0 + a.l / 2, 0, 0])[2]).forEach(t => {
      const h = t.h || .8, x0 = t.x0, x1 = t.x0 + t.l, a0 = cam([x0, 0, 0]), a1 = cam([x1, 0, 0]); if(a0[2] < NAH && a1[2] < NAH) return;
      const ol = pr([x0, LIFT + h, 0]), or = pr([x1, LIFT + h, 0]), ul = pr([x0, LIFT, 0]), ur = pr([x1, LIFT, 0]); if(Math.max(or[0], ur[0]) < -40 || Math.min(ol[0], ul[0]) > Wc + 40) return;
      if(!t.frei) poly([[x0, 0, -.02], [x1, 0, -.02], [x1 + .2, 0, -.5], [x0 + .1, 0, -.5]], 'rgba(30,40,20,.2)');
      const tex = reiheTex(t), breitPx = Math.abs(ur[0] - ul[0]), n = Math.max(6, Math.ceil(breitPx / (2 * dpr)));
      for(let k = 0; k < n; k++){ const u0 = k / n, u1 = (k + 1) / n, p0 = pr([x0 + u0 * t.l, LIFT + h, 0]), p1 = pr([x0 + u1 * t.l, LIFT + h, 0]), q0 = pr([x0 + u0 * t.l, LIFT, 0]); if(p0[2] < NAH || p1[2] < NAH) continue;
        x.drawImage(tex, u0 * tex.width, 0, Math.max(1, (u1 - u0) * tex.width), tex.height, p0[0], p0[1], p1[0] - p0[0] + .6, q0[1] - p0[1]); }
      x.strokeStyle = t.an ? C.orange : 'rgba(0,0,0,.22)'; x.lineWidth = t.an ? Math.max(3, dpr * 2.5) : Math.max(1, dpr * .7); x.beginPath(); x.moveTo(ol[0], ol[1]); x.lineTo(or[0], or[1]); x.lineTo(ur[0], ur[1]); x.lineTo(ul[0], ul[1]); x.closePath(); x.stroke();
      // Nummer über der Tafel
      const m = pr([x0 + t.l / 2, LIFT + h + .5, 0]); if(m[2] > NAH && t.nr != null){ const rr = Math.max(9 * dpr, Math.min(17 * dpr, foc * .34 / m[2]));
        x.fillStyle = t.an ? C.orange : (t.frei ? 'rgba(255,255,255,.92)' : C.marine); x.beginPath(); x.arc(m[0], m[1], rr, 0, Math.PI * 2); x.fill(); if(t.frei && !t.an){ x.strokeStyle = C.marine; x.lineWidth = Math.max(1, dpr); x.stroke(); }
        if(t.ring){ x.strokeStyle = '#fff'; x.lineWidth = rr * .5; x.beginPath(); x.arc(m[0], m[1], rr + rr * .18, 0, Math.PI * 2); x.stroke(); x.strokeStyle = t.ring; x.lineWidth = rr * .3; x.beginPath(); x.arc(m[0], m[1], rr + rr * .18, 0, Math.PI * 2); x.stroke(); }
        x.fillStyle = t.frei && !t.an ? C.marine : '#fff'; x.font = `800 ${rr * 1.05}px BandeT,Barlow,sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(t.nr), m[0], m[1] + rr * .06); }
      boxen.push({ id:t.id, x:Math.min(ol[0], ul[0]) / dpr, y:Math.min(ol[1], or[1]) / dpr, w:(Math.max(or[0], ur[0]) - Math.min(ol[0], ul[0])) / dpr, h:(Math.max(ul[1], ur[1]) - Math.min(ol[1], or[1])) / dpr });
    });
    const m0 = pr([kx, LIFT, 0]), m1 = pr([kx + 1, LIFT, 0]);
    return { boxen, pxm:Math.abs(m1[0] - m0[0]) / dpr };
  }

  return { C, FORMATE, PAKETE, LAYOUTS, BESCHNITT, schriften, vorbereiten, muster, layout, malen, bild, flach, szene, reihe, reiheTex, pdf, png, svg, akzent, kontrast, lum, mess, einpassen, sauber, ohneKontakt, laden };
})();

// Feste, geprüfte Formen für die Planvorschau und den Export.
// Die Markenfreigabe gehört zur exakten SVG-Fassung (siehe revision).
(function(root) {
  'use strict';
  // BEGINN DRUCKPFADE
  const katalog = {
    "basakci": {
      "width": 674,
      "height": 105,
      "formen": [
        {
          "d": "M47.5 101.85C44.75 101.45 33.42 99.69 22.33 97.93C4.01 95.03 2.11 94.54 1.6 92.62C1.28 91.45 1.02 72.92 1.01 51.44C1 21.68 1.3 12.01 2.25 10.82C3.13 9.72 10.71 8.09 28.01 5.29L52.52 1.31 64.51 3.12C100.36 8.53 102.97 10.32 103.31 29.72C103.53 42.04 102.32 45.28 96.19 48.78L92.69 50.79 95.85 52.42C97.59 53.32 100.17 55.81 101.59 57.96C104.05 61.68 104.16 62.4 103.84 73.26C103.52 83.96 103.33 84.89 100.69 88.34C95.36 95.32 84.82 98.51 54.5 102.32C53.4 102.46 50.25 102.25 47.5 101.85ZM70.5 82.57C76 81.81 81.23 80.9 82.11 80.54C84.64 79.52 86 75.44 86 68.91C86 63.94 85.6 62.5 83.64 60.55L81.28 58.19 51.39 58.34L21.5 58.5 21.22 69.7L20.94 80.9 24.22 81.41C41.4 84.07 56.7 84.46 70.5 82.57ZM82.75 41.36C84.78 40.09 85 39.17 85 32C85 21.51 84.68 21.3 65.29 19.3C51.44 17.86 49.58 17.89 36 19.63L21.5 21.5 21.21 30.92C21.05 36.11 21.12 40.88 21.37 41.53C22.09 43.41 79.73 43.24 82.75 41.36Z",
          "original": "#04471D",
          "ci": "#174782"
        },
        {
          "d": "M46.86 101.53C46.6 101.27 40.56 100.14 33.44 99.02C18.13 96.62 8.54 95.06 4.75 94.35L2 93.84 2 52.01L2 10.18 8.75 9.07C12.46 8.45 23.78 6.58 33.9 4.9C48.87 2.42 52.45 2.1 53.13 3.18C54.18 4.83 54.24 14.08 53.21 15.69C52.37 17.02 43.82 18.53 31.37 19.56C26.89 19.93 22.8 20.52 22.27 20.87C21.1 21.63 20.01 37.54 20.9 40.87C21.53 43.23 21.59 43.24 37.51 43.37L53.5 43.5 53.81 48.43C54.45 58.44 55.23 58 36.98 58L21 58 21 69.44C21 75.73 21.41 81.14 21.91 81.45C22.42 81.76 29.15 82.64 36.87 83.42C44.59 84.19 51.33 85.09 51.85 85.41C53.1 86.18 54.37 97.26 53.52 99.93C52.92 101.84 48.28 102.95 46.86 101.53Z",
          "original": "#026E2E",
          "ci": "#68B9DF"
        },
        {
          "d": "M142.71 80.54C142.07 79.9 141.55 66.94 141.55 51.74L141.55 24.1 169.15 24.1C201 24.1 201.89 24.4 203.15 35.54C203.8 41.38 203.33 43.79 200.85 47.13C197.79 51.28 197.79 51.43 200.64 54.95C204.62 59.86 204.59 72.07 200.59 77.02C197.72 80.57 196.84 80.69 170.75 81.18C155.96 81.47 143.34 81.17 142.71 80.54ZM220.05 80.26C219.64 79.61 226.18 66.88 234.57 51.97L249.82 24.88 257.13 24.88L264.45 24.88 279.74 51.73C288.16 66.5 294.64 79.23 294.15 80.02C293.1 81.72 284.1 81.89 281.71 80.26C280.79 79.64 278.72 76.86 277.11 74.09L274.18 69.05 256.2 69.05L238.22 69.05 234.74 75.25C231.75 80.57 230.51 81.45 226.02 81.45C223.14 81.45 220.45 80.91 220.05 80.26ZM316.73 79.46C311.77 76.95 309.21 70.15 311.97 66.82C314.97 63.21 322.35 63.68 323.36 67.55C324.14 70.53 325.2 70.67 343.31 70.26L362.43 69.83 362.93 64.56C363.23 61.4 362.61 58.78 361.38 58C360.25 57.28 350.19 56.69 339.03 56.67C314.14 56.64 313.6 56.29 313.6 40.11C313.6 24.17 313.73 24.1 343.56 24.1C365.78 24.1 368.11 24.36 370.95 27.2C375.22 31.47 375.02 37.43 370.56 38.62C364.47 40.25 362.03 39.69 361.19 36.45C360.41 33.48 359.35 33.32 342.79 33.74L325.23 34.17 325.23 39.6L325.23 45.03 347.24 45.8C360.91 46.28 369.93 47.26 371.05 48.38C373.81 51.14 375.6 63.44 374.33 70.87C373.5 75.74 372.17 78.04 369.36 79.46C364.08 82.14 322.01 82.13 316.73 79.46ZM391.1 79.64C391.1 78.64 397.86 65.74 406.13 50.96L421.15 24.1 428.21 24.16L435.28 24.22 450.44 50.8C458.78 65.43 465.26 78.3 464.83 79.42C464.39 80.56 461.66 81.45 458.59 81.45C453.92 81.45 452.58 80.57 449.23 75.25L445.31 69.05 427.71 69.05L410.11 69.05 406.01 75.25C402.53 80.51 401.09 81.45 396.5 81.45C393.41 81.45 391.1 80.67 391.1 79.64ZM486.76 80.49C486.15 79.88 485.65 66.94 485.65 51.74L485.65 24.1 492.62 24.1L499.6 24.1 499.6 34.95C499.6 40.92 499.97 45.8 500.41 45.8C500.86 45.8 507.72 40.92 515.66 34.95C529.61 24.46 530.39 24.1 538.97 24.1C543.87 24.1 547.45 24.73 546.96 25.51C546.49 26.28 539.16 31.86 530.68 37.91C522.21 43.97 514.9 49.52 514.45 50.25C514 50.98 522.29 57.73 532.89 65.24C543.48 72.75 551.79 79.47 551.36 80.17C550.92 80.88 546.85 81.45 542.3 81.45C534.72 81.45 533 80.71 521.85 72.72C515.15 67.92 508.01 62.69 505.98 61.1C503.95 59.5 501.71 58.2 501.01 58.2C500.31 58.2 499.53 63.26 499.28 69.44L498.82 80.68 493.34 81.14C490.33 81.39 487.37 81.1 486.76 80.49ZM574 79.51C570.26 77.56 570.09 76.79 569.08 57.38C567.98 36.26 569.26 26.61 573.37 25.03C576.85 23.7 624.04 23.92 626.08 25.29C631.26 28.74 633.27 41.63 628.9 43.31C627.55 43.83 624.46 44.25 622.02 44.25C618.16 44.25 617.53 43.61 617.11 39.21L616.62 34.17 599.58 34.17L582.53 34.17 582.53 52L582.53 69.83 599.58 69.83L616.62 69.83 617.12 63.86L617.61 57.89 623.3 58.96C626.44 59.55 629.53 60.36 630.18 60.76C632.55 62.23 631.33 73.38 628.39 77.02C625.54 80.54 624.53 80.69 601.65 81.1C584.47 81.4 576.8 80.96 574 79.51ZM660.36 80.49C659.75 79.88 659.25 66.94 659.25 51.74L659.25 24.1 665.48 24.1L671.72 24.1 671.3 52.39L670.88 80.68 666.17 81.14C663.58 81.39 660.97 81.1 660.36 80.49ZM190.85 64.11C191.51 56.16 188.42 54.89 169.83 55.43L154.72 55.88 154.25 63.29L153.78 70.7 172.08 70.26L190.38 69.83 190.85 64.11ZM268.65 57.19C268.65 55.28 257.65 36.5 256.53 36.5C255.17 36.5 245.4 54.02 245.4 56.46C245.4 57.59 249.46 58.2 257.02 58.2C263.42 58.2 268.65 57.74 268.65 57.19ZM439.15 57.45C439.15 54.77 428.86 36.56 427.57 36.97C426.02 37.45 416.03 54.7 415.94 57.04C415.92 57.68 421.13 58.2 427.53 58.2C433.92 58.2 439.15 57.86 439.15 57.45ZM189.52 45.12C190.54 43.89 191.15 40.93 190.87 38.53L190.38 34.17 172.16 33.74L153.95 33.3 153.95 39.29C153.95 42.59 154.41 45.75 154.98 46.32C155.55 46.88 163.14 47.35 171.84 47.35C183.73 47.35 188.13 46.79 189.52 45.12Z",
          "original": "#1D1D1B",
          "ci": "#174782"
        }
      ],
      "verein": {
        "width": 531,
        "height": 106,
        "formen": [
          {
            "d": "M47.86 103.51C45.03 103.1 33.37 101.28 21.95 99.47C3.09 96.49 1.13 95.98 0.61 94.01C0.28 92.8 0.01 73.72 0 51.61C-0.01 20.97 0.3 11.02 1.28 9.79C2.18 8.66 9.99 6.98 27.8 4.1L53.03 0L65.38 1.86C102.28 7.43 104.97 9.28 105.32 29.25C105.55 41.93 104.3 45.27 97.99 48.87L94.39 50.94L97.64 52.62C99.43 53.55 102.09 56.11 103.55 58.32C106.08 62.15 106.2 62.89 105.87 74.07C105.54 85.09 105.34 86.05 102.62 89.6C97.14 96.79 86.28 100.07 55.07 103.99C53.94 104.14 50.69 103.92 47.86 103.51ZM71.54 83.66C77.2 82.88 82.59 81.94 83.49 81.57C86.1 80.52 87.5 76.32 87.5 69.6C87.5 64.48 87.09 63 85.07 60.99L82.64 58.56L51.87 58.71L21.1 58.88L20.81 70.41L20.52 81.94L23.9 82.47C41.58 85.2 57.33 85.61 71.54 83.66ZM84.15 41.23C86.24 39.93 86.47 38.98 86.47 31.6C86.47 20.8 86.14 20.58 66.18 18.52C51.92 17.04 50 17.07 36.02 18.86L21.1 20.79L20.8 30.48C20.63 35.83 20.7 40.74 20.96 41.41C21.7 43.34 81.04 43.17 84.15 41.23Z",
            "mix": "#04471D",
            "ci": "#174782"
          },
          {
            "d": "M47.2 103.18C46.94 102.91 40.72 101.75 33.39 100.6C17.63 98.12 7.75 96.52 3.85 95.79L1.02 95.26V52.2V9.13L7.97 7.99C11.79 7.35 23.44 5.43 33.86 3.7C49.27 1.14 52.96 0.81 53.66 1.93C54.74 3.62 54.8 13.15 53.74 14.8C52.88 16.17 44.07 17.73 31.26 18.79C26.64 19.17 22.43 19.78 21.89 20.14C20.68 20.92 19.56 37.3 20.48 40.73C21.13 43.16 21.19 43.17 37.58 43.3L54.04 43.44L54.36 48.51C55.02 58.82 55.82 58.36 37.03 58.36H20.58V70.14C20.58 76.62 21 82.19 21.52 82.51C22.04 82.83 28.97 83.73 36.92 84.53C44.87 85.33 51.81 86.25 52.34 86.58C53.63 87.38 54.94 98.78 54.06 101.53C53.44 103.5 48.67 104.64 47.2 103.18Z",
            "mix": "#026E2E",
            "ci": "#68B9DF"
          },
          {
            "d": "M157.78 96.02H131.84Q130.98 96.02 130.49 95.53Q130 95.03 130 94.17V11.83Q130 10.97 130.49 10.47Q130.98 9.98 131.84 9.98H154.09Q167.49 9.98 175.04 16.01Q182.6 22.03 182.6 34.2Q182.6 45.5 175.6 51.03Q174.98 51.53 175.35 51.89Q184.32 58.78 184.32 71.8Q184.32 83.48 176.83 89.75Q169.33 96.02 157.78 96.02ZM153.11 30.51V42.8Q153.11 43.54 153.84 43.54H154.46Q159.99 43.54 159.99 36.65Q159.99 29.77 154.46 29.77H153.84Q153.11 29.77 153.11 30.51ZM161.22 68.36Q161.22 64.55 159.8 62.28Q158.39 60.01 156.06 60.01H153.84Q153.11 60.01 153.11 60.74V75.49Q153.11 76.23 153.84 76.23H155.93Q158.27 76.23 159.74 74.2Q161.22 72.17 161.22 68.36ZM227.71 94.3 226.36 85.08Q226.36 84.83 226.11 84.59Q225.87 84.34 225.5 84.34H214.68Q214.31 84.34 214.07 84.59Q213.82 84.83 213.82 85.08L212.59 94.3Q212.47 96.02 210.63 96.02H191.33Q189.36 96.02 189.73 94.05L207.18 11.58Q207.55 9.98 209.27 9.98H231.64Q233.36 9.98 233.73 11.58L251.18 94.05V94.54Q251.18 96.02 249.46 96.02H229.68Q227.83 96.02 227.71 94.3ZM217.14 66.64H222.92Q223.78 66.64 223.53 65.91L220.21 43.78Q220.09 43.29 219.84 43.29Q219.6 43.29 219.47 43.78L216.53 65.91Q216.53 66.64 217.14 66.64ZM257.21 73.89V70.08Q257.21 69.22 257.7 68.73Q258.19 68.24 259.05 68.24H278.22Q279.08 68.24 279.58 68.73Q280.07 69.22 280.07 70.08V72.79Q280.07 74.75 281.05 75.98Q282.03 77.21 283.51 77.21Q284.98 77.21 285.97 76.11Q286.95 75 286.95 73.28Q286.95 71.19 284.98 69.16Q283.02 67.13 276.75 62.71Q270.6 58.41 266.61 54.84Q262.61 51.28 259.66 45.87Q256.72 40.46 256.72 33.46Q256.72 26.21 259.97 20.68Q263.23 15.15 269.19 12.07Q275.15 9 282.89 9Q290.76 9 296.72 12.07Q302.68 15.15 305.94 20.68Q309.2 26.21 309.2 33.46V36.16Q309.2 37.02 308.7 37.51Q308.21 38.01 307.35 38.01H288.3Q287.44 38.01 286.95 37.51Q286.46 37.02 286.46 36.16V32.97Q286.46 31.12 285.47 29.96Q284.49 28.79 282.89 28.79Q281.3 28.79 280.37 30.02Q279.45 31.25 279.45 33.34Q279.45 35.79 281.42 38.07Q283.39 40.34 289.28 44.64Q297.15 50.42 301.15 53.98Q305.14 57.55 307.41 62.03Q309.69 66.52 309.69 72.54Q309.69 83.73 302.44 90.36Q295.18 97 283.39 97Q275.52 97 269.62 94.05Q263.72 91.1 260.46 85.88Q257.21 80.65 257.21 73.89ZM352.83 94.3 351.47 85.08Q351.47 84.83 351.23 84.59Q350.98 84.34 350.61 84.34H339.8Q339.43 84.34 339.18 84.59Q338.94 84.83 338.94 85.08L337.71 94.3Q337.59 96.02 335.74 96.02H316.45Q314.48 96.02 314.85 94.05L332.3 11.58Q332.67 9.98 334.39 9.98H356.76Q358.48 9.98 358.85 11.58L376.3 94.05V94.54Q376.3 96.02 374.58 96.02H354.79Q352.95 96.02 352.83 94.3ZM342.26 66.64H348.03Q348.89 66.64 348.65 65.91L345.33 43.78Q345.21 43.29 344.96 43.29Q344.72 43.29 344.59 43.78L341.64 65.91Q341.64 66.64 342.26 66.64ZM382.82 94.17V11.83Q382.82 10.97 383.31 10.47Q383.8 9.98 384.66 9.98H404.08Q404.94 9.98 405.43 10.47Q405.92 10.97 405.92 11.83V36.16Q405.92 36.65 406.23 36.72Q406.54 36.78 406.78 36.28L417.11 11.46Q417.72 9.98 419.32 9.98H439.6Q440.58 9.98 441.07 10.6Q441.56 11.21 441.07 12.2L423.74 48.45Q423.62 48.94 423.74 49.44L441.56 93.93Q441.69 94.3 441.69 94.79Q441.69 96.02 440.09 96.02H419.69Q418.09 96.02 417.47 94.54L408.01 69.35Q407.89 68.73 407.58 68.73Q407.27 68.73 407.03 69.35L406.04 71.8Q405.92 72.05 405.92 72.79V94.17Q405.92 95.03 405.43 95.53Q404.94 96.02 404.08 96.02H384.66Q383.8 96.02 383.31 95.53Q382.82 95.03 382.82 94.17ZM447.09 70.82V34.93Q447.09 23.01 454.41 16.01Q461.72 9 474.01 9Q486.18 9 493.55 16.01Q500.93 23.01 500.93 34.93V35.55Q500.93 36.41 500.44 36.96Q499.94 37.51 499.08 37.51L479.66 38.13Q477.82 38.13 477.82 36.41V33.34Q477.82 31.25 476.78 30.02Q475.73 28.79 474.01 28.79Q472.29 28.79 471.25 30.02Q470.2 31.25 470.2 33.34V72.79Q470.2 74.88 471.25 76.04Q472.29 77.21 474.01 77.21Q475.73 77.21 476.78 76.04Q477.82 74.88 477.82 72.79V69.47Q477.82 67.75 479.66 67.75L499.08 68.36Q499.94 68.36 500.44 68.92Q500.93 69.47 500.93 70.33V70.82Q500.93 78.69 497.55 84.65Q494.17 90.61 488.08 93.8Q482 97 474.01 97Q461.84 97 454.47 89.87Q447.09 82.74 447.09 70.82ZM507.81 94.17V11.83Q507.81 10.97 508.3 10.47Q508.79 9.98 509.65 9.98H529.07Q529.93 9.98 530.42 10.47Q530.92 10.97 530.92 11.83V94.17Q530.92 95.03 530.42 95.53Q529.93 96.02 529.07 96.02H509.65Q508.79 96.02 508.3 95.53Q507.81 95.03 507.81 94.17Z",
            "mix": "#174782",
            "ci": "#174782"
          }
        ]
      },
      "hash": {
        "ci": "a1e16ec82808eb27c3ca55b4582f9a799dffaadaa722b67bdc358be9fc51d258",
        "mix": "a07b00076220c77ffd79d6f1fe80c3e798e225c320a51f16659795a5364b37b6",
        "original": "d1045cb83e934898961135f237dcd76ef2d841b9744aaa5085d315da32d83215",
        "alt": "a14a938e98b9acddf371ee6cc8bcf4cebc03f684ca429e76c217f8f6ec6dc25b"
      }
    },
    "keil": {
      "width": 600,
      "height": 175,
      "formen": [
        {
          "d": "M0 71.5L300 0 600 71.5V89.4L300 18.8 0 89.4Z",
          "original": "#101416",
          "ci": "#3078AE"
        },
        {
          "d": "M379 9H425V65.5H379ZM109 71H154V114L197 71H251L200 123 252 175H193L154 136V175H109ZM258 71H366V99H303V109H366V136H303V147H366V175H258ZM379 71H425V175H379ZM441.5 71H487V147H546V175H441.5Z",
          "original": "#E4302B",
          "ci": "#174782"
        }
      ],
      "verein": {
        "width": 276,
        "height": 108,
        "formen": [
          {
            "d": "M0 32.89 138 0 276 32.89V41.12L138 8.65L0 41.12V32.89Z",
            "mix": "#101416",
            "ci": "#3078AE"
          },
          {
            "d": "M174.34 4.14H195.5V30.13H174.34V4.14Z",
            "mix": "#E4302B",
            "ci": "#174782"
          },
          {
            "d": "M50.83 106.46V37.54Q50.83 36.82 51.24 36.41Q51.65 36 52.37 36H68.62Q69.34 36 69.75 36.41Q70.17 36.82 70.17 37.54V57.91Q70.17 58.32 70.42 58.37Q70.68 58.42 70.89 58.01L79.53 37.23Q80.04 36 81.38 36H98.35Q99.17 36 99.58 36.51Q99.99 37.03 99.58 37.85L85.08 68.19Q84.98 68.61 85.08 69.02L99.99 106.25Q100.1 106.56 100.1 106.97Q100.1 108 98.76 108H81.69Q80.35 108 79.83 106.77L71.91 85.68Q71.81 85.17 71.55 85.17Q71.3 85.17 71.09 85.68L70.27 87.74Q70.17 87.94 70.17 88.56V106.46Q70.17 107.18 69.75 107.59Q69.34 108 68.62 108H52.37Q51.65 108 51.24 107.59Q50.83 107.18 50.83 106.46ZM146.69 52.56H127.05Q126.43 52.56 126.43 53.18V63.05Q126.43 63.67 127.05 63.67H137.23Q137.95 63.67 138.36 64.08Q138.77 64.49 138.77 65.21V78.69Q138.77 79.41 138.36 79.82Q137.95 80.23 137.23 80.23H127.05Q126.43 80.23 126.43 80.85V90.82Q126.43 91.44 127.05 91.44H146.69Q147.41 91.44 147.82 91.85Q148.23 92.26 148.23 92.98V106.46Q148.23 107.18 147.82 107.59Q147.41 108 146.69 108H108.63Q107.91 108 107.5 107.59Q107.09 107.18 107.09 106.46V37.54Q107.09 36.82 107.5 36.41Q107.91 36 108.63 36H146.69Q147.41 36 147.82 36.41Q148.23 36.82 148.23 37.54V51.02Q148.23 51.74 147.82 52.15Q147.41 52.56 146.69 52.56ZM155.85 106.46V37.54Q155.85 36.82 156.26 36.41Q156.67 36 157.39 36H173.64Q174.36 36 174.77 36.41Q175.18 36.82 175.18 37.54V106.46Q175.18 107.18 174.77 107.59Q174.36 108 173.64 108H157.39Q156.67 108 156.26 107.59Q155.85 107.18 155.85 106.46ZM183.62 106.46V37.54Q183.62 36.82 184.03 36.41Q184.44 36 185.16 36H201.41Q202.13 36 202.54 36.41Q202.95 36.82 202.95 37.54V90.82Q202.95 91.44 203.57 91.44H223.63Q224.35 91.44 224.76 91.85Q225.17 92.26 225.17 92.98V106.46Q225.17 107.18 224.76 107.59Q224.35 108 223.63 108H185.16Q184.44 108 184.03 107.59Q183.62 107.18 183.62 106.46Z",
            "mix": "#174782",
            "ci": "#174782"
          }
        ]
      },
      "hash": {
        "ci": "fc51d76275446644fe143962d565e3237087fa30b7e1c0477fee936513d449e0",
        "mix": "a2b2c6f9e9ebd2c2dc8894bab2eb7ef38ebacb0e7a778684d3770d01a1a76f25",
        "original": "969dbbb0c877f089bdf65cf259f134ebc5932ad73869bf69eaecfb1fc739753b",
        "alt": "162dc8fb7c03447e315f48999c1207a51a1513d6ee2c9451765574ca92d3628b"
      }
    },
    "fierek": {
      "width": 1422,
      "height": 230,
      "formen": [
        {
          "d": "M52.14 0H427.42L0 228.76Z",
          "original": "#76B729",
          "ci": "#EDBB26"
        },
        {
          "d": "M637.42 127.03 C617.19 120.69 614.85 93.53 633.4 80.59 C639.43 76.39 649.75 73.71 665.18 72.35 C685.69 70.55 686.18 70.32 686.18 62.29 C686.18 51.37 666.13 49.24 661.2 59.63 C659.1 64.07 657.51 64.61 646.38 64.61 C632.59 64.61 631.93 64.05 636.15 55.93 C643.35 42.02 655.11 36.4 677.02 36.4 C705.05 36.4 715.97 48.12 710.33 72.15 C709.6 75.27 707.78 82.92 706.29 89.18 C704.8 95.44 702.5 105.86 701.19 112.35 C699.87 118.84 698.59 124.47 698.35 124.86 C698.1 125.25 693.1 125.58 687.22 125.58 C676.2 125.58 674.35 125.03 674.35 121.76 C674.35 119.42 671.63 119.7 667.93 122.42 C660.97 127.56 646.24 129.78 637.42 127.03Z M1087.03 127.72 C1063.64 122.85 1052.87 108.62 1054.02 84.09 C1054.95 64.32 1064.91 48.74 1081.8 40.67 L1089.76 36.86 1102.05 36.86 C1122.87 36.86 1134.84 44.46 1140.57 61.36 C1142.79 67.9 1142.75 85.15 1140.5 86.29 C1139.62 86.73 1125.83 87.18 1109.84 87.28 C1093.86 87.38 1080.45 87.67 1080.04 87.92 C1079.64 88.17 1079.3 90.51 1079.3 93.12 C1079.3 109.36 1100.5 113.79 1113.48 100.25 L1117.46 96.11 1124.08 98.19 C1138.72 102.78 1138.31 102.44 1135.6 107.87 C1133.04 112.99 1124.07 121.16 1118.09 123.81 C1109.97 127.39 1094.72 129.32 1087.03 127.72Z M1246.29 126.95 C1238.53 124.84 1233.91 122.29 1228.83 117.32 C1206.03 94.95 1216.83 51.54 1248.32 39 C1257.37 35.4 1276.05 35.85 1284.36 39.87 C1298.99 46.95 1305.89 58.9 1305.89 77.19 C1305.89 88.07 1308.3 87.31 1273.54 87.28 C1257.3 87.27 1243.55 87.54 1242.98 87.89 C1241.31 88.93 1242.7 98.04 1245.07 101.49 C1251.59 111.01 1268.67 110.32 1276.67 100.22 C1280.09 95.9 1280.47 95.83 1287.49 98.26 C1298.88 102.2 1299.98 102.7 1300.27 104.09 C1301.01 107.76 1288.7 120.78 1281.57 123.84 C1271.95 127.98 1255.42 129.44 1246.29 126.95Z M736.89 125.5 C728.59 123.54 722.73 117.9 720.89 110.1 C719.68 104.93 720.27 99.82 723.89 84.17 C725.69 76.39 729.55 58.97 731.23 50.96 C733.74 39.1 733.05 39.63 746.52 39.33 C756.53 39.11 758.18 39.28 758.67 40.56 C759.16 41.82 757.89 48.97 754.46 64.16 C754.01 66.16 752.96 70.87 752.13 74.62 C751.29 78.37 750.03 83.72 749.33 86.51 C744.81 104.46 754.63 112.43 768.18 101.81 C772.98 98.05 775.1 91.41 782.2 57.79 C784 49.28 785.8 41.71 786.2 40.95 C787.25 38.98 809.17 38.47 810.75 40.38 C811.78 41.61 810.85 46.77 805.39 70.07 C804.97 71.82 802.95 81.04 800.89 90.55 C796.71 109.76 796.21 111.83 793.84 119.67 L792.19 125.12 780.37 125.12 L768.54 125.12 768.25 121.71 C767.93 117.72 767.15 117.53 763.24 120.49 C756.82 125.36 745.47 127.52 736.89 125.5Z M511.93 124.7 C511.61 124.18 511.59 123.38 511.88 122.91 C512.17 122.44 512.76 120.29 513.2 118.14 C513.64 115.97 514.82 110.93 515.81 106.92 C517.67 99.44 518.99 93.59 522.35 77.81 C523.42 72.8 524.66 67.27 525.12 65.52 C526.97 58.46 532.28 34.63 533.34 28.67 C533.96 25.16 535.03 20.54 535.7 18.4 C536.38 16.25 536.94 13.51 536.94 12.32 C536.94 7.14 537.05 7.13 571.42 7.48 C608.3 7.85 609.37 8.07 618.85 17.24 C633.51 31.4 631.23 61.81 614.49 75.26 C603.34 84.22 594.38 86.44 569.37 86.47 C559.79 86.47 551.52 86.78 550.98 87.15 C549.62 88.08 548.82 90.44 547.38 97.83 C544.98 110.05 542.52 119.95 541.14 122.85 C540.06 125.11 539.97 125.12 526.28 125.38 C517.58 125.53 512.3 125.28 511.93 124.7Z M812.11 124.3 C811.63 123.03 812.63 117.59 815.87 103.74 C816.64 100.48 817.63 95.49 818.08 92.63 C818.52 89.76 819.13 87.03 819.43 86.55 C819.73 86.08 820.41 83.5 820.96 80.84 C821.51 78.17 822.29 74.55 822.69 72.8 C823.1 71.05 824.27 65.52 825.31 60.52 C827.91 47.87 829.46 40.84 831.62 31.85 C832.64 27.59 834.19 20.84 835.07 16.84 C837.27 6.79 836.49 7.28 850.12 7.28 C863.45 7.28 863.81 7.49 861.97 14.01 C860.91 17.82 856.45 37.17 853.99 48.69 C852.62 55.08 851.24 61.19 848.58 72.57 C846.15 82.95 845.56 85.66 843.55 95.55 C842.48 100.81 840.5 109.61 839.15 115.12 L836.7 125.12 824.66 125.38 C814.74 125.59 812.54 125.4 812.11 124.3Z M905.03 124.65 C904.69 124.11 905.44 119.49 906.71 114.39 C909.32 103.79 913.64 84.86 915.9 74.17 C916.75 70.16 918.44 62.99 919.66 58.24 C920.89 53.48 922.69 45.71 923.66 40.95 C924.64 36.19 926.32 28.42 927.4 23.66 C928.49 18.9 929.57 13.7 929.81 12.09 C930.55 7.13 929.52 7.24 974.3 7.5 L1016.06 7.74 1015.97 10.01 C1015.85 13.75 1013.7 23.95 1012.52 26.39 L1011.43 28.67 984.04 28.9 C963.61 29.08 956.43 29.43 955.79 30.27 C954.52 31.91 950.75 50.14 951.13 52.79 L951.44 55.05 976.9 55.3 C991.43 55.44 1002.71 55.91 1003.21 56.4 C1003.76 56.96 1003.54 59.2 1002.61 62.54 C1001.81 65.43 1000.62 70.04 999.96 72.8 L998.75 77.81 972.18 78.26 C956.32 78.53 945.25 79.08 944.71 79.62 C944.21 80.13 942.54 86.48 940.99 93.73 C937.93 108.1 936.05 115.84 934.25 121.48 L933.08 125.12 919.35 125.38 C910.29 125.54 905.42 125.3 905.03 124.65Z M1004.07 122.17 C1004.6 118.48 1005.54 113.92 1007.68 104.65 C1008.44 101.39 1010.15 93.62 1011.5 87.36 C1012.83 81.1 1014.46 73.94 1015.12 71.44 C1015.77 68.93 1017.64 61.15 1019.26 54.15 C1020.88 47.14 1022.63 40.88 1023.13 40.24 C1023.82 39.38 1027.05 39.15 1035.53 39.33 L1046.99 39.59 1047.3 42.18 C1047.46 43.61 1046.55 48.93 1045.28 54.01 C1041.87 67.72 1038.18 84.45 1037.39 89.81 C1037.01 92.41 1036.38 95.06 1035.98 95.7 C1035.59 96.33 1034.96 98.5 1034.58 100.52 C1033.4 106.87 1029.31 123.82 1028.76 124.72 C1028.47 125.2 1022.69 125.58 1015.91 125.58 L1003.58 125.58 1004.07 122.17Z M1148.77 124.18 C1148.48 123.41 1148.65 120.84 1149.15 118.49 C1149.66 116.13 1150.95 110.11 1152.02 105.11 C1153.93 96.14 1155.45 89.46 1158.01 78.72 C1162.35 60.55 1163.93 53.5 1164.86 48.23 C1166.42 39.37 1166.8 39.13 1179.43 39.13 C1191.38 39.13 1192.75 39.73 1191.69 44.55 C1190.9 48.15 1191.64 48.07 1198.71 43.77 C1205.3 39.77 1209.94 38.23 1215.51 38.23 C1220.24 38.22 1221.07 40.04 1219.13 46.2 C1218.38 48.57 1217.5 52.14 1217.16 54.15 C1216.33 59.16 1214.46 60.97 1210.11 60.97 C1193 60.97 1185.22 70.19 1179.85 96.92 C1177.33 109.41 1173.79 123.25 1172.83 124.44 C1171.33 126.27 1149.49 126.03 1148.77 124.18Z M1310.89 124.65 C1310.57 124.14 1310.73 122.4 1311.25 120.78 C1311.77 119.16 1313.66 111.09 1315.45 102.83 C1318.66 88 1320.58 79.44 1322.28 72.34 C1322.76 70.34 1323.98 65.02 1325 60.52 C1327.64 48.81 1328.33 45.78 1329.86 39.13 C1330.61 35.87 1332.32 28.3 1333.66 22.3 C1337.37 5.67 1335.67 7.28 1349.58 7.28 C1358.24 7.28 1361.57 7.59 1361.89 8.42 C1362.29 9.48 1361.29 14.64 1358.14 27.76 C1357.41 30.76 1356.18 36.29 1355.38 40.04 C1354.58 43.79 1353.36 49.52 1352.66 52.78 C1350.4 63.33 1350.23 64.61 1351.09 64.61 C1351.55 64.61 1358.24 59.24 1365.96 52.69 C1382.75 38.4 1381.06 39.13 1397.64 39.15 C1417.29 39.17 1417.29 38.64 1397.71 54.56 C1376.52 71.8 1376.25 72.14 1379.23 77.81 C1380.02 79.31 1383.46 87.09 1386.88 95.09 C1390.29 103.1 1394.35 112.41 1395.9 115.78 C1400.54 125.88 1400.84 125.58 1386.2 125.56 C1379.32 125.56 1373.23 125.25 1372.68 124.88 C1372.13 124.52 1369.11 118.07 1365.97 110.56 C1362.82 103.06 1359.49 95.13 1358.55 92.95 C1356.54 88.23 1356.32 88.27 1348.2 94.79 C1341.49 100.15 1341.54 100.04 1337.83 118.21 C1337.28 120.91 1336.37 123.68 1335.8 124.35 C1334.56 125.86 1311.81 126.14 1310.89 124.65Z M665.71 107.94 C674.86 103.6 683.61 89.02 678.29 86.97 C673.5 85.14 656.07 89.59 651.18 93.89 C640.44 103.34 651.94 114.46 665.71 107.94Z M1118.42 69.62 C1122.61 64.58 1112.26 54.57 1102.9 54.62 C1093.97 54.66 1081.27 65.17 1084.27 70.02 C1085.29 71.66 1117.04 71.3 1118.42 69.62Z M1280.47 70.03 C1282.75 68.82 1282.7 66.05 1280.35 62.23 C1276.46 55.94 1268.74 53.25 1260.74 55.41 C1253.67 57.32 1244.28 67.95 1247.73 70.14 C1249.54 71.28 1278.31 71.2 1280.47 70.03Z M585.55 63.65 C600 58.24 603.65 37.67 591.45 30.48 C587.49 28.16 565.28 27.17 563.65 29.27 C563.12 29.94 561.57 35.6 560.21 41.86 C558.84 48.12 557.22 55.28 556.61 57.79 C554.68 65.67 554.46 65.52 568.37 65.52 C578.44 65.52 581.42 65.19 585.55 63.65Z M1027.13 26.69 C1026.14 25.71 1026.49 21.81 1028.24 14.56 L1029.88 7.74 1041.5 7.48 C1048.58 7.33 1053.56 7.59 1054.25 8.17 C1055.49 9.19 1052.73 23.84 1050.87 26.16 C1049.9 27.38 1028.29 27.86 1027.13 26.69Z",
          "original": "#131820",
          "ci": "#174782"
        },
        {
          "d": "M934.72 223.79 C927.72 222.56 922.89 220.16 918.45 215.69 C911.5 208.71 912.3 205.25 921.11 204.21 C926.12 203.62 926.33 203.69 929.51 206.87 C936.84 214.2 953.67 215.11 959.55 208.51 C963.57 204 959.08 201.21 941.89 197.52 C923.41 193.55 916.99 182.48 925.69 169.59 C933.65 157.78 969.58 158.52 978.85 170.68 C983.09 176.25 981.94 177.86 972.97 178.87 C968.13 179.42 967.29 179.26 965.4 177.48 C958.52 170.99 941.94 170.29 938.81 176.36 C936.27 181.25 938.1 182.46 954.17 186.5 C970.84 190.68 976.47 195.04 976.47 203.77 C976.47 218.99 957.96 227.87 934.72 223.79Z M1114.81 223.31 C1099.45 219.18 1091.65 207.85 1093.41 192.24 C1096.32 166.5 1120.12 154.47 1150.26 163.52 C1168.65 169.03 1173.34 196.71 1158.64 213.06 C1149.73 222.97 1130.38 227.49 1114.81 223.31Z M572.48 221.65 C571.7 220.7 571.66 219.41 572.33 216.87 C573.39 212.86 575.86 202.32 576.98 197.02 C577.4 195.01 578.36 190.71 579.13 187.46 C582.17 174.41 582.6 175.17 571.52 174.4 C561.73 173.73 560.24 172.8 561.56 168.2 C563.13 162.69 561.98 162.89 592.5 162.89 C622.89 162.89 622.06 162.74 621.14 168.18 C620.19 173.87 619.98 173.97 608.84 174.5 L598.62 174.98 597.25 178.27 C596.49 180.07 594.7 187.28 593.27 194.28 C589.29 213.71 587.31 221.28 585.95 222.14 C583.84 223.47 573.69 223.1 572.48 221.65Z M634.8 221.72 C633.87 221.05 633.42 220.02 633.77 219.45 C634.13 218.86 634.75 216.45 635.15 214.08 C635.78 210.23 637.48 202.83 644.45 173.36 C647.14 161.93 644.67 162.89 671.45 162.89 C693.22 162.89 694.96 163.01 698.66 164.8 C710.82 170.69 707.4 191.13 693.33 196.61 C688 198.68 688.01 199.89 693.47 211.05 C699.17 222.71 699.11 222.95 690.25 222.95 C681.01 222.95 680.73 222.72 675.74 211.18 C670.21 198.38 670.99 198.98 660.05 199.18 L654.4 199.29 653.44 202.7 C652.9 204.58 651.73 209.39 650.81 213.4 C649.48 219.26 648.72 220.89 646.97 221.8 C644.05 223.3 636.89 223.25 634.8 221.72Z M722.81 222.35 C720.73 221.51 721.62 219.36 727.38 211.34 C730.52 206.96 733.79 202.37 734.65 201.11 C742.21 190.11 745.11 186 752.97 175.23 L761.98 162.89 769.56 162.89 C776.42 162.89 777.26 163.08 778.48 164.94 C779.62 166.68 787.55 195.72 789.97 207.03 C790.4 209.03 791.18 212.09 791.7 213.84 C793.98 221.48 792.92 222.95 785.23 222.95 C779.09 222.95 777.38 221.82 776.16 216.99 C774.83 211.69 775.69 211.97 760.13 211.95 C745.71 211.93 743.86 212.23 743.08 214.68 C742.81 215.53 741.2 217.75 739.52 219.59 C736.52 222.86 736.27 222.95 730.2 222.88 C726.76 222.84 723.44 222.6 722.81 222.35Z M816.92 222.34 C815.87 221.3 816.24 218.26 818.58 208.39 C819.82 203.13 822.53 191.66 824.57 182.91 C829.69 161.12 828.64 162.89 836.37 162.89 C845.19 162.89 844.74 162.46 857.25 182.44 C870.67 203.88 870.99 204.16 872.81 195.95 C880.12 162.87 879.85 163.54 886.36 162.74 C895.52 161.62 895.78 162.39 891.94 178.62 C886.93 199.77 883.82 213.41 883.25 216.78 C882.39 221.75 880.73 222.95 874.71 222.94 C865.72 222.91 867 224.26 849.66 196.56 C843.78 187.17 840.99 183.65 839.94 184.29 C839.19 184.76 837.67 190.44 833.52 208.39 C831.83 215.66 830.09 221.14 829.23 221.81 C827.74 223 817.98 223.41 816.92 222.34Z M1004.7 222.07 C1003.52 221.33 1003.62 220.13 1005.42 212.76 C1006.55 208.1 1008.49 199.79 1009.73 194.28 C1010.97 188.78 1012.58 181.61 1013.32 178.36 C1014.04 175.11 1015.16 170.4 1015.8 167.9 L1016.97 163.34 1036.53 162.89 C1066.81 162.19 1072.4 164.66 1072.42 178.81 C1072.45 194.19 1063.3 200.19 1039.75 200.21 C1023.83 200.23 1024.02 200.11 1021.08 211.95 C1019.28 219.21 1018.31 221.59 1016.94 222.12 C1014.39 223.11 1006.3 223.09 1004.7 222.07Z M1190.53 221.84 C1189.82 220.98 1189.87 219.14 1190.74 215.21 C1191.39 212.2 1192.81 205.66 1193.91 200.66 C1199.47 174.97 1201.49 166.8 1202.69 164.94 C1204.01 162.91 1204.18 162.89 1226.51 162.9 C1257.7 162.9 1260.5 164.05 1261.15 177.02 C1261.67 187.27 1255.99 195.3 1246.95 197.11 C1243.11 197.88 1243.19 198.48 1248.6 209.92 C1254.51 222.42 1254.51 222.43 1245.23 222.76 C1236.44 223.07 1235.72 222.49 1231.62 211.76 C1230.24 208.15 1228.32 203.86 1227.36 202.21 L1225.59 199.23 1217.84 199.48 L1210.09 199.75 1208.33 206.12 C1207.36 209.62 1206.14 214.12 1205.64 216.12 C1204.06 222.29 1203.84 222.47 1197.42 222.76 C1193.4 222.94 1191.2 222.65 1190.53 221.84Z M1295.27 221.81 C1294.21 220.12 1295.47 213.53 1302.34 184.93 C1304.79 174.77 1304.99 175.02 1294.11 174.28 C1289.39 173.96 1285.2 173.5 1284.79 173.25 C1283.78 172.63 1283.86 168.06 1284.94 165.23 L1285.82 162.89 1314.45 162.89 C1346.65 162.89 1345.54 162.63 1343.19 169.73 C1341.91 173.62 1339.66 174.93 1334.7 174.67 C1325.57 174.2 1321.44 174.69 1320.55 176.36 C1319.76 177.82 1313.55 203.44 1311.12 215.22 C1309.74 221.93 1308.49 222.95 1301.7 222.95 C1298.12 222.95 1295.73 222.52 1295.27 221.81Z M1139.64 210.63 C1149.7 205.7 1154.41 189.84 1148.76 179.96 C1141.78 167.75 1118.52 170.3 1112.06 183.98 C1109.11 190.22 1108.88 200.02 1111.54 204.97 C1115.67 212.65 1129.75 215.48 1139.64 210.63Z M771.17 198.61 C771.71 196.87 768.79 182.41 767.69 181.31 C766.43 180.06 755.34 195.49 755.34 198.48 C755.34 200.99 770.41 201.11 771.17 198.61Z M1050.98 188.27 C1056.32 186.4 1058.12 179.84 1054.32 176.04 C1052.21 173.93 1051.51 173.81 1041.69 173.81 C1029.71 173.81 1029.91 173.69 1028.23 181.83 C1027.21 186.77 1027.23 187.69 1028.38 188.41 C1030.24 189.6 1047.5 189.49 1050.98 188.27Z M688.14 184.59 C690.55 181.46 690.27 177.93 687.43 175.69 C685.28 174.01 683.79 173.81 673.34 173.81 C659.85 173.81 659.5 174.02 658.37 182.66 L657.74 187.4 668.55 187.66 C682.07 187.98 686.01 187.36 688.14 184.59Z M1243.42 185.23 C1246.13 182.72 1246.59 178.85 1244.54 176.03 C1242.57 173.33 1218.81 172.8 1216.46 175.4 C1214.89 177.13 1212.84 185.45 1213.65 186.76 C1213.89 187.15 1220.15 187.46 1227.55 187.46 C1240.58 187.46 1241.09 187.39 1243.42 185.23Z",
          "original": "#194678",
          "ci": "#3078AE"
        }
      ],
      "verein": {
        "width": 632,
        "height": 105,
        "formen": [
          {
            "d": "M18.3 11H150L0 91.28L18.3 11Z",
            "mix": "#76B729",
            "ci": "#3078AE"
          },
          {
            "d": "M220.74 21.61Q220.74 27.76 218.39 32.46Q216.03 37.17 211.81 39.71Q207.58 42.26 202.01 42.26H196.63Q196.06 42.26 196.06 42.84V65.79Q196.06 66.46 195.67 66.85Q195.29 67.23 194.62 67.23H179.44Q178.77 67.23 178.38 66.85Q178 66.46 178 65.79V1.44Q178 0.77 178.38 0.38Q178.77 0 179.44 0H201.05Q206.81 0 211.28 2.74Q215.75 5.47 218.24 10.37Q220.74 15.27 220.74 21.61ZM202.68 21.99Q202.68 18.82 201.39 17.14Q200.09 15.46 197.88 15.46H196.63Q196.06 15.46 196.06 16.04V27.76Q196.06 28.33 196.63 28.33H197.88Q200.09 28.33 201.39 26.75Q202.68 25.16 202.68 21.99ZM253.59 65.89 252.53 58.68Q252.53 58.49 252.34 58.3Q252.15 58.11 251.86 58.11H243.41Q243.12 58.11 242.93 58.3Q242.73 58.49 242.73 58.68L241.77 65.89Q241.68 67.23 240.24 67.23H225.16Q223.62 67.23 223.91 65.69L237.55 1.25Q237.84 0 239.18 0H256.66Q258.01 0 258.29 1.25L271.93 65.69V66.08Q271.93 67.23 270.59 67.23H255.12Q253.68 67.23 253.59 65.89ZM245.33 44.28H249.84Q250.51 44.28 250.32 43.7L247.73 26.41Q247.63 26.03 247.44 26.03Q247.25 26.03 247.15 26.41L244.85 43.7Q244.85 44.28 245.33 44.28ZM276.16 47.25V1.44Q276.16 0.77 276.54 0.38Q276.93 0 277.6 0H292.77Q293.45 0 293.83 0.38Q294.21 0.77 294.21 1.44V48.98Q294.21 50.62 294.98 51.58Q295.75 52.54 297 52.54Q298.25 52.54 298.97 51.58Q299.69 50.62 299.69 48.98V1.44Q299.69 0.77 300.07 0.38Q300.46 0 301.13 0H316.31Q316.98 0 317.36 0.38Q317.75 0.77 317.75 1.44V47.25Q317.75 53.4 315.15 58.11Q312.56 62.81 307.85 65.41Q303.15 68 297 68Q290.76 68 286.05 65.41Q281.34 62.81 278.75 58.11Q276.16 53.4 276.16 47.25ZM323.03 65.79V1.44Q323.03 0.77 323.41 0.38Q323.8 0 324.47 0H339.64Q340.32 0 340.7 0.38Q341.08 0.77 341.08 1.44V51.19Q341.08 51.77 341.66 51.77H360.39Q361.06 51.77 361.45 52.15Q361.83 52.54 361.83 53.21V65.79Q361.83 66.46 361.45 66.85Q361.06 67.23 360.39 67.23H324.47Q323.8 67.23 323.41 66.85Q323.03 66.46 323.03 65.79ZM423.01 15.46H404.67Q404.09 15.46 404.09 16.04V25.26Q404.09 25.84 404.67 25.84H414.18Q414.85 25.84 415.23 26.22Q415.62 26.6 415.62 27.28V39.86Q415.62 40.53 415.23 40.92Q414.85 41.3 414.18 41.3H404.67Q404.09 41.3 404.09 41.88V65.79Q404.09 66.46 403.71 66.85Q403.32 67.23 402.65 67.23H387.47Q386.8 67.23 386.42 66.85Q386.03 66.46 386.03 65.79V1.44Q386.03 0.77 386.42 0.38Q386.8 0 387.47 0H423.01Q423.68 0 424.07 0.38Q424.45 0.77 424.45 1.44V14.02Q424.45 14.69 424.07 15.08Q423.68 15.46 423.01 15.46ZM428.01 65.79V1.44Q428.01 0.77 428.39 0.38Q428.77 0 429.45 0H444.62Q445.29 0 445.68 0.38Q446.06 0.77 446.06 1.44V65.79Q446.06 66.46 445.68 66.85Q445.29 67.23 444.62 67.23H429.45Q428.77 67.23 428.39 66.85Q428.01 66.46 428.01 65.79ZM488.51 15.46H470.17Q469.59 15.46 469.59 16.04V25.26Q469.59 25.84 470.17 25.84H479.68Q480.35 25.84 480.73 26.22Q481.12 26.6 481.12 27.28V39.86Q481.12 40.53 480.73 40.92Q480.35 41.3 479.68 41.3H470.17Q469.59 41.3 469.59 41.88V51.19Q469.59 51.77 470.17 51.77H488.51Q489.19 51.77 489.57 52.15Q489.95 52.54 489.95 53.21V65.79Q489.95 66.46 489.57 66.85Q489.19 67.23 488.51 67.23H452.98Q452.31 67.23 451.92 66.85Q451.54 66.46 451.54 65.79V1.44Q451.54 0.77 451.92 0.38Q452.31 0 452.98 0H488.51Q489.19 0 489.57 0.38Q489.95 0.77 489.95 1.44V14.02Q489.95 14.69 489.57 15.08Q489.19 15.46 488.51 15.46ZM519.34 65.98 513.49 41.88Q513.29 41.4 513.1 41.4Q512.72 41.4 512.72 41.97V65.79Q512.72 66.46 512.33 66.85Q511.95 67.23 511.28 67.23H496.1Q495.43 67.23 495.05 66.85Q494.66 66.46 494.66 65.79V1.44Q494.66 0.77 495.05 0.38Q495.43 0 496.1 0H517.71Q523.47 0 527.94 2.74Q532.41 5.47 534.9 10.32Q537.4 15.18 537.4 21.42Q537.4 26.7 535.58 30.88Q533.75 35.06 530.29 37.65Q529.91 37.94 530.01 38.42L537.79 65.6Q537.88 65.79 537.88 66.08Q537.88 67.23 536.54 67.23H520.88Q519.63 67.23 519.34 65.98ZM513.29 15.46Q512.72 15.46 512.72 16.04V27.08Q512.72 27.66 513.29 27.66H514.54Q516.66 27.66 518 26.08Q519.34 24.49 519.34 21.61Q519.34 18.63 518.05 17.05Q516.75 15.46 514.54 15.46ZM579.18 15.46H560.84Q560.26 15.46 560.26 16.04V25.26Q560.26 25.84 560.84 25.84H570.34Q571.02 25.84 571.4 26.22Q571.79 26.6 571.79 27.28V39.86Q571.79 40.53 571.4 40.92Q571.02 41.3 570.34 41.3H560.84Q560.26 41.3 560.26 41.88V51.19Q560.26 51.77 560.84 51.77H579.18Q579.85 51.77 580.24 52.15Q580.62 52.54 580.62 53.21V65.79Q580.62 66.46 580.24 66.85Q579.85 67.23 579.18 67.23H543.64Q542.97 67.23 542.59 66.85Q542.2 66.46 542.2 65.79V1.44Q542.2 0.77 542.59 0.38Q542.97 0 543.64 0H579.18Q579.85 0 580.24 0.38Q580.62 0.77 580.62 1.44V14.02Q580.62 14.69 580.24 15.08Q579.85 15.46 579.18 15.46ZM585.33 65.79V1.44Q585.33 0.77 585.71 0.38Q586.1 0 586.77 0H601.94Q602.62 0 603 0.38Q603.38 0.77 603.38 1.44V20.46Q603.38 20.84 603.62 20.89Q603.86 20.94 604.06 20.55L612.12 1.15Q612.6 0 613.85 0H629.7Q630.47 0 630.85 0.48Q631.24 0.96 630.85 1.73L617.31 30.06Q617.21 30.45 617.31 30.83L631.24 65.6Q631.33 65.89 631.33 66.27Q631.33 67.23 630.08 67.23H614.14Q612.89 67.23 612.41 66.08L605.02 46.39Q604.92 45.91 604.68 45.91Q604.44 45.91 604.25 46.39L603.48 48.31Q603.38 48.5 603.38 49.08V65.79Q603.38 66.46 603 66.85Q602.62 67.23 601.94 67.23H586.77Q586.1 67.23 585.71 66.85Q585.33 66.46 585.33 65.79Z",
            "mix": "#174782",
            "ci": "#174782"
          },
          {
            "d": "M194.81 79.84V84.59Q194.81 84.85 194.67 84.99Q194.52 85.14 194.27 85.14H189.98Q189.77 85.14 189.77 85.35V104.16Q189.77 104.42 189.62 104.56Q189.47 104.71 189.22 104.71H183.48Q183.23 104.71 183.08 104.56Q182.94 104.42 182.94 104.16V85.35Q182.94 85.14 182.72 85.14H178.54Q178.29 85.14 178.15 84.99Q178 84.85 178 84.59V79.84Q178 79.58 178.15 79.44Q178.29 79.29 178.54 79.29H194.27Q194.52 79.29 194.67 79.44Q194.81 79.58 194.81 79.84ZM209.92 104.24 207.7 95.12Q207.63 94.94 207.56 94.94Q207.41 94.94 207.41 95.16V104.16Q207.41 104.42 207.27 104.56Q207.12 104.71 206.87 104.71H201.13Q200.88 104.71 200.73 104.56Q200.59 104.42 200.59 104.16V79.84Q200.59 79.58 200.73 79.44Q200.88 79.29 201.13 79.29H209.3Q211.48 79.29 213.17 80.33Q214.86 81.36 215.8 83.19Q216.75 85.03 216.75 87.39Q216.75 89.39 216.06 90.97Q215.37 92.54 214.06 93.53Q213.91 93.63 213.95 93.82L216.89 104.09Q216.93 104.16 216.93 104.27Q216.93 104.71 216.42 104.71H210.5Q210.03 104.71 209.92 104.24ZM207.63 85.14Q207.41 85.14 207.41 85.35V89.53Q207.41 89.75 207.63 89.75H208.1Q208.9 89.75 209.41 89.15Q209.92 88.55 209.92 87.46Q209.92 86.34 209.43 85.74Q208.94 85.14 208.1 85.14ZM233.41 104.2 233.01 101.48Q233.01 101.41 232.94 101.33Q232.87 101.26 232.76 101.26H229.56Q229.46 101.26 229.38 101.33Q229.31 101.41 229.31 101.48L228.95 104.2Q228.91 104.71 228.37 104.71H222.66Q222.08 104.71 222.19 104.13L227.35 79.76Q227.46 79.29 227.97 79.29H234.58Q235.08 79.29 235.19 79.76L240.35 104.13V104.27Q240.35 104.71 239.84 104.71H233.99Q233.45 104.71 233.41 104.2ZM230.29 96.03H232Q232.25 96.03 232.18 95.81L231.2 89.28Q231.16 89.13 231.09 89.13Q231.02 89.13 230.98 89.28L230.11 95.81Q230.11 96.03 230.29 96.03ZM257.09 79.29H262.75Q263.01 79.29 263.15 79.44Q263.3 79.58 263.3 79.84V104.16Q263.3 104.42 263.15 104.56Q263.01 104.71 262.75 104.71H256.29Q255.82 104.71 255.71 104.24L252.95 93.23Q252.91 93.13 252.8 93.13Q252.7 93.13 252.7 93.27L252.77 104.16Q252.77 104.42 252.62 104.56Q252.48 104.71 252.22 104.71H246.56Q246.3 104.71 246.16 104.56Q246.01 104.42 246.01 104.16V79.84Q246.01 79.58 246.16 79.44Q246.3 79.29 246.56 79.29H252.95Q253.42 79.29 253.53 79.76L256.33 90.8Q256.36 90.95 256.47 90.95Q256.58 90.95 256.58 90.8L256.54 79.84Q256.54 79.58 256.69 79.44Q256.84 79.29 257.09 79.29ZM269.22 98.17V97.05Q269.22 96.79 269.36 96.65Q269.51 96.5 269.76 96.5H275.43Q275.68 96.5 275.83 96.65Q275.97 96.79 275.97 97.05V97.85Q275.97 98.43 276.26 98.79Q276.55 99.15 276.99 99.15Q277.42 99.15 277.72 98.83Q278.01 98.5 278.01 97.99Q278.01 97.37 277.42 96.78Q276.84 96.18 274.99 94.87Q273.18 93.6 272 92.54Q270.82 91.49 269.94 89.89Q269.07 88.3 269.07 86.23Q269.07 84.08 270.03 82.45Q271 80.82 272.76 79.91Q274.52 79 276.81 79Q279.13 79 280.89 79.91Q282.65 80.82 283.62 82.45Q284.58 84.08 284.58 86.23V87.03Q284.58 87.28 284.43 87.42Q284.29 87.57 284.03 87.57H278.41Q278.15 87.57 278.01 87.42Q277.86 87.28 277.86 87.03V86.08Q277.86 85.54 277.57 85.19Q277.28 84.85 276.81 84.85Q276.34 84.85 276.06 85.21Q275.79 85.57 275.79 86.19Q275.79 86.92 276.37 87.59Q276.95 88.26 278.7 89.53Q281.02 91.24 282.2 92.29Q283.38 93.34 284.05 94.67Q284.72 95.99 284.72 97.77Q284.72 101.08 282.58 103.04Q280.44 105 276.95 105Q274.63 105 272.89 104.13Q271.14 103.26 270.18 101.71Q269.22 100.17 269.22 98.17ZM306.44 87.46Q306.44 89.78 305.55 91.56Q304.66 93.34 303.06 94.31Q301.46 95.27 299.36 95.27H297.32Q297.11 95.27 297.11 95.49V104.16Q297.11 104.42 296.96 104.56Q296.82 104.71 296.56 104.71H290.82Q290.57 104.71 290.42 104.56Q290.28 104.42 290.28 104.16V79.84Q290.28 79.58 290.42 79.44Q290.57 79.29 290.82 79.29H298.99Q301.17 79.29 302.86 80.33Q304.55 81.36 305.49 83.21Q306.44 85.06 306.44 87.46ZM299.61 87.61Q299.61 86.41 299.12 85.77Q298.63 85.14 297.8 85.14H297.32Q297.11 85.14 297.11 85.35V89.78Q297.11 90 297.32 90H297.8Q298.63 90 299.12 89.4Q299.61 88.8 299.61 87.61ZM311.78 97.23V86.77Q311.78 83.21 313.97 81.11Q316.17 79 319.84 79Q323.51 79 325.7 81.11Q327.9 83.21 327.9 86.77V97.23Q327.9 100.79 325.7 102.89Q323.51 105 319.84 105Q316.17 105 313.97 102.89Q311.78 100.79 311.78 97.23ZM321.07 97.52V86.48Q321.07 85.72 320.75 85.28Q320.42 84.85 319.84 84.85Q319.26 84.85 318.93 85.28Q318.6 85.72 318.6 86.48V97.52Q318.6 98.28 318.93 98.72Q319.26 99.15 319.84 99.15Q320.42 99.15 320.75 98.72Q321.07 98.28 321.07 97.52ZM343.08 104.24 340.86 95.12Q340.79 94.94 340.72 94.94Q340.57 94.94 340.57 95.16V104.16Q340.57 104.42 340.43 104.56Q340.28 104.71 340.03 104.71H334.29Q334.04 104.71 333.89 104.56Q333.75 104.42 333.75 104.16V79.84Q333.75 79.58 333.89 79.44Q334.04 79.29 334.29 79.29H342.46Q344.64 79.29 346.33 80.33Q348.02 81.36 348.96 83.19Q349.91 85.03 349.91 87.39Q349.91 89.39 349.22 90.97Q348.53 92.54 347.22 93.53Q347.07 93.63 347.11 93.82L350.05 104.09Q350.09 104.16 350.09 104.27Q350.09 104.71 349.58 104.71H343.66Q343.19 104.71 343.08 104.24ZM340.79 85.14Q340.57 85.14 340.57 85.35V89.53Q340.57 89.75 340.79 89.75H341.26Q342.06 89.75 342.57 89.15Q343.08 88.55 343.08 87.46Q343.08 86.34 342.59 85.74Q342.1 85.14 341.26 85.14ZM372.24 79.84V84.59Q372.24 84.85 372.09 84.99Q371.95 85.14 371.69 85.14H367.41Q367.19 85.14 367.19 85.35V104.16Q367.19 104.42 367.04 104.56Q366.9 104.71 366.65 104.71H360.91Q360.65 104.71 360.51 104.56Q360.36 104.42 360.36 104.16V85.35Q360.36 85.14 360.15 85.14H355.97Q355.72 85.14 355.57 84.99Q355.42 84.85 355.42 84.59V79.84Q355.42 79.58 355.57 79.44Q355.72 79.29 355.97 79.29H371.69Q371.95 79.29 372.09 79.44Q372.24 79.58 372.24 79.84Z",
            "mix": "#174782",
            "ci": "#174782"
          }
        ]
      },
      "hash": {
        "ci": "274847a8fe6456fd0a73d1b0d8ddad6524ba126901f41988437bc8175104c459",
        "mix": "9dcc5c690f32d42ce9f252c7ffe34d14afbec96deb720e85accb70ff63c05fef",
        "original": "2aca6634a6d7974e95cabfb74c456a11b740457a64931343bc83b3e09c6a9a75",
        "alt": "d107d10dbb82305e3b81bc9eff1e5e1c3479d16c192aa23fdc3a67705f41b79a"
      }
    },
    "fitinn": {
      "width": 216,
      "height": 164,
      "formen": [
        {
          "d": "M1.27 132.9C1 132.57 0.96 131.18 1.06 125.81C1.2 118.85 1.69 112.99 2.52 108.48C2.78 107.03 3 105.57 3 105.24C3 104.91 3.21 103.74 3.48 102.63C3.74 101.53 4.09 100.06 4.25 99.38C5 96.12 5.21 95.27 5.61 93.88C5.84 93.05 6.15 92.04 6.29 91.62C6.44 91.21 6.7 90.31 6.89 89.62C7.07 88.94 7.52 87.59 7.88 86.62C8.24 85.66 8.69 84.42 8.87 83.88C9.05 83.33 9.56 82.03 9.99 81C10.43 79.97 10.88 78.84 10.99 78.48C11.1 78.13 11.31 77.62 11.45 77.36C11.59 77.09 11.99 76.26 12.33 75.5C13.07 73.88 15.13 69.69 15.72 68.63C17.19 65.93 19.14 62.49 19.62 61.75C26.25 51.45 31.02 45.45 38.45 38.05C43.38 33.15 50.13 27.48 54.76 24.38C55.37 23.96 55.93 23.57 56 23.5C56.25 23.23 61.98 19.54 63.12 18.9C63.54 18.67 64.33 18.21 64.88 17.89C65.42 17.56 66.66 16.89 67.62 16.39C68.59 15.9 69.54 15.38 69.75 15.24C69.96 15.11 70.41 14.89 70.75 14.75C71.09 14.61 71.54 14.4 71.75 14.28C72.28 13.96 76.11 12.19 77.75 11.5C80.76 10.23 81.18 10.06 82.57 9.55C83.36 9.26 84.6 8.79 85.32 8.51C86.04 8.23 86.78 8 86.96 8C87.14 8 87.81 7.79 88.45 7.54C91.13 6.48 98.92 4.41 101.88 3.97C102.7 3.84 103.71 3.63 104.12 3.5C104.54 3.36 105.78 3.14 106.88 3.01C107.97 2.87 109.83 2.59 111 2.39C113.72 1.93 119.59 1.5 125.62 1.33C130.78 1.19 142.24 1.93 145.62 2.62C146.59 2.82 147.75 2.99 148.2 2.99C148.66 3 150.07 3.23 151.33 3.5C152.59 3.78 154.69 4.24 156 4.53C158.82 5.14 163.77 6.5 166.12 7.3C166.54 7.44 167.38 7.7 168 7.88C168.62 8.06 169.46 8.38 169.88 8.6C170.29 8.82 170.82 9 171.06 9C171.3 9 171.92 9.23 172.43 9.5C172.95 9.78 173.51 10 173.68 10C173.85 10 174.52 10.24 175.18 10.53C175.84 10.82 176.85 11.27 177.44 11.53C179.64 12.5 180.72 13.01 184 14.63C185.86 15.55 187.94 16.63 188.62 17.03C189.31 17.42 190.1 17.87 190.38 18.01C190.65 18.16 191.32 18.55 191.88 18.88C192.43 19.21 193.21 19.67 193.62 19.9C194.49 20.38 198.53 23.07 200.38 24.38C201.06 24.87 201.91 25.46 202.25 25.7C203.4 26.47 211.36 32.95 212.69 34.19C213.94 35.37 214.01 35.49 214.06 36.82C214.15 38.75 213.72 39.16 212.75 38.08C211.04 36.18 205.43 31.45 200.24 27.53C199.3 26.82 194.05 23.29 193.29 22.86C192.92 22.65 192.29 22.26 191.88 21.99C191.46 21.72 190.79 21.32 190.38 21.11C189.96 20.89 189.18 20.45 188.62 20.12C186.71 18.98 181.98 16.54 179.62 15.49C179.07 15.24 178.06 14.78 177.38 14.47C176.69 14.16 175.68 13.71 175.12 13.48C174.57 13.25 173.59 12.82 172.93 12.53C172.27 12.24 171.57 12 171.37 12C171.16 12 170.58 11.77 170.07 11.5C169.55 11.22 168.96 11 168.76 11C168.55 11 167.82 10.79 167.13 10.53C164.55 9.56 162.2 8.85 159.25 8.14C158.49 7.95 157.2 7.63 156.38 7.42C151.81 6.26 147.47 5.52 139.62 4.58C135.06 4.03 119.81 3.93 116.86 4.44C115.89 4.6 113.85 4.85 112.33 4.98C110.81 5.12 108.56 5.41 107.34 5.63C104.3 6.19 100.33 6.99 99.12 7.3C98.58 7.43 97.47 7.69 96.68 7.88C95.88 8.06 94.7 8.38 94.05 8.58C93.4 8.79 91.86 9.26 90.62 9.63C89.39 10 88.15 10.4 87.88 10.52C87.27 10.78 84.71 11.67 83.5 12.04C83.02 12.19 82.41 12.46 82.13 12.65C81.86 12.84 81.48 13 81.28 13C81.09 13 80.41 13.24 79.78 13.53C79.14 13.82 78.17 14.26 77.62 14.5C73.61 16.31 67.76 19.33 64.31 21.39C63.17 22.07 62.02 22.75 61.75 22.9C61.47 23.05 61.05 23.36 60.79 23.58C60.54 23.81 60.27 24 60.18 24C60.09 24 59.5 24.37 58.86 24.81C58.22 25.26 57.51 25.74 57.29 25.88C57.06 26.01 56.58 26.35 56.22 26.62C55.86 26.9 55.32 27.29 55.01 27.5C54.7 27.71 54.07 28.16 53.62 28.5C53.17 28.84 52.49 29.35 52.11 29.62C51.73 29.9 51.3 30.24 51.15 30.38C51 30.52 49.64 31.63 48.12 32.86C42.42 37.47 32.81 47.66 27.82 54.38C25.17 57.95 18.95 67.89 17.97 70.12C17.85 70.4 17.64 70.79 17.5 71C17.36 71.21 17.14 71.66 17 72C16.86 72.34 16.64 72.79 16.51 73C16.17 73.54 14.41 77.35 13.63 79.25C13.26 80.14 12.8 81.21 12.61 81.62C12.42 82.04 12.11 82.83 11.91 83.38C11.71 83.92 11.41 84.77 11.24 85.25C11.06 85.73 10.73 86.69 10.49 87.38C10.25 88.06 9.92 89.02 9.75 89.5C9.58 89.98 9.33 90.83 9.19 91.38C9.06 91.92 8.79 92.73 8.61 93.16C8.43 93.6 8.21 94.38 8.12 94.91C8.03 95.44 7.75 96.61 7.5 97.5C6.26 101.91 5.2 107.87 4.22 116C4.1 117.03 3.94 121.25 3.86 125.36C3.79 129.48 3.69 132.9 3.64 132.95C3.58 133 3.11 133.1 2.57 133.17C1.87 133.27 1.51 133.19 1.27 132.9ZM104 92.3Q111 94.3 119 91.3V133H104ZM122 90.7L124 88.9H137.9L152 110V88.9H167.1V133H151.7L137 111V133H122ZM169.8 88.9H184.8L199 110.6V88.9H214.1V133H199.2L184.9 111.5V133H169.8Z",
          "original": "#006CB5",
          "ci": "#3078AE"
        },
        {
          "d": "M14 88.9H43V102H30V106.3H42V117.9H30V133H14ZM46 88.9H61.1V133H46ZM63.7 88.9H97V103H88V133H73V103H63.7ZM90.6 113.5H100V120.5H90.6ZM100.67 161.56C100.62 161.46 100.55 158.25 100.53 154.43C100.48 146.85 100.5 146.76 101.89 147.51C102.41 147.79 102.56 147.77 103 147.38C103.38 147.04 103.94 146.92 105.32 146.9C106.99 146.88 107.23 146.94 108.01 147.59C110.93 150.02 110.6 154.51 107.36 156.31C105.96 157.09 104.33 157.12 103.51 156.38C103.25 156.15 102.78 156 102.46 156.04C101.89 156.12 101.87 156.21 101.8 158.94C101.74 161.51 101.69 161.75 101.26 161.75C100.99 161.75 100.73 161.67 100.67 161.56ZM44.57 156.41C44 156.1 43.15 155.35 42.7 154.74C41.94 153.71 41.88 153.49 41.89 151.75C41.9 149.7 42.33 148.76 43.86 147.49C44.51 146.95 44.85 146.88 46.54 146.88C48.22 146.88 48.54 146.95 49 147.44C49.28 147.75 49.6 148 49.7 148C50.14 148 51.04 150.16 50.96 151L50.88 151.88 47.15 152C43.95 152.11 43.39 152.19 43.15 152.56C42.24 154.01 46.43 156.64 47.82 155.5C49.86 153.84 50.5 153.59 50.5 154.46C50.5 155.38 47.87 157.01 46.43 156.98C45.99 156.97 45.15 156.71 44.57 156.41ZM55.14 156.38C53.86 155.59 53.35 154.69 53.91 154.22C54.25 153.94 54.41 154.01 55.03 154.7C56.28 156.1 56.86 156.16 58.03 155L59.05 153.99 58.54 153.18C58.26 152.74 57.69 152.26 57.27 152.11C56.84 151.97 56.36 151.71 56.2 151.55C56.03 151.38 55.77 151.25 55.6 151.25C55.21 151.25 54 149.64 54 149.12C54 148.36 55.26 147.02 56.13 146.86C57.23 146.65 58.68 147.14 58.89 147.79C59.13 148.55 58.62 148.93 58.05 148.42C57.16 147.62 55.25 148.13 55.25 149.17C55.25 149.49 55.36 149.75 55.49 149.75C55.62 149.75 55.93 149.96 56.18 150.21C56.42 150.47 56.96 150.76 57.38 150.86C58.56 151.14 60 152.68 60 153.69C60 154.68 59.22 155.82 58.06 156.51C56.97 157.15 56.35 157.12 55.14 156.38ZM63.06 156.34C62.03 155.72 61.52 154.83 61.87 154.26C62.14 153.83 62.45 153.96 63.26 154.85C63.69 155.32 64.25 155.76 64.51 155.83C65.06 155.97 66.66 154.86 66.89 154.16C67.1 153.54 66.28 152.45 65.35 152.11C64.01 151.63 62.83 150.75 62.37 149.89L61.91 149.04 62.6 148.03C63.37 146.93 64.23 146.6 65.56 146.88C66.59 147.1 67 147.43 67 148.03C67 148.53 66.15 148.7 65.88 148.25C65.49 147.63 63.25 148.3 63.25 149.04C63.25 149.48 64.72 150.7 65.44 150.86C65.82 150.95 66.55 151.41 67.06 151.9C68.59 153.34 68.22 155.21 66.15 156.48C65.06 157.16 64.36 157.12 63.06 156.34ZM91.46 156.4C89.76 155.59 88.46 153.89 89.07 153.28C89.5 152.85 89.7 152.94 90.11 153.72C90.55 154.56 92.44 155.75 93.34 155.75C94.07 155.75 95.68 154.87 96.3 154.13C96.85 153.47 97.08 152.44 96.88 151.51C96.71 150.75 95.19 149.5 93.96 149.11C93.64 149.01 93.11 148.72 92.78 148.47C92.45 148.21 92.06 148 91.9 147.99C91.75 147.98 91.23 147.65 90.76 147.24C89.95 146.55 89.88 146.38 89.79 144.77C89.7 143.05 89.7 143.03 90.67 141.99C91.72 140.87 93.03 140.51 94.8 140.85C95.94 141.07 97.33 142.26 97.11 142.82C96.88 143.42 96.13 143.36 95.7 142.71C95.43 142.3 95.02 142.15 93.93 142.06C92.62 141.95 92.47 141.99 91.76 142.7C90.77 143.69 90.68 145.38 91.56 146.15C92.52 146.97 93.61 147.67 94.25 147.87C94.6 147.98 95.14 148.28 95.47 148.53C95.8 148.79 96.2 149 96.36 149C96.51 149 97 149.47 97.45 150.05C99.16 152.28 98.19 154.88 95.05 156.46C93.73 157.13 92.95 157.12 91.46 156.4ZM114.35 156.43C112.23 155.28 111.36 154.13 111.08 152.11C110.9 150.76 111.85 148.86 113.29 147.72C114.29 146.93 114.47 146.88 116.24 146.88C118.34 146.89 119.15 147.3 120.45 149C121.04 149.77 121.12 150.1 121.12 151.75C121.12 153.52 121.08 153.69 120.25 154.72C119.32 155.88 117.22 157.01 116.03 156.99C115.67 156.98 114.91 156.73 114.35 156.43ZM172.38 156.46C170.15 155.31 169.29 153.52 169.63 150.77C169.77 149.59 169.96 149.24 171.01 148.14L172.22 146.88 174.05 146.88C175.75 146.88 175.95 146.93 176.94 147.73C177.52 148.2 178 148.71 178 148.86C178 149.01 178.21 149.52 178.46 150C179.39 151.76 178.96 151.99 174.75 152C172.89 152 171.21 152.11 171.02 152.23C170.38 152.64 171.14 154.34 172.3 155.1C173.45 155.85 175.35 156.01 175.59 155.38C175.67 155.17 175.9 155 176.1 155C176.3 155 176.69 154.69 176.96 154.31C177.44 153.66 177.49 153.65 177.91 154.06C178.33 154.47 178.32 154.53 177.63 155.25C176.73 156.19 175.08 157 174.11 156.99C173.71 156.98 172.93 156.74 172.38 156.46ZM197.35 156.42C195.18 155.27 194.25 153.12 194.76 150.44C194.96 149.38 195.23 148.9 196.13 148L197.26 146.88 199.24 146.88C201.09 146.88 201.27 146.92 201.99 147.62C202.87 148.46 204 150.35 204 150.98C204 151.87 203.49 152 199.86 152C195.77 152 195.48 152.12 196.09 153.58C196.58 154.76 198.08 155.75 199.38 155.75C200.21 155.75 200.59 155.57 201.48 154.77C202.07 154.23 202.72 153.85 202.91 153.92C203.51 154.15 203.28 154.95 202.44 155.55C200.21 157.14 199.08 157.33 197.35 156.42ZM184.5 156.24C184.5 155.76 188.63 150.75 190.15 149.38C191.4 148.25 191.04 148.03 187.87 147.95C185.63 147.89 185.12 147.81 185.12 147.5C185.12 147.19 185.75 147.11 188.98 147.06C191.21 147.02 192.94 147.09 193.08 147.23C193.23 147.38 192.2 148.71 190.22 150.9C188.52 152.8 186.99 154.61 186.82 154.95C186.49 155.59 186.61 156.11 187.03 155.85C187.36 155.65 192.71 155.62 192.91 155.82C192.99 155.91 192.99 156.16 192.91 156.37C192.78 156.71 192.17 156.76 188.63 156.74C184.76 156.71 184.5 156.68 184.5 156.24ZM130.31 156.21C130.09 155.99 130 154.78 130 152.07C130 148.89 129.94 148.21 129.62 148.09C129.42 148.01 129.25 147.75 129.25 147.5C129.25 147.25 129.42 146.99 129.62 146.91C129.9 146.81 130 146.38 130 145.4C130 143.93 130.28 143.51 130.91 144.03C131.19 144.26 131.27 144.63 131.18 145.27C131.03 146.4 131.21 146.72 132.15 146.97C133.12 147.23 133.07 147.79 132.06 148.05C131.62 148.17 131.24 148.4 131.23 148.57C131.22 148.74 131.23 150.39 131.25 152.25C131.28 155.78 131.01 156.91 130.31 156.21ZM156.02 156.03C155.71 155.46 155.64 141.81 155.94 141.34C156.06 141.16 157.1 141.03 158.75 141C162.09 140.93 162 140.91 162 141.47C162 142.11 161.7 142.18 159.53 142.08C157.1 141.97 157 142.07 157 144.61C157 147.45 157.14 147.59 159.73 147.52C161.75 147.47 161.79 147.48 161.71 148.05C161.63 148.6 161.53 148.63 159.58 148.63C158.46 148.63 157.44 148.72 157.33 148.84C157.22 148.95 157.07 150.68 157 152.69C156.87 156.35 156.63 157.18 156.02 156.03ZM164.17 156.33C164.07 156.24 164 154.16 164 151.7C164 147 164.1 146.61 165.14 147.19C165.43 147.36 165.8 147.31 166.32 147.05C166.85 146.79 167.19 146.75 167.48 146.93C168.19 147.38 167.93 147.87 166.94 147.95C165.53 148.07 165.25 148.81 165.25 152.35C165.25 155.71 164.89 157.05 164.17 156.33ZM14.78 155.92C14.57 155.66 14.51 153.56 14.56 148.34L14.62 141.12 17.6 141.05C19.42 141.01 20.68 141.08 20.84 141.24C21.34 141.74 20.61 142 18.61 142.03C15.79 142.07 15.75 142.1 15.75 144.6C15.75 147.27 15.97 147.5 18.44 147.5C20.29 147.5 20.77 147.75 20.22 148.42C19.96 148.73 19.54 148.78 18.2 148.69C15.83 148.52 15.78 148.59 15.7 152.74C15.63 156.06 15.44 156.71 14.78 155.92ZM22.13 155.77C21.86 154.92 22.07 147.5 22.37 147.25C23.12 146.63 23.26 147.4 23.19 151.77C23.13 155.59 23.07 156.13 22.71 156.2C22.46 156.25 22.23 156.07 22.13 155.77ZM32.92 156.08C32.83 155.99 32.75 153.96 32.75 151.57L32.75 147.23 33.69 147.25C34.2 147.27 35.09 147.14 35.67 146.97C37.35 146.47 38.55 146.95 39.28 148.44C40.01 149.93 40.29 155.03 39.68 155.85C38.98 156.79 38.75 156.08 38.75 152.97C38.75 148.8 38.34 148.01 36.18 148C35.11 148 34.95 148.08 34.5 148.81C34.08 149.5 34 150.08 34 152.54C34 154.15 33.93 155.64 33.85 155.85C33.69 156.26 33.21 156.38 32.92 156.08ZM123.11 155.67C123.03 155.33 123 153.33 123.05 151.21L123.13 147.38 124.13 147.23C124.68 147.14 125.41 147 125.75 146.91C126.52 146.71 127.13 147.06 126.92 147.6C126.83 147.84 126.47 148 126.01 148C124.78 148 124.28 149.41 124.19 153.12C124.13 155.72 124.07 156.13 123.7 156.2C123.41 156.26 123.22 156.07 123.11 155.67ZM181.41 156.05C181.31 155.89 181.17 148.89 181.23 147.55C181.24 147.35 181.47 147.25 181.78 147.3C182.29 147.37 182.31 147.49 182.3 151.55C182.3 153.84 182.23 155.84 182.13 155.98C181.94 156.3 181.58 156.33 181.41 156.05ZM211.15 155.84C211.05 155.6 211 153.85 211.01 151.94C211.04 148.98 210.99 148.4 210.62 148C210.22 147.55 210.22 147.49 210.7 146.88C211.08 146.39 211.18 146.01 211.08 145.37C210.99 144.84 211.06 144.35 211.25 144.12C211.77 143.5 212.25 144.15 212.25 145.48C212.25 146.58 212.3 146.66 213.06 146.89C214.1 147.19 214.11 147.81 213.07 148.11L212.26 148.35 212.19 152.23C212.13 155.59 212.07 156.13 211.72 156.2C211.5 156.24 211.24 156.08 211.15 155.84ZM28.37 155.73C28.28 155.59 28.24 153.91 28.29 152.01C28.36 148.89 28.32 148.5 27.89 148.02C27.42 147.5 27.43 147.49 27.99 146.89C28.42 146.43 28.52 146.11 28.4 145.62C28.18 144.78 28.43 144 28.9 144C29.39 144 29.74 144.99 29.48 145.67C29.26 146.26 29.51 146.58 30.44 146.86C31.26 147.11 31.15 147.9 30.25 148.21L29.5 148.47 29.5 152.24C29.5 155.8 29.47 156 29.01 156C28.75 156 28.46 155.88 28.37 155.73ZM206.68 155.84C206.58 155.75 206.5 153.77 206.5 151.44L206.5 147.22 207.06 147.3C207.62 147.37 207.62 147.41 207.62 151.62C207.62 155.26 207.57 155.88 207.24 155.94C207.02 155.98 206.77 155.94 206.68 155.84ZM107.61 154.61C108.71 153.5 108.75 153.41 108.75 151.96C108.75 150.71 108.63 150.29 108.01 149.39C107.13 148.11 106.89 148 105.08 148C103.21 148 102.15 148.98 101.88 150.97C101.49 153.82 102.89 155.72 105.42 155.74C106.33 155.75 106.61 155.61 107.61 154.61ZM117.5 155.38C117.67 155.17 117.95 155 118.11 155C118.27 155 118.74 154.66 119.14 154.23C119.81 153.53 119.88 153.31 119.88 151.72C119.88 149.98 119.87 149.96 118.82 148.98C117.82 148.05 117.69 148 116.15 148C114.78 148 114.42 148.1 113.77 148.65C113.35 149 113 149.44 113 149.62C113 149.79 112.83 150.08 112.62 150.25C112.06 150.72 112.15 152.6 112.79 153.72C113.09 154.24 113.74 154.9 114.23 155.19C115.29 155.83 117.04 155.92 117.5 155.38ZM77.91 150.79C76.97 149.75 77.87 148.25 79.17 148.68C79.73 148.87 79.89 149.09 79.96 149.76C80.09 151.1 78.79 151.76 77.91 150.79ZM143.14 150.86C142.55 150.26 142.66 149.32 143.38 148.85C143.95 148.47 144.05 148.47 144.62 148.85C145.68 149.54 145.24 151.25 144 151.25C143.74 151.25 143.36 151.07 143.14 150.86ZM49.7 150.7C50.13 150.27 50.1 150.21 49.11 149.12C48.28 148.22 48.09 148.14 46.64 148.05C45.11 147.95 45.03 147.97 44.03 148.88C42.16 150.57 42.66 151 46.5 151C48.42 151 49.5 150.9 49.7 150.7ZM176.72 150.84C177.74 150.64 177.7 150.24 176.54 149.01C175.62 148.05 175.51 148 174.07 148C172.62 148 172.52 148.04 171.65 149C170.63 150.13 170.57 150.37 171.19 150.73C171.67 151.01 175.49 151.09 176.72 150.84ZM202.19 150.84C202.95 150.64 202.88 150.3 201.86 149.14C201.04 148.22 200.88 148.14 199.42 148.05C197.94 147.95 197.8 147.99 196.93 148.77C196 149.6 195.7 150.59 196.31 150.83C196.76 151.02 201.52 151.02 202.19 150.84ZM22.3 144.45C21.56 143.71 22.33 142.61 23.21 143.17C23.77 143.52 23.83 143.89 23.37 144.35C22.89 144.83 22.7 144.85 22.3 144.45ZM181.26 144.39C180.74 143.76 181.05 143.12 181.88 143.12C182.77 143.12 183.06 143.91 182.35 144.42C181.78 144.84 181.63 144.83 181.26 144.39ZM206.63 144.41C205.94 143.91 206.24 143.12 207.13 143.12C207.71 143.12 207.89 143.25 207.95 143.67C208.06 144.4 207.24 144.86 206.63 144.41Z",
          "original": "#2B2A29",
          "ci": "#174782"
        },
        {
          "d": "M132 68.7A22.8 22.8 0 1 1 86.4 68.7A22.8 22.8 0 1 1 132 68.7Z",
          "original": "#FFED00",
          "ci": "#68B9DF"
        }
      ],
      "verein": {
        "width": 458,
        "height": 86,
        "formen": [
          {
            "d": "M0.16 83.38C-0.01 83.17 -0.03 82.29 0.03 78.88C0.12 74.47 0.43 70.76 0.96 67.9C1.12 66.98 1.26 66.06 1.26 65.85C1.26 65.64 1.39 64.9 1.57 64.2C1.73 63.5 1.95 62.57 2.05 62.14C2.53 60.07 2.66 59.53 2.91 58.65C3.06 58.13 3.26 57.49 3.35 57.22C3.44 56.96 3.61 56.39 3.73 55.95C3.84 55.52 4.12 54.67 4.35 54.05C4.58 53.44 4.87 52.66 4.98 52.32C5.09 51.97 5.42 51.14 5.69 50.49C5.97 49.84 6.25 49.12 6.32 48.89C6.39 48.67 6.53 48.35 6.62 48.18C6.7 48.01 6.96 47.49 7.17 47.01C7.64 45.98 8.95 43.33 9.32 42.65C10.25 40.94 11.49 38.76 11.79 38.29C15.99 31.77 19.01 27.97 23.72 23.28C26.85 20.17 31.12 16.58 34.06 14.62C34.44 14.35 34.8 14.1 34.84 14.06C35 13.89 38.63 11.55 39.35 11.14C39.62 11 40.12 10.71 40.47 10.5C40.81 10.29 41.6 9.87 42.21 9.55C42.82 9.24 43.42 8.91 43.56 8.82C43.69 8.74 43.97 8.6 44.19 8.51C44.4 8.43 44.69 8.29 44.82 8.22C45.16 8.01 47.58 6.89 48.62 6.45C50.53 5.65 50.8 5.54 51.68 5.22C52.18 5.04 52.96 4.74 53.42 4.56C53.88 4.38 54.35 4.24 54.46 4.24C54.57 4.24 55 4.1 55.4 3.95C57.1 3.27 62.04 1.96 63.91 1.68C64.43 1.6 65.07 1.47 65.33 1.39C65.6 1.3 66.38 1.16 67.08 1.08C67.77 0.99 68.95 0.81 69.69 0.68C71.42 0.39 75.13 0.12 78.96 0.01C82.22 -0.08 89.49 0.39 91.63 0.83C92.24 0.95 92.98 1.06 93.26 1.06C93.55 1.07 94.45 1.21 95.25 1.39C96.04 1.56 97.37 1.85 98.2 2.04C99.99 2.42 103.13 3.29 104.62 3.79C104.88 3.88 105.42 4.05 105.81 4.16C106.2 4.28 106.73 4.48 107 4.62C107.26 4.76 107.59 4.87 107.75 4.87C107.9 4.87 108.29 5.02 108.62 5.19C108.94 5.36 109.3 5.5 109.41 5.5C109.51 5.5 109.94 5.66 110.36 5.84C110.78 6.02 111.42 6.31 111.79 6.47C113.18 7.09 113.87 7.41 115.95 8.44C117.12 9.02 118.44 9.71 118.87 9.96C119.31 10.21 119.81 10.49 119.99 10.58C120.16 10.67 120.58 10.92 120.94 11.13C121.29 11.34 121.78 11.63 122.04 11.78C122.59 12.08 125.15 13.79 126.32 14.62C126.76 14.93 127.29 15.3 127.51 15.45C128.24 15.94 133.28 20.05 134.12 20.83C134.92 21.58 134.96 21.66 134.99 22.5C135.05 23.72 134.78 23.98 134.16 23.3C133.08 22.09 129.52 19.1 126.24 16.61C125.64 16.16 122.31 13.93 121.83 13.65C121.6 13.52 121.2 13.27 120.94 13.1C120.67 12.93 120.25 12.68 119.99 12.54C119.72 12.4 119.23 12.13 118.87 11.92C117.66 11.19 114.67 9.65 113.17 8.98C112.82 8.82 112.18 8.53 111.75 8.34C111.31 8.14 110.67 7.86 110.32 7.71C109.97 7.56 109.35 7.29 108.93 7.11C108.51 6.92 108.07 6.77 107.94 6.77C107.81 6.77 107.44 6.63 107.12 6.45C106.79 6.28 106.42 6.14 106.29 6.14C106.16 6.14 105.69 6 105.26 5.84C103.62 5.23 102.13 4.78 100.26 4.33C99.78 4.21 98.97 4 98.45 3.87C95.55 3.13 92.8 2.67 87.83 2.07C84.94 1.72 75.27 1.66 73.4 1.98C72.79 2.08 71.5 2.24 70.53 2.32C69.57 2.41 68.15 2.6 67.37 2.74C65.45 3.09 62.93 3.6 62.16 3.79C61.82 3.88 61.12 4.04 60.62 4.16C60.11 4.28 59.36 4.48 58.95 4.6C58.54 4.74 57.56 5.04 56.78 5.27C56 5.5 55.21 5.76 55.04 5.83C54.66 6 53.03 6.56 52.27 6.8C51.96 6.89 51.58 7.06 51.4 7.18C51.23 7.3 50.99 7.41 50.86 7.41C50.74 7.41 50.31 7.56 49.91 7.74C49.5 7.92 48.89 8.2 48.54 8.36C46 9.5 42.29 11.42 40.11 12.72C39.39 13.15 38.66 13.58 38.49 13.68C38.31 13.77 38.04 13.97 37.88 14.11C37.72 14.25 37.55 14.38 37.49 14.38C37.43 14.38 37.06 14.61 36.65 14.89C36.25 15.17 35.8 15.48 35.66 15.57C35.51 15.65 35.21 15.86 34.98 16.04C34.75 16.21 34.41 16.46 34.22 16.59C34.02 16.73 33.62 17.01 33.33 17.23C33.05 17.44 32.62 17.76 32.38 17.94C32.14 18.11 31.86 18.33 31.77 18.42C31.67 18.51 30.81 19.21 29.85 19.99C26.24 22.91 20.15 29.37 16.99 33.62C15.31 35.89 11.37 42.18 10.75 43.6C10.67 43.77 10.54 44.02 10.45 44.16C10.36 44.29 10.22 44.57 10.13 44.79C10.04 45 9.9 45.29 9.82 45.42C9.61 45.76 8.49 48.18 8 49.38C7.76 49.95 7.47 50.62 7.35 50.88C7.23 51.15 7.03 51.65 6.91 52C6.78 52.34 6.59 52.88 6.48 53.18C6.37 53.49 6.16 54.1 6.01 54.53C5.85 54.96 5.65 55.57 5.54 55.88C5.43 56.18 5.27 56.72 5.18 57.07C5.1 57.41 4.93 57.92 4.82 58.2C4.7 58.47 4.56 58.97 4.51 59.3C4.45 59.64 4.27 60.38 4.11 60.95C3.33 63.74 2.65 67.52 2.03 72.67C1.96 73.32 1.86 75.99 1.81 78.6C1.76 81.21 1.7 83.38 1.67 83.41C1.63 83.44 1.33 83.5 0.99 83.55C0.54 83.61 0.32 83.56 0.16 83.38Z",
            "mix": "#006CB5",
            "ci": "#3078AE"
          },
          {
            "d": "M83 42.7C83 50.68 76.53 57.14 68.55 57.14C60.57 57.14 54.1 50.68 54.1 42.7C54.1 34.72 60.57 28.25 68.55 28.25C76.53 28.25 83 34.72 83 42.7Z",
            "mix": "#FFED00",
            "ci": "#68B9DF"
          },
          {
            "d": "M197.25 27.25H176.79Q176.14 27.25 176.14 27.89V38.18Q176.14 38.82 176.79 38.82H187.39Q188.14 38.82 188.57 39.25Q189 39.68 189 40.43V54.46Q189 55.21 188.57 55.64Q188.14 56.07 187.39 56.07H176.79Q176.14 56.07 176.14 56.71V83.39Q176.14 84.14 175.71 84.57Q175.29 85 174.54 85H157.61Q156.86 85 156.43 84.57Q156 84.14 156 83.39V11.61Q156 10.86 156.43 10.43Q156.86 10 157.61 10H197.25Q198 10 198.43 10.43Q198.86 10.86 198.86 11.61V25.64Q198.86 26.39 198.43 26.82Q198 27.25 197.25 27.25ZM203.36 83.39V11.61Q203.36 10.86 203.79 10.43Q204.21 10 204.96 10H221.89Q222.64 10 223.07 10.43Q223.5 10.86 223.5 11.61V83.39Q223.5 84.14 223.07 84.57Q222.64 85 221.89 85H204.96Q204.21 85 203.79 84.57Q203.36 84.14 203.36 83.39ZM278.89 11.61V25.64Q278.89 26.39 278.46 26.82Q278.04 27.25 277.29 27.25H264.64Q264 27.25 264 27.89V83.39Q264 84.14 263.57 84.57Q263.14 85 262.39 85H245.46Q244.71 85 244.29 84.57Q243.86 84.14 243.86 83.39V27.89Q243.86 27.25 243.21 27.25H230.89Q230.14 27.25 229.71 26.82Q229.29 26.39 229.29 25.64V11.61Q229.29 10.86 229.71 10.43Q230.14 10 230.89 10H277.29Q278.04 10 278.46 10.43Q278.89 10.86 278.89 11.61ZM283.82 61.43V47.5Q283.82 46.75 284.25 46.32Q284.68 45.89 285.43 45.89H315.11Q315.86 45.89 316.29 46.32Q316.71 46.75 316.71 47.5V61.43Q316.71 62.18 316.29 62.61Q315.86 63.04 315.11 63.04H285.43Q284.68 63.04 284.25 62.61Q283.82 62.18 283.82 61.43ZM322.5 83.39V11.61Q322.5 10.86 322.93 10.43Q323.36 10 324.11 10H341.04Q341.79 10 342.21 10.43Q342.64 10.86 342.64 11.61V83.39Q342.64 84.14 342.21 84.57Q341.79 85 341.04 85H324.11Q323.36 85 322.93 84.57Q322.5 84.14 322.5 83.39ZM381.96 10H398.68Q399.43 10 399.86 10.43Q400.29 10.86 400.29 11.61V83.39Q400.29 84.14 399.86 84.57Q399.43 85 398.68 85H379.61Q378.21 85 377.89 83.61L369.75 51.14Q369.64 50.82 369.32 50.82Q369 50.82 369 51.25L369.21 83.39Q369.21 84.14 368.79 84.57Q368.36 85 367.61 85H350.89Q350.14 85 349.71 84.57Q349.29 84.14 349.29 83.39V11.61Q349.29 10.86 349.71 10.43Q350.14 10 350.89 10H369.75Q371.14 10 371.46 11.39L379.71 43.96Q379.82 44.39 380.14 44.39Q380.46 44.39 380.46 43.96L380.36 11.61Q380.36 10.86 380.79 10.43Q381.21 10 381.96 10ZM439.61 10H456.32Q457.07 10 457.5 10.43Q457.93 10.86 457.93 11.61V83.39Q457.93 84.14 457.5 84.57Q457.07 85 456.32 85H437.25Q435.86 85 435.54 83.61L427.39 51.14Q427.29 50.82 426.96 50.82Q426.64 50.82 426.64 51.25L426.86 83.39Q426.86 84.14 426.43 84.57Q426 85 425.25 85H408.54Q407.79 85 407.36 84.57Q406.93 84.14 406.93 83.39V11.61Q406.93 10.86 407.36 10.43Q407.79 10 408.54 10H427.39Q428.79 10 429.11 11.39L437.36 43.96Q437.46 44.39 437.79 44.39Q438.11 44.39 438.11 43.96L438 11.61Q438 10.86 438.43 10.43Q438.86 10 439.61 10Z",
            "mix": "#174782",
            "ci": "#174782"
          }
        ]
      },
      "hash": {
        "ci": "78cf2fdad9c4b8ac3a17f3ef7c6416031dbca8059995acedd97b33b800e51d86",
        "mix": "5e626b5118d2a1645124460c4bdb04c5460de8c01e28db62d05d5b4610cfe615",
        "original": "a0a99253d0d62d7d210bc102f9614501a578c1d960a043713fe382305f3496c7",
        "alt": "b66f9fab61aeab45f48aaae7f957c2691243d445399abb7699abd09132973448"
      }
    }
  };
  // ENDE DRUCKPFADE

  function schluessel(name) {
    const s = String(name || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    if (/^basakci(?:\s|$)/.test(s)) return 'basakci';
    if (/^keil(?:[\s-]|$)/.test(s)) return 'keil';
    if (/^(?:paul\s+)?fierek(?:\s|$)/.test(s)) return 'fierek';
    if (/^fit[\s-]*inn?(?:\s|$)/.test(s)) return 'fitinn';
    return null;
  }

  function marke(key, modus) {
    if (!Object.prototype.hasOwnProperty.call(katalog, key) || !['ci','mix','original','alt'].includes(modus)) return null;
    if (!katalog[key].hash[modus]) return null;
    return modus === 'ci' || modus === 'mix' ? katalog[key].verein : katalog[key];
  }

  // Der frühere CI-Farbauftrag bleibt für seinen freigegebenen Hash abrufbar.
  function farbfeld(modus) {
    return modus === 'alt' ? 'ci' : modus;
  }

  function logo(key, modus = 'ci') {
    const m = marke(key, modus);
    if (!m) return null;
    return {
      width: m.width,
      height: m.height,
      paths: m.formen.map(p => ({
        d: p.d, fill: p[farbfeld(modus)], stroke: 'none', strokeWidth: 0, opacity: 1, rule: 'evenodd'
      }))
    };
  }

  function svg(key, modus = 'ci') {
    const m = marke(key, modus);
    if (!m) return null;
    const kopf = '<svg xmlns="http://www.w3.org/2000/svg" width="' + m.width + '" height="' + m.height +
      '" viewBox="0 0 ' + m.width + ' ' + m.height + '">';
    return kopf + m.formen.map(p => '<path fill="' + p[farbfeld(modus)] + '" fill-rule="evenodd" d="' + p.d + '"/>').join('') + '</svg>';
  }

  function revision(key, modus = 'ci') {
    const m = marke(key, modus);
    return m ? katalog[key].hash[modus] : null;
  }

  function zeichnen(ctx, key, modus, x, y, w, h) {
    const m = marke(key, modus);
    if (!m || !(w > 0 && h > 0)) return false;
    const s = Math.min(w / m.width, h / m.height);
    ctx.save();
    ctx.translate(x + (w - m.width * s) / 2, y + (h - m.height * s) / 2);
    ctx.scale(s, s);
    for (const form of m.formen) {
      ctx.fillStyle = form[farbfeld(modus)];
      ctx.fill(new Path2D(form.d), 'evenodd');
    }
    ctx.restore();
    return true;
  }

  const api = Object.freeze({schluessel, logo, svg, revision, zeichnen});
  root.BANDENMARKEN = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window === 'undefined' ? globalThis : window);

// Getrennte Bildmarke und Firmenname für Vereinsbanden. Editor und Export teilen dieselbe Arbeitsfläche.
window.BANDEN_MISCHSATZ = (() => {
  'use strict';
  const blau = '#174782', ns = 'http://www.w3.org/2000/svg';
  const quellen = new Map();
  async function werkzeuge() {
    if (typeof sxScript === 'function') {
      if (!window.BD_CORE || !window.BD_SVGPATH) await Promise.all([
        sxScript('bandenstudio-core.js', () => window.BD_CORE),
        sxScript('vendor/bandenstudio/svgpath.js', () => window.BD_SVGPATH)
      ]);
      if (!window.BD_RENDER) await sxScript('bandenstudio-render.js', () => window.BD_RENDER);
      if (!window.opentype) await sxScript('vendor/bandenstudio/opentype.min.js', () => window.opentype);
    }
    if (!window.BD_RENDER || !window.BD_SVGPATH || !window.opentype)
      throw Error('Die Logo-Werkstatt konnte ihre Zeichenwerkzeuge nicht laden. Bitte die Seite erneut öffnen.');
  }
  const bildURL = svg => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  async function arbeitsbild(src) {
    if (!src || typeof src !== 'string') throw Error('Bitte zuerst das Original-Logo hinterlegen.');
    if (quellen.has(src)) return quellen.get(src);
    const laden = (async () => {
      await werkzeuge();
      const url = new URL(src, document.baseURI);
      const istSVG = /^data:image\/svg\+xml[;,]/i.test(src) ||
        (url.origin === location.origin && /\.svg$/i.test(url.pathname));
      if (istSVG) {
        const r = await fetch(src);
        if (!r.ok) throw Error('Die SVG-Vorlage lässt sich nicht öffnen.');
        const v = BD_RENDER.readSVG(await r.text());
        return {src:bildURL(BD_RENDER.vectorSVG(v)), width:v.width, height:v.height, vector:v};
      }
      const {c} = await LOGO.aufbereiten(src);
      return {src:c.toDataURL('image/png'), width:c.width, height:c.height, canvas:c};
    })();
    if (quellen.size >= 8) quellen.delete(quellen.keys().next().value);
    quellen.set(src, laden);
    try { return await laden; } catch (e) { if (quellen.get(src) === laden) quellen.delete(src); throw e; }
  }
  async function quelle(src) {
    const {src:bild, width, height} = await arbeitsbild(src);
    return {src:bild,width,height};
  }
  function rechteck(a, z) {
    if (!Array.isArray(z) || z.length !== 4 || !z.every(n => Number.isInteger(n) && n >= 0 && n <= 10000) ||
      !z[2] || !z[3] || z[0]+z[2] > 10000 || z[1]+z[3] > 10000)
      throw Error('Bitte zuerst die Bildmarke im Original auswählen.');
    return {x:z[0]*a.width/10000,y:z[1]*a.height/10000,w:z[2]*a.width/10000,h:z[3]*a.height/10000};
  }
  function pfadmasse(p, element) {
    element.setAttribute('d',p.d);
    const {x,y,width,height} = element.getBBox(), rand = p.stroke === 'none' ? 0 : p.strokeWidth/2;
    return {x:x-rand,y:y-rand,w:width+2*rand,h:height+2*rand};
  }
  function auswahl(v, rect) {
    const svg = document.createElementNS(ns,'svg'), element = document.createElementNS(ns,'path');
    svg.setAttribute('width','0'); svg.setAttribute('height','0');
    svg.style.position = 'absolute'; svg.style.visibility = 'hidden';
    svg.append(element); document.body.append(svg);
    const paths = [];
    let links = Infinity, oben = Infinity, rechts = -Infinity, unten = -Infinity;
    try {
      for (const p of v.paths) {
        if (!p.opacity || (p.fill === 'none' && p.stroke === 'none')) continue;
        const b = pfadmasse(p,element);
        if (b.w <= 0 || b.h <= 0 || b.x+b.w <= rect.x || b.y+b.h <= rect.y ||
          b.x >= rect.x+rect.w || b.y >= rect.y+rect.h) continue;
        const eps = Math.max(v.width,v.height)/10000;
        if (b.x < rect.x-eps || b.y < rect.y-eps || b.x+b.w > rect.x+rect.w+eps || b.y+b.h > rect.y+rect.h+eps) {
          // A full-sheet white rectangle is the paper behind the logo, not part of the sign.
          const commands = BD_SVGPATH(p.d).abs().unshort().segments;
          if (paths.length === 0 && p.fill === '#ffffff' && p.stroke === 'none' &&
            commands.length === 5 && commands.every(s => ['M','H','V','L','Z','z'].includes(s[0])) &&
            Math.abs(b.x)+Math.abs(b.y)+Math.abs(b.w-v.width)+Math.abs(b.h-v.height) < eps) continue;
          throw Error('Der Ausschnitt schneidet einen Vektorpfad an. Bitte das ganze Zeichen markieren oder eine separate Bildmarke hinterlegen.');
        }
        paths.push(p);
        links=Math.min(links,b.x); oben=Math.min(oben,b.y);
        rechts=Math.max(rechts,b.x+b.w); unten=Math.max(unten,b.y+b.h);
      }
    } finally { svg.remove(); }
    if (!paths.length) throw Error('Im gewählten Ausschnitt ist keine Bildmarke sichtbar.');
    return {paths,x:links,y:oben,w:rechts-links,h:unten-oben};
  }
  function kontur(c, rect) {
    const x=Math.floor(rect.x), y=Math.floor(rect.y);
    const w=Math.min(c.width,Math.ceil(rect.x+rect.w))-x, h=Math.min(c.height,Math.ceil(rect.y+rect.h))-y;
    const bild = c.getContext('2d',{willReadFrequently:true}).getImageData(x,y,w,h);
    // Do not invent a straight edge if the rectangle passes right through the printed mark.
    const p=bild.data, rand=[];
    if(x>0) for(let j=1;j<h-1;j++) rand.push(j*w);
    if(x+w<c.width) for(let j=1;j<h-1;j++) rand.push(j*w+w-1);
    if(y>0) for(let i=1;i<w-1;i++) rand.push(i);
    if(y+h<c.height) for(let i=1;i<w-1;i++) rand.push((h-1)*w+i);
    if(rand.some(k=>p[4*k+3]>220))
      throw Error('Die Auswahl berührt das Motiv am Rand. Bitte etwas Luft um die ganze Bildmarke lassen.');
    return new Promise((ok,nein) => {
      const worker = new Worker('banden_mischkontur.js');
      const stop = () => { clearTimeout(timer); worker.terminate(); };
      const timer = setTimeout(() => { stop(); nein(Error('Die Bildmarke ist zu komplex. Bitte eine SVG-Vorlage verwenden.')); },20000);
      worker.onmessage = ({data}) => { stop(); data.fehler ? nein(Error(data.fehler)) : ok(data.marke); };
      worker.onerror = () => { stop(); nein(Error('Die Farbkonturen konnten nicht ermittelt werden.')); };
      worker.postMessage({bild},[bild.data.buffer]);
    });
  }
  function transform(d,s,x,y) {
    return BD_SVGPATH(d).matrix([s,0,0,s,x,y]).round(3).toString();
  }
  function schrift(name) {
    const font=BD_RENDER.fonts.condensed;
    const chars = Array.from(name);
    if (chars.some(c => !/\s/.test(c) && !font.charToGlyphIndex(c)))
      throw Error('Ein Zeichen des Firmennamens fehlt in der Vereinsschrift. Bitte die Schreibweise prüfen.');
    const path=font.getPath(name,0,0,140), b=path.getBoundingBox();
    return {d:path.toPathData(3),x:b.x1,y:b.y1,w:b.x2-b.x1,h:b.y2-b.y1};
  }
  async function svg(src, firma, zeichen, modus='mix') {
    if (!['ci','mix'].includes(modus)) throw Error('Diese Fassung ist für die getrennte Bildmarke nicht verfügbar.');
    const name=String(firma||'').trim().replace(/\s+/g,' ');
    if (!name || name.length>180) throw Error('Bitte einen lesbaren Firmennamen hinterlegen.');
    const a=await arbeitsbild(src), rect=rechteck(a,zeichen);
    const [marke] = await Promise.all([a.vector ? auswahl(a.vector,rect) : kontur(a.canvas,rect), BD_RENDER.loadFonts()]);
    const text=schrift(name), hoehe=200, spalt=32;
    const schriftFaktor=Math.min(146/text.h, 1200/text.w);
    const wortBreite=text.w*schriftFaktor, wortHoehe=text.h*schriftFaktor;
    const markenFaktor=Math.min(hoehe/marke.h,264/marke.w), markenBreite=marke.w*markenFaktor;
    if (!(wortHoehe>16)) throw Error('Dieser Firmenname ist zu lang für eine lesbare Bandenbeschriftung.');
    const hell=c=>c!=='none'&&[1,3,5].every(i=>parseInt(c.slice(i,i+2),16)>=235);
    const farben=marke.paths.flatMap(p=>[p.fill,p.stroke]).filter(c=>c!=='none');
    const nurHell=farben.every(hell);
    if (modus==='mix' && nurHell) throw Error('Diese Bildmarke ist auf einer weißen Bande kaum sichtbar. Bitte eine dunklere Originalfassung wählen.');
    const farbe=c=>modus==='mix'||c==='none'?c:hell(c)&&!nurHell?'#ffffff':blau;
    const paths=marke.paths.map(p=>({...p,fill:farbe(p.fill),stroke:farbe(p.stroke),
      d:transform(p.d,markenFaktor,-marke.x*markenFaktor,(hoehe-marke.h*markenFaktor)/2-marke.y*markenFaktor),
      strokeWidth:p.stroke==='none'?0:Number((p.strokeWidth*markenFaktor).toFixed(3))}));
    paths.push({d:transform(text.d,schriftFaktor,markenBreite+spalt-text.x*schriftFaktor,
      (hoehe-wortHoehe)/2-text.y*schriftFaktor),fill:blau,stroke:'none',strokeWidth:0,opacity:1,rule:'nonzero'});
    const width=Math.ceil(markenBreite+spalt+wortBreite);
    return {svg:BD_RENDER.vectorSVG({width,height:hoehe,paths}),nachgezeichnet:!a.vector};
  }
  return {quelle,svg};
})();

// Ein Ausschnitt bezieht sich immer auf die aufbereitete Vorlage. Vorschau und Druck benutzen dieselben Koordinaten.
function bandenZeichenwahl(el,src,zeichen,uebernehmen) {
  el.replaceChildren();
  if(!src)return;
  const details=document.createElement('details'),titel=document.createElement('summary');
  titel.textContent=zeichen?'Bildzeichen ändern':'Bildzeichen wählen';details.append(titel);el.append(details);
  let begonnen=false;
  details.ontoggle=async()=>{
    if(!details.open||begonnen)return;
    begonnen=true;
    const status=document.createElement('p');status.setAttribute('role','status');status.textContent='Vorlage wird geladen …';details.append(status);
    try{
      const q=await BANDEN_MISCHSATZ.quelle(src);
      if(!details.isConnected)return;
      status.textContent='Ziehe einen Rahmen um das Bildzeichen oder gib den Ausschnitt in Prozent ein.';
      const box=document.createElement('div'),bild=document.createElement('img'),rahmen=document.createElement('div'),zahlen=document.createElement('div');
      box.className='bz-vorlage';rahmen.className='bz-rahmen';zahlen.className='bz-zahlen';
      bild.src=q.src;bild.alt='Logovorlage für die Auswahl des Bildzeichens';bild.draggable=false;
      box.style.aspectRatio=q.width+' / '+q.height;box.append(bild,rahmen);details.append(box,zahlen);
      const nehmen=document.createElement('button');nehmen.type='button';nehmen.textContent='Ausschnitt übernehmen';details.append(nehmen);
      const inputs=['Links','Oben','Breite','Höhe'].map((name,i)=>{
        const label=document.createElement('label'),input=document.createElement('input');
        input.type='number';input.min='0';input.max='100';input.step='0.01';input.value=zeichen?String(zeichen[i]/100):'';
        label.append(document.createTextNode(name+' (%)'),input);zahlen.append(label);return input;
      });
      const werte=()=>inputs.map(f=>Math.round(f.valueAsNumber*100));
      function zeigen(){
        const z=werte(),ok=z.every(n=>Number.isInteger(n)&&n>=0)&&z[2]>0&&z[3]>0&&z[0]+z[2]<=10000&&z[1]+z[3]<=10000;
        rahmen.hidden=!ok;nehmen.disabled=!ok;
        if(ok)['left','top','width','height'].forEach((k,i)=>rahmen.style[k]=z[i]/100+'%');
      }
      inputs.forEach(f=>f.oninput=zeigen);zeigen();
      function punkt(e){const r=box.getBoundingClientRect();return [[e.clientX-r.left,r.width],[e.clientY-r.top,r.height]].map(([n,l])=>Math.max(0,Math.min(10000,Math.round(n/l*10000))));}
      let start=null,pointer=null;
      box.onpointerdown=e=>{if(e.button!==0||pointer!==null)return;start=punkt(e);pointer=e.pointerId;box.setPointerCapture(pointer);};
      box.onpointermove=e=>{
        if(pointer!==e.pointerId)return;const [x,y]=punkt(e);
        [Math.min(start[0],x),Math.min(start[1],y),Math.abs(x-start[0]),Math.abs(y-start[1])].forEach((n,i)=>inputs[i].value=String(n/100));zeigen();
      };
      box.onpointerup=e=>{if(pointer===e.pointerId){box.onpointermove(e);pointer=null;}};
      box.onpointercancel=()=>{pointer=null;};
      nehmen.onclick=()=>{if(!nehmen.disabled)uebernehmen(werte());};
    }catch(e){status.textContent=e.message;}
  };
}

// Gemeinsames Motiv für Platzplan, Rundgang und Druck. Maße sind relativ zum Endformat.
const BANDEN_CI = (() => {
  const blau = '#174782';
  const bilder = new Map(), marken = new Map();
  function titel(s) {
    if (s.firma) return s.firma;
    if (s.stand !== 'frei') return ({option:'Angeboten',vorgemerkt:'Vorgemerkt',fest:'Vergeben'})[s.stand] || 'Vergeben';
    if (s.rolle === 'top') return '1896 Partner';
    if (s.rolle === 'mitte') return 'Hauptpartner';
    return s.zone === 'premium' ? 'Premium' : 'Frei';
  }
  function feld(w,h) { return {x:w*.045,y:h*.105,w:w*.91,h:h*.79}; }
  function bild(src) { const im = new Image(); return new Promise((ok,nein) => {
    im.onload=()=>ok(im);im.onerror=()=>nein(Error('Das Logo lässt sich gerade nicht anzeigen.'));im.src=src;
  }); }
  function svgBild(svg) { return bild('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)); }
  function vektorisiere(c) {
    const a=c.getContext('2d').getImageData(0,0,c.width,c.height);
    return new Promise((ok,nein) => {
      const worker=new Worker('bandenkontur.js');
      const ende=()=>{clearTimeout(timer);worker.terminate();};
      const timer=setTimeout(()=>{ende();nein(Error('Für dieses Motiv wird eine Vektorvorlage benötigt.'));},20000);
      worker.onmessage=e=>{ende();e.data.svg?ok(e.data.svg):nein(Error(e.data.fehler));};
      worker.onerror=()=>{ende();nein(Error('Die Konturen konnten nicht ermittelt werden.'));};
      worker.postMessage({bild:a,farbe:blau},[a.data.buffer]);
    });
  }
  async function originalPfade(src,modus) {
    if(!/^data:image\/svg\+xml[;,]/i.test(src)||src.length>4000000)return null;
    if(!window.BD_RENDER&&typeof sxScript==='function'){
      await Promise.all([sxScript('bandenstudio-core.js',()=>window.BD_CORE),sxScript('vendor/bandenstudio/svgpath.js',()=>window.BD_SVGPATH)]);
      await sxScript('bandenstudio-render.js',()=>window.BD_RENDER);
    }
    if(!window.BD_RENDER)return null;
    const komma=src.indexOf(','),teil=src.slice(komma+1);
    const text=/;base64$/i.test(src.slice(0,komma))?new TextDecoder().decode(Uint8Array.from(atob(teil),c=>c.charCodeAt(0))):decodeURIComponent(teil);
    const v=BD_RENDER.readSVG(text);
    const hell=c=>c!=='none'&&[1,3,5].every(i=>parseInt(c.slice(i,i+2),16)>=235);
    const farben=v.paths.filter(p=>p.opacity>0).flatMap(p=>[p.fill,p.stroke]).filter(c=>c!=='none');
    const nurHell=farben.length>0&&farben.every(hell);
    if(modus==='ci'){
      const umfaerben=c=>c==='none'?c:hell(c)&&!nurHell?'#ffffff':blau;
      for(const p of v.paths){p.fill=umfaerben(p.fill);p.stroke=umfaerben(p.stroke);}
    }
    const svg=BD_RENDER.vectorSVG(v);
    return {svg,img:await svgBild(svg),vektor:true,dunklerGrund:modus==='original'&&nurHell};
  }
  const ausdruecke={ci:'Vereins-CI',mix:'Firmenfarbe',original:'Originallogo',alt:'Bisherige Freigabe'};
  const hinweise={ci:'Bildzeichen und Firmenname in Vereinsblau.',mix:'Bildzeichen in Firmenfarbe, Name in blauer Vereinsschrift.',original:'Das eingereichte Logo zum Vergleich.',alt:'So wurde diese Bande bisher freigegeben.'};
  const standard=s=>ausdruecke[s?.druckfassung?.modus]&&s.druckfassung.modus!=='original'?s.druckfassung.modus:'ci';
  const ausschnitte=new WeakMap();
  function optionen(s,firma=s.firma){
    return {firma,zeichen:ausschnitte.get(s)||s.druckfassung?.zeichen||null};
  }
  function beschreibung(s,m,vorbereitet=false){
    return m==='ci'&&!vorbereitet&&!s.markenschluessel&&!optionen(s).zeichen?'Gesamtes Logo in Vereinsblau. Für einen neu gesetzten Namen wähle das Bildzeichen.':hinweise[m];
  }
  async function motiv(key,src,modus='ci',opt={}) {
    const signatur=JSON.stringify([key,src,modus,opt.firma,opt.zeichen]);
    if(marken.has(signatur))return marken.get(signatur);
    const laden=(async()=>{
      if(key) {
        const svg=BANDENMARKEN.svg(key,modus);
        if(svg)return {svg,img:await svgBild(svg),vektor:true,nachgezeichnet:true};
      }
      if(!src)throw Error('Für diesen Platz fehlt ein Firmenlogo.');
      if(modus==='mix'||modus==='ci'&&opt.zeichen){
        if(!opt.zeichen)throw Error('Wähle zuerst das Bildzeichen aus dem Logo.');
        const m=await BANDEN_MISCHSATZ.svg(src,opt.firma,opt.zeichen,modus);
        return {...m,img:await svgBild(m.svg),vektor:true};
      }
      if(!['ci','original'].includes(modus))throw Error('Die frühere Vorlage ist nicht verfügbar.');
      const pfade=await originalPfade(src,modus).catch(()=>null);if(pfade)return pfade;
      if(modus==='original') {
        const a=await LOGO.aufbereiten(src);
        return {img:await bild(a.c.toDataURL()),dunklerGrund:a.hell,vektor:false};
      }
      const canvas=await LOGO.variante(src,'farbe:'+blau);
      try {
        const svg=await vektorisiere(canvas);
        return {svg,img:await svgBild(svg),vektor:true,nachgezeichnet:true};
      }catch(e){
        return {img:await bild(canvas.toDataURL()),vektor:false,hinweis:e.message};
      }
    })();
    marken.set(signatur,laden);try{return await laden;}catch(e){marken.delete(signatur);throw e;}
  }
  function tafelbild(im,doppel,dunklerGrund=false) {
    const c=document.createElement('canvas');
    c.height=240;c.width=doppel?1500:750;
    const x=c.getContext('2d'),f=feld(c.width,c.height);
    x.fillStyle=dunklerGrund?'#173e71':'#ffffff';x.fillRect(0,0,c.width,c.height);
    const mass=Math.min(f.w/im.naturalWidth,f.h/im.naturalHeight);
    const w=im.naturalWidth*mass,h=im.naturalHeight*mass;
    x.drawImage(im,(c.width-w)/2,(c.height-h)/2,w,h);
    return bild(c.toDataURL('image/png'));
  }
  async function persoenlicheTafel(src,doppel) {
    return tafelbild(await bild(src),doppel);
  }
  async function tafel(key,src,modus,doppel,opt={}) {
    const k=JSON.stringify([key,src,modus,doppel,opt.firma,opt.zeichen,opt.hash]);
    if(bilder.has(k))return bilder.get(k);
    const laden=(async()=>{
      const a=await motiv(key,src,modus,opt);
      if(opt.hash&&(!a.svg||await hash(a.svg)!==opt.hash))throw Error('Das Logo hat sich seit der Freigabe geändert. Bitte die Gestaltung erneut prüfen.');
      return tafelbild(a.img,doppel,a.dunklerGrund);
    })();
    bilder.set(k,laden);try{return await laden;}catch(e){bilder.delete(k);throw e;}
  }
  async function hash(svg) {
    const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(svg));
    return [...new Uint8Array(bytes)].map(v=>v.toString(16).padStart(2,'0')).join('');
  }
  async function freigabefeld(el,slot,quelle,liste,rpc,modus='ci',nachSpeichern) {
    const generation=el._kennung={};
    const aktiv=()=>el.isConnected&&el._kennung===generation;
    el.replaceChildren();
    if(modus==='original')return;
    try{
      const bestand=await liste(),zeile=bestand.slots?.find(s=>s.platz===slot.id);
      if(!aktiv()||!bestand.darf||!zeile)return;
      if(!slot.sponsor||slot.sponsor!==zeile.sponsor||slot.firma!==zeile.firma||
        !Number.isSafeInteger(slot.ci_revision)||slot.ci_revision!==zeile.revision){
        el.textContent='Der Bandenplan hat sich geändert. Bitte lade ihn neu.';return;
      }
      if(slot.ci_quelle_passt===false){el.textContent='Für die Freigabe öffne das aktuelle Logo im Vereinsplan.';return;}
      const opt=optionen(slot);
      const m=await motiv(slot.markenschluessel,quelle(),modus,opt);if(!aktiv())return;
      if(!m.svg){el.textContent=m.hinweis||'Für diese Freigabe fehlt die Vektorvorlage.';return;}
      const h=await hash(m.svg);if(!aktiv())return;
      const label=document.createElement('label'),check=document.createElement('input'),info=document.createElement('span');
      const passt=()=>!!zeile.freigabe&&zeile.hash===h&&(zeile.modus||'ci')===modus&&JSON.stringify(zeile.zeichen||null)===JSON.stringify(opt.zeichen||null);
      label.className='ci-freigabe';check.type='checkbox';check.checked=passt();
      info.setAttribute('role','status');const text=ausdruecke[modus]+' mit Partner freigegeben';
      label.append(check,document.createTextNode(text));el.replaceChildren(label,info);
      if(zeile.freigabe&&!passt())info.textContent='Der Haken ersetzt die bisherige Freigabe durch diese Gestaltung.';
      if(modus==='alt'&&!passt()){el.textContent='Die frühere Freigabe ist abgelaufen.';return;}
      check.onchange=async()=>{
        const wert=check.checked,vorher=passt();if(!aktiv())return;check.disabled=true;
        try{
          const r=await rpc('banden_fassung_setzen',{p_platz:slot.id,p_sponsor:zeile.sponsor,p_hash:h,p_revision:zeile.revision,p_frei:wert,p_modus:modus,p_zeichen:opt.zeichen||null});
          if(!r.ok)throw Error('Der Platz wurde inzwischen geändert. Bitte den Plan neu laden.');
          Object.assign(zeile,r);slot.ci_revision=r.revision;
          slot.druckfassung=wert?{modus,zeichen:opt.zeichen||null,hash:h}:null;
          if(aktiv()&&nachSpeichern)nachSpeichern();
          if(aktiv())info.textContent=wert?'Freigabe gespeichert.':'Freigabe zurückgenommen.';
        }catch(e){if(aktiv()){check.checked=vorher;info.textContent=e.message;}}
        finally{if(aktiv())check.disabled=false;}
      };
    }catch(e){if(aktiv())el.textContent=e.message||'Die Freigabe konnte nicht geladen werden.';}
  }
  return {titel,feld,motiv,tafel,persoenlicheTafel,hash,freigabefeld,standard,optionen,ausdruecke,beschreibung,ausschnitte};
})();

/* Gemeinsame Platzwahl für die persönliche Partnerreise. Alle Schreibzugriffe bleiben unverbindliche Wünsche. */
const BANDENWAHL = (() => {
  'use strict';
  const E = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function logoQuelle(s){
    if(!s.logo_sha256)return {src:s.logo,aufraeumen(){}};
    const url=new URL(s.logo,location.href);if(!/^[a-f0-9]{64}$/.test(s.logo_sha256)||url.origin!==location.origin||!/^\/kit\/logos\/[a-z0-9._-]+\.png$/i.test(url.pathname))throw new Error('Bildquelle passt nicht');
    const r=await fetch(url.href,{credentials:'omit',redirect:'error',cache:'no-cache'});if(!r.ok)throw new Error('Bild fehlt');const bytes=await r.arrayBuffer();if(bytes.byteLength>3_000_000)throw new Error('Bild zu groß');
    const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');if(hash!==s.logo_sha256)throw new Error('Bildfreigabe passt nicht');
    const src=URL.createObjectURL(new Blob([bytes],{type:'image/png'}));return {src,aufraeumen(){URL.revokeObjectURL(src);}};
  }
  const klasse = s => s.rolle === 'mitte' ? 'haupt' : s.rolle === 'top' ? 'p1896' : 'normal';
  const stand = s => ({frei:'Frei',vorgemerkt:'Vorgemerkt',fest:'Vergeben',option:'Angeboten'}[s.stand] || 'Vergeben');
  // Die Store-Hülle unterstützt iOS 15.0. Dort fehlt der native Dialog noch, deshalb ein begrenzter Ersatz.
  function modalOeffnen(d){
    if(typeof d.showModal === 'function'){d.showModal();return()=>d.close();}
    const schatten=document.createElement('div');schatten.className='bw-schatten';schatten.setAttribute('aria-hidden','true');document.body.appendChild(schatten);
    const alt=[...document.body.children].filter(e=>e!==d&&e!==schatten).map(e=>[e,e.getAttribute('aria-hidden')]), scroll=document.documentElement.style.overflow;
    alt.forEach(([e])=>e.setAttribute('aria-hidden','true'));document.documentElement.style.overflow='hidden';d.classList.add('bw-alt');d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('open','');
    const taste=e=>{if(e.key==='Escape'){e.preventDefault();d.dispatchEvent(new Event('cancel',{cancelable:true}));return;}if(e.key!=='Tab')return;
      const F=[...d.querySelectorAll('button,input,select,textarea,a[href],[tabindex="0"]')].filter(e=>!e.disabled&&!e.hidden&&e.getClientRects().length),a=F[0],z=F[F.length-1];if(!a)return;
      if(e.shiftKey&&(document.activeElement===a||document.activeElement===d.querySelector('h2'))){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}};
    d.addEventListener('keydown',taste);
    return()=>{d.removeEventListener('keydown',taste);d.removeAttribute('open');schatten.remove();document.documentElement.style.overflow=scroll;alt.forEach(([e,v])=>{if(v===null)e.removeAttribute('aria-hidden');else e.setAttribute('aria-hidden',v);});};
  }
  const rang = a => { const S = a.slice().sort((x,y) => x.pos-y.pos); let x = -S.reduce((n,s) => n+(s.art === 'doppel' ? 5 : 2.5),0)/2;
    return S.map(s => { const l = s.art === 'doppel' ? 5 : 2.5, o = {...s,x0:x,l}; x += l; return o; }); };
  // Derselbe feste Stadionplan wie bpReihe in svm101.js. Erst alle Plätze verorten, dann einen Bereich filtern.
  const bestandRang = (a,bereich) => {
    const G=84.4,NORD=50,SUED=48.6,RB=48.6,OST=52.5,P=Array.isArray(a)?a:[],out=[],
      von=k=>P.filter(p=>p.bereich===k).sort((a,b)=>a.nr-b.nr),
      laenge=p=>+p.laenge_cm>0?p.laenge_cm/100:parseInt(String(p.format||''),10)>0?parseInt(String(p.format),10)/100:3,
      sum=L=>L.reduce((s,p)=>s+laenge(p),0),
      eintrag=(p,l,x0,linie,plan,vor=0)=>out.push({...p,x0,l,h:(+(String(p.format||'').split('x')[1])||80)/100,kennung:String(p.nummer||p.nr),linie,plan,vor});
    const nordPunkt=s=>{const g=G/2;if(s < -g){const f=(-g-s)/NORD;return {x:-g-NORD*Math.sin(f),y:-NORD*Math.cos(f),w:-f*180/Math.PI,nx:-Math.sin(f),ny:-Math.cos(f)};}
      if(s > g){const f=(s-g)/NORD;return {x:g+NORD*Math.sin(f),y:-NORD*Math.cos(f),w:f*180/Math.PI,nx:Math.sin(f),ny:-Math.cos(f)};}return {x:s,y:-NORD,w:0,nx:0,ny:-1};};
    const nord=von('spielplatz').concat(von('laengsseite')),luecke=(p,i)=>i?Math.max(0,(+p.luecke_cm||0)/100):0;
    let x=OST-nord.reduce((s,p,i)=>s+luecke(p,i)+laenge(p),0);
    nord.forEach((p,i)=>{const l=laenge(p),vor=luecke(p,i);x+=vor;eintrag(p,l,x,'nord',nordPunkt(x+l/2),vor);x+=l;});
    const tor=von('tor'),h=Math.ceil(tor.length/2);let torFlach=-sum(tor)/2;
    const bogen=(L,cx,mitte,linie)=>{let a=mitte-sum(L)/RB/2;
      L.forEach(p=>{const l=laenge(p),am=a+l/RB/2;eintrag(p,l,torFlach,linie,{x:cx+RB*Math.cos(am),y:RB*Math.sin(am),w:am*180/Math.PI+90,nx:Math.cos(am),ny:Math.sin(am)});torFlach+=l;a+=l/RB;});};
    bogen(tor.slice(0,h),G/2,0,'ost');
    const sued=von('gegenseite');let xs=sum(sued)/2;
    sued.forEach(p=>{const l=laenge(p);eintrag(p,l,-xs,'sued',{x:xs-l/2,y:SUED,w:0,nx:0,ny:1});xs-=l;});
    bogen(tor.slice(h),-G/2,Math.PI,'west');
    return bereich==null?out:out.filter(p=>p.bereich===bereich);
  };
  let offen = null;
  async function oeffnen(opt) {
    if(offen) return;
    const fokus = document.activeElement, d = document.createElement('dialog'); d.className = 'bw';
    d.setAttribute('aria-labelledby','bwTitel'); d.innerHTML = `<header class="bw-kopf"><div><p class="bw-kicker">SV/BSC Mörlenbach · Saison ${E(opt.saison)}/${String(+opt.saison+1).slice(-2)}</p><h2 id="bwTitel" tabindex="-1">Euer Platz am Spielfeldrand</h2></div><button type="button" class="bw-zu" aria-label="Zurück zur Präsentation">Schließen</button></header><div class="bw-in"><p role="status">Der Belegungsplan wird geladen.</p></div>`;
    document.body.appendChild(d); offen = d; const dialogZu=modalOeffnen(d); d.querySelector('h2').focus();
    let lebt = true, resize = null, raf = 0, S = [], sel = null, kam = 0, ziel = 0, boxen = [], pxm = 40, paket = ['p1896','premium'].includes(opt.paket) ? opt.paket : 'club', eigen = null, neueZonen=false, rasen='haupt', alterWunsch=null,
      raum=null, raumBereit=false, stadionEinstieg=false, flach=false, heute=false, bestand=null, bereich='', bestandSel=null, hold=0, letzteTafeln=[],fotoSchliessen=null,fensterStop=null;
    let ciDaten=null, letzteFreigabe=null, letztesZeichen=null;
    const ciLaden=()=>ciDaten||(ciDaten=opt.rpc('banden_ci_liste',{p_saison:opt.saison}).catch(e=>{ciDaten=null;throw e;}));
    const objektQuellen=[], modi = new Map(), quellen = new Map(), imgs = new Map(), ruhig = matchMedia('(prefers-reduced-motion:reduce)').matches;
    const passtZuPaket=s=>klasse(s)===(paket==='p1896'?'p1896':'normal') &&
      (!neueZonen || s.zone!=='premium' || paket==='premium' || s.id===alterWunsch);
    const kameraBereich=()=>{if(!heute)return 'nord';const R=bestandRang(bestand?.plaetze||[],bereich);return (R.find(s=>s.id===bestandSel)||R[0])?.linie||'nord';};
    const flachStart=()=>{if(!flach)return;cancelAnimationFrame(raf);raf=0;const R=heute?bestandRang(bestand?.plaetze||[],bereich):S,s=R.find(s=>s.id===(heute?bestandSel:sel));
      kam=ziel=s?s.x0+s.l/2:R.length?(R[0].x0+R[R.length-1].x0+R[R.length-1].l)/2:0;};
    const blickBasis=()=>{const b=d.querySelector('#bwBlickpunkt');if(b)b.value='banden';};
    const reihenStart=()=>{blickBasis();if(flach){flachStart();malen();return;}if(!raum)return;
      const R=heute?bestandRang(bestand?.plaetze||[],bereich):[],s=R.find(s=>s.id===bestandSel)||(bereich==='tor'?R.find(s=>s.linie==='ost'):R[Math.floor((R.length-1)/2)]);
      if(s)raum.zentrieren(s.id);else raum.reset();};
    const bestandsEinstieg=()=>{if(heute&&raumBereit&&!stadionEinstieg&&raum?.rundblick){stadionEinstieg=true;raum.rundblick();d.querySelector('#bwBlickpunkt').value='platz';}};
    const eigeneVorschau=s=>!heute&&s.id===sel&&s.stand==='frei'&&rasen!=='kunst'&&passtZuPaket(s);
    const modus=s=>modi.get(s.id)||BANDEN_CI.standard(s);
    const auftraege=new Map(), fehler=new Map();
    function zeichendaten(s){
      return eigeneVorschau(s)?{key:BANDENMARKEN.schluessel(opt.firma),src:opt.originalLogo||opt.logo,firma:opt.firma,vorbereitet:!!opt.vergleich}:
        {key:s.markenschluessel,src:quellen.get(s.id),firma:s.firma};
    }
    function neuZeichnen(s){
      fehler.delete(s.id);imgs.delete(s.id);
      if(eigeneVorschau(s))void eigeneBande();else void platzBild(s);
      malen();
    }
    const istUmschaltbar=s=>s&&!heute&&(s.markenschluessel||s.logo||(eigeneVorschau(s)&&(opt.logo||BANDENMARKEN.schluessel(opt.firma))));
    const platzBild=async s=>{
      const m=modus(s),optik=BANDEN_CI.optionen(s),lauf={};auftraege.set(s.id,lauf);
      if(!modi.has(s.id)&&s.druckfassung)optik.hash=s.druckfassung.hash;
      try {
        const bild=await BANDEN_CI.tafel(s.markenschluessel,quellen.get(s.id),m,s.art==='doppel',optik);
        if(lebt&&auftraege.get(s.id)===lauf){fehler.delete(s.id);imgs.set(s.id,bild);malen();}
      }catch(err){if(lebt&&auftraege.get(s.id)===lauf){fehler.set(s.id,err.message);imgs.delete(s.id);malen();}}
    };
    const nahInfo=()=>{const s=heute?(bestand?.plaetze||[]).find(s=>s.id===bestandSel):S.find(s=>s.id===sel);if(!s)return null;
      const me=eigeneVorschau(s),bild=me?eigen:imgs.get(s.id);
      return {bild,titel:(heute?'Bande '+(s.nummer||s.nr):'Platz '+s.kennung)+' · '+(me?opt.firma:heute?s.firma||'Bandenplatz':BANDEN_CI.titel(s)),status:heute?'Heutiger Bestand':me?'Eure Gestaltungsvorschau · '+stand(s):s.kennzeichnung||stand(s)};};
    const nahStatus=()=>{const b=d.querySelector('#bwFoto');if(!b)return;const n=nahInfo(),s=S.find(s=>s.id===sel),schalter=d.querySelector('#bwLogocolor');
      schalter.hidden=!istUmschaltbar(s);
      const alteTaste=schalter.querySelector('[data-modus="alt"]');
      alteTaste.hidden=s?.druckfassung?.modus!=='alt';
      const m=s&&modus(s),art=s&&zeichendaten(s),z=s&&BANDEN_CI.optionen(s).zeichen;
      const freigabe=d.querySelector('#bwFreigabe'),ziel=opt.intern&&!heute&&s?.stand!=='frei'&&istUmschaltbar(s)&&m!=='original'&&(art.key||art.src)?JSON.stringify([s.id,m,z]):null;
      if(ziel!==letzteFreigabe){letzteFreigabe=ziel;freigabe.replaceChildren();freigabe._kennung=null;
        if(ziel)void BANDEN_CI.freigabefeld(freigabe,s,()=>quellen.get(s.id),ciLaden,opt.rpc,m,()=>{
          if(m==='alt'&&!s.druckfassung){modi.delete(s.id);neuZeichnen(s);}
        });}
      freigabe.hidden=!ziel;
      const feld=d.querySelector('#bwZeichen'),schluessel=istUmschaltbar(s)&&!art.key&&!art.vorbereitet&&art.src&&['ci','mix'].includes(m)?JSON.stringify([s.id,m,z]):null;
      if(letztesZeichen!==schluessel){letztesZeichen=schluessel;feld.replaceChildren();
        if(schluessel)bandenZeichenwahl(feld,art.src,z,wahl=>{
          BANDEN_CI.ausschnitte.set(s,wahl);modi.set(s.id,m);neuZeichnen(s);
          feld.querySelector('summary')?.focus({preventScroll:true});
        });}
      const hinweis=d.querySelector('#bwVariante');
      hinweis.textContent=istUmschaltbar(s)?fehler.get(s.id)||(art.key?BANDEN_CI.beschreibung({markenschluessel:art.key},m):BANDEN_CI.beschreibung(s,m,art.vorbereitet)):'';
      schalter.querySelectorAll('button').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.modus===m)));
      const gross=d.querySelector('#bwAufdruck');
      if(!gross.hidden){
        const box=d.querySelector('#bwFotoBild');
        if(n?.bild){n.bild.alt=n.titel;if(box.firstChild!==n.bild)box.replaceChildren(n.bild);}
        else box.textContent=fehler.get(s?.id)||'Aufdruck wird geladen …';
        d.querySelector('#bwFotoText').textContent=n?n.titel+' · '+n.status:'';
      }
      b.disabled=!n?.bild;d.querySelector('#bwAuswahl').textContent=n?n.titel+' · '+n.status:'Tippe auf eine Bande, um sie näher anzusehen.';};
    const schliessen = () => { lebt = false; for(const q of objektQuellen)q.aufraeumen(); cancelAnimationFrame(raf); cancelAnimationFrame(hold);if(fensterStop)window.removeEventListener('blur',fensterStop);raum?.zerstoeren(); resize?.disconnect(); dialogZu(); d.remove(); offen = null; fokus?.focus?.({preventScroll:true}); opt.onClose?.(); };
    d.querySelector('.bw-zu').onclick = schliessen; d.addEventListener('cancel',e => { e.preventDefault();if(fotoSchliessen&&!d.querySelector('#bwAufdruck').hidden){fotoSchliessen();d.querySelector('#bwFoto').focus({preventScroll:true});}else schliessen(); });
    const malen = () => {
      const cv = d.querySelector('canvas'); if(!lebt || !cv || !S.length) return;
      const R=heute?bestandRang(bestand?.plaetze||[]):S;
      const T = (heute&&flach?R.filter(s=>s.bereich===bereich):R).map(s => { const me = eigeneVorschau(s);
        const bild = me ? eigen : imgs.get(s.id);
        return {id:s.id,nr:s.kennung,x0:s.x0,l:s.l,h:s.h||.8,bereich:s.linie,plan:s.plan,an:s.id === (heute?bestandSel:sel),frei:(heute?s.status==='frei':s.stand === 'frei') && !me,img:bild||null,
          platztext:heute?null:BANDEN_CI.titel(s),name:me?opt.firma:heute?s.firma||(s.status==='frei'?'Freier Platz':'Bestandsbande'):BANDEN_CI.titel(s),farbe:bild ? null : s.farbe||'#ffffff',ring:s.rolle === 'mitte' ? '#e8741f' : null}; });
      letzteTafeln=T;nahStatus();if(raum){raum.setTafeln(T,{bereich:kameraBereich()});return;} if(!flach)return;
      const r = BANDE.reihe(cv,{tafeln:T,kamX:kam}); boxen = r.boxen; pxm = r.pxm || 40;
    };
    const fahrt = () => { raf = 0; if(!lebt) return; const diff = ziel-kam;
      kam = ruhig || Math.abs(diff)<.015 ? ziel : kam+diff*.18; malen(); if(kam !== ziel) raf = requestAnimationFrame(fahrt); };
    const fahren = x => { const R=heute?bestandRang(bestand?.plaetze||[],bereich):S;if(!R.length)return;
      ziel = Math.max(R[0].x0,Math.min(R[R.length-1].x0+R[R.length-1].l,x)); if(raum){kam=ziel;raum.zentrieren(heute?R.reduce((a,s)=>Math.abs(s.x0+s.l/2-x)<Math.abs(a.x0+a.l/2-x)?s:a,R[0]).id:x);return;}if(!raf) raf = requestAnimationFrame(fahrt); };
    const text = () => {
      const s = S.find(s => s.id === sel), el = d.querySelector('#bwDetail'), save = d.querySelector('#bwSpeichern');
      if(heute){const b=(bestand?.plaetze||[]).find(s=>s.id===bestandSel);el.innerHTML=b?`<div class="bw-detailkopf"><b>Bande ${E(b.nummer||b.nr)}</b><span>${E(b.firma||'Bestandsbande')}</span></div><p>Vorhandene Bande am Platz. Diese Ansicht ändert weder die Belegung noch einen Vertrag.</p>`:'<p>Schau dich zwischen den vorhandenen Banden um. Für einen eigenen Platzwunsch wechselst du zum Plan 2027/28.</p>';malen();return;}
      d.querySelectorAll('[data-bwslot]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.bwslot === sel)));
      if(rasen==='kunst'){
        el.textContent='Kunstrasenplatz gewünscht. Die genaue Position besprechen wir mit euch am Platz.';
        save.disabled=false;save.textContent='Kunstrasen als Wunsch merken';malen();return;
      }
      if(!s) { el.textContent = 'Wähle einen Platz in der Reihe. Du siehst eure Bande dann zwischen den Nachbarn.'; save.disabled = true; malen();return; }
      const passt = passtZuPaket(s);
      el.innerHTML = `<div class="bw-detailkopf"><b>Platz ${E(s.kennung)}</b><span>${E(stand(s))}${neueZonen&&s.rolle==='reihe'?(s.zone==='premium'?' · Bevorzugt':' · Standard'):''} · ${s.l === 5 ? '5' : '2,50'} × 0,80 m</span></div><p>${s.rolle === 'mitte' ? 'Die Mitte bleibt für den Hauptpartner reserviert.' : !passt ? s.rolle === 'top' ? 'Dieser Platz gehört zu den acht Plätzen für 1896 Partner.' : s.zone==='premium'?'Die Einzelplätze neben dem 1896-Kreis wählen zuerst die Premium-Partner. Für Club-Partner liegen die Standardplätze weiter außen.':'Dieser Einzelplatz gehört zum Club oder Premium Partner.' : s.stand !== 'frei' ? 'Der Platz ist bereits verplant. Ihr könnt euch für einen späteren Wechsel vormerken lassen.' : 'Eure Bande ist als Vorschau eingesetzt. Ein Platzwunsch reserviert noch keinen Platz.'}</p>`;
      save.disabled = !passt; save.textContent = s.stand === 'frei' ? 'Platzwunsch merken' : 'Für diesen Platz vormerken';
      const r = d.querySelector('#bwWeg'); r.value = String(s.pos); r.setAttribute('aria-valuetext',`Platz ${s.kennung}, ${stand(s)}`); malen();
    };
    const leisteZentrieren = id => { const l=d.querySelector('.bw-liste'), b=l&&[...l.querySelectorAll('[data-bwslot]')].find(b=>b.dataset.bwslot===id); if(l&&b)l.scrollLeft+=b.getBoundingClientRect().left-l.getBoundingClientRect().left-(l.clientWidth-b.offsetWidth)/2; };
    const waehlen = id => { const s = S.find(s => s.id === id); if(!s) return; blickBasis();sel = id; eigen=null; fahren(s.x0+s.l/2); text(); leisteZentrieren(id); void eigeneBande(); };
    let eigenerLauf=0;
    const eigeneBande = async () => {
      const lauf=++eigenerLauf, s=S.find(s=>s.id===sel);eigen=null;
      if(!s||!eigeneVorschau(s))return;
      const fmt = paket === 'p1896' ? '500x80' : '250x80';
      try {
        const key=BANDENMARKEN.schluessel(opt.firma);
        const mode=modus(s);
        const optik=BANDEN_CI.optionen(s,opt.firma);
        const gespeichert=mode==='ci'&&!optik.zeichen&&(!key||!modi.has(s.id))&&typeof opt.entwurfTextur==='function'?await opt.entwurfTextur(fmt):null;
        const eigeneGestaltung=gespeichert?.projekt?.quelle&&gespeichert.projekt.quelle!=='generator';
        const sondermotiv=gespeichert?.projekt?.generator?.pattern;
        if((key||opt.logo)&&!eigeneGestaltung&&!['bb','moerlens'].includes(sondermotiv)){
          const quelle=mode==='original'||mode==='mix'||optik.zeichen?(opt.originalLogo||opt.logo):opt.logo;
          const im=opt.vergleich?.[mode]
            ?await BANDEN_CI.persoenlicheTafel(opt.vergleich[mode],s.art==='doppel')
            :await BANDEN_CI.tafel(key,quelle,mode,s.art==='doppel',optik);
          if(lebt&&lauf===eigenerLauf){fehler.delete(s.id);eigen=im;malen();}return;
        }
        const spec = {format:fmt,stil:'ci',layout:opt.name ? 'links' : 'mitte',firma:opt.firma,name:opt.name||opt.firma,logo:opt.logo||null,nameAn:!!opt.name||!opt.logo,kontakt:false};
        const res = gespeichert?gespeichert.res:await BANDE.vorbereiten(spec,{basis:'partner/',wappen:'partner/svbsc.png'}), L = gespeichert?gespeichert.L:BANDE.layout(spec,res), c = BANDE.bild(L,res,.24,false), im = new Image();
        await new Promise((ok,no) => { im.onload = ok; im.onerror = no; im.src = c.toDataURL('image/png'); });
        if(lebt && lauf===eigenerLauf && fmt === (paket === 'p1896' ? '500x80' : '250x80')) { eigen = im; malen(); }
      } catch(err) { if(lebt&&lauf===eigenerLauf){fehler.set(s.id,err.message);malen();} }
    };
    try {
      const [data,heuteDaten] = await Promise.all([opt.rpc('banden_platzwahl',{p_code:opt.code,p_saison:opt.saison}),opt.rpc('banden_bestandsbild',{p_code:opt.code}).catch(()=>({fehler:true}))]); if(!lebt) return;
      S = rang(data.slots || []); if(!S.length) throw new Error('Für diese Saison ist noch kein Belegungsplan hinterlegt.');
      bestand=heuteDaten&&Array.isArray(heuteDaten.plaetze)&&heuteDaten.plaetze.length?heuteDaten:null;
      bereich=bestand?.plaetze.find(s=>s.bereich==='laengsseite')?.bereich||bestand?.plaetze[0]?.bereich||'';
      neueZonen=data.paketfassung===2;alterWunsch=data.eigen?.wunsch||null;
      if(neueZonen&&data.eigen?.rasen==='kunst')rasen='kunst';
      if(!neueZonen&&paket==='premium')paket='club';
      if(neueZonen&&data.eigen?.einzel==='premium')paket='premium';
      if(data.eigen?.paket === 'p1896') paket = 'p1896';
      sel = S.some(s => s.id === data.eigen?.wunsch) ? data.eigen.wunsch : S.find(s=>s.eigen)?.id||null;
      const frei = S.filter(s => s.stand === 'frei' && rasen!=='kunst' && passtZuPaket(s)).length;
      const innen = d.querySelector('.bw-in'); innen.innerHTML = `<div class="bw-ansicht" role="group" aria-label="Bestand oder Platzplanung"><button type="button" id="bwHeute"${bestand?'':' disabled'}>Heute am Platz</button><button type="button" id="bwZukunft" aria-pressed="true">Plan 2027/28</button></div>
        <div class="bw-bestand-status" id="bwBestandStatus" role="status"${bestand?' hidden':''}><span id="bwBestandText">${heuteDaten?.fehler?'Der heutige Bestand konnte nicht geladen werden. Du kannst es erneut versuchen.':'Für den heutigen Bestand sind noch keine Plätze erfasst. Der Zukunftsplan ist verfügbar.'}</span><button type="button" id="bwBestandNeu">Bestand erneut laden</button></div>
        <div class="bw-oben"><p id="bwEinordnung">Geh an der Reihe entlang und schau, wie eure Bande neben den anderen wirkt. Mitte und 1896-Plätze bleiben für diese Stufen reserviert.</p><label id="bwPaketLabel">Vorschau für<select id="bwPaket">${neueZonen?'<option value="club">Club Partner</option><option value="premium">Premium Partner</option>':'<option value="club">Club / Premium Partner</option>'}<option value="p1896">1896 Partner</option></select></label><label id="bwBereichLabel" hidden>Bereich<select id="bwBereich">${(bestand?.bereiche||[]).filter(b=>bestand.plaetze.some(p=>p.bereich===b.key)).map(b=>`<option value="${E(b.key)}">${E(b.titel)}</option>`).join('')}</select></label></div>
        <div class="bw-plan" data-bw-plan aria-label="Plätze von links nach rechts, vom Rasen aus"><span>Links</span><div class="bw-mini" aria-hidden="true">${S.map(s => `<i class="${E(s.rolle)} ${E(s.stand)}" style="flex:${s.l}"></i>`).join('')}</div><span>Rechts</span></div>
        <div class="bw-buehne"><canvas tabindex="0" role="img" aria-label="Begehbare Bandenansicht. WASD zum Gehen, Pfeile zum Drehen, mit Maus oder Finger umsehen. Alternativ die Tasten darunter nutzen."></canvas><span class="bw-bildhinweis" id="bwBildhinweis">Vorschau, keine Reservierung</span><button type="button" class="bw-bildgross" id="bwBildGross">Große Ansicht</button><div class="bw-aufdruck" id="bwAufdruck" hidden><button type="button" id="bwFotoZu" class="bw-zu">Zurück zum Rundgang</button><div id="bwFotoBild"></div><p id="bwFotoText"></p></div></div>
        <div class="bw-navigation" role="group" aria-label="Im Stadion bewegen"><div class="bw-navgruppe"><span>Gehen · gedrückt halten</span><div class="bw-schritte"><button type="button" data-bwbeweg="vor" aria-label="Vorwärts gehen">Vorwärts</button><button type="button" data-bwbeweg="links" aria-label="Seitwärts nach links gehen">Links</button><button type="button" data-bwbeweg="zurueck" aria-label="Rückwärts gehen">Rückwärts</button><button type="button" data-bwbeweg="rechts" aria-label="Seitwärts nach rechts gehen">Rechts</button></div></div><label class="bw-blickpunkt">Blickpunkt<select id="bwBlickpunkt" disabled><option value="banden">Bandenreihe</option><option value="platz">Über den Platz</option><option value="vereinsheim">Zum Vereinsheim</option><option value="anlage">Vereinsheim und Platz</option></select></label><div class="bw-navgruppe"><span>Blick drehen</span><div class="bw-blick"><button type="button" data-bwblick="-1" aria-label="Nach links schauen">↶</button><button type="button" id="bwUebersicht">Startansicht</button><button type="button" data-bwblick="1" aria-label="Nach rechts schauen">↷</button><button type="button" id="bwGross" aria-pressed="false">Groß ansehen</button></div></div></div>
        <div class="bw-nah"><div class="bw-farbwahl" id="bwLogocolor" role="group" aria-label="Logofarben dieser Bande" hidden><button type="button" data-modus="ci" aria-pressed="true">Vereins-CI</button><button type="button" data-modus="mix" aria-pressed="false">Firmenfarbe</button><button type="button" data-modus="original" aria-pressed="false">Originallogo</button><button type="button" data-modus="alt" aria-pressed="false" hidden>Bisherige Freigabe</button></div><small id="bwVariante" role="status"></small><div id="bwZeichen" class="bz-edit"></div><div id="bwFreigabe" hidden></div><p id="bwAuswahl" aria-live="polite">Tippe auf eine Bande, um sie näher anzusehen.</p><button type="button" id="bwFoto" disabled aria-controls="bwAufdruck">Aufdruck groß ansehen</button></div>
        <p class="bw-bedienung" id="bwRaumStatus" role="status">Die 3D-Ansicht wird vorbereitet.</p>
        <p class="bw-bedienung" id="bwVormerkung" hidden></p>
        <div class="bw-gehen" data-bw-plan><button type="button" data-bwgehen="-1" aria-label="Einen Platz nach links">←</button><label>Direkt zu einem Platz<input id="bwWeg" type="range" min="${S[0].pos}" max="${S[S.length-1].pos}" step="1" value="17"></label><button type="button" data-bwgehen="1" aria-label="Einen Platz nach rechts">→</button></div>
        <div class="bw-liste" data-bw-plan role="group" aria-label="Platz auswählen">${S.map(s => `<button type="button" data-bwslot="${E(s.id)}" class="${E(s.rolle)} ${E(s.stand)}" aria-pressed="false"><b>${E(s.kennung)}</b><span>${E(BANDEN_CI.titel(s))}</span></button>`).join('')}</div>
        <div class="bw-unten"><div id="bwDetail" aria-live="polite"></div><div class="bw-merken" data-bw-plan>${neueZonen?'<label>Gewünschter Platz<select id="bwRasen"><option value="haupt">Hauptplatz</option><option value="kunst">Kunstrasenplatz</option></select></label>':''}<label><input id="bwNach" type="checkbox"${data.eigen?.nachruecken ? ' checked' : ''}> Bei einem besseren freien Platz berücksichtigen</label><label><input id="bwFlex" type="checkbox"${data.eigen?.flexibel === false ? '' : ' checked'}> Auch andere passende Plätze anbieten</label><button id="bwSpeichern" type="button" class="bw-haupt">Platzwunsch merken</button><button id="bwZurueck" type="button" class="bw-zu"${data.eigen?.wunsch||data.eigen?.nachruecken||data.eigen?.rasen==='kunst'?'':' hidden'}>Platzwunsch zurücknehmen</button><p id="bwMeldung" role="status"></p></div></div>
        <button type="button" id="bwPlanStart" class="bw-haupt" hidden>Platz für 2027/28 wählen</button>
        <p class="bw-fuss">Die Reihe ist für 2027/28 geplant. Lage und Nachbarn können sich bis zur Montage ändern. Eure Auswahl bleibt unverbindlich. Andere Firmennamen und Logos erscheinen nur mit Freigabe. ${frei ? '' : 'In dieser Stufe ist gerade kein Platz frei. Mit eurem Wunsch kommt ihr auf die Warteliste.'}</p>`;
      d.querySelector('#bwLogocolor').onclick=e=>{
        const btn=e.target.closest('button[data-modus]'),s=S.find(s=>s.id===sel);
        if(!btn||!istUmschaltbar(s)||modus(s)===btn.dataset.modus)return;
        modi.set(s.id,btn.dataset.modus);neuZeichnen(s);
      };
      const paketSel = d.querySelector('#bwPaket'); paketSel.value = paket;
      const platzSel=d.querySelector('#bwRasen');
      if(platzSel){platzSel.value=rasen;platzSel.onchange=()=>{rasen=platzSel.value;eigen=null;text();void eigeneBande();};}
      paketSel.onchange = () => { paket = paketSel.value; eigen = null; text(); void eigeneBande(); };
      d.querySelectorAll('[data-bwslot]').forEach(b => b.onclick = () => waehlen(b.dataset.bwslot));
      d.querySelectorAll('[data-bwgehen]').forEach(b => b.onclick = () => { const nah = S.reduce((a,s) => Math.abs(s.x0+s.l/2-ziel) < Math.abs(a.x0+a.l/2-ziel) ? s : a,S[0]); waehlen(S[Math.max(0,Math.min(S.length-1,S.indexOf(nah)+ +b.dataset.bwgehen))].id); });
      d.querySelector('#bwWeg').oninput = e => waehlen(S.find(s => s.pos === +e.target.value)?.id);
      let cv = d.querySelector('canvas');
      const ausBild=id=>{if(heute){const s=bestandRang(bestand?.plaetze||[]).find(s=>s.id===id);if(!s)return;
        bestandSel=id;bereich=s.bereich;d.querySelector('#bwBereich').value=bereich;stadionEinstieg=true;blickBasis();flachStart();text();raum?.zentrieren(id);}else waehlen(id);};
      const stopHold=()=>{cancelAnimationFrame(hold);hold=0;};
      fensterStop=stopHold;window.addEventListener('blur',fensterStop);
      const wechseln=h=>{stopHold();heute=!!h&&!!bestand;bestandSel=null;
        fotoZu();
        d.querySelector('.bw-kicker').textContent=heute?'SV/BSC Mörlenbach · Heutiger Bestand':'SV/BSC Mörlenbach · Saison 2027/28';
        d.querySelector('#bwHeute').setAttribute('aria-pressed',String(heute));d.querySelector('#bwZukunft').setAttribute('aria-pressed',String(!heute));
        d.querySelectorAll('[data-bw-plan]').forEach(e=>e.hidden=heute);d.querySelector('#bwPaketLabel').hidden=heute;d.querySelector('#bwBereichLabel').hidden=!heute;d.querySelector('#bwPlanStart').hidden=!heute;
        d.querySelector('#bwEinordnung').textContent=heute?'Die vorhandenen Banden mit ihren Originalaufdrucken. Schau dich frei um. Für die nächste Saison gibt es einen eigenen Platzplan.':'Platzplan für 2027/28. Eure Gestaltung lässt sich an verschiedenen Positionen ansehen. Freigegebene Partner erscheinen mit ihrem Logo. Vormerkungen sind gekennzeichnet.';
        if(!heute&&neueZonen)d.querySelector('#bwEinordnung').textContent='Hauptpartner in der Mitte, vier 1896-Banden links und rechts. Die angrenzenden Einzelplätze wählen Premium-Partner nach Zusagedatum. Standardplätze liegen außen. Druckkosten kommen hinzu.';
        d.querySelector('#bwBildhinweis').textContent=heute?'Heutiger Bestand · Stadion nach Originalfotos':'Plan 2027/28 · Stadion nach Originalfotos';
        const v=d.querySelector('#bwVormerkung'),vormerkungen=S.filter(s=>s.kennzeichnung&&s.firma);v.hidden=heute||!vormerkungen.length;v.textContent=vormerkungen.map(s=>s.firma+' · Platz '+s.kennung+': '+s.kennzeichnung).join('. ');
        d.querySelector('.bw-fuss').textContent=heute?'Heutiger Bestand laut Vereinsplan. Stadion nach Originalfotos; Maße und Blickwinkel sind angenähert.':'Die Reihe ist für 2027/28 geplant. Lage und Nachbarn können sich bis zur Montage ändern. Eure Auswahl bleibt unverbindlich. Andere Firmennamen und Logos erscheinen nur mit Freigabe.';
        flachStart();text();reihenStart();if(heute)bestandsEinstieg();else if(sel)fahren(S.find(s=>s.id===sel).x0+S.find(s=>s.id===sel).l/2);
      };
      d.querySelector('#bwHeute').onclick=()=>wechseln(true);d.querySelector('#bwZukunft').onclick=()=>wechseln(false);d.querySelector('#bwPlanStart').onclick=()=>wechseln(false);
      const bereichSel=d.querySelector('#bwBereich');bereichSel.value=bereich;bereichSel.onchange=()=>{stopHold();bereich=bereichSel.value;bestandSel=null;stadionEinstieg=true;flachStart();text();reihenStart();};
      const blickSel=d.querySelector('#bwBlickpunkt');blickSel.onchange=()=>{stopHold();if(!raumBereit||!raum)return;if(heute)stadionEinstieg=true;
        if(blickSel.value==='platz')raum.rundblick?.();else if(blickSel.value==='vereinsheim')raum.vereinsheim?.();else if(blickSel.value==='anlage')raum.anlagenblick?.();else reihenStart();};
      const bestandBilderLaden=()=>{(bestand?.plaetze||[]).filter(s=>s.bild&&!imgs.has(s.id)).forEach(s=>{const im=new Image();im.onload=()=>{if(lebt){imgs.set(s.id,im);malen();}};im.src=s.bild;});};
      d.querySelector('#bwBestandNeu').onclick=async e=>{const b=e.currentTarget;b.disabled=true;d.querySelector('#bwBestandText').textContent='Der heutige Bestand wird geladen.';
        try{const r=await opt.rpc('banden_bestandsbild',{p_code:opt.code});if(!lebt)return;if(!Array.isArray(r?.plaetze)||!r.plaetze.length)throw new Error('Noch kein Bestand');
          bestand=r;bereich=r.plaetze.find(s=>s.bereich==='laengsseite')?.bereich||r.plaetze[0].bereich;bereichSel.innerHTML=(r.bereiche||[]).filter(x=>r.plaetze.some(p=>p.bereich===x.key)).map(x=>`<option value="${E(x.key)}">${E(x.titel)}</option>`).join('');bereichSel.value=bereich;
          d.querySelector('#bwHeute').disabled=false;d.querySelector('#bwBestandStatus').hidden=true;bestandBilderLaden();wechseln(true);
        }catch(_){if(lebt)d.querySelector('#bwBestandText').textContent='Der heutige Bestand ist gerade nicht verfügbar. Du kannst es noch einmal versuchen oder den Zukunftsplan nutzen.';}
        finally{if(lebt)b.disabled=false;}};
      d.querySelector('#bwUebersicht').onclick=()=>{stopHold();if(heute)stadionEinstieg=true;reihenStart();};
      d.querySelector('#bwGross').onclick=e=>{stopHold();const an=d.classList.toggle('bw-immersiv');e.currentTarget.textContent=an?'Kleine Ansicht':'Groß ansehen';e.currentTarget.setAttribute('aria-pressed',String(an));d.scrollTop=0;if(an)cv.focus({preventScroll:true});else e.currentTarget.focus({preventScroll:true});};
      d.querySelector('#bwBildGross').onclick=()=>d.querySelector('#bwGross').click();
      const nav=d.querySelector('.bw-navigation');
      const fotoZu=()=>{d.querySelector('#bwAufdruck').hidden=true;d.querySelector('#bwFotoBild').replaceChildren();nav.hidden=flach;cv.tabIndex=0;};
      fotoSchliessen=fotoZu;
      d.querySelector('#bwFotoZu').onclick=()=>{fotoZu();d.querySelector('#bwFoto').focus({preventScroll:true});};
      d.querySelector('#bwFoto').onclick=()=>{const n=nahInfo();if(!n?.bild)return;stopHold();n.bild.alt=n.titel;d.querySelector('#bwFotoBild').replaceChildren(n.bild);d.querySelector('#bwFotoText').textContent=n.titel+' · '+n.status;
        d.querySelector('#bwAufdruck').hidden=false;nav.hidden=true;cv.tabIndex=-1;d.querySelector('#bwFotoZu').focus({preventScroll:true});};
      nav.querySelectorAll('button[data-bwbeweg],button[data-bwblick]').forEach(b=>{
        const beweg=dt=>{if(!raum)return;if(b.dataset.bwblick)raum.drehen(+b.dataset.bwblick*dt*1.15,0);
          else {const r={vor:[1,0],zurueck:[-1,0],links:[0,-1],rechts:[0,1]}[b.dataset.bwbeweg];raum.gehen(r[0],r[1],dt);}};
        b.onpointerdown=e=>{if(!raum)return;e.preventDefault();b.focus({preventScroll:true});stopHold();b.setPointerCapture(e.pointerId);beweg(.16);let vor=0;
          const tick=t=>{if(!lebt||!raum||document.hidden){stopHold();return;}if(vor)beweg(Math.min(.05,(t-vor)/1000));vor=t;hold=requestAnimationFrame(tick);};hold=requestAnimationFrame(tick);};
        b.onpointerup=b.onpointercancel=b.onlostpointercapture=stopHold;b.onclick=e=>{if(e.detail===0)beweg(.22);};
      });
      const flachEinrichten=()=>{if(!lebt||flach)return;stopHold();raum?.zerstoeren();raum=null;raumBereit=false;blickSel.disabled=true;flach=true;const neu=cv.cloneNode(false);cv.replaceWith(neu);cv=neu;
        d.classList.remove('bw-immersiv');d.querySelector('#bwGross').textContent='Groß ansehen';d.querySelector('#bwGross').setAttribute('aria-pressed','false');d.scrollTop=0;
        d.querySelector('#bwBildGross').hidden=true;
        cv.setAttribute('aria-label','Bandenreihe als flache Übersicht. Mit den Pfeiltasten, dem Regler oder der Platzliste wählen.');nav.hidden=true;d.querySelector('#bwRaumStatus').textContent='3D ist auf diesem Gerät gerade nicht verfügbar. Die flache Übersicht und die Platzwahl funktionieren weiter.';
        let drag=null;cv.onpointerdown=e=>{drag={x:e.clientX,k:kam,weg:0};cv.setPointerCapture(e.pointerId);};
        cv.onpointermove=e=>{if(!drag)return;const dx=e.clientX-drag.x;drag.weg=Math.max(drag.weg,Math.abs(dx));fahren(drag.k-dx/Math.max(8,pxm));};
        cv.onpointerup=e=>{if(!drag)return;const click=drag.weg<7;drag=null;if(!click)return;const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
          const hit=boxen.filter(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y-28&&y<=b.y+b.h+10).sort((a,b)=>b.w-a.w)[0];if(hit)ausBild(hit.id);};
        cv.onpointercancel=()=>{drag=null;};cv.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();if(heute)fahren(kam+(e.key==='ArrowLeft'?-3:3));else d.querySelector(`[data-bwgehen="${e.key==='ArrowLeft'?'-1':'1'}"]`).click();}};
        resize?.disconnect();resize=new ResizeObserver(malen);resize.observe(cv);flachStart();malen();cv.focus({preventScroll:true});
      };
      const starteRaum=async()=>{try{
        if(!window.BANDENRAUM)await new Promise((ja,nein)=>{const s=document.createElement('script');s.src='bandenraum.js?v='+encodeURIComponent(opt.build||'');s.onload=ja;s.onerror=nein;document.head.appendChild(s);});
        if(!lebt)return;if(!window.BANDENRAUM)throw new Error('3D-Modul fehlt');
        raum=BANDENRAUM.erstellen(cv,{tafeln:letzteTafeln,bereich:kameraBereich(),three:'vendor/three.min.js',texturen:{rasen:'partner/stadion-rasen.webp',weg:'partner/stadion-weg.webp'},
          onSelect:ausBild,onStatus:t=>{if(lebt)d.querySelector('#bwRaumStatus').textContent=t;},onFallback:flachEinrichten});
        await raum.bereit;if(!lebt)return;if(flach){raum?.zerstoeren();raum=null;return;}raumBereit=true;blickSel.disabled=false;d.querySelector('#bwRaumStatus').textContent='WASD zum Gehen. Pfeile oder Ziehen zum Umsehen. Am Handy die Tasten nutzen.';malen();if(heute){reihenStart();bestandsEinstieg();}else if(sel)raum.zentrieren(sel);
      }catch(_){flachEinrichten();}};
      d.querySelector('#bwSpeichern').onclick = async e => {
        const b = e.currentTarget, s = S.find(s => s.id === sel); if(heute || (rasen!=='kunst' && !s) || b.disabled) return; b.disabled = true;
        const msg = d.querySelector('#bwMeldung'), w = {saison:opt.saison,wunsch:rasen==='kunst'?null:sel,rasen,paket,nachruecken:rasen!=='kunst'&&d.querySelector('#bwNach').checked,flexibel:d.querySelector('#bwFlex').checked};
        try { const r = await opt.rpc('banden_wunsch_setzen',{p_code:opt.code,p:w}); if(!lebt) return;
          msg.textContent = r.demo ? 'Probeansicht: Hier wird nichts gespeichert.' : 'Euer Platzwunsch ist gespeichert. Das Partner-Team stimmt den Platz mit euch ab.'; alterWunsch=w.wunsch; d.querySelector('#bwZurueck').hidden=false; opt.onSaved?.({...w,kennung:rasen==='kunst'?'Kunstrasenplatz':s.kennung});
        } catch(err) { if(lebt) msg.textContent = err.message || 'Der Wunsch wurde nicht gespeichert. Bitte versuche es noch einmal.'; }
        finally { if(lebt) b.disabled = false; }
      };
      d.querySelector('#bwZurueck').onclick = async e => { if(heute)return;const b=e.currentTarget; b.disabled=true;
        try { const r=await opt.rpc('banden_wunsch_setzen',{p_code:opt.code,p:{saison:opt.saison,paket,wunsch:null,nachruecken:false,flexibel:true}}); if(!lebt)return;
          sel=null;alterWunsch=null;rasen='haupt';if(platzSel)platzSel.value=rasen; d.querySelector('#bwNach').checked=false; b.hidden=true; text(); d.querySelector('#bwMeldung').textContent=r.demo?'Probeansicht: Hier wird nichts gespeichert.':'Euer Platzwunsch ist zurückgenommen. Bestehende Vereinbarungen bleiben erhalten.'; opt.onSaved?.(null);
        } catch(err) { if(lebt)d.querySelector('#bwMeldung').textContent=err.message||'Der Wunsch wurde nicht zurückgenommen. Bitte versuche es noch einmal.'; }
        finally { if(lebt)b.disabled=false; }
      };
      S.filter(s=>s.logo||s.markenschluessel).forEach(async s=>{
        try{
          if(s.logo&&!s.markenschluessel){
            const q=await logoQuelle(s);if(!lebt){q.aufraeumen();return;}objektQuellen.push(q);quellen.set(s.id,q.src);
          }
          await platzBild(s);
        }catch(_){if(lebt)d.querySelector('#bwRaumStatus').textContent='Ein Partnerlogo konnte nicht geladen werden.';}
      });
      bestandBilderLaden();
      wechseln(false);if(!heute&&sel)waehlen(sel);else leisteZentrieren(S.find(s=>s.rolle==='mitte')?.id);void starteRaum();
    } catch(err) { if(lebt) d.querySelector('.bw-in').innerHTML = `<p role="alert">${E(err.message || 'Der Plan lässt sich gerade nicht laden.')}</p><button type="button" class="bw-haupt" id="bwNochmal">Noch einmal versuchen</button>`;
      d.querySelector('#bwNochmal')?.addEventListener('click',() => { schliessen(); void oeffnen(opt); }); }
  }
  return {oeffnen,rang,bestandRang,klasse,modalOeffnen,logoQuelle};
})();

/* Interne Konditionen. Der Parent zeigt den Einstieg nur mit Vertragsrecht.
   Die RPC prüft das Recht und berechnet alle Preise erneut. Keine eigene Anmeldung. */
(function(){
  'use strict';
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const euro=n=>(+n||0).toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';
  let offen=null;
  function oeffnen(o){
    if(!o||typeof o.rpc!=='function'||typeof o.code!=='string')return null;
    if(offen){offen.element.querySelector('.pk132-zu')?.focus();return offen;}
    const katalog=(o.katalog||[]).filter(l=>l&&l.aktiv!==false&&l.preis!=null&&!['spende','sonstiges'].includes(l.art));
    const teams=(o.mannschaften||[]).filter(m=>m&&m.aktiv!==false);
    const L=k=>katalog.find(l=>l.key===k);
    let zeilen=(o.positionen||[]).map(p=>({key:p.key,mannschaft:p.mannschaft||null,menge:+p.menge||1,nachlass:+p.nachlass||0,zusaetzlich:!!(p.zusaetzlich||p.zusatzpaket),vereinbarung:{...(p.vereinbarung||{})}}));
    let zu=false,busy=false;
    const zuvor=document.activeElement,altOverflow=document.body.style.overflow;
    const hintergrund=document.createElement('div');hintergrund.className='pk132-hintergrund';
    hintergrund.innerHTML='<section class="pk132" role="dialog" aria-modal="true" aria-labelledby="pk132Titel"><header><div><p>Nur für das Partner-Team</p><h2 id="pk132Titel">Konditionen im Termin</h2></div><button type="button" class="pk132-zu" aria-label="Konditionen schließen">Schließen</button></header><div class="pk132-in"><p class="pk132-hilfe">Leg die Auswahl und den Nachlass je Leistung fest. Die Firma kann diese Konditionen 14 Tage lang über ihren Link übernehmen.</p><div class="pk132-zeit"><label>Laufzeit<select id="pk132Saisons">'+[1,2,3,4,5].map(n=>'<option value="'+n+'">'+n+' '+(n===1?'Saison':'Saisons')+'</option>').join('')+'</select></label><label>Beginn<input type="date" id="pk132Beginn"></label></div><div class="pk132-zeilen"></div><div class="pk132-dazu"><label for="pk132Leistung">Weitere Leistung</label><div><select id="pk132Leistung"><option value="">Bitte wählen</option>'+katalog.map(l=>'<option value="'+esc(l.key)+'">'+esc(l.titel)+'</option>').join('')+'</select><button type="button" id="pk132Dazu">Hinzufügen</button></div></div><label class="pk132-check"><input type="checkbox" id="pk132Auto"> Saisonleistungen laufen nach der gewählten Laufzeit von selbst weiter</label><p class="pk132-gratis" hidden>Die Saisonleistungen sind vollständig geschenkt. Sie enden nach der gewählten Laufzeit und verlängern sich nicht automatisch.</p><div class="pk132-summe" aria-live="polite"></div><p class="pk132-fehler" role="alert" hidden></p></div><footer><p>Mit dem Speichern wird noch kein Vertrag geschlossen und keine Nachricht verschickt.</p><div><button type="button" id="pk132Abbrechen">Abbrechen</button><button type="button" id="pk132Speichern">Konditionen speichern</button></div></footer></section>';
    document.body.appendChild(hintergrund);document.body.style.overflow='hidden';
    const $=s=>hintergrund.querySelector(s);
    $('#pk132Saisons').value=String(Math.max(1,Math.min(5,+o.saisons||1)));
    $('#pk132Beginn').value=String(o.beginn||'').slice(0,10);$('#pk132Auto').checked=!!o.auto_verlaengerung;
    function schliessen(){if(zu||busy)return;zu=true;document.removeEventListener('keydown',taste,true);hintergrund.remove();document.body.style.overflow=altOverflow;if(zuvor&&zuvor.isConnected)zuvor.focus();if(offen&&offen.element===hintergrund)offen=null;if(typeof o.geschlossen==='function'){try{o.geschlossen();}catch(e){}}}
    function fehler(t){const e=$('.pk132-fehler');e.hidden=!t;e.textContent=t||'';if(t)e.scrollIntoView({block:'nearest'});}
    function berechnung(){
      const s=+$('#pk132Saisons').value,rab=s>=3?10:s===2?5:0;
      const pk=['p1896','premium','club','supporter'].find(k=>zeilen.some(p=>p.key===k));
      let jahr=0,einmal=0,hatSaison=false;
      const positionen=zeilen.map(p=>{const l=L(p.key);if(!l)return Object.assign({},p,{fehlt:true});
        let cent=Math.round(+l.preis*100);if(l.key==='sotd')cent=Math.max(0,cent-(pk==='club'?2000:['premium','p1896'].includes(pk)?4000:0));
        const nc=Math.round((+p.nachlass||0)*100),einzelCent=Math.round(cent*(10000-nc)/10000),saisonal=l.einheit==='saison'&&['paket','flaeche','patenschaft'].includes(l.art);
        const summeCent=Math.round(einzelCent*(+p.menge||1)*(saisonal?100-rab:100)/100);
        if(saisonal){hatSaison=true;jahr+=summeCent;}else einmal+=summeCent;
        return Object.assign({},p,{basis:cent/100,einzel:einzelCent/100,summe:summeCent/100,saisonal});});
      return{positionen,netto_jahr:jahr/100,einmalig:einmal/100,netto_gesamt:(jahr*s+einmal)/100,hat_saison:hatSaison,gratis_saison:hatSaison&&jahr===0,rabatt:rab};
    }
    function summe(){const c=berechnung(),gratis=$('.pk132-gratis'),auto=$('#pk132Auto');
      gratis.hidden=!c.gratis_saison;auto.disabled=c.gratis_saison||busy;if(c.gratis_saison)auto.checked=false;
      $('.pk132-summe').innerHTML=(c.hat_saison?'<div><span>Je Saison, netto'+(c.rabatt&&c.netto_jahr>0?' einschließlich '+c.rabatt+' % Laufzeitvorteil':'')+'</span><b>'+euro(c.netto_jahr)+'</b></div>':'')+(c.einmalig?'<div><span>Einmalige Leistungen, netto</span><b>'+euro(c.einmalig)+'</b></div>':'')+'<div class="pk132-gesamt"><span>Gesamt über die Laufzeit, netto</span><b>'+euro(c.netto_gesamt)+'</b></div>';
      c.positionen.forEach((p,i)=>{const e=$('[data-pk132betrag="'+i+'"]');if(e)e.textContent=(['aermel_erste','aermel_zweite','aermel_jugend','trikot_jugend','aermel_anzug_l','aermel_anzug_r'].includes(p.key)?'ca. ':'')+euro(p.summe)+(p.saisonal?' je Saison':'');});}
    function vereinbarungen(p,i){
      const bande=['club','premium','p1896','bande_erste','bande_zweite'].includes(p.key);
      function feld(key,name,optionen){
        const option=(v,t)=>'<option value="'+v+'"'+(p.vereinbarung?.[key]===v?' selected':'')+'>'+t+'</option>';
        return '<label>'+name+'<select data-pk132wahl="'+i+'" data-feld="'+key+'">'+option('','Paketvorgabe')+optionen.map(([v,t])=>option(v,t)).join('')+'</select></label>';
      }
      return '<div class="pk132-felder">'+feld('foerderung','Förderbereich',[['gesamt','Gesamtfußball'],['jugend','Jugend'],['senioren','Senioren']])+
        (bande?feld('kategorie','Bandenplatz',[['standard','Standardplatz'],['premium','Bevorzugter Platz']])+feld('rasen','Spielstätte',[['haupt','Hauptplatz'],['kunst','Kunstrasenplatz']]):'')+'</div>';
    }
    function render(){
      const pkAnzahl=zeilen.filter(p=>L(p.key)?.art==='paket').length;
      $('.pk132-zeilen').innerHTML=zeilen.length?zeilen.map((p,i)=>{const l=L(p.key)||{};
        return '<article class="pk132-zeile"><div class="pk132-zeilenkopf"><h3>'+esc(l.titel||p.key)+'</h3><button type="button" data-pk132weg="'+i+'" aria-label="'+esc(l.titel||p.key)+' entfernen">Entfernen</button></div><div class="pk132-felder">'+(l.je_mannschaft?'<label>Mannschaft<select data-pk132team="'+i+'"><option value="">Bitte wählen</option>'+teams.filter(m=>l.bereich!=='jugend'||m.art==='jugend').map(m=>'<option value="'+esc(m.id)+'"'+(m.id===p.mannschaft?' selected':'')+'>'+esc(m.name||m.id)+'</option>').join('')+'</select></label>':'')+(['stueck','spieltag'].includes(l.einheit)?'<label>Menge<input type="number" min="1" max="99" step="1" data-pk132menge="'+i+'" value="'+p.menge+'"></label>':'')+'<label>Individueller Nachlass<input type="number" min="0" max="100" step="0.01" inputmode="decimal" data-pk132nach="'+i+'" value="'+p.nachlass+'"><span>Prozent</span></label></div>'+(l.art==='paket'&&pkAnzahl>1?'<label class="pk132-check"><input type="checkbox" data-pk132zusatz="'+i+'"'+(p.zusaetzlich?' checked':'')+'> Als zusätzliches Paket genehmigen</label>':'')+vereinbarungen(p,i)+'<p class="pk132-betrag" data-pk132betrag="'+i+'"></p></article>';}).join(''):'<p class="pk132-leer">Füge zuerst die gewünschte Leistung hinzu.</p>';
      hintergrund.querySelectorAll('[data-pk132wahl]').forEach(f=>f.onchange=()=>{
        const w=zeilen[+f.dataset.pk132wahl].vereinbarung;
        if(f.value)w[f.dataset.feld]=f.value;else delete w[f.dataset.feld];
      });
      hintergrund.querySelectorAll('[data-pk132weg]').forEach(b=>b.onclick=()=>{const i=+b.dataset.pk132weg;zeilen.splice(i,1);render();const n=$('[data-pk132weg="'+Math.min(i,zeilen.length-1)+'"]')||$('#pk132Leistung');n.focus();});
      hintergrund.querySelectorAll('[data-pk132nach]').forEach(f=>f.oninput=()=>{zeilen[+f.dataset.pk132nach].nachlass=f.value===''?0:+f.value;summe();});
      hintergrund.querySelectorAll('[data-pk132menge]').forEach(f=>f.oninput=()=>{zeilen[+f.dataset.pk132menge].menge=f.value===''?0:+f.value;summe();});
      hintergrund.querySelectorAll('[data-pk132team]').forEach(f=>f.onchange=()=>{zeilen[+f.dataset.pk132team].mannschaft=f.value||null;});
      hintergrund.querySelectorAll('[data-pk132zusatz]').forEach(f=>f.onchange=()=>{zeilen[+f.dataset.pk132zusatz].zusaetzlich=f.checked;});
      summe();
    }
    $('#pk132Dazu').onclick=()=>{const key=$('#pk132Leistung').value,l=L(key);if(!l){fehler('Wähl zuerst eine Leistung.');return;}
      if(!l.je_mannschaft&&zeilen.some(p=>p.key===key)){fehler('Diese Leistung steht schon in der Auswahl.');return;}
      if(zeilen.length>=24){fehler('In eine Auswahl passen höchstens 24 Leistungen.');return;}
      zeilen.push({key,mannschaft:null,menge:1,nachlass:0,vereinbarung:{},zusaetzlich:l.art==='paket'&&zeilen.some(p=>L(p.key)?.art==='paket')});$('#pk132Leistung').value='';fehler('');render();const i=zeilen.length-1;($('[data-pk132team="'+i+'"]')||$('[data-pk132nach="'+i+'"]')).focus();};
    $('#pk132Saisons').onchange=summe;$('#pk132Auto').onchange=summe;
    $('.pk132-zu').onclick=schliessen;$('#pk132Abbrechen').onclick=schliessen;
    function taste(e){if(zu)return;if(e.key==='Escape'){e.preventDefault();e.stopPropagation();schliessen();return;}
      if(e.key==='Tab'){const a=[...hintergrund.querySelectorAll('button,input,select')].filter(x=>!x.disabled&&x.getClientRects().length);if(!a.length)return;const f=a[0],l=a[a.length-1];if(!hintergrund.contains(document.activeElement)){e.preventDefault();(e.shiftKey?l:f).focus();}else if(e.shiftKey&&document.activeElement===f){e.preventDefault();l.focus();}else if(!e.shiftKey&&document.activeElement===l){e.preventDefault();f.focus();}}}
    document.addEventListener('keydown',taste,true);
    $('#pk132Speichern').onclick=async()=>{if(busy)return;fehler('');
      const c=berechnung(),saisons=+$('#pk132Saisons').value,beginn=$('#pk132Beginn').value;
      if(!zeilen.length||zeilen.some(p=>!L(p.key))){fehler('Bitte wähl mindestens eine verfügbare Leistung.');return;}
      if(!/^\d{4}-\d{2}-\d{2}$/.test(beginn)){fehler('Bitte trag den Vertragsbeginn ein.');$('#pk132Beginn').focus();return;}
      if(zeilen.some(p=>!Number.isFinite(p.nachlass)||p.nachlass<0||p.nachlass>100||Math.abs(Math.round(p.nachlass*100)-p.nachlass*100)>0.0000001)){fehler('Bitte trag den Nachlass mit höchstens zwei Nachkommastellen von 0 bis 100 ein.');return;}
      if(zeilen.some(p=>!Number.isInteger(p.menge)||p.menge<1||p.menge>99)){fehler('Bitte prüf die Mengen von 1 bis 99.');return;}
      if(zeilen.some(p=>L(p.key).je_mannschaft&&!p.mannschaft)){fehler('Bitte wähl zu jeder Mannschaftsleistung die Mannschaft.');return;}
      const pk=zeilen.filter(p=>L(p.key).art==='paket');if(pk.length>1&&pk.filter(p=>!p.zusaetzlich).length!==1){fehler('Lass genau eine Partnerstufe als Grundpaket stehen und kennzeichne die weiteren als zusätzliches Paket.');return;}
      const p={positionen:zeilen.map(x=>({key:x.key,mannschaft:x.mannschaft,menge:x.menge,nachlass:x.nachlass,zusaetzlich:x.zusaetzlich,...(Object.keys(x.vereinbarung).length?{vereinbarung:x.vereinbarung}:{})})),saisons,beginn,auto_verlaengerung:c.gratis_saison?false:$('#pk132Auto').checked};
      busy=true;hintergrund.querySelectorAll('button,input,select').forEach(e=>e.disabled=true);const b=$('#pk132Speichern');b.textContent='Speichert …';b.setAttribute('aria-busy','true');
      let snapshot;try{snapshot=await o.rpc('partner_konditionen_setzen',{p_code:o.code,p});if(!snapshot||!snapshot.id)throw new Error('Die Bestätigung fehlt. Bitte prüf den Stand vor einem neuen Versuch.');}
      catch(e){busy=false;hintergrund.querySelectorAll('button,input,select').forEach(x=>x.disabled=false);b.textContent='Konditionen speichern';b.removeAttribute('aria-busy');summe();fehler(e.message||'Das Speichern hat nicht geklappt. Deine Auswahl bleibt stehen.');return;}
      busy=false;schliessen();if(typeof o.gespeichert==='function'){try{await o.gespeichert(snapshot);}catch(e){if(typeof window.kToast==='function')window.kToast('Konditionen gespeichert. Lade die Präsentation neu, um sie zu übernehmen.');}}
    };
    render();$('.pk132-zu').focus();offen={element:hintergrund,schliessen};return offen;
  }
  window.PD_KONDITIONEN={oeffnen};
})();

!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e=e||self).opentype={})}(this,function(O){"use strict";function e(e){if(null==this)throw TypeError();var t=String(this),r=t.length,n=e?Number(e):0;if(n!=n&&(n=0),!(n<0||r<=n)){var a,o=t.charCodeAt(n);return 55296<=o&&o<=56319&&n+1<r&&56320<=(a=t.charCodeAt(n+1))&&a<=57343?1024*(o-55296)+a-56320+65536:o}}var t;String.prototype.codePointAt||((t=function(){try{var e={},t=Object.defineProperty,r=t(e,e,e)&&t}catch(e){}return r}())?t(String.prototype,"codePointAt",{value:e,configurable:!0,writable:!0}):String.prototype.codePointAt=e);var u=0,o=-3;function r(){this.table=new Uint16Array(16),this.trans=new Uint16Array(288)}function s(e,t){this.source=e,this.sourceIndex=0,this.tag=0,this.bitcount=0,this.dest=t,this.destLen=0,this.ltree=new r,this.dtree=new r}var i=new r,l=new r,p=new Uint8Array(30),c=new Uint16Array(30),h=new Uint8Array(30),f=new Uint16Array(30),d=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),g=new r,v=new Uint8Array(320);function n(e,t,r,n){var a,o;for(a=0;a<r;++a)e[a]=0;for(a=0;a<30-r;++a)e[a+r]=a/r|0;for(o=n,a=0;a<30;++a)t[a]=o,o+=1<<e[a]}var m=new Uint16Array(16);function y(e,t,r,n){var a,o;for(a=0;a<16;++a)e.table[a]=0;for(a=0;a<n;++a)e.table[t[r+a]]++;for(a=o=e.table[0]=0;a<16;++a)m[a]=o,o+=e.table[a];for(a=0;a<n;++a)t[r+a]&&(e.trans[m[t[r+a]]++]=a)}function b(e){e.bitcount--||(e.tag=e.source[e.sourceIndex++],e.bitcount=7);var t=1&e.tag;return e.tag>>>=1,t}function S(e,t,r){if(!t)return r;for(;e.bitcount<24;)e.tag|=e.source[e.sourceIndex++]<<e.bitcount,e.bitcount+=8;var n=e.tag&65535>>>16-t;return e.tag>>>=t,e.bitcount-=t,n+r}function x(e,t){for(;e.bitcount<24;)e.tag|=e.source[e.sourceIndex++]<<e.bitcount,e.bitcount+=8;for(var r=0,n=0,a=0,o=e.tag;n=2*n+(1&o),o>>>=1,++a,r+=t.table[a],0<=(n-=t.table[a]););return e.tag=o,e.bitcount-=a,t.trans[r+n]}function T(e,t,r){var n,a,o,s,i,u;for(n=S(e,5,257),a=S(e,5,1),o=S(e,4,4),s=0;s<19;++s)v[s]=0;for(s=0;s<o;++s){var l=S(e,3,0);v[d[s]]=l}for(y(g,v,0,19),i=0;i<n+a;){var p=x(e,g);switch(p){case 16:var c=v[i-1];for(u=S(e,2,3);u;--u)v[i++]=c;break;case 17:for(u=S(e,3,3);u;--u)v[i++]=0;break;case 18:for(u=S(e,7,11);u;--u)v[i++]=0;break;default:v[i++]=p}}y(t,v,0,n),y(r,v,n,a)}function k(e,t,r){for(;;){var n,a,o,s,i=x(e,t);if(256===i)return u;if(i<256)e.dest[e.destLen++]=i;else for(n=S(e,p[i-=257],c[i]),a=x(e,r),s=o=e.destLen-S(e,h[a],f[a]);s<o+n;++s)e.dest[e.destLen++]=e.dest[s]}}function U(e){for(var t,r;8<e.bitcount;)e.sourceIndex--,e.bitcount-=8;if((t=256*(t=e.source[e.sourceIndex+1])+e.source[e.sourceIndex])!==(65535&~(256*e.source[e.sourceIndex+3]+e.source[e.sourceIndex+2])))return o;for(e.sourceIndex+=4,r=t;r;--r)e.dest[e.destLen++]=e.source[e.sourceIndex++];return e.bitcount=0,u}!function(e,t){var r;for(r=0;r<7;++r)e.table[r]=0;for(e.table[7]=24,e.table[8]=152,e.table[9]=112,r=0;r<24;++r)e.trans[r]=256+r;for(r=0;r<144;++r)e.trans[24+r]=r;for(r=0;r<8;++r)e.trans[168+r]=280+r;for(r=0;r<112;++r)e.trans[176+r]=144+r;for(r=0;r<5;++r)t.table[r]=0;for(t.table[5]=32,r=0;r<32;++r)t.trans[r]=r}(i,l),n(p,c,4,3),n(h,f,2,1),p[28]=0,c[28]=258;var a=function(e,t){var r,n,a=new s(e,t);do{switch(r=b(a),S(a,2,0)){case 0:n=U(a);break;case 1:n=k(a,i,l);break;case 2:T(a,a.ltree,a.dtree),n=k(a,a.ltree,a.dtree);break;default:n=o}if(n!==u)throw new Error("Data error")}while(!r);return a.destLen<a.dest.length?"function"==typeof a.dest.slice?a.dest.slice(0,a.destLen):a.dest.subarray(0,a.destLen):a.dest};function E(e,t,r,n,a){return Math.pow(1-a,3)*e+3*Math.pow(1-a,2)*a*t+3*(1-a)*Math.pow(a,2)*r+Math.pow(a,3)*n}function R(){this.x1=Number.NaN,this.y1=Number.NaN,this.x2=Number.NaN,this.y2=Number.NaN}function B(){this.commands=[],this.fill="black",this.stroke=null,this.strokeWidth=1}function L(e){throw new Error(e)}function C(e,t){e||L(t)}R.prototype.isEmpty=function(){return isNaN(this.x1)||isNaN(this.y1)||isNaN(this.x2)||isNaN(this.y2)},R.prototype.addPoint=function(e,t){"number"==typeof e&&((isNaN(this.x1)||isNaN(this.x2))&&(this.x1=e,this.x2=e),e<this.x1&&(this.x1=e),e>this.x2&&(this.x2=e)),"number"==typeof t&&((isNaN(this.y1)||isNaN(this.y2))&&(this.y1=t,this.y2=t),t<this.y1&&(this.y1=t),t>this.y2&&(this.y2=t))},R.prototype.addX=function(e){this.addPoint(e,null)},R.prototype.addY=function(e){this.addPoint(null,e)},R.prototype.addBezier=function(e,t,r,n,a,o,s,i){var u=[e,t],l=[r,n],p=[a,o],c=[s,i];this.addPoint(e,t),this.addPoint(s,i);for(var h=0;h<=1;h++){var f=6*u[h]-12*l[h]+6*p[h],d=-3*u[h]+9*l[h]-9*p[h]+3*c[h],g=3*l[h]-3*u[h];if(0!=d){var v=Math.pow(f,2)-4*g*d;if(!(v<0)){var m=(-f+Math.sqrt(v))/(2*d);0<m&&m<1&&(0===h&&this.addX(E(u[h],l[h],p[h],c[h],m)),1===h&&this.addY(E(u[h],l[h],p[h],c[h],m)));var y=(-f-Math.sqrt(v))/(2*d);0<y&&y<1&&(0===h&&this.addX(E(u[h],l[h],p[h],c[h],y)),1===h&&this.addY(E(u[h],l[h],p[h],c[h],y)))}}else{if(0==f)continue;var b=-g/f;0<b&&b<1&&(0===h&&this.addX(E(u[h],l[h],p[h],c[h],b)),1===h&&this.addY(E(u[h],l[h],p[h],c[h],b)))}}},R.prototype.addQuad=function(e,t,r,n,a,o){var s=e+2/3*(r-e),i=t+2/3*(n-t),u=s+1/3*(a-e),l=i+1/3*(o-t);this.addBezier(e,t,s,i,u,l,a,o)},B.prototype.moveTo=function(e,t){this.commands.push({type:"M",x:e,y:t})},B.prototype.lineTo=function(e,t){this.commands.push({type:"L",x:e,y:t})},B.prototype.curveTo=B.prototype.bezierCurveTo=function(e,t,r,n,a,o){this.commands.push({type:"C",x1:e,y1:t,x2:r,y2:n,x:a,y:o})},B.prototype.quadTo=B.prototype.quadraticCurveTo=function(e,t,r,n){this.commands.push({type:"Q",x1:e,y1:t,x:r,y:n})},B.prototype.close=B.prototype.closePath=function(){this.commands.push({type:"Z"})},B.prototype.extend=function(e){if(e.commands)e=e.commands;else if(e instanceof R){var t=e;return this.moveTo(t.x1,t.y1),this.lineTo(t.x2,t.y1),this.lineTo(t.x2,t.y2),this.lineTo(t.x1,t.y2),void this.close()}Array.prototype.push.apply(this.commands,e)},B.prototype.getBoundingBox=function(){for(var e=new R,t=0,r=0,n=0,a=0,o=0;o<this.commands.length;o++){var s=this.commands[o];switch(s.type){case"M":e.addPoint(s.x,s.y),t=n=s.x,r=a=s.y;break;case"L":e.addPoint(s.x,s.y),n=s.x,a=s.y;break;case"Q":e.addQuad(n,a,s.x1,s.y1,s.x,s.y),n=s.x,a=s.y;break;case"C":e.addBezier(n,a,s.x1,s.y1,s.x2,s.y2,s.x,s.y),n=s.x,a=s.y;break;case"Z":n=t,a=r;break;default:throw new Error("Unexpected path command "+s.type)}}return e.isEmpty()&&e.addPoint(0,0),e},B.prototype.draw=function(e){e.beginPath();for(var t=0;t<this.commands.length;t+=1){var r=this.commands[t];"M"===r.type?e.moveTo(r.x,r.y):"L"===r.type?e.lineTo(r.x,r.y):"C"===r.type?e.bezierCurveTo(r.x1,r.y1,r.x2,r.y2,r.x,r.y):"Q"===r.type?e.quadraticCurveTo(r.x1,r.y1,r.x,r.y):"Z"===r.type&&e.closePath()}this.fill&&(e.fillStyle=this.fill,e.fill()),this.stroke&&(e.strokeStyle=this.stroke,e.lineWidth=this.strokeWidth,e.stroke())},B.prototype.toPathData=function(o){function e(){for(var e,t=arguments,r="",n=0;n<arguments.length;n+=1){var a=t[n];0<=a&&0<n&&(r+=" "),r+=(e=a,Math.round(e)===e?""+Math.round(e):e.toFixed(o))}return r}o=void 0!==o?o:2;for(var t="",r=0;r<this.commands.length;r+=1){var n=this.commands[r];"M"===n.type?t+="M"+e(n.x,n.y):"L"===n.type?t+="L"+e(n.x,n.y):"C"===n.type?t+="C"+e(n.x1,n.y1,n.x2,n.y2,n.x,n.y):"Q"===n.type?t+="Q"+e(n.x1,n.y1,n.x,n.y):"Z"===n.type&&(t+="Z")}return t},B.prototype.toSVG=function(e){var t='<path d="';return t+=this.toPathData(e),t+='"',this.fill&&"black"!==this.fill&&(null===this.fill?t+=' fill="none"':t+=' fill="'+this.fill+'"'),this.stroke&&(t+=' stroke="'+this.stroke+'" stroke-width="'+this.strokeWidth+'"'),t+="/>"},B.prototype.toDOMElement=function(e){var t=this.toPathData(e),r=document.createElementNS("http://www.w3.org/2000/svg","path");return r.setAttribute("d",t),r};var w={fail:L,argument:C,assert:C},D=2147483648,I={},M={},G={};function F(e){return function(){return e}}M.BYTE=function(e){return w.argument(0<=e&&e<=255,"Byte value should be between 0 and 255."),[e]},G.BYTE=F(1),M.CHAR=function(e){return[e.charCodeAt(0)]},G.CHAR=F(1),M.CHARARRAY=function(e){void 0===e&&(e="",console.warn("Undefined CHARARRAY encountered and treated as an empty string. This is probably caused by a missing glyph name."));for(var t=[],r=0;r<e.length;r+=1)t[r]=e.charCodeAt(r);return t},G.CHARARRAY=function(e){return void 0===e?0:e.length},M.USHORT=function(e){return[e>>8&255,255&e]},G.USHORT=F(2),M.SHORT=function(e){return 32768<=e&&(e=-(65536-e)),[e>>8&255,255&e]},G.SHORT=F(2),M.UINT24=function(e){return[e>>16&255,e>>8&255,255&e]},G.UINT24=F(3),M.ULONG=function(e){return[e>>24&255,e>>16&255,e>>8&255,255&e]},G.ULONG=F(4),M.LONG=function(e){return D<=e&&(e=-(2*D-e)),[e>>24&255,e>>16&255,e>>8&255,255&e]},G.LONG=F(4),M.FIXED=M.ULONG,G.FIXED=G.ULONG,M.FWORD=M.SHORT,G.FWORD=G.SHORT,M.UFWORD=M.USHORT,G.UFWORD=G.USHORT,M.LONGDATETIME=function(e){return[0,0,0,0,e>>24&255,e>>16&255,e>>8&255,255&e]},G.LONGDATETIME=F(8),M.TAG=function(e){return w.argument(4===e.length,"Tag should be exactly 4 ASCII characters."),[e.charCodeAt(0),e.charCodeAt(1),e.charCodeAt(2),e.charCodeAt(3)]},G.TAG=F(4),M.Card8=M.BYTE,G.Card8=G.BYTE,M.Card16=M.USHORT,G.Card16=G.USHORT,M.OffSize=M.BYTE,G.OffSize=G.BYTE,M.SID=M.USHORT,G.SID=G.USHORT,M.NUMBER=function(e){return-107<=e&&e<=107?[e+139]:108<=e&&e<=1131?[247+((e-=108)>>8),255&e]:-1131<=e&&e<=-108?[251+((e=-e-108)>>8),255&e]:-32768<=e&&e<=32767?M.NUMBER16(e):M.NUMBER32(e)},G.NUMBER=function(e){return M.NUMBER(e).length},M.NUMBER16=function(e){return[28,e>>8&255,255&e]},G.NUMBER16=F(3),M.NUMBER32=function(e){return[29,e>>24&255,e>>16&255,e>>8&255,255&e]},G.NUMBER32=F(5),M.REAL=function(e){var t=e.toString(),r=/\.(\d*?)(?:9{5,20}|0{5,20})\d{0,2}(?:e(.+)|$)/.exec(t);if(r){var n=parseFloat("1e"+((r[2]?+r[2]:0)+r[1].length));t=(Math.round(e*n)/n).toString()}for(var a="",o=0,s=t.length;o<s;o+=1){var i=t[o];a+="e"===i?"-"===t[++o]?"c":"b":"."===i?"a":"-"===i?"e":i}for(var u=[30],l=0,p=(a+=1&a.length?"f":"ff").length;l<p;l+=2)u.push(parseInt(a.substr(l,2),16));return u},G.REAL=function(e){return M.REAL(e).length},M.NAME=M.CHARARRAY,G.NAME=G.CHARARRAY,M.STRING=M.CHARARRAY,G.STRING=G.CHARARRAY,I.UTF8=function(e,t,r){for(var n=[],a=r,o=0;o<a;o++,t+=1)n[o]=e.getUint8(t);return String.fromCharCode.apply(null,n)},I.UTF16=function(e,t,r){for(var n=[],a=r/2,o=0;o<a;o++,t+=2)n[o]=e.getUint16(t);return String.fromCharCode.apply(null,n)},M.UTF16=function(e){for(var t=[],r=0;r<e.length;r+=1){var n=e.charCodeAt(r);t[t.length]=n>>8&255,t[t.length]=255&n}return t},G.UTF16=function(e){return 2*e.length};var A={"x-mac-croatian":"ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®Š™´¨≠ŽØ∞±≤≥∆µ∂∑∏š∫ªºΩžø¿¡¬√ƒ≈Ć«Č… ÀÃÕŒœĐ—“”‘’÷◊©⁄€‹›Æ»–·‚„‰ÂćÁčÈÍÎÏÌÓÔđÒÚÛÙıˆ˜¯πË˚¸Êæˇ","x-mac-cyrillic":"АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ†°Ґ£§•¶І®©™Ђђ≠Ѓѓ∞±≤≥іµґЈЄєЇїЉљЊњјЅ¬√ƒ≈∆«»… ЋћЌќѕ–—“”‘’÷„ЎўЏџ№Ёёяабвгдежзийклмнопрстуфхцчшщъыьэю","x-mac-gaelic":"ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØḂ±≤≥ḃĊċḊḋḞḟĠġṀæøṁṖṗɼƒſṠ«»… ÀÃÕŒœ–—“”‘’ṡẛÿŸṪ€‹›Ŷŷṫ·Ỳỳ⁊ÂÊÁËÈÍÎÏÌÓÔ♣ÒÚÛÙıÝýŴŵẄẅẀẁẂẃ","x-mac-greek":"Ä¹²É³ÖÜ΅àâä΄¨çéèêë£™îï•½‰ôö¦€ùûü†ΓΔΘΛΞΠß®©ΣΪ§≠°·Α±≤≥¥ΒΕΖΗΙΚΜΦΫΨΩάΝ¬ΟΡ≈Τ«»… ΥΧΆΈœ–―“”‘’÷ΉΊΌΎέήίόΏύαβψδεφγηιξκλμνοπώρστθωςχυζϊϋΐΰ­","x-mac-icelandic":"ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûüÝ°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄€ÐðÞþý·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ","x-mac-inuit":"ᐃᐄᐅᐆᐊᐋᐱᐲᐳᐴᐸᐹᑉᑎᑏᑐᑑᑕᑖᑦᑭᑮᑯᑰᑲᑳᒃᒋᒌᒍᒎᒐᒑ°ᒡᒥᒦ•¶ᒧ®©™ᒨᒪᒫᒻᓂᓃᓄᓅᓇᓈᓐᓯᓰᓱᓲᓴᓵᔅᓕᓖᓗᓘᓚᓛᓪᔨᔩᔪᔫᔭ… ᔮᔾᕕᕖᕗ–—“”‘’ᕘᕙᕚᕝᕆᕇᕈᕉᕋᕌᕐᕿᖀᖁᖂᖃᖄᖅᖏᖐᖑᖒᖓᖔᖕᙱᙲᙳᙴᙵᙶᖖᖠᖡᖢᖣᖤᖥᖦᕼŁł","x-mac-ce":"ÄĀāÉĄÖÜáąČäčĆćéŹźĎíďĒēĖóėôöõúĚěü†°Ę£§•¶ß®©™ę¨≠ģĮįĪ≤≥īĶ∂∑łĻļĽľĹĺŅņŃ¬√ńŇ∆«»… ňŐÕőŌ–—“”‘’÷◊ōŔŕŘ‹›řŖŗŠ‚„šŚśÁŤťÍŽžŪÓÔūŮÚůŰűŲųÝýķŻŁżĢˇ",macintosh:"ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄€‹›ﬁﬂ‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ","x-mac-romanian":"ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ĂȘ∞±≤≥¥µ∂∑∏π∫ªºΩăș¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄€‹›Țț‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ","x-mac-turkish":"ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸĞğİıŞş‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙˆ˜¯˘˙˚¸˝˛ˇ"};I.MACSTRING=function(e,t,r,n){var a=A[n];if(void 0!==a){for(var o="",s=0;s<r;s++){var i=e.getUint8(t+s);o+=i<=127?String.fromCharCode(i):a[127&i]}return o}};var P,N="function"==typeof WeakMap&&new WeakMap;function H(e){return-128<=e&&e<=127}function z(e,t,r){for(var n=0,a=e.length;t<a&&n<64&&0===e[t];)++t,++n;return r.push(128|n-1),t}function W(e,t,r){for(var n=0,a=e.length,o=t;o<a&&n<64;){var s=e[o];if(!H(s))break;if(0===s&&o+1<a&&0===e[o+1])break;++o,++n}r.push(n-1);for(var i=t;i<o;++i)r.push(e[i]+256&255);return o}function q(e,t,r){for(var n=0,a=e.length,o=t;o<a&&n<64;){var s=e[o];if(0===s)break;if(H(s)&&o+1<a&&H(e[o+1]))break;++o,++n}r.push(64|n-1);for(var i=t;i<o;++i){var u=e[i];r.push(u+65536>>8&255,u+256&255)}return o}M.MACSTRING=function(e,t){var r=function(e){if(!P)for(var t in P={},A)P[t]=new String(t);var r=P[e];if(void 0!==r){if(N){var n=N.get(r);if(void 0!==n)return n}var a=A[e];if(void 0!==a){for(var o={},s=0;s<a.length;s++)o[a.charCodeAt(s)]=s+128;return N&&N.set(r,o),o}}}(t);if(void 0!==r){for(var n=[],a=0;a<e.length;a++){var o=e.charCodeAt(a);if(128<=o&&void 0===(o=r[o]))return;n[a]=o}return n}},G.MACSTRING=function(e,t){var r=M.MACSTRING(e,t);return void 0!==r?r.length:0},M.VARDELTAS=function(e){for(var t=0,r=[];t<e.length;){var n=e[t];t=(0===n?z:-128<=n&&n<=127?W:q)(e,t,r)}return r},M.INDEX=function(e){for(var t=1,r=[t],n=[],a=0;a<e.length;a+=1){var o=M.OBJECT(e[a]);Array.prototype.push.apply(n,o),t+=o.length,r.push(t)}if(0===n.length)return[0,0];for(var s=[],i=1+Math.floor(Math.log(t)/Math.log(2))/8|0,u=[void 0,M.BYTE,M.USHORT,M.UINT24,M.ULONG][i],l=0;l<r.length;l+=1){var p=u(r[l]);Array.prototype.push.apply(s,p)}return Array.prototype.concat(M.Card16(e.length),M.OffSize(i),s,n)},G.INDEX=function(e){return M.INDEX(e).length},M.DICT=function(e){for(var t=[],r=Object.keys(e),n=r.length,a=0;a<n;a+=1){var o=parseInt(r[a],0),s=e[o];t=(t=t.concat(M.OPERAND(s.value,s.type))).concat(M.OPERATOR(o))}return t},G.DICT=function(e){return M.DICT(e).length},M.OPERATOR=function(e){return e<1200?[e]:[12,e-1200]},M.OPERAND=function(e,t){var r=[];if(Array.isArray(t))for(var n=0;n<t.length;n+=1)w.argument(e.length===t.length,"Not enough arguments given for type"+t),r=r.concat(M.OPERAND(e[n],t[n]));else if("SID"===t)r=r.concat(M.NUMBER(e));else if("offset"===t)r=r.concat(M.NUMBER32(e));else if("number"===t)r=r.concat(M.NUMBER(e));else{if("real"!==t)throw new Error("Unknown operand type "+t);r=r.concat(M.REAL(e))}return r},M.OP=M.BYTE,G.OP=G.BYTE;var _="function"==typeof WeakMap&&new WeakMap;function X(e,t,r){if(t.length&&("coverageFormat"!==t[0].name||1===t[0].value))for(var n=0;n<t.length;n+=1){var a=t[n];this[a.name]=a.value}if(this.tableName=e,this.fields=t,r)for(var o=Object.keys(r),s=0;s<o.length;s+=1){var i=o[s],u=r[i];void 0!==this[i]&&(this[i]=u)}}function V(e,t,r){void 0===r&&(r=t.length);var n=new Array(t.length+1);n[0]={name:e+"Count",type:"USHORT",value:r};for(var a=0;a<t.length;a++)n[a+1]={name:e+a,type:"USHORT",value:t[a]};return n}function Y(e,t,r){var n=t.length,a=new Array(n+1);a[0]={name:e+"Count",type:"USHORT",value:n};for(var o=0;o<n;o++)a[o+1]={name:e+o,type:"TABLE",value:r(t[o],o)};return a}function j(e,t,r){var n=t.length,a=[];a[0]={name:e+"Count",type:"USHORT",value:n};for(var o=0;o<n;o++)a=a.concat(r(t[o],o));return a}function Z(e){1===e.format?X.call(this,"coverageTable",[{name:"coverageFormat",type:"USHORT",value:1}].concat(V("glyph",e.glyphs))):2===e.format?X.call(this,"coverageTable",[{name:"coverageFormat",type:"USHORT",value:2}].concat(j("rangeRecord",e.ranges,function(e){return[{name:"startGlyphID",type:"USHORT",value:e.start},{name:"endGlyphID",type:"USHORT",value:e.end},{name:"startCoverageIndex",type:"USHORT",value:e.index}]}))):w.assert(!1,"Coverage format must be 1 or 2.")}function Q(e){X.call(this,"scriptListTable",j("scriptRecord",e,function(e,t){var r=e.script,n=r.defaultLangSys;return w.assert(!!n,"Unable to write GSUB: script "+e.tag+" has no default language system."),[{name:"scriptTag"+t,type:"TAG",value:e.tag},{name:"script"+t,type:"TABLE",value:new X("scriptTable",[{name:"defaultLangSys",type:"TABLE",value:new X("defaultLangSys",[{name:"lookupOrder",type:"USHORT",value:0},{name:"reqFeatureIndex",type:"USHORT",value:n.reqFeatureIndex}].concat(V("featureIndex",n.featureIndexes)))}].concat(j("langSys",r.langSysRecords,function(e,t){var r=e.langSys;return[{name:"langSysTag"+t,type:"TAG",value:e.tag},{name:"langSys"+t,type:"TABLE",value:new X("langSys",[{name:"lookupOrder",type:"USHORT",value:0},{name:"reqFeatureIndex",type:"USHORT",value:r.reqFeatureIndex}].concat(V("featureIndex",r.featureIndexes)))}]})))}]}))}function K(e){X.call(this,"featureListTable",j("featureRecord",e,function(e,t){var r=e.feature;return[{name:"featureTag"+t,type:"TAG",value:e.tag},{name:"feature"+t,type:"TABLE",value:new X("featureTable",[{name:"featureParams",type:"USHORT",value:r.featureParams}].concat(V("lookupListIndex",r.lookupListIndexes)))}]}))}function J(e,r){X.call(this,"lookupListTable",Y("lookup",e,function(e){var t=r[e.lookupType];return w.assert(!!t,"Unable to write GSUB lookup type "+e.lookupType+" tables."),new X("lookupTable",[{name:"lookupType",type:"USHORT",value:e.lookupType},{name:"lookupFlag",type:"USHORT",value:e.lookupFlag}].concat(Y("subtable",e.subtables,t)))}))}M.CHARSTRING=function(e){if(_){var t=_.get(e);if(void 0!==t)return t}for(var r=[],n=e.length,a=0;a<n;a+=1){var o=e[a];r=r.concat(M[o.type](o.value))}return _&&_.set(e,r),r},G.CHARSTRING=function(e){return M.CHARSTRING(e).length},M.OBJECT=function(e){var t=M[e.type];return w.argument(void 0!==t,"No encoding function for type "+e.type),t(e.value)},G.OBJECT=function(e){var t=G[e.type];return w.argument(void 0!==t,"No sizeOf function for type "+e.type),t(e.value)},M.TABLE=function(e){for(var t=[],r=e.fields.length,n=[],a=[],o=0;o<r;o+=1){var s=e.fields[o],i=M[s.type];w.argument(void 0!==i,"No encoding function for field type "+s.type+" ("+s.name+")");var u=e[s.name];void 0===u&&(u=s.value);var l=i(u);"TABLE"===s.type?(a.push(t.length),t=t.concat([0,0]),n.push(l)):t=t.concat(l)}for(var p=0;p<n.length;p+=1){var c=a[p],h=t.length;w.argument(h<65536,"Table "+e.tableName+" too big."),t[c]=h>>8,t[c+1]=255&h,t=t.concat(n[p])}return t},G.TABLE=function(e){for(var t=0,r=e.fields.length,n=0;n<r;n+=1){var a=e.fields[n],o=G[a.type];w.argument(void 0!==o,"No sizeOf function for field type "+a.type+" ("+a.name+")");var s=e[a.name];void 0===s&&(s=a.value),t+=o(s),"TABLE"===a.type&&(t+=2)}return t},M.RECORD=M.TABLE,G.RECORD=G.TABLE,M.LITERAL=function(e){return e},G.LITERAL=function(e){return e.length},X.prototype.encode=function(){return M.TABLE(this)},X.prototype.sizeOf=function(){return G.TABLE(this)};var $={Table:X,Record:X,Coverage:(Z.prototype=Object.create(X.prototype)).constructor=Z,ScriptList:(Q.prototype=Object.create(X.prototype)).constructor=Q,FeatureList:(K.prototype=Object.create(X.prototype)).constructor=K,LookupList:(J.prototype=Object.create(X.prototype)).constructor=J,ushortList:V,tableList:Y,recordList:j};function ee(e,t){return e.getUint8(t)}function te(e,t){return e.getUint16(t,!1)}function re(e,t){return e.getUint32(t,!1)}function ne(e,t){return e.getInt16(t,!1)+e.getUint16(t+2,!1)/65535}var ae={byte:1,uShort:2,short:2,uLong:4,fixed:4,longDateTime:8,tag:4};function oe(e,t){this.data=e,this.offset=t,this.relativeOffset=0}oe.prototype.parseByte=function(){var e=this.data.getUint8(this.offset+this.relativeOffset);return this.relativeOffset+=1,e},oe.prototype.parseChar=function(){var e=this.data.getInt8(this.offset+this.relativeOffset);return this.relativeOffset+=1,e},oe.prototype.parseCard8=oe.prototype.parseByte,oe.prototype.parseCard16=oe.prototype.parseUShort=function(){var e=this.data.getUint16(this.offset+this.relativeOffset);return this.relativeOffset+=2,e},oe.prototype.parseSID=oe.prototype.parseUShort,oe.prototype.parseOffset16=oe.prototype.parseUShort,oe.prototype.parseShort=function(){var e=this.data.getInt16(this.offset+this.relativeOffset);return this.relativeOffset+=2,e},oe.prototype.parseF2Dot14=function(){var e=this.data.getInt16(this.offset+this.relativeOffset)/16384;return this.relativeOffset+=2,e},oe.prototype.parseOffset32=oe.prototype.parseULong=function(){var e=re(this.data,this.offset+this.relativeOffset);return this.relativeOffset+=4,e},oe.prototype.parseFixed=function(){var e=ne(this.data,this.offset+this.relativeOffset);return this.relativeOffset+=4,e},oe.prototype.parseString=function(e){var t=this.data,r=this.offset+this.relativeOffset,n="";this.relativeOffset+=e;for(var a=0;a<e;a++)n+=String.fromCharCode(t.getUint8(r+a));return n},oe.prototype.parseTag=function(){return this.parseString(4)},oe.prototype.parseLongDateTime=function(){var e=re(this.data,this.offset+this.relativeOffset+4);return e-=2082844800,this.relativeOffset+=8,e},oe.prototype.parseVersion=function(e){var t=te(this.data,this.offset+this.relativeOffset),r=te(this.data,this.offset+this.relativeOffset+2);return this.relativeOffset+=4,void 0===e&&(e=4096),t+r/e/10},oe.prototype.skip=function(e,t){void 0===t&&(t=1),this.relativeOffset+=ae[e]*t},oe.prototype.parseULongList=function(e){void 0===e&&(e=this.parseULong());for(var t=new Array(e),r=this.data,n=this.offset+this.relativeOffset,a=0;a<e;a++)t[a]=r.getUint32(n),n+=4;return this.relativeOffset+=4*e,t},oe.prototype.parseOffset16List=oe.prototype.parseUShortList=function(e){void 0===e&&(e=this.parseUShort());for(var t=new Array(e),r=this.data,n=this.offset+this.relativeOffset,a=0;a<e;a++)t[a]=r.getUint16(n),n+=2;return this.relativeOffset+=2*e,t},oe.prototype.parseShortList=function(e){for(var t=new Array(e),r=this.data,n=this.offset+this.relativeOffset,a=0;a<e;a++)t[a]=r.getInt16(n),n+=2;return this.relativeOffset+=2*e,t},oe.prototype.parseByteList=function(e){for(var t=new Array(e),r=this.data,n=this.offset+this.relativeOffset,a=0;a<e;a++)t[a]=r.getUint8(n++);return this.relativeOffset+=e,t},oe.prototype.parseList=function(e,t){t||(t=e,e=this.parseUShort());for(var r=new Array(e),n=0;n<e;n++)r[n]=t.call(this);return r},oe.prototype.parseList32=function(e,t){t||(t=e,e=this.parseULong());for(var r=new Array(e),n=0;n<e;n++)r[n]=t.call(this);return r},oe.prototype.parseRecordList=function(e,t){t||(t=e,e=this.parseUShort());for(var r=new Array(e),n=Object.keys(t),a=0;a<e;a++){for(var o={},s=0;s<n.length;s++){var i=n[s],u=t[i];o[i]=u.call(this)}r[a]=o}return r},oe.prototype.parseRecordList32=function(e,t){t||(t=e,e=this.parseULong());for(var r=new Array(e),n=Object.keys(t),a=0;a<e;a++){for(var o={},s=0;s<n.length;s++){var i=n[s],u=t[i];o[i]=u.call(this)}r[a]=o}return r},oe.prototype.parseStruct=function(e){if("function"==typeof e)return e.call(this);for(var t=Object.keys(e),r={},n=0;n<t.length;n++){var a=t[n],o=e[a];r[a]=o.call(this)}return r},oe.prototype.parseValueRecord=function(e){if(void 0===e&&(e=this.parseUShort()),0!==e){var t={};return 1&e&&(t.xPlacement=this.parseShort()),2&e&&(t.yPlacement=this.parseShort()),4&e&&(t.xAdvance=this.parseShort()),8&e&&(t.yAdvance=this.parseShort()),16&e&&(t.xPlaDevice=void 0,this.parseShort()),32&e&&(t.yPlaDevice=void 0,this.parseShort()),64&e&&(t.xAdvDevice=void 0,this.parseShort()),128&e&&(t.yAdvDevice=void 0,this.parseShort()),t}},oe.prototype.parseValueRecordList=function(){for(var e=this.parseUShort(),t=this.parseUShort(),r=new Array(t),n=0;n<t;n++)r[n]=this.parseValueRecord(e);return r},oe.prototype.parsePointer=function(e){var t=this.parseOffset16();if(0<t)return new oe(this.data,this.offset+t).parseStruct(e)},oe.prototype.parsePointer32=function(e){var t=this.parseOffset32();if(0<t)return new oe(this.data,this.offset+t).parseStruct(e)},oe.prototype.parseListOfLists=function(e){for(var t=this.parseOffset16List(),r=t.length,n=this.relativeOffset,a=new Array(r),o=0;o<r;o++){var s=t[o];if(0!==s)if(this.relativeOffset=s,e){for(var i=this.parseOffset16List(),u=new Array(i.length),l=0;l<i.length;l++)this.relativeOffset=s+i[l],u[l]=e.call(this);a[o]=u}else a[o]=this.parseUShortList();else a[o]=void 0}return this.relativeOffset=n,a},oe.prototype.parseCoverage=function(){var e=this.offset+this.relativeOffset,t=this.parseUShort(),r=this.parseUShort();if(1===t)return{format:1,glyphs:this.parseUShortList(r)};if(2!==t)throw new Error("0x"+e.toString(16)+": Coverage format must be 1 or 2.");for(var n=new Array(r),a=0;a<r;a++)n[a]={start:this.parseUShort(),end:this.parseUShort(),index:this.parseUShort()};return{format:2,ranges:n}},oe.prototype.parseClassDef=function(){var e=this.offset+this.relativeOffset,t=this.parseUShort();if(1===t)return{format:1,startGlyph:this.parseUShort(),classes:this.parseUShortList()};if(2===t)return{format:2,ranges:this.parseRecordList({start:oe.uShort,end:oe.uShort,classId:oe.uShort})};throw new Error("0x"+e.toString(16)+": ClassDef format must be 1 or 2.")},oe.list=function(e,t){return function(){return this.parseList(e,t)}},oe.list32=function(e,t){return function(){return this.parseList32(e,t)}},oe.recordList=function(e,t){return function(){return this.parseRecordList(e,t)}},oe.recordList32=function(e,t){return function(){return this.parseRecordList32(e,t)}},oe.pointer=function(e){return function(){return this.parsePointer(e)}},oe.pointer32=function(e){return function(){return this.parsePointer32(e)}},oe.tag=oe.prototype.parseTag,oe.byte=oe.prototype.parseByte,oe.uShort=oe.offset16=oe.prototype.parseUShort,oe.uShortList=oe.prototype.parseUShortList,oe.uLong=oe.offset32=oe.prototype.parseULong,oe.uLongList=oe.prototype.parseULongList,oe.struct=oe.prototype.parseStruct,oe.coverage=oe.prototype.parseCoverage,oe.classDef=oe.prototype.parseClassDef;var se={reserved:oe.uShort,reqFeatureIndex:oe.uShort,featureIndexes:oe.uShortList};oe.prototype.parseScriptList=function(){return this.parsePointer(oe.recordList({tag:oe.tag,script:oe.pointer({defaultLangSys:oe.pointer(se),langSysRecords:oe.recordList({tag:oe.tag,langSys:oe.pointer(se)})})}))||[]},oe.prototype.parseFeatureList=function(){return this.parsePointer(oe.recordList({tag:oe.tag,feature:oe.pointer({featureParams:oe.offset16,lookupListIndexes:oe.uShortList})}))||[]},oe.prototype.parseLookupList=function(n){return this.parsePointer(oe.list(oe.pointer(function(){var e=this.parseUShort();w.argument(1<=e&&e<=9,"GPOS/GSUB lookup type "+e+" unknown.");var t=this.parseUShort(),r=16&t;return{lookupType:e,lookupFlag:t,subtables:this.parseList(oe.pointer(n[e])),markFilteringSet:r?this.parseUShort():void 0}})))||[]},oe.prototype.parseFeatureVariationsList=function(){return this.parsePointer32(function(){var e=this.parseUShort(),t=this.parseUShort();return w.argument(1===e&&t<1,"GPOS/GSUB feature variations table unknown."),this.parseRecordList32({conditionSetOffset:oe.offset32,featureTableSubstitutionOffset:oe.offset32})})||[]};var ie={getByte:ee,getCard8:ee,getUShort:te,getCard16:te,getShort:function(e,t){return e.getInt16(t,!1)},getULong:re,getFixed:ne,getTag:function(e,t){for(var r="",n=t;n<t+4;n+=1)r+=String.fromCharCode(e.getInt8(n));return r},getOffset:function(e,t,r){for(var n=0,a=0;a<r;a+=1)n<<=8,n+=e.getUint8(t+a);return n},getBytes:function(e,t,r){for(var n=[],a=t;a<r;a+=1)n.push(e.getUint8(a));return n},bytesToString:function(e){for(var t="",r=0;r<e.length;r+=1)t+=String.fromCharCode(e[r]);return t},Parser:oe};var ue={parse:function(e,t){var r={};r.version=ie.getUShort(e,t),w.argument(0===r.version,"cmap table version should be 0."),r.numTables=ie.getUShort(e,t+2);for(var n=-1,a=r.numTables-1;0<=a;--a){var o=ie.getUShort(e,t+4+8*a),s=ie.getUShort(e,t+4+8*a+2);if(3===o&&(0===s||1===s||10===s)||0===o&&(0===s||1===s||2===s||3===s||4===s)){n=ie.getULong(e,t+4+8*a+4);break}}if(-1===n)throw new Error("No valid cmap sub-tables found.");var i=new ie.Parser(e,t+n);if(r.format=i.parseUShort(),12===r.format)!function(e,t){var r;t.parseUShort(),e.length=t.parseULong(),e.language=t.parseULong(),e.groupCount=r=t.parseULong(),e.glyphIndexMap={};for(var n=0;n<r;n+=1)for(var a=t.parseULong(),o=t.parseULong(),s=t.parseULong(),i=a;i<=o;i+=1)e.glyphIndexMap[i]=s,s++}(r,i);else{if(4!==r.format)throw new Error("Only format 4 and 12 cmap tables are supported (found format "+r.format+").");!function(e,t,r,n,a){var o;e.length=t.parseUShort(),e.language=t.parseUShort(),e.segCount=o=t.parseUShort()>>1,t.skip("uShort",3),e.glyphIndexMap={};for(var s=new ie.Parser(r,n+a+14),i=new ie.Parser(r,n+a+16+2*o),u=new ie.Parser(r,n+a+16+4*o),l=new ie.Parser(r,n+a+16+6*o),p=n+a+16+8*o,c=0;c<o-1;c+=1)for(var h=void 0,f=s.parseUShort(),d=i.parseUShort(),g=u.parseShort(),v=l.parseUShort(),m=d;m<=f;m+=1)0!==v?(p=l.offset+l.relativeOffset-2,p+=v,p+=2*(m-d),0!==(h=ie.getUShort(r,p))&&(h=h+g&65535)):h=m+g&65535,e.glyphIndexMap[m]=h}(r,i,e,t,n)}return r},make:function(e){var t,r=!0;for(t=e.length-1;0<t;--t){if(65535<e.get(t).unicode){console.log("Adding CMAP format 12 (needed!)"),r=!1;break}}var n=[{name:"version",type:"USHORT",value:0},{name:"numTables",type:"USHORT",value:r?1:2},{name:"platformID",type:"USHORT",value:3},{name:"encodingID",type:"USHORT",value:1},{name:"offset",type:"ULONG",value:r?12:20}];r||(n=n.concat([{name:"cmap12PlatformID",type:"USHORT",value:3},{name:"cmap12EncodingID",type:"USHORT",value:10},{name:"cmap12Offset",type:"ULONG",value:0}])),n=n.concat([{name:"format",type:"USHORT",value:4},{name:"cmap4Length",type:"USHORT",value:0},{name:"language",type:"USHORT",value:0},{name:"segCountX2",type:"USHORT",value:0},{name:"searchRange",type:"USHORT",value:0},{name:"entrySelector",type:"USHORT",value:0},{name:"rangeShift",type:"USHORT",value:0}]);var a,o,s,i=new $.Table("cmap",n);for(i.segments=[],t=0;t<e.length;t+=1){for(var u=e.get(t),l=0;l<u.unicodes.length;l+=1)a=i,o=u.unicodes[l],s=t,a.segments.push({end:o,start:o,delta:-(o-s),offset:0,glyphIndex:s});i.segments=i.segments.sort(function(e,t){return e.start-t.start})}i.segments.push({end:65535,start:65535,delta:1,offset:0});var p=i.segments.length,c=0,h=[],f=[],d=[],g=[],v=[],m=[];for(t=0;t<p;t+=1){var y=i.segments[t];y.end<=65535&&y.start<=65535?(h=h.concat({name:"end_"+t,type:"USHORT",value:y.end}),f=f.concat({name:"start_"+t,type:"USHORT",value:y.start}),d=d.concat({name:"idDelta_"+t,type:"SHORT",value:y.delta}),g=g.concat({name:"idRangeOffset_"+t,type:"USHORT",value:y.offset}),void 0!==y.glyphId&&(v=v.concat({name:"glyph_"+t,type:"USHORT",value:y.glyphId}))):c+=1,r||void 0===y.glyphIndex||(m=(m=(m=m.concat({name:"cmap12Start_"+t,type:"ULONG",value:y.start})).concat({name:"cmap12End_"+t,type:"ULONG",value:y.end})).concat({name:"cmap12Glyph_"+t,type:"ULONG",value:y.glyphIndex}))}if(i.segCountX2=2*(p-c),i.searchRange=2*Math.pow(2,Math.floor(Math.log(p-c)/Math.log(2))),i.entrySelector=Math.log(i.searchRange/2)/Math.log(2),i.rangeShift=i.segCountX2-i.searchRange,i.fields=i.fields.concat(h),i.fields.push({name:"reservedPad",type:"USHORT",value:0}),i.fields=i.fields.concat(f),i.fields=i.fields.concat(d),i.fields=i.fields.concat(g),i.fields=i.fields.concat(v),i.cmap4Length=14+2*h.length+2+2*f.length+2*d.length+2*g.length+2*v.length,!r){var b=16+4*m.length;i.cmap12Offset=20+i.cmap4Length,i.fields=i.fields.concat([{name:"cmap12Format",type:"USHORT",value:12},{name:"cmap12Reserved",type:"USHORT",value:0},{name:"cmap12Length",type:"ULONG",value:b},{name:"cmap12Language",type:"ULONG",value:0},{name:"cmap12nGroups",type:"ULONG",value:m.length/3}]),i.fields=i.fields.concat(m)}return i}},le=[".notdef","space","exclam","quotedbl","numbersign","dollar","percent","ampersand","quoteright","parenleft","parenright","asterisk","plus","comma","hyphen","period","slash","zero","one","two","three","four","five","six","seven","eight","nine","colon","semicolon","less","equal","greater","question","at","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","bracketleft","backslash","bracketright","asciicircum","underscore","quoteleft","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","braceleft","bar","braceright","asciitilde","exclamdown","cent","sterling","fraction","yen","florin","section","currency","quotesingle","quotedblleft","guillemotleft","guilsinglleft","guilsinglright","fi","fl","endash","dagger","daggerdbl","periodcentered","paragraph","bullet","quotesinglbase","quotedblbase","quotedblright","guillemotright","ellipsis","perthousand","questiondown","grave","acute","circumflex","tilde","macron","breve","dotaccent","dieresis","ring","cedilla","hungarumlaut","ogonek","caron","emdash","AE","ordfeminine","Lslash","Oslash","OE","ordmasculine","ae","dotlessi","lslash","oslash","oe","germandbls","onesuperior","logicalnot","mu","trademark","Eth","onehalf","plusminus","Thorn","onequarter","divide","brokenbar","degree","thorn","threequarters","twosuperior","registered","minus","eth","multiply","threesuperior","copyright","Aacute","Acircumflex","Adieresis","Agrave","Aring","Atilde","Ccedilla","Eacute","Ecircumflex","Edieresis","Egrave","Iacute","Icircumflex","Idieresis","Igrave","Ntilde","Oacute","Ocircumflex","Odieresis","Ograve","Otilde","Scaron","Uacute","Ucircumflex","Udieresis","Ugrave","Yacute","Ydieresis","Zcaron","aacute","acircumflex","adieresis","agrave","aring","atilde","ccedilla","eacute","ecircumflex","edieresis","egrave","iacute","icircumflex","idieresis","igrave","ntilde","oacute","ocircumflex","odieresis","ograve","otilde","scaron","uacute","ucircumflex","udieresis","ugrave","yacute","ydieresis","zcaron","exclamsmall","Hungarumlautsmall","dollaroldstyle","dollarsuperior","ampersandsmall","Acutesmall","parenleftsuperior","parenrightsuperior","266 ff","onedotenleader","zerooldstyle","oneoldstyle","twooldstyle","threeoldstyle","fouroldstyle","fiveoldstyle","sixoldstyle","sevenoldstyle","eightoldstyle","nineoldstyle","commasuperior","threequartersemdash","periodsuperior","questionsmall","asuperior","bsuperior","centsuperior","dsuperior","esuperior","isuperior","lsuperior","msuperior","nsuperior","osuperior","rsuperior","ssuperior","tsuperior","ff","ffi","ffl","parenleftinferior","parenrightinferior","Circumflexsmall","hyphensuperior","Gravesmall","Asmall","Bsmall","Csmall","Dsmall","Esmall","Fsmall","Gsmall","Hsmall","Ismall","Jsmall","Ksmall","Lsmall","Msmall","Nsmall","Osmall","Psmall","Qsmall","Rsmall","Ssmall","Tsmall","Usmall","Vsmall","Wsmall","Xsmall","Ysmall","Zsmall","colonmonetary","onefitted","rupiah","Tildesmall","exclamdownsmall","centoldstyle","Lslashsmall","Scaronsmall","Zcaronsmall","Dieresissmall","Brevesmall","Caronsmall","Dotaccentsmall","Macronsmall","figuredash","hypheninferior","Ogoneksmall","Ringsmall","Cedillasmall","questiondownsmall","oneeighth","threeeighths","fiveeighths","seveneighths","onethird","twothirds","zerosuperior","foursuperior","fivesuperior","sixsuperior","sevensuperior","eightsuperior","ninesuperior","zeroinferior","oneinferior","twoinferior","threeinferior","fourinferior","fiveinferior","sixinferior","seveninferior","eightinferior","nineinferior","centinferior","dollarinferior","periodinferior","commainferior","Agravesmall","Aacutesmall","Acircumflexsmall","Atildesmall","Adieresissmall","Aringsmall","AEsmall","Ccedillasmall","Egravesmall","Eacutesmall","Ecircumflexsmall","Edieresissmall","Igravesmall","Iacutesmall","Icircumflexsmall","Idieresissmall","Ethsmall","Ntildesmall","Ogravesmall","Oacutesmall","Ocircumflexsmall","Otildesmall","Odieresissmall","OEsmall","Oslashsmall","Ugravesmall","Uacutesmall","Ucircumflexsmall","Udieresissmall","Yacutesmall","Thornsmall","Ydieresissmall","001.000","001.001","001.002","001.003","Black","Bold","Book","Light","Medium","Regular","Roman","Semibold"],pe=["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","space","exclam","quotedbl","numbersign","dollar","percent","ampersand","quoteright","parenleft","parenright","asterisk","plus","comma","hyphen","period","slash","zero","one","two","three","four","five","six","seven","eight","nine","colon","semicolon","less","equal","greater","question","at","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","bracketleft","backslash","bracketright","asciicircum","underscore","quoteleft","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","braceleft","bar","braceright","asciitilde","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","exclamdown","cent","sterling","fraction","yen","florin","section","currency","quotesingle","quotedblleft","guillemotleft","guilsinglleft","guilsinglright","fi","fl","","endash","dagger","daggerdbl","periodcentered","","paragraph","bullet","quotesinglbase","quotedblbase","quotedblright","guillemotright","ellipsis","perthousand","","questiondown","","grave","acute","circumflex","tilde","macron","breve","dotaccent","dieresis","","ring","cedilla","","hungarumlaut","ogonek","caron","emdash","","","","","","","","","","","","","","","","","AE","","ordfeminine","","","","","Lslash","Oslash","OE","ordmasculine","","","","","","ae","","","","dotlessi","","","lslash","oslash","oe","germandbls"],ce=["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","space","exclamsmall","Hungarumlautsmall","","dollaroldstyle","dollarsuperior","ampersandsmall","Acutesmall","parenleftsuperior","parenrightsuperior","twodotenleader","onedotenleader","comma","hyphen","period","fraction","zerooldstyle","oneoldstyle","twooldstyle","threeoldstyle","fouroldstyle","fiveoldstyle","sixoldstyle","sevenoldstyle","eightoldstyle","nineoldstyle","colon","semicolon","commasuperior","threequartersemdash","periodsuperior","questionsmall","","asuperior","bsuperior","centsuperior","dsuperior","esuperior","","","isuperior","","","lsuperior","msuperior","nsuperior","osuperior","","","rsuperior","ssuperior","tsuperior","","ff","fi","fl","ffi","ffl","parenleftinferior","","parenrightinferior","Circumflexsmall","hyphensuperior","Gravesmall","Asmall","Bsmall","Csmall","Dsmall","Esmall","Fsmall","Gsmall","Hsmall","Ismall","Jsmall","Ksmall","Lsmall","Msmall","Nsmall","Osmall","Psmall","Qsmall","Rsmall","Ssmall","Tsmall","Usmall","Vsmall","Wsmall","Xsmall","Ysmall","Zsmall","colonmonetary","onefitted","rupiah","Tildesmall","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","exclamdownsmall","centoldstyle","Lslashsmall","","","Scaronsmall","Zcaronsmall","Dieresissmall","Brevesmall","Caronsmall","","Dotaccentsmall","","","Macronsmall","","","figuredash","hypheninferior","","","Ogoneksmall","Ringsmall","Cedillasmall","","","","onequarter","onehalf","threequarters","questiondownsmall","oneeighth","threeeighths","fiveeighths","seveneighths","onethird","twothirds","","","zerosuperior","onesuperior","twosuperior","threesuperior","foursuperior","fivesuperior","sixsuperior","sevensuperior","eightsuperior","ninesuperior","zeroinferior","oneinferior","twoinferior","threeinferior","fourinferior","fiveinferior","sixinferior","seveninferior","eightinferior","nineinferior","centinferior","dollarinferior","periodinferior","commainferior","Agravesmall","Aacutesmall","Acircumflexsmall","Atildesmall","Adieresissmall","Aringsmall","AEsmall","Ccedillasmall","Egravesmall","Eacutesmall","Ecircumflexsmall","Edieresissmall","Igravesmall","Iacutesmall","Icircumflexsmall","Idieresissmall","Ethsmall","Ntildesmall","Ogravesmall","Oacutesmall","Ocircumflexsmall","Otildesmall","Odieresissmall","OEsmall","Oslashsmall","Ugravesmall","Uacutesmall","Ucircumflexsmall","Udieresissmall","Yacutesmall","Thornsmall","Ydieresissmall"],he=[".notdef",".null","nonmarkingreturn","space","exclam","quotedbl","numbersign","dollar","percent","ampersand","quotesingle","parenleft","parenright","asterisk","plus","comma","hyphen","period","slash","zero","one","two","three","four","five","six","seven","eight","nine","colon","semicolon","less","equal","greater","question","at","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","bracketleft","backslash","bracketright","asciicircum","underscore","grave","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","braceleft","bar","braceright","asciitilde","Adieresis","Aring","Ccedilla","Eacute","Ntilde","Odieresis","Udieresis","aacute","agrave","acircumflex","adieresis","atilde","aring","ccedilla","eacute","egrave","ecircumflex","edieresis","iacute","igrave","icircumflex","idieresis","ntilde","oacute","ograve","ocircumflex","odieresis","otilde","uacute","ugrave","ucircumflex","udieresis","dagger","degree","cent","sterling","section","bullet","paragraph","germandbls","registered","copyright","trademark","acute","dieresis","notequal","AE","Oslash","infinity","plusminus","lessequal","greaterequal","yen","mu","partialdiff","summation","product","pi","integral","ordfeminine","ordmasculine","Omega","ae","oslash","questiondown","exclamdown","logicalnot","radical","florin","approxequal","Delta","guillemotleft","guillemotright","ellipsis","nonbreakingspace","Agrave","Atilde","Otilde","OE","oe","endash","emdash","quotedblleft","quotedblright","quoteleft","quoteright","divide","lozenge","ydieresis","Ydieresis","fraction","currency","guilsinglleft","guilsinglright","fi","fl","daggerdbl","periodcentered","quotesinglbase","quotedblbase","perthousand","Acircumflex","Ecircumflex","Aacute","Edieresis","Egrave","Iacute","Icircumflex","Idieresis","Igrave","Oacute","Ocircumflex","apple","Ograve","Uacute","Ucircumflex","Ugrave","dotlessi","circumflex","tilde","macron","breve","dotaccent","ring","cedilla","hungarumlaut","ogonek","caron","Lslash","lslash","Scaron","scaron","Zcaron","zcaron","brokenbar","Eth","eth","Yacute","yacute","Thorn","thorn","minus","multiply","onesuperior","twosuperior","threesuperior","onehalf","onequarter","threequarters","franc","Gbreve","gbreve","Idotaccent","Scedilla","scedilla","Cacute","cacute","Ccaron","ccaron","dcroat"];function fe(e){this.font=e}function de(e){this.cmap=e}function ge(e,t){this.encoding=e,this.charset=t}function ve(e){switch(e.version){case 1:this.names=he.slice();break;case 2:this.names=new Array(e.numberOfGlyphs);for(var t=0;t<e.numberOfGlyphs;t++)e.glyphNameIndex[t]<he.length?this.names[t]=he[e.glyphNameIndex[t]]:this.names[t]=e.names[e.glyphNameIndex[t]-he.length];break;case 2.5:this.names=new Array(e.numberOfGlyphs);for(var r=0;r<e.numberOfGlyphs;r++)this.names[r]=he[r+e.glyphNameIndex[r]];break;case 3:default:this.names=[]}}function me(e,t){(t.lowMemory?function(e){e._IndexToUnicodeMap={};for(var t=e.tables.cmap.glyphIndexMap,r=Object.keys(t),n=0;n<r.length;n+=1){var a=r[n],o=t[a];void 0===e._IndexToUnicodeMap[o]?e._IndexToUnicodeMap[o]={unicodes:[parseInt(a)]}:e._IndexToUnicodeMap[o].unicodes.push(parseInt(a))}}:function(e){for(var t,r=e.tables.cmap.glyphIndexMap,n=Object.keys(r),a=0;a<n.length;a+=1){var o=n[a],s=r[o];(t=e.glyphs.get(s)).addUnicode(parseInt(o))}for(var i=0;i<e.glyphs.length;i+=1)t=e.glyphs.get(i),e.cffEncoding?e.isCIDFont?t.name="gid"+i:t.name=e.cffEncoding.charset[i]:e.glyphNames.names&&(t.name=e.glyphNames.glyphIndexToName(i))})(e)}fe.prototype.charToGlyphIndex=function(e){var t=e.codePointAt(0),r=this.font.glyphs;if(r)for(var n=0;n<r.length;n+=1)for(var a=r.get(n),o=0;o<a.unicodes.length;o+=1)if(a.unicodes[o]===t)return n;return null},de.prototype.charToGlyphIndex=function(e){return this.cmap.glyphIndexMap[e.codePointAt(0)]||0},ge.prototype.charToGlyphIndex=function(e){var t=e.codePointAt(0),r=this.encoding[t];return this.charset.indexOf(r)},ve.prototype.nameToGlyphIndex=function(e){return this.names.indexOf(e)},ve.prototype.glyphIndexToName=function(e){return this.names[e]};var ye={line:function(e,t,r,n,a){e.beginPath(),e.moveTo(t,r),e.lineTo(n,a),e.stroke()}};function be(e){this.bindConstructorValues(e)}function Se(t,e,r){Object.defineProperty(t,e,{get:function(){return t.path,t[r]},set:function(e){t[r]=e},enumerable:!0,configurable:!0})}function xe(e,t){if(this.font=e,this.glyphs={},Array.isArray(t))for(var r=0;r<t.length;r++){var n=t[r];n.path.unitsPerEm=e.unitsPerEm,this.glyphs[r]=n}this.length=t&&t.length||0}be.prototype.bindConstructorValues=function(e){var t,r;this.index=e.index||0,this.name=e.name||null,this.unicode=e.unicode||void 0,this.unicodes=e.unicodes||void 0!==e.unicode?[e.unicode]:[],"xMin"in e&&(this.xMin=e.xMin),"yMin"in e&&(this.yMin=e.yMin),"xMax"in e&&(this.xMax=e.xMax),"yMax"in e&&(this.yMax=e.yMax),"advanceWidth"in e&&(this.advanceWidth=e.advanceWidth),Object.defineProperty(this,"path",(t=e.path,r=t||new B,{configurable:!0,get:function(){return"function"==typeof r&&(r=r()),r},set:function(e){r=e}}))},be.prototype.addUnicode=function(e){0===this.unicodes.length&&(this.unicode=e),this.unicodes.push(e)},be.prototype.getBoundingBox=function(){return this.path.getBoundingBox()},be.prototype.getPath=function(e,t,r,n,a){var o,s;e=void 0!==e?e:0,t=void 0!==t?t:0,r=void 0!==r?r:72;var i=(n=n||{}).xScale,u=n.yScale;if(n.hinting&&a&&a.hinting&&(s=this.path&&a.hinting.exec(this,r)),s)o=a.hinting.getCommands(s),e=Math.round(e),t=Math.round(t),i=u=1;else{o=this.path.commands;var l=1/(this.path.unitsPerEm||1e3)*r;void 0===i&&(i=l),void 0===u&&(u=l)}for(var p=new B,c=0;c<o.length;c+=1){var h=o[c];"M"===h.type?p.moveTo(e+h.x*i,t+-h.y*u):"L"===h.type?p.lineTo(e+h.x*i,t+-h.y*u):"Q"===h.type?p.quadraticCurveTo(e+h.x1*i,t+-h.y1*u,e+h.x*i,t+-h.y*u):"C"===h.type?p.curveTo(e+h.x1*i,t+-h.y1*u,e+h.x2*i,t+-h.y2*u,e+h.x*i,t+-h.y*u):"Z"===h.type&&p.closePath()}return p},be.prototype.getContours=function(){if(void 0===this.points)return[];for(var e=[],t=[],r=0;r<this.points.length;r+=1){var n=this.points[r];t.push(n),n.lastPointOfContour&&(e.push(t),t=[])}return w.argument(0===t.length,"There are still points left in the current contour."),e},be.prototype.getMetrics=function(){for(var e=this.path.commands,t=[],r=[],n=0;n<e.length;n+=1){var a=e[n];"Z"!==a.type&&(t.push(a.x),r.push(a.y)),"Q"!==a.type&&"C"!==a.type||(t.push(a.x1),r.push(a.y1)),"C"===a.type&&(t.push(a.x2),r.push(a.y2))}var o={xMin:Math.min.apply(null,t),yMin:Math.min.apply(null,r),xMax:Math.max.apply(null,t),yMax:Math.max.apply(null,r),leftSideBearing:this.leftSideBearing};return isFinite(o.xMin)||(o.xMin=0),isFinite(o.xMax)||(o.xMax=this.advanceWidth),isFinite(o.yMin)||(o.yMin=0),isFinite(o.yMax)||(o.yMax=0),o.rightSideBearing=this.advanceWidth-o.leftSideBearing-(o.xMax-o.xMin),o},be.prototype.draw=function(e,t,r,n,a){this.getPath(t,r,n,a).draw(e)},be.prototype.drawPoints=function(o,e,t,r){function n(e,t,r,n){o.beginPath();for(var a=0;a<e.length;a+=1)o.moveTo(t+e[a].x*n,r+e[a].y*n),o.arc(t+e[a].x*n,r+e[a].y*n,2,0,2*Math.PI,!1);o.closePath(),o.fill()}e=void 0!==e?e:0,t=void 0!==t?t:0,r=void 0!==r?r:24;for(var a=1/this.path.unitsPerEm*r,s=[],i=[],u=this.path,l=0;l<u.commands.length;l+=1){var p=u.commands[l];void 0!==p.x&&s.push({x:p.x,y:-p.y}),void 0!==p.x1&&i.push({x:p.x1,y:-p.y1}),void 0!==p.x2&&i.push({x:p.x2,y:-p.y2})}o.fillStyle="blue",n(s,e,t,a),o.fillStyle="red",n(i,e,t,a)},be.prototype.drawMetrics=function(e,t,r,n){var a;t=void 0!==t?t:0,r=void 0!==r?r:0,n=void 0!==n?n:24,a=1/this.path.unitsPerEm*n,e.lineWidth=1,e.strokeStyle="black",ye.line(e,t,-1e4,t,1e4),ye.line(e,-1e4,r,1e4,r);var o=this.xMin||0,s=this.yMin||0,i=this.xMax||0,u=this.yMax||0,l=this.advanceWidth||0;e.strokeStyle="blue",ye.line(e,t+o*a,-1e4,t+o*a,1e4),ye.line(e,t+i*a,-1e4,t+i*a,1e4),ye.line(e,-1e4,r+-s*a,1e4,r+-s*a),ye.line(e,-1e4,r+-u*a,1e4,r+-u*a),e.strokeStyle="green",ye.line(e,t+l*a,-1e4,t+l*a,1e4)},xe.prototype.get=function(e){if(void 0===this.glyphs[e]){this.font._push(e),"function"==typeof this.glyphs[e]&&(this.glyphs[e]=this.glyphs[e]());var t=this.glyphs[e],r=this.font._IndexToUnicodeMap[e];if(r)for(var n=0;n<r.unicodes.length;n++)t.addUnicode(r.unicodes[n]);this.font.cffEncoding?this.font.isCIDFont?t.name="gid"+e:t.name=this.font.cffEncoding.charset[e]:this.font.glyphNames.names&&(t.name=this.font.glyphNames.glyphIndexToName(e)),this.glyphs[e].advanceWidth=this.font._hmtxTableData[e].advanceWidth,this.glyphs[e].leftSideBearing=this.font._hmtxTableData[e].leftSideBearing}else"function"==typeof this.glyphs[e]&&(this.glyphs[e]=this.glyphs[e]());return this.glyphs[e]},xe.prototype.push=function(e,t){this.glyphs[e]=t,this.length++};var Te={GlyphSet:xe,glyphLoader:function(e,t){return new be({index:t,font:e})},ttfGlyphLoader:function(r,e,n,a,o,s){return function(){var t=new be({index:e,font:r});return t.path=function(){n(t,a,o);var e=s(r.glyphs,t);return e.unitsPerEm=r.unitsPerEm,e},Se(t,"xMin","_xMin"),Se(t,"xMax","_xMax"),Se(t,"yMin","_yMin"),Se(t,"yMax","_yMax"),t}},cffGlyphLoader:function(r,e,n,a){return function(){var t=new be({index:e,font:r});return t.path=function(){var e=n(r,t,a);return e.unitsPerEm=r.unitsPerEm,e},t}}};function ke(e,t){if(e===t)return 1;if(Array.isArray(e)&&Array.isArray(t)){if(e.length!==t.length)return;for(var r=0;r<e.length;r+=1)if(!ke(e[r],t[r]))return;return 1}}function Ue(e){return e.length<1240?107:e.length<33900?1131:32768}function Oe(e,t,r){var n,a,o=[],s=[],i=ie.getCard16(e,t);if(0!==i){var u=ie.getByte(e,t+2);n=t+(i+1)*u+2;for(var l=t+3,p=0;p<i+1;p+=1)o.push(ie.getOffset(e,l,u)),l+=u;a=n+o[i]}else a=t+2;for(var c=0;c<o.length-1;c+=1){var h=ie.getBytes(e,n+o[c],n+o[c+1]);r&&(h=r(h)),s.push(h)}return{objects:s,startOffset:t,endOffset:a}}function Ee(e,t){if(28===t)return e.parseByte()<<8|e.parseByte();if(29===t)return e.parseByte()<<24|e.parseByte()<<16|e.parseByte()<<8|e.parseByte();if(30===t)return function(e){for(var t="",r=["0","1","2","3","4","5","6","7","8","9",".","E","E-",null,"-"];;){var n=e.parseByte(),a=n>>4,o=15&n;if(15==a)break;if(t+=r[a],15==o)break;t+=r[o]}return parseFloat(t)}(e);if(32<=t&&t<=246)return t-139;if(247<=t&&t<=250)return 256*(t-247)+e.parseByte()+108;if(251<=t&&t<=254)return 256*-(t-251)-e.parseByte()-108;throw new Error("Invalid b0 "+t)}function Re(e,t,r){t=void 0!==t?t:0;var n=new ie.Parser(e,t),a=[],o=[];for(r=void 0!==r?r:e.length;n.relativeOffset<r;){var s=n.parseByte();s<=21?(12===s&&(s=1200+n.parseByte()),a.push([s,o]),o=[]):o.push(Ee(n,s))}return function(e){for(var t={},r=0;r<e.length;r+=1){var n=e[r][0],a=e[r][1],o=void 0;if(o=1===a.length?a[0]:a,t.hasOwnProperty(n)&&!isNaN(t[n]))throw new Error("Object "+t+" already has key "+n);t[n]=o}return t}(a)}function Le(e,t){return t=t<=390?le[t]:e[t-391]}function Ce(e,t,r){for(var n,a={},o=0;o<t.length;o+=1){var s=t[o];if(Array.isArray(s.type)){var i=[];i.length=s.type.length;for(var u=0;u<s.type.length;u++)void 0===(n=void 0!==e[s.op]?e[s.op][u]:void 0)&&(n=void 0!==s.value&&void 0!==s.value[u]?s.value[u]:null),"SID"===s.type[u]&&(n=Le(r,n)),i[u]=n;a[s.name]=i}else void 0===(n=e[s.op])&&(n=void 0!==s.value?s.value:null),"SID"===s.type&&(n=Le(r,n)),a[s.name]=n}return a}var we=[{name:"version",op:0,type:"SID"},{name:"notice",op:1,type:"SID"},{name:"copyright",op:1200,type:"SID"},{name:"fullName",op:2,type:"SID"},{name:"familyName",op:3,type:"SID"},{name:"weight",op:4,type:"SID"},{name:"isFixedPitch",op:1201,type:"number",value:0},{name:"italicAngle",op:1202,type:"number",value:0},{name:"underlinePosition",op:1203,type:"number",value:-100},{name:"underlineThickness",op:1204,type:"number",value:50},{name:"paintType",op:1205,type:"number",value:0},{name:"charstringType",op:1206,type:"number",value:2},{name:"fontMatrix",op:1207,type:["real","real","real","real","real","real"],value:[.001,0,0,.001,0,0]},{name:"uniqueId",op:13,type:"number"},{name:"fontBBox",op:5,type:["number","number","number","number"],value:[0,0,0,0]},{name:"strokeWidth",op:1208,type:"number",value:0},{name:"xuid",op:14,type:[],value:null},{name:"charset",op:15,type:"offset",value:0},{name:"encoding",op:16,type:"offset",value:0},{name:"charStrings",op:17,type:"offset",value:0},{name:"private",op:18,type:["number","offset"],value:[0,0]},{name:"ros",op:1230,type:["SID","SID","number"]},{name:"cidFontVersion",op:1231,type:"number",value:0},{name:"cidFontRevision",op:1232,type:"number",value:0},{name:"cidFontType",op:1233,type:"number",value:0},{name:"cidCount",op:1234,type:"number",value:8720},{name:"uidBase",op:1235,type:"number"},{name:"fdArray",op:1236,type:"offset"},{name:"fdSelect",op:1237,type:"offset"},{name:"fontName",op:1238,type:"SID"}],De=[{name:"subrs",op:19,type:"offset",value:0},{name:"defaultWidthX",op:20,type:"number",value:0},{name:"nominalWidthX",op:21,type:"number",value:0}];function Ie(e,t,r,n){return Ce(Re(e,t,r),De,n)}function Me(e,t,r,n){for(var a,o,s=[],i=0;i<r.length;i+=1){var u=new DataView(new Uint8Array(r[i]).buffer),l=(o=n,Ce(Re(a=u,0,a.byteLength),we,o));l._subrs=[],l._subrsBias=0,l._defaultWidthX=0,l._nominalWidthX=0;var p=l.private[0],c=l.private[1];if(0!==p&&0!==c){var h=Ie(e,c+t,p,n);if(l._defaultWidthX=h.defaultWidthX,l._nominalWidthX=h.nominalWidthX,0!==h.subrs){var f=Oe(e,c+h.subrs+t);l._subrs=f.objects,l._subrsBias=Ue(l._subrs)}l._privateDict=h}s.push(l)}return s}function Ge(v,m,e){var y,b,S,x,T,k,t,U,O=new B,E=[],R=0,L=!1,C=!1,w=0,D=0;if(v.isCIDFont){var r=v.tables.cff.topDict._fdSelect[m.index],n=v.tables.cff.topDict._fdArray[r];T=n._subrs,k=n._subrsBias,t=n._defaultWidthX,U=n._nominalWidthX}else T=v.tables.cff.topDict._subrs,k=v.tables.cff.topDict._subrsBias,t=v.tables.cff.topDict._defaultWidthX,U=v.tables.cff.topDict._nominalWidthX;var I=t;function M(e,t){C&&O.closePath(),O.moveTo(e,t),C=!0}function G(){E.length%2==0||L||(I=E.shift()+U),R+=E.length>>1,E.length=0,L=!0}return function e(t){for(var r,n,a,o,s,i,u,l,p,c,h,f,d=0;d<t.length;){var g=t[d];switch(d+=1,g){case 1:case 3:G();break;case 4:1<E.length&&!L&&(I=E.shift()+U,L=!0),D+=E.pop(),M(w,D);break;case 5:for(;0<E.length;)w+=E.shift(),D+=E.shift(),O.lineTo(w,D);break;case 6:for(;0<E.length&&(w+=E.shift(),O.lineTo(w,D),0!==E.length);)D+=E.shift(),O.lineTo(w,D);break;case 7:for(;0<E.length&&(D+=E.shift(),O.lineTo(w,D),0!==E.length);)w+=E.shift(),O.lineTo(w,D);break;case 8:for(;0<E.length;)y=w+E.shift(),b=D+E.shift(),S=y+E.shift(),x=b+E.shift(),w=S+E.shift(),D=x+E.shift(),O.curveTo(y,b,S,x,w,D);break;case 10:s=E.pop()+k,(i=T[s])&&e(i);break;case 11:return;case 12:switch(g=t[d],d+=1,g){case 35:y=w+E.shift(),b=D+E.shift(),S=y+E.shift(),x=b+E.shift(),u=S+E.shift(),l=x+E.shift(),p=u+E.shift(),c=l+E.shift(),h=p+E.shift(),f=c+E.shift(),w=h+E.shift(),D=f+E.shift(),E.shift(),O.curveTo(y,b,S,x,u,l),O.curveTo(p,c,h,f,w,D);break;case 34:y=w+E.shift(),b=D,S=y+E.shift(),x=b+E.shift(),u=S+E.shift(),l=x,p=u+E.shift(),c=x,h=p+E.shift(),f=D,w=h+E.shift(),O.curveTo(y,b,S,x,u,l),O.curveTo(p,c,h,f,w,D);break;case 36:y=w+E.shift(),b=D+E.shift(),S=y+E.shift(),x=b+E.shift(),u=S+E.shift(),l=x,p=u+E.shift(),c=x,h=p+E.shift(),f=c+E.shift(),w=h+E.shift(),O.curveTo(y,b,S,x,u,l),O.curveTo(p,c,h,f,w,D);break;case 37:y=w+E.shift(),b=D+E.shift(),S=y+E.shift(),x=b+E.shift(),u=S+E.shift(),l=x+E.shift(),p=u+E.shift(),c=l+E.shift(),h=p+E.shift(),f=c+E.shift(),Math.abs(h-w)>Math.abs(f-D)?w=h+E.shift():D=f+E.shift(),O.curveTo(y,b,S,x,u,l),O.curveTo(p,c,h,f,w,D);break;default:console.log("Glyph "+m.index+": unknown operator 1200"+g),E.length=0}break;case 14:0<E.length&&!L&&(I=E.shift()+U,L=!0),C&&(O.closePath(),C=!1);break;case 18:G();break;case 19:case 20:G(),d+=R+7>>3;break;case 21:2<E.length&&!L&&(I=E.shift()+U,L=!0),D+=E.pop(),M(w+=E.pop(),D);break;case 22:1<E.length&&!L&&(I=E.shift()+U,L=!0),M(w+=E.pop(),D);break;case 23:G();break;case 24:for(;2<E.length;)y=w+E.shift(),b=D+E.shift(),S=y+E.shift(),x=b+E.shift(),w=S+E.shift(),D=x+E.shift(),O.curveTo(y,b,S,x,w,D);w+=E.shift(),D+=E.shift(),O.lineTo(w,D);break;case 25:for(;6<E.length;)w+=E.shift(),D+=E.shift(),O.lineTo(w,D);y=w+E.shift(),b=D+E.shift(),S=y+E.shift(),x=b+E.shift(),w=S+E.shift(),D=x+E.shift(),O.curveTo(y,b,S,x,w,D);break;case 26:for(E.length%2&&(w+=E.shift());0<E.length;)y=w,b=D+E.shift(),S=y+E.shift(),x=b+E.shift(),w=S,D=x+E.shift(),O.curveTo(y,b,S,x,w,D);break;case 27:for(E.length%2&&(D+=E.shift());0<E.length;)y=w+E.shift(),b=D,S=y+E.shift(),x=b+E.shift(),w=S+E.shift(),D=x,O.curveTo(y,b,S,x,w,D);break;case 28:r=t[d],n=t[d+1],E.push((r<<24|n<<16)>>16),d+=2;break;case 29:s=E.pop()+v.gsubrsBias,(i=v.gsubrs[s])&&e(i);break;case 30:for(;0<E.length&&(y=w,b=D+E.shift(),S=y+E.shift(),x=b+E.shift(),w=S+E.shift(),D=x+(1===E.length?E.shift():0),O.curveTo(y,b,S,x,w,D),0!==E.length);)y=w+E.shift(),b=D,S=y+E.shift(),x=b+E.shift(),D=x+E.shift(),w=S+(1===E.length?E.shift():0),O.curveTo(y,b,S,x,w,D);break;case 31:for(;0<E.length&&(y=w+E.shift(),b=D,S=y+E.shift(),x=b+E.shift(),D=x+E.shift(),w=S+(1===E.length?E.shift():0),O.curveTo(y,b,S,x,w,D),0!==E.length);)y=w,b=D+E.shift(),S=y+E.shift(),x=b+E.shift(),w=S+E.shift(),D=x+(1===E.length?E.shift():0),O.curveTo(y,b,S,x,w,D);break;default:g<32?console.log("Glyph "+m.index+": unknown operator "+g):g<247?E.push(g-139):g<251?(r=t[d],d+=1,E.push(256*(g-247)+r+108)):g<255?(r=t[d],d+=1,E.push(256*-(g-251)-r-108)):(r=t[d],n=t[d+1],a=t[d+2],o=t[d+3],d+=4,E.push((r<<24|n<<16|a<<8|o)/65536))}}}(e),m.advanceWidth=I,O}function Be(e,t){var r,n=le.indexOf(e);return 0<=n&&(r=n),0<=(n=t.indexOf(e))?r=n+le.length:(r=le.length+t.length,t.push(e)),r}function Fe(e,t,r){for(var n={},a=0;a<e.length;a+=1){var o=e[a],s=t[o.name];void 0===s||ke(s,o.value)||("SID"===o.type&&(s=Be(s,r)),n[o.op]={name:o.name,type:o.type,value:s})}return n}function Ae(e,t){var r=new $.Record("Top DICT",[{name:"dict",type:"DICT",value:{}}]);return r.dict=Fe(we,e,t),r}function Pe(e){var t=new $.Record("Top DICT INDEX",[{name:"topDicts",type:"INDEX",value:[]}]);return t.topDicts=[{name:"topDict_0",type:"TABLE",value:e}],t}function Ne(e){var t=[],r=e.path;t.push({name:"width",type:"NUMBER",value:e.advanceWidth});for(var n=0,a=0,o=0;o<r.commands.length;o+=1){var s=void 0,i=void 0,u=r.commands[o];if("Q"===u.type){u={type:"C",x:u.x,y:u.y,x1:Math.round(1/3*n+2/3*u.x1),y1:Math.round(1/3*a+2/3*u.y1),x2:Math.round(1/3*u.x+2/3*u.x1),y2:Math.round(1/3*u.y+2/3*u.y1)}}if("M"===u.type)s=Math.round(u.x-n),i=Math.round(u.y-a),t.push({name:"dx",type:"NUMBER",value:s}),t.push({name:"dy",type:"NUMBER",value:i}),t.push({name:"rmoveto",type:"OP",value:21}),n=Math.round(u.x),a=Math.round(u.y);else if("L"===u.type)s=Math.round(u.x-n),i=Math.round(u.y-a),t.push({name:"dx",type:"NUMBER",value:s}),t.push({name:"dy",type:"NUMBER",value:i}),t.push({name:"rlineto",type:"OP",value:5}),n=Math.round(u.x),a=Math.round(u.y);else if("C"===u.type){var l=Math.round(u.x1-n),p=Math.round(u.y1-a),c=Math.round(u.x2-u.x1),h=Math.round(u.y2-u.y1);s=Math.round(u.x-u.x2),i=Math.round(u.y-u.y2),t.push({name:"dx1",type:"NUMBER",value:l}),t.push({name:"dy1",type:"NUMBER",value:p}),t.push({name:"dx2",type:"NUMBER",value:c}),t.push({name:"dy2",type:"NUMBER",value:h}),t.push({name:"dx",type:"NUMBER",value:s}),t.push({name:"dy",type:"NUMBER",value:i}),t.push({name:"rrcurveto",type:"OP",value:8}),n=Math.round(u.x),a=Math.round(u.y)}}return t.push({name:"endchar",type:"OP",value:14}),t}var He={parse:function(r,n,a,e){a.tables.cff={};var t,o,s,i=(t=r,o=n,(s={}).formatMajor=ie.getCard8(t,o),s.formatMinor=ie.getCard8(t,o+1),s.size=ie.getCard8(t,o+2),s.offsetSize=ie.getCard8(t,o+3),s.startOffset=o,s.endOffset=o+4,s),u=Oe(r,i.endOffset,ie.bytesToString),l=Oe(r,u.endOffset),p=Oe(r,l.endOffset,ie.bytesToString),c=Oe(r,p.endOffset);a.gsubrs=c.objects,a.gsubrsBias=Ue(a.gsubrs);var h=Me(r,n,l.objects,p.objects);if(1!==h.length)throw new Error("CFF table has too many fonts in 'FontSet' - count of fonts NameIndex.length = "+h.length);var f=h[0];if((a.tables.cff.topDict=f)._privateDict&&(a.defaultWidthX=f._privateDict.defaultWidthX,a.nominalWidthX=f._privateDict.nominalWidthX),void 0!==f.ros[0]&&void 0!==f.ros[1]&&(a.isCIDFont=!0),a.isCIDFont){var d=f.fdArray,g=f.fdSelect;if(0===d||0===g)throw new Error("Font is marked as a CID font, but FDArray and/or FDSelect information is missing");var v=Oe(r,d+=n),m=Me(r,n,v.objects,p.objects);f._fdArray=m,g+=n,f._fdSelect=function(e,t,r,n){var a,o=[],s=new ie.Parser(e,t),i=s.parseCard8();if(0===i)for(var u=0;u<r;u++){if(n<=(a=s.parseCard8()))throw new Error("CFF table CID Font FDSelect has bad FD index value "+a+" (FD count "+n+")");o.push(a)}else{if(3!==i)throw new Error("CFF Table CID Font FDSelect table has unsupported format "+i);var l,p=s.parseCard16(),c=s.parseCard16();if(0!==c)throw new Error("CFF Table CID Font FDSelect format 3 range has bad initial GID "+c);for(var h=0;h<p;h++){if(a=s.parseCard8(),l=s.parseCard16(),n<=a)throw new Error("CFF table CID Font FDSelect has bad FD index value "+a+" (FD count "+n+")");if(r<l)throw new Error("CFF Table CID Font FDSelect format 3 range has bad GID "+l);for(;c<l;c++)o.push(a);c=l}if(l!==r)throw new Error("CFF Table CID Font FDSelect format 3 range has bad final GID "+l)}return o}(r,g,a.numGlyphs,m.length)}var y,b=n+f.private[1],S=Ie(r,b,f.private[0],p.objects);if(a.defaultWidthX=S.defaultWidthX,a.nominalWidthX=S.nominalWidthX,0!==S.subrs){var x=b+S.subrs,T=Oe(r,x);a.subrs=T.objects,a.subrsBias=Ue(a.subrs)}else a.subrs=[],a.subrsBias=0;e.lowMemory?(y=function(e,t){var r,n,a=[],o=ie.getCard16(e,t);if(0!==o){var s=ie.getByte(e,t+2);r=t+(o+1)*s+2;for(var i=t+3,u=0;u<o+1;u+=1)a.push(ie.getOffset(e,i,s)),i+=s;n=r+a[o]}else n=t+2;return{offsets:a,startOffset:t,endOffset:n}}(r,n+f.charStrings),a.nGlyphs=y.offsets.length):(y=Oe(r,n+f.charStrings),a.nGlyphs=y.objects.length);var k=function(e,t,r,n){var a,o,s=new ie.Parser(e,t);--r;var i=[".notdef"],u=s.parseCard8();if(0===u)for(var l=0;l<r;l+=1)a=s.parseSID(),i.push(Le(n,a));else if(1===u)for(;i.length<=r;){a=s.parseSID(),o=s.parseCard8();for(var p=0;p<=o;p+=1)i.push(Le(n,a)),a+=1}else{if(2!==u)throw new Error("Unknown charset format "+u);for(;i.length<=r;){a=s.parseSID(),o=s.parseCard16();for(var c=0;c<=o;c+=1)i.push(Le(n,a)),a+=1}}return i}(r,n+f.charset,a.nGlyphs,p.objects);if(0===f.encoding?a.cffEncoding=new ge(pe,k):1===f.encoding?a.cffEncoding=new ge(ce,k):a.cffEncoding=function(e,t,r){var n,a={},o=new ie.Parser(e,t),s=o.parseCard8();if(0===s)for(var i=o.parseCard8(),u=0;u<i;u+=1)a[n=o.parseCard8()]=u;else{if(1!==s)throw new Error("Unknown encoding format "+s);var l=o.parseCard8();n=1;for(var p=0;p<l;p+=1)for(var c=o.parseCard8(),h=o.parseCard8(),f=c;f<=c+h;f+=1)a[f]=n,n+=1}return new ge(a,r)}(r,n+f.encoding,k),a.encoding=a.encoding||a.cffEncoding,a.glyphs=new Te.GlyphSet(a),e.lowMemory)a._push=function(e){var t=function(e,t,r,n,a){var o=ie.getCard16(r,n),s=0;0!==o&&(s=n+(o+1)*ie.getByte(r,n+2)+2);var i=ie.getBytes(r,s+t[e],s+t[e+1]);return a&&(i=a(i)),i}(e,y.offsets,r,n+f.charStrings);a.glyphs.push(e,Te.cffGlyphLoader(a,e,Ge,t))};else for(var U=0;U<a.nGlyphs;U+=1){var O=y.objects[U];a.glyphs.push(U,Te.cffGlyphLoader(a,U,Ge,O))}},make:function(e,t){for(var r,n=new $.Table("CFF ",[{name:"header",type:"RECORD"},{name:"nameIndex",type:"RECORD"},{name:"topDictIndex",type:"RECORD"},{name:"stringIndex",type:"RECORD"},{name:"globalSubrIndex",type:"RECORD"},{name:"charsets",type:"RECORD"},{name:"charStringsIndex",type:"RECORD"},{name:"privateDict",type:"RECORD"}]),a=1/t.unitsPerEm,o={version:t.version,fullName:t.fullName,familyName:t.familyName,weight:t.weightName,fontBBox:t.fontBBox||[0,0,0,0],fontMatrix:[a,0,0,a,0,0],charset:999,encoding:0,charStrings:999,private:[0,999]},s=[],i=1;i<e.length;i+=1)r=e.get(i),s.push(r.name);var u=[];n.header=new $.Record("Header",[{name:"major",type:"Card8",value:1},{name:"minor",type:"Card8",value:0},{name:"hdrSize",type:"Card8",value:4},{name:"major",type:"Card8",value:1}]),n.nameIndex=function(e){var t=new $.Record("Name INDEX",[{name:"names",type:"INDEX",value:[]}]);t.names=[];for(var r=0;r<e.length;r+=1)t.names.push({name:"name_"+r,type:"NAME",value:e[r]});return t}([t.postScriptName]);var l,p,c,h=Ae(o,u);n.topDictIndex=Pe(h),n.globalSubrIndex=new $.Record("Global Subr INDEX",[{name:"subrs",type:"INDEX",value:[]}]),n.charsets=function(e,t){for(var r=new $.Record("Charsets",[{name:"format",type:"Card8",value:0}]),n=0;n<e.length;n+=1){var a=Be(e[n],t);r.fields.push({name:"glyph_"+n,type:"SID",value:a})}return r}(s,u),n.charStringsIndex=function(e){for(var t=new $.Record("CharStrings INDEX",[{name:"charStrings",type:"INDEX",value:[]}]),r=0;r<e.length;r+=1){var n=e.get(r),a=Ne(n);t.charStrings.push({name:n.name,type:"CHARSTRING",value:a})}return t}(e),n.privateDict=(l={},p=u,(c=new $.Record("Private DICT",[{name:"dict",type:"DICT",value:{}}])).dict=Fe(De,l,p),c),n.stringIndex=function(e){var t=new $.Record("String INDEX",[{name:"strings",type:"INDEX",value:[]}]);t.strings=[];for(var r=0;r<e.length;r+=1)t.strings.push({name:"string_"+r,type:"STRING",value:e[r]});return t}(u);var f=n.header.sizeOf()+n.nameIndex.sizeOf()+n.topDictIndex.sizeOf()+n.stringIndex.sizeOf()+n.globalSubrIndex.sizeOf();return o.charset=f,o.encoding=0,o.charStrings=o.charset+n.charsets.sizeOf(),o.private[1]=o.charStrings+n.charStringsIndex.sizeOf(),h=Ae(o,u),n.topDictIndex=Pe(h),n}};var ze={parse:function(e,t){var r={},n=new ie.Parser(e,t);return r.version=n.parseVersion(),r.fontRevision=Math.round(1e3*n.parseFixed())/1e3,r.checkSumAdjustment=n.parseULong(),r.magicNumber=n.parseULong(),w.argument(1594834165===r.magicNumber,"Font header has wrong magic number."),r.flags=n.parseUShort(),r.unitsPerEm=n.parseUShort(),r.created=n.parseLongDateTime(),r.modified=n.parseLongDateTime(),r.xMin=n.parseShort(),r.yMin=n.parseShort(),r.xMax=n.parseShort(),r.yMax=n.parseShort(),r.macStyle=n.parseUShort(),r.lowestRecPPEM=n.parseUShort(),r.fontDirectionHint=n.parseShort(),r.indexToLocFormat=n.parseShort(),r.glyphDataFormat=n.parseShort(),r},make:function(e){var t=Math.round((new Date).getTime()/1e3)+2082844800,r=t;return e.createdTimestamp&&(r=e.createdTimestamp+2082844800),new $.Table("head",[{name:"version",type:"FIXED",value:65536},{name:"fontRevision",type:"FIXED",value:65536},{name:"checkSumAdjustment",type:"ULONG",value:0},{name:"magicNumber",type:"ULONG",value:1594834165},{name:"flags",type:"USHORT",value:0},{name:"unitsPerEm",type:"USHORT",value:1e3},{name:"created",type:"LONGDATETIME",value:r},{name:"modified",type:"LONGDATETIME",value:t},{name:"xMin",type:"SHORT",value:0},{name:"yMin",type:"SHORT",value:0},{name:"xMax",type:"SHORT",value:0},{name:"yMax",type:"SHORT",value:0},{name:"macStyle",type:"USHORT",value:0},{name:"lowestRecPPEM",type:"USHORT",value:0},{name:"fontDirectionHint",type:"SHORT",value:2},{name:"indexToLocFormat",type:"SHORT",value:0},{name:"glyphDataFormat",type:"SHORT",value:0}],e)}};var We={parse:function(e,t){var r={},n=new ie.Parser(e,t);return r.version=n.parseVersion(),r.ascender=n.parseShort(),r.descender=n.parseShort(),r.lineGap=n.parseShort(),r.advanceWidthMax=n.parseUShort(),r.minLeftSideBearing=n.parseShort(),r.minRightSideBearing=n.parseShort(),r.xMaxExtent=n.parseShort(),r.caretSlopeRise=n.parseShort(),r.caretSlopeRun=n.parseShort(),r.caretOffset=n.parseShort(),n.relativeOffset+=8,r.metricDataFormat=n.parseShort(),r.numberOfHMetrics=n.parseUShort(),r},make:function(e){return new $.Table("hhea",[{name:"version",type:"FIXED",value:65536},{name:"ascender",type:"FWORD",value:0},{name:"descender",type:"FWORD",value:0},{name:"lineGap",type:"FWORD",value:0},{name:"advanceWidthMax",type:"UFWORD",value:0},{name:"minLeftSideBearing",type:"FWORD",value:0},{name:"minRightSideBearing",type:"FWORD",value:0},{name:"xMaxExtent",type:"FWORD",value:0},{name:"caretSlopeRise",type:"SHORT",value:1},{name:"caretSlopeRun",type:"SHORT",value:0},{name:"caretOffset",type:"SHORT",value:0},{name:"reserved1",type:"SHORT",value:0},{name:"reserved2",type:"SHORT",value:0},{name:"reserved3",type:"SHORT",value:0},{name:"reserved4",type:"SHORT",value:0},{name:"metricDataFormat",type:"SHORT",value:0},{name:"numberOfHMetrics",type:"USHORT",value:0}],e)}};var qe={parse:function(e,t,r,n,a,o,s){s.lowMemory?function(e,t,r,n,a){var o,s;e._hmtxTableData={};for(var i=new ie.Parser(t,r),u=0;u<a;u+=1)u<n&&(o=i.parseUShort(),s=i.parseShort()),e._hmtxTableData[u]={advanceWidth:o,leftSideBearing:s}}(e,t,r,n,a):function(e,t,r,n,a){for(var o,s,i=new ie.Parser(e,t),u=0;u<n;u+=1){u<r&&(o=i.parseUShort(),s=i.parseShort());var l=a.get(u);l.advanceWidth=o,l.leftSideBearing=s}}(t,r,n,a,o)},make:function(e){for(var t=new $.Table("hmtx",[]),r=0;r<e.length;r+=1){var n=e.get(r),a=n.advanceWidth||0,o=n.leftSideBearing||0;t.fields.push({name:"advanceWidth_"+r,type:"USHORT",value:a}),t.fields.push({name:"leftSideBearing_"+r,type:"SHORT",value:o})}return t}};var _e={make:function(e){for(var t=new $.Table("ltag",[{name:"version",type:"ULONG",value:1},{name:"flags",type:"ULONG",value:0},{name:"numTags",type:"ULONG",value:e.length}]),r="",n=12+4*e.length,a=0;a<e.length;++a){var o=r.indexOf(e[a]);o<0&&(o=r.length,r+=e[a]),t.fields.push({name:"offset "+a,type:"USHORT",value:n+o}),t.fields.push({name:"length "+a,type:"USHORT",value:e[a].length})}return t.fields.push({name:"stringPool",type:"CHARARRAY",value:r}),t},parse:function(e,t){var r=new ie.Parser(e,t),n=r.parseULong();w.argument(1===n,"Unsupported ltag table version."),r.skip("uLong",1);for(var a=r.parseULong(),o=[],s=0;s<a;s++){for(var i="",u=t+r.parseUShort(),l=r.parseUShort(),p=u;p<u+l;++p)i+=String.fromCharCode(e.getInt8(p));o.push(i)}return o}};var Xe={parse:function(e,t){var r={},n=new ie.Parser(e,t);return r.version=n.parseVersion(),r.numGlyphs=n.parseUShort(),1===r.version&&(r.maxPoints=n.parseUShort(),r.maxContours=n.parseUShort(),r.maxCompositePoints=n.parseUShort(),r.maxCompositeContours=n.parseUShort(),r.maxZones=n.parseUShort(),r.maxTwilightPoints=n.parseUShort(),r.maxStorage=n.parseUShort(),r.maxFunctionDefs=n.parseUShort(),r.maxInstructionDefs=n.parseUShort(),r.maxStackElements=n.parseUShort(),r.maxSizeOfInstructions=n.parseUShort(),r.maxComponentElements=n.parseUShort(),r.maxComponentDepth=n.parseUShort()),r},make:function(e){return new $.Table("maxp",[{name:"version",type:"FIXED",value:20480},{name:"numGlyphs",type:"USHORT",value:e}])}},Ve=["copyright","fontFamily","fontSubfamily","uniqueID","fullName","version","postScriptName","trademark","manufacturer","designer","description","manufacturerURL","designerURL","license","licenseURL","reserved","preferredFamily","preferredSubfamily","compatibleFullName","sampleText","postScriptFindFontName","wwsFamily","wwsSubfamily"],Ye={0:"en",1:"fr",2:"de",3:"it",4:"nl",5:"sv",6:"es",7:"da",8:"pt",9:"no",10:"he",11:"ja",12:"ar",13:"fi",14:"el",15:"is",16:"mt",17:"tr",18:"hr",19:"zh-Hant",20:"ur",21:"hi",22:"th",23:"ko",24:"lt",25:"pl",26:"hu",27:"es",28:"lv",29:"se",30:"fo",31:"fa",32:"ru",33:"zh",34:"nl-BE",35:"ga",36:"sq",37:"ro",38:"cz",39:"sk",40:"si",41:"yi",42:"sr",43:"mk",44:"bg",45:"uk",46:"be",47:"uz",48:"kk",49:"az-Cyrl",50:"az-Arab",51:"hy",52:"ka",53:"mo",54:"ky",55:"tg",56:"tk",57:"mn-CN",58:"mn",59:"ps",60:"ks",61:"ku",62:"sd",63:"bo",64:"ne",65:"sa",66:"mr",67:"bn",68:"as",69:"gu",70:"pa",71:"or",72:"ml",73:"kn",74:"ta",75:"te",76:"si",77:"my",78:"km",79:"lo",80:"vi",81:"id",82:"tl",83:"ms",84:"ms-Arab",85:"am",86:"ti",87:"om",88:"so",89:"sw",90:"rw",91:"rn",92:"ny",93:"mg",94:"eo",128:"cy",129:"eu",130:"ca",131:"la",132:"qu",133:"gn",134:"ay",135:"tt",136:"ug",137:"dz",138:"jv",139:"su",140:"gl",141:"af",142:"br",143:"iu",144:"gd",145:"gv",146:"ga",147:"to",148:"el-polyton",149:"kl",150:"az",151:"nn"},je={0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:5,11:1,12:4,13:0,14:6,15:0,16:0,17:0,18:0,19:2,20:4,21:9,22:21,23:3,24:29,25:29,26:29,27:29,28:29,29:0,30:0,31:4,32:7,33:25,34:0,35:0,36:0,37:0,38:29,39:29,40:0,41:5,42:7,43:7,44:7,45:7,46:7,47:7,48:7,49:7,50:4,51:24,52:23,53:7,54:7,55:7,56:7,57:27,58:7,59:4,60:4,61:4,62:4,63:26,64:9,65:9,66:9,67:13,68:13,69:11,70:10,71:12,72:17,73:16,74:14,75:15,76:18,77:19,78:20,79:22,80:30,81:0,82:0,83:0,84:4,85:28,86:28,87:28,88:0,89:0,90:0,91:0,92:0,93:0,94:0,128:0,129:0,130:0,131:0,132:0,133:0,134:0,135:7,136:4,137:26,138:0,139:0,140:0,141:0,142:0,143:28,144:0,145:0,146:0,147:0,148:6,149:0,150:0,151:0},Ze={1078:"af",1052:"sq",1156:"gsw",1118:"am",5121:"ar-DZ",15361:"ar-BH",3073:"ar",2049:"ar-IQ",11265:"ar-JO",13313:"ar-KW",12289:"ar-LB",4097:"ar-LY",6145:"ary",8193:"ar-OM",16385:"ar-QA",1025:"ar-SA",10241:"ar-SY",7169:"aeb",14337:"ar-AE",9217:"ar-YE",1067:"hy",1101:"as",2092:"az-Cyrl",1068:"az",1133:"ba",1069:"eu",1059:"be",2117:"bn",1093:"bn-IN",8218:"bs-Cyrl",5146:"bs",1150:"br",1026:"bg",1027:"ca",3076:"zh-HK",5124:"zh-MO",2052:"zh",4100:"zh-SG",1028:"zh-TW",1155:"co",1050:"hr",4122:"hr-BA",1029:"cs",1030:"da",1164:"prs",1125:"dv",2067:"nl-BE",1043:"nl",3081:"en-AU",10249:"en-BZ",4105:"en-CA",9225:"en-029",16393:"en-IN",6153:"en-IE",8201:"en-JM",17417:"en-MY",5129:"en-NZ",13321:"en-PH",18441:"en-SG",7177:"en-ZA",11273:"en-TT",2057:"en-GB",1033:"en",12297:"en-ZW",1061:"et",1080:"fo",1124:"fil",1035:"fi",2060:"fr-BE",3084:"fr-CA",1036:"fr",5132:"fr-LU",6156:"fr-MC",4108:"fr-CH",1122:"fy",1110:"gl",1079:"ka",3079:"de-AT",1031:"de",5127:"de-LI",4103:"de-LU",2055:"de-CH",1032:"el",1135:"kl",1095:"gu",1128:"ha",1037:"he",1081:"hi",1038:"hu",1039:"is",1136:"ig",1057:"id",1117:"iu",2141:"iu-Latn",2108:"ga",1076:"xh",1077:"zu",1040:"it",2064:"it-CH",1041:"ja",1099:"kn",1087:"kk",1107:"km",1158:"quc",1159:"rw",1089:"sw",1111:"kok",1042:"ko",1088:"ky",1108:"lo",1062:"lv",1063:"lt",2094:"dsb",1134:"lb",1071:"mk",2110:"ms-BN",1086:"ms",1100:"ml",1082:"mt",1153:"mi",1146:"arn",1102:"mr",1148:"moh",1104:"mn",2128:"mn-CN",1121:"ne",1044:"nb",2068:"nn",1154:"oc",1096:"or",1123:"ps",1045:"pl",1046:"pt",2070:"pt-PT",1094:"pa",1131:"qu-BO",2155:"qu-EC",3179:"qu",1048:"ro",1047:"rm",1049:"ru",9275:"smn",4155:"smj-NO",5179:"smj",3131:"se-FI",1083:"se",2107:"se-SE",8251:"sms",6203:"sma-NO",7227:"sms",1103:"sa",7194:"sr-Cyrl-BA",3098:"sr",6170:"sr-Latn-BA",2074:"sr-Latn",1132:"nso",1074:"tn",1115:"si",1051:"sk",1060:"sl",11274:"es-AR",16394:"es-BO",13322:"es-CL",9226:"es-CO",5130:"es-CR",7178:"es-DO",12298:"es-EC",17418:"es-SV",4106:"es-GT",18442:"es-HN",2058:"es-MX",19466:"es-NI",6154:"es-PA",15370:"es-PY",10250:"es-PE",20490:"es-PR",3082:"es",1034:"es",21514:"es-US",14346:"es-UY",8202:"es-VE",2077:"sv-FI",1053:"sv",1114:"syr",1064:"tg",2143:"tzm",1097:"ta",1092:"tt",1098:"te",1054:"th",1105:"bo",1055:"tr",1090:"tk",1152:"ug",1058:"uk",1070:"hsb",1056:"ur",2115:"uz-Cyrl",1091:"uz",1066:"vi",1106:"cy",1160:"wo",1157:"sah",1144:"ii",1130:"yo"};function Qe(e,t,r){switch(e){case 0:if(65535===t)return"und";if(r)return r[t];break;case 1:return Ye[t];case 3:return Ze[t]}}var Ke="utf-16",Je={0:"macintosh",1:"x-mac-japanese",2:"x-mac-chinesetrad",3:"x-mac-korean",6:"x-mac-greek",7:"x-mac-cyrillic",9:"x-mac-devanagai",10:"x-mac-gurmukhi",11:"x-mac-gujarati",12:"x-mac-oriya",13:"x-mac-bengali",14:"x-mac-tamil",15:"x-mac-telugu",16:"x-mac-kannada",17:"x-mac-malayalam",18:"x-mac-sinhalese",19:"x-mac-burmese",20:"x-mac-khmer",21:"x-mac-thai",22:"x-mac-lao",23:"x-mac-georgian",24:"x-mac-armenian",25:"x-mac-chinesesimp",26:"x-mac-tibetan",27:"x-mac-mongolian",28:"x-mac-ethiopic",29:"x-mac-ce",30:"x-mac-vietnamese",31:"x-mac-extarabic"},$e={15:"x-mac-icelandic",17:"x-mac-turkish",18:"x-mac-croatian",24:"x-mac-ce",25:"x-mac-ce",26:"x-mac-ce",27:"x-mac-ce",28:"x-mac-ce",30:"x-mac-icelandic",37:"x-mac-romanian",38:"x-mac-ce",39:"x-mac-ce",40:"x-mac-ce",143:"x-mac-inuit",146:"x-mac-gaelic"};function et(e,t,r){switch(e){case 0:return Ke;case 1:return $e[r]||Je[t];case 3:if(1===t||10===t)return Ke}}function tt(e){var t={};for(var r in e)t[e[r]]=parseInt(r);return t}function rt(e,t,r,n,a,o){return new $.Record("NameRecord",[{name:"platformID",type:"USHORT",value:e},{name:"encodingID",type:"USHORT",value:t},{name:"languageID",type:"USHORT",value:r},{name:"nameID",type:"USHORT",value:n},{name:"length",type:"USHORT",value:a},{name:"offset",type:"USHORT",value:o}])}function nt(e,t){var r=function(e,t){var r=e.length,n=t.length-r+1;e:for(var a=0;a<n;a++)for(;a<n;a++){for(var o=0;o<r;o++)if(t[a+o]!==e[o])continue e;return a}return-1}(e,t);if(r<0){r=t.length;for(var n=0,a=e.length;n<a;++n)t.push(e[n])}return r}var at={parse:function(e,t,r){for(var n={},a=new ie.Parser(e,t),o=a.parseUShort(),s=a.parseUShort(),i=a.offset+a.parseUShort(),u=0;u<s;u++){var l=a.parseUShort(),p=a.parseUShort(),c=a.parseUShort(),h=a.parseUShort(),f=Ve[h]||h,d=a.parseUShort(),g=a.parseUShort(),v=Qe(l,c,r),m=et(l,p,c);if(void 0!==m&&void 0!==v){var y=void 0;if(y=m===Ke?I.UTF16(e,i+g,d):I.MACSTRING(e,i+g,d,m)){var b=n[f];void 0===b&&(b=n[f]={}),b[v]=y}}}return 1===o&&a.parseUShort(),n},make:function(e,t){var r,n=[],a={},o=tt(Ve);for(var s in e){var i=o[s];if(void 0===i&&(i=s),r=parseInt(i),isNaN(r))throw new Error('Name table entry "'+s+'" does not exist, see nameTableNames for complete list.');a[r]=e[s],n.push(r)}for(var u=tt(Ye),l=tt(Ze),p=[],c=[],h=0;h<n.length;h++){var f=a[r=n[h]];for(var d in f){var g=f[d],v=1,m=u[d],y=je[m],b=et(v,y,m),S=M.MACSTRING(g,b);void 0===S&&(v=0,(m=t.indexOf(d))<0&&(m=t.length,t.push(d)),y=4,S=M.UTF16(g));var x=nt(S,c);p.push(rt(v,y,m,r,S.length,x));var T=l[d];if(void 0!==T){var k=M.UTF16(g),U=nt(k,c);p.push(rt(3,1,T,r,k.length,U))}}}p.sort(function(e,t){return e.platformID-t.platformID||e.encodingID-t.encodingID||e.languageID-t.languageID||e.nameID-t.nameID});for(var O=new $.Table("name",[{name:"format",type:"USHORT",value:0},{name:"count",type:"USHORT",value:p.length},{name:"stringOffset",type:"USHORT",value:6+12*p.length}]),E=0;E<p.length;E++)O.fields.push({name:"record_"+E,type:"RECORD",value:p[E]});return O.fields.push({name:"strings",type:"LITERAL",value:c}),O}},ot=[{begin:0,end:127},{begin:128,end:255},{begin:256,end:383},{begin:384,end:591},{begin:592,end:687},{begin:688,end:767},{begin:768,end:879},{begin:880,end:1023},{begin:11392,end:11519},{begin:1024,end:1279},{begin:1328,end:1423},{begin:1424,end:1535},{begin:42240,end:42559},{begin:1536,end:1791},{begin:1984,end:2047},{begin:2304,end:2431},{begin:2432,end:2559},{begin:2560,end:2687},{begin:2688,end:2815},{begin:2816,end:2943},{begin:2944,end:3071},{begin:3072,end:3199},{begin:3200,end:3327},{begin:3328,end:3455},{begin:3584,end:3711},{begin:3712,end:3839},{begin:4256,end:4351},{begin:6912,end:7039},{begin:4352,end:4607},{begin:7680,end:7935},{begin:7936,end:8191},{begin:8192,end:8303},{begin:8304,end:8351},{begin:8352,end:8399},{begin:8400,end:8447},{begin:8448,end:8527},{begin:8528,end:8591},{begin:8592,end:8703},{begin:8704,end:8959},{begin:8960,end:9215},{begin:9216,end:9279},{begin:9280,end:9311},{begin:9312,end:9471},{begin:9472,end:9599},{begin:9600,end:9631},{begin:9632,end:9727},{begin:9728,end:9983},{begin:9984,end:10175},{begin:12288,end:12351},{begin:12352,end:12447},{begin:12448,end:12543},{begin:12544,end:12591},{begin:12592,end:12687},{begin:43072,end:43135},{begin:12800,end:13055},{begin:13056,end:13311},{begin:44032,end:55215},{begin:55296,end:57343},{begin:67840,end:67871},{begin:19968,end:40959},{begin:57344,end:63743},{begin:12736,end:12783},{begin:64256,end:64335},{begin:64336,end:65023},{begin:65056,end:65071},{begin:65040,end:65055},{begin:65104,end:65135},{begin:65136,end:65279},{begin:65280,end:65519},{begin:65520,end:65535},{begin:3840,end:4095},{begin:1792,end:1871},{begin:1920,end:1983},{begin:3456,end:3583},{begin:4096,end:4255},{begin:4608,end:4991},{begin:5024,end:5119},{begin:5120,end:5759},{begin:5760,end:5791},{begin:5792,end:5887},{begin:6016,end:6143},{begin:6144,end:6319},{begin:10240,end:10495},{begin:40960,end:42127},{begin:5888,end:5919},{begin:66304,end:66351},{begin:66352,end:66383},{begin:66560,end:66639},{begin:118784,end:119039},{begin:119808,end:120831},{begin:1044480,end:1048573},{begin:65024,end:65039},{begin:917504,end:917631},{begin:6400,end:6479},{begin:6480,end:6527},{begin:6528,end:6623},{begin:6656,end:6687},{begin:11264,end:11359},{begin:11568,end:11647},{begin:19904,end:19967},{begin:43008,end:43055},{begin:65536,end:65663},{begin:65856,end:65935},{begin:66432,end:66463},{begin:66464,end:66527},{begin:66640,end:66687},{begin:66688,end:66735},{begin:67584,end:67647},{begin:68096,end:68191},{begin:119552,end:119647},{begin:73728,end:74751},{begin:119648,end:119679},{begin:7040,end:7103},{begin:7168,end:7247},{begin:7248,end:7295},{begin:43136,end:43231},{begin:43264,end:43311},{begin:43312,end:43359},{begin:43520,end:43615},{begin:65936,end:65999},{begin:66e3,end:66047},{begin:66208,end:66271},{begin:127024,end:127135}];var st={parse:function(e,t){var r={},n=new ie.Parser(e,t);r.version=n.parseUShort(),r.xAvgCharWidth=n.parseShort(),r.usWeightClass=n.parseUShort(),r.usWidthClass=n.parseUShort(),r.fsType=n.parseUShort(),r.ySubscriptXSize=n.parseShort(),r.ySubscriptYSize=n.parseShort(),r.ySubscriptXOffset=n.parseShort(),r.ySubscriptYOffset=n.parseShort(),r.ySuperscriptXSize=n.parseShort(),r.ySuperscriptYSize=n.parseShort(),r.ySuperscriptXOffset=n.parseShort(),r.ySuperscriptYOffset=n.parseShort(),r.yStrikeoutSize=n.parseShort(),r.yStrikeoutPosition=n.parseShort(),r.sFamilyClass=n.parseShort(),r.panose=[];for(var a=0;a<10;a++)r.panose[a]=n.parseByte();return r.ulUnicodeRange1=n.parseULong(),r.ulUnicodeRange2=n.parseULong(),r.ulUnicodeRange3=n.parseULong(),r.ulUnicodeRange4=n.parseULong(),r.achVendID=String.fromCharCode(n.parseByte(),n.parseByte(),n.parseByte(),n.parseByte()),r.fsSelection=n.parseUShort(),r.usFirstCharIndex=n.parseUShort(),r.usLastCharIndex=n.parseUShort(),r.sTypoAscender=n.parseShort(),r.sTypoDescender=n.parseShort(),r.sTypoLineGap=n.parseShort(),r.usWinAscent=n.parseUShort(),r.usWinDescent=n.parseUShort(),1<=r.version&&(r.ulCodePageRange1=n.parseULong(),r.ulCodePageRange2=n.parseULong()),2<=r.version&&(r.sxHeight=n.parseShort(),r.sCapHeight=n.parseShort(),r.usDefaultChar=n.parseUShort(),r.usBreakChar=n.parseUShort(),r.usMaxContent=n.parseUShort()),r},make:function(e){return new $.Table("OS/2",[{name:"version",type:"USHORT",value:3},{name:"xAvgCharWidth",type:"SHORT",value:0},{name:"usWeightClass",type:"USHORT",value:0},{name:"usWidthClass",type:"USHORT",value:0},{name:"fsType",type:"USHORT",value:0},{name:"ySubscriptXSize",type:"SHORT",value:650},{name:"ySubscriptYSize",type:"SHORT",value:699},{name:"ySubscriptXOffset",type:"SHORT",value:0},{name:"ySubscriptYOffset",type:"SHORT",value:140},{name:"ySuperscriptXSize",type:"SHORT",value:650},{name:"ySuperscriptYSize",type:"SHORT",value:699},{name:"ySuperscriptXOffset",type:"SHORT",value:0},{name:"ySuperscriptYOffset",type:"SHORT",value:479},{name:"yStrikeoutSize",type:"SHORT",value:49},{name:"yStrikeoutPosition",type:"SHORT",value:258},{name:"sFamilyClass",type:"SHORT",value:0},{name:"bFamilyType",type:"BYTE",value:0},{name:"bSerifStyle",type:"BYTE",value:0},{name:"bWeight",type:"BYTE",value:0},{name:"bProportion",type:"BYTE",value:0},{name:"bContrast",type:"BYTE",value:0},{name:"bStrokeVariation",type:"BYTE",value:0},{name:"bArmStyle",type:"BYTE",value:0},{name:"bLetterform",type:"BYTE",value:0},{name:"bMidline",type:"BYTE",value:0},{name:"bXHeight",type:"BYTE",value:0},{name:"ulUnicodeRange1",type:"ULONG",value:0},{name:"ulUnicodeRange2",type:"ULONG",value:0},{name:"ulUnicodeRange3",type:"ULONG",value:0},{name:"ulUnicodeRange4",type:"ULONG",value:0},{name:"achVendID",type:"CHARARRAY",value:"XXXX"},{name:"fsSelection",type:"USHORT",value:0},{name:"usFirstCharIndex",type:"USHORT",value:0},{name:"usLastCharIndex",type:"USHORT",value:0},{name:"sTypoAscender",type:"SHORT",value:0},{name:"sTypoDescender",type:"SHORT",value:0},{name:"sTypoLineGap",type:"SHORT",value:0},{name:"usWinAscent",type:"USHORT",value:0},{name:"usWinDescent",type:"USHORT",value:0},{name:"ulCodePageRange1",type:"ULONG",value:0},{name:"ulCodePageRange2",type:"ULONG",value:0},{name:"sxHeight",type:"SHORT",value:0},{name:"sCapHeight",type:"SHORT",value:0},{name:"usDefaultChar",type:"USHORT",value:0},{name:"usBreakChar",type:"USHORT",value:0},{name:"usMaxContext",type:"USHORT",value:0}],e)},unicodeRanges:ot,getUnicodeRange:function(e){for(var t=0;t<ot.length;t+=1){var r=ot[t];if(e>=r.begin&&e<r.end)return t}return-1}};var it={parse:function(e,t){var r={},n=new ie.Parser(e,t);switch(r.version=n.parseVersion(),r.italicAngle=n.parseFixed(),r.underlinePosition=n.parseShort(),r.underlineThickness=n.parseShort(),r.isFixedPitch=n.parseULong(),r.minMemType42=n.parseULong(),r.maxMemType42=n.parseULong(),r.minMemType1=n.parseULong(),r.maxMemType1=n.parseULong(),r.version){case 1:r.names=he.slice();break;case 2:r.numberOfGlyphs=n.parseUShort(),r.glyphNameIndex=new Array(r.numberOfGlyphs);for(var a=0;a<r.numberOfGlyphs;a++)r.glyphNameIndex[a]=n.parseUShort();r.names=[];for(var o=0;o<r.numberOfGlyphs;o++)if(r.glyphNameIndex[o]>=he.length){var s=n.parseChar();r.names.push(n.parseString(s))}break;case 2.5:r.numberOfGlyphs=n.parseUShort(),r.offset=new Array(r.numberOfGlyphs);for(var i=0;i<r.numberOfGlyphs;i++)r.offset[i]=n.parseChar()}return r},make:function(){return new $.Table("post",[{name:"version",type:"FIXED",value:196608},{name:"italicAngle",type:"FIXED",value:0},{name:"underlinePosition",type:"FWORD",value:0},{name:"underlineThickness",type:"FWORD",value:0},{name:"isFixedPitch",type:"ULONG",value:0},{name:"minMemType42",type:"ULONG",value:0},{name:"maxMemType42",type:"ULONG",value:0},{name:"minMemType1",type:"ULONG",value:0},{name:"maxMemType1",type:"ULONG",value:0}])}},ut=new Array(9);ut[1]=function(){var e=this.offset+this.relativeOffset,t=this.parseUShort();return 1===t?{substFormat:1,coverage:this.parsePointer(oe.coverage),deltaGlyphId:this.parseUShort()}:2===t?{substFormat:2,coverage:this.parsePointer(oe.coverage),substitute:this.parseOffset16List()}:void w.assert(!1,"0x"+e.toString(16)+": lookup type 1 format must be 1 or 2.")},ut[2]=function(){var e=this.parseUShort();return w.argument(1===e,"GSUB Multiple Substitution Subtable identifier-format must be 1"),{substFormat:e,coverage:this.parsePointer(oe.coverage),sequences:this.parseListOfLists()}},ut[3]=function(){var e=this.parseUShort();return w.argument(1===e,"GSUB Alternate Substitution Subtable identifier-format must be 1"),{substFormat:e,coverage:this.parsePointer(oe.coverage),alternateSets:this.parseListOfLists()}},ut[4]=function(){var e=this.parseUShort();return w.argument(1===e,"GSUB ligature table identifier-format must be 1"),{substFormat:e,coverage:this.parsePointer(oe.coverage),ligatureSets:this.parseListOfLists(function(){return{ligGlyph:this.parseUShort(),components:this.parseUShortList(this.parseUShort()-1)}})}};var lt={sequenceIndex:oe.uShort,lookupListIndex:oe.uShort};ut[5]=function(){var e=this.offset+this.relativeOffset,t=this.parseUShort();if(1===t)return{substFormat:t,coverage:this.parsePointer(oe.coverage),ruleSets:this.parseListOfLists(function(){var e=this.parseUShort(),t=this.parseUShort();return{input:this.parseUShortList(e-1),lookupRecords:this.parseRecordList(t,lt)}})};if(2===t)return{substFormat:t,coverage:this.parsePointer(oe.coverage),classDef:this.parsePointer(oe.classDef),classSets:this.parseListOfLists(function(){var e=this.parseUShort(),t=this.parseUShort();return{classes:this.parseUShortList(e-1),lookupRecords:this.parseRecordList(t,lt)}})};if(3===t){var r=this.parseUShort(),n=this.parseUShort();return{substFormat:t,coverages:this.parseList(r,oe.pointer(oe.coverage)),lookupRecords:this.parseRecordList(n,lt)}}w.assert(!1,"0x"+e.toString(16)+": lookup type 5 format must be 1, 2 or 3.")},ut[6]=function(){var e=this.offset+this.relativeOffset,t=this.parseUShort();return 1===t?{substFormat:1,coverage:this.parsePointer(oe.coverage),chainRuleSets:this.parseListOfLists(function(){return{backtrack:this.parseUShortList(),input:this.parseUShortList(this.parseShort()-1),lookahead:this.parseUShortList(),lookupRecords:this.parseRecordList(lt)}})}:2===t?{substFormat:2,coverage:this.parsePointer(oe.coverage),backtrackClassDef:this.parsePointer(oe.classDef),inputClassDef:this.parsePointer(oe.classDef),lookaheadClassDef:this.parsePointer(oe.classDef),chainClassSet:this.parseListOfLists(function(){return{backtrack:this.parseUShortList(),input:this.parseUShortList(this.parseShort()-1),lookahead:this.parseUShortList(),lookupRecords:this.parseRecordList(lt)}})}:3===t?{substFormat:3,backtrackCoverage:this.parseList(oe.pointer(oe.coverage)),inputCoverage:this.parseList(oe.pointer(oe.coverage)),lookaheadCoverage:this.parseList(oe.pointer(oe.coverage)),lookupRecords:this.parseRecordList(lt)}:void w.assert(!1,"0x"+e.toString(16)+": lookup type 6 format must be 1, 2 or 3.")},ut[7]=function(){var e=this.parseUShort();w.argument(1===e,"GSUB Extension Substitution subtable identifier-format must be 1");var t=this.parseUShort(),r=new oe(this.data,this.offset+this.parseULong());return{substFormat:1,lookupType:t,extension:ut[t].call(r)}},ut[8]=function(){var e=this.parseUShort();return w.argument(1===e,"GSUB Reverse Chaining Contextual Single Substitution Subtable identifier-format must be 1"),{substFormat:e,coverage:this.parsePointer(oe.coverage),backtrackCoverage:this.parseList(oe.pointer(oe.coverage)),lookaheadCoverage:this.parseList(oe.pointer(oe.coverage)),substitutes:this.parseUShortList()}};var pt=new Array(9);pt[1]=function(e){return 1===e.substFormat?new $.Table("substitutionTable",[{name:"substFormat",type:"USHORT",value:1},{name:"coverage",type:"TABLE",value:new $.Coverage(e.coverage)},{name:"deltaGlyphID",type:"USHORT",value:e.deltaGlyphId}]):new $.Table("substitutionTable",[{name:"substFormat",type:"USHORT",value:2},{name:"coverage",type:"TABLE",value:new $.Coverage(e.coverage)}].concat($.ushortList("substitute",e.substitute)))},pt[2]=function(e){return w.assert(1===e.substFormat,"Lookup type 2 substFormat must be 1."),new $.Table("substitutionTable",[{name:"substFormat",type:"USHORT",value:1},{name:"coverage",type:"TABLE",value:new $.Coverage(e.coverage)}].concat($.tableList("seqSet",e.sequences,function(e){return new $.Table("sequenceSetTable",$.ushortList("sequence",e))})))},pt[3]=function(e){return w.assert(1===e.substFormat,"Lookup type 3 substFormat must be 1."),new $.Table("substitutionTable",[{name:"substFormat",type:"USHORT",value:1},{name:"coverage",type:"TABLE",value:new $.Coverage(e.coverage)}].concat($.tableList("altSet",e.alternateSets,function(e){return new $.Table("alternateSetTable",$.ushortList("alternate",e))})))},pt[4]=function(e){return w.assert(1===e.substFormat,"Lookup type 4 substFormat must be 1."),new $.Table("substitutionTable",[{name:"substFormat",type:"USHORT",value:1},{name:"coverage",type:"TABLE",value:new $.Coverage(e.coverage)}].concat($.tableList("ligSet",e.ligatureSets,function(e){return new $.Table("ligatureSetTable",$.tableList("ligature",e,function(e){return new $.Table("ligatureTable",[{name:"ligGlyph",type:"USHORT",value:e.ligGlyph}].concat($.ushortList("component",e.components,e.components.length+1)))}))})))},pt[6]=function(e){if(1===e.substFormat)return new $.Table("chainContextTable",[{name:"substFormat",type:"USHORT",value:e.substFormat},{name:"coverage",type:"TABLE",value:new $.Coverage(e.coverage)}].concat($.tableList("chainRuleSet",e.chainRuleSets,function(e){return new $.Table("chainRuleSetTable",$.tableList("chainRule",e,function(e){var r=$.ushortList("backtrackGlyph",e.backtrack,e.backtrack.length).concat($.ushortList("inputGlyph",e.input,e.input.length+1)).concat($.ushortList("lookaheadGlyph",e.lookahead,e.lookahead.length)).concat($.ushortList("substitution",[],e.lookupRecords.length));return e.lookupRecords.forEach(function(e,t){r=r.concat({name:"sequenceIndex"+t,type:"USHORT",value:e.sequenceIndex}).concat({name:"lookupListIndex"+t,type:"USHORT",value:e.lookupListIndex})}),new $.Table("chainRuleTable",r)}))})));if(2===e.substFormat)w.assert(!1,"lookup type 6 format 2 is not yet supported.");else if(3===e.substFormat){var r=[{name:"substFormat",type:"USHORT",value:e.substFormat}];return r.push({name:"backtrackGlyphCount",type:"USHORT",value:e.backtrackCoverage.length}),e.backtrackCoverage.forEach(function(e,t){r.push({name:"backtrackCoverage"+t,type:"TABLE",value:new $.Coverage(e)})}),r.push({name:"inputGlyphCount",type:"USHORT",value:e.inputCoverage.length}),e.inputCoverage.forEach(function(e,t){r.push({name:"inputCoverage"+t,type:"TABLE",value:new $.Coverage(e)})}),r.push({name:"lookaheadGlyphCount",type:"USHORT",value:e.lookaheadCoverage.length}),e.lookaheadCoverage.forEach(function(e,t){r.push({name:"lookaheadCoverage"+t,type:"TABLE",value:new $.Coverage(e)})}),r.push({name:"substitutionCount",type:"USHORT",value:e.lookupRecords.length}),e.lookupRecords.forEach(function(e,t){r=r.concat({name:"sequenceIndex"+t,type:"USHORT",value:e.sequenceIndex}).concat({name:"lookupListIndex"+t,type:"USHORT",value:e.lookupListIndex})}),new $.Table("chainContextTable",r)}w.assert(!1,"lookup type 6 format must be 1, 2 or 3.")};var ct={parse:function(e,t){var r=new oe(e,t=t||0),n=r.parseVersion(1);return w.argument(1===n||1.1===n,"Unsupported GSUB table version."),1===n?{version:n,scripts:r.parseScriptList(),features:r.parseFeatureList(),lookups:r.parseLookupList(ut)}:{version:n,scripts:r.parseScriptList(),features:r.parseFeatureList(),lookups:r.parseLookupList(ut),variations:r.parseFeatureVariationsList()}},make:function(e){return new $.Table("GSUB",[{name:"version",type:"ULONG",value:65536},{name:"scripts",type:"TABLE",value:new $.ScriptList(e.scripts)},{name:"features",type:"TABLE",value:new $.FeatureList(e.features)},{name:"lookups",type:"TABLE",value:new $.LookupList(e.lookups,pt)}])}};var ht={parse:function(e,t){var r=new ie.Parser(e,t),n=r.parseULong();w.argument(1===n,"Unsupported META table version."),r.parseULong(),r.parseULong();for(var a=r.parseULong(),o={},s=0;s<a;s++){var i=r.parseTag(),u=r.parseULong(),l=r.parseULong(),p=I.UTF8(e,t+u,l);o[i]=p}return o},make:function(e){var t=Object.keys(e).length,r="",n=16+12*t,a=new $.Table("meta",[{name:"version",type:"ULONG",value:1},{name:"flags",type:"ULONG",value:0},{name:"offset",type:"ULONG",value:n},{name:"numTags",type:"ULONG",value:t}]);for(var o in e){var s=r.length;r+=e[o],a.fields.push({name:"tag "+o,type:"TAG",value:o}),a.fields.push({name:"offset "+o,type:"ULONG",value:n+s}),a.fields.push({name:"length "+o,type:"ULONG",value:e[o].length})}return a.fields.push({name:"stringPool",type:"CHARARRAY",value:r}),a}};function ft(e){return Math.log(e)/Math.log(2)|0}function dt(e){for(;e.length%4!=0;)e.push(0);for(var t=0,r=0;r<e.length;r+=4)t+=(e[r]<<24)+(e[r+1]<<16)+(e[r+2]<<8)+e[r+3];return t%=Math.pow(2,32)}function gt(e,t,r,n){return new $.Record("Table Record",[{name:"tag",type:"TAG",value:void 0!==e?e:""},{name:"checkSum",type:"ULONG",value:void 0!==t?t:0},{name:"offset",type:"ULONG",value:void 0!==r?r:0},{name:"length",type:"ULONG",value:void 0!==n?n:0}])}function vt(e){var t=new $.Table("sfnt",[{name:"version",type:"TAG",value:"OTTO"},{name:"numTables",type:"USHORT",value:0},{name:"searchRange",type:"USHORT",value:0},{name:"entrySelector",type:"USHORT",value:0},{name:"rangeShift",type:"USHORT",value:0}]);t.tables=e,t.numTables=e.length;var r=Math.pow(2,ft(t.numTables));t.searchRange=16*r,t.entrySelector=ft(r),t.rangeShift=16*t.numTables-t.searchRange;for(var n=[],a=[],o=t.sizeOf()+gt().sizeOf()*t.numTables;o%4!=0;)o+=1,a.push({name:"padding",type:"BYTE",value:0});for(var s=0;s<e.length;s+=1){var i=e[s];w.argument(4===i.tableName.length,"Table name"+i.tableName+" is invalid.");var u=i.sizeOf(),l=gt(i.tableName,dt(i.encode()),o,u);for(n.push({name:l.tag+" Table Record",type:"RECORD",value:l}),a.push({name:i.tableName+" table",type:"RECORD",value:i}),o+=u,w.argument(!isNaN(o),"Something went wrong calculating the offset.");o%4!=0;)o+=1,a.push({name:"padding",type:"BYTE",value:0})}return n.sort(function(e,t){return e.value.tag>t.value.tag?1:-1}),t.fields=t.fields.concat(n),t.fields=t.fields.concat(a),t}function mt(e,t,r){for(var n=0;n<t.length;n+=1){var a=e.charToGlyphIndex(t[n]);if(0<a)return e.glyphs.get(a).getMetrics()}return r}var yt={make:vt,fontToTable:function(e){for(var t,r=[],n=[],a=[],o=[],s=[],i=[],u=[],l=0,p=0,c=0,h=0,f=0,d=0;d<e.glyphs.length;d+=1){var g=e.glyphs.get(d),v=0|g.unicode;if(isNaN(g.advanceWidth))throw new Error("Glyph "+g.name+" ("+d+"): advanceWidth is not a number.");(v<t||void 0===t)&&0<v&&(t=v),l<v&&(l=v);var m=st.getUnicodeRange(v);if(m<32)p|=1<<m;else if(m<64)c|=1<<m-32;else if(m<96)h|=1<<m-64;else{if(!(m<123))throw new Error("Unicode ranges bits > 123 are reserved for internal usage");f|=1<<m-96}if(".notdef"!==g.name){var y=g.getMetrics();r.push(y.xMin),n.push(y.yMin),a.push(y.xMax),o.push(y.yMax),i.push(y.leftSideBearing),u.push(y.rightSideBearing),s.push(g.advanceWidth)}}var b={xMin:Math.min.apply(null,r),yMin:Math.min.apply(null,n),xMax:Math.max.apply(null,a),yMax:Math.max.apply(null,o),advanceWidthMax:Math.max.apply(null,s),advanceWidthAvg:function(e){for(var t=0,r=0;r<e.length;r+=1)t+=e[r];return t/e.length}(s),minLeftSideBearing:Math.min.apply(null,i),maxLeftSideBearing:Math.max.apply(null,i),minRightSideBearing:Math.min.apply(null,u)};b.ascender=e.ascender,b.descender=e.descender;var S=ze.make({flags:3,unitsPerEm:e.unitsPerEm,xMin:b.xMin,yMin:b.yMin,xMax:b.xMax,yMax:b.yMax,lowestRecPPEM:3,createdTimestamp:e.createdTimestamp}),x=We.make({ascender:b.ascender,descender:b.descender,advanceWidthMax:b.advanceWidthMax,minLeftSideBearing:b.minLeftSideBearing,minRightSideBearing:b.minRightSideBearing,xMaxExtent:b.maxLeftSideBearing+(b.xMax-b.xMin),numberOfHMetrics:e.glyphs.length}),T=Xe.make(e.glyphs.length),k=st.make(Object.assign({xAvgCharWidth:Math.round(b.advanceWidthAvg),usFirstCharIndex:t,usLastCharIndex:l,ulUnicodeRange1:p,ulUnicodeRange2:c,ulUnicodeRange3:h,ulUnicodeRange4:f,sTypoAscender:b.ascender,sTypoDescender:b.descender,sTypoLineGap:0,usWinAscent:b.yMax,usWinDescent:Math.abs(b.yMin),ulCodePageRange1:1,sxHeight:mt(e,"xyvw",{yMax:Math.round(b.ascender/2)}).yMax,sCapHeight:mt(e,"HIKLEFJMNTZBDPRAGOQSUVWXY",b).yMax,usDefaultChar:e.hasChar(" ")?32:0,usBreakChar:e.hasChar(" ")?32:0},e.tables.os2)),U=qe.make(e.glyphs),O=ue.make(e.glyphs),E=e.getEnglishName("fontFamily"),R=e.getEnglishName("fontSubfamily"),L=E+" "+R,C=e.getEnglishName("postScriptName");C=C||E.replace(/\s/g,"")+"-"+R;var w={};for(var D in e.names)w[D]=e.names[D];w.uniqueID||(w.uniqueID={en:e.getEnglishName("manufacturer")+":"+L}),w.postScriptName||(w.postScriptName={en:C}),w.preferredFamily||(w.preferredFamily=e.names.fontFamily),w.preferredSubfamily||(w.preferredSubfamily=e.names.fontSubfamily);var I=[],M=at.make(w,I),G=0<I.length?_e.make(I):void 0,B=it.make(),F=He.make(e.glyphs,{version:e.getEnglishName("version"),fullName:L,familyName:E,weightName:R,postScriptName:C,unitsPerEm:e.unitsPerEm,fontBBox:[0,b.yMin,b.ascender,b.advanceWidthMax]}),A=e.metas&&0<Object.keys(e.metas).length?ht.make(e.metas):void 0,P=[S,x,T,k,M,O,B,F,U];G&&P.push(G),e.tables.gsub&&P.push(ct.make(e.tables.gsub)),A&&P.push(A);for(var N=vt(P),H=dt(N.encode()),z=N.fields,W=!1,q=0;q<z.length;q+=1)if("head table"===z[q].name){z[q].value.checkSumAdjustment=2981146554-H,W=!0;break}if(!W)throw new Error("Could not find head table with checkSum to adjust.");return N},computeCheckSum:dt};function bt(e,t){for(var r=0,n=e.length-1;r<=n;){var a=r+n>>>1,o=e[a].tag;if(o===t)return a;o<t?r=1+a:n=a-1}return-r-1}function St(e,t){for(var r=0,n=e.length-1;r<=n;){var a=r+n>>>1,o=e[a];if(o===t)return a;o<t?r=1+a:n=a-1}return-r-1}function xt(e,t){for(var r,n=0,a=e.length-1;n<=a;){var o=n+a>>>1,s=(r=e[o]).start;if(s===t)return r;s<t?n=1+o:a=o-1}if(0<n)return t>(r=e[n-1]).end?0:r}function Tt(e,t){this.font=e,this.tableName=t}function kt(e){Tt.call(this,e,"gpos")}function Ut(e){Tt.call(this,e,"gsub")}function Ot(e,t){var r=e.length;if(r===t.length){for(var n=0;n<r;n++)if(e[n]!==t[n])return;return 1}}function Et(e,t,r){for(var n=e.subtables,a=0;a<n.length;a++){var o=n[a];if(o.substFormat===t)return o}if(r)return n.push(r),r}function Rt(e){for(var t=new ArrayBuffer(e.length),r=new Uint8Array(t),n=0;n<e.length;++n)r[n]=e[n];return t}function Lt(e,t){if(!e)throw t}function Ct(e,t,r,n,a){var o;return o=0<(t&n)?(o=e.parseByte(),0==(t&a)&&(o=-o),r+o):0<(t&a)?r:r+e.parseShort()}function wt(e,t,r){var n,a,o=new ie.Parser(t,r);if(e.numberOfContours=o.parseShort(),e._xMin=o.parseShort(),e._yMin=o.parseShort(),e._xMax=o.parseShort(),e._yMax=o.parseShort(),0<e.numberOfContours){for(var s=e.endPointIndices=[],i=0;i<e.numberOfContours;i+=1)s.push(o.parseUShort());e.instructionLength=o.parseUShort(),e.instructions=[];for(var u=0;u<e.instructionLength;u+=1)e.instructions.push(o.parseByte());var l=s[s.length-1]+1;n=[];for(var p=0;p<l;p+=1)if(a=o.parseByte(),n.push(a),0<(8&a))for(var c=o.parseByte(),h=0;h<c;h+=1)n.push(a),p+=1;if(w.argument(n.length===l,"Bad flags."),0<s.length){var f,d=[];if(0<l){for(var g=0;g<l;g+=1)a=n[g],(f={}).onCurve=!!(1&a),f.lastPointOfContour=0<=s.indexOf(g),d.push(f);for(var v=0,m=0;m<l;m+=1)a=n[m],(f=d[m]).x=Ct(o,a,v,2,16),v=f.x;for(var y=0,b=0;b<l;b+=1)a=n[b],(f=d[b]).y=Ct(o,a,y,4,32),y=f.y}e.points=d}else e.points=[]}else if(0===e.numberOfContours)e.points=[];else{e.isComposite=!0,e.points=[],e.components=[];for(var S=!0;S;){n=o.parseUShort();var x={glyphIndex:o.parseUShort(),xScale:1,scale01:0,scale10:0,yScale:1,dx:0,dy:0};0<(1&n)?0<(2&n)?(x.dx=o.parseShort(),x.dy=o.parseShort()):x.matchedPoints=[o.parseUShort(),o.parseUShort()]:0<(2&n)?(x.dx=o.parseChar(),x.dy=o.parseChar()):x.matchedPoints=[o.parseByte(),o.parseByte()],0<(8&n)?x.xScale=x.yScale=o.parseF2Dot14():0<(64&n)?(x.xScale=o.parseF2Dot14(),x.yScale=o.parseF2Dot14()):0<(128&n)&&(x.xScale=o.parseF2Dot14(),x.scale01=o.parseF2Dot14(),x.scale10=o.parseF2Dot14(),x.yScale=o.parseF2Dot14()),e.components.push(x),S=!!(32&n)}if(256&n){e.instructionLength=o.parseUShort(),e.instructions=[];for(var T=0;T<e.instructionLength;T+=1)e.instructions.push(o.parseByte())}}}function Dt(e,t){for(var r=[],n=0;n<e.length;n+=1){var a=e[n],o={x:t.xScale*a.x+t.scale01*a.y+t.dx,y:t.scale10*a.x+t.yScale*a.y+t.dy,onCurve:a.onCurve,lastPointOfContour:a.lastPointOfContour};r.push(o)}return r}function It(e){var t=new B;if(!e)return t;for(var r=function(e){for(var t=[],r=[],n=0;n<e.length;n+=1){var a=e[n];r.push(a),a.lastPointOfContour&&(t.push(r),r=[])}return w.argument(0===r.length,"There are still points left in the current contour."),t}(e),n=0;n<r.length;++n){var a=r[n],o=null,s=a[a.length-1],i=a[0];if(s.onCurve)t.moveTo(s.x,s.y);else if(i.onCurve)t.moveTo(i.x,i.y);else{var u={x:.5*(s.x+i.x),y:.5*(s.y+i.y)};t.moveTo(u.x,u.y)}for(var l=0;l<a.length;++l)if(o=s,s=i,i=a[(l+1)%a.length],s.onCurve)t.lineTo(s.x,s.y);else{var p=i;o.onCurve||(s.x,o.x,s.y,o.y),i.onCurve||(p={x:.5*(s.x+i.x),y:.5*(s.y+i.y)}),t.quadraticCurveTo(s.x,s.y,p.x,p.y)}t.closePath()}return t}function Mt(e,t){if(t.isComposite)for(var r=0;r<t.components.length;r+=1){var n=t.components[r],a=e.get(n.glyphIndex);if(a.getPath(),a.points){var o=void 0;if(void 0===n.matchedPoints)o=Dt(a.points,n);else{if(n.matchedPoints[0]>t.points.length-1||n.matchedPoints[1]>a.points.length-1)throw Error("Matched points out of range in "+t.name);var s=t.points[n.matchedPoints[0]],i=a.points[n.matchedPoints[1]],u={xScale:n.xScale,scale01:n.scale01,scale10:n.scale10,yScale:n.yScale,dx:0,dy:0};i=Dt([i],u)[0],u.dx=s.x-i.x,u.dy=s.y-i.y,o=Dt(a.points,u)}t.points=t.points.concat(o)}}return It(t.points)}(kt.prototype=Tt.prototype={searchTag:bt,binSearch:St,getTable:function(e){var t=this.font.tables[this.tableName];return!t&&e&&(t=this.font.tables[this.tableName]=this.createDefaultTable()),t},getScriptNames:function(){var e=this.getTable();return e?e.scripts.map(function(e){return e.tag}):[]},getDefaultScriptName:function(){var e=this.getTable();if(e){for(var t=!1,r=0;r<e.scripts.length;r++){var n=e.scripts[r].tag;if("DFLT"===n)return n;"latn"===n&&(t=!0)}return t?"latn":void 0}},getScriptTable:function(e,t){var r=this.getTable(t);if(r){e=e||"DFLT";var n=r.scripts,a=bt(r.scripts,e);if(0<=a)return n[a].script;if(t){var o={tag:e,script:{defaultLangSys:{reserved:0,reqFeatureIndex:65535,featureIndexes:[]},langSysRecords:[]}};return n.splice(-1-a,0,o),o.script}}},getLangSysTable:function(e,t,r){var n=this.getScriptTable(e,r);if(n){if(!t||"dflt"===t||"DFLT"===t)return n.defaultLangSys;var a=bt(n.langSysRecords,t);if(0<=a)return n.langSysRecords[a].langSys;if(r){var o={tag:t,langSys:{reserved:0,reqFeatureIndex:65535,featureIndexes:[]}};return n.langSysRecords.splice(-1-a,0,o),o.langSys}}},getFeatureTable:function(e,t,r,n){var a=this.getLangSysTable(e,t,n);if(a){for(var o,s=a.featureIndexes,i=this.font.tables[this.tableName].features,u=0;u<s.length;u++)if((o=i[s[u]]).tag===r)return o.feature;if(n){var l=i.length;return w.assert(0===l||r>=i[l-1].tag,"Features must be added in alphabetical order."),o={tag:r,feature:{params:0,lookupListIndexes:[]}},i.push(o),s.push(l),o.feature}}},getLookupTables:function(e,t,r,n,a){var o=this.getFeatureTable(e,t,r,a),s=[];if(o){for(var i,u=o.lookupListIndexes,l=this.font.tables[this.tableName].lookups,p=0;p<u.length;p++)(i=l[u[p]]).lookupType===n&&s.push(i);if(0===s.length&&a){i={lookupType:n,lookupFlag:0,subtables:[],markFilteringSet:void 0};var c=l.length;return l.push(i),u.push(c),[i]}}return s},getGlyphClass:function(e,t){switch(e.format){case 1:return e.startGlyph<=t&&t<e.startGlyph+e.classes.length?e.classes[t-e.startGlyph]:0;case 2:var r=xt(e.ranges,t);return r?r.classId:0}},getCoverageIndex:function(e,t){switch(e.format){case 1:var r=St(e.glyphs,t);return 0<=r?r:-1;case 2:var n=xt(e.ranges,t);return n?n.index+t-n.start:-1}},expandCoverage:function(e){if(1===e.format)return e.glyphs;for(var t=[],r=e.ranges,n=0;n<r.length;n++)for(var a=r[n],o=a.start,s=a.end,i=o;i<=s;i++)t.push(i);return t}}).init=function(){var e=this.getDefaultScriptName();this.defaultKerningTables=this.getKerningTables(e)},kt.prototype.getKerningValue=function(e,t,r){for(var n=0;n<e.length;n++)for(var a=e[n].subtables,o=0;o<a.length;o++){var s=a[o],i=this.getCoverageIndex(s.coverage,t);if(!(i<0))switch(s.posFormat){case 1:for(var u=s.pairSets[i],l=0;l<u.length;l++){var p=u[l];if(p.secondGlyph===r)return p.value1&&p.value1.xAdvance||0}break;case 2:var c=this.getGlyphClass(s.classDef1,t),h=this.getGlyphClass(s.classDef2,r),f=s.classRecords[c][h];return f.value1&&f.value1.xAdvance||0}}return 0},kt.prototype.getKerningTables=function(e,t){if(this.font.tables.gpos)return this.getLookupTables(e,t,"kern",2)},(Ut.prototype=Tt.prototype).createDefaultTable=function(){return{version:1,scripts:[{tag:"DFLT",script:{defaultLangSys:{reserved:0,reqFeatureIndex:65535,featureIndexes:[]},langSysRecords:[]}}],features:[],lookups:[]}},Ut.prototype.getSingle=function(e,t,r){for(var n=[],a=this.getLookupTables(t,r,e,1),o=0;o<a.length;o++)for(var s=a[o].subtables,i=0;i<s.length;i++){var u=s[i],l=this.expandCoverage(u.coverage),p=void 0;if(1===u.substFormat){var c=u.deltaGlyphId;for(p=0;p<l.length;p++){var h=l[p];n.push({sub:h,by:h+c})}}else{var f=u.substitute;for(p=0;p<l.length;p++)n.push({sub:l[p],by:f[p]})}}return n},Ut.prototype.getMultiple=function(e,t,r){for(var n=[],a=this.getLookupTables(t,r,e,2),o=0;o<a.length;o++)for(var s=a[o].subtables,i=0;i<s.length;i++){var u=s[i],l=this.expandCoverage(u.coverage),p=void 0;for(p=0;p<l.length;p++){var c=l[p],h=u.sequences[p];n.push({sub:c,by:h})}}return n},Ut.prototype.getAlternates=function(e,t,r){for(var n=[],a=this.getLookupTables(t,r,e,3),o=0;o<a.length;o++)for(var s=a[o].subtables,i=0;i<s.length;i++)for(var u=s[i],l=this.expandCoverage(u.coverage),p=u.alternateSets,c=0;c<l.length;c++)n.push({sub:l[c],by:p[c]});return n},Ut.prototype.getLigatures=function(e,t,r){for(var n=[],a=this.getLookupTables(t,r,e,4),o=0;o<a.length;o++)for(var s=a[o].subtables,i=0;i<s.length;i++)for(var u=s[i],l=this.expandCoverage(u.coverage),p=u.ligatureSets,c=0;c<l.length;c++)for(var h=l[c],f=p[c],d=0;d<f.length;d++){var g=f[d];n.push({sub:[h].concat(g.components),by:g.ligGlyph})}return n},Ut.prototype.addSingle=function(e,t,r,n){var a=Et(this.getLookupTables(r,n,e,1,!0)[0],2,{substFormat:2,coverage:{format:1,glyphs:[]},substitute:[]});w.assert(1===a.coverage.format,"Single: unable to modify coverage table format "+a.coverage.format);var o=t.sub,s=this.binSearch(a.coverage.glyphs,o);s<0&&(s=-1-s,a.coverage.glyphs.splice(s,0,o),a.substitute.splice(s,0,0)),a.substitute[s]=t.by},Ut.prototype.addMultiple=function(e,t,r,n){w.assert(t.by instanceof Array&&1<t.by.length,'Multiple: "by" must be an array of two or more ids');var a=Et(this.getLookupTables(r,n,e,2,!0)[0],1,{substFormat:1,coverage:{format:1,glyphs:[]},sequences:[]});w.assert(1===a.coverage.format,"Multiple: unable to modify coverage table format "+a.coverage.format);var o=t.sub,s=this.binSearch(a.coverage.glyphs,o);s<0&&(s=-1-s,a.coverage.glyphs.splice(s,0,o),a.sequences.splice(s,0,0)),a.sequences[s]=t.by},Ut.prototype.addAlternate=function(e,t,r,n){var a=Et(this.getLookupTables(r,n,e,3,!0)[0],1,{substFormat:1,coverage:{format:1,glyphs:[]},alternateSets:[]});w.assert(1===a.coverage.format,"Alternate: unable to modify coverage table format "+a.coverage.format);var o=t.sub,s=this.binSearch(a.coverage.glyphs,o);s<0&&(s=-1-s,a.coverage.glyphs.splice(s,0,o),a.alternateSets.splice(s,0,0)),a.alternateSets[s]=t.by},Ut.prototype.addLigature=function(e,t,r,n){var a=this.getLookupTables(r,n,e,4,!0)[0],o=a.subtables[0];o||(o={substFormat:1,coverage:{format:1,glyphs:[]},ligatureSets:[]},a.subtables[0]=o),w.assert(1===o.coverage.format,"Ligature: unable to modify coverage table format "+o.coverage.format);var s=t.sub[0],i=t.sub.slice(1),u={ligGlyph:t.by,components:i},l=this.binSearch(o.coverage.glyphs,s);if(0<=l){for(var p=o.ligatureSets[l],c=0;c<p.length;c++)if(Ot(p[c].components,i))return;p.push(u)}else l=-1-l,o.coverage.glyphs.splice(l,0,s),o.ligatureSets.splice(l,0,[u])},Ut.prototype.getFeature=function(e,t,r){if(/ss\d\d/.test(e))return this.getSingle(e,t,r);switch(e){case"aalt":case"salt":return this.getSingle(e,t,r).concat(this.getAlternates(e,t,r));case"dlig":case"liga":case"rlig":return this.getLigatures(e,t,r);case"ccmp":return this.getMultiple(e,t,r).concat(this.getLigatures(e,t,r));case"stch":return this.getMultiple(e,t,r)}},Ut.prototype.add=function(e,t,r,n){if(/ss\d\d/.test(e))return this.addSingle(e,t,r,n);switch(e){case"aalt":case"salt":return"number"==typeof t.by?this.addSingle(e,t,r,n):this.addAlternate(e,t,r,n);case"dlig":case"liga":case"rlig":return this.addLigature(e,t,r,n);case"ccmp":return t.by instanceof Array?this.addMultiple(e,t,r,n):this.addLigature(e,t,r,n)}};var Gt,Bt,Ft,At,Pt={getPath:It,parse:function(e,t,r,n,a){return a.lowMemory?(o=e,s=t,i=r,u=n,l=new Te.GlyphSet(u),u._push=function(e){var t=i[e];t!==i[e+1]?l.push(e,Te.ttfGlyphLoader(u,e,wt,o,s+t,Mt)):l.push(e,Te.glyphLoader(u,e))},l):function(e,t,r,n){for(var a=new Te.GlyphSet(n),o=0;o<r.length-1;o+=1){var s=r[o];s!==r[o+1]?a.push(o,Te.ttfGlyphLoader(n,o,wt,e,t+s,Mt)):a.push(o,Te.glyphLoader(n,o))}return a}(e,t,r,n);var o,s,i,u,l}};function Nt(e){this.font=e,this.getCommands=function(e){return Pt.getPath(e).commands},this._fpgmState=this._prepState=void 0,this._errorState=0}function Ht(e){return e}function zt(e){return Math.sign(e)*Math.round(Math.abs(e))}function Wt(e){return Math.sign(e)*Math.round(Math.abs(2*e))/2}function qt(e){return Math.sign(e)*(Math.round(Math.abs(e)+.5)-.5)}function _t(e){return Math.sign(e)*Math.ceil(Math.abs(e))}function Xt(e){return Math.sign(e)*Math.floor(Math.abs(e))}function Vt(e){var t=this.srPeriod,r=this.srPhase,n=1;return e<0&&(e=-e,n=-1),e+=this.srThreshold-r,e=Math.trunc(e/t)*t,(e+=r)<0?r*n:e*n}var Yt={x:1,y:0,axis:"x",distance:function(e,t,r,n){return(r?e.xo:e.x)-(n?t.xo:t.x)},interpolate:function(e,t,r,n){var a,o,s,i,u,l,p;if(!n||n===this)return a=e.xo-t.xo,o=e.xo-r.xo,u=t.x-t.xo,l=r.x-r.xo,0===(p=(s=Math.abs(a))+(i=Math.abs(o)))?void(e.x=e.xo+(u+l)/2):void(e.x=e.xo+(u*i+l*s)/p);a=n.distance(e,t,!0,!0),o=n.distance(e,r,!0,!0),u=n.distance(t,t,!1,!0),l=n.distance(r,r,!1,!0),0!==(p=(s=Math.abs(a))+(i=Math.abs(o)))?Yt.setRelative(e,e,(u*i+l*s)/p,n,!0):Yt.setRelative(e,e,(u+l)/2,n,!0)},normalSlope:Number.NEGATIVE_INFINITY,setRelative:function(e,t,r,n,a){if(n&&n!==this){var o=a?t.xo:t.x,s=a?t.yo:t.y,i=o+r*n.x,u=s+r*n.y;e.x=i+(e.y-u)/n.normalSlope}else e.x=(a?t.xo:t.x)+r},slope:0,touch:function(e){e.xTouched=!0},touched:function(e){return e.xTouched},untouch:function(e){e.xTouched=!1}},jt={x:0,y:1,axis:"y",distance:function(e,t,r,n){return(r?e.yo:e.y)-(n?t.yo:t.y)},interpolate:function(e,t,r,n){var a,o,s,i,u,l,p;if(!n||n===this)return a=e.yo-t.yo,o=e.yo-r.yo,u=t.y-t.yo,l=r.y-r.yo,0===(p=(s=Math.abs(a))+(i=Math.abs(o)))?void(e.y=e.yo+(u+l)/2):void(e.y=e.yo+(u*i+l*s)/p);a=n.distance(e,t,!0,!0),o=n.distance(e,r,!0,!0),u=n.distance(t,t,!1,!0),l=n.distance(r,r,!1,!0),0!==(p=(s=Math.abs(a))+(i=Math.abs(o)))?jt.setRelative(e,e,(u*i+l*s)/p,n,!0):jt.setRelative(e,e,(u+l)/2,n,!0)},normalSlope:0,setRelative:function(e,t,r,n,a){if(n&&n!==this){var o=a?t.xo:t.x,s=a?t.yo:t.y,i=o+r*n.x,u=s+r*n.y;e.y=u+n.normalSlope*(e.x-i)}else e.y=(a?t.yo:t.y)+r},slope:Number.POSITIVE_INFINITY,touch:function(e){e.yTouched=!0},touched:function(e){return e.yTouched},untouch:function(e){e.yTouched=!1}};function Zt(e,t){this.x=e,this.y=t,this.axis=void 0,this.slope=t/e,this.normalSlope=-e/t,Object.freeze(this)}function Qt(e,t){var r=Math.sqrt(e*e+t*t);return t/=r,1===(e/=r)&&0===t?Yt:0===e&&1===t?jt:new Zt(e,t)}function Kt(e,t,r,n){this.x=this.xo=Math.round(64*e)/64,this.y=this.yo=Math.round(64*t)/64,this.lastPointOfContour=r,this.onCurve=n,this.prevPointOnContour=void 0,this.nextPointOnContour=void 0,this.xTouched=!1,this.yTouched=!1,Object.preventExtensions(this)}Object.freeze(Yt),Object.freeze(jt),Zt.prototype.distance=function(e,t,r,n){return this.x*Yt.distance(e,t,r,n)+this.y*jt.distance(e,t,r,n)},Zt.prototype.interpolate=function(e,t,r,n){var a,o,s,i,u,l,p;s=n.distance(e,t,!0,!0),i=n.distance(e,r,!0,!0),a=n.distance(t,t,!1,!0),o=n.distance(r,r,!1,!0),0!==(p=(u=Math.abs(s))+(l=Math.abs(i)))?this.setRelative(e,e,(a*l+o*u)/p,n,!0):this.setRelative(e,e,(a+o)/2,n,!0)},Zt.prototype.setRelative=function(e,t,r,n,a){n=n||this;var o=a?t.xo:t.x,s=a?t.yo:t.y,i=o+r*n.x,u=s+r*n.y,l=n.normalSlope,p=this.slope,c=e.x,h=e.y;e.x=(p*c-l*i+u-h)/(p-l),e.y=p*(e.x-c)+h},Zt.prototype.touch=function(e){e.xTouched=!0,e.yTouched=!0},Kt.prototype.nextTouched=function(e){for(var t=this.nextPointOnContour;!e.touched(t)&&t!==this;)t=t.nextPointOnContour;return t},Kt.prototype.prevTouched=function(e){for(var t=this.prevPointOnContour;!e.touched(t)&&t!==this;)t=t.prevPointOnContour;return t};var Jt=Object.freeze(new Kt(0,0)),$t={cvCutIn:17/16,deltaBase:9,deltaShift:.125,loop:1,minDis:1,autoFlip:!0};function er(e,t){switch(this.env=e,this.stack=[],this.prog=t,e){case"glyf":this.zp0=this.zp1=this.zp2=1,this.rp0=this.rp1=this.rp2=0;case"prep":this.fv=this.pv=this.dpv=Yt,this.round=zt}}function tr(e){for(var t=e.tZone=new Array(e.gZone.length),r=0;r<t.length;r++)t[r]=new Kt(0,0)}function rr(e,t){var r,n=e.prog,a=e.ip,o=1;do{if(88===(r=n[++a]))o++;else if(89===r)o--;else if(64===r)a+=n[a+1]+1;else if(65===r)a+=2*n[a+1]+1;else if(176<=r&&r<=183)a+=r-176+1;else if(184<=r&&r<=191)a+=2*(r-184+1);else if(t&&1===o&&27===r)break}while(0<o);e.ip=a}function nr(e,t){O.DEBUG&&console.log(t.step,"SVTCA["+e.axis+"]"),t.fv=t.pv=t.dpv=e}function ar(e,t){O.DEBUG&&console.log(t.step,"SPVTCA["+e.axis+"]"),t.pv=t.dpv=e}function or(e,t){O.DEBUG&&console.log(t.step,"SFVTCA["+e.axis+"]"),t.fv=e}function sr(e,t){var r,n,a=t.stack,o=a.pop(),s=a.pop(),i=t.z2[o],u=t.z1[s];O.DEBUG&&console.log("SPVTL["+e+"]",o,s),n=e?(r=i.y-u.y,u.x-i.x):(r=u.x-i.x,u.y-i.y),t.pv=t.dpv=Qt(r,n)}function ir(e,t){var r,n,a=t.stack,o=a.pop(),s=a.pop(),i=t.z2[o],u=t.z1[s];O.DEBUG&&console.log("SFVTL["+e+"]",o,s),n=e?(r=i.y-u.y,u.x-i.x):(r=u.x-i.x,u.y-i.y),t.fv=Qt(r,n)}function ur(e){O.DEBUG&&console.log(e.step,"POP[]"),e.stack.pop()}function lr(e,t){var r=t.stack.pop(),n=t.z0[r],a=t.fv,o=t.pv;O.DEBUG&&console.log(t.step,"MDAP["+e+"]",r);var s=o.distance(n,Jt);e&&(s=t.round(s)),a.setRelative(n,Jt,s,o),a.touch(n),t.rp0=t.rp1=r}function pr(e,t){var r,n,a,o=t.z2,s=o.length-2;O.DEBUG&&console.log(t.step,"IUP["+e.axis+"]");for(var i=0;i<s;i++)r=o[i],e.touched(r)||(n=r.prevTouched(e))!==r&&(n===(a=r.nextTouched(e))&&e.setRelative(r,r,e.distance(n,n,!1,!0),e,!0),e.interpolate(r,n,a,e))}function cr(e,t){for(var r=t.stack,n=e?t.rp1:t.rp2,a=(e?t.z0:t.z1)[n],o=t.fv,s=t.pv,i=t.loop,u=t.z2;i--;){var l=r.pop(),p=u[l],c=s.distance(a,a,!1,!0);o.setRelative(p,p,c,s),o.touch(p),O.DEBUG&&console.log(t.step,(1<t.loop?"loop "+(t.loop-i)+": ":"")+"SHP["+(e?"rp1":"rp2")+"]",l)}t.loop=1}function hr(e,t){var r=t.stack,n=e?t.rp1:t.rp2,a=(e?t.z0:t.z1)[n],o=t.fv,s=t.pv,i=r.pop(),u=t.z2[t.contours[i]],l=u;O.DEBUG&&console.log(t.step,"SHC["+e+"]",i);for(var p=s.distance(a,a,!1,!0);l!==a&&o.setRelative(l,l,p,s),(l=l.nextPointOnContour)!==u;);}function fr(e,t){var r,n,a=t.stack,o=e?t.rp1:t.rp2,s=(e?t.z0:t.z1)[o],i=t.fv,u=t.pv,l=a.pop();switch(O.DEBUG&&console.log(t.step,"SHZ["+e+"]",l),l){case 0:r=t.tZone;break;case 1:r=t.gZone;break;default:throw new Error("Invalid zone")}for(var p=u.distance(s,s,!1,!0),c=r.length-2,h=0;h<c;h++)n=r[h],i.setRelative(n,n,p,u)}function dr(e,t){var r=t.stack,n=r.pop()/64,a=r.pop(),o=t.z1[a],s=t.z0[t.rp0],i=t.fv,u=t.pv;i.setRelative(o,s,n,u),i.touch(o),O.DEBUG&&console.log(t.step,"MSIRP["+e+"]",n,a),t.rp1=t.rp0,t.rp2=a,e&&(t.rp0=a)}function gr(e,t){var r=t.stack,n=r.pop(),a=r.pop(),o=t.z0[a],s=t.fv,i=t.pv,u=t.cvt[n];O.DEBUG&&console.log(t.step,"MIAP["+e+"]",n,"(",u,")",a);var l=i.distance(o,Jt);e&&(Math.abs(l-u)<t.cvCutIn&&(l=u),l=t.round(l)),s.setRelative(o,Jt,l,i),0===t.zp0&&(o.xo=o.x,o.yo=o.y),s.touch(o),t.rp0=t.rp1=a}function vr(e,t){var r=t.stack,n=r.pop(),a=t.z2[n];O.DEBUG&&console.log(t.step,"GC["+e+"]",n),r.push(64*t.dpv.distance(a,Jt,e,!1))}function mr(e,t){var r=t.stack,n=r.pop(),a=r.pop(),o=t.z1[n],s=t.z0[a],i=t.dpv.distance(s,o,e,e);O.DEBUG&&console.log(t.step,"MD["+e+"]",n,a,"->",i),t.stack.push(Math.round(64*i))}function yr(e,t){var r=t.stack,n=r.pop(),a=t.fv,o=t.pv,s=t.ppem,i=t.deltaBase+16*(e-1),u=t.deltaShift,l=t.z0;O.DEBUG&&console.log(t.step,"DELTAP["+e+"]",n,r);for(var p=0;p<n;p++){var c=r.pop(),h=r.pop();if(i+((240&h)>>4)===s){var f=(15&h)-8;0<=f&&f++,O.DEBUG&&console.log(t.step,"DELTAPFIX",c,"by",f*u);var d=l[c];a.setRelative(d,d,f*u,o)}}}function br(e,t){var r=t.stack,n=r.pop();O.DEBUG&&console.log(t.step,"ROUND[]"),r.push(64*t.round(n/64))}function Sr(e,t){var r=t.stack,n=r.pop(),a=t.ppem,o=t.deltaBase+16*(e-1),s=t.deltaShift;O.DEBUG&&console.log(t.step,"DELTAC["+e+"]",n,r);for(var i=0;i<n;i++){var u=r.pop(),l=r.pop();if(o+((240&l)>>4)===a){var p=(15&l)-8;0<=p&&p++;var c=p*s;O.DEBUG&&console.log(t.step,"DELTACFIX",u,"by",c),t.cvt[u]+=c}}}function xr(e,t){var r,n,a=t.stack,o=a.pop(),s=a.pop(),i=t.z2[o],u=t.z1[s];O.DEBUG&&console.log(t.step,"SDPVTL["+e+"]",o,s),n=e?(r=i.y-u.y,u.x-i.x):(r=u.x-i.x,u.y-i.y),t.dpv=Qt(r,n)}function Tr(e,t){var r=t.stack,n=t.prog,a=t.ip;O.DEBUG&&console.log(t.step,"PUSHB["+e+"]");for(var o=0;o<e;o++)r.push(n[++a]);t.ip=a}function kr(e,t){var r=t.ip,n=t.prog,a=t.stack;O.DEBUG&&console.log(t.ip,"PUSHW["+e+"]");for(var o=0;o<e;o++){var s=n[++r]<<8|n[++r];32768&s&&(s=-(1+(65535^s))),a.push(s)}t.ip=r}function Ur(e,t,r,n,a,o){var s,i,u,l,p=o.stack,c=e&&p.pop(),h=p.pop(),f=o.rp0,d=o.z0[f],g=o.z1[h],v=o.minDis,m=o.fv,y=o.dpv;u=0<=(i=s=y.distance(g,d,!0,!0))?1:-1,i=Math.abs(i),e&&(l=o.cvt[c],n&&Math.abs(i-l)<o.cvCutIn&&(i=l)),r&&i<v&&(i=v),n&&(i=o.round(i)),m.setRelative(g,d,u*i,y),m.touch(g),O.DEBUG&&console.log(o.step,(e?"MIRP[":"MDRP[")+(t?"M":"m")+(r?">":"_")+(n?"R":"_")+(0===a?"Gr":1===a?"Bl":2===a?"Wh":"")+"]",e?c+"("+o.cvt[c]+","+l+")":"",h,"(d =",s,"->",u*i,")"),o.rp1=o.rp0,o.rp2=h,t&&(o.rp0=h)}function Or(e){this.char=e,this.state={},this.activeState=null}function Er(e,t,r){this.contextName=r,this.startIndex=e,this.endOffset=t}function Rr(e,t,r){this.contextName=e,this.openRange=null,this.ranges=[],this.checkStart=t,this.checkEnd=r}function Lr(e,t){this.context=e,this.index=t,this.length=e.length,this.current=e[t],this.backtrack=e.slice(0,t),this.lookahead=e.slice(t+1)}function Cr(e){this.eventId=e,this.subscribers=[]}function wr(e){this.tokens=[],this.registeredContexts={},this.contextCheckers=[],this.events={},this.registeredModifiers=[],function(r){var n=this,e=["start","end","next","newToken","contextStart","contextEnd","insertToken","removeToken","removeRange","replaceToken","replaceRange","composeRUD","updateContextsRanges"];e.forEach(function(e){Object.defineProperty(n.events,e,{value:new Cr(e)})}),r&&e.forEach(function(e){var t=r[e];"function"==typeof t&&n.events[e].subscribe(t)}),["insertToken","removeToken","removeRange","replaceToken","replaceRange","composeRUD"].forEach(function(e){n.events[e].subscribe(n.updateContextsRanges)})}.call(this,e)}function Dr(e){return/[\u0600-\u065F\u066A-\u06D2\u06FA-\u06FF]/.test(e)}function Ir(e){return/[\u0630\u0690\u0621\u0631\u0661\u0671\u0622\u0632\u0672\u0692\u06C2\u0623\u0673\u0693\u06C3\u0624\u0694\u06C4\u0625\u0675\u0695\u06C5\u06E5\u0676\u0696\u06C6\u0627\u0677\u0697\u06C7\u0648\u0688\u0698\u06C8\u0689\u0699\u06C9\u068A\u06CA\u066B\u068B\u06CB\u068C\u068D\u06CD\u06FD\u068E\u06EE\u06FE\u062F\u068F\u06CF\u06EF]/.test(e)}function Mr(e){return/[\u0600-\u0605\u060C-\u060E\u0610-\u061B\u061E\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/.test(e)}function Gr(e){return/[A-z]/.test(e)}function Br(e){this.font=e,this.features={}}function Fr(e){this.id=e.id,this.tag=e.tag,this.substitution=e.substitution}function Ar(e,t){if(!e)return-1;switch(t.format){case 1:return t.glyphs.indexOf(e);case 2:for(var r=t.ranges,n=0;n<r.length;n++){var a=r[n];if(e>=a.start&&e<=a.end){var o=e-a.start;return a.index+o}}break;default:return-1}return-1}function Pr(e,t){for(var r=[],n=0;n<e.length;n++){var a=e[n],o=t.current,s=Ar(o=Array.isArray(o)?o[0]:o,a);-1!==s&&r.push(s)}return r.length!==e.length?-1:r}Nt.prototype.exec=function(e,t){if("number"!=typeof t)throw new Error("Point size is not a number!");if(!(2<this._errorState)){var r=this.font,n=this._prepState;if(!n||n.ppem!==t){var a=this._fpgmState;if(!a){er.prototype=$t,(a=this._fpgmState=new er("fpgm",r.tables.fpgm)).funcs=[],a.font=r,O.DEBUG&&(console.log("---EXEC FPGM---"),a.step=-1);try{Bt(a)}catch(e){return console.log("Hinting error in FPGM:"+e),void(this._errorState=3)}}er.prototype=a,(n=this._prepState=new er("prep",r.tables.prep)).ppem=t;var o=r.tables.cvt;if(o)for(var s=n.cvt=new Array(o.length),i=t/r.unitsPerEm,u=0;u<o.length;u++)s[u]=o[u]*i;else n.cvt=[];O.DEBUG&&(console.log("---EXEC PREP---"),n.step=-1);try{Bt(n)}catch(e){this._errorState<2&&console.log("Hinting error in PREP:"+e),this._errorState=2}}if(!(1<this._errorState))try{return Ft(e,n)}catch(e){return this._errorState<1&&(console.log("Hinting error:"+e),console.log("Note: further hinting errors are silenced")),void(this._errorState=1)}}},Ft=function(e,t){var r,n,a,o=t.ppem/t.font.unitsPerEm,s=o,i=e.components;if(er.prototype=t,i){var u=t.font;n=[],r=[];for(var l=0;l<i.length;l++){var p=i[l],c=u.glyphs.get(p.glyphIndex);a=new er("glyf",c.instructions),O.DEBUG&&(console.log("---EXEC COMP "+l+"---"),a.step=-1),At(c,a,o,s);for(var h=Math.round(p.dx*o),f=Math.round(p.dy*s),d=a.gZone,g=a.contours,v=0;v<d.length;v++){var m=d[v];m.xTouched=m.yTouched=!1,m.xo=m.x=m.x+h,m.yo=m.y=m.y+f}var y=n.length;n.push.apply(n,d);for(var b=0;b<g.length;b++)r.push(g[b]+y)}e.instructions&&!a.inhibitGridFit&&((a=new er("glyf",e.instructions)).gZone=a.z0=a.z1=a.z2=n,a.contours=r,n.push(new Kt(0,0),new Kt(Math.round(e.advanceWidth*o),0)),O.DEBUG&&(console.log("---EXEC COMPOSITE---"),a.step=-1),Bt(a),n.length-=2)}else a=new er("glyf",e.instructions),O.DEBUG&&(console.log("---EXEC GLYPH---"),a.step=-1),At(e,a,o,s),n=a.gZone;return n},At=function(e,t,r,n){for(var a,o,s,i=e.points||[],u=i.length,l=t.gZone=t.z0=t.z1=t.z2=[],p=t.contours=[],c=0;c<u;c++)a=i[c],l[c]=new Kt(a.x*r,a.y*n,a.lastPointOfContour,a.onCurve);for(var h=0;h<u;h++)a=l[h],o||(o=a,p.push(h)),a.lastPointOfContour?((a.nextPointOnContour=o).prevPointOnContour=a,o=void 0):(s=l[h+1],(a.nextPointOnContour=s).prevPointOnContour=a);if(!t.inhibitGridFit){if(O.DEBUG){console.log("PROCESSING GLYPH",t.stack);for(var f=0;f<u;f++)console.log(f,l[f].x,l[f].y)}if(l.push(new Kt(0,0),new Kt(Math.round(e.advanceWidth*r),0)),Bt(t),l.length-=2,O.DEBUG){console.log("FINISHED GLYPH",t.stack);for(var d=0;d<u;d++)console.log(d,l[d].x,l[d].y)}}},Bt=function(e){var t=e.prog;if(t){var r,n=t.length;for(e.ip=0;e.ip<n;e.ip++){if(O.DEBUG&&e.step++,!(r=Gt[t[e.ip]]))throw new Error("unknown instruction: 0x"+Number(t[e.ip]).toString(16));r(e)}}},Gt=[nr.bind(void 0,jt),nr.bind(void 0,Yt),ar.bind(void 0,jt),ar.bind(void 0,Yt),or.bind(void 0,jt),or.bind(void 0,Yt),sr.bind(void 0,0),sr.bind(void 0,1),ir.bind(void 0,0),ir.bind(void 0,1),function(e){var t=e.stack,r=t.pop(),n=t.pop();O.DEBUG&&console.log(e.step,"SPVFS[]",r,n),e.pv=e.dpv=Qt(n,r)},function(e){var t=e.stack,r=t.pop(),n=t.pop();O.DEBUG&&console.log(e.step,"SPVFS[]",r,n),e.fv=Qt(n,r)},function(e){var t=e.stack,r=e.pv;O.DEBUG&&console.log(e.step,"GPV[]"),t.push(16384*r.x),t.push(16384*r.y)},function(e){var t=e.stack,r=e.fv;O.DEBUG&&console.log(e.step,"GFV[]"),t.push(16384*r.x),t.push(16384*r.y)},function(e){e.fv=e.pv,O.DEBUG&&console.log(e.step,"SFVTPV[]")},function(e){var t=e.stack,r=t.pop(),n=t.pop(),a=t.pop(),o=t.pop(),s=t.pop(),i=e.z0,u=e.z1,l=i[r],p=i[n],c=u[a],h=u[o],f=e.z2[s];O.DEBUG&&console.log("ISECT[], ",r,n,a,o,s);var d=l.x,g=l.y,v=p.x,m=p.y,y=c.x,b=c.y,S=h.x,x=h.y,T=(d-v)*(b-x)-(g-m)*(y-S),k=d*m-g*v,U=y*x-b*S;f.x=(k*(y-S)-U*(d-v))/T,f.y=(k*(b-x)-U*(g-m))/T},function(e){e.rp0=e.stack.pop(),O.DEBUG&&console.log(e.step,"SRP0[]",e.rp0)},function(e){e.rp1=e.stack.pop(),O.DEBUG&&console.log(e.step,"SRP1[]",e.rp1)},function(e){e.rp2=e.stack.pop(),O.DEBUG&&console.log(e.step,"SRP2[]",e.rp2)},function(e){var t=e.stack.pop();switch(O.DEBUG&&console.log(e.step,"SZP0[]",t),e.zp0=t){case 0:e.tZone||tr(e),e.z0=e.tZone;break;case 1:e.z0=e.gZone;break;default:throw new Error("Invalid zone pointer")}},function(e){var t=e.stack.pop();switch(O.DEBUG&&console.log(e.step,"SZP1[]",t),e.zp1=t){case 0:e.tZone||tr(e),e.z1=e.tZone;break;case 1:e.z1=e.gZone;break;default:throw new Error("Invalid zone pointer")}},function(e){var t=e.stack.pop();switch(O.DEBUG&&console.log(e.step,"SZP2[]",t),e.zp2=t){case 0:e.tZone||tr(e),e.z2=e.tZone;break;case 1:e.z2=e.gZone;break;default:throw new Error("Invalid zone pointer")}},function(e){var t=e.stack.pop();switch(O.DEBUG&&console.log(e.step,"SZPS[]",t),e.zp0=e.zp1=e.zp2=t,t){case 0:e.tZone||tr(e),e.z0=e.z1=e.z2=e.tZone;break;case 1:e.z0=e.z1=e.z2=e.gZone;break;default:throw new Error("Invalid zone pointer")}},function(e){e.loop=e.stack.pop(),O.DEBUG&&console.log(e.step,"SLOOP[]",e.loop)},function(e){O.DEBUG&&console.log(e.step,"RTG[]"),e.round=zt},function(e){O.DEBUG&&console.log(e.step,"RTHG[]"),e.round=qt},function(e){var t=e.stack.pop();O.DEBUG&&console.log(e.step,"SMD[]",t),e.minDis=t/64},function(e){O.DEBUG&&console.log(e.step,"ELSE[]"),rr(e,!1)},function(e){var t=e.stack.pop();O.DEBUG&&console.log(e.step,"JMPR[]",t),e.ip+=t-1},function(e){var t=e.stack.pop();O.DEBUG&&console.log(e.step,"SCVTCI[]",t),e.cvCutIn=t/64},void 0,void 0,function(e){var t=e.stack;O.DEBUG&&console.log(e.step,"DUP[]"),t.push(t[t.length-1])},ur,function(e){O.DEBUG&&console.log(e.step,"CLEAR[]"),e.stack.length=0},function(e){var t=e.stack,r=t.pop(),n=t.pop();O.DEBUG&&console.log(e.step,"SWAP[]"),t.push(r),t.push(n)},function(e){var t=e.stack;O.DEBUG&&console.log(e.step,"DEPTH[]"),t.push(t.length)},function(e){var t=e.stack,r=t.pop();O.DEBUG&&console.log(e.step,"CINDEX[]",r),t.push(t[t.length-r])},function(e){var t=e.stack,r=t.pop();O.DEBUG&&console.log(e.step,"MINDEX[]",r),t.push(t.splice(t.length-r,1)[0])},void 0,void 0,void 0,function(e){var t=e.stack,r=t.pop(),n=t.pop();O.DEBUG&&console.log(e.step,"LOOPCALL[]",r,n);var a=e.ip,o=e.prog;e.prog=e.funcs[r];for(var s=0;s<n;s++)Bt(e),O.DEBUG&&console.log(++e.step,s+1<n?"next loopcall":"done loopcall",s);e.ip=a,e.prog=o},function(e){var t=e.stack.pop();O.DEBUG&&console.log(e.step,"CALL[]",t);var r=e.ip,n=e.prog;e.prog=e.funcs[t],Bt(e),e.ip=r,e.prog=n,O.DEBUG&&console.log(++e.step,"returning from",t)},function(e){if("fpgm"!==e.env)throw new Error("FDEF not allowed here");var t=e.stack,r=e.prog,n=e.ip,a=t.pop(),o=n;for(O.DEBUG&&console.log(e.step,"FDEF[]",a);45!==r[++n];);e.ip=n,e.funcs[a]=r.slice(o+1,n)},void 0,lr.bind(void 0,0),lr.bind(void 0,1),pr.bind(void 0,jt),pr.bind(void 0,Yt),cr.bind(void 0,0),cr.bind(void 0,1),hr.bind(void 0,0),hr.bind(void 0,1),fr.bind(void 0,0),fr.bind(void 0,1),function(e){for(var t=e.stack,r=e.loop,n=e.fv,a=t.pop()/64,o=e.z2;r--;){var s=t.pop(),i=o[s];O.DEBUG&&console.log(e.step,(1<e.loop?"loop "+(e.loop-r)+": ":"")+"SHPIX[]",s,a),n.setRelative(i,i,a),n.touch(i)}e.loop=1},function(e){for(var t=e.stack,r=e.rp1,n=e.rp2,a=e.loop,o=e.z0[r],s=e.z1[n],i=e.fv,u=e.dpv,l=e.z2;a--;){var p=t.pop(),c=l[p];O.DEBUG&&console.log(e.step,(1<e.loop?"loop "+(e.loop-a)+": ":"")+"IP[]",p,r,"<->",n),i.interpolate(c,o,s,u),i.touch(c)}e.loop=1},dr.bind(void 0,0),dr.bind(void 0,1),function(e){for(var t=e.stack,r=e.rp0,n=e.z0[r],a=e.loop,o=e.fv,s=e.pv,i=e.z1;a--;){var u=t.pop(),l=i[u];O.DEBUG&&console.log(e.step,(1<e.loop?"loop "+(e.loop-a)+": ":"")+"ALIGNRP[]",u),o.setRelative(l,n,0,s),o.touch(l)}e.loop=1},function(e){O.DEBUG&&console.log(e.step,"RTDG[]"),e.round=Wt},gr.bind(void 0,0),gr.bind(void 0,1),function(e){var t=e.prog,r=e.ip,n=e.stack,a=t[++r];O.DEBUG&&console.log(e.step,"NPUSHB[]",a);for(var o=0;o<a;o++)n.push(t[++r]);e.ip=r},function(e){var t=e.ip,r=e.prog,n=e.stack,a=r[++t];O.DEBUG&&console.log(e.step,"NPUSHW[]",a);for(var o=0;o<a;o++){var s=r[++t]<<8|r[++t];32768&s&&(s=-(1+(65535^s))),n.push(s)}e.ip=t},function(e){var t=e.stack,r=e.store;r=r||(e.store=[]);var n=t.pop(),a=t.pop();O.DEBUG&&console.log(e.step,"WS",n,a),r[a]=n},function(e){var t=e.stack,r=e.store,n=t.pop();O.DEBUG&&console.log(e.step,"RS",n);var a=r&&r[n]||0;t.push(a)},function(e){var t=e.stack,r=t.pop(),n=t.pop();O.DEBUG&&console.log(e.step,"WCVTP",r,n),e.cvt[n]=r/64},function(e){var t=e.stack,r=t.pop();O.DEBUG&&console.log(e.step,"RCVT",r),t.push(64*e.cvt[r])},vr.bind(void 0,0),vr.bind(void 0,1),void 0,mr.bind(void 0,0),mr.bind(void 0,1),function(e){O.DEBUG&&console.log(e.step,"MPPEM[]"),e.stack.push(e.ppem)},void 0,function(e){O.DEBUG&&console.log(e.step,"FLIPON[]"),e.autoFlip=!0},void 0,void 0,function(e){var t=e.stack,r=t.pop(),n=t.pop();O.DEBUG&&console.log(e.step,"LT[]",r,n),t.push(n<r?1:0)},function(e){var t=e.stack,r=t.pop(),n=t.pop();O.DEBUG&&console.log(e.step,"LTEQ[]",r,n),t.push(n<=r?1:0)},function(e){var t=e.stack,r=t.pop(),n=t.pop();O.DEBUG&&console.log(e.step,"GT[]",r,n),t.push(r<n?1:0)},function(e){var t=e.stack,r=t.pop(),n=t.pop();O.DEBUG&&console.log(e.step,"GTEQ[]",r,n),t.push(r<=n?1:0)},function(e){var t=e.stack,r=t.pop(),n=t.pop();O.DEBUG&&console.log(e.step,"EQ[]",r,n),t.push(r===n?1:0)},function(e){var t=e.stack,r=t.pop(),n=t.pop();O.DEBUG&&console.log(e.step,"NEQ[]",r,n),t.push(r!==n?1:0)},function(e){var t=e.stack,r=t.pop();O.DEBUG&&console.log(e.step,"ODD[]",r),t.push(Math.trunc(r)%2?1:0)},function(e){var t=e.stack,r=t.pop();O.DEBUG&&console.log(e.step,"EVEN[]",r),t.push(Math.trunc(r)%2?0:1)},function(e){var t=e.stack.pop();O.DEBUG&&console.log(e.step,"IF[]",t),t||(rr(e,!0),O.DEBUG&&console.log(e.step,"EIF[]"))},function(e){O.DEBUG&&console.log(e.step,"EIF[]")},function(e){var t=e.stack,r=t.pop(),n=t.pop();O.DEBUG&&console.log(e.step,"AND[]",r,n),t.push(r&&n?1:0)},function(e){var t=e.stack,r=t.pop(),n=t.pop();O.DEBUG&&console.log(e.step,"OR[]",r,n),t.push(r||n?1:0)},function(e){var t=e.stack,r=t.pop();O.DEBUG&&console.log(e.step,"NOT[]",r),t.push(r?0:1)},yr.bind(void 0,1),function(e){var t=e.stack.pop();O.DEBUG&&console.log(e.step,"SDB[]",t),e.deltaBase=t},function(e){var t=e.stack.pop();O.DEBUG&&console.log(e.step,"SDS[]",t),e.deltaShift=Math.pow(.5,t)},function(e){var t=e.stack,r=t.pop(),n=t.pop();O.DEBUG&&console.log(e.step,"ADD[]",r,n),t.push(n+r)},function(e){var t=e.stack,r=t.pop(),n=t.pop();O.DEBUG&&console.log(e.step,"SUB[]",r,n),t.push(n-r)},function(e){var t=e.stack,r=t.pop(),n=t.pop();O.DEBUG&&console.log(e.step,"DIV[]",r,n),t.push(64*n/r)},function(e){var t=e.stack,r=t.pop(),n=t.pop();O.DEBUG&&console.log(e.step,"MUL[]",r,n),t.push(n*r/64)},function(e){var t=e.stack,r=t.pop();O.DEBUG&&console.log(e.step,"ABS[]",r),t.push(Math.abs(r))},function(e){var t=e.stack,r=t.pop();O.DEBUG&&console.log(e.step,"NEG[]",r),t.push(-r)},function(e){var t=e.stack,r=t.pop();O.DEBUG&&console.log(e.step,"FLOOR[]",r),t.push(64*Math.floor(r/64))},function(e){var t=e.stack,r=t.pop();O.DEBUG&&console.log(e.step,"CEILING[]",r),t.push(64*Math.ceil(r/64))},br.bind(void 0,0),br.bind(void 0,1),br.bind(void 0,2),br.bind(void 0,3),void 0,void 0,void 0,void 0,function(e){var t=e.stack,r=t.pop(),n=t.pop();O.DEBUG&&console.log(e.step,"WCVTF[]",r,n),e.cvt[n]=r*e.ppem/e.font.unitsPerEm},yr.bind(void 0,2),yr.bind(void 0,3),Sr.bind(void 0,1),Sr.bind(void 0,2),Sr.bind(void 0,3),function(e){var t,r=e.stack.pop();switch(O.DEBUG&&console.log(e.step,"SROUND[]",r),e.round=Vt,192&r){case 0:t=.5;break;case 64:t=1;break;case 128:t=2;break;default:throw new Error("invalid SROUND value")}switch(e.srPeriod=t,48&r){case 0:e.srPhase=0;break;case 16:e.srPhase=.25*t;break;case 32:e.srPhase=.5*t;break;case 48:e.srPhase=.75*t;break;default:throw new Error("invalid SROUND value")}r&=15,e.srThreshold=0===r?0:(r/8-.5)*t},function(e){var t,r=e.stack.pop();switch(O.DEBUG&&console.log(e.step,"S45ROUND[]",r),e.round=Vt,192&r){case 0:t=Math.sqrt(2)/2;break;case 64:t=Math.sqrt(2);break;case 128:t=2*Math.sqrt(2);break;default:throw new Error("invalid S45ROUND value")}switch(e.srPeriod=t,48&r){case 0:e.srPhase=0;break;case 16:e.srPhase=.25*t;break;case 32:e.srPhase=.5*t;break;case 48:e.srPhase=.75*t;break;default:throw new Error("invalid S45ROUND value")}r&=15,e.srThreshold=0===r?0:(r/8-.5)*t},void 0,void 0,function(e){O.DEBUG&&console.log(e.step,"ROFF[]"),e.round=Ht},void 0,function(e){O.DEBUG&&console.log(e.step,"RUTG[]"),e.round=_t},function(e){O.DEBUG&&console.log(e.step,"RDTG[]"),e.round=Xt},ur,ur,void 0,void 0,void 0,void 0,void 0,function(e){var t=e.stack.pop();O.DEBUG&&console.log(e.step,"SCANCTRL[]",t)},xr.bind(void 0,0),xr.bind(void 0,1),function(e){var t=e.stack,r=t.pop(),n=0;O.DEBUG&&console.log(e.step,"GETINFO[]",r),1&r&&(n=35),32&r&&(n|=4096),t.push(n)},void 0,function(e){var t=e.stack,r=t.pop(),n=t.pop(),a=t.pop();O.DEBUG&&console.log(e.step,"ROLL[]"),t.push(n),t.push(r),t.push(a)},function(e){var t=e.stack,r=t.pop(),n=t.pop();O.DEBUG&&console.log(e.step,"MAX[]",r,n),t.push(Math.max(n,r))},function(e){var t=e.stack,r=t.pop(),n=t.pop();O.DEBUG&&console.log(e.step,"MIN[]",r,n),t.push(Math.min(n,r))},function(e){var t=e.stack.pop();O.DEBUG&&console.log(e.step,"SCANTYPE[]",t)},function(e){var t=e.stack.pop(),r=e.stack.pop();switch(O.DEBUG&&console.log(e.step,"INSTCTRL[]",t,r),t){case 1:return void(e.inhibitGridFit=!!r);case 2:return void(e.ignoreCvt=!!r);default:throw new Error("invalid INSTCTRL[] selector")}},void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,Tr.bind(void 0,1),Tr.bind(void 0,2),Tr.bind(void 0,3),Tr.bind(void 0,4),Tr.bind(void 0,5),Tr.bind(void 0,6),Tr.bind(void 0,7),Tr.bind(void 0,8),kr.bind(void 0,1),kr.bind(void 0,2),kr.bind(void 0,3),kr.bind(void 0,4),kr.bind(void 0,5),kr.bind(void 0,6),kr.bind(void 0,7),kr.bind(void 0,8),Ur.bind(void 0,0,0,0,0,0),Ur.bind(void 0,0,0,0,0,1),Ur.bind(void 0,0,0,0,0,2),Ur.bind(void 0,0,0,0,0,3),Ur.bind(void 0,0,0,0,1,0),Ur.bind(void 0,0,0,0,1,1),Ur.bind(void 0,0,0,0,1,2),Ur.bind(void 0,0,0,0,1,3),Ur.bind(void 0,0,0,1,0,0),Ur.bind(void 0,0,0,1,0,1),Ur.bind(void 0,0,0,1,0,2),Ur.bind(void 0,0,0,1,0,3),Ur.bind(void 0,0,0,1,1,0),Ur.bind(void 0,0,0,1,1,1),Ur.bind(void 0,0,0,1,1,2),Ur.bind(void 0,0,0,1,1,3),Ur.bind(void 0,0,1,0,0,0),Ur.bind(void 0,0,1,0,0,1),Ur.bind(void 0,0,1,0,0,2),Ur.bind(void 0,0,1,0,0,3),Ur.bind(void 0,0,1,0,1,0),Ur.bind(void 0,0,1,0,1,1),Ur.bind(void 0,0,1,0,1,2),Ur.bind(void 0,0,1,0,1,3),Ur.bind(void 0,0,1,1,0,0),Ur.bind(void 0,0,1,1,0,1),Ur.bind(void 0,0,1,1,0,2),Ur.bind(void 0,0,1,1,0,3),Ur.bind(void 0,0,1,1,1,0),Ur.bind(void 0,0,1,1,1,1),Ur.bind(void 0,0,1,1,1,2),Ur.bind(void 0,0,1,1,1,3),Ur.bind(void 0,1,0,0,0,0),Ur.bind(void 0,1,0,0,0,1),Ur.bind(void 0,1,0,0,0,2),Ur.bind(void 0,1,0,0,0,3),Ur.bind(void 0,1,0,0,1,0),Ur.bind(void 0,1,0,0,1,1),Ur.bind(void 0,1,0,0,1,2),Ur.bind(void 0,1,0,0,1,3),Ur.bind(void 0,1,0,1,0,0),Ur.bind(void 0,1,0,1,0,1),Ur.bind(void 0,1,0,1,0,2),Ur.bind(void 0,1,0,1,0,3),Ur.bind(void 0,1,0,1,1,0),Ur.bind(void 0,1,0,1,1,1),Ur.bind(void 0,1,0,1,1,2),Ur.bind(void 0,1,0,1,1,3),Ur.bind(void 0,1,1,0,0,0),Ur.bind(void 0,1,1,0,0,1),Ur.bind(void 0,1,1,0,0,2),Ur.bind(void 0,1,1,0,0,3),Ur.bind(void 0,1,1,0,1,0),Ur.bind(void 0,1,1,0,1,1),Ur.bind(void 0,1,1,0,1,2),Ur.bind(void 0,1,1,0,1,3),Ur.bind(void 0,1,1,1,0,0),Ur.bind(void 0,1,1,1,0,1),Ur.bind(void 0,1,1,1,0,2),Ur.bind(void 0,1,1,1,0,3),Ur.bind(void 0,1,1,1,1,0),Ur.bind(void 0,1,1,1,1,1),Ur.bind(void 0,1,1,1,1,2),Ur.bind(void 0,1,1,1,1,3)],Or.prototype.setState=function(e,t){return this.state[e]=t,this.activeState={key:e,value:this.state[e]},this.activeState},Or.prototype.getState=function(e){return this.state[e]||null},wr.prototype.inboundIndex=function(e){return 0<=e&&e<this.tokens.length},wr.prototype.composeRUD=function(e){function t(e){return"object"==typeof e&&e.hasOwnProperty("FAIL")}var r=this,n=e.map(function(e){return r[e[0]].apply(r,e.slice(1).concat(!0))});if(n.every(t))return{FAIL:"composeRUD: one or more operations hasn't completed successfully",report:n.filter(t)};this.dispatch("composeRUD",[n.filter(function(e){return!t(e)})])},wr.prototype.replaceRange=function(e,t,r,n){t=null!==t?t:this.tokens.length;var a=r.every(function(e){return e instanceof Or});if(!isNaN(e)&&this.inboundIndex(e)&&a){var o=this.tokens.splice.apply(this.tokens,[e,t].concat(r));return n||this.dispatch("replaceToken",[e,t,r]),[o,r]}return{FAIL:"replaceRange: invalid tokens or startIndex."}},wr.prototype.replaceToken=function(e,t,r){if(!isNaN(e)&&this.inboundIndex(e)&&t instanceof Or){var n=this.tokens.splice(e,1,t);return r||this.dispatch("replaceToken",[e,t]),[n[0],t]}return{FAIL:"replaceToken: invalid token or index."}},wr.prototype.removeRange=function(e,t,r){t=isNaN(t)?this.tokens.length:t;var n=this.tokens.splice(e,t);return r||this.dispatch("removeRange",[n,e,t]),n},wr.prototype.removeToken=function(e,t){if(isNaN(e)||!this.inboundIndex(e))return{FAIL:"removeToken: invalid token index."};var r=this.tokens.splice(e,1);return t||this.dispatch("removeToken",[r,e]),r},wr.prototype.insertToken=function(e,t,r){return e.every(function(e){return e instanceof Or})?(this.tokens.splice.apply(this.tokens,[t,0].concat(e)),r||this.dispatch("insertToken",[e,t]),e):{FAIL:"insertToken: invalid token(s)."}},wr.prototype.registerModifier=function(o,s,i){this.events.newToken.subscribe(function(e,t){var r=[e,t],n=[e,t];if(null===s||!0===s.apply(this,r)){var a=i.apply(this,n);e.setState(o,a)}}),this.registeredModifiers.push(o)},Cr.prototype.subscribe=function(e){return"function"==typeof e?this.subscribers.push(e)-1:{FAIL:"invalid '"+this.eventId+"' event handler"}},Cr.prototype.unsubscribe=function(e){this.subscribers.splice(e,1)},Lr.prototype.setCurrentIndex=function(e){this.index=e,this.current=this.context[e],this.backtrack=this.context.slice(0,e),this.lookahead=this.context.slice(e+1)},Lr.prototype.get=function(e){switch(!0){case 0===e:return this.current;case e<0&&Math.abs(e)<=this.backtrack.length:return this.backtrack.slice(e)[0];case 0<e&&e<=this.lookahead.length:return this.lookahead[e-1];default:return null}},wr.prototype.rangeToText=function(e){if(e instanceof Er)return this.getRangeTokens(e).map(function(e){return e.char}).join("")},wr.prototype.getText=function(){return this.tokens.map(function(e){return e.char}).join("")},wr.prototype.getContext=function(e){var t=this.registeredContexts[e];return t||null},wr.prototype.on=function(e,t){var r=this.events[e];return r?r.subscribe(t):null},wr.prototype.dispatch=function(e,t){var r=this,n=this.events[e];n instanceof Cr&&n.subscribers.forEach(function(e){e.apply(r,t||[])})},wr.prototype.registerContextChecker=function(e,t,r){if(this.getContext(e))return{FAIL:"context name '"+e+"' is already registered."};if("function"!=typeof t)return{FAIL:"missing context start check."};if("function"!=typeof r)return{FAIL:"missing context end check."};var n=new Rr(e,t,r);return this.registeredContexts[e]=n,this.contextCheckers.push(n),n},wr.prototype.getRangeTokens=function(e){var t=e.startIndex+e.endOffset;return[].concat(this.tokens.slice(e.startIndex,t))},wr.prototype.getContextRanges=function(e){var t=this.getContext(e);return t?t.ranges:{FAIL:"context checker '"+e+"' is not registered."}},wr.prototype.resetContextsRanges=function(){var e=this.registeredContexts;for(var t in e){if(e.hasOwnProperty(t))e[t].ranges=[]}},wr.prototype.updateContextsRanges=function(){this.resetContextsRanges();for(var e=this.tokens.map(function(e){return e.char}),t=0;t<e.length;t++){var r=new Lr(e,t);this.runContextCheck(r)}this.dispatch("updateContextsRanges",[this.registeredContexts])},wr.prototype.setEndOffset=function(e,t){var r=new Er(this.getContext(t).openRange.startIndex,e,t),n=this.getContext(t).ranges;return r.rangeId=t+"."+n.length,n.push(r),this.getContext(t).openRange=null,r},wr.prototype.runContextCheck=function(o){var s=this,i=o.index;this.contextCheckers.forEach(function(e){var t=e.contextName,r=s.getContext(t).openRange;if(!r&&e.checkStart(o)&&(r=new Er(i,null,t),s.getContext(t).openRange=r,s.dispatch("contextStart",[t,i])),r&&e.checkEnd(o)){var n=i-r.startIndex+1,a=s.setEndOffset(n,t);s.dispatch("contextEnd",[t,a])}})},wr.prototype.tokenize=function(e){this.tokens=[],this.resetContextsRanges();var t=Array.from(e);this.dispatch("start");for(var r=0;r<t.length;r++){var n=t[r],a=new Lr(t,r);this.dispatch("next",[a]),this.runContextCheck(a);var o=new Or(n);this.tokens.push(o),this.dispatch("newToken",[o,a])}return this.dispatch("end",[this.tokens]),this.tokens},Br.prototype.getDefaultScriptFeaturesIndexes=function(){for(var e=this.font.tables.gsub.scripts,t=0;t<e.length;t++){var r=e[t];if("DFLT"===r.tag)return r.script.defaultLangSys.featureIndexes}return[]},Br.prototype.getScriptFeaturesIndexes=function(e){if(!this.font.tables.gsub)return[];if(!e)return this.getDefaultScriptFeaturesIndexes();for(var t=this.font.tables.gsub.scripts,r=0;r<t.length;r++){var n=t[r];if(n.tag===e&&n.script.defaultLangSys)return n.script.defaultLangSys.featureIndexes;var a=n.langSysRecords;if(a)for(var o=0;o<a.length;o++){var s=a[o];if(s.tag===e)return s.langSys.featureIndexes}}return this.getDefaultScriptFeaturesIndexes()},Br.prototype.mapTagsToFeatures=function(e,t){for(var r={},n=0;n<e.length;n++){var a=e[n].tag,o=e[n].feature;r[a]=o}this.features[t].tags=r},Br.prototype.getScriptFeatures=function(e){var t=this.features[e];if(this.features.hasOwnProperty(e))return t;var r=this.getScriptFeaturesIndexes(e);if(!r)return null;var n=this.font.tables.gsub;return t=r.map(function(e){return n.features[e]}),this.features[e]=t,this.mapTagsToFeatures(t,e),t},Br.prototype.getSubstitutionType=function(e,t){return e.lookupType.toString()+t.substFormat.toString()},Br.prototype.getLookupMethod=function(e,t){var r=this;switch(this.getSubstitutionType(e,t)){case"11":return function(e){return function(e,t){return-1===Ar(e,t.coverage)?null:e+t.deltaGlyphId}.apply(r,[e,t])};case"12":return function(e){return function(e,t){var r=Ar(e,t.coverage);return-1===r?null:t.substitute[r]}.apply(r,[e,t])};case"63":return function(e){return function(e,t){var r=t.inputCoverage.length+t.lookaheadCoverage.length+t.backtrackCoverage.length;if(e.context.length<r)return[];var n=Pr(t.inputCoverage,e);if(-1===n)return[];var a=t.inputCoverage.length-1;if(e.lookahead.length<t.lookaheadCoverage.length)return[];for(var o=e.lookahead.slice(a);o.length&&Mr(o[0].char);)o.shift();var s=new Lr(o,0),i=Pr(t.lookaheadCoverage,s),u=[].concat(e.backtrack);for(u.reverse();u.length&&Mr(u[0].char);)u.shift();if(u.length<t.backtrackCoverage.length)return[];var l=new Lr(u,0),p=Pr(t.backtrackCoverage,l),c=[];if(n.length===t.inputCoverage.length&&i.length===t.lookaheadCoverage.length&&p.length===t.backtrackCoverage.length)for(var h=0;h<t.lookupRecords.length;h++)for(var f=t.lookupRecords[h].lookupListIndex,d=this.getLookupByIndex(f),g=0;g<d.subtables.length;g++){var v=d.subtables[g],m=this.getLookupMethod(d,v);if("12"===this.getSubstitutionType(d,v))for(var y=0;y<n.length;y++){var b=m(e.get(y));b&&c.push(b)}}return c}.apply(r,[e,t])};case"41":return function(e){return function(e,t){var r,n=Ar(e.current,t.coverage);if(-1===n)return null;for(var a=t.ligatureSets[n],o=0;o<a.length;o++){r=a[o];for(var s=0;s<r.components.length;s++){if(e.lookahead[s]!==r.components[s])break;if(s===r.components.length-1)return r}}return null}.apply(r,[e,t])};case"21":return function(e){return function(e,t){var r=Ar(e,t.coverage);return-1===r?null:t.sequences[r]}.apply(r,[e,t])};default:throw new Error("lookupType: "+e.lookupType+" - substFormat: "+t.substFormat+" is not yet supported")}},Br.prototype.lookupFeature=function(e){var t=e.contextParams,r=t.index,n=this.getFeature({tag:e.tag,script:e.script});if(!n)return new Error("font '"+this.font.names.fullName.en+"' doesn't support feature '"+e.tag+"' for script '"+e.script+"'.");for(var a=this.getFeatureLookups(n),o=[].concat(t.context),s=0;s<a.length;s++)for(var i=a[s],u=this.getLookupSubtables(i),l=0;l<u.length;l++){var p=u[l],c=this.getSubstitutionType(i,p),h=this.getLookupMethod(i,p),f=void 0;switch(c){case"11":(f=h(t.current))&&o.splice(r,1,new Fr({id:11,tag:e.tag,substitution:f}));break;case"12":(f=h(t.current))&&o.splice(r,1,new Fr({id:12,tag:e.tag,substitution:f}));break;case"63":f=h(t),Array.isArray(f)&&f.length&&o.splice(r,1,new Fr({id:63,tag:e.tag,substitution:f}));break;case"41":(f=h(t))&&o.splice(r,1,new Fr({id:41,tag:e.tag,substitution:f}));break;case"21":(f=h(t.current))&&o.splice(r,1,new Fr({id:21,tag:e.tag,substitution:f}))}t=new Lr(o,r),Array.isArray(f)&&!f.length||(f=null)}return o.length?o:null},Br.prototype.supports=function(t){if(!t.script)return!1;this.getScriptFeatures(t.script);var e=this.features.hasOwnProperty(t.script);if(!t.tag)return e;var r=this.features[t.script].some(function(e){return e.tag===t.tag});return e&&r},Br.prototype.getLookupSubtables=function(e){return e.subtables||null},Br.prototype.getLookupByIndex=function(e){return this.font.tables.gsub.lookups[e]||null},Br.prototype.getFeatureLookups=function(e){return e.lookupListIndexes.map(this.getLookupByIndex.bind(this))},Br.prototype.getFeature=function(e){if(!this.font)return{FAIL:"No font was found"};this.features.hasOwnProperty(e.script)||this.getScriptFeatures(e.script);var t=this.features[e.script];return t?t.tags[e.tag]?this.features[e.script].tags[e.tag]:null:{FAIL:"No feature for script "+e.script}};var Nr={startCheck:function(e){var t=e.current,r=e.get(-1);return null===r&&Dr(t)||!Dr(r)&&Dr(t)},endCheck:function(e){var t=e.get(1);return null===t||!Dr(t)}};var Hr={startCheck:function(e){var t=e.current,r=e.get(-1);return(Dr(t)||Mr(t))&&!Dr(r)},endCheck:function(e){var t=e.get(1);switch(!0){case null===t:return!0;case!Dr(t)&&!Mr(t):var r=/\s/.test(t);if(!r)return!0;if(r){if(!e.lookahead.some(function(e){return Dr(e)||Mr(e)}))return!0}break;default:return!1}}};var zr={11:function(e,t,r){t[r].setState(e.tag,e.substitution)},12:function(e,t,r){t[r].setState(e.tag,e.substitution)},63:function(r,n,a){r.substitution.forEach(function(e,t){n[a+t].setState(r.tag,e)})},41:function(e,t,r){var n=t[r];n.setState(e.tag,e.substitution.ligGlyph);for(var a=e.substitution.components.length,o=0;o<a;o++)(n=t[r+o+1]).setState("deleted",!0)}};function Wr(e,t,r){e instanceof Fr&&zr[e.id]&&zr[e.id](e,t,r)}function qr(e){var o=this,s=this.featuresTags.arab,i=this.tokenizer.getRangeTokens(e);if(1!==i.length){var u=new Lr(i.map(function(e){return e.getState("glyphIndex")}),0),l=new Lr(i.map(function(e){return e.char}),0);i.forEach(function(e,t){if(!Mr(e.char)){u.setCurrentIndex(t),l.setCurrentIndex(t);var r,n=0;switch(!function(e){for(var t=[].concat(e.backtrack),r=t.length-1;0<=r;r--){var n=t[r],a=Ir(n),o=Mr(n);if(!a&&!o)return 1;if(a)return}}(l)||(n|=1),function(e){if(!Ir(e.current))for(var t=0;t<e.lookahead.length;t++){if(!Mr(e.lookahead[t]))return 1}}(l)&&(n|=2),n){case 1:r="fina";break;case 2:r="init";break;case 3:r="medi"}if(-1!==s.indexOf(r)){var a=o.query.lookupFeature({tag:r,script:"arab",contextParams:u});if(a instanceof Error)return console.info(a.message);a.forEach(function(e,t){e instanceof Fr&&(Wr(e,i,t),u.context[t]=e.substitution)})}}})}}function _r(e,t){return new Lr(e.map(function(e){return e.activeState.value}),t||0)}var Xr={startCheck:function(e){var t=e.current,r=e.get(-1);return null===r&&Gr(t)||!Gr(r)&&Gr(t)},endCheck:function(e){var t=e.get(1);return null===t||!Gr(t)}};function Vr(e,t){return new Lr(e.map(function(e){return e.activeState.value}),t||0)}function Yr(e){this.baseDir=e||"ltr",this.tokenizer=new wr,this.featuresTags={}}function jr(e){var t=this.contextChecks[e+"Check"];return this.tokenizer.registerContextChecker(e,t.startCheck,t.endCheck)}function Zr(){if(-1===this.tokenizer.registeredModifiers.indexOf("glyphIndex"))throw new Error("glyphIndex modifier is required to apply arabic presentation features.")}function Qr(){var t=this;this.featuresTags.hasOwnProperty("arab")&&-1!==this.featuresTags.arab.indexOf("rlig")&&(Zr.call(this),this.tokenizer.getContextRanges("arabicWord").forEach(function(e){(function(e){var n=this,a=this.tokenizer.getRangeTokens(e),o=_r(a);o.context.forEach(function(e,t){o.setCurrentIndex(t);var r=n.query.lookupFeature({tag:"rlig",script:"arab",contextParams:o});r.length&&(r.forEach(function(e){return Wr(e,a,t)}),o=_r(a))})}).call(t,e)}))}function Kr(){var t=this;this.featuresTags.hasOwnProperty("latn")&&-1!==this.featuresTags.latn.indexOf("liga")&&(Zr.call(this),this.tokenizer.getContextRanges("latinWord").forEach(function(e){(function(e){var n=this,a=this.tokenizer.getRangeTokens(e),o=Vr(a);o.context.forEach(function(e,t){o.setCurrentIndex(t);var r=n.query.lookupFeature({tag:"liga",script:"latn",contextParams:o});r.length&&(r.forEach(function(e){return Wr(e,a,t)}),o=Vr(a))})}).call(t,e)}))}function Jr(e){(e=e||{}).tables=e.tables||{},e.empty||(Lt(e.familyName,"When creating a new Font object, familyName is required."),Lt(e.styleName,"When creating a new Font object, styleName is required."),Lt(e.unitsPerEm,"When creating a new Font object, unitsPerEm is required."),Lt(e.ascender,"When creating a new Font object, ascender is required."),Lt(e.descender<=0,"When creating a new Font object, negative descender value is required."),this.names={fontFamily:{en:e.familyName||" "},fontSubfamily:{en:e.styleName||" "},fullName:{en:e.fullName||e.familyName+" "+e.styleName},postScriptName:{en:e.postScriptName||(e.familyName+e.styleName).replace(/\s/g,"")},designer:{en:e.designer||" "},designerURL:{en:e.designerURL||" "},manufacturer:{en:e.manufacturer||" "},manufacturerURL:{en:e.manufacturerURL||" "},license:{en:e.license||" "},licenseURL:{en:e.licenseURL||" "},version:{en:e.version||"Version 0.1"},description:{en:e.description||" "},copyright:{en:e.copyright||" "},trademark:{en:e.trademark||" "}},this.unitsPerEm=e.unitsPerEm||1e3,this.ascender=e.ascender,this.descender=e.descender,this.createdTimestamp=e.createdTimestamp,this.tables=Object.assign(e.tables,{os2:Object.assign({usWeightClass:e.weightClass||this.usWeightClasses.MEDIUM,usWidthClass:e.widthClass||this.usWidthClasses.MEDIUM,fsSelection:e.fsSelection||this.fsSelectionValues.REGULAR},e.tables.os2)})),this.supported=!0,this.glyphs=new Te.GlyphSet(this,e.glyphs||[]),this.encoding=new fe(this),this.position=new kt(this),this.substitution=new Ut(this),this.tables=this.tables||{},this._push=null,this._hmtxTableData={},Object.defineProperty(this,"hinting",{get:function(){return this._hinting?this._hinting:"truetype"===this.outlinesFormat?this._hinting=new Nt(this):void 0}})}function $r(e,t){var r=JSON.stringify(e),n=256;for(var a in t){var o=parseInt(a);if(o&&!(o<256)){if(JSON.stringify(t[a])===r)return o;n<=o&&(n=o+1)}}return t[n]=e,n}function en(e,t,r,n){for(var a=[{name:"nameID_"+e,type:"USHORT",value:$r(t.name,n)},{name:"flags_"+e,type:"USHORT",value:0}],o=0;o<r.length;++o){var s=r[o].tag;a.push({name:"axis_"+e+" "+s,type:"FIXED",value:t.coordinates[s]<<16})}return a}function tn(e,t,r,n){var a={},o=new ie.Parser(e,t);a.name=n[o.parseUShort()]||{},o.skip("uShort",1),a.coordinates={};for(var s=0;s<r.length;++s)a.coordinates[r[s].tag]=o.parseFixed();return a}Yr.prototype.setText=function(e){this.text=e},Yr.prototype.contextChecks={latinWordCheck:Xr,arabicWordCheck:Nr,arabicSentenceCheck:Hr},Yr.prototype.registerFeatures=function(t,e){var r=this,n=e.filter(function(e){return r.query.supports({script:t,tag:e})});this.featuresTags.hasOwnProperty(t)?this.featuresTags[t]=this.featuresTags[t].concat(n):this.featuresTags[t]=n},Yr.prototype.applyFeatures=function(e,t){if(!e)throw new Error("No valid font was provided to apply features");this.query||(this.query=new Br(e));for(var r=0;r<t.length;r++){var n=t[r];this.query.supports({script:n.script})&&this.registerFeatures(n.script,n.tags)}},Yr.prototype.registerModifier=function(e,t,r){this.tokenizer.registerModifier(e,t,r)},Yr.prototype.checkContextReady=function(e){return!!this.tokenizer.getContext(e)},Yr.prototype.applyFeaturesToContexts=function(){this.checkContextReady("arabicWord")&&(function(){var t=this;this.featuresTags.hasOwnProperty("arab")&&(Zr.call(this),this.tokenizer.getContextRanges("arabicWord").forEach(function(e){qr.call(t,e)}))}.call(this),Qr.call(this)),this.checkContextReady("latinWord")&&Kr.call(this),this.checkContextReady("arabicSentence")&&function(){var r=this;this.tokenizer.getContextRanges("arabicSentence").forEach(function(e){var t=r.tokenizer.getRangeTokens(e);r.tokenizer.replaceRange(e.startIndex,e.endOffset,t.reverse())})}.call(this)},Yr.prototype.processText=function(e){this.text&&this.text===e||(this.setText(e),function(){return jr.call(this,"latinWord"),jr.call(this,"arabicWord"),jr.call(this,"arabicSentence"),this.tokenizer.tokenize(this.text)}.call(this),this.applyFeaturesToContexts())},Yr.prototype.getBidiText=function(e){return this.processText(e),this.tokenizer.getText()},Yr.prototype.getTextGlyphs=function(e){this.processText(e);for(var t=[],r=0;r<this.tokenizer.tokens.length;r++){var n=this.tokenizer.tokens[r];if(!n.state.deleted){var a=n.activeState.value;t.push(Array.isArray(a)?a[0]:a)}}return t},Jr.prototype.hasChar=function(e){return null!==this.encoding.charToGlyphIndex(e)},Jr.prototype.charToGlyphIndex=function(e){return this.encoding.charToGlyphIndex(e)},Jr.prototype.charToGlyph=function(e){var t=this.charToGlyphIndex(e),r=this.glyphs.get(t);return r=r||this.glyphs.get(0)},Jr.prototype.updateFeatures=function(t){return this.defaultRenderOptions.features.map(function(e){return"latn"===e.script?{script:"latn",tags:e.tags.filter(function(e){return t[e]})}:e})},Jr.prototype.stringToGlyphs=function(e,t){var r=this,n=new Yr;n.registerModifier("glyphIndex",null,function(e){return r.charToGlyphIndex(e.char)});var a=t?this.updateFeatures(t.features):this.defaultRenderOptions.features;n.applyFeatures(this,a);for(var o=n.getTextGlyphs(e),s=o.length,i=new Array(s),u=this.glyphs.get(0),l=0;l<s;l+=1)i[l]=this.glyphs.get(o[l])||u;return i},Jr.prototype.nameToGlyphIndex=function(e){return this.glyphNames.nameToGlyphIndex(e)},Jr.prototype.nameToGlyph=function(e){var t=this.nameToGlyphIndex(e),r=this.glyphs.get(t);return r=r||this.glyphs.get(0)},Jr.prototype.glyphIndexToName=function(e){return this.glyphNames.glyphIndexToName?this.glyphNames.glyphIndexToName(e):""},Jr.prototype.getKerningValue=function(e,t){e=e.index||e,t=t.index||t;var r=this.position.defaultKerningTables;return r?this.position.getKerningValue(r,e,t):this.kerningPairs[e+","+t]||0},Jr.prototype.defaultRenderOptions={kerning:!0,features:[{script:"arab",tags:["init","medi","fina","rlig"]},{script:"latn",tags:["liga","rlig"]}]},Jr.prototype.forEachGlyph=function(e,t,r,n,a,o){t=void 0!==t?t:0,r=void 0!==r?r:0,n=void 0!==n?n:72,a=Object.assign({},this.defaultRenderOptions,a);var s,i=1/this.unitsPerEm*n,u=this.stringToGlyphs(e,a);if(a.kerning){var l=a.script||this.position.getDefaultScriptName();s=this.position.getKerningTables(l,a.language)}for(var p=0;p<u.length;p+=1){var c=u[p];if(o.call(this,c,t,r,n,a),c.advanceWidth&&(t+=c.advanceWidth*i),a.kerning&&p<u.length-1)t+=(s?this.position.getKerningValue(s,c.index,u[p+1].index):this.getKerningValue(c,u[p+1]))*i;a.letterSpacing?t+=a.letterSpacing*n:a.tracking&&(t+=a.tracking/1e3*n)}return t},Jr.prototype.getPath=function(e,t,r,n,o){var s=new B;return this.forEachGlyph(e,t,r,n,o,function(e,t,r,n){var a=e.getPath(t,r,n,o,this);s.extend(a)}),s},Jr.prototype.getPaths=function(e,t,r,n,o){var s=[];return this.forEachGlyph(e,t,r,n,o,function(e,t,r,n){var a=e.getPath(t,r,n,o,this);s.push(a)}),s},Jr.prototype.getAdvanceWidth=function(e,t,r){return this.forEachGlyph(e,0,0,t,r,function(){})},Jr.prototype.draw=function(e,t,r,n,a,o){this.getPath(t,r,n,a,o).draw(e)},Jr.prototype.drawPoints=function(a,e,t,r,n,o){this.forEachGlyph(e,t,r,n,o,function(e,t,r,n){e.drawPoints(a,t,r,n)})},Jr.prototype.drawMetrics=function(a,e,t,r,n,o){this.forEachGlyph(e,t,r,n,o,function(e,t,r,n){e.drawMetrics(a,t,r,n)})},Jr.prototype.getEnglishName=function(e){var t=this.names[e];if(t)return t.en},Jr.prototype.validate=function(){var r=this;function e(e){var t=r.getEnglishName(e);t&&t.trim().length}e("fontFamily"),e("weightName"),e("manufacturer"),e("copyright"),e("version"),this.unitsPerEm},Jr.prototype.toTables=function(){return yt.fontToTable(this)},Jr.prototype.toBuffer=function(){return console.warn("Font.toBuffer is deprecated. Use Font.toArrayBuffer instead."),this.toArrayBuffer()},Jr.prototype.toArrayBuffer=function(){for(var e=this.toTables().encode(),t=new ArrayBuffer(e.length),r=new Uint8Array(t),n=0;n<e.length;n++)r[n]=e[n];return t},Jr.prototype.download=function(e){var t=this.getEnglishName("fontFamily"),r=this.getEnglishName("fontSubfamily");e=e||t.replace(/\s/g,"")+"-"+r+".otf";var n=this.toArrayBuffer();if("undefined"!=typeof window)if(window.URL=window.URL||window.webkitURL,window.URL){var a=new DataView(n),o=new Blob([a],{type:"font/opentype"}),s=document.createElement("a");s.href=window.URL.createObjectURL(o),s.download=e;var i=document.createEvent("MouseEvents");i.initEvent("click",!0,!1),s.dispatchEvent(i)}else console.warn("Font file could not be downloaded. Try using a different browser.");else{var u=require("fs"),l=function(e){for(var t=new Buffer(e.byteLength),r=new Uint8Array(e),n=0;n<t.length;++n)t[n]=r[n];return t}(n);u.writeFileSync(e,l)}},Jr.prototype.fsSelectionValues={ITALIC:1,UNDERSCORE:2,NEGATIVE:4,OUTLINED:8,STRIKEOUT:16,BOLD:32,REGULAR:64,USER_TYPO_METRICS:128,WWS:256,OBLIQUE:512},Jr.prototype.usWidthClasses={ULTRA_CONDENSED:1,EXTRA_CONDENSED:2,CONDENSED:3,SEMI_CONDENSED:4,MEDIUM:5,SEMI_EXPANDED:6,EXPANDED:7,EXTRA_EXPANDED:8,ULTRA_EXPANDED:9},Jr.prototype.usWeightClasses={THIN:100,EXTRA_LIGHT:200,LIGHT:300,NORMAL:400,MEDIUM:500,SEMI_BOLD:600,BOLD:700,EXTRA_BOLD:800,BLACK:900};function rn(){return{coverage:this.parsePointer(oe.coverage),attachPoints:this.parseList(oe.pointer(oe.uShortList))}}function nn(){var e=this.parseUShort();return w.argument(1===e||2===e||3===e,"Unsupported CaretValue table version."),1===e?{coordinate:this.parseShort()}:2===e?{pointindex:this.parseShort()}:3===e?{coordinate:this.parseShort()}:void 0}function an(){return this.parseList(oe.pointer(nn))}function on(){return{coverage:this.parsePointer(oe.coverage),ligGlyphs:this.parseList(oe.pointer(an))}}function sn(){return this.parseUShort(),this.parseList(oe.pointer(oe.coverage))}var un={make:function(e,t){var r,n,a,o,s=new $.Table("fvar",[{name:"version",type:"ULONG",value:65536},{name:"offsetToData",type:"USHORT",value:0},{name:"countSizePairs",type:"USHORT",value:2},{name:"axisCount",type:"USHORT",value:e.axes.length},{name:"axisSize",type:"USHORT",value:20},{name:"instanceCount",type:"USHORT",value:e.instances.length},{name:"instanceSize",type:"USHORT",value:4+4*e.axes.length}]);s.offsetToData=s.sizeOf();for(var i=0;i<e.axes.length;i++)s.fields=s.fields.concat((r=i,n=e.axes[i],a=t,o=$r(n.name,a),[{name:"tag_"+r,type:"TAG",value:n.tag},{name:"minValue_"+r,type:"FIXED",value:n.minValue<<16},{name:"defaultValue_"+r,type:"FIXED",value:n.defaultValue<<16},{name:"maxValue_"+r,type:"FIXED",value:n.maxValue<<16},{name:"flags_"+r,type:"USHORT",value:0},{name:"nameID_"+r,type:"USHORT",value:o}]));for(var u=0;u<e.instances.length;u++)s.fields=s.fields.concat(en(u,e.instances[u],e.axes,t));return s},parse:function(e,t,r){var n=new ie.Parser(e,t),a=n.parseULong();w.argument(65536===a,"Unsupported fvar table version.");var o=n.parseOffset16();n.skip("uShort",1);for(var s,i,u,l,p,c=n.parseUShort(),h=n.parseUShort(),f=n.parseUShort(),d=n.parseUShort(),g=[],v=0;v<c;v++)g.push((s=e,i=t+o+v*h,u=r,p=l=void 0,l={},p=new ie.Parser(s,i),l.tag=p.parseTag(),l.minValue=p.parseFixed(),l.defaultValue=p.parseFixed(),l.maxValue=p.parseFixed(),p.skip("uShort",1),l.name=u[p.parseUShort()]||{},l));for(var m=[],y=t+o+c*h,b=0;b<f;b++)m.push(tn(e,y+b*d,g,r));return{axes:g,instances:m}}};var ln={parse:function(e,t){var r=new oe(e,t=t||0),n=r.parseVersion(1);w.argument(1===n||1.2===n||1.3===n,"Unsupported GDEF table version.");var a={version:n,classDef:r.parsePointer(oe.classDef),attachList:r.parsePointer(rn),ligCaretList:r.parsePointer(on),markAttachClassDef:r.parsePointer(oe.classDef)};return 1.2<=n&&(a.markGlyphSets=r.parsePointer(sn)),a}},pn=new Array(10);pn[1]=function(){var e=this.offset+this.relativeOffset,t=this.parseUShort();return 1===t?{posFormat:1,coverage:this.parsePointer(oe.coverage),value:this.parseValueRecord()}:2===t?{posFormat:2,coverage:this.parsePointer(oe.coverage),values:this.parseValueRecordList()}:void w.assert(!1,"0x"+e.toString(16)+": GPOS lookup type 1 format must be 1 or 2.")},pn[2]=function(){var e=this.offset+this.relativeOffset,t=this.parseUShort();w.assert(1===t||2===t,"0x"+e.toString(16)+": GPOS lookup type 2 format must be 1 or 2.");var r=this.parsePointer(oe.coverage),n=this.parseUShort(),a=this.parseUShort();if(1===t)return{posFormat:t,coverage:r,valueFormat1:n,valueFormat2:a,pairSets:this.parseList(oe.pointer(oe.list(function(){return{secondGlyph:this.parseUShort(),value1:this.parseValueRecord(n),value2:this.parseValueRecord(a)}})))};if(2===t){var o=this.parsePointer(oe.classDef),s=this.parsePointer(oe.classDef),i=this.parseUShort(),u=this.parseUShort();return{posFormat:t,coverage:r,valueFormat1:n,valueFormat2:a,classDef1:o,classDef2:s,class1Count:i,class2Count:u,classRecords:this.parseList(i,oe.list(u,function(){return{value1:this.parseValueRecord(n),value2:this.parseValueRecord(a)}}))}}},pn[3]=function(){return{error:"GPOS Lookup 3 not supported"}},pn[4]=function(){return{error:"GPOS Lookup 4 not supported"}},pn[5]=function(){return{error:"GPOS Lookup 5 not supported"}},pn[6]=function(){return{error:"GPOS Lookup 6 not supported"}},pn[7]=function(){return{error:"GPOS Lookup 7 not supported"}},pn[8]=function(){return{error:"GPOS Lookup 8 not supported"}},pn[9]=function(){return{error:"GPOS Lookup 9 not supported"}};var cn=new Array(10);var hn={parse:function(e,t){var r=new oe(e,t=t||0),n=r.parseVersion(1);return w.argument(1===n||1.1===n,"Unsupported GPOS table version "+n),1===n?{version:n,scripts:r.parseScriptList(),features:r.parseFeatureList(),lookups:r.parseLookupList(pn)}:{version:n,scripts:r.parseScriptList(),features:r.parseFeatureList(),lookups:r.parseLookupList(pn),variations:r.parseFeatureVariationsList()}},make:function(e){return new $.Table("GPOS",[{name:"version",type:"ULONG",value:65536},{name:"scripts",type:"TABLE",value:new $.ScriptList(e.scripts)},{name:"features",type:"TABLE",value:new $.FeatureList(e.features)},{name:"lookups",type:"TABLE",value:new $.LookupList(e.lookups,cn)}])}};var fn={parse:function(e,t){var r=new ie.Parser(e,t),n=r.parseUShort();if(0===n)return function(e){var t={};e.skip("uShort");var r=e.parseUShort();w.argument(0===r,"Unsupported kern sub-table version."),e.skip("uShort",2);var n=e.parseUShort();e.skip("uShort",3);for(var a=0;a<n;a+=1){var o=e.parseUShort(),s=e.parseUShort(),i=e.parseShort();t[o+","+s]=i}return t}(r);if(1===n)return function(e){var t={};e.skip("uShort"),1<e.parseULong()&&console.warn("Only the first kern subtable is supported."),e.skip("uLong");var r=255&e.parseUShort();if(e.skip("uShort"),0==r){var n=e.parseUShort();e.skip("uShort",3);for(var a=0;a<n;a+=1){var o=e.parseUShort(),s=e.parseUShort(),i=e.parseShort();t[o+","+s]=i}}return t}(r);throw new Error("Unsupported kern table version ("+n+").")}};var dn={parse:function(e,t,r,n){for(var a=new ie.Parser(e,t),o=n?a.parseUShort:a.parseULong,s=[],i=0;i<r+1;i+=1){var u=o.call(a);n&&(u*=2),s.push(u)}return s}};function gn(e,r){require("fs").readFile(e,function(e,t){if(e)return r(e.message);r(null,Rt(t))})}function vn(e,t){var r=new XMLHttpRequest;r.open("get",e,!0),r.responseType="arraybuffer",r.onload=function(){return r.response?t(null,r.response):t("Font could not be loaded: "+r.statusText)},r.onerror=function(){t("Font could not be loaded")},r.send()}function mn(e,t){for(var r=[],n=12,a=0;a<t;a+=1){var o=ie.getTag(e,n),s=ie.getULong(e,n+4),i=ie.getULong(e,n+8),u=ie.getULong(e,n+12);r.push({tag:o,checksum:s,offset:i,length:u,compression:!1}),n+=16}return r}function yn(e,t){if("WOFF"!==t.compression)return{data:e,offset:t.offset};var r=new Uint8Array(e.buffer,t.offset+2,t.compressedLength-2),n=new Uint8Array(t.length);if(a(r,n),n.byteLength!==t.length)throw new Error("Decompression error: "+t.tag+" decompressed length doesn't match recorded length");return{data:new DataView(n.buffer,0),offset:0}}function bn(e,t){var r,n;t=null==t?{}:t;var a,o,s,i,u,l,p,c,h,f,d,g,v,m=new Jr({empty:!0}),y=new DataView(e,0),b=[],S=ie.getTag(y,0);if(S===String.fromCharCode(0,1,0,0)||"true"===S||"typ1"===S)m.outlinesFormat="truetype",b=mn(y,a=ie.getUShort(y,4));else if("OTTO"===S)m.outlinesFormat="cff",b=mn(y,a=ie.getUShort(y,4));else{if("wOFF"!==S)throw new Error("Unsupported OpenType signature "+S);var x=ie.getTag(y,4);if(x===String.fromCharCode(0,1,0,0))m.outlinesFormat="truetype";else{if("OTTO"!==x)throw new Error("Unsupported OpenType flavor "+S);m.outlinesFormat="cff"}b=function(e,t){for(var r=[],n=44,a=0;a<t;a+=1){var o=ie.getTag(e,n),s=ie.getULong(e,n+4),i=ie.getULong(e,n+8),u=ie.getULong(e,n+12),l=void 0;l=i<u&&"WOFF",r.push({tag:o,offset:s,compression:l,compressedLength:i,length:u}),n+=20}return r}(y,a=ie.getUShort(y,12))}for(var T=0;T<a;T+=1){var k=b[T],U=void 0;switch(k.tag){case"cmap":U=yn(y,k),m.tables.cmap=ue.parse(U.data,U.offset),m.encoding=new de(m.tables.cmap);break;case"cvt ":U=yn(y,k),v=new ie.Parser(U.data,U.offset),m.tables.cvt=v.parseShortList(k.length/2);break;case"fvar":s=k;break;case"fpgm":U=yn(y,k),v=new ie.Parser(U.data,U.offset),m.tables.fpgm=v.parseByteList(k.length);break;case"head":U=yn(y,k),m.tables.head=ze.parse(U.data,U.offset),m.unitsPerEm=m.tables.head.unitsPerEm,r=m.tables.head.indexToLocFormat;break;case"hhea":U=yn(y,k),m.tables.hhea=We.parse(U.data,U.offset),m.ascender=m.tables.hhea.ascender,m.descender=m.tables.hhea.descender,m.numberOfHMetrics=m.tables.hhea.numberOfHMetrics;break;case"hmtx":c=k;break;case"ltag":U=yn(y,k),n=_e.parse(U.data,U.offset);break;case"maxp":U=yn(y,k),m.tables.maxp=Xe.parse(U.data,U.offset),m.numGlyphs=m.tables.maxp.numGlyphs;break;case"name":d=k;break;case"OS/2":U=yn(y,k),m.tables.os2=st.parse(U.data,U.offset);break;case"post":U=yn(y,k),m.tables.post=it.parse(U.data,U.offset),m.glyphNames=new ve(m.tables.post);break;case"prep":U=yn(y,k),v=new ie.Parser(U.data,U.offset),m.tables.prep=v.parseByteList(k.length);break;case"glyf":i=k;break;case"loca":f=k;break;case"CFF ":o=k;break;case"kern":h=k;break;case"GDEF":u=k;break;case"GPOS":l=k;break;case"GSUB":p=k;break;case"meta":g=k}}var O=yn(y,d);if(m.tables.name=at.parse(O.data,O.offset,n),m.names=m.tables.name,i&&f){var E=0===r,R=yn(y,f),L=dn.parse(R.data,R.offset,m.numGlyphs,E),C=yn(y,i);m.glyphs=Pt.parse(C.data,C.offset,L,m,t)}else{if(!o)throw new Error("Font doesn't contain TrueType or CFF outlines.");var w=yn(y,o);He.parse(w.data,w.offset,m,t)}var D=yn(y,c);if(qe.parse(m,D.data,D.offset,m.numberOfHMetrics,m.numGlyphs,m.glyphs,t),me(m,t),h){var I=yn(y,h);m.kerningPairs=fn.parse(I.data,I.offset)}else m.kerningPairs={};if(u){var M=yn(y,u);m.tables.gdef=ln.parse(M.data,M.offset)}if(l){var G=yn(y,l);m.tables.gpos=hn.parse(G.data,G.offset),m.position.init()}if(p){var B=yn(y,p);m.tables.gsub=ct.parse(B.data,B.offset)}if(s){var F=yn(y,s);m.tables.fvar=un.parse(F.data,F.offset,m.names)}if(g){var A=yn(y,g);m.tables.meta=ht.parse(A.data,A.offset),m.metas=m.tables.meta}return m}function Sn(e,o,s){s=null==s?{}:s;var t="undefined"==typeof window&&!s.isUrl?gn:vn;return new Promise(function(n,a){t(e,function(e,t){if(e){if(o)return o(e);a(e)}var r;try{r=bn(t,s)}catch(e){if(o)return o(e,null);a(e)}if(o)return o(null,r);n(r)})})}function xn(e,t){return bn(Rt(require("fs").readFileSync(e)),t)}var Tn=Object.freeze({__proto__:null,Font:Jr,Glyph:be,Path:B,BoundingBox:R,_parse:ie,parse:bn,load:Sn,loadSync:xn});O.BoundingBox=R,O.Font=Jr,O.Glyph=be,O.Path=B,O._parse=ie,O.default=Tn,O.load=Sn,O.loadSync=xn,O.parse=bn,Object.defineProperty(O,"__esModule",{value:!0})});
//# sourceMappingURL=opentype.min.js.map
"use strict";var BD_SVGPATH=(()=>{var A=(t,i)=>()=>(i||t((i={exports:{}}).exports,i),i.exports);var V=A((wt,U)=>{"use strict";var X={a:7,c:6,h:1,l:2,m:2,r:4,q:4,s:4,t:2,v:1,z:0},$=[5760,6158,8192,8193,8194,8195,8196,8197,8198,8199,8200,8201,8202,8239,8287,12288,65279];function tt(t){return t===10||t===13||t===8232||t===8233||t===32||t===9||t===11||t===12||t===160||t>=5760&&$.indexOf(t)>=0}function et(t){switch(t|32){case 109:case 122:case 108:case 104:case 118:case 99:case 115:case 113:case 116:case 97:case 114:return!0}return!1}function rt(t){return(t|32)===97}function S(t){return t>=48&&t<=57}function at(t){return t>=48&&t<=57||t===43||t===45||t===46}function it(t){this.index=0,this.path=t,this.max=t.length,this.result=[],this.param=0,this.err="",this.segmentStart=0,this.data=[]}function Y(t){for(;t.index<t.max&&tt(t.path.charCodeAt(t.index));)t.index++}function nt(t){var i=t.path.charCodeAt(t.index);if(i===48){t.param=0,t.index++;return}if(i===49){t.param=1,t.index++;return}t.err="SvgPath: arc flag can be 0 or 1 only (at pos "+t.index+")"}function ht(t){var i=t.index,r=i,e=t.max,n=!1,h=!1,a=!1,u=!1,s;if(r>=e){t.err="SvgPath: missed param (at pos "+r+")";return}if(s=t.path.charCodeAt(r),(s===43||s===45)&&(r++,s=r<e?t.path.charCodeAt(r):0),!S(s)&&s!==46){t.err="SvgPath: param should start with 0..9 or `.` (at pos "+r+")";return}if(s!==46){if(n=s===48,r++,s=r<e?t.path.charCodeAt(r):0,n&&r<e&&s&&S(s)){t.err="SvgPath: numbers started with `0` such as `09` are illegal (at pos "+i+")";return}for(;r<e&&S(t.path.charCodeAt(r));)r++,h=!0;s=r<e?t.path.charCodeAt(r):0}if(s===46){for(u=!0,r++;S(t.path.charCodeAt(r));)r++,a=!0;s=r<e?t.path.charCodeAt(r):0}if(s===101||s===69){if(u&&!h&&!a){t.err="SvgPath: invalid float exponent (at pos "+r+")";return}if(r++,s=r<e?t.path.charCodeAt(r):0,(s===43||s===45)&&r++,r<e&&S(t.path.charCodeAt(r)))for(;r<e&&S(t.path.charCodeAt(r));)r++;else{t.err="SvgPath: invalid float exponent (at pos "+r+")";return}}t.index=r,t.param=parseFloat(t.path.slice(i,r))+0}function R(t){var i,r;i=t.path[t.segmentStart],r=i.toLowerCase();var e=t.data;if(r==="m"&&e.length>2&&(t.result.push([i,e[0],e[1]]),e=e.slice(2),r="l",i=i==="m"?"l":"L"),r==="r")t.result.push([i].concat(e));else for(;e.length>=X[r]&&(t.result.push([i].concat(e.splice(0,X[r]))),!!X[r]););}function ut(t){var i=t.max,r,e,n,h,a;if(t.segmentStart=t.index,r=t.path.charCodeAt(t.index),e=rt(r),!et(r)){t.err="SvgPath: bad command "+t.path[t.index]+" (at pos "+t.index+")";return}if(h=X[t.path[t.index].toLowerCase()],t.index++,Y(t),t.data=[],!h){R(t);return}for(n=!1;;){for(a=h;a>0;a--){if(e&&(a===3||a===4)?nt(t):ht(t),t.err.length){R(t);return}t.data.push(t.param),Y(t),n=!1,t.index<i&&t.path.charCodeAt(t.index)===44&&(t.index++,Y(t),n=!0)}if(!n&&(t.index>=t.max||!at(t.path.charCodeAt(t.index))))break}R(t)}U.exports=function(i){var r=new it(i),e=r.max;for(Y(r);r.index<e&&!r.err.length;)ut(r);return r.result.length&&("mM".indexOf(r.result[0][0])<0?(r.err="SvgPath: string should start with `M` or `m`",r.result=[]):r.result[0][0]="M"),{err:r.err,segments:r.result}}});var z=A((kt,B)=>{"use strict";function st(t,i){return[t[0]*i[0]+t[2]*i[1],t[1]*i[0]+t[3]*i[1],t[0]*i[2]+t[2]*i[3],t[1]*i[2]+t[3]*i[3],t[0]*i[4]+t[2]*i[5]+t[4],t[1]*i[4]+t[3]*i[5]+t[5]]}function x(){if(!(this instanceof x))return new x;this.queue=[],this.cache=null}x.prototype.matrix=function(t){return t[0]===1&&t[1]===0&&t[2]===0&&t[3]===1&&t[4]===0&&t[5]===0?this:(this.cache=null,this.queue.push(t),this)};x.prototype.translate=function(t,i){return(t!==0||i!==0)&&(this.cache=null,this.queue.push([1,0,0,1,t,i])),this};x.prototype.scale=function(t,i){return(t!==1||i!==1)&&(this.cache=null,this.queue.push([t,0,0,i,0,0])),this};x.prototype.rotate=function(t,i,r){var e,n,h;return t!==0&&(this.translate(i,r),e=t*Math.PI/180,n=Math.cos(e),h=Math.sin(e),this.queue.push([n,h,-h,n,0,0]),this.cache=null,this.translate(-i,-r)),this};x.prototype.skewX=function(t){return t!==0&&(this.cache=null,this.queue.push([1,0,Math.tan(t*Math.PI/180),1,0,0])),this};x.prototype.skewY=function(t){return t!==0&&(this.cache=null,this.queue.push([1,Math.tan(t*Math.PI/180),0,1,0,0])),this};x.prototype.toArray=function(){if(this.cache)return this.cache;if(!this.queue.length)return this.cache=[1,0,0,1,0,0],this.cache;if(this.cache=this.queue[0],this.queue.length===1)return this.cache;for(var t=1;t<this.queue.length;t++)this.cache=st(this.cache,this.queue[t]);return this.cache};x.prototype.calc=function(t,i,r){var e;return this.queue.length?(this.cache||(this.cache=this.toArray()),e=this.cache,[t*e[0]+i*e[2]+(r?0:e[4]),t*e[1]+i*e[3]+(r?0:e[5])]):[t,i]};B.exports=x});var T=A((Ct,H)=>{"use strict";var ot=z(),ct={matrix:!0,scale:!0,rotate:!0,translate:!0,skewX:!0,skewY:!0},ft=/\s*(matrix|translate|scale|rotate|skewX|skewY)\s*\(\s*(.+?)\s*\)[\s,]*/,lt=/[\s,]+/;H.exports=function(i){var r=new ot,e,n;return i.split(ft).forEach(function(h){if(h.length){if(typeof ct[h]<"u"){e=h;return}switch(n=h.split(lt).map(function(a){return+a||0}),e){case"matrix":n.length===6&&r.matrix(n);return;case"scale":n.length===1?r.scale(n[0],n[0]):n.length===2&&r.scale(n[0],n[1]);return;case"rotate":n.length===1?r.rotate(n[0],0,0):n.length===3&&r.rotate(n[0],n[1],n[2]);return;case"translate":n.length===1?r.translate(n[0],0):n.length===2&&r.translate(n[0],n[1]);return;case"skewX":n.length===1&&r.skewX(n[0]);return;case"skewY":n.length===1&&r.skewY(n[0]);return}}}),r}});var O=A((qt,K)=>{"use strict";var b=Math.PI*2;function J(t,i,r,e){var n=t*e-i*r<0?-1:1,h=t*r+i*e;return h>1&&(h=1),h<-1&&(h=-1),n*Math.acos(h)}function pt(t,i,r,e,n,h,a,u,s,o){var f=o*(t-r)/2+s*(i-e)/2,l=-s*(t-r)/2+o*(i-e)/2,c=a*a,g=u*u,_=f*f,v=l*l,d=c*g-c*v-g*_;d<0&&(d=0),d/=c*v+g*_,d=Math.sqrt(d)*(n===h?-1:1);var C=d*a/u*l,m=d*-u/a*f,D=o*C-s*m+(t+r)/2,y=s*C+o*m+(i+e)/2,M=(f-C)/a,w=(l-m)/u,F=(-f-C)/a,P=(-l-m)/u,I=J(1,0,M,w),q=J(M,w,F,P);return h===0&&q>0&&(q-=b),h===1&&q<0&&(q+=b),[D,y,I,q]}function vt(t,i){var r=1.3333333333333333*Math.tan(i/4),e=Math.cos(t),n=Math.sin(t),h=Math.cos(t+i),a=Math.sin(t+i);return[e,n,e-n*r,n+e*r,h+a*r,a-h*r,h,a]}K.exports=function(i,r,e,n,h,a,u,s,o){var f=Math.sin(o*b/360),l=Math.cos(o*b/360),c=l*(i-e)/2+f*(r-n)/2,g=-f*(i-e)/2+l*(r-n)/2;if(c===0&&g===0)return[];if(u===0||s===0)return[];u=Math.abs(u),s=Math.abs(s);var _=c*c/(u*u)+g*g/(s*s);_>1&&(u*=Math.sqrt(_),s*=Math.sqrt(_));var v=pt(i,r,e,n,h,a,u,s,f,l),d=[],C=v[2],m=v[3],D=Math.max(Math.ceil(Math.abs(m)/(b/4)),1);m/=D;for(var y=0;y<D;y++)d.push(vt(C,m)),C+=m;return d.map(function(M){for(var w=0;w<M.length;w+=2){var F=M[w+0],P=M[w+1];F*=u,P*=s;var I=l*F-f*P,q=f*F+l*P;M[w+0]=I+v[0],M[w+1]=q+v[1]}return M})}});var j=A((At,Z)=>{"use strict";var L=1e-10,Q=Math.PI/180;function E(t,i,r){if(!(this instanceof E))return new E(t,i,r);this.rx=t,this.ry=i,this.ax=r}E.prototype.transform=function(t){var i=Math.cos(this.ax*Q),r=Math.sin(this.ax*Q),e=[this.rx*(t[0]*i+t[2]*r),this.rx*(t[1]*i+t[3]*r),this.ry*(-t[0]*r+t[2]*i),this.ry*(-t[1]*r+t[3]*i)],n=e[0]*e[0]+e[2]*e[2],h=e[1]*e[1]+e[3]*e[3],a=((e[0]-e[3])*(e[0]-e[3])+(e[2]+e[1])*(e[2]+e[1]))*((e[0]+e[3])*(e[0]+e[3])+(e[2]-e[1])*(e[2]-e[1])),u=(n+h)/2;if(a<L*u)return this.rx=this.ry=Math.sqrt(u),this.ax=0,this;var s=e[0]*e[1]+e[2]*e[3];a=Math.sqrt(a);var o=u+a/2,f=u-a/2;return this.ax=Math.abs(s)<L&&Math.abs(o-h)<L?90:Math.atan(Math.abs(s)>Math.abs(o-h)?(o-n)/s:s/(o-h))*180/Math.PI,this.ax>=0?(this.rx=Math.sqrt(o),this.ry=Math.sqrt(f)):(this.ax+=90,this.rx=Math.sqrt(f),this.ry=Math.sqrt(o)),this};E.prototype.isDegenerate=function(){return this.rx<L*this.ry||this.ry<L*this.rx};Z.exports=E});var N=A((St,G)=>{"use strict";var xt=V(),gt=T(),k=z(),dt=O(),_t=j();function p(t){if(!(this instanceof p))return new p(t);var i=xt(t);this.segments=i.segments,this.err=i.err,this.__stack=[]}p.from=function(t){if(typeof t=="string")return new p(t);if(t instanceof p){var i=new p("");return i.err=t.err,i.segments=t.segments.map(function(r){return r.slice()}),i.__stack=t.__stack.map(function(r){return k().matrix(r.toArray())}),i}throw new Error("SvgPath.from: invalid param type "+t)};p.prototype.__matrix=function(t){var i=this,r;t.queue.length&&this.iterate(function(e,n,h,a){var u,s,o,f;switch(e[0]){case"v":u=t.calc(0,e[1],!0),s=u[0]===0?["v",u[1]]:["l",u[0],u[1]];break;case"V":u=t.calc(h,e[1],!1),s=u[0]===t.calc(h,a,!1)[0]?["V",u[1]]:["L",u[0],u[1]];break;case"h":u=t.calc(e[1],0,!0),s=u[1]===0?["h",u[0]]:["l",u[0],u[1]];break;case"H":u=t.calc(e[1],a,!1),s=u[1]===t.calc(h,a,!1)[1]?["H",u[0]]:["L",u[0],u[1]];break;case"a":case"A":var l=t.toArray(),c=_t(e[1],e[2],e[3]).transform(l);if(l[0]*l[3]-l[1]*l[2]<0&&(e[5]=e[5]?"0":"1"),u=t.calc(e[6],e[7],e[0]==="a"),e[0]==="A"&&e[6]===h&&e[7]===a||e[0]==="a"&&e[6]===0&&e[7]===0){s=[e[0]==="a"?"l":"L",u[0],u[1]];break}c.isDegenerate()?s=[e[0]==="a"?"l":"L",u[0],u[1]]:s=[e[0],c.rx,c.ry,c.ax,e[4],e[5],u[0],u[1]];break;case"m":f=n>0,u=t.calc(e[1],e[2],f),s=["m",u[0],u[1]];break;default:for(o=e[0],s=[o],f=o.toLowerCase()===o,r=1;r<e.length;r+=2)u=t.calc(e[r],e[r+1],f),s.push(u[0],u[1])}i.segments[n]=s},!0)};p.prototype.__evaluateStack=function(){var t,i;if(this.__stack.length){if(this.__stack.length===1){this.__matrix(this.__stack[0]),this.__stack=[];return}for(t=k(),i=this.__stack.length;--i>=0;)t.matrix(this.__stack[i].toArray());this.__matrix(t),this.__stack=[]}};p.prototype.toString=function(){var t="",i="",r=!1;this.__evaluateStack();for(var e=0,n=this.segments.length;e<n;e++){var h=this.segments[e],a=h[0];a!==i||a==="m"||a==="M"?(a==="m"&&i==="z"&&(t+=" "),t+=a,r=!1):r=!0;for(var u=1;u<h.length;u++){var s=h[u];u===1?r&&s>=0&&(t+=" "):s>=0&&(t+=" "),t+=s}i=a}return t};p.prototype.translate=function(t,i){return this.__stack.push(k().translate(t,i||0)),this};p.prototype.scale=function(t,i){return this.__stack.push(k().scale(t,!i&&i!==0?t:i)),this};p.prototype.rotate=function(t,i,r){return this.__stack.push(k().rotate(t,i||0,r||0)),this};p.prototype.skewX=function(t){return this.__stack.push(k().skewX(t)),this};p.prototype.skewY=function(t){return this.__stack.push(k().skewY(t)),this};p.prototype.matrix=function(t){return this.__stack.push(k().matrix(t)),this};p.prototype.transform=function(t){return t.trim()?(this.__stack.push(gt(t)),this):this};p.prototype.round=function(t){var i=0,r=0,e=0,n=0,h;return t=t||0,this.__evaluateStack(),this.segments.forEach(function(a){var u=a[0].toLowerCase()===a[0];switch(a[0]){case"H":case"h":u&&(a[1]+=e),e=a[1]-a[1].toFixed(t),a[1]=+a[1].toFixed(t);return;case"V":case"v":u&&(a[1]+=n),n=a[1]-a[1].toFixed(t),a[1]=+a[1].toFixed(t);return;case"Z":case"z":e=i,n=r;return;case"M":case"m":u&&(a[1]+=e,a[2]+=n),e=a[1]-a[1].toFixed(t),n=a[2]-a[2].toFixed(t),i=e,r=n,a[1]=+a[1].toFixed(t),a[2]=+a[2].toFixed(t);return;case"A":case"a":u&&(a[6]+=e,a[7]+=n),e=a[6]-a[6].toFixed(t),n=a[7]-a[7].toFixed(t),a[1]=+a[1].toFixed(t),a[2]=+a[2].toFixed(t),a[3]=+a[3].toFixed(t+2),a[6]=+a[6].toFixed(t),a[7]=+a[7].toFixed(t);return;default:h=a.length,u&&(a[h-2]+=e,a[h-1]+=n),e=a[h-2]-a[h-2].toFixed(t),n=a[h-1]-a[h-1].toFixed(t),a.forEach(function(s,o){o&&(a[o]=+a[o].toFixed(t))});return}}),this};p.prototype.iterate=function(t,i){var r=this.segments,e={},n=!1,h=0,a=0,u=0,s=0,o,f,l;if(i||this.__evaluateStack(),r.forEach(function(c,g){var _=t(c,g,h,a);Array.isArray(_)&&(e[g]=_,n=!0);var v=c[0]===c[0].toLowerCase();switch(c[0]){case"m":case"M":h=c[1]+(v?h:0),a=c[2]+(v?a:0),u=h,s=a;return;case"h":case"H":h=c[1]+(v?h:0);return;case"v":case"V":a=c[1]+(v?a:0);return;case"z":case"Z":h=u,a=s;return;default:h=c[c.length-2]+(v?h:0),a=c[c.length-1]+(v?a:0)}}),!n)return this;for(l=[],o=0;o<r.length;o++)if(typeof e[o]<"u")for(f=0;f<e[o].length;f++)l.push(e[o][f]);else l.push(r[o]);return this.segments=l,this};p.prototype.abs=function(){return this.iterate(function(t,i,r,e){var n=t[0],h=n.toUpperCase(),a;if(n!==h)switch(t[0]=h,n){case"v":t[1]+=e;return;case"a":t[6]+=r,t[7]+=e;return;default:for(a=1;a<t.length;a++)t[a]+=a%2?r:e}},!0),this};p.prototype.rel=function(){return this.iterate(function(t,i,r,e){var n=t[0],h=n.toLowerCase(),a;if(n!==h&&!(i===0&&n==="M"))switch(t[0]=h,n){case"V":t[1]-=e;return;case"A":t[6]-=r,t[7]-=e;return;default:for(a=1;a<t.length;a++)t[a]-=a%2?r:e}},!0),this};p.prototype.unarc=function(){return this.iterate(function(t,i,r,e){var n,h,a,u=[],s=t[0];return s!=="A"&&s!=="a"?null:(s==="a"?(h=r+t[6],a=e+t[7]):(h=t[6],a=t[7]),n=dt(r,e,h,a,t[4],t[5],t[1],t[2],t[3]),n.length===0?[[t[0]==="a"?"l":"L",t[6],t[7]]]:(n.forEach(function(o){u.push(["C",o[2],o[3],o[4],o[5],o[6],o[7]])}),u))}),this};p.prototype.unshort=function(){var t=this.segments,i,r,e,n,h;return this.iterate(function(a,u,s,o){var f=a[0],l=f.toUpperCase(),c;u&&(l==="T"?(c=f==="t",e=t[u-1],e[0]==="Q"?(i=e[1]-s,r=e[2]-o):e[0]==="q"?(i=e[1]-e[3],r=e[2]-e[4]):(i=0,r=0),n=-i,h=-r,c||(n+=s,h+=o),t[u]=[c?"q":"Q",n,h,a[1],a[2]]):l==="S"&&(c=f==="s",e=t[u-1],e[0]==="C"?(i=e[3]-s,r=e[4]-o):e[0]==="c"?(i=e[3]-e[5],r=e[4]-e[6]):(i=0,r=0),n=-i,h=-r,c||(n+=s,h+=o),t[u]=[c?"c":"C",n,h,a[1],a[2],a[3],a[4]]))}),this};G.exports=p});var mt=A((Ft,W)=>{W.exports=N()});return mt();})();

/* Bandenstudio: portable millimetre documents. No account, network or business writes. */
(function(root){
  'use strict';
  const CI={marine:'#1d2760',orange:'#e8741f',weiss:'#ffffff',tinte:'#1c1c22',papier:'#f6f6f2'};
  const FONTS={condensed:{name:'Barlow Condensed',file:'bandenstudio-condensed.ttf'},barlow:{name:'Barlow',file:'bandenstudio-barlow.ttf'},anton:{name:'Anton',file:'bandenstudio-anton.ttf'}};
  const FORMATS=[['250x80',2500,800],['300x80',3000,800],['400x80',4000,800],['500x80',5000,800],['600x80',6000,800],['200x100',2000,1000]];
  const TEMPLATES=[['klar','Klar'],['marine','Marine'],['logo','Logo im Mittelpunkt'],['kante','Mit Farbkante']];
  const num=(v,min,max,fallback)=>Number.isFinite(+v)?Math.min(max,Math.max(min,+v)):fallback;
  const text=(v,max=180)=>String(v==null?'':v).replace(/[\u0000-\u0008\u000b-\u001f]/g,'').slice(0,max);
  const colour=(v,f=CI.marine)=>/^#[0-9a-f]{6}$/i.test(String(v))?String(v).toLowerCase():f;
  const clone=v=>JSON.parse(JSON.stringify(v));
  const copyDocument=d=>({...d,profile:d.profile?{...d.profile}:null,assets:{...d.assets},elements:d.elements.map(e=>({...e}))});
  const uid=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():'bd-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const isRaster=s=>/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(s||'');
  const hexRGB=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
  // Recognise whole contact lines only. Brand names and ordinary copy are not contact data.
  function contactLine(value){
    const line=String(value==null?'':value).trim();if(!line)return false;
    const labelled=line.match(/^(telefon|tel\.?|telefax|fax|mobil|handy|phone|e[ -]?mail|mail|internet|website|homepage|web|url)\s*:?\s+(.+)$/i)||line.match(/^(telefon|tel\.?|telefax|fax|mobil|handy|phone|e[ -]?mail|mail|internet|website|homepage|web|url)\s*:\s*(.+)$/i);
    const valueOnly=(labelled?labelled[2]:line).trim();
    if(/^(?:https?:\/\/|www\.)[^\s<>]+$/i.test(valueOnly))return true;
    if(/^(?:mailto:)?[^\s@<>]+@(?:[\p{L}\p{N}-]+\.)+[\p{L}]{2,63}$/iu.test(valueOnly))return true;
    if(/^(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]*[\p{L}\p{N}])?\.)+[\p{L}]{2,63}(?::\d{1,5})?(?:[/?#][^\s<>]*)?$/iu.test(valueOnly))return true;
    const phone=valueOnly.replace(/^tel:/i,'').trim(),digits=phone.replace(/\D/g,''),phoneLabel=/^tel:/i.test(valueOnly)||!!(labelled&&/^(?:telefon|tel\.?|telefax|fax|mobil|handy|phone)$/i.test(labelled[1]));
    if(/^[+\d().\s/-]+$/.test(phone)&&digits.length>=(phoneLabel?3:7)&&digits.length<=18&&(phoneLabel||/^(?:\+|0)/.test(phone)))return true;
    const parts=line.split(/\s*[;|·•]\s*/);return parts.length>1&&parts.some(contactLine);
  }
  const contactTokens=/(?:https?:\/\/|www\.)[^\s<>]+|(?:mailto:)?[^\s@<>]+@(?:[\p{L}\p{N}-]+\.)+[\p{L}]{2,63}|\b(?:[\p{L}\p{N}-]+\.)+(?:de|com|net|org|eu|info|pro|io|app|online|shop|store|dev|co|at|ch|biz|club|digital|gmbh|example|invalid|test)(?::\d{1,5})?(?:[/?#][^\s<>]*)?\b/iu;
  const labelledPhone=/(?:^|\s)(?:telefon|tel\.?|telefax|fax|mobil|handy|phone)\s*:?\s*[+\d][\d(). /+-]{2,}/iu;
  const inlinePhone=/(^|\s)((?:\+|0)[\d(). /-]{5,}\d)(?=$|[\s,;|·•])/u;
  function domainToken(value){const token=String(value).replace(/^[\[("']+|[\])"',;!?]+$/g,'');if(/^(?:co\.kg|gmbh&co\.kg|dr\.[\p{L}.]+|prof\.[\p{L}.]+|dipl\.[\p{L}.]+|e\.v\.?|e\.k\.?)$/iu.test(token))return false;return /[.@]/.test(token)&&contactLine(token);}
  function hasInlinePhone(line){const m=String(line).match(inlinePhone);return !!m&&m[2].replace(/\D/g,'').length>=7;}
  function isContactText(value){return String(value==null?'':value).split(/\r?\n/).some(line=>contactLine(line)||contactTokens.test(line)||labelledPhone.test(line)||hasInlinePhone(line)||line.split(/\s+/).some(domainToken));}
  function withoutContactLine(line){
    if(!isContactText(line))return line;
    return line.split(/\s*[;|·•]\s*/).map(part=>{
      if(contactLine(part))return '';
      return part.split(/(\s+)/).map(token=>domainToken(token)?'':token).join('').replace(new RegExp(contactTokens.source,'giu'),'').replace(new RegExp(labelledPhone.source,'giu'),' ').replace(new RegExp(inlinePhone.source,'gu'),(all,gap,number)=>number.replace(/\D/g,'').length>=7?gap:all).replace(/(?:website|homepage|internet|e[ -]?mail|mail|web|url)\s*:\s*$/iu,'').replace(/\s{2,}/g,' ').trim();
    }).filter(Boolean).join(' · ').trim();
  }
  function cleanContacts(doc){
    const d=normalise(doc);d.elements=d.elements.flatMap(e=>{
      if(e.type!=='text')return [e];if(e.role==='web')return [];
      const value=e.text.split(/\r?\n/).map(withoutContactLine).filter(line=>line.trim()).join('\n');return value.trim()?[{...e,text:value}]:[];
    });return d;
  }
  function normalise(raw){
    if(!raw||raw.schema!=='svbsc.bande'||raw.version!==1)throw Error('Das ist kein Bandenstudio-Projekt dieser Fassung.');
    if(!Array.isArray(raw.elements)||raw.elements.length>60)throw Error('Ein Projekt kann höchstens 60 Elemente enthalten.');
    const d={schema:'svbsc.bande',version:1,id:text(raw.id,80)||uid(),title:text(raw.title,120),width:num(raw.width,100,20000,3000),height:num(raw.height,100,3000,800),bleed:num(raw.bleed,0,100,20),safe:num(raw.safe,0,200,40),background:colour(raw.background,CI.weiss),scale:raw.scale===10?10:1,minDpi:num(raw.minDpi,50,300,100),mode:raw.mode==='cmyk'?'cmyk':'rgb',rgbAccepted:raw.rgbAccepted===true,profile:null,assets:{},elements:[],updated:text(raw.updated,40)};
    if(d.safe>=Math.min(d.width,d.height)/2)throw Error('Der Sicherheitsabstand muss kleiner als die halbe kurze Seite sein.');
    const entries=Object.entries(raw.assets||{});if(entries.length>20)throw Error('Ein Projekt kann höchstens 20 Bilder enthalten.');
    let bytes=0;
    for(const [id,a] of entries){
      if(!/^[a-zA-Z0-9_-]{1,90}$/.test(id)||['__proto__','constructor','prototype'].includes(id)||!a||typeof a!=='object')throw Error('Eine Bildkennung ist ungültig.');
      if(!isRaster(a.src)||a.src.length>40*1024*1024)throw Error('Ein Bild hat ein unbekanntes oder zu großes Format.');
      bytes+=a.src.length+(typeof a.original==='string'?a.original.length:0);if(bytes>90*1024*1024)throw Error('Die Projektbilder sind zusammen zu groß.');
      const asset={name:text(a.name,120),src:a.src,width:num(a.width,1,30000,1),height:num(a.height,1,30000,1),kind:'raster',light:a.light===true};
      if(a.original){if(!isRaster(a.original))throw Error('Das Originalbild ist ungültig.');asset.original=a.original;}
      if(a.vector){
        const v=a.vector;if(!Array.isArray(v.paths)||!v.paths.length||v.paths.length>1500)throw Error('Das Vektorlogo hat zu viele oder keine Formen.');
        asset.vector={width:num(v.width,.001,100000,1),height:num(v.height,.001,100000,1),paths:v.paths.map(p=>{
          if(typeof p.d!=='string'||p.d.length>250000||!/^[MmLlHhVvCcSsQqTtAaZzEe0-9.,+\s-]+$/.test(p.d))throw Error('Ein Vektorpfad ist ungültig.');
          if((p.d.match(/[+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?/gi)||[]).some(n=>!Number.isFinite(+n)||Math.abs(+n)>10000000))throw Error('Ein Vektorpfad liegt außerhalb des zulässigen Bereichs.');
          const fill=p.fill==='none'?'none':colour(p.fill,'#000000'),stroke=p.stroke==='none'?'none':colour(p.stroke,'#000000');
          return {d:p.d,fill,stroke,strokeWidth:num(p.strokeWidth,0,1000,0),opacity:num(p.opacity,0,1,1),rule:p.rule==='evenodd'?'evenodd':'nonzero'};
        })};asset.kind='vector';
      }
      d.assets[id]=asset;
    }
    if(raw.profile){if(typeof raw.profile.data!=='string'||!/^[A-Za-z0-9+/=]+$/.test(raw.profile.data)||raw.profile.data.length>12*1024*1024)throw Error('Das Druckprofil ist ungültig.');d.profile={name:text(raw.profile.name,120),data:raw.profile.data};}
    const ids=new Set();
    for(const e of raw.elements){
      if(!e||!['text','image','rect'].includes(e.type))throw Error('Ein Gestaltungselement ist unbekannt.');
      const id=text(e.id,90);if(!/^[a-zA-Z0-9_-]{1,90}$/.test(id)||ids.has(id))throw Error('Die Elementkennungen sind ungültig.');ids.add(id);
      const el={id,type:e.type,x:num(e.x,-100,20100,0),y:num(e.y,-100,3100,0),w:num(e.w,.5,20000,100),h:num(e.h,.5,3000,100),locked:e.locked===true};
      if(e.type==='text')Object.assign(el,{text:text(e.text),role:['name','claim','web'].includes(e.role)?e.role:'text',font:Object.prototype.hasOwnProperty.call(FONTS,e.font)?e.font:'condensed',size:num(e.size,2,2000,100),fill:colour(e.fill),align:['left','center','right'].includes(e.align)?e.align:'left'});
      if(e.type==='rect')el.fill=colour(e.fill);
      if(e.type==='image'){if(!Object.prototype.hasOwnProperty.call(d.assets,e.asset))throw Error('Ein verwendetes Logo fehlt im Projekt.');el.asset=e.asset;}
      d.elements.push(el);
    }
    return d;
  }
  function create(title=''){return normalise({schema:'svbsc.bande',version:1,id:uid(),title,width:3000,height:800,bleed:20,safe:40,background:CI.weiss,scale:1,minDpi:100,mode:'rgb',elements:[],assets:{}});}
  function template(doc,key,fields={}){
    const d=copyDocument(doc),W=d.width,H=d.height,m=Math.max(d.safe,Math.min(W,H)*.08),stripe=key==='kante'?Math.min(H*.09,W*.08):0,frame={x:m,y:m,w:W-2*m-stripe,h:H-2*m};
    const clean=value=>text(value,120).split(/\r?\n/).filter(line=>!contactLine(line)).join('\n').trim(),name=clean(fields.name||fields.title||d.title),claim=clean(fields.claim),logo=fields.asset||doc.elements.find(e=>e.type==='image')?.asset||Object.keys(d.assets)[Object.keys(d.assets).length-1];
    if(logo&&!Object.prototype.hasOwnProperty.call(d.assets,logo))throw Error('Das gewählte Logo fehlt im Projekt.');
    const light=!!d.assets[logo]?.light,dark=key==='marine'||light,pattern=['bb','moerlens'].includes(fields.pattern)?fields.pattern:'normal';
    d.background=dark?CI.marine:CI.weiss;d.elements=[];
    const rect=(x,y,w,h,fill)=>d.elements.push({id:uid(),type:'rect',x,y,w,h,fill,locked:false});
    const txt=(value,x,y,w,h,size,font,fill,align='left',role='text')=>{if(value)d.elements.push({id:uid(),type:'text',x,y,w,h,text:value,role,size,font,fill,align,locked:false});};
    const img=(x,y,w,h)=>{if(logo){const e={id:uid(),type:'image',asset:logo,x,y,w,h,locked:false};if(key==='marine'&&!light){const b=fitImage(e,d.assets[logo]),pad=Math.min(H*.025,m);rect(b.x-pad,b.y-pad,b.w+2*pad,b.h+2*pad,CI.weiss);}d.elements.push(e);}};
    const ink=dark?CI.weiss:CI.marine;
    const nameText=(x,w)=>txt(name,x,frame.y+frame.h*.09,w,frame.h*.82,frame.h*.82/.7,'condensed',ink,'center','name');
    if(!logo){
      nameText(frame.x,frame.w);
    }else if(pattern==='bb'){
      const lw=Math.min(frame.w*.32,frame.h*1.45),gap=Math.min(H*.10,frame.w*.04),sw=(frame.w-lw-2*gap)/2,size=Math.min(frame.h*.85,sw/3.16),th=size*.7;
      img(frame.x+(frame.w-lw)/2,frame.y,lw,frame.h);
      txt(fields.left==='EVENT'?fields.left:'EVENT',frame.x,(H-th)/2,sw,th,size,'condensed',ink,'center');
      txt(fields.right==='KREATIV'?fields.right:'KREATIV',frame.x+frame.w-sw,(H-th)/2,sw,th,size,'condensed',ink,'center');
    }else if(pattern==='moerlens'&&claim){
      const a=d.assets[logo],ch=Math.min(H*.14,frame.h*.22),gap=Math.min(H*.05,frame.h*.08),lh=Math.min(frame.h-ch-gap,frame.w*a.height/a.width),lw=lh*a.width/a.height,ly=frame.y+(frame.h-lh-gap-ch)/2;
      img(frame.x+(frame.w-lw)/2,ly,lw,lh);
      txt(claim,frame.x,ly+lh+gap,frame.w,ch,ch/.74,'barlow',ink,'center','claim');
    }else if(pattern==='normal'&&fields.nameAn===true&&name){
      const gap=Math.min(H*.10,frame.w*.06),lw=Math.min(frame.w*.35,frame.h*1.45);
      img(frame.x,frame.y,lw,frame.h);nameText(frame.x+lw+gap,frame.w-lw-gap);
    }else{
      img(frame.x,frame.y,frame.w,frame.h);
    }
    if(stripe)rect(W-stripe,0,stripe,H,CI.orange);
    return normalise(d);
  }
  function fitImage(e,a){const s=Math.min(e.w/a.width,e.h/a.height),w=a.width*s,h=a.height*s;return {x:e.x+(e.w-w)/2,y:e.y+(e.h-h)/2,w,h};}
  function textPath(e,font){
    if(!font)throw Error('Die CI-Schrift ist noch nicht geladen.');
    const lines=e.text.split(/\r?\n/).slice(0,4),fs=e.size,paths=lines.map((line,i)=>font.getPath(line,0,i*fs*1.15,fs,{kerning:true})),bounds=paths.map(p=>p.getBoundingBox());
    const x1=Math.min(...bounds.map(b=>b.x1)),x2=Math.max(...bounds.map(b=>b.x2)),y1=Math.min(...bounds.map(b=>b.y1)),y2=Math.max(...bounds.map(b=>b.y2)),s=Math.min(1,e.w/Math.max(.001,x2-x1),e.h/Math.max(.001,y2-y1));
    let x=e.x-x1*s;if(e.align==='center')x+=(e.w-(x2-x1)*s)/2;else if(e.align==='right')x+=e.w-(x2-x1)*s;
    const y=e.y-y1*s;
    const path=font.getPath('',0,0,fs);path.commands=[];
    let px=0,py=0,mx=0,my=0;
    for(const p of paths)for(const c of p.commands){let n={...c};for(const k of ['x','x1','x2'])if(k in n)n[k]=n[k]*s+x;for(const k of ['y','y1','y2'])if(k in n)n[k]=n[k]*s+y;
      // PDF has cubic curves only. Convert TrueType quadratics exactly, never via PDF's v shorthand.
      if(n.type==='Q')n={type:'C',x1:px+2/3*(n.x1-px),y1:py+2/3*(n.y1-py),x2:n.x+2/3*(n.x1-n.x),y2:n.y+2/3*(n.y1-n.y),x:n.x,y:n.y};
      path.commands.push(n);if(n.type==='M'){mx=n.x;my=n.y;}if('x'in n){px=n.x;py=n.y;}if(n.type==='Z'){px=mx;py=my;}
    }
    return {d:path.toPathData(4),size:fs*s,bounds:{x,y:e.y,w:(x2-x1)*s,h:(y2-y1)*s}};
  }
  function preflight(doc,fonts={},trusted=false){
    const d=trusted?doc:normalise(doc),issues=[];const add=(level,message,id)=>issues.push({level,message,id:id||null});
    if(!d.elements.some(e=>e.type==='image'||e.type==='text'&&e.text.trim()&&e.text!=='FIRMENNAME'))add('stop','Trag den Firmennamen ein oder setze ein Logo auf die Bande.');
    if(d.mode==='cmyk'&&!d.profile)add('stop','Für CMYK fehlt das ICC-Profil der Druckerei.');
    if(d.mode==='rgb'&&!d.rgbAccepted)add('stop','Bestätige, dass die Druckerei RGB-Daten annimmt, oder wähle CMYK mit ihrem ICC-Profil.');
    for(const e of d.elements){
      if(e.type!=='rect'&&(e.x<d.safe-.1||e.y<d.safe-.1||e.x+e.w>d.width-d.safe+.1||e.y+e.h>d.height-d.safe+.1))add('stop','Ein Logo oder Text liegt außerhalb des Sicherheitsabstands.',e.id);
      if(e.type==='image'){
        const a=d.assets[e.asset],b=fitImage(e,a),dpi=Math.min(a.width/(b.w/25.4),a.height/(b.h/25.4));
        if(!a.vector&&dpi<d.minDpi)add('stop','Das Logo erreicht nur '+Math.floor(dpi)+' dpi. Benötigt werden '+d.minDpi+' dpi. Setze es kleiner oder lade eine größere Datei bzw. ein Vektorlogo.',e.id);
        let ground=d.background;for(const lower of d.elements.slice(0,d.elements.indexOf(e)))if(lower.type==='rect'&&lower.x<=b.x&&lower.y<=b.y&&lower.x+lower.w>=b.x+b.w&&lower.y+lower.h>=b.y+b.h)ground=lower.fill;
        if(a.light&&hexRGB(ground).every(v=>v>=220))add('hint','Ein helles Logo liegt auf hellem Grund. Prüfe die Sichtbarkeit oder wähle eine der dunklen CI-Vorlagen.',e.id);
      }
      if(e.type==='text'){
        if(e.role==='web'||isContactText(e.text))add('stop','Entferne Website, E-Mail, Telefon oder Fax von der Bande.',e.id);
        const f=fonts[e.font];if(!f)add('stop','Die Schrift '+FONTS[e.font].name+' ist nicht geladen.',e.id);
        else if([...e.text.replace(/\s/g,'')].some(c=>f.charToGlyph(c).index===0))add('stop','Ein Zeichen fehlt in der gewählten Schrift. Bitte ersetze es.',e.id);
        else if(e.text.trim()){const p=textPath(e,f);if(p.size<e.size*.75)add('hint','Ein langer Text wird deutlich verkleinert. Kürze ihn für die Fernwirkung.',e.id);}
      }
    }
    return {ok:!issues.some(x=>x.level==='stop'),issues};
  }
  function history(first,limit=40){let rows=[copyDocument(first)],at=0;const state=d=>JSON.stringify({...d,assets:Object.keys(d.assets),profile:d.profile?{name:d.profile.name}:null});return {push(d){const old=rows[at],sameAssets=Object.keys(d.assets).every(k=>d.assets[k].src===old.assets[k]?.src),sameProfile=d.profile?.data===old.profile?.data;if(state(d)===state(old)&&sameAssets&&sameProfile)return;rows=rows.slice(0,at+1);rows.push(copyDocument(d));if(rows.length>limit)rows.shift();at=rows.length-1;},undo(){if(at>0)at--;return copyDocument(rows[at]);},redo(){if(at<rows.length-1)at++;return copyDocument(rows[at]);},get canUndo(){return at>0;},get canRedo(){return at<rows.length-1;}};}
  // Border-connected background removal. Internal white brand details remain untouched.
  function cutout(input,w,h,tolerance=30,region){
    if(!Number.isSafeInteger(w)||!Number.isSafeInteger(h)||w<1||h<1||w*h>24000000||input.length!==w*h*4)throw Error('Das Bild ist zu groß oder beschädigt.');
    const r=region||{x:0,y:0,w,h},left=Math.max(0,Math.floor(r.x)),top=Math.max(0,Math.floor(r.y)),right=Math.min(w,Math.ceil(r.x+r.w)),bottom=Math.min(h,Math.ceil(r.y+r.h)),W=right-left,H=bottom-top;
    if(W<2||H<2)throw Error('Markiere einen größeren Logo-Bereich.');
    const p=new Uint8ClampedArray(W*H*4);for(let y=0;y<H;y++)p.set(input.subarray(((top+y)*w+left)*4,((top+y)*w+right)*4),y*W*4);
    const border=[];for(let x=0;x<W;x++)border.push(x,(H-1)*W+x);for(let y=1;y<H-1;y++)border.push(y*W,y*W+W-1);
    const counts=new Map();let transparent=0;for(const k of border){const j=k*4;if(p[j+3]<20){transparent++;continue;}const key=(p[j]>>4)*256+(p[j+1]>>4)*16+(p[j+2]>>4);counts.set(key,(counts.get(key)||0)+1);}
    let key=0,count=0;counts.forEach((v,k)=>{if(v>count){key=k;count=v;}});
    const already=transparent/border.length>.6,uniform=count/Math.max(1,border.length-transparent)>.55;
    let removed=0,bg=null;
    if(!already&&uniform&&tolerance>0){
      let rr=0,gg=0,bb=0,n=0;for(const k of border){const j=k*4,q=(p[j]>>4)*256+(p[j+1]>>4)*16+(p[j+2]>>4);if(q===key&&p[j+3]>20){rr+=p[j];gg+=p[j+1];bb+=p[j+2];n++;}}
      bg=[rr/n,gg/n,bb/n];const near=k=>{const j=k*4;return p[j+3]<20||Math.hypot(p[j]-bg[0],p[j+1]-bg[1],p[j+2]-bg[2])<=tolerance;};
      const seen=new Uint8Array(W*H),queue=new Int32Array(W*H);let start=0,end=0;
      for(const k of border)if(!seen[k]&&near(k)){seen[k]=1;queue[end++]=k;}
      while(start<end){const k=queue[start++],x=k%W,y=Math.floor(k/W);for(const next of [x>0?k-1:-1,x<W-1?k+1:-1,y>0?k-W:-1,y<H-1?k+W:-1])if(next>=0&&!seen[next]&&near(next)){seen[next]=1;queue[end++]=next;}}
      for(let k=0;k<W*H;k++)if(seen[k]){p[k*4+3]=0;removed++;}
    }
    let x0=W,y0=H,x1=-1,y1=-1;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(p[(y*W+x)*4+3]>24){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
    if(x1<0)throw Error('Dabei bleibt kein Logo übrig. Verringere die Stärke oder nutze das Original.');
    const pad=Math.max(1,Math.round(Math.max(x1-x0,y1-y0)*.01));x0=Math.max(0,x0-pad);y0=Math.max(0,y0-pad);x1=Math.min(W-1,x1+pad);y1=Math.min(H-1,y1+pad);
    const cw=x1-x0+1,ch=y1-y0+1,out=new Uint8ClampedArray(cw*ch*4);for(let y=0;y<ch;y++)out.set(p.subarray(((y+y0)*W+x0)*4,((y+y0)*W+x0+cw)*4),y*cw*4);
    return {data:out,width:cw,height:ch,removed,background:bg,confidence:already?'transparent':uniform&&removed?'einfarbig':'prüfen',crop:{x:left+x0,y:top+y0,w:cw,h:ch}};
  }
  // Eine Querfassung kommt nur in Frage, wenn ein durchgehend transparenter
  // Abstand das kompakte obere Zeichen deutlich vom breiteren Schriftblock trennt.
  function logoBloecke({data,width,height}){
    if(width<32||height<32||width>3*height)return null;
    const streifen=[];
    let block;
    for(let y=0;y<height;y++){
      let links=width,rechts=-1;
      for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>0){
        links=Math.min(links,x);rechts=x;
      }
      if(rechts<0){block=null;continue;}
      if(!block){block={links,rechts,oben:y,unten:y};streifen.push(block);}
      block.links=Math.min(block.links,links);block.rechts=Math.max(block.rechts,rechts);block.unten=y;
    }
    if(streifen.length<2)return null;
    const oben=streifen[0],unten=streifen.slice(1);
    const luecke=unten[0].oben-oben.unten-1;
    if(luecke<Math.max(3,.055*height)||unten.some((s,i)=>i&&s.oben-unten[i-1].unten-1>=luecke*.85))return null;
    const box=s=>({x:Math.min(...s.map(b=>b.links)),y:s[0].oben,
      w:Math.max(...s.map(b=>b.rechts))-Math.min(...s.map(b=>b.links))+1,h:s[s.length-1].unten-s[0].oben+1});
    const zeichen=box([oben]),schrift=box(unten);
    if(zeichen.w/zeichen.h>2.25||zeichen.h<height*.24||schrift.w/schrift.h<2||schrift.w<width*.5)return null;
    return {zeichen,schrift};
  }
  const api={CI,FONTS,FORMATS,TEMPLATES,num,text,colour,clone,uid,esc,isRaster,hexRGB,isContactText,cleanContacts,normalise,create,template,fitImage,textPath,preflight,history,cutout,logoBloecke};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BD_CORE=api;
})(typeof window!=='undefined'?window:globalThis);

/* Shared preview/export geometry. Fonts become outlines, raster logos keep source pixels. */
(function(root){
  'use strict';
  const C=root.BD_CORE,fonts={},images=new Map();let ready;
  async function loadFonts(){
    if(ready)return ready;
    ready=Promise.all(Object.entries(C.FONTS).map(async([key,f])=>{
      const r=await fetch('fonts/'+f.file);if(!r.ok)throw Error('Die CI-Schrift lässt sich nicht laden. Bitte versuche es erneut.');
      fonts[key]=root.opentype.parse(await r.arrayBuffer());
    })).catch(()=>{ready=null;throw Error('Die CI-Schriften lassen sich gerade nicht laden. Prüfe deine Verbindung und lade die Seite erneut.');});return ready;
  }
  function image(src){if(images.has(src))return images.get(src);const p=new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>no(Error('Das Logo lässt sich nicht lesen.'));i.src=src;});images.set(src,p);p.catch(()=>images.delete(src));return p;}
  function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  async function validateAssets(d){
    for(const a of Object.values(d.assets)){
      const i=await image(a.src);if(!i.naturalWidth||!i.naturalHeight||i.naturalWidth*i.naturalHeight>24000000||i.naturalWidth>30000||i.naturalHeight>30000)throw Error('Ein Logo ist zu groß oder beschädigt. Bitte lade das Original neu.');
      if(a.vector){for(const p of a.vector.paths){const path=root.BD_SVGPATH(p.d);if(path.err||!path.segments.length)throw Error('Ein gespeicherter Vektorpfad ist ungültig.');}}
      else{a.width=i.naturalWidth;a.height=i.naturalHeight;}
      await analyseAsset(a);
    }
    return d;
  }
  function vectorSVG(v){return `<svg xmlns="http://www.w3.org/2000/svg" width="${v.width}" height="${v.height}" viewBox="0 0 ${v.width} ${v.height}">${v.paths.map(p=>`<path d="${C.esc(p.d)}" fill="${p.fill}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" opacity="${p.opacity}" fill-rule="${p.rule}"/>`).join('')}</svg>`;}
  async function vectorPreview(v){const u=URL.createObjectURL(new Blob([vectorSVG(v)],{type:'image/svg+xml'}));try{const i=await image(u),s=Math.min(1,1800/Math.max(v.width,v.height)),c=canvas(Math.max(1,Math.ceil(v.width*s)),Math.max(1,Math.ceil(v.height*s)));c.getContext('2d').drawImage(i,0,0,c.width,c.height);return c.toDataURL('image/png');}finally{images.delete(u);URL.revokeObjectURL(u);}}
  async function analyseAsset(asset){
    const bright=c=>c!=='none'&&C.hexRGB(c).every(v=>v>=235);let light=false;
    if(asset.vector){const paints=asset.vector.paths.filter(p=>p.opacity>0).flatMap(p=>[p.fill,p.stroke]).filter(c=>c!=='none');light=paints.length>0&&paints.every(bright);}
    else{
      const i=await image(asset.src),s=Math.min(1,256/Math.max(i.naturalWidth,i.naturalHeight)),c=canvas(Math.max(1,Math.ceil(i.naturalWidth*s)),Math.max(1,Math.ceil(i.naturalHeight*s))),ctx=c.getContext('2d',{willReadFrequently:true});
      ctx.drawImage(i,0,0,c.width,c.height);const rgba=ctx.getImageData(0,0,c.width,c.height).data;let visible=0,white=0;
      for(let j=0;j<rgba.length;j+=4)if(rgba[j+3]>32){visible++;if(rgba[j]>=235&&rgba[j+1]>=235&&rgba[j+2]>=235)white++;}
      light=visible>0&&white/visible>.92;c.width=c.height=1;
    }
    asset.light=light;return asset;
  }
  function vectorElement(v,b){return `<svg x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" viewBox="0 0 ${v.width} ${v.height}" overflow="hidden">${v.paths.map(p=>`<path d="${C.esc(p.d)}" fill="${p.fill}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" opacity="${p.opacity}" fill-rule="${p.rule}"/>`).join('')}</svg>`;}
  function drawVector(ctx,v,b){
    ctx.save();ctx.translate(b.x,b.y);ctx.scale(b.w/v.width,b.h/v.height);ctx.beginPath();ctx.rect(0,0,v.width,v.height);ctx.clip();
    for(const p of v.paths){const path=new Path2D(p.d);ctx.globalAlpha=p.opacity;if(p.fill!=='none'){ctx.fillStyle=p.fill;ctx.fill(path,p.rule);}if(p.stroke!=='none'&&p.strokeWidth>0){ctx.strokeStyle=p.stroke;ctx.lineWidth=p.strokeWidth;ctx.stroke(path);}}
    ctx.restore();
  }
  const paintColor=value=>{
    value=String(value||'').trim().toLowerCase();if(value==='none')return 'none';
    const names={white:'#ffffff',black:'#000000',red:'#ff0000',blue:'#0000ff',green:'#008000',navy:'#000080',orange:'#ffa500',transparent:'none'};
    if(names[value])return names[value];if(/^#[0-9a-f]{6}$/.test(value))return value;if(/^#[0-9a-f]{3}$/.test(value))return '#'+value.slice(1).split('').map(x=>x+x).join('');
    const m=/^rgb\(\s*(\d+)\s*[, ]\s*(\d+)\s*[, ]\s*(\d+)\s*\)$/.exec(value);if(m&&m.slice(1).every(v=>+v<=255))return '#'+m.slice(1).map(v=>(+v).toString(16).padStart(2,'0')).join('');
    throw Error('Die SVG-Datei nutzt eine nicht unterstützte Farbe. Nutze eine SVG mit einfachen Flächen oder eine PNG-Datei.');
  };
  // Deliberately small, closed SVG grammar: no references, scripts, embedded files or CSS selectors.
  function readSVG(source){
    if(source.length>3*1024*1024||/<!DOCTYPE|<!ENTITY|<\?[^x]|(?:href|src)\s*=|url\s*\(|@import|<script|<foreignObject/i.test(source))throw Error('Diese SVG-Datei enthält Verweise oder aktive Inhalte. Nutze eine bereinigte Logo-Datei.');
    const xml=new DOMParser().parseFromString(source,'image/svg+xml'),svg=xml.documentElement;
    if(svg.localName!=='svg'||xml.querySelector('parsererror'))throw Error('Die SVG-Datei ist beschädigt.');
    const vb=(svg.getAttribute('viewBox')||'').trim().split(/[ ,]+/).map(Number),unit=s=>{const m=/^([0-9.]+)(px|mm|cm|in|pt)?$/.exec(s||'');return m?+m[1]*({mm:96/25.4,cm:96/2.54,in:96,pt:96/72,px:1}[m[2]]||1):0;};
    const [vx,vy,W,H]=vb.length===4&&vb.every(Number.isFinite)?vb:[0,0,unit(svg.getAttribute('width')),unit(svg.getAttribute('height'))];
    if(!(W>0&&H>0&&W<=100000&&H<=100000))throw Error('Der SVG-Datei fehlen gültige Maße.');
    const paths=[];let nodes=0;
    const number=(e,k,f=0)=>{const s=e.getAttribute(k);if(s==null)return f;if(!/^[+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?$/i.test(s)||!Number.isFinite(+s)||Math.abs(+s)>1000000)throw Error('Die SVG-Geometrie ist ungültig.');return +s;};
    function walk(el,inherit,transform,parentAlpha=1){
      if(++nodes>2000)throw Error('Das SVG-Logo hat zu viele Elemente.');
      const tag=el.localName;if(['title','desc','metadata'].includes(tag))return;
      if(!['svg','g','path','rect','circle','ellipse','polygon','polyline','line'].includes(tag))throw Error('Das SVG nutzt '+tag+'. Nutze eine SVG aus Pfaden oder eine hochauflösende PNG-Datei.');
      for(const a of el.attributes)if(/^on/i.test(a.name)||/href|filter|mask|clip-path/i.test(a.name))throw Error('Die SVG enthält nicht unterstützte Verweise.');
      const style={...inherit};delete style.opacity;for(const [k,v]of(el.getAttribute('style')||'').split(';').filter(Boolean).map(s=>s.split(':').map(x=>x.trim()))){if(!['fill','stroke','stroke-width','opacity','fill-opacity','stroke-opacity','fill-rule'].includes(k))throw Error('Das SVG nutzt nicht unterstützte Stilregeln.');style[k]=v;}
      for(const k of ['fill','stroke','stroke-width','opacity','fill-opacity','stroke-opacity','fill-rule'])if(el.hasAttribute(k))style[k]=el.getAttribute(k);
      if(el.hasAttribute('class'))throw Error('Die SVG nutzt Stilklassen. Exportiere sie mit Inline-Stilen oder als PNG.');
      const tr=el.getAttribute('transform')||'';if(tr&&!/^[a-zA-Z0-9eE(),.\s+-]+$/.test(tr))throw Error('Die SVG-Transformation ist ungültig.');
      const full=(transform+' '+tr).trim();
      if(tag==='svg'||tag==='g'){for(const n of el.children)walk(n,style,full,parentAlpha*C.num(style.opacity,0,1,1));return;}
      let d='';
      if(tag==='path')d=el.getAttribute('d')||'';
      if(tag==='rect'){const x=number(el,'x'),y=number(el,'y'),w=number(el,'width'),h=number(el,'height');if(number(el,'rx')||number(el,'ry'))throw Error('Gerundete SVG-Flächen bitte vorher in Pfade umwandeln.');d=`M${x} ${y}h${w}v${h}h${-w}Z`;}
      if(tag==='circle'||tag==='ellipse'){const x=number(el,'cx'),y=number(el,'cy'),rx=number(el,tag==='circle'?'r':'rx'),ry=number(el,tag==='circle'?'r':'ry');d=`M${x-rx} ${y}a${rx} ${ry} 0 1 0 ${2*rx} 0a${rx} ${ry} 0 1 0 ${-2*rx} 0Z`;}
      if(tag==='polygon'||tag==='polyline'){const p=(el.getAttribute('points')||'').trim();if(!/^[0-9eE.,+\s-]+$/.test(p))throw Error('Die SVG-Punkte sind ungültig.');d='M'+p+(tag==='polygon'?'Z':'');}
      if(tag==='line')d=`M${number(el,'x1')} ${number(el,'y1')}L${number(el,'x2')} ${number(el,'y2')}`;
      if(!d)return;if(d.length>250000||!/^[MmLlHhVvCcSsQqTtAaZzEe0-9.,+\s-]+$/.test(d))throw Error('Ein SVG-Pfad ist ungültig.');
      const p=root.BD_SVGPATH(d).transform(full).abs();if(p.err)throw Error('Ein SVG-Pfad lässt sich nicht lesen.');
      const fill=paintColor(style.fill||'#000000'),stroke=paintColor(style.stroke||'none'),opacity=parentAlpha*C.num(style.opacity,0,1,1)*C.num(style['fill-opacity'],0,1,1);
      if(stroke!=='none'&&style['stroke-opacity']&&+style['stroke-opacity']!==C.num(style['fill-opacity'],0,1,1))throw Error('Die SVG nutzt verschiedene Deckungen. Bitte als PNG hochladen.');
      if(stroke!=='none'&&full.replace(`translate(${-vx} ${-vy})`,'').trim())throw Error('Transformierte SVG-Konturen bitte vorher in Flächen umwandeln.');
      paths.push({d:p.toString(),fill,stroke,strokeWidth:C.num(style['stroke-width'],0,1000,1),opacity,rule:style['fill-rule']==='evenodd'?'evenodd':'nonzero'});
    }
    walk(svg,{fill:'#000000',stroke:'none',opacity:'1'},`translate(${-vx} ${-vy})`);
    if(!paths.length)throw Error('Die SVG-Datei enthält keine sichtbaren Logo-Pfade.');return {width:W,height:H,paths};
  }
  async function render(ctx,d,scale=1){
    await loadFonts();await Promise.all(Object.values(d.assets).map(a=>image(a.src)));
    ctx.save();ctx.scale(scale,scale);ctx.fillStyle=d.background;ctx.fillRect(0,0,d.width,d.height);ctx.beginPath();ctx.rect(0,0,d.width,d.height);ctx.clip();
    for(const e of d.elements){
      if(e.type==='rect'){ctx.fillStyle=e.fill;ctx.fillRect(e.x,e.y,e.w,e.h);}
      else if(e.type==='text'&&e.text.trim()){ctx.fillStyle=e.fill;ctx.fill(new Path2D(C.textPath(e,fonts[e.font]).d));}
      else if(e.type==='image'){const a=d.assets[e.asset],b=C.fitImage(e,a);if(a.vector)drawVector(ctx,a.vector,b);else ctx.drawImage(await image(a.src),b.x,b.y,b.w,b.h);}
    }
    ctx.restore();
  }
  function svgDocument(doc){
    const d=C.normalise(doc),B=d.bleed,parts=[`<rect x="${-B}" y="${-B}" width="${d.width+2*B}" height="${d.height+2*B}" fill="${d.background}"/>`];
    for(const e of d.elements){
      if(e.type==='rect')parts.push(`<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" fill="${e.fill}"/>`);
      if(e.type==='text'&&e.text.trim())parts.push(`<path d="${C.textPath(e,fonts[e.font]).d}" fill="${e.fill}"/>`);
      if(e.type==='image'){const a=d.assets[e.asset],b=C.fitImage(e,a);if(a.vector)parts.push(vectorElement(a.vector,b));else parts.push(`<image x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" href="${a.src}"/>`);}
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${d.width+2*B}mm" height="${d.height+2*B}mm" viewBox="${-B} ${-B} ${d.width+2*B} ${d.height+2*B}"><title>${C.esc(d.title||'Bande')}</title>${parts.join('')}</svg>`;
  }
  const b64bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  let cmsPromise;
  async function colourEngine(profile){
    const bytes=b64bytes(profile.data);if(bytes.length<132||bytes.length>8*1024*1024||String.fromCharCode(...bytes.slice(36,40))!=='acsp'||String.fromCharCode(...bytes.slice(16,20))!=='CMYK'||String.fromCharCode(...bytes.slice(12,16))!=='prtr')throw Error('Bitte ein gültiges CMYK-Ausgabeprofil der Druckerei verwenden.');
    if(!cmsPromise)cmsPromise=import(new URL('./vendor/bandenstudio/lcms.mjs',location.href).href).then(async M=>({M,engine:await M.instantiate({locateFile:()=>new URL('./vendor/bandenstudio/lcms.wasm',location.href).href})})).catch(e=>{cmsPromise=null;throw Error('Das Farbwerkzeug lässt sich nicht laden. Bitte versuche es erneut.');});
    const {M,engine:l}=await cmsPromise,ip=l.cmsCreate_sRGBProfile(),op=l.cmsOpenProfileFromMem(bytes,bytes.length);
    if(!op){l.cmsCloseProfile(ip);throw Error('Das ICC-Profil lässt sich nicht lesen.');}
    const t=l.cmsCreateTransform(ip,M.TYPE_RGB_8,op,M.TYPE_CMYK_8,M.INTENT_RELATIVE_COLORIMETRIC,M.cmsFLAGS_BLACKPOINTCOMPENSATION);
    if(!t){l.cmsCloseProfile(ip);l.cmsCloseProfile(op);throw Error('Dieses Profil erlaubt keine Umrechnung von RGB nach CMYK.');}
    let closed=false;return {bytes,name:l.cmsGetProfileInfoASCII(op,M.cmsInfoDescription,'en','US')||profile.name,convert(rgb,count){if(closed)throw Error('Das Farbwerkzeug ist geschlossen.');return l.cmsDoTransform(t,rgb,count);},close(){if(!closed){l.cmsDeleteTransform(t);l.cmsCloseProfile(ip);l.cmsCloseProfile(op);closed=true;}}};
  }
  async function pdf(doc){
    await loadFonts();const d=await validateAssets(C.normalise(doc)),check=C.preflight(d,fonts,true);if(!check.ok)throw Error(check.issues.find(x=>x.level==='stop').message);
    const P=root.PDFLib,out=await P.PDFDocument.create(),B=d.bleed,M=10,realW=d.width+2*(B+M),realH=d.height+2*(B+M),uu=Math.max(1,Math.ceil(Math.max(realW,realH)/d.scale*72/25.4/14400)),k=72/25.4/d.scale/uu,W=realW*k,H=realH*k,O=(B+M)*k,page=out.addPage([W,H]);
    page.node.set(P.PDFName.of('UserUnit'),P.PDFNumber.of(uu));page.setTrimBox(O,O,d.width*k,d.height*k);page.setBleedBox(M*k,M*k,(d.width+2*B)*k,(d.height+2*B)*k);
    out.setTitle(d.title||'Bande');out.setCreator('SV/BSC Bandenstudio');out.setSubject(`Endformat ${d.width} x ${d.height} mm; Maßstab 1:${d.scale}; Beschnitt ${B} mm; ${d.mode.toUpperCase()}; Schrift als Pfade`);
    let cms=null;const colours=new Map(),gs=new Map();
    try{
      if(d.mode==='cmyk'){
        cms=await colourEngine(d.profile);const ref=out.context.register(out.context.flateStream(cms.bytes,{N:4,Alternate:'DeviceCMYK'}));
        out.catalog.set(P.PDFName.of('OutputIntents'),out.context.obj([out.context.obj({Type:'OutputIntent',S:'GTS_PDFX',OutputConditionIdentifier:P.PDFString.of(cms.name),Info:P.PDFString.of(cms.name),DestOutputProfile:ref})]));
      }
      const color=h=>{if(colours.has(h))return colours.get(h);const rgb=C.hexRGB(h),v=cms?P.cmyk(...Array.from(cms.convert(new Uint8Array(rgb),1),x=>x/255)):P.rgb(...rgb.map(x=>x/255));colours.set(h,v);return v;};
      function path(d,x,y,scale,fill,stroke='none',sw=0,opacity=1,rule='nonzero'){
        let graphicsState;if(opacity<1){if(!gs.has(opacity)){const ref=out.context.register(out.context.obj({Type:'ExtGState',ca:opacity,CA:opacity}));gs.set(opacity,page.node.newExtGState('BDAlpha',ref));}graphicsState=gs.get(opacity);}
        const cubic=root.BD_SVGPATH(d).abs().unshort().unarc().iterate((segment,index,px,py)=>segment[0]==='Q'?[['C',px+2/3*(segment[1]-px),py+2/3*(segment[2]-py),segment[3]+2/3*(segment[1]-segment[3]),segment[4]+2/3*(segment[2]-segment[4]),segment[3],segment[4]]]:undefined).toString();
        const ops=P.drawSvgPath(cubic,{x:O+x*k,y:H-O-y*k,scale:k*scale,color:fill==='none'?undefined:color(fill),borderColor:stroke==='none'?undefined:color(stroke),borderWidth:stroke==='none'?0:sw,graphicsState});
        page.pushOperators(...ops.map(op=>rule==='evenodd'&&op.toString()==='f'?P.PDFOperator.of('f*'):rule==='evenodd'&&op.toString()==='B'?P.PDFOperator.of('B*'):op));
      }
      page.drawRectangle({x:M*k,y:M*k,width:(d.width+2*B)*k,height:(d.height+2*B)*k,color:color(d.background)});
      page.pushOperators(P.pushGraphicsState(),P.rectangle(M*k,M*k,(d.width+2*B)*k,(d.height+2*B)*k),P.clip(),P.endPath());
      const embedded=new Map();
      for(const e of d.elements){
        if(e.type==='rect')page.drawRectangle({x:O+e.x*k,y:H-O-(e.y+e.h)*k,width:e.w*k,height:e.h*k,color:color(e.fill)});
        if(e.type==='text'&&e.text.trim())path(C.textPath(e,fonts[e.font]).d,0,0,1,e.fill);
        if(e.type!=='image')continue;
        const a=d.assets[e.asset],b=C.fitImage(e,a);
        if(a.vector){page.pushOperators(P.pushGraphicsState(),P.rectangle(O+b.x*k,H-O-(b.y+b.h)*k,b.w*k,b.h*k),P.clip(),P.endPath());const s=b.w/a.vector.width;for(const v of a.vector.paths)path(v.d,b.x,b.y,s,v.fill,v.stroke,v.strokeWidth,v.opacity,v.rule);page.pushOperators(P.popGraphicsState());continue;}
        if(!embedded.has(e.asset)){
          if(!cms){const img=await image(a.src),cv=canvas(img.naturalWidth,img.naturalHeight);cv.getContext('2d').drawImage(img,0,0);embedded.set(e.asset,{image:await out.embedPng(cv.toDataURL('image/png'))});cv.width=cv.height=1;}
          else{
            const img=await image(a.src),cv=canvas(img.naturalWidth,img.naturalHeight),ctx=cv.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);const rgba=ctx.getImageData(0,0,cv.width,cv.height).data,n=cv.width*cv.height,ink=new Uint8Array(n*4),alpha=new Uint8Array(n);let hasAlpha=false;
            for(let start=0;start<n;start+=150000){const count=Math.min(150000,n-start),rgb=new Uint8Array(count*3);for(let j=0;j<count;j++){const r=(start+j)*4;rgb.set(rgba.subarray(r,r+3),j*3);alpha[start+j]=rgba[r+3];if(rgba[r+3]!==255)hasAlpha=true;}ink.set(cms.convert(rgb,count),start*4);await new Promise(ok=>setTimeout(ok,0));}
            const mask=hasAlpha?out.context.register(out.context.flateStream(alpha,{Type:'XObject',Subtype:'Image',Width:cv.width,Height:cv.height,ColorSpace:'DeviceGray',BitsPerComponent:8})):undefined;
            const ref=out.context.register(out.context.flateStream(ink,{Type:'XObject',Subtype:'Image',Width:cv.width,Height:cv.height,ColorSpace:'DeviceCMYK',BitsPerComponent:8,...(mask?{SMask:mask}:{})}));embedded.set(e.asset,{ref});cv.width=cv.height=1;
          }
        }
        const im=embedded.get(e.asset);if(im.image)page.drawImage(im.image,{x:O+b.x*k,y:H-O-(b.y+b.h)*k,width:b.w*k,height:b.h*k});
        else{const name=page.node.newXObject('BDImage',im.ref);page.pushOperators(P.pushGraphicsState(),P.concatTransformationMatrix(b.w*k,0,0,b.h*k,O+b.x*k,H-O-(b.y+b.h)*k),P.drawObject(name),P.popGraphicsState());}
      }
      page.pushOperators(P.popGraphicsState());
      const black=d.mode==='cmyk'?P.cmyk(0,0,0,1):P.rgb(0,0,0),xs=[O,O+d.width*k],ys=[O,O+d.height*k];
      for(const x of xs)for(const y of ys){const sx=x<W/2?-1:1,sy=y<H/2?-1:1;page.drawLine({start:{x:x+sx*(B+2)*k,y},end:{x:x+sx*(B+8)*k,y},thickness:.2*k,color:black});page.drawLine({start:{x,y:y+sy*(B+2)*k},end:{x,y:y+sy*(B+8)*k},thickness:.2*k,color:black});}
      return {bytes:await out.save(),page:{width:realW/d.scale,height:realH/d.scale,userUnit:uu},mode:d.mode,profile:cms?.name||null};
    }finally{cms?.close();}
  }
  root.BD_RENDER={fonts,loadFonts,image,canvas,validateAssets,readSVG,vectorSVG,vectorPreview,vectorElement,analyseAsset,render,svgDocument,colourEngine,pdf};
})(window);

/* Persönlicher, versionierter Bandenentwurf. Druckfreigabe und Vertrag bleiben getrennt. */
(function(root){
  'use strict';
  const MAX_PREVIEW=500*1024;
  const codeOK=s=>/^[a-f0-9]{32}$/.test(String(s||''));
  const clone=v=>JSON.parse(JSON.stringify(v));
  const previewOK=s=>typeof s==='string'&&/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(s)&&(s.length-22)*.75<=MAX_PREVIEW;
  function editorURL(origin,nonce){if(!/^[a-f0-9]{32}$/.test(nonce))throw Error('Die Editor-Kennung fehlt.');return new URL('/bandenstudio.html#edit='+nonce,origin).href;}
  function editorMessage(e,iframe,nonce,origin){return !!(iframe&&e.source===iframe.contentWindow&&e.origin===origin&&e.data&&e.data.nonce===nonce&&/^bd-editor-/.test(String(e.data.typ||'')));}
  function customerPayload(doc,template,version,C){
    if(template!==null&&!['klar','logo'].includes(template))throw Error('Bitte wähle eine der beiden Gestaltungen.');
    const d=C.normalise(doc),first=d.elements.find(e=>e.type==='image'),p={expected_version:version,template};
    p.logo=first?clone(d.assets[first.asset]):null;return p;
  }
  function textureLayout(doc,size){const W=size?size[1]:doc.width,H=size?size[2]:doc.height,s=Math.min(W/doc.width,H/doc.height);return {W,H,B:0,format:W/10+'x'+H/10,stil:'studio',layout:'gespeichert',ops:[{t:'rect',x:0,y:0,w:W,h:H,fill:doc.background},{t:'img',key:'logo',x:(W-doc.width*s)/2,y:(H-doc.height*s)/2,w:doc.width*s,h:doc.height*s}],info:{warn:[],lesbar:{}},farben:{grund:doc.background}};}
  const rules={codeOK,previewOK,editorURL,editorMessage,customerPayload,textureLayout};
  if(typeof module!=='undefined'&&module.exports){module.exports=rules;return;}
  let cfg=null,project=null,documentNow=null,preview=null,loading=null,loadingError=null,modal=null,editor=null,nonce='',saving=false,previousFocus=null,bodyOverflow='',loadGeneration=0,reloadRequired=false,motiv='haupt',availableMotifs=[],motifFocus=null;
  const $=s=>document.querySelector(s),C=()=>root.BD_CORE,R=()=>root.BD_RENDER;
  const frame=()=>document.getElementById('reiseRahmen');
  const canEdit=()=>!!(project&&(project.bearbeiten===true||project.kundenbearbeitung===true));
  const team=()=>!!(project&&project.team===true&&project.bearbeiten===true);
  const errorText=e=>/failed to fetch|networkerror|load failed|network request failed/i.test(e&&e.message||'')?'Die Verbindung ist unterbrochen. Deine Änderungen bleiben im Editor. Prüfe dein Netz und versuche es erneut.':e&&e.message||'Der Entwurf ist gerade nicht erreichbar. Bitte versuche es erneut.';
  function notify(t){if(cfg&&cfg.toast)cfg.toast(t);}
  function resume(){const f=frame();if(f&&f.contentWindow)f.contentWindow.postMessage({reise:'bande-editor-zu'},location.origin);if(cfg&&cfg.geschlossen)cfg.geschlossen();}
  const motifs=()=>{const list=project&&project.motive||availableMotifs;return Array.isArray(list)?list.filter(m=>m&&['haupt','moerlens'].includes(m.key)&&typeof m.titel==='string').slice(0,2):[];};
  function context(){const f=frame();if(f&&f.contentWindow)f.contentWindow.postMessage({reise:'bande-projekt',vorschau:preview||null,einzel:documentNow?documentNow.width/documentNow.height<4.7:false,bearbeiten:canEdit(),version:project&&project.version||0,motiv,motive:motifs(),busy:!!loading||saving},location.origin);controls();}
  function rpc(fn,args){
    const routes={bandenstudio_projekt_laden:'bandenstudio_motiv_laden',bandenstudio_projekt_speichern:'bandenstudio_motiv_speichern',bandenstudio_kunde_speichern:'bandenstudio_motiv_kunde_speichern'};
    return cfg.rpc(motiv!=='haupt'&&routes[fn]?routes[fn]:fn,motiv!=='haupt'&&routes[fn]?{...args,p_motiv:motiv}:args);
  }
  function controls(){
    const b=$('#bdBearbeiten'),g=$('#bdKundeErlauben'),hint=$('#bdProjektHinweis'),count=$('#bdProjektBestand');
    if(b){b.hidden=!canEdit();b.disabled=saving||!!loading;}
    if(g){g.closest('label').hidden=!(project&&project.kundenfreigabe_darf===true);g.checked=!!(project&&project.kundenbearbeitung);}
    if(hint)hint.textContent=loadingError?'Der gespeicherte Entwurf lässt sich gerade nicht laden. Lade die Seite erneut.':project?'Gespeicherter Entwurf · Version '+project.version+'. Die Druckfreigabe erfolgt separat.':'Euer Entwurf wird geladen …';
    if(count){const s=project&&project.bestand;count.hidden=!(team()&&s);count.textContent=s?'Entwürfe im Bestand: '+s.projekte+' für '+s.aktive_partner+' aktive Präsentationen.':'';}
    for(const id of ['bdLay','bdFmt']){const el=$('#'+id);if(el)el.hidden=!!cfg;}
    const host=$('#bdMotiv')||$('[data-bandenstudio-motive]'),list=motifs();
    if(host){host.hidden=list.length<2;const content=list.map(m=>'<button type="button" data-bd-motiv="'+m.key+'" aria-pressed="'+(m.key===motiv)+'"'+(saving||loading?' disabled':'')+'>'+C().esc(m.titel)+'</button>').join('');
      if(host.innerHTML!==content){host.innerHTML=content;host.querySelectorAll?.('[data-bd-motiv]').forEach(b=>b.onclick=()=>{motifFocus=b.dataset.bdMotiv;changeMotif(b.dataset.bdMotiv);});}
      if(motifFocus&&!loading&&!saving){host.querySelector?.('[data-bd-motiv="'+motifFocus+'"]')?.focus({preventScroll:true});motifFocus=null;}
    }
  }
  async function makeDoc(p){
    if(!C()||!R())throw Error('Das Bandenstudio wird noch geladen. Bitte lade die Seite neu.');
    if(p.quelle!=='generator'&&(p.dokument||p.readDoc))return C().cleanContacts(p.dokument||p.readDoc);
    const g=p.generator;if(!g||typeof g!=='object')throw Error('Für diesen Link liegt noch kein Bandenentwurf vor.');
    let d=C().create(g.firma||''),asset=g.logo;
    d.width=+g.width||2500;d.height=+g.height||800;d.bleed=Number.isFinite(+g.bleed)?+g.bleed:20;d.safe=Number.isFinite(+g.safe)?+g.safe:40;
    if(!asset&&g.logo_aus_praesentation&&cfg&&(cfg.logo||g.logo_url)){
      if(g.logo_url&&!['partner/bb-signet.svg','partner/moerlens-schriftzug.png'].includes(g.logo_url))throw Error('Die Logo-Vorlage ist nicht freigegeben.');
      const src=g.logo_url||(typeof cfg.logo==='function'?cfg.logo():cfg.logo);
      if(src&&(/\.svg(?:[?#]|$)/i.test(src)||/^data:image\/svg\+xml[;,]/i.test(src))){
        const response=await fetch(src);if(!response.ok)throw Error('Das Vektorlogo lässt sich gerade nicht laden.');const vector=R().readSVG(await response.text()),data=await R().vectorPreview(vector);
        asset={name:'Logo der Präsentation',src:data,width:vector.width,height:vector.height,kind:'vector',vector};
      }else if(src&&typeof LOGO!=='undefined'){
        const data=await LOGO.alsDataUrl(src,'original',1800),im=await R().image(data);asset={name:'Logo der Präsentation',src:data,width:im.naturalWidth||im.width,height:im.naturalHeight||im.height,kind:'raster'};
      }
    }
    if(asset){asset=clone(asset);
      if(!asset.vector&&typeof LOGO!=='undefined'&&typeof LOGO.alsDataUrl==='function'){
        const original=asset.original||asset.src,src=await LOGO.alsDataUrl(asset.src,'farbe:'+(g.pattern==='bb'?C().CI.orange:C().CI.marine),1800),im=await R().image(src);
        asset={...asset,original,src,width:im.naturalWidth||im.width,height:im.naturalHeight||im.height,light:false};
      }
      if(typeof R().analyseAsset==='function')asset=await R().analyseAsset(asset)||asset;d.assets.partner_logo=asset;
    }
    d=C().template(d,['klar','logo','kante'].includes(g.template)?g.template:'klar',{name:g.name||g.firma||'',nameAn:g.nameAn===true,pattern:g.pattern||'normal',claim:g.claim||'',asset:asset?'partner_logo':undefined});
    return C().normalise(d);
  }
  async function makePreview(d){
    // Die Vorschau wird aus dem gültigen Dokument erzeugt, nie aus frei übermittelten Kundenpixeln.
    for(const width of [1800,1400,1000,700]){
      const s=Math.min(1,width/d.width),cv=R().canvas(Math.max(1,Math.round(d.width*s)),Math.max(1,Math.round(d.height*s)));
      await R().render(cv.getContext('2d'),d,s);const data=cv.toDataURL('image/png');if(previewOK(data))return data;
    }
    throw Error('Die Vorschau ist zu groß. Bitte vereinfache das Logo und speichere erneut.');
  }
  async function adopt(p,generation){
    if(!p||p.ok===false||!Number.isInteger(p.version))throw Error(p&&p.fehler||'Der Entwurf konnte nicht geladen werden.');
    const d=await makeDoc(p),im=await makePreview(d);if(generation!==loadGeneration)return null;
    project=p;availableMotifs=motifs();documentNow=d;preview=im;loadingError=null;reloadRequired=false;context();if(cfg&&cfg.geaendert)cfg.geaendert(p);return p;
  }
  async function load(){
    if(!cfg||!codeOK(cfg.code))throw Error('Der persönliche Präsentationslink fehlt.');
    if(loading)return loading;const generation=loadGeneration;
    loading=(async()=>{try{return await adopt(await rpc('bandenstudio_projekt_laden',{p_code:cfg.code}),generation);}catch(e){if(generation===loadGeneration){loadingError=e;controls();}throw e;}finally{if(generation===loadGeneration){loading=null;context();}}})();return loading;
  }
  async function changeMotif(key){
    if(key===motiv||saving||loading||modal||!motifs().some(m=>m.key===key))return false;
    const old={motiv,project,documentNow,preview},owner=cfg;availableMotifs=motifs();const generation=++loadGeneration;motiv=key;project=null;loadingError=null;reloadRequired=false;
    try{const work=load();context();await work;return cfg===owner&&generation===loadGeneration;}catch(e){if(cfg!==owner||generation!==loadGeneration)return false;motiv=old.motiv;project=old.project;documentNow=old.documentNow;preview=old.preview;loadingError=null;context();notify(errorText(e));return false;}
  }
  async function prepare(o){
    if(!o||!codeOK(o.code)||typeof o.rpc!=='function')throw Error('Der persönliche Präsentationslink fehlt.');
    if(saving)throw Error('Der aktuelle Entwurf wird noch gespeichert.');if(modal)close();
    ++loadGeneration;cfg=o;motiv=o.motiv==='moerlens'?'moerlens':'haupt';availableMotifs=[];motifFocus=null;project=null;documentNow=null;preview=null;loading=null;loadingError=null;reloadRequired=false;controls();return load();
  }
  async function texture(format){if(loading)await loading;else if(!project)await load();if(!preview||!documentNow)return null;return {L:textureLayout(documentNow,C().FORMATS.find(f=>f[0]===format)),res:{logoBild:await R().image(preview)},projekt:project};}
  async function amSpielfeld(quer=false){
    const generation=loadGeneration;
    if(loading)await loading;else if(!project)await load();
    let doc=documentNow,stand=preview;
    const original=doc,ursprungsbild=stand;
    if(generation!==loadGeneration||!doc||!stand)throw Error('Eure Bandenansicht ist noch nicht verfügbar.');
    const foto=await R().image('partner/r-bande.webp');
    let motiv;
    if(quer&&root.PARTNER_MOTIVLAYOUT){
      const quelle=await root.PARTNER_MOTIVLAYOUT.layout(doc,null);
      if(quelle?.quer){
        doc=await root.PARTNER_MOTIVLAYOUT.grundentwurf(quelle.quer,doc.title,doc.width,doc.height);
        const mass=Math.min(1,1800/doc.width);
        motiv=R().canvas(Math.round(doc.width*mass),Math.round(doc.height*mass));
        await R().render(motiv.getContext('2d'),doc,mass);
      }
    }
    if(!motiv)motiv=await R().image(stand);
    if(documentNow!==original||preview!==ursprungsbild)throw Error('Die Gestaltung wurde zwischenzeitlich geändert.');
    // Befestigungspunkte der beiden Felder im vorhandenen Foto. Für eine Einzelbande
    // sehen wir nur das linke Feld. Typografie und Zeichen behalten ihr Seitenverhältnis.
    const einfach=doc.width/doc.height<4.7;
    const px=foto.naturalWidth,py=foto.naturalHeight,links=.041,rechts=einfach?.496:.961;
    const mitteY=.517,feldW=(rechts-links)*px,feldH=.269*py;
    const mass=Math.min(feldW/doc.width,feldH/doc.height);
    const w=mass*doc.width,h=mass*doc.height;
    const bildbreite=Math.round(px*(einfach?.518:1));
    const bildhoehe=Math.round(bildbreite/(einfach?1.55:2.04));
    const y0=Math.round(mitteY*py-bildhoehe*.50);
    const cv=R().canvas(bildbreite,bildhoehe),ctx=cv.getContext('2d');
    ctx.drawImage(foto,0,-y0);
    ctx.globalCompositeOperation='multiply';
    ctx.imageSmoothingQuality='high';
    ctx.drawImage(motiv,links*px+(feldW-w)/2,mitteY*py-h/2-y0,w,h);
    ctx.globalCompositeOperation='source-over';
    cv.setAttribute('role','img');
    cv.setAttribute('aria-label','Euer Bandenentwurf am Spielfeldrand');
    return cv;
  }
  function close(){
    if(!modal||saving)return;const old=modal;modal=null;editor=null;nonce='';old.remove();document.body.style.overflow=bodyOverflow;
    if(previousFocus&&previousFocus.isConnected)previousFocus.focus({preventScroll:true});previousFocus=null;context();resume();
  }
  function status(t){const e=modal&&modal.querySelector('[data-bd-status]');if(e)e.textContent=t;}
  function post(o){if(editor&&editor.contentWindow)editor.contentWindow.postMessage(Object.assign({nonce},o),location.origin);}
  function sendDocument(){if(!modal||!documentNow)return;const g=project.generator||{};post({typ:'bd-editor-laden',doc:clone(documentNow),rolle:team()?'team':'kunde',vorgaben:{firma:g.firma||documentNow.title,name:g.name||g.firma||documentNow.title,nameAn:g.nameAn===true,pattern:g.pattern||'normal',claim:g.claim||'',format:documentNow.width/10+'x'+documentNow.height/10},version:project.version,template:project.quelle==='generator'&&['klar','logo','kante'].includes(g.template)?g.template:null});status('');}
  async function saveFromEditor(data){
    if(!modal||saving||!canEdit())return;saving=true;status('Entwurf wird gespeichert …');const generation=loadGeneration,oldProject=project,oldDoc=documentNow,oldPreview=preview;
    try{
      let p,fn;
      if(team()){
        const d=C().cleanContacts(data.doc);await R().validateAssets(d);p={expected_version:project.version,dokument:d,vorschau:await makePreview(d)};fn='bandenstudio_projekt_speichern';
      }else{p=customerPayload(data.doc,data.template===undefined?null:data.template,project.version,C());fn='bandenstudio_kunde_speichern';}
      const result=await rpc(fn,{p_code:cfg.code,p});
      if(!result||result.ok===false)throw Error(result&&result.konflikt?'Der Entwurf wurde inzwischen geändert. Deine Änderungen bleiben geöffnet. Schließe mit Abbrechen und öffne den Editor erneut, um den aktuellen Stand zu laden.':result&&(result.fehler||result.hinweis)||'Der Entwurf wurde nicht gespeichert. Deine Änderungen bleiben im Editor.');
      // Der Server liefert den kanonischen Stand. Falls nur die Version geliefert wird, laden wir ihn erneut.
      const canonical=result.generator||result.dokument||result.readDoc?result:await rpc('bandenstudio_projekt_laden',{p_code:cfg.code});
      await adopt(canonical,generation);if(generation!==loadGeneration)return;
      post({typ:'bd-editor-gespeichert',ok:true,version:project.version,doc:clone(documentNow)});saving=false;close();notify('Bandenentwurf gespeichert.');
    }catch(e){
      if(generation!==loadGeneration)return;project=oldProject;documentNow=oldDoc;preview=oldPreview;saving=false;reloadRequired=true;context();status(errorText(e));post({typ:'bd-editor-gespeichert',ok:false,fehler:errorText(e)});
    }
  }
  async function open(o){
    try{if(modal)return;if(o&&o.code&&(!cfg||o.code!==cfg.code))await prepare(o);else if(loading)await loading;else if(!project||reloadRequired)await load();
      if(!canEdit()){notify('Die Bearbeitung ist für diesen Link nicht freigegeben.');resume();return;}if(modal)return;
      const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);nonce=Array.from(bytes,n=>n.toString(16).padStart(2,'0')).join('');
      previousFocus=document.activeElement;bodyOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
      modal=document.createElement('div');modal.className='bd-partner-dialog';modal.innerHTML='<section role="dialog" aria-modal="true" aria-label="Bandenentwurf bearbeiten"><header><div><small>SV/BSC Bandenstudio</small><h2>Eure Bande</h2></div><button type="button" data-bd-close aria-label="Editor schließen">×</button></header><p role="status" aria-live="polite" data-bd-status>Editor wird geladen …</p><iframe title="Bandenentwurf bearbeiten" referrerpolicy="same-origin" sandbox="allow-scripts allow-same-origin allow-downloads"></iframe></section>';
      document.body.appendChild(modal);editor=modal.querySelector('iframe');editor.src=editorURL(location.origin,nonce);modal.querySelector('[data-bd-close]').onclick=close;
      modal.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){const first=modal.querySelector('[data-bd-close]');if(document.activeElement===first){e.preventDefault();post({typ:'bd-editor-fokus',ziel:e.shiftKey?'letztes':'erstes'});}else if(document.activeElement===editor){e.preventDefault();first.focus();}}});
      modal.querySelector('[data-bd-close]').focus();
    }catch(e){notify(errorText(e));resume();}
  }
  async function grant(allowed){
    if(!project||project.kundenfreigabe_darf!==true)return;const old=!!project.kundenbearbeitung,el=$('#bdKundeErlauben');if(el)el.disabled=true;
    try{const p=await cfg.rpc('bandenstudio_kunde_erlauben',{p_code:cfg.code,p_erlaubt:allowed});if(!p||p.ok===false)throw Error(p&&p.fehler||'Die Freigabe wurde nicht gespeichert.');await load();notify(allowed?'Der Kunde darf Logo und Anordnung bearbeiten.':'Die Kundenbearbeitung ist ausgeschaltet.');return true;}
    catch(e){project.kundenbearbeitung=old;controls();notify(errorText(e));return false;}finally{if(el)el.disabled=false;}
  }
  function bind(){const b=$('#bdBearbeiten'),g=$('#bdKundeErlauben');if(b)b.onclick=()=>open();if(g)g.onchange=()=>grant(g.checked);controls();}
  root.addEventListener('message',e=>{
    if(editorMessage(e,editor,nonce,location.origin)){
      if(e.data.typ==='bd-editor-bereit')sendDocument();
      else if(e.data.typ==='bd-editor-fokus'&&e.data.ziel==='schliessen'&&modal)modal.querySelector('[data-bd-close]').focus();
      else if(e.data.typ==='bd-editor-speichern')saveFromEditor(e.data);
      else if(e.data.typ==='bd-editor-abbrechen')close();return;
    }
    const f=frame();if(!cfg||!f||e.source!==f.contentWindow||e.origin!==location.origin||!e.data)return;
    if(e.data.reise==='bereit')context();
    if(e.data.reise==='bande-editor-oeffnen'){if(canEdit()&&!loading)open();else resume();}
    if(e.data.reise==='bande-motiv-waehlen'&&typeof e.data.motiv==='string')changeMotif(e.data.motiv);
  });
  root.PD_BANDENSTUDIO={vorbereiten:prepare,oeffnen:open,textur:texture,amSpielfeld,rahmenBereit:context,anbinden:bind,kundenfreigabe:grant,motivWaehlen:changeMotif,geladen:()=>!!project,regeln:rules};
})(typeof window!=='undefined'?window:globalThis);

/* Explicit one-use same-origin handoff; no private data in URL or browser history. */
(function(){
  'use strict';
  window.BD_STUDIO_START=function(brief={}){
    const nonce=Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
    const child=window.open('bandenstudio.html#transfer='+nonce,'_blank');
    if(!child){if(typeof kToast==='function')kToast('Bitte erlaube das Öffnen des Bandenstudios in einem neuen Tab.');return;}
    const input={firma:String(brief.firma||'').slice(0,120),format:String(brief.format||'300x80'),logo:typeof brief.logo==='string'?brief.logo:''};
    let used=false;const timeout=setTimeout(()=>removeEventListener('message',receive),180000);
    async function receive(e){
      if(used||e.origin!==location.origin||e.source!==child||e.data?.typ!=='bandenstudio-bereit'||e.data.nonce!==nonce)return;
      used=true;clearTimeout(timeout);removeEventListener('message',receive);
      const payload={firma:input.firma,format:input.format};
      try{
        let src=input.logo;
        if(src&&!src.startsWith('data:')){
          const u=new URL(src,location.href);if(u.origin!==location.origin||!/^\/(?:[^/?]+\/)?(?:partner|kit|banden)\//.test(u.pathname))throw Error('Bitte die Logo-Originaldatei im Studio laden.');
          const r=await fetch(u,{credentials:'omit'});if(!r.ok)throw Error('Das Logo lässt sich nicht übernehmen.');const b=await r.blob();if(b.size>20*1024*1024)throw Error('Bitte das große Logo direkt im Studio laden.');src=await new Promise((ok,no)=>{const f=new FileReader();f.onload=()=>ok(f.result);f.onerror=no;f.readAsDataURL(b);});
        }
        if(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(src)&&src.length<=28*1024*1024)payload.logo=src;
        else if(/^data:image\/svg\+xml;base64,[A-Za-z0-9+/=]+$/.test(src)&&src.length<4*1024*1024)payload.logoSVG=new TextDecoder().decode(Uint8Array.from(atob(src.split(',')[1]),c=>c.charCodeAt(0)));
      }catch(er){if(typeof kToast==='function')kToast(er.message||'Das Studio ist offen. Bitte das Logo dort laden.');}
      if(!child.closed)child.postMessage({typ:'bandenstudio-start',nonce,brief:payload},location.origin);
    }
    addEventListener('message',receive);
  };
})();
