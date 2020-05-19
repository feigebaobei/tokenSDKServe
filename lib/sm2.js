/**
 * SM2 elliptic curve
 *
 * Support SM2 key pair generation and signature.
 */

var sm3 = require('./sm3');
var utils = require('./utils');
var elliptic = require('elliptic');
// var BN = require('bn.js');
var BN = require('./bn.js');
var DRBG = require('hmac-drbg');
var hash = require('hash.js');
var inherits = require('inherits');
var shajs = require('sha.js');


var _drbg = new DRBG({
  hash: hash.sha256,
  entropy: 'UQi4W3Y2bJfzleYy+oEZ2kA9A+9jrmwewST9vmBZNgMmFyzzH0S9Vol/UK',
  // nonce: '0123456789avcdef',
  nonce: '0123456789abcdef', // li修改的
  pers: '0123456789abcdef'
});

/**
 * The SM2 elliptic curve
 */
function SM2Curve(params) {
  if (!(this instanceof SM2Curve)) {
    return new SM2Curve(params);
  }

  elliptic.curve.short.call(this, params);
}
inherits(SM2Curve, elliptic.curve.short);

var _sm2Params = {
  type: 'SM2',
  prime: null,
  p: 'FFFFFFFE FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF 00000000 FFFFFFFF FFFFFFFF',
  a: 'FFFFFFFE FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF 00000000 FFFFFFFF FFFFFFFC',
  b: '28E9FA9E 9D9F5E34 4D5A9E4B CF6509A7 F39789F5 15AB8F92 DDBCBD41 4D940E93',
  n: 'FFFFFFFE FFFFFFFF FFFFFFFF FFFFFFFF 7203DF6B 21C6052B 53BBF409 39D54123',
  hash: sm3,
  gRed: false,
  g: [
    '32C4AE2C 1F198119 5F990446 6A39C994 8FE30BBF F2660BE1 715A4589 334C74C7',
    'BC3736A2 F4F6779C 59BDCEE3 6B692153 D0A9877C C62A4740 02DF32E5 2139F0A0'
  ]

}

// exports.curve = SM2 = SM2Curve(_sm2Params);
var SM2 = SM2Curve(_sm2Params);
exports.curve = SM2;


/**
 * Return a point on the curve.
 * Will throw error if (x,y) is not on curve.
 *
 * @param {string} x - coordinate x in hex string, should not be null
 * @param {string} y - coordinate y in hex string
 * @param {string='even'} parity - determine the value of y, could be 'odd' or 'even', ignored when y is not null
 */
function _sm2Point(x, y, parity) {
  if (x == null) {
    return SM2.point();
  }

  var pt;
  if (y != null) {
    pt = SM2.point(x, y);
    if (!SM2.validate(pt)) {
      throw 'point is not on curve';
    }
  } else {
    var px = new BN(x, 16).toRed(SM2.red);
    var py = px.redSqr().redMul(px);
    py = py.redIAdd(px.redMul(SM2.a)).redIAdd(SM2.b).redSqrt();
    if ((parity === 'odd') != py.fromRed().isOdd()) {
      py = py.redNeg();
    }
    pt = SM2.point(px, py);
  }

  return pt;
}

/**
 * SM2 public and private key pair
 *
 * Either `pub` and `pri` can be a hex string or byte array or null.
 * If `pub` is a string, it should be the same format as output of pubToString().
 */
function SM2KeyPair(pub, pri) {
  if (!(this instanceof SM2KeyPair)) {
    return new SM2KeyPair(pub, pri);
  }
  this.curve = SM2; // curve parameter
  this.pub = null; // public key, should be a point on the curve
  this.pri = null; // private key, should be a integer

  var validPub = false;
  var validPri = false;

  if (pub != null) {
    if (typeof pub === 'string') {
      this._pubFromString(pub);
    } else if (Array.isArray(pub)) {
      this._pubFromBytes(pub);
    } else if ('x' in pub && pub.x instanceof BN &&
               'y' in pub && pub.y instanceof BN) {
      // pub is already the Point object
      this.pub = pub;
      validPub = true;
    } else {
      throw 'invalid public key';
    }
  }
  if (pri != null) {
    if (typeof pri === 'string') {
      this.pri = new BN(pri, 16);
    } else if (pri instanceof BN) {
      this.pri = pri;
      validPri = true;
    } else {
      throw 'invalid private key';
    }

    // calculate public key
    if (this.pub == null) {
      this.pub = SM2.g.mul(this.pri);
    }
  }

  if (!(validPub && validPri) && !this.validate()) {
    throw 'invalid key';
  }
}
exports.SM2KeyPair = SM2KeyPair;

