// 未开发完
// const utils = require('./lib/utils')
const tokenSDKServer = require('./index.js')
const byteCode = require('bytecode')
// const md5 = require('md5')
const fs = require('fs')
// const Base64 = require('js-base64').Base64
var multer = require('multer')
const path = require('path')

const rootPath = 'tokenSDKData'
let {didttm} = require('../../tokenSDKData/privateConfig.js')

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

// let getPvData = function (didttm, idpwd) {
//   return tokenSDKServer.getPvData(did)
// }

// 私有方法 start
// str => hexStr
let decode = (str) => {
  return '0x' + tokenSDKServer.utils.arrToHexStr(byteCode.decode(str))
}
// hexStr => str
let encode = (hexStr) => {
  hexStr = hexStr.indexOf('0x') === 0 ? hexStr.slice(2) : hexStr
  let arr = []
  for (var i = 0, iLen = hexStr.length; i < iLen; i+=2) {
    arr.push(parseInt(hexStr.slice(i, i+2), 16))
  }
  return byteCode.encode(arr)
}
// 私有方法 end



// 解密ditttm.data
let decryptDidttmData = (ct, idpwd, {hashKey = true}) => {
  ct = tokenSDKServer.utils.hexStrToArr(ct)
  let mt = tokenSDKServer.sm4.decrypt(ct, idpwd, {hashKey: hashKey})
  return mt
  // return encode(mt)
}
// 加密ditttm.data
let encryptDidttmData = (mt, idpwd, {hashKey = true}) => {
  // mt = decode(mt)
  let ct = tokenSDKServer.sm4.encrypt(mt, idpwd, {hashKey: hashKey})
  // return decode(tokenSDKServer.utils.arrToHexStr(ct))
  return '0x' + tokenSDKServer.utils.arrToHexStr(ct)
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
  let ct = didttm.data
  let priStr = ''
  if (issm) {
    console.log('didttm不是用sm4加密的。')
    priStr = ''
  } else {
    priStr = decryptDidttmData(ct, idpwd, {}) // 可以正确运行
  }
  return {
    nickname: didttm.nickname,
    did: didttm.did,
    data: priStr
  }
}

/**
 * 加密didttm。可用于导出didttm.
 * @param  {string} nickname 昵称
 * @param  {string} did      did
 * @param  {string} priStr   私钥字符串
 * @param  {string} idpwd    身份密码
 * @return {object}          didttm {
                                nickname: // 昵称
                                did // did
                                data // 私钥字符串
 *                           }
 */
let encryptDidttm = function (nickname, did, priStr, idpwd) {
  return {
    nickname: nickname,
    did: did,
    data: encryptDidttmData(priStr, idpwd, {})
  }
}

/**
 * 从didttm内容中取出priStr
 * @param  {string / object}  didttmStr didttm的密文内容
 * @param  {[type]}  idpwd              身份密码
 * @param  {Boolean} issm               是否使用国密解密
 * @return {string}                     私钥字符串
 */
let didttmToPriStr = function (didttmStr, idpwd, issm = false) {
  let mt = decryptDidttm(didttmStr, idpwd, issm)
  // console.log('q4qw3ert', mt)
  return JSON.parse(mt.data).prikey
}

/**
 * 加密pvdata
 * @param  {string} pvDataStr pvdata的明文字符串
 * @param  {string} priStr    密码
 * @return {hexstr}           密文。十六进制字符串
 */
let encryptPvData = function (pvDataStr, priStr) {
  if (typeof pvDataStr !== 'string') {
    pvDataStr = JSON.stringify(pvDataStr)
  }
  pvDataStr = decode(pvDataStr)
  priStr = priStr.indexOf('0x') === 0 ? priStr.slice(2) : priStr
  let ct = tokenSDKServer.sm4.encrypt(pvDataStr, priStr, {hashKey: true})
  ct = tokenSDKServer.utils.arrToHexStr(ct)
  return '0x' + ct
}

