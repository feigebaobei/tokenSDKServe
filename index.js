// token-sdk-server
// const sm = require('./lib/sm.js')
const sm = require('./lib/index.js')
// const axios = require('axios')
// const sm4 = require('sm-crypto').sm4;
// const sm4 = require('gm-crypt').sm4;
const sm4 = require('./lib/sm4.js'); // 专为与go协同工作编写的sm4.它在加密、解密时都会分成2部分处理。
// import instance from './lib/instanceAxios'
// import utils from './lib/utils'
const {instance} = require('./lib/instanceAxios')
const utils = require('./lib/utils')
const {wsc} = require('./lib/websocket.js')
const shajs = require('sha.js')
const {SHA3, Keccak, SHAKE} = require('sha3') // 使用外部引入的
// const insta
// import {Base64} from 'js-base64'
const Base64 = require('js-base64').Base64
// const md5 = require('md5')
const { ecsign, isValidSignature, keccak256 } = require('ethereumjs-util')

var hashStr = 'c888c9ce9e098d5864d3ded6ebcc140a12142263bace3a23a36f9905f12bd64a' // 与go代码里一样的字符串
var priStr = '55c974f17a0b44178d982dcd478150b8a4c0f206f397d7880d06bf5a72932b81'
var sm2 = sm.sm2
var sm3 = sm.sm3

// main()
function main() {
  console.log('start main')
  test0()
  test1()
  test2()
}

// 使用指定的私钥
function test0() {
  var keyesDefine = sm2.genKeyPair(priStr)
  var ct = keyesDefine.encrypt(hashStr)
  console.log('ct:', ct, `[${ct.join(', ')}]`)
  // ct: [246, 106, 106, 40, 249, 239, 104, 205, 94, 25, 74, 123, 117, 222, 186, 157, 161, 54, 72, 5, 161, 55, 231, 22, 35, 1, 41, 120, 226, 18, 197, 95, 143, 44, 190, 238, 171, 248, 247, 163, 91, 234, 30, 56, 158, 201, 3, 172, 214, 151, 42, 167, 104, 91, 90, 12, 34, 99, 41, 73, 16, 156, 197, 27, 253, 36, 73, 156, 146, 2, 200, 250, 44, 127, 17, 67, 162, 208, 186, 195, 225, 179, 163, 180, 116, 102, 126, 226, 35, 154, 39, 58, 206, 129, 255, 188, 61, 178, 253, 3, 203, 218, 136, 187, 226, 146, 186, 169, 2, 171, 209, 211, 186, 73, 67, 86, 61, 69, 97, 52, 88, 225, 75, 208, 231, 225, 45, 118, 46, 15, 250, 16, 193, 84, 3, 152, 135, 81, 63, 19, 170, 94, 178, 101, 148, 187, 41, 86, 30, 219, 31, 72, 230, 44, 144, 144, 155, 171, 205, 173]
  var mt = keyesDefine.decrypt(ct)
  console.log('mt:', `[${mt.join(', ')}]`)
  // mt: [99, 56, 56, 56, 99, 57, 99, 101, 57, 101, 48, 57, 56, 100, 53, 56, 54, 52, 100, 51, 100, 101, 100, 54, 101, 98, 99, 99, 49, 52, 48, 97, 49, 50, 49, 52, 50, 50, 54, 51, 98, 97, 99, 101, 51, 97, 50, 51, 97, 51, 54, 102, 57, 57, 48, 53, 102, 49, 50, 98, 100, 54, 52, 97]
  var signData = keyesDefine.signSha512(hashStr)
  console.log('signData:', signData)
  // signData: {r: "4e403f48d144c3077ea0cc2070535a9d9ccad580459b735f9c988b6f64851000", s: "6db31e8b77902d72417b4593b9e3734cb8f10389ce3382774d75b0d3a317b8a4"}
  var isok = keyesDefine.verify512(hashStr, signData.r, signData.s)
  console.log('isok:', isok)
  // isok: true
}

