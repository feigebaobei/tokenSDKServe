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
let webSocketClient = null
// console.log('url', url)
let config = {
  url: url,
  did: did || '',
  reConnectGap: 10 * 1000,
  openfn: null,
  messagefn: null,
  errorfn: null,
  closefn: null,
  isDev: false,
  autoReceipt: true
}

const msgStack = new Set()

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
  ws.on('open', () => {
    if (config.openfn) {
      config.openfn()
    }
  })
  ws.on('message', (msg) => {
    // 验签工作让应用方做。
    let msgObj = JSON.parse(msg)
    switch (msgObj.method) {
      case 'receipt':
        if (config.errorfn && msgObj.content.type === 'error') {
          config.errorfn(msgObj)
        }
        break
      default:
        if (!msgStack.has(msgObj.messageId)) {
          msgStack.add(msgObj.messageId)
          if (config.messagefn) {
            config.messagefn(msgObj)
          }
          if (config.autoReceipt) {
            let receiptmsg = createMessage({messageId: msgObj.messageId}, [msgObj.sender], 'receipt')
            ws.send(receiptmsg)
          }
          break
        }
        break
    }
  })
  ws.on('error', (e) => {
    // ws.close()
    if (config.errorfn) {
      config.errorfn(e)
    }
  })
  ws.on('close', (e) => {
    if (config.closefn) {
      config.closefn(e)
    }
    reConnect(ws)
  })
  webSocketClient = ws
  return ws
}

let setConfig = ({openfn = null, messagefn = null, errorfn = null, closefn = null, reConnectGap = null, isDev = false, autoReceipt = true}) => {
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
  if (!autoReceipt) {
    config.autoReceipt = autoReceipt
  }
  if (isDev) {
    config.isDev = isDev
    config.url = `ws://localhost:9875?did=${didttm.did}`
  }
}

// websocket实例
let wsc = ({openfn = null, messagefn = null, errorfn = null, closefn = null, reConnectGap = null, isDev = false, autoReceipt = true}) => {
  setConfig({openfn: openfn, messagefn: messagefn, errorfn: errorfn, closefn: closefn, reConnectGap: reConnectGap, isDev: isDev, autoReceipt: autoReceipt})
  initWS()
}
let send = (content, receiver, method, messageId, createTime) => {
  webSocketClient.send(createMessage(content, receiver, method, messageId, createTime))
  if (method === 'receipt') {
    msgStack.delete(content.messageId)
  }
}

module.exports = {
  wsc: wsc,
  createMessage,
  send: send,
  msgStack
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