/**
 * Generate a SM2 key pair
 */
// exports.genKeyPair = function _genKeyPair() { // 原来的
exports.genKeyPair = function _genKeyPair(priStr) { // li改的
  // priStr 是私钥字符串
  var pri = 0;
  var limit = SM2.n.sub(new BN(2));
  // generate 32 bytes private key in range [1, n-1]
  do {
    pri = new BN(_drbg.generate(32, 'hex', utils.random(64)));

    // var r = utils.random(64) // 357f466c8707d5386d3eed6b5974343ff5e4710aa6972ba4c560d609e43e8fa95e843de71462c8d2f3a0084aab56cb5d0f74a28df19aa33c9250ac4695c2ff29
    // console.log("random", r)
    // var gen = _drbg.generate(32, 'hex', r) // 512f16d518c2c9068c5828329e20108ba64ee1407bb5e5c909fc77b1ae539024
    // console.log("_drbg.generate", gen)
    // pri = new BN(gen);

    // pri = new BN(_drbg.generate(32, 'hex', 'b9ed41da26c8c473771b14422f21d072c655ada579b4dfc8c06b01d4d17a8b369974b9fd77766b07b5e9265ae465a5a569bd77ccb5f9f29848af4b6b2c8b7bbc'));
  } while (pri.cmp(limit) > 0);

  // return new SM2KeyPair(null, pri);
  var keyes = new SM2KeyPair(null, pri);
  if (priStr) {
    var priBn = new BN(priStr, 16)
    keyes.pri = priBn
    keyes.pub = keyes.curve.g.mul(priBn)
    return keyes
  } else {
    return keyes
  }
}


/**
 * @private
 * Parse public key from hex string.
 */
SM2KeyPair.prototype._pubFromString = function (s) {
  var err = 'invalid key string';
  if (s.length < 66) {
    throw err;
  }
  var x = s.slice(2, 66);
  switch (s.slice(0, 2)) {
    case '00':
      throw 'public key should not be infinity';
    case '02':
      this.pub = _sm2Point(x, null, 'even');
      break;
    case '03':
      this.pub = _sm2Point(x, null, 'odd');
      break;
    case '04':
    case '06':
    case '07':
      if (s.length < 130) {
        throw err;
      }
      this.pub = _sm2Point(x, s.slice(66, 130));
      break;
    default:
      throw err;
  }
}

/**
 * @private
 * Parse public key from byte array.
 */
SM2KeyPair.prototype._pubFromBytes = function (b) {
  var err = 'unrecognized key';
  if (b.length < 33) {
    throw err;
  }
  var x = b.slice(1, 33);
  switch (b[0]) {
    case 0x00:
      throw 'public key should not be infinity';
    case 0x02:
      this.pub = _sm2Point(x, null, 'even');
      break;
    case 0x03:
      this.pub = _sm2Point(x, null, 'odd');
      break;
    case 0x04:
    case 0x06:
    case 0x07:
      if (b.length < 65) {
        throw err;
      }
      this.pub = _sm2Point(x, b.slice(33, 65));
      break;
    default:
      throw err;
  }
}

/**
 * Check whether the public key is valid.
 *
 * @return {bool}
 */
SM2KeyPair.prototype.validate = function() {
  if (this.pub != null) {
    if (this.pub.isInfinity()) {
      return false;
    }

    if (!this.curve.validate(this.pub)) {
      return false;
    }

    if (!this.pub.mul(this.curve.n).isInfinity()) {
      return false;
    }
  }

  if (this.pri != null) {
    if (this.pri.cmp(this.curve.n.sub(new BN(2))) > 0) {
      return false;
    }

    if (this.pub != null && !this.pub.eq(this.curve.g.mul(this.pri))) {
      return false;
    }
  }

  return true;
}


/**
 * Convert the public key to the hex string format
 *
 * @param {Number} [mode='nocompress'] - compressing mode, available values:
 *    'compress', 'nocompress', 'mix'
 */
