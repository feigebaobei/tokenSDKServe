# token-sdk-server

因为该包是在server端运行的。所以应该去掉browserEnter.js

## 简介

现在tokenSDKServer还在开发阶段，现在还不建议大家使用。
它是在web server端使用的。它是与链节点云服务协同工作的服务端代码包。

### 主要包括

1. 获取didttm文件/pvdata,并解密它们的方法。
2. 使用didttm文件/pvdata。包括：授权出去用户属性等。
3. sm2/sm3/sm4/aes/与链节点云服务协同工作的方法
4. 可以修改didttm文件/pvdata。

### 需要的依赖：

|包名|版本号|
|-|-|
|"elliptic"|"^6.5.2"|
|"hash.js"|"^1.1.7"|
|"hmac-drbg"|"^1.0.1"|
|"inherits"|"^2.0.4"|
|""ethereumjs-util"|"^7.0.2"|

## usage

```
import tokenSDKServer from 'token-sdk-server'

var priStr = '55c974f17a0b44178d982dcd478150b8a4c0f206f397d7880d06bf5a72932b81'
let keyes = tokenSDKServer.sm2.genKeyPair(priStr)

// 使用指定的私钥字符串
function test0() {
  var keyes = sm2.genKeyPair(priStr)
  var ct = keyes.encrypt(hashStr)
  console.log('ct', ct)
  console.log('ct:', `[${ct.join(', ')}]`)
  // ct: [246, 106, 106, 40, 249, 239, 104, 205, 94, 25, 74, 123, 117, 222, 186, 157, 161, 54, 72, 5, 161, 55, 231, 22, 35, 1, 41, 120, 226, 18, 197, 95, 143, 44, 190, 238, 171, 248, 247, 163, 91, 234, 30, 56, 158, 201, 3, 172, 214, 151, 42, 167, 104, 91, 90, 12, 34, 99, 41, 73, 16, 156, 197, 27, 253, 36, 73, 156, 146, 2, 200, 250, 44, 127, 17, 67, 162, 208, 186, 195, 225, 179, 163, 180, 116, 102, 126, 226, 35, 154, 39, 58, 206, 129, 255, 188, 61, 178, 253, 3, 203, 218, 136, 187, 226, 146, 186, 169, 2, 171, 209, 211, 186, 73, 67, 86, 61, 69, 97, 52, 88, 225, 75, 208, 231, 225, 45, 118, 46, 15, 250, 16, 193, 84, 3, 152, 135, 81, 63, 19, 170, 94, 178, 101, 148, 187, 41, 86, 30, 219, 31, 72, 230, 44, 144, 144, 155, 171, 205, 173]
  var mt = keyes.decrypt(ct)
  console.log('mt:', `[${mt.join(', ')}]`)
  // mt: [99, 56, 56, 56, 99, 57, 99, 101, 57, 101, 48, 57, 56, 100, 53, 56, 54, 52, 100, 51, 100, 101, 100, 54, 101, 98, 99, 99, 49, 52, 48, 97, 49, 50, 49, 52, 50, 50, 54, 51, 98, 97, 99, 101, 51, 97, 50, 51, 97, 51, 54, 102, 57, 57, 48, 53, 102, 49, 50, 98, 100, 54, 52, 97]
  var signData = keyes.signSha512(hashStr)
  console.log('signData:', signData)
  // signData: {r: "4e403f48d144c3077ea0cc2070535a9d9ccad580459b735f9c988b6f64851000", s: "6db31e8b77902d72417b4593b9e3734cb8f10389ce3382774d75b0d3a317b8a4"}
  var isok = keyes.verify512(hashStr, signData.r, signData.s)
  console.log('isok:', isok)
  // isok: true
  var sign = keyes.sign(hashStr)
  console.log('sign:', sign)
  // sign: {r: "64590e43b91e7a6c1249c9f3e19cb1f84e9fe56160d9f502a764e856193c9336", s: "2063cb56b981581a333b11ade303106c6c388a86955a01915ee5e6cfcba8faab"}
  var isok = keyes.verify(hashStr, sign.r, sign.s)
  console.log('isok:', isok)
}

```
```
import tokenSDKServer from 'otken-sdk-server'
var sm3 = tokenSDKServer.sm3
var msg = 'abc'
var hash = new sm3()
var digest = hash.sum(msg)
console.log(digest)
// [102, 199, 240, 244, 98, 238, 237, 217, 209, 242, 212, 107, 220, 16, 228, 226, 65, 103, 196, 135, 92, 242, 247, 162, 41, 125, 160, 43, 143, 75, 168, 224]
```

## api

### 业务级api

