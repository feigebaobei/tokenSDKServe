// var express = require('express');
// var utils = require('./lib/utils.js')
// var tokenSDKServer = require('token-sdk-server')
// var config = require('./lib/config')
// const redisClient = require('./redisClient.js')
// const http = require('http')
const WebSocket = require('ws')
const path = require('path')
const fs = require('fs')
const utils = require('./utils.js')
const sm2 = require('./sm2.js')
// const {isValidSignature} = require('ethereumjs-util')

let {didttm} = require('../../../tokenSDKData/privateConfig.js')

// let url = utils.isOnline() ? 'ws://www.lixiaodan.org:9875' : 'ws://localhost:9875'
// let url = 'ws://localhost:9875'
let url = 'ws://www.lixiaodan.org:9875'
let did = didttm.did // eg 'did:ttm:o04d88758f182adbf2e936a4be7b8129ef13fc0f1de9800998ecf8427e54ee'
url += `?did=${did}`
// console.log('url', url)
let config = {
  url: url,
  did: did || '',
  reConnectGap: 10 * 1000,
  openfn: null,
  messagefn: null,
  errorfn: null,
  closefn: null,
  isDev: false
}

// 验签。
// 从../serverEnter.js里复制来的。
// let verify = function ({keys, msg, sign}, options = {issm: false, chainId: undefined}) {
//   if (options.issm) {
//     if (keys instanceof sm2.SM2KeyPair) {
//       return keys.verify512(msg, sign.r, sign.s)
//     } else {
//       return new Error('keys不是SM2KeyPair的实例')
//     }
//   } else {
//     if (typeof sign === 'string') {
//       sign = sign.indexOf('0x') === 0 ? sign.slice(2) : sign
//       sign = {
//         r: Buffer.from(sign.slice(0, 64), 'hex'),
//         s: Buffer.from(sign.slice(64, -2), 'hex'),
//         v: options.chainId ? Number(sign.slice(-2)) : 27 // 只有27、28可以通过验签
//       }
//     }
//     if (sign.r && sign.s) {
//       return isValidSignature(sign.v, sign.r, sign.s)
//     } else {
//       return new Error('参数sign不完整')
//     }
//   }
// }


// 创建消息
let createMessage = (content = '', receiver = [], method = '', messageId = utils.getUuid(), createTime = new Date().getTime()) => {
  return JSON.stringify({
    method: method,
    content: content,
    messageId: messageId,
    createTime: createTime,
    receiver: receiver
  })
}

let clientLocal = null

let reConnect = (ws) => {
  if (ws.readyState >= 2) {
    setTimeout(() => {
      clientLocal = null
      clientLocal = initWS(url)
    // }, config.webSocket.reConnectGap)
    }, config.reConnectGap)
  }
}

let initWS = () => {
  ws = new WebSocket(config.url)
  // console.log('ws url', config.url)
  ws.on('open', () => {
    // console.log('ws open')
    // ws.send(createMessage('hello', ['did:ttm:o04d88758f182adbf2e936a4be7b8129ef13fc0f1de9800998ecf8427e54ee'], 'test'))
    if (config.openfn) {
      // console.log('config.openfn')
      config.openfn()
    }
  })
  ws.on('message', (msg) => {
    // 验签工作让应用方做。
    let msgObj = JSON.parse(msg)
    if (config.messagefn) {
      config.messagefn(msgObj)
      let mid = msgObj.messageId
      ws.send(createMessage({messageId: mid}, [msgObj.sender], 'receipt'))
    }
  })
  ws.on('error', (e) => {
    // console.log('ws error config', e)
    // console.log('error', e)
    // reConnect(ws)
    // ws.close()
    if (config.errorfn) {
      // console.log('config.errorfn')
      config.errorfn(e)
    }
  })
  ws.on('close', (e) => {
    // console.log('ws close', e)
    if (config.closefn) {
      // console.log('config.closefn')
      config.closefn(e)
    }
    reConnect(ws)
  })
  return ws
}

// clientLocal = initWS(url)

// module.exports = {
//   websocketClient: clientLocal,
//   createMessage
// }

let setConfig = ({openfn = null, messagefn = null, errorfn = null, closefn = null, reConnectGap = null, isDev = false}) => {
  // if (url) {
  //   config.url = url
  // }
  // if (did) {
  //   config.did = did
  // }
  // console.log('opfn', openfn)
  if (reConnectGap) {
    config.reConnectGap = reConnectGap
  }
  if (openfn) {
    config.openfn = openfn
  }
  if (messagefn) {
    config.messagefn = messagefn
  }
  if (errorfn) {
    config.errorfn = errorfn
  }
  if (closefn) {
    config.closefn = closefn
  }
  if (isDev) {
    config.isDev = isDev
    config.url = `ws://localhost:9875?did=${didttm.did}`
  }
}

// websocket实例
let wsc = ({openfn = null, messagefn = null, errorfn = null, closefn = null, reConnectGap = null, isDev = false}) => {
  setConfig({openfn: openfn, messagefn: messagefn, errorfn: errorfn, closefn: closefn, reConnectGap: reConnectGap, isDev: isDev})
  return initWS()
}
// let wsc = ({openfn = null, messagefn = null, errorfn = null, closefn = null, reConnectGap = null, isDev = false}) => {
//   setConfig({reConnectGap, isDev})
//   return initWS()
// }

module.exports = {
  wsc: wsc,
  createMessage
}

// // 断开ws 测试用
// setInterval(() => {
//   ws.close()
// }, 1000)
// // 查看ws状态 测试用
// setInterval(() => {
//   console.log('ws.readyState', ws.readyState)
//   ws.send(createMessage('hello', [], 'test'))
// }, 1000)
// 检测心跳。用不上了。
// var heartCheck = {
//     timeout: heartBeatTime*1000,  //  心跳检测时长
//     timeoutObj: null, // 定时变量
//     reset: function () { // 重置定时
//         clearTimeout(this.timeoutObj);
//         return this;
//     },
//     start: function () { // 开启定时
//         var self = this;
//         this.timeoutObj = setTimeout(function () {
//           // 心跳时间内收不到消息，主动触发连接关闭，开始重连
//             ws.close();
//         },this.timeout)
//     }
// }
// 使用heartCheck.reset().start()