SM2KeyPair.prototype.pubToString = function(mode) {
  var s = '';
  switch (mode) {
    case 'compress':
      if (this.pub.getY().isEven()) {
        s = '02';
      } else {
        s = '03';
      }
      return s + this.pub.getX().toString(16, 32);
    case 'mix':
      if (this.pub.getY().isEven()) {
        s = '06';
      } else {
        s = '07';
      }
      break;
    default:
      s = '04'
  }
  return s + this.pub.getX().toString(16, 32) + this.pub.getY().toString(16, 32);
}

/**
 * Convert the public key to a byte array.
 * The value of X and Y will be stored in big endian.
 *
 * @param {string} mode - compressing mode, same as pubToString.
 */
SM2KeyPair.prototype.pubToBytes = function(mode) {
  var a = [];
  switch (mode) {
    case 'compress':
      if (this.pub.getY().isEven()) {
        a.push(0x02);
      } else {
        a.push(0x03);
      }
      return a.concat(this.pub.getX().toArray('be', 32));
    case 'mix':
      if (this.pub.getY().isEven()) {
        a.push(0x06);
      } else {
        a.push(0x07);
      }
      break;
    default:
      a.push(0x04);
  }
  return a.concat(this.pub.getX().toArray('be', 32)).concat(this.pub.getY().toArray('be', 32));
}


/**
 * Generate signature to the message
 *
 * The input message will combine with extras(a constant user id, the
 * curve parameters and public key), and use SM3 hashing function to
 * generate digest.
 *
 * @param {string|byte array} msg
 *
 * @return {SM2KeyPair} Signature (r, s). Both part is a hex string.
 */
SM2KeyPair.prototype.sign = function(msg) {
  // msg应该是hash后的字符串
  if (this.pri == null) {
    throw 'cannot sign message without private key';
  }
  // 使用sm3
  // if (typeof msg === 'string')
  //   return this.signDigest(new sm3().sum(this._combine(utils.strToBytes(msg))));
  // else
  //   return this.signDigest(new sm3().sum(this._combine(msg)));
  var ressm3 = null
  // console.log("msg", msg)
  if (typeof msg === 'string') {
    ressm3 = new sm3().sum(this._combine(utils.strToBytes(msg)))

    // var bytes = utils.strToBytes(msg)
    // var comb = this._combine(bytes)
    // console.log("utils.strToBytes(msg)", bytes)
    // console.log("comb", comb)
    // ressm3 = new sm3().sum(comb))
  } else {
    ressm3 = new sm3().sum(this._combine(msg))
  }
  return this.signDigest(ressm3)
}
// 使用sha512签名
SM2KeyPair.prototype.signSha512 = function(msg) {
  // msg应该是hash后的字符串
  if (this.pri == null) {
    throw 'cannot sign message without private key';
  }
  // 使用hash512
  var ressha512 = null
  ressha512 = shajs('sha512').update(this.pri.toString())
                              // .update('7a4ef5844f07d191bd77f8069af28ca0')
                              .update(utils.random(16))
                              .update(msg)
                              .digest('hex')
  // ressha512 = shajs('sha512').update('55c974f17a0b44178d982dcd478150b8a4c0f206f397d7880d06bf5a72932b81') // 64 pri.D
  //                .update('7a4ef5844f07d191bd77f8069af28ca0') // 32 entropy
  //                .update('c888c9ce9e098d5864d3ded6ebcc140a12142263bace3a23a36f9905f12bd64a') // 64 hashStr
  //                .digest('hex') // fd30f3229aaa010bce47f6f598a61b2bf97e38fad3d5f00dfa54d2b39498ef3b4dcc21d8bc1f83d65a1e32b54fcf83f0d6bc01913716d56a06c9c466a5ca2c27 // 128
  // var msgHash = 'c888c9ce9e098d5864d3ded6ebcc140a12142263bace3a23a36f9905f12bd64a'
  var res = ressha512.slice(0, 64)
  // return this.signDigest512(res, utils.strToBytes(msg))
  return this.signDigest512(res, utils.strToAscii(msg))
}

/**
 * Verify the signature (r,s)
 *
 * @param {string|byte array} msg
 * @param {string} r - signature.r part in hex string
 * @param {string} s - signature.s part in hex string
 *
 * @return {bool} true if verification passed.
 */