#### 解密didttm
decryptDidttm(didttmStr, idpwd, issm = false)
参数
  didttmStr  string / object      didttm文件的内容。它是密文。
  idpwd      strring              身份密码。它用于解密didttm.
  issm       bool                 是否使用国密。
处理
返回
  json对象格式的明文 {
    nickname: // 昵称
    did // did
    data // 私钥字符串
  }

#### 加密didttm
encryptDidttm(nickname, did, priStr, idpwd)
加密didttm。可用于导出didttm.
参数
  nickname  string   昵称
  did       string   did
  priStr    string   私钥字符串
  idpwd     string   身份密码
处理
返回
  didttm {
    nickname: // 昵称
    did // did
    data // 私钥字符串的密文
  }

#### 从didttm内容中取出priStr
didttmToPriStr(didttmStr, idpwd, issm = false)
参数
  didttmStr string / object didttm的密文内容
  idpwd 身份密码
  issm 是否使用国密解密
处理
返回
  string 私钥字符串

#### 加密pvdata
encryptPvData(pvDataStr, priStr)
参数
  pvDataStr string  pvdata的明文字符串
  priStr    string  密码
处理
返回
  hexstr           密文。十六进制字符串


#### 解密pvdata
decryptPvData(ctPvData, priStr)
参数
  ctPvData string  pvdata的密文
  priStr   string  密码
处理
返回
  string pvdata的明文

#### 在pvdata.certifies里添加签发过的证书
certifiesAddSignItem
参数
  pvdata       string / object     pvdata的明文
  claimData    object              证书的数据
  templateData object              证书的模板数据
处理
  按照templateData.keys中的key从claimData中取出该key对应的value，整理为一项certify，再放入pvdata.certifies里。
  注意保证claimData里数据完成。否则整理出的certify是不完整的。
返回
  object              添加证书项后的pvdata

#### 生成密钥对
genKeyPair(priStr, issm = false)
参数
  priStr string 私钥字符串 选填
  issm bool 是否使用国密。默认为false.
处理
返回
  若不填priStr，则输出随机密钥。否则输出指定密钥。
  暂时未开通ecdsa生成密钥对的方法

#### 加密
encrypt(keys, msg, issm = false)
参数
  keys sm2生成的密钥对。
  msg string
  issm bool 是否使用国密。默认为false.
返回
  array
  暂时未开通ecdsa的加密方法

#### 解密
decrypt(keys, data, issm = false)
参数
  keys sm2生成的密钥对。
  data string 有无`0x`开头都可以。十六进制字符串。
       array
  issm bool 是否使用国密。默认为false.
返回
  hexStr 没有`0x`开头的十六进制字符串。
  暂时未开通ecdsa的解密方法

#### 加签
sign({keys, msg}, issm = false)
参数
  keys sm2生成的密钥对。
  msg string  这里需要注意：js里的msg是明文（未经过hash的）.go里的C_Sign(hs, priv)方法需要把明文经过keccak256散列。
  issm bool 是否使用国密。默认为false.
返回
  国密返回{r string, s string}
  ecdsa返回{r buffer, s buffer, v number}

#### 验签
verify({keys, msg, sign}, issm = false)
参数
  issm bool 是否使用国密。默认为false.
  若issm为true，则必须传入keys/msg/sign
  keys sm2生成的密钥对。
  msg string
  sign {r string, s string}
  若issm为false，则不传keys、msg,必须传sign
  sign {r buffer, s buffer, v number}
返回
  bool

### sm2

sm2部分是基于`sm.js`做的。

sm2.genKeyPair(priStr)
生成密钥对。
若指定私钥字符串，则生成指定的密钥对。否生成随机密钥对。
params priStr 私钥字符串
return {curve: 椭圆曲线, pri: 私钥, pub: 公钥}

keyes.sign(msg)
对数据签名。
sm.js里的签名方法。
params msg string
return {s: String, r: String}

keyes.verify(msg, r, s)
验证签名
sm.js里的验签方法。
params msg string
       r string
       s string
return boolean

keyes.signSha512(msg)
对数据签名。
使用sha512签名。
params msg string
return {s: String, r: String}

keyes.verify512(msg, r, s)
验证签名
使用sha512验签。
params msg string
       r string
       s string
return boolean

keyes.encrypt(hashStr)
加密
params hashStr 需要加密的字符串，一般为hash值。
return [number] 0-255数字组成的数组

keyes.decrypt(ct)
解密
params ct 密文字符串。
return [number] 0-255数字组成的数组

### sm3

sm3是引用sm.js的sm3。
参考链接：https://www.npmjs.com/package/sm.js

let hash = new sm3() // 得到sm3实例
let digest = hash.sum('str') // 得到'str'的散列值 // 参数必须是string

### sm4