/**
 * 解密pvData
 * @param  {hexStr} pvdataCt pvdata的密文
 * @param  {string} priStr   密码
 * @return {string}          pvdata的明文
 */
let decryptPvData = function (pvdataCt, priStr) {
  priStr = priStr.indexOf('0x') === 0 ? priStr.slice(2) : priStr
  let ct = tokenSDKServer.utils.hexStrToArr(pvdataCt)
  let mt = tokenSDKServer.sm4.decrypt(ct, priStr, {hashKey: true})
  return encode(mt)
}

/**
 * 在pvdata.certifies里添加签发过的证书
 * @param  {string / object} pvdata         pvdata的明文
 * @param  {object}          claimData     证书的数据
 * @param  {object}          templateData  证书的模板数据
 * @return {object}                        添加证书项后的pvdata
 */
let certifiesAddSignItem = function (pvdata, claimData, templateData) {
  if (typeof pvdata === 'string') {
    pvdata = JSON.parse(pvdata)
  }
  if (!pvdata.certifies) {
    pvdata.certifies= []
  }
  let keys = {}
  for (let key of Object.keys(templateData.keys)) {
    keys[key] = claimData[key] || templateData.keys[key].value
  }
  pvdata.certifies.push({
    id: claimData.id,
    templateId: claimData.templateId,
    templateTitle: templateData.title,
    createTime: claimData.createTime || '',
    type: claimData.type,
    desc: templateData.desc,
    keys: keys
  })
  return pvdata
}

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
    let privStr = keys.indexOf('0x') === 0 ? keys.slice(2) : keys
    let privBytes = Buffer.from(privStr, 'hex')
    let msgBytes = tokenSDKServer.keccak256(Buffer.from(msg, 'utf8'))
    return tokenSDKServer.ecsign(msgBytes, privBytes)
  }
}
// let verify = function ({keys, msg, sign}, issm = false) {
let verify = function ({keys, msg, sign}, options = {issm: false, chainId: undefined}) {
  if (options.issm) {
    if (keys instanceof tokenSDKServer.sm2.SM2KeyPair) {
      return keys.verify512(msg, sign.r, sign.s)
    } else {
      return new Error('keys不是SM2KeyPair的实例')
    }
  } else {
    if (typeof sign === 'string') {
      sign = sign.indexOf('0x') === 0 ? sign.slice(2) : sign
      sign = {
        // r: sign.slice(0, 64),
        // s: sign.slice(64, -2),
        // v: sign.slice(-2)
        r: Buffer.from(sign.slice(0, 64), 'hex'),
        s: Buffer.from(sign.slice(64, -2), 'hex'),
        // v: Number(sign.slice(-2))
        // v: 0
        v: options.chainId ? Number(sign.slice(-2)) : 27 // 只有27、28可以通过验签
      }
    }
    // console.log(sign)
    // if (sign.v && sign.r && sign.s) {
    if (sign.r && sign.s) {
      return tokenSDKServer.isValidSignature(sign.v, sign.r, sign.s)
    } else {
      return new Error('参数sign不完整')
    }
  }
}

// 执行keccak256散列
let hashKeccak256 = (msg, format = 'hex') => {
  let hash = new tokenSDKServer.Keccak(256)
  let msgs = []
  if (typeof msg === 'string') {
    msgs.push(msg)
  }
  for (let i = 0, iLen = msgs.length; i < iLen; i++) {
    hash.update(msgs[i])
  }
  let hashStr = hash.digest(format)
  hash.reset()
  return hashStr
}

