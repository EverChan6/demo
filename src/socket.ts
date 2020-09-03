
import baseUrl from './baseUrl'

interface cb {
  openCb?: (e: Event) => void,
  messageCb?: (e: Event) => void,
  closeCb?: (e: Event) => void, 
  errorCb?: (e: socketError) => void
}

interface socketError {
  code: number,
  reason: string,
  wasClean: boolean
}

class WS {
  lockReconnect: boolean = false        // 避免ws重复连接
  wsUrl: string = baseUrl.webSocketUrl  // websocket url
  timeout: any
  ws: any                               // websocket实例
  toObj: any = null
  serverToObj: any = null

  constructor(cbs: cb) {
    this.creatWebSocket()
    this.handleWebSocket(cbs)
    return this.ws // 返回实例对象，可调用ws.close()等关闭连接
  }

  creatWebSocket(): void {
    try {
      if(this.timeout) {
        clearTimeout(this.timeout)
      }
      this.ws = new WebSocket(this.wsUrl)
      this.lockReconnect = true
    } catch(e) {
      this.lockReconnect = false
      throw new Error(e)
    }
  }

  handleWebSocket(cbs: cb): void {
    if(!this.ws) return
    this.ws.addEventListener('open', (e: Event) => {
      cbs.openCb(e)
    })
    this.ws.addEventListener('message', (e: Event) => {
      this.heartBeat.reset()
      this.heartBeat.start()  // 定时发送心跳以防止连接自动断开
      cbs.messageCb(e)
    })
    this.ws.addEventListener('close', (e: Event) => {
      cbs.closeCb(e)
    })
    this.ws.addEventListener('error', (e: socketError) => {
      console.log('websocket已断开: ' + e.code + ' ' + e.reason + ' ' + e.wasClean)
      cbs.errorCb(e)
      this.reconnect()  // 发生错误的时候尝试重连
    })
  }

  reconnect(): void {
    if(this.lockReconnect) return
    this.timeout = setTimeout((): void => {
      this.creatWebSocket()
    }, 5000)
  }

  heartBeat: any = {
    reset: (): void => {
      if(this.toObj) {
        clearTimeout(this.toObj)
      }
      if(this.serverToObj) {
        clearTimeout(this.serverToObj)
      }
    },
    start: (): void => {
      this.toObj = setTimeout((): void => { // warning:如果后端对这个心跳不作处理的话，似乎这里要用interval?
        this.ws.send('发送一个心跳💓')
        this.serverToObj = setTimeout((): void => {
          this.ws.close()
        }, 1000)
      }, 1000)
    }
  }
}


export default WS