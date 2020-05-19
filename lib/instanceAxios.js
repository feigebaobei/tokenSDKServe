// import axios from 'axios'
let axios = require('axios')

const instance = axios.create({
  baseURL: 'http://127.0.0.1:9876/',
  // baseURL: 'https://34cd046f.ngrok.io',
  timeout: 5000
})

axios.defaults.withCredentials = true
// axios.defaults.withCredentials = false
// axios.defaults.headers['Content-Type'] = 'application/json'
// instance.interceptors.request.use(config => {}, error => Promise.reject(error))
instance.interceptors.response.use(res => {
  // console.log(res)
  return res
}, error => {
  return Promise.reject(error)
})

// export default {instance: instance.instance}
// export default instance


// export default {
//   instance
// }
module.exports = {
  instance
}