// 递归删除path下的所有文件
let emptyDir = (path) => {
  // let a = fs.accessSync(path)
  // if (!a) {return true}
  try {
    fs.accessSync(path)
    var files = fs.readdirSync(path)
    files.forEach((file) => {
      var state = fs.statSync(`${path}/${file}`)
      if (state.isDirectory()) {
        emptyDir(`${path}/${file}`)
      } else {
        fs.unlinkSync(`${path}/${file}`)
      }
    })
  } catch (e) {
    return false
  }
}
// 递归删除path下的所有空目录
let rmEmptyDir = (path) => {
  try {
    fs.accessSync(path)
    let files = fs.readdirSync(path)
    if (files.length > 0) {
      var tempFile = 0
      files.forEach((file) => {
        tempFile++
        rmEmptyDir(`${path}/${file}`)
      })
      if (tempFile == files.length) {
        fs.rmdirSync(path)
      }
    } else {
      fs.rmdirSync(path)
    }
  } catch (e) {
    return false
  }
}

/**
 * 初始化sdk
 * @param  {function}  options.openfn       [当open时触发的方法]
 * @param  {function}  options.messagefn    [当message时触发的方法]
 * @param  {function}  options.errorfn      [当error时触发的方法]
 * @param  {function}  options.closefn      [当close时触发的方法]
 * @param  {number}    options.reConnectGap [从链接的时间间隔]
 * @param  {Boolean}   options.isProd        [description]
 * @return {[type]}                       [description]
 */
let init = ({openfn = null, messagefn = null, errorfn = null, closefn = null, reConnectGap = null, isProd = false}) => {
  // 检查参数
  if (openfn !== null) {
    if (typeof(openfn) !== 'function') {
      throw new Error('openfn not is function')
    }
  }
  if (messagefn !== null) {
    if (typeof(messagefn) !== 'function') {
      throw new Error('messagefn not is function')
    }
  }
  if (errorfn !== null) {
    if (typeof(errorfn) !== 'function') {
      throw new Error('errorfn not is function')
    }
  }
  if (closefn !== null) {
    if (typeof(closefn) !== 'function') {
      throw new Error('closefn not is function')
    }
  }
  if (reConnectGap) {
    if (typeof(reConnectGap) === 'number') {
      throw new Error('reConnectGap not is number')
    }
  }
  tokenSDKServer.wsc({openfn, messagefn, errorfn, closefn, reConnectGap, isProd})
  // console.log()
}

// let config = function (didttm = '', idpwd = '', cb) {
/**
 * 配置sdk需要的环境。
 * 先删除tokenSDKData下的所有目录，再创建新的目录结构。没有文件。
 * path是配置文件的路径
 * @param  {[type]} configPath [description]
 */
let config = function (configPath) {
  if (!configPath) {
    throw new Error('config file path is error')
  }
  configPath = path.relative(__dirname, configPath)
  // console.log(configPath)
  let {didttm, idpwd} = require(configPath)
  // console.log(didttm, idpwd)
  // 删除旧数据。
  emptyDir(`${rootPath}`)
  rmEmptyDir(`${rootPath}`)
  // 创建新数据。
  fs.mkdirSync(`${rootPath}`)
  // fs.mkdirSync(`${rootPath}/businessLicense`) // 不需要保存营业执照的图片了。
  let pcStr = ''
  if (didttm && idpwd) {
    let dtStr = '{'
    for (let key of Object.keys(didttm)) {
      dtStr += `"${key}":"${didttm[key]}",`
    }
    dtStr = dtStr.slice(0, -1)
    dtStr += '}'
    pcStr = `let didttm = ${dtStr}\nlet idpwd = '${idpwd}'\nmodule.exports = {didttm, idpwd}`
  }
  fs.writeFileSync(`${rootPath}/privateConfig.js`, pcStr)
  fs.writeFileSync(`${rootPath}/pvdataCt.txt`, '')
}

// 设置didttm
let setDidttm = (didttm, idpwd) => {
  let didttmStr = ''
  if (typeof didttm !== 'string') {
    didttmStr = JSON.stringify(didttm)
  } else {
    didttmStr = didttm
  }
  let data = `let didttm = ${didttmStr}\nlet idpwd = '${idpwd}'\nmodule.exports = {didttm, idpwd}`
  fs.writeFileSync(`${rootPath}/privateConfig.js`, data)
}
// 取得didttm
// 因绝对路径的问题，造成取数据出错。
// let getDidttm = (didttm, idpwd) => {
//   let privateConfig = require(`${rootPath}/privateConfig.js`)
//   return privateConfig.didttm
// }

