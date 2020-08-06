// var express = require('express');
// var utils = require('./lib/utils.js')
// var tokenSDKServer = require('token-sdk-server')
// var config = require('./lib/config')
// const redisClient = require('./redisClient.js')
// const http = require('http')
const WebSocket = require('ws')
const path = require('path')
const fs = require('fs')

let {didttm} = require('../../../tokenSDKData/privateConfig.js')

let url = utils.isOnline() ? 'ws://www.lixiaodan.org:9875' : 'ws://localhost:9875'
let did = didttm.did // eg 'did:ttm:o04d88758f182adbf2e936a4be7b8129ef13fc0f1de9800998ecf8427e54ee'
url += `?did=${did}`
let config = {
  url: url,
  did: did || '',
  reConnectGap: 10 * 1000,
  openfn: null,
  messagefn: null,
  errorfn: null,
  closefn: null
}

// 创建消息
let createMessage = (content = '', receiver = [], method = '', messageId = '', createTime = new Date().getTime()) => {
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
  ws.on('open', () => {
    // console.log('open')
    // ws.send(createMessage('hello', [], 'test'))
    if (config.openfn) {
      config.openfn()
    }
  })
  ws.on('message', (msg) => {
    // console.log('message', msg)
    // utils.opMsg(msg)
    if (config.messagefn) {
      config.messagefn(msg)
    }
  })
  ws.on('error', (e) => {
    // console.log('error config', config)
    // console.log('error', e)
    // reConnect(ws)
    // ws.close()
    if (config.errorfn) {
      config.errorfn(e)
    }
  })
  ws.on('close', (e) => {
    // console.log('close', e)
    if (config.closefn) {
      config.closefn(e)
    }
    // reConnect(ws)
  })
  return ws
}

// clientLocal = initWS(url)

// module.exports = {
//   websocketClient: clientLocal,
//   createMessage
// }

let setConfig = ({openfn = null, messagefn = null, errorfn = null, closefn = null, reConnectGap = null}) => {
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
}

// websocket实例
let wsc = ({openfn = null, messagefn = null, errorfn = null, closefn = null, reConnectGap = null}) => {
  // config.url = url
  // config.did = did
  // config.reConnectGap = reConnectGap
  // initWS(url, fn)
  setConfig({openfn: openfn, messagefn: messagefn, errorfn: errorfn, closefn: closefn, reConnectGap: reConnectGap})
  initWS()
}

module.exports = {
  wsc: wsc
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