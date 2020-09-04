/**
 * Utils for SM2 and SM3 module
 */

var utils = exports
var BN = require('./bn.js');
var crypto = require('crypto');
const byteCode = require('bytecode')

utils.strToBytes = strToBytes;
utils.hashToBN = hashToBN;
utils.random = random;
utils.padStart = padStart;

function strToBytes(s) {
  var ch, st, re = [];
  for (var i = 0; i < s.length; i++ ) {
    ch = s.charCodeAt(i);  // get char
    st = [];                 // set up "stack"
    do {
      st.push( ch & 0xFF );  // push byte to stack
      ch = ch >> 8;          // shift value down by 1 byte
    }
    while ( ch );
    // add stack contents to result
    // done because chars have "wrong" endianness
    re = re.concat( st.reverse() );
  }
  return re;
}

function hashToBN(hash) {
  if (typeof hash == 'string') {
    return new BN(hash, 16);
  } else {
    var hex = '';
    for (var i = 0; i < hash.length; i++) {
      var b = hash[i].toString(16);
      if (b.length == 1) {
        hex += '0';
      }
      hex += b;
    }
    return new BN(hex, 16);
  }
}

/**
 * Pads supplied string with character to fill the desired length.
 * 
 * @param {*} str String to pad
 * @param {*} length Desired length of result string
 * @param {*} padChar Character to use as padding
 */
function padStart(str, length, padChar) {
  if (str.length >= length) {
      return str;
  } else {
      return padChar.repeat(length - str.length) + str;
  }
}

/**
 * Generate cryptographic random value.
 *
 * @param {Number} n: byte length of the generated value
 */
function random(n) {
  return crypto.randomBytes(n).toString('hex')
}


// 该内容是李晓聃开发的 start
utils.asciiToStr = asciiToStr;
utils.ascii16ToStr = ascii16ToStr;
utils.strToAscii = strToAscii;
utils.bnSetBytesStr = bnSetBytesStr;
utils.bnSetBytesArr = bnSetBytesArr;
utils.arrToStrHex = arrToStrHex;
utils.strHexToArr = strHexToArr;
utils.strToStr16 = strToStr16;
utils.hexStrToArr = hexStrToArr;
utils.randomArr = randomArr;
utils.arrToHexStr = arrToHexStr;
utils.getUuid = getUuid;
utils.decode = decode;
utils.encode = encode;
utils.setEmptyProperty = setEmptyProperty;
utils.schemeToObj = schemeToObj;
utils.mergeTrueField = mergeTrueField;
// utils.isOnline = isOnline;
/**
 * 把10进制的字符串组成的数据 => 字符串
 * @param  {[]string} arr string型的十进制
 * @return {[type]}     [description]
 */
function asciiToStr(arr) {
  var str = ''
  for (var i = 0; i < arr.length; i++) {
    str += String.fromCharCode(arr[i])
  }
  return str
}
/**
 * 把16进制的字符串组成的数据 => 字符串
 * @param  {[]string} arr string型的16进制
 * @return {[type]}     [description]
 */
function ascii16ToStr(arr) {
  var str = ''
  for (var i = 0; i < arr.length; i++) {
    str += String.fromCharCode(parseInt(arr[i]).toString(16))
  }
  return str
}
/**
 * 把字符串 => 10进制的字符串组成的数据
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
function strToAscii(str) {
  var arr = []
  for (var i = 0; i < str.length; i++) {
    arr.push(str.slice(i, i+1).charCodeAt())
  }
  return arr
}
/**
 * 该方法的功能与go math/big里的SetBytes()功能相同。
 * 使用str转换为二进制组成的字符串，再转换为大数。
 * @param  {string} str [description]
 * @return {BN}     [description]
 */
function bnSetBytesStr(str) {
  return new BN(strToAscii2(str), 2)
}
/**
 * 把str中每个字符转换为ascii码的二进制，再拼接起来。即字符串型的二进制组成的字符串。
 * @param  {string} str [description]
 * @return {string} res [description]
 */
function strToAscii2(str) {
  var res = ''
  for (var i = 0; i < str.length; i++) {
    var temp10 = str.slice(i, i+1).charCodeAt() // 得到该字符的10进制码
    // var temp = Number(temp10).toString(2)
    var temp = temp10.toString(2) // 10进制码 => 2进制码
    while (temp.length < 8) { // 补够8位
      temp = '0' + temp
    }
    res += temp
  }
  return res
}
/**
 * 按照radix进制解析arr中的每一个字符串，把它转换为二进制，再拼接起来。即字符串型的二进制组成的字符串。
 * @param  {[type]} arr   [description]
 * @param  {[type]} radix 按照radix进制解析arr
 * @return {[type]}       [description]
 */
function bnSetBytesArr(arr, radix) {
  if (radix == null) {
    radix = 10
  }
  return new BN(arrAsciiTo2(arr, radix), 2)
}
/**
 * [arrAsciiTo2 description]
 * @param  {[]string} arr   [description]
 * @param  {[type]} radix 按照radix进制解析arr
 * @return {[type]}       [description]
 */