// 在本地保存pvdataCt
let localSavePvdata = (pvdataCt, priStr, claim_sn, ocrData, filePath, backup = false) => {
  let mt = decryptPvData(pvdataCt, priStr)
  let pvdata = JSON.parse(mt)
  // console.log('pvdata解密后', pvdata)
  if (!pvdata.pendingTask) {
    pvdata.pendingTask = []
  }
  if (typeof ocrData === 'string') {
    ocrData = JSON.parse(ocrData)
  }
  let obj = {
    id: claim_sn,
    ocrData: ocrData,
    filePath: filePath,
    isPersonCheck: false,
    isPdidCheck: false
  }
  pvdata.pendingTask.push(obj)
  // console.log('添加数的后', pvdata)

  let ct = encryptPvData(pvdata, priStr)
  // console.log('ct', ct)
  fs.writeFileSync(`${rootPath}/pvdataCt.txt`, ct)
  if (backup) {
    // 备份到远端
    console.log('备份到远端')
  }
}

// 设置未完成签发的证书。
// 即：待签发的证书
let setCertifyUnfinish = function (req) {
  console.log('req', req)
  // let certify = {}
  // pvdata.certifies.unfinish.push(certify)
}
let getCertifyUnfinish = function () {
  // 从pvdata.certifies里取出未签发的证书
}

let accessSign = (claim_sn) => {
  return false
}
let accessPendding = (claim_sn) => {
  return false
}

// 从远端拉取数据
let pullData = (key, needHask = true) => {
  if (needHask) {
    key = hashKeccak256(key)
  }
  return tokenSDKServer.instance({
    url: '',
    method: 'post',
    data: {
      jsonrpc: '2.0',
      method: 'dp_getDepository',
      params: [key],
      id: 1
    }
  })
}

// 备份数据
// 把数据推到远端
// 未完成
let pushData = (did, type, ct, {priStr, phone, parent_did}) => {
  let key = ''
  let backupType = ''
  console.log(key, backupType)
  switch (type) {
    case 'didttmPhone':
      key = hashKeccak256(`${did}with${phone}`)
      backupType = 'didttm'
      break
    case 'didttmParentDid':
      key = hashKeccak256(`${did}with${parent_did}`)
      backupType = 'didttm'
      break
    case 'pvdata':
      key = hashKeccak256(`${did}`)
      backupType = 'pvdata'
      break
    case 'bigdata':
      key = hashKeccak256(`${did}with${ct}`)
      backupType = 'bigdata'
      break
    case 'pic':
      key = hashKeccak256(`${did}with businessLicense`)
      backupType = 'bigdata'
      break
    case 'parentDidCheck':
      key = hashKeccak256(`${did}go to check businessLicense`)
      backupType = 'bigdata'
      break
    default:
      throw new Error(`不支持type=${type}`)
      break
  }
  console.log(key, backupType)
  let signObj = `update backup file${ct}for${did}with${key}type${type}`
  let signData = sign({keys: priStr || key, msg: signObj})
  let signStr = `0x${signData.r.toString('hex')}${signData.s.toString('hex')}00`
  return tokenSDKServer.backupData(did, key, backupType, ct, signStr)
}

// 备份临时数据
// 可以用于稍息保存
// 未完成
let pushBackupData = function (did, claim_sn, backupData, expire, {needEncrypt = false, prikey = '', needSign = false, signStr = ''}) {
  if (needEncrypt) {
    backupData = encryptPvData(backupData, priStr)
  }
  if (needSign) {
    if (!prikey) {throw new Error('prikey不能为空')}
    let signData = sign({keys: prikey, msg: backupData})
    signStr = `0x${signData.r.toString('hex')}${signData.s.toString('hex')}${String(signData.v).length >= 2 ? String(signData.v) : '0'+String(signData.v)}`
  }
  return tokenSDKServer.setTemporaryCertifyData(did, claim_sn, backupData, expire, signStr)
}