SM2KeyPair.prototype.verify = function(msg, r, s) {
  if (this.pub == null) {
    throw 'cannot verify signature without public key';
  }
  return this.verifyDigest(new sm3().sum(this._combine(msg)), r, s);
}

/**
 * Generate signature to the message without combination with extras.
 */
SM2KeyPair.prototype.signRaw = function(msg) {
  return this.signDigest(new sm3().sum(msg));
}

/**
 * Verify signature (r, s) generated by signRaw()
 */
SM2KeyPair.prototype.verifyRaw = function(msg, r, s) {
  return this.verifyDigest(new sm3().sum(msg), r, s);
}

/**
 * Generate signature for the message digest
 *
 * The input data should be a 256bits hash digest.
 *
 * @param {string|byte array} digest - the digest of the message
 * @return {object}  signature with r and s parts
 */
// SM2KeyPair.prototype.signDigest = function(digest) {
SM2KeyPair.prototype.signDigest = function(digest) {
  var signature = {
    r: "",
    s: ""
  }
  while (true) {
    var k = new BN(_drbg.generate(32, 'hex', utils.random(64)), 16).umod(this.curve.n);
    // k = new BN('38359979097965737626287108512938308997934657964393243462211198163060042537245', 10)
    // console.log("this.curve.g", this.curve.g);
    // console.log("k:", k.toString());
    var kg = this.curve.g.mul(k);
    // console.log("kg:", kg);
    var r = utils.hashToBN(digest).add(kg.getX()).umod(this.curve.n);
    // var r = 

    // console.log("k =", k);
    // console.log("k =", k.toString());

    // r = 0
    if (r.isZero()) {
      continue;
    }
    // r + k = n
    if (r.add(k).eq(this.curve.n)) {
      continue;
    }

    // var t1 = new BN(1).add(this.pri).invm(this.curve.n);
    // var t2 = k.sub(r.mul(this.pri)).umod(this.curve.n);
    // var s = t1.mul(t2).umod(this.curve.n);


    var t1 = new BN(1).add(this.pri).invm(this.curve.n);
    var t2 = k.sub(r.mul(this.pri))//.umod(this.curve.n);
    var s = t1.mul(t2).umod(this.curve.n);

    // s = k.sub(this.pri.mul(r))
    // d1Inv = this.pri.add(new BN(1)).invm(this.curve.n)
    // s = s.mul(d1Inv)
    // s = s.umod(this.curve.n)


    if (!s.isZero()) {
      // console.log("r", r.toString(10))
      // console.log("s", s.toString(10))
      signature.r = utils.padStart(r.toString(16), 64, '0');
      signature.s = utils.padStart(s.toString(16), 64, '0');
      break;
    }
  }

  return signature;
}


// 测试该方法是否与go的运行结果一样
SM2KeyPair.prototype.signDigest512 = function(digest, msgHash) {
  var signature = {
    r: "",
    s: ""
  }
  var k = null
  var e = utils.bnSetBytesArr(msgHash, 10)
  // console.log('e sign:', e.toString())
  while (true) {
    k = new BN(digest, 16)
    var kg = this.curve.g.mul(k)
    var r = e.add(kg.getX()).mod(this.curve.n)
    // r = 0
    if (r.isZero()) {
      continue;
    }
    // r + k = n
    if (r.add(k).eq(this.curve.n)) {
      continue;
    }
    var t1 = new BN(1).add(this.pri).invm(this.curve.n);
    var t2 = k.sub(r.mul(this.pri))//.umod(this.curve.n);
    var s = t1.mul(t2).umod(this.curve.n);
    if (!s.isZero()) {
      signature.r = utils.padStart(r.toString(16), 64, '0');
      signature.s = utils.padStart(s.toString(16), 64, '0');
      break;
    }
  }
  return signature;
}

/**
 * Verify the signature to the digest
 *
 * @param {string|byte array} digest - digest of the message
 * @param {string} r - hex string of signature.r
 * @param {string} s - hex string of signature.s
 *
 * @return {bool} true if verification passed
 */