function arrAsciiTo2(arr, radix) {
  // 把arr中的每个str转换为ascii码的二进制，再拼接起来。即字符串型的二进制组成的字符串。
  var res = ''
  for (var i = 0; i < arr.length; i++) {
    // var temp10 = parseInt(arr[i], radix)
    var temp10 = parseInt(arr[i], radix)
    var temp = temp10.toString(2)
    while (temp.length < 8) {
      temp = '0' + temp
    }
    res += temp
  }
  return res
}
// 这2个方法现在没用到，以后可能会用到。
/**
 * 数组 => 16进制的字符串
 * @param  {[type]} arr [description]
 * @return {[type]}     [description]
 */
function arrToStrHex(arr) {
  var str = ''
  for (var i = 0; i < arr.length; i++) {
    var temp = parseInt(arr[i], 10).toString(16)
    if (temp.length < 2) {
      temp = '0' + temp
    }
    str += temp
  }
  return str
}
/**
 * 把16进制的字符串 => 数组
 * @param  {string} str [description]
 * @return {[type]}     [description]
 */
function strHexToArr(str) {
  var arr = []
  for (var i = 0; i < str.length; i=i+2) {
    arr.push(parseInt(str.slice(i, i+2), 16))
  }
  return arr
}
/**
 * 字符串 => 十六进制字符串
 * @param  {string} str [description]
 * @return {string}     [description]
 */
function strToStr16(str) {
  return str.split('').reduce((res, cur) => {
    return res += cur.charCodeAt(0).toString(16)
  }, '')
}

// function str16ToStr (str16) {
//   return
// }

/**
 * 十六进制字符串 => 数组
 * @param  {hexStr} str [description]
 * @return {[type]}     [description]
 */
function hexStrToArr(str) { // eg: d0c138ee0cfce437352a5af46e31a6
  let res = [], i = 0
  str = str.indexOf('0x') === 0 ? str.slice(2) : str
  while (i < str.length) {
    res.push(parseInt(str.slice(i, i+2), 16))
    i += 2
  }
  return res
}
/**
 * 生成指定长度的随机元素的数组
 * @param  {[type]} min    [description]
 * @param  {[type]} max    [description]
 * @param  {[type]} length [description]
 * @return {[type]}        [description]
 */
function randomArr (min, max, length) {
  let eles = [], i = 0
  let ele = min
  while (ele < max) {
    eles.push(ele++)
  }
  // return eles.
  let res = []
  for (i = 0; i < length; i++) {
    res.push(eles[Math.floor(Math.random() * (max - min))])
  }
  return res
}
/**
 * 把由十进制数组成的数组转换为用十六进制表示的字符串
 * @param  {[type]} arr) [description]
 * @return {[type]}      [description]
 */
function arrToHexStr (arr) {
  return arr.reduce((res, cur) => {
    let s = cur.toString(16)
    if (s.length < 2) {
      s = '0' + s
    }
    return res += s
  }, '')
}
// 该内容是李晓聃开发的 end
// function isOnline() {
//   let href = location.href
//   // let reg = new RegExp('[.org|.com|.cn]', 'g')
//   // return reg.test(href)
//   return href.indexOf('.org') > -1 || href.indexOf('.com') > -1 || href.indexOf('.cn') > -1
// }


// 生成uuid
function getUuid () {
  let s = []
  let hexDigits = '1234567890abcdef'
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4'
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1)
  s[8] = s[13] = s[18] = s[23] = '-'
  return s.join('')
}
// str => hexStr
function decode (str) {
  return '0x' + arrToHexStr(byteCode.decode(str))
}
// hexStr => str
function encode (hexStr) {
  hexStr = hexStr.indexOf('0x') === 0 ? hexStr.slice(2) : hexStr
  let arr = []
  for (var i = 0, iLen = hexStr.length; i < iLen; i+=2) {
    arr.push(parseInt(hexStr.slice(i, i+2), 16))
  }
  return byteCode.encode(arr)
}

/**
 * 为obj对象的空属性设置初始值
 * @param  {[type]} obj   [description]
 * @param  {[string]} key   [description]
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
function setEmptyProperty (obj, key, value) {
  if (!obj.hasOwnProperty(key)) {
    obj[key] = value
  }
  return obj[key]
}


/**
 * 按照模型从origin中得到新对象
 * @param  {[object]} scheme [模板]
 *              {type, default}
 * @param  {[object]} origin [数据源]
 * @return {[object]}        [description]
 */
function schemeToObj (scheme, origin) {
  let obj = Object.entries(scheme).reduce((res, [key, value]) => {
    if (value instanceof Object) {
      if (!value.type && !value.default) {
        res[key] = schemeToObj(value, origin[key] || {})
      } else {
        res[key] = origin[key] ? origin[key] : value.default
      }
    } else {
      throw new Error(`${key} is invalid`)
    }
    return res
  }, {})
  return obj
}

/**
 * 合并真值
 * @param  {[type]} a   [description]
 * @param  {Object} obj [description]
 * @return {[type]}     [description]
 */
function mergeTrueField (a, obj = {}) {
  // if (a)
  // return Object.assign({}, a, b)
  // let obj = a
  if (!(obj instanceof Object)) {
    throw new Error('obj is invalid')
  }
  for (let [key, value] of Object.entries(a)) {
    if (value instanceof Object) {
      obj[key] = mergeTrueField(a)
    } else {
      if (obj.hasOwnProperty(key)) {
        if (value) {
          obj[key] = value
        }
      } else {
        obj[key] = value
      }
    }
  }
  return obj
}