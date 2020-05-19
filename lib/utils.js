/**
 * Utils for SM2 and SM3 module
 */

var utils = exports
// var BN = require('bn.js');
var BN = require('./bn.js');
var crypto = require('crypto');

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
utils.bytesToStrHex = bytesToStrHex;
utils.strHexToBytes = strHexToBytes;
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
 * 把byte型的数据 => 16进制的字符串
 * @param  {[type]} arr [description]
 * @return {[type]}     [description]
 */
function bytesToStrHex(arr) {
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
 * 把16进制的字符串 => byte型的数据
 * @param  {string} str [description]
 * @return {[type]}     [description]
 */
function strHexToBytes(str) {
  var arr = []
  for (var i = 0; i < str.length; i=i+2) {
    arr.push(parseInt(str.slice(i, i+2), 16))
  }
  return arr
}

// 该内容是李晓聃开发的 end