SM2KeyPair.prototype.verifyDigest = function(digest, r, s) {
  var bnr = new BN(r, 16);
  if (bnr.cmp(this.curve.n) >= 0) {
    return false;
  }

  var bns = new BN(s, 16);
  if (bns.cmp(this.curve.n) >= 0) {
    return false;
  }

  var t = bnr.add(bns).umod(this.curve.n);
  if (t.isZero()) {
    return false;
  }

  var q = this.curve.g.mul(bns).add(this.pub.mul(t));
  var R = utils.hashToBN(digest).add(q.getX()).umod(this.curve.n);
  if (!R.eq(bnr)) {
    return false;
  }

  return true;
}

// 使用sha512参与验签
SM2KeyPair.prototype.verify512 = function(msg, r, s) {
  if (this.pub == null) {
    throw 'cannot verify signature without public key';
  }
  // return this.verifyDigest512(new sm3().sum(this._combine(msg)), r, s);
  return this.verifyDigest512(msg, r, s)
}
// 
SM2KeyPair.prototype.verifyDigest512 = function(digest, r, s) {
  // console.log('digest:', digest)
  var e = utils.bnSetBytesStr(digest)
  // console.log('e:', e.toString())
  var bnr = new BN(r, 16);
  if (bnr.cmp(this.curve.n) >= 0) {
    return false;
  }

  var bns = new BN(s, 16);
  if (bns.cmp(this.curve.n) >= 0) {
    return false;
  }

  var t = bnr.add(bns).umod(this.curve.n);
  if (t.isZero()) {
    return false;
  }

  var q = this.curve.g.mul(bns).add(this.pub.mul(t));

  // this.curve.g <=> pub.x / pub.y
  // this.curve.g.mul(bns) <=> c.ScalarMult(pub.X, pub.Y, t.Bytes())
  // var R = utils.hashToBN(digest).add(q.getX()).umod(this.curve.n);
  var R = e.add(q.getX()).umod(this.curve.n);
  // q.getX() 就是从 c.Add(x1, y1, x2, y2) 得到的x
  // 即： x = q.getX()
  //       = (s*g+t*pub).getX()
  // x2, y2 是从 c.ScalarMult(pub.X, pub.Y, t.Bytes()) 得到的
  // go中的pub.X对应js里的this.pub.getX()
  if (!R.eq(bnr)) {
    return false;
  }

  return true;
}

SM2KeyPair.prototype._combine = function(msg) {
  var za = [0x00, 0x80, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38]; // 18
  za = za.concat(this.curve.a.fromRed().toArray());
  za = za.concat(this.curve.b.fromRed().toArray());
  za = za.concat(this.curve.g.getX().toArray());
  za = za.concat(this.curve.g.getY().toArray());
  za = za.concat(this.pub.getX().toArray());
  za = za.concat(this.pub.getY().toArray());

  var h = new sm3();
  za = h.sum(za);

  // console.log(za.join())
  // if (typeof msg === 'string')
  //   return za.concat(utils.strToBytes(msg))
  // else
  //   return za.concat(msg);
  var res = null
  if (typeof msg === 'string')
    res = za.concat(utils.strToBytes(msg))
  else
    res = za.concat(msg)
  return res
}

SM2KeyPair.prototype.toString = function() {
  var s = "public: ";
  if (this.pub) {
    s += "(" + this.pub.getX().toString(16) + ", " + this.pub.getY().toString(16) + ")";
  } else {
    s += "null";
  }
  s += ", private: ";
  if (this.pri) {
    // console.log(this.pri.toString(16))
    s += utils.padStart(this.pri.toString(16), 64, '0');
  } else {
    s += "null";
  }
  return s;
}