// 使用自动生成的私钥
function test1() {
  console.log('start test1')
  var keyesAuto = sm2.genKeyPair()
  console.log('keyesAuto', keyesAuto)
  var ct = keyesAuto.encrypt(hashStr)
  console.log('ct', ct)
  // console.log('ct:', `[${ct.join(', ')}]`)
  // // ct: [246, 106, 106, 40, 249, 239, 104, 205, 94, 25, 74, 123, 117, 222, 186, 157, 161, 54, 72, 5, 161, 55, 231, 22, 35, 1, 41, 120, 226, 18, 197, 95, 143, 44, 190, 238, 171, 248, 247, 163, 91, 234, 30, 56, 158, 201, 3, 172, 214, 151, 42, 167, 104, 91, 90, 12, 34, 99, 41, 73, 16, 156, 197, 27, 253, 36, 73, 156, 146, 2, 200, 250, 44, 127, 17, 67, 162, 208, 186, 195, 225, 179, 163, 180, 116, 102, 126, 226, 35, 154, 39, 58, 206, 129, 255, 188, 61, 178, 253, 3, 203, 218, 136, 187, 226, 146, 186, 169, 2, 171, 209, 211, 186, 73, 67, 86, 61, 69, 97, 52, 88, 225, 75, 208, 231, 225, 45, 118, 46, 15, 250, 16, 193, 84, 3, 152, 135, 81, 63, 19, 170, 94, 178, 101, 148, 187, 41, 86, 30, 219, 31, 72, 230, 44, 144, 144, 155, 171, 205, 173]
  // var mt = keyesAuto.decrypt(ct)
  // console.log('mt:', `[${mt.join(', ')}]`)
  // // mt: [99, 56, 56, 56, 99, 57, 99, 101, 57, 101, 48, 57, 56, 100, 53, 56, 54, 52, 100, 51, 100, 101, 100, 54, 101, 98, 99, 99, 49, 52, 48, 97, 49, 50, 49, 52, 50, 50, 54, 51, 98, 97, 99, 101, 51, 97, 50, 51, 97, 51, 54, 102, 57, 57, 48, 53, 102, 49, 50, 98, 100, 54, 52, 97]
  // var signData = keyesAuto.signSha512(hashStr)
  // console.log('signData:', signData)
  // // signData: {r: "8fa4acb8ed782e0aadd2a03c49ab60abe3a1ad625c17f7207294762dbdcf63bd", s: "a1899998f6d57b6e9eb7c133f07032a910c5acf0b53c58b2cccd0755ff78afed"}
  // var isok = keyesAuto.verify512(hashStr, signData.r, signData.s)
  // console.log('isok:', isok)
  // // isok: true
}

// 使用原版sm2.js的方法
function test2() {
  var keys = sm2.genKeyPair()
  var sign = keys.sign(hashStr)
  console.log('sign:', sign)
  // sign: {r: "64590e43b91e7a6c1249c9f3e19cb1f84e9fe56160d9f502a764e856193c9336", s: "2063cb56b981581a333b11ade303106c6c388a86955a01915ee5e6cfcba8faab"}
  var isok = keys.verify(hashStr, sign.r, sign.s)
  console.log('isok:', isok)
  // isok: true
  var ct = keys.encrypt(hashStr)
  console.log('ct:', `[${ct.join(', ')}]`)
  var mt = keys.decrypt(ct)
  // console.log('mt:', `[${mt.join(', ')}]`)
  console.log('mt', mt)
}

/**
 * 用于测试的方法
 * @return {Function} [description]
 */
function fn () {
  console.log('welcome to here')
}

/**
 * 返回替换后的证书内容
 * @param  {[type]} desc [description]
 * @param  {[type]} data [description]
 * @return {[string]}      [description]
 */
// function replaceCont (desc, data) {
//   for (let [key, value] of Object.entries(data)) {
//     let reg = `\\$${key}\\$`
//     desc.replace(reg, value)
//   }
//   return desc
// }

/**
 * 使用did请求公钥
 * @param  {string} did [description]
 * @return {promise}     [description]
 */
function getPubByDid (did) {
  let reqBody = {
    "jsonrpc":"2.0",
    "method":"did_getPubkeyByDid",
    "params":[
      // "did:ttm:u0ece7b787c097d55b87d4c01efae0fbe6a27b10cec8a67847c68f0482a8dc"
    ],
    "id":1
  }
  reqBody.params.push(did)
  return instance.get(did, {params: reqBody})
}

