module.exports = {
  errorMap: {
    donotRepeatSign: {
      code: '',
      message: '在签名有效期内，不能重复签名。'
    },
    getCertifyFingerPrint: {
      code: '',
      message: '请求证书指纹时出错。'
    },
    sign: {
      code: '',
      message: '签名失败'
    },
    getTemplate: {
      code: '',
      message: '获取证书模板时出错'
    },
    setPendingItemIsPersonCheck: {
      code: '',
      message: '变更人工审核状态时出错'
    },
    noPendingTaskItem: {
      code: '',
      message: '没有指定的待办事项'
    },
  },
  tkDataPath: {
    root: './tokenSDKData',
    priv: './tokenSDKData/privateConfig.js',
    pvdata: './tokenSDKData/pvdataCt.txt'
  }
}