现在代码里运行的sm4。与标准的sm4是不同。区别是：1. 有一个随机的iv。2. key是被md5散列后的。
它们的相同点是：都是基于标准的sm4开发的。
若没有与token-sdk-server相同的sm4.没必要只使用token-sdk-server里的sm4。
它的出现完全是为了配合区块链方面改造后的sm4.不适合用于别的地方主
用别

```
const tokenSDKServer = require('token-sdk-server')

let mt = '2345tytre', key = 'wertyhgfd'
let ct = tokenSDKServer.sm4.encrypt(mt, key)
console.log('ct', ct)
let mtDecrypt = tokenSDKServer.sm4.decrypt(ct, key)
```

new sm4(options)
实例化sm4
params {
        key string 加、解密时的密钥
        mode string // 'cbc' / 'ecb'
        iv: '' // 当使用cbc模式时，必填。
        cipherType: 'base64' // 默认是base64。我读原码发现可能使用'base64'
        }
return sm4的实例对象

sm4.encrypt(plainText)
加密plainText
params plainText string
return cipherText string

sm4.decrypt(cipherText)
解密cipherText
params cipherText string
return plainText string

### aes

暂时没用到

### 与链节点云服务协同工作的方法

getKeyStore(did)
获得keystore。（keystore现在叫didttm）
params did
return ct // didttm的内容，它是密文。

getPubByDid (did)
使用did获取公钥
params did string
return promise

getDidttm (did)
使用did获取didttm文件
params did string
return promise

decryptDidttm (ct, key)
解密didttm文件
params ct string
        key string
return promise

encryptDidttm (mtStr, key)
加密didttm文件
params mtStr string
        key string
return promise

getPvData (did)
使用did获取pvdata
params did string
return promise

decryptPvData (ct, pri)
使用pri解密pvData
params ct string
        pri string
return promise

getDidList (phone)
使用手机号获取didList
params phone string
return promise

getCheckCode (phone)
获取验证码
params phone string
return promise

getCertifyFingerPrint (claim_sn)
使用证书id获取证书指纹
params claim_sn string
return promise

getTemplate (templateId)
使用模板id请求证书模板
params templateId string
return promise

getTemplateList ()
获取证书模板列表
return promise

cancelCertify (claim_sn, did, hashCont, endtime, pri)
取消证书
params claim_sn string
        did string
        hashCont string
        endtime string
        pri string
return promise

certifySignUrl (claim_sn, templateId, certifyData)
获取签发证书页面的临时数据id
params claim_sn string
        templateI string
        certifyData string
return promise

getCertifySignData (temporaryID)
获取签发证书页面的数据
params certifySignUuid string
return promise

signCertify(did, claim_sn, templateId, hashValue, endTime, sign)
提交签发
params id string
        claim_sn string
        templateId string
        hashValue string
        endTime string
        sign object
return promise

bytesToStrHex(arr)
把byte型的数组转换为16进制的字符串。常用于处理加密、解密的结果。
params arr [number]
return string

setTemporaryCertifyData (claim_sn, templateId, certifyData, expire, purpose)
保存证书的临时数据
params claim_sn, templateId, certifyData, expire, purpose)
return promise

getTemporaryCertifyData (temporaryID)
得到证书的临时数据
params temporaryID
return promise


## 业务级的api

这部分api是基于以上api封装出来的。

```
对字符串，生成加密didttm文件的内容。
tokenSDKServer.encryptDidttm(nickname, did, priStr, key)
params nickname  昵称       string
       did       did        string
       priStr    私钥字符串  string
       key       密码       string
return ct        密文       string

tokenSDKServer.decryptDidttm(didttmStr, ipdwd, issm = false)
params didttmStr  didttm文件的内容 string / object(必须包括nickname/did/data)
       idpwd      密码            string
return mt         明文            object {nickname,did,data}

// demo
let key = 'wertasdfg12345'
let nickname = 'nickname'
let did = 'did.ttml.ssdfs'
let priStr = '0x2123456ytrewqwfghhgfdsrtytrew'
let obj = {
  nickname: nickname,
  did: did,
  priStr: priStr
}

let ct = tokenSDKServer.encryptDidttm(nickname, did, priStr, key)
console.log('ct', ct)
// ct {
//   nickname: 'nickname',
//   did: 'did.ttml.ssdfs',
//   data: '0x629a5515e9cbd09ac3d826e0275e37f8b973b1a677aad5fac9f3cab5d5c27654bed24410af715f4899a93065abe575741cecce51794f3d20bb88ce309562ac4b'
// }
let r = tokenSDKServer.decryptDidttm(JSON.stringify(ct), key)
console.log('r', r)
// r {
//   nickname: 'nickname',
//   did: 'did.ttml.ssdfs',
//   data: '0x2123456ytrewqwfghhgfdsrtytrew'
// }
```