/**
 * 生成密钥对
 * @param  {[type]} priStr [description]
 * @return {[type]}        [description]
 */
// function genKey(priStr) {
//   var keys = sm2.genKeyPair(priStr)
//   console.log('keys', keys.pri.toString(16), keys.pub.x.toString(16), keys.pub.y.toString(16))
//   var ct = keys.encrypt(hashStr)
//   console.log('ct', ct)
//   var mt = keys.decrypt(ct)
//   console.log('mt:', `[${mt.join(', ')}]`)
//   return ct
// }


/**
 * 获得keystore
 * @return {[type]} [description]
 */
function getKeyStore (did) {
  let url = '/did/keystore/' // + did
  // console.log('url', url)
  return instance({
    // url: `/did/keystore/${Base64.encode(did).substr(0, 8)}`,
    // url: `/did/keystore/${Base64.encode(did)}`,
    // url: `/did/keystore/${did}`,
    url: url,
    method: 'get',
    params: {
      did: did
    }
  })
}
/**
 * 加密didttm
 * @param  {[type]} mtStr [description]
 * @param  {[type]} key   [description]
 * @return {str}       [description]
 */
function encryptDidttm (nickName, did, mtStr, key) {
  if (typeof(mtStr) !== 'string') {
    throw new Error('参数不是字符串')
  }
  key = 'JeF8U9wHFOMfs2Y8'
  let sm4fn = new this.sm4({
    key: key,
    mode: 'cbc',
    iv: 'UISwD9fW6cFh9SNS',
    cipherType: 'base64'
  })
  let ct = sm4fn.encrypt(mtStr)
  let encode = Base64.encode(ct)
  encode = `${nickName}:${did}:${encode}`
  return encode
}
/**
 * 解密didttm
 * @param  {[type]} ct  [description]
 * @param  {[type]} key [description]
 * @return {[type]}     [description]
 */
function decryptDidttm (didttm, key) {
  let [nickName, did, ct] = didttm.split(':')
  let decode = Base64.decode(ct)
  key = 'JeF8U9wHFOMfs2Y8'
  let sm4fn = new this.sm4({
    key: key, // key
    mode: 'cbc',
    iv: 'UISwD9fW6cFh9SNS',
    cipherType: 'base64'
  })
  return {
    nickName: nickName,
    did: did,
    mt: sm4fn.decrypt(decode)
  }
}
/**
 * 获得pvdata
 * @return {[type]} [description]
 */
function getPvData (did) {
  let hash = new Keccak(256)
  hash.update(did)
  let hashStr = '0x' + hash.digest('hex')
  hash.reset()
  return instance({
    url: '',
    method: 'post',
    data: {
      "jsonrpc":"2.0",
      "method":"dp_getDepository",
      "params":[hashStr],
      "id":1
    }
  })
}
// function setPvData (did, pvdata, sign, priStr, needEncrypt = false) {
function backupData (did, key, type = 'pvdata', pvdataCt, sign) {
  // let hash = new Keccak(256)
  // hash.update(did)
  // let key = '0x' + hash.digest('hex')
  // hash.reset()
  // if (needEncrypt) {
  //   pvdata = '0x' + tokenSDKServer.utils.arrToHexStr(tokenSDKServer.sm4.encrypt(pvdata, priStr))
  // }
  return instance({
    url: '',
    method: 'post',
    data: {
      "jsonrpc":"2.0",
      "method":"dp_setDepository",
      "params":[did, key, type, pvdataCt, sign],
       "id":1
    }
  })
}

/**
 * 解密pvData
 * @param  {array} ct  [description]
 * @param  {[type]} pri [description]
 * @return {[type]}     [description]
 */
function decryptPvData (ct, pri) {
  let keys = null
  if (typeof(pri) === 'string') {
    keys = sm2.genKeyPair(pri)
  } else {
    keys = pri
  }
  var mt = keys.decrypt(ct)
  mt = utils.asciiToStr(mt)
  mt = JSON.parse(mt)
  return mt
}
/**
 * 获得didList
 * @param  {[type]} phone [description]
 * @return {[type]}       [description]
 */
