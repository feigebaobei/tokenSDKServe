// 未开发完
// const utils = require('./lib/utils')
const tokenSDKServer = require('./index.js')
// const md5 = require('md5')
// const fs = require('fs')

// 服务端的功能包括：
// 1. 申请证书。
// 2. 请求保存证书临时数据。
// 3. 请求证书临时数据。
// 4. 生成签发证书的url.
// 5. 取消证书。
// 6. 生成海报页面的数据。
// 7. 签发证书。
// 8. 接收需要签发的证书。
// 9. 导入didttm.
// 10. 请求并保存pvdata.

/**
tokenSDKServer:
{
  main: [Function: main],
  test0: [Function: test0],
  test1: [Function: test1],
  test2: [Function: test2],
  fn: [Function: fn],
  getPubByDid: [Function: getPubByDid],
  shajs: [Function: SHA] {
    sha: [Function: Sha],
    sha1: [Function: Sha1],
    sha224: [Function: Sha224],
    sha256: [Function: Sha256],
    sha384: [Function: Sha384],
    sha512: [Function: Sha512]
  },
  sm2: {
    curve: SM2Curve {
      type: 'short',
      p: [BN],
      red: [Mont],
      zero: [BN],
      one: [BN],
      two: [BN],
      n: [BN],
      g: [Point],
      _wnafT1: [Array],
      _wnafT2: [Array],
      _wnafT3: [Array],
      _wnafT4: [Array],
      _bitLength: 256,
      _maxwellTrick: true,
      redN: [BN],
      a: [BN],
      b: [BN],
      tinv: [BN],
      zeroA: false,
      threeA: true,
      endo: undefined,
      _endoWnafT1: [Array],
      _endoWnafT2: [Array]
    },
    SM2KeyPair: [Function: SM2KeyPair],
    genKeyPair: [Function: _genKeyPair]
  },
  sm3: [Function: SM3],
  sm4: { encrypt: [Function: encrypt], decrypt: [Function: decrypt] },
  SHA3: [Function: Hash] { SHA3Hash: [Function: Hash] },
  Keccak: [Function: Hash],
  SHAKE: [Function: Hash],
  ecsign: [Function],
  isValidSignature: [Function],
  keccak256: [Function],
  signEcdsa: [Function: signEcdsa],
  verifySignEcdsa: [Function: verifySignEcdsa],
  getKeyStore: [Function: getKeyStore],
  encryptDidttm: [Function: encryptDidttm],
  decryptDidttm: [Function: decryptDidttm],
  getPvData: [Function: getPvData],
  decryptPvData: [Function: decryptPvData],
  getDidList: [Function: getDidList],
  getCheckCode: [Function: getCheckCode],
  bytesToStrHex: [Function: bytesToStrHex],
  setTemporaryCertifyData: [Function: setTemporaryCertifyData],
  getTemporaryCertifyData: [Function: getTemporaryCertifyData],
  createIdCertify: [Function: createIdCertify],
  getTemplate: [Function: getTemplate],
  getTemplateList: [Function: getTemplateList],
  validateIdCertify: [Function: validateIdCertify],
  cancelIdCertify: [Function: cancelIdCertify],
  getCertifyFingerPrint: [Function: getCertifyFingerPrint],
  certifySignUrl: [Function: certifySignUrl],
  validateCommonCertify: [Function: validateCommonCertify],
  checkCommonCertify: [Function: checkCommonCertify],
  cancelCheckCommonCertify: [Function: cancelCheckCommonCertify],
  cancelCertify: [Function: cancelCertify],
  signCertify: [Function: signCertify],
  applyCertify: [Function: applyCertify],
  checkHashValue: [Function: checkHashValue],
  utils: {
    strToBytes: [Function: strToBytes],
    hashToBN: [Function: hashToBN],
    random: [Function: random],
    padStart: [Function: padStart],
    asciiToStr: [Function: asciiToStr],
    ascii16ToStr: [Function: ascii16ToStr],
    strToAscii: [Function: strToAscii],
    bnSetBytesStr: [Function: bnSetBytesStr],
    bnSetBytesArr: [Function: bnSetBytesArr],
    bytesToStrHex: [Function: bytesToStrHex],
    strHexToBytes: [Function: strHexToBytes],
    randomArr: [Function: randomArr],
    hexStrToArr: [Function: hexStrToArr],
    arrToHexStr: [Function: arrToHexStr],
    str16ToArr16: [Function: str16ToArr16]
  }
}
 */