/**
 * 生成用于渲染绑定did的qr
 * @param  {[array]} reqUserInfoKeys [需要用户提供的数据]
 * @param  {String} reqUserLevel    [description]
 * @param  {String} sessionId    [description]
 * @param  {String} title    [description]
 * @return {[string]}          [指定格式的字符串]
 */
let genBindQrStr = (reqUserInfoKeys, reqUserLevel, sessionId, title = '') => {
  if (!(reqUserInfoKeys instanceof Array)) {
    throw new Error('reqUserInfoKeys not is Array')
  }
  if (['N', 'R', 'M'].indexOf(reqUserLevel) < 0) {
    throw new Error('reqUserLevel 只能是N | R | M')
  }
  if (!sessionId) {
    throw new Error('sessionId is invalid')
  }
  return JSON.stringify({
    method: 'bind',
    content: {
      type: 'bindRequest',
      title: title,
      sessionId: sessionId,
      reqUserLevel: reqUserLevel,
      reqUserInfoKeys: reqUserInfoKeys,
    },
    sender: didttm.did
  })
}

module.exports = Object.assign(
  {},
  tokenSDKServer,
  {
    // test2,
    // encryptDidttmData,
    decryptDidttm,
    encryptDidttm,
    didttmToPriStr,
    encryptPvData,
    decryptPvData,
    certifiesAddSignItem,
    genKeyPair,
    encrypt,
    decrypt,
    sign,
    verify,
    hashKeccak256,
    init,
    config,
    setDidttm,
    // getDidttm,
    localSavePvdata,
    setCertifyUnfinish,
    getCertifyUnfinish,
    accessSign,
    accessPendding,
    pullData,
    // pushData,
    pushBackupData,
    genBindQrStr
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
// }




// // 使用上传存证副本的接口备份odid身份认证的数据
// let d = new Date()
// let {didttm, idpwd} = require('../tokenSDKData/privateConfig.js')//.didttm.did
// let priStr = JSON.parse(tokenSDKServer.decryptDidttm(didttm, idpwd).data).prikey // 0xcf0fbbdac3353253cec457a81a560d916bfb229a710774747e29f0ff1c1daa59
// // console.log('priStr', priStr)
// // d.setFullYear(2120)
// let claim_sn = '0xdacb1e1063c5f46195f04f79624dd19c6968a2b7b4e844b646b4c540c5d2a3fa',
//   did = 'did:ttm:a0e01cb27c8e5160a907b1373f083af3d2eb64fd8ee9800998ecf8427eab11',
//   certifyData = '0x3b9084e5704b949a1d4a1989e5dae6db3af54af07bafdacd69f386eca82e2adf67f8e1b3ad5bab5e90913f6e676b65bab1554d0a2cfdfabfe1b91e043fa254d928',
//   expire = d.setFullYear(2120), // 4750482080395
//   signData = tokenSDKServer.sign({keys: priStr, msg: `did=${did},claim_sn=${claim_sn},certifyData=${certifyData},expire=${expire}`})
// let signStr = `0x${signData.r.toString('hex')}${signData.s.toString('hex')}${String(signData.v).length >= 2 ? String(signData.v) : '0'+String(signData.v)}`
// // console.log('expire', expire) // true
// // console.log('签名结果：', signStr) // true
//   // console.log(s)
//   isok = tokenSDKServer.verify({sign: signData})
//   // console.log('自己验签结果：', isok) // true
// tokenSDKServer.setTemporaryCertifyData(did, claim_sn, certifyData, expire, signStr).then(response => {
//   // console.log(response.config)
//   console.log(response.data)
// }).catch(error => {
//   console.log(error)
// // })