function getDidList (phone) {
  // return instance.get(`/node/udidList`)
  return instance({
    url: '/node/udidList',
    params: {
      phone: phone
    }
  })
}
/**
 * 请求验证码
 * @param  {[type]} phone [description]
 * @return {[type]}       [description]
 */
function getCheckCode (phone) {
  // return instance.get(`/node/vcode/${phone}`)
  return instance({
    url: `/node/vcode`,
    params: {
      phone: phone
    }
  })
}




/**
 * 创建身份证书
 * @return {[type]} [description]
 */
function createIdCertify () {

}
/**
 * 根据证书模板id请求证书模板
 * @param  {[type]} templateId [description]
 * @return {[type]}            [description]
 */
function getTemplate (templateId) {
  // return instance({
  //   url: '/claim/template',
  //   method: 'get',
  //   params: {
  //     templateId: templateId
  //   }
  // })
  return instance({
    url: '',
    method: 'post',
    data: {"jsonrpc":"2.0","method":"ma_getMetainfo","params":[templateId],"id":1}
  })
}
/**
 * 得到证书模板列表
 * @return {[type]} [description]
 */
function getTemplateList (type) {
  return instance({
    url: '',
    method: 'post',
    data: {
      "jsonrpc":"2.0",
      "method":"ma_getMetalist",
      "params":[type],
      "id":1
    }
  })
}
/**
 * 设置模板
 * @param {string} did      udid
 * @param {string} title    模板的名称
 * @param {string} type     模板的类型
 * @param {string} metaCont 模板内容
 * @param {string} sign     sender.sign("did=%s,title=%s,type=%s,metaCont=%s", $did, $title, $type, $metaCont)
 */
function setTemplate (did, title, type, metaCont, sign) {
  return instance({
    url: '',
    method: 'post',
    data: {
      "jsonrpc":"2.0",
      "method":"ma_setMetaContent",
      "params":[did, title, type, metaCont, sign],
       "id":1
    }
  })
  // 模版ID生成规则
  // $templateId=hash($did+$title+$type+$metaCont)
}
/**
 * 验证身份证书
 * @return {[type]} [description]
 */
function validateIdCertify () {}
/**
 * 取消身份证书
 * @return {[type]} [description]
 */
function cancelIdCertify () {}
/**
 * 根据证书id请求链上的证书指纹数据
 * @param  {[type]} claim_sn [description]
 * @return {[type]}          [description]
 */
/**
 * 根据证书id请求链上的证书指纹数据
 * @param  {[type]}  claim_sn    [description]
 * @param  {Boolean} hasSignList 是否需要签名列表
 * @return {[type]}              [description]
 */
function getCertifyFingerPrint (claim_sn, hasSignList = false) {
  // return instance({
  //   url: '/claim/fingerprint',
  //   method: 'get',
  //   params: {
  //     claim_sn: claim_sn
  //   }
  // })
  return instance({
    url: '',
    method: 'post',
    data: {
      "jsonrpc":"2.0",
      "method":"cer_getCertifyById",
      "params":[claim_sn, hasSignList],
      "id":1
    }
  })
}
/**
 * 获取签发证书页面的临时url
 * @param  {[type]} claim_sn    [description]
 * @param  {[type]} templateId  [description]
 * @param  {[type]} certifyData [description]
 * @return {[type]}             [description]
 */
function certifySignUrl (claim_sn, templateId, certifyData) {
  return instance({
    url: '/claim/certifySignUrl',
    method: 'post',
    data: {
      claim_sn: claim_sn,
      templateId: templateId,
      certifyData: certifyData
    }
  })
}
/**
 * 创建通用证书
 * @return {[type]} [description]
 */
// function createCommonCertify (templateId, hashCont, expire, sign) {
// }
/**
 * 验证通用证书
 * @return {[type]} [description]
 */
function validateCommonCertify () {}
/**
 * 核验通用证书
 * @return {[type]} [description]
 */
function checkCommonCertify () {}
/**
 * 取消通用证书
 * @return {[type]} [description]
 */