// console.log(tokenSDKServer)

let getPvData = function (didttm, idpwd) {
  return 
}

/**
 * 解密didttm文件
 * @param  {string} didttmStr didttm文件的内容。它是密文。
 * @param  {strring} idpwd    身份密码。它用于解密didttm.
 * @param  {bool} issm        是否使用国密。
 * @return {object}           json对象格式的明文
 *                             {
 *                               nickname: // 昵称
 *                               did // did
 *                               data // 私钥字符串
 *                             }
 */
let decryptDidttm = function (didttmStr, idpwd, issm = false) {
  let didttm = {}
  if (typeof(didttmStr) !== 'string') {
    didttm = didttmStr
  } else {
    didttm = JSON.parse(didttmStr)
  }
  let ct = ''
  if (!didttm.data.indexOf('0x')) {
    ct = didttm.data.slice(2)
  } else {
    ct = didttm.data
  }
  let priStr = ''
  if (issm) {
    // tokenSDKServer.sm4.decrypt
    priStr = 'didttm不是用sm4加密的。'
  } else {
    priStr = tokenSDKServer.sm4.decrypt(tokenSDKServer.utils.hexStrToArr(ct), idpwd)
  }
  return {
    nickname: didttm.nickname,
    did: didttm.did,
    data: priStr
  }
}

/**
 * 加密didttm文件
 * @param  {[type]} mt  [description]
 * @param  {[type]} key [description]
 * @return {[type]}     [description]
 */
let encryptDidttm = function (nickname, did, priStr, key) {
  return {
    nickname: nickname,
    did: did,
    data: '0x' + tokenSDKServer.utils.arrToHexStr(tokenSDKServer.sm4.encrypt(priStr, key))
  }
}
let priStrFromDidttm = function (didttmStr, idpwd, issm = false) {
  let mt = decryptDidttm(didttmStr, idpwd, issm)
  return JSON.parse(mt.data).prikey
}
// let decryptPvData = function (ctPvData, priStr) {
//   return {}
// }

let genKeyPair = function (priStr, issm = false) {
  if (issm) {
    return tokenSDKServer.sm2.genKeyPair(priStr)
  } else {
    return '暂时未开通ecdsa生成密钥对的方法'
  }
}
let encrypt = function (keys, data, issm = false) {
  if (issm) {
    return keys.encrypt(data)
  } else {
    return '暂时未开通ecdsa的加密方法'
  }
}
let decrypt = function (keys, data, issm = false) {
  if (issm) {
    return keys.decrypt(data)
  } else {
    return '暂时未开通ecdsa的解密方法'
  }
}
let sign = function ({keys, msg}, issm = false) {
  if (issm) {
    if (keys instanceof tokenSDKServer.sm2.SM2KeyPair) {
      return keys.signSha512(msg)
    } else {
      return new Error('keys不是SM2KeyPair的实例')
    }
  } else {
    if (typeof keys !== 'string') {
      return new Error('keys不是字符串型')
    }
    // console.log(keys, msg)
    let privStr = keys.indexOf('0x') === 0 ? keys.slice(2) : keys
    let privBytes = Buffer.from(privStr, 'hex')
    let msgBytes = tokenSDKServer.keccak256(Buffer.from(msg, 'utf8'))
    console.log(privBytes, msgBytes)
    return tokenSDKServer.ecsign(msgBytes, privBytes)
  }
}
let verify = function ({keys, msg, sign}, issm = false) {
  if (issm) {
    if (keys instanceof tokenSDKServer.sm2.SM2KeyPair) {
      return keys.verify512(msg, sign.r, sign.s)
    } else {
      return new Error('keys不是SM2KeyPair的实例')
    }
  } else {
    if (sign.v && sign.r && sign.s) {
      return tokenSDKServer.isValidSignature(sign.v, sign.r, sign.s)
    } else {
      return new Error('参数sign不完整')
    }
  }
}


module.exports = Object.assign(
  {},
  tokenSDKServer,
  {
    decryptDidttm,
    encryptDidttm,
    priStrFromDidttm,
    genKeyPair,
    encrypt,
    decrypt,
    sign,
    verify
  }
)
// module.exports = {
//   // test0
//   // test0: 'str'
//   decryptDidttm,
//   encryptDidttm,
//   utils:tokenSDKServer.utils
// }

// // export default {
// //   utils
// // }