function randFieldElement(c) {
  var b = utils.random(40) // 4ab1f022d19eae94e4c17f4c33393218e4841ac696f01cb02bbd8c9dfac341ba835fc13b117bccb4
  // b = [179, 118, 189, 171, 241, 54, 167, 208, 18, 209, 23, 78, 52, 111, 194, 187, 238, 47, 229, 198, 114, 145, 49, 7, 196, 50, 136, 37, 169, 86, 144, 239, 207, 188, 40, 171, 206, 81, 127, 141] // 40
  b = 'b376bdabf136a7d012d1174e346fc2bbee2fe5c672913107c4328825a95690efcfbc28abce517f8d'
  var bArr = []
  for (var i = 0; i < b.length;) {
    // 16 => 10
    bArr.push(parseInt(b.slice(i, i+2), 16))
    i+=2
  }
  var k = utils.bnSetBytesArr(bArr)
  var n = c.n.sub(new BN(1))
  k = k.mod(n)
  k = k.add(new BN(1))
  return k
}
function kdf(x, y, length) {
  // console.log("x:", x)
  // console.log("y:", y)
  let [res, ct, h] = [[], 1, new sm3()]
  x = x.concat(y)
  for (var i = 0, j = Math.floor((length+31)/32); i < j; i++) {
    // j必须使用向取整才能得到与go相同的整数。
    h.reset()
    h.write(x)
    h.write([0,0,0,ct])
    // 这里可能会有问题。 当ct足够大时，会不会出现进位？
    var hash = h.sum()
    if (i+1 == j && length%32 != 0) {
      res = res.concat(hash.slice(0, length%32))
    } else {
      res = res.concat(hash)
    }
    ct++
  }
  for (i = 0; i < length; i++) {
    if (res[i] != 0) {
      return {res: res, bool: true}
    }
  }
  return {res: res, bool: false}
}
/**
 * 加密
 * @param  {string} msg [description]
 * @return {[type]}     [description]
 */
SM2KeyPair.prototype.encrypt = function(msg) {
  // let [lenx1, leny1, lenx2, leny2, length] = [0, 0, 0, 0, msg.length]
  let length = msg.length
  if (!length) {
    return new Error('msg length 不能为 0')
  }
  while (true) {
    var res = []
    var k = randFieldElement(this.curve)
    var kg = this.curve.g.mul(k)
    var x1 = kg.getX()
    var y1 = kg.getY()
    var kpub = this.pub.mul(k)
    var x2 = kpub.getX()
    var y2 = kpub.getY()
    // let [lenx1, leny1, lenx2, leny2] = [x1.byteLength(), y1.byteLength(), x2.byteLength(), y2.byteLength()]
    res = res.concat(x1.toArray('be', 32))
    res = res.concat(y1.toArray('be', 32))
    var tm = []
    tm = tm.concat(x2.toArray('be', 32))
    // tm = tm.concat(utils.strToBytes(msg))
    tm = tm.concat(utils.strToAscii(msg))
    tm = tm.concat(y2.toArray('be', 32))
    var h = new sm3().sum(tm)
    res = res.concat(h)
    var kdfRes = kdf(x2.toArray(), y2.toArray(), length)
    if (!kdfRes.bool) {
      continue
    }
    res = res.concat(kdfRes.res)
    for (var i = 0; i < length; i++) {
      // res[96+i] ^= utils.strToBytes(msg.slice(i, i+1))[0]
      res[96+i] ^= utils.strToAscii(msg.slice(i, i+1))[0]
    }
    return res
  }
}
/**
 * 解密
 * @param  {string} msg [description]
 * @return {[type]}     [description]
 */
SM2KeyPair.prototype.decrypt = function(msg) {
  // if (msg instanceof Array) {
  //   msg = utils.bytesToStrHex(msg)
  // }
  if (typeof(msg) == 'string') {
    msg = utils.strHexToBytes(msg)
  }
  // console.log('msg', msg)
  // 此时msg是 []byte 类型
  let [length, x, y] = [msg.length - 96, utils.bnSetBytesArr(msg.slice(0, 32)), utils.bnSetBytesArr(msg.slice(32, 64))]
  // var prig = this.curve.g.mul(this.pri)
  var p2 = _sm2Point(x, y).mul(this.pri)
  let [x2, y2] = [p2.getX(), p2.getY()]

  var kdfRes = kdf(x2.toArray(), y2.toArray(), length)
  if (!kdfRes.bool) {
    return false
  }
  for (var i = 0; i < length; i++) {
    kdfRes.res[i] ^= msg[i+96]
  }
  var tm = []
  tm = tm.concat(x2.toArray(), kdfRes.res, y2.toArray())
  var h = new sm3().sum(tm)
  // console.log('h', h.join(' '))
  // console.log('msg', msg)
  // console.log('msg 64-96:', msg.slice(64, 96).join(' '))
  // if (h != msg.slice(64, 96)) {
  if (h.join(' ') != msg.slice(64, 96).join(' ')) {
    return false
  }
  return kdfRes.res

}