function cancelCheckCommonCertify () {}
/**
 * 取消证书
 * @param  {[type]} claim_sn [description]
 * @return {[type]}          [description]
 */
function cancelCertify (claim_sn, did, hashCont, endtime, pri) {
  let keys = null
  if (typeof(pri) === 'string') {
    keys = sm2.genKeyPair(pri)
  } else {
    keys = pri
  }
  let sign = keys.signSha512(`${did}cancel${claim_sn}=${hashCont}end at${endtime}`)
  return instance({
    url: '/claim/cancel',
    method: 'put',
    data: {
      did: did,
      claim_sn: claim_sn,
      hashCont: hashCont,
      endtime: endtime,
      sign: sign
    }
  })
}

/**
 * 提交签发
 * @param  {[type]} certifySignUuid [description]
 * @return {[type]}                 [description]
 */
function signCertify(did, claim_sn, name, templateId, hashValue, explain, expire, sign) {
  return instance({
    // url: '/claim/validate',
    url: '',
    method: 'post',
    // data: {
    //   did: did,
    //   claim_sn: claim_sn,
    //   name: name,
    //   templateId: templateId,
    //   hashCont: hashValue,
    //   explain: explain,
    //   expire: expire,
    //   sign: sign
    // }
    data: {
      "jsonrpc":"2.0",
      "method":"cer_validate",
      "params":[did, claim_sn, name, templateId, hashValue, explain, expire, sign],
      "id":1
    }
  })
}
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
 * 保存证书的临时数据
 * @param {[type]} claim_sn    [description]
 * @param {[type]} templateId  [description]
 * @param {[type]} certifyData [description]
 * @param {[type]} expire      [description]
 * @param {[type]} purpose     [description]
 */
// function setTemporaryCertifyData (claim_sn, templateId, certifyData, expire, purpose) {
function setTemporaryCertifyData (did, claim_sn, certifyData, expire, sign) {
  return instance({
    url: '',
    method: 'post',
    data: {
      "jsonrpc":"2.0",
      "method":"cer_setTemporary",
      "params":[did, claim_sn, certifyData, expire, sign],
      "id":1
    }
  })
}
/**
 * 请求证书的临时数据
 * @param  {[type]} temporaryId [description]
 * @return {[type]}             [description]
 */
function getTemporaryCertifyData (temporaryId) {
  return instance({
    url: '',
    method: 'post',
    data: {
      "jsonrpc":"2.0",
      "method":"cer_getTemporary",
      "params":[temporaryId],
      "id":1
    }

  })
}
/**
 * 申请证书
 * @param  {[type]} templateId [description]
 * @param  {[type]} hashCont   [description]
 * @param  {[type]} endTime    [description]
 * @return {[type]}            [description]
 */
function applyCertify (templateId, hashCont, endTime, sign) {
  // endTime 过期时间
  return instance({
    url: '/claim/applyCertify',
    method: 'post',
    data: {
      templateId: templateId,
      hashCont: hashCont,
      endTime: endTime,
      sign: sign
    }
  })
}

/**
 * 检查hashvalue(证书哈希值)是否正确
 * @param  {[type]} claim_sn   [description]
 * @param  {[type]} templateId [description]
 * @return {[type]}            [description]
 */
function checkHashValue (claim_sn, templateId, certifyData, options = {claimData: false, templateData: false}) {
// function checkHashValue (claim_sn, templateId, options = {claimData: false, templateData: false}) {
  return Promise.all([getCertifyFingerPrint(claim_sn), getTemplate(templateId)]).then(([claimRes, templateRes]) => {
    // console.log('claimRes', claimRes.data)
    // console.log('templateRes', templateRes.data)
    // let [hashValueChain, certifyData, template] = [claimRes.data.result.hash_cont, templateRes.data.result.meta_cont]
    let [hashValueChain, template] = [claimRes.data.result.hash_cont, templateRes.data.result.meta_cont]
    // 这里使用硬编码是为了走通逻辑，前天需要庆雪使用相同的哈希方法
    // hashValueChain = '9900f81fa6e1c509066a333b835ef7205d2abda08fbe8a3409bdd0cfd661a872'
    template = JSON.parse(template)
    let hash = new Keccak(256)
    let descAndHash = template.desc
    for (let [key, value] of Object.entries(certifyData)) {
      let reg = new RegExp(`\\$${key}\\$`, 'ig')
      hash.update(value)
      let hashStr = hash.digest('hex')
      hashStr = '0x' + hashStr
      descAndHash = descAndHash.replace(reg, hashStr)
      hash.reset()
    }
    hash.update(descAndHash)
    let hashValueLocal = hash.digest('hex')
    hashValueLocal = '0x' + hashValueLocal
    return {
        hashValueLocal: hashValueLocal,
        hashValueChain: hashValueChain,
        result: hashValueLocal === hashValueChain,
        claimData: options.claimData ? claimRes.data.result : '',
        templateData: options.templateData ? templateRes.data.result : ''
      }
  }).catch(error => {
    console.log('error', error)
    return Promise.reject(error)
  })
}

/**
 * 使用ethereumjs-util里的ecsign对数据执行签名
 * @param  {[type]} msg     [description]
 * @param  {[type]} privStr [description]
 * @return {[type]}         [description]
 */
function signEcdsa(msg, privStr) {
  let priv = null
  if (typeof privStr === 'string' && privStr.slice(0, 2) === '0x') {
    priv = Buffer.from(privStr.slice(2), 'hex')
  } else {
    throw new Error('私钥字符串必须是以0x开头的十六进制字符串')
  }
  // let msgHash = keccak256(Buffer.from(msg, 'ascii'))
  let msgHash = keccak256(Buffer.from(msg, 'utf8'))
  let sign = ecsign(msgHash, priv)
  let data = new Buffer(65)
  append(data, sign.r, 0)
  append(data, sign.s, 32)
  data[64] = sign.v
  return '0x' + data.toString('hex')
}
function append(buf, data, idx) {
  for (let i = 0; i < data.length; i++) {
    buf[idx + i] = data[i]
  }
  return buf
}

/**
 * 使用ethereumjs-util里的isValidSignature对数据执行验签
 * @param  {[type]} v [description]
 * @param  {[type]} r [description]
 * @param  {[type]} s [description]
 * @return {[type]}   [description]
 */
function verifySignEcdsa(signEcdsaRes) {
  if (signEcdsaRes.slice(0, 2) === '0x') {
    signEcdsaRes = signEcdsaRes.slice(2)
  }
  let [r, s, v] = [signEcdsaRes.slice(0, 64), signEcdsaRes.slice(64, -2), signEcdsaRes.slice(-2)]
  return isValidSignature(v ,r, s)
}

// 备份临时数据
// 可以用于 存证副本、稍息通知等。
// 这个方法与setTemporaryCertifyData功能重复
// function setTemporary() {

// }

module.exports = {
  main,
  test0,
  test1,
  test2,
  fn,
  wsc,
  getPubByDid,
  shajs,
  sm2,
  sm3,
  sm4,
  SHA3,
  Keccak,
  SHAKE,
  ecsign, // ethereumjs-util 里的方法，用于ecdsa方式的加解密过程
  isValidSignature, // ethereumjs-util 里的方法，用于ecdsa方式的加解密过程
  keccak256, // ethereumjs-util 里的方法，用于ecdsa方式的加解密过程
  signEcdsa,
  verifySignEcdsa,
  // sm4Li,
  getKeyStore,
  encryptDidttm,
  decryptDidttm,
  getPvData,
  // setPvData,
  backupData,
  decryptPvData,
  getDidList,
  getCheckCode,

  bytesToStrHex,
  setTemporaryCertifyData,
  getTemporaryCertifyData,
  createIdCertify,
  getTemplate,
  getTemplateList,
  setTemplate,
  validateIdCertify,
  cancelIdCertify,
  getCertifyFingerPrint,
  certifySignUrl,
  // createCommonCertify,
  validateCommonCertify,
  checkCommonCertify,
  cancelCheckCommonCertify,
  cancelCertify,
  signCertify,
  // genKey,
  applyCertify,
  checkHashValue,
  utils,
  instance
}

// export default {
//   key: 'value'
// }