const requestCallback = (function () {
  let func = setTimeout
  if (window.requestIdleCallback) {
    func = function (callback, timeout) {
      return window.requestIdleCallback(callback, { timeout })
    }
  }
  return func
})()

const cancelCallback = window.cancelIdleCallback || clearTimeout

const STATUS = {
  RUNNING: 'running',
  STOPPED: 'stopped',
  COMPLETED: 'completed',
}

const isFunction = (obj) => typeof obj === 'function'
const wrapperFunction = (obj) => (isFunction(obj) ? obj : () => obj)

// 任务管理器，浏览器空闲时才会执行任务
export default class TaskManager {
  queueId = 0 // 每批任务的 id
  status = 'completed' // 任务管理器状态
  requestItem = null // 当前的请求单元
  timeout = 1000 // 默认延迟一秒
  tasks = [] // 任务列表
  listeners = {} // 监听事件列表
  perConcurrency = 6 // 单次任务队列并发量
  currentConcurrency = 0 // 当前并发量

  constructor(options = {}) {
    Object.keys(options).forEach((key) => {
      if (this[key] !== undefined) {
        this[key] = options[key]
      }
    })
  }

  setTimeout(timeout) {
    this.timeout = timeout
  }

  addTask(task) {
    this.tasks.push(task)
    return this
  }

  removeTask(task) {
    this.tasks = this.tasks.filter((child) => child !== task)
    return this
  }

  run() {
    if (this.status === STATUS.RUNNING) return

    this.queueId += 1
    this.status = STATUS.RUNNING
    this.emit('start', this)
    requestCallback(this.taskLoop.bind(this), this.timeout)
  }

  taskLoop(deadline) {
    if (this.empty()) {
      if (this.currentConcurrency === 0) {
        this.complete()
      }
    } else {
      const concurrency = this.perConcurrency - this.currentConcurrency
      for (let i = 0; i < concurrency; i++) {
        this.runTask(deadline)
      }
    }
  }

  async runTask(deadline) {
    const currentTask = this.tasks.shift()
    if (!currentTask) return

    try {
      this.currentConcurrency += 1
      const { queueId } = this
      const result = await wrapperFunction(currentTask)()
      this.emit('task-complete', this, result, queueId)
    } catch (error) {
      this.error(error)
    } finally {
      this.currentConcurrency -= 1

      if (this.status === STATUS.STOPPED) return

      if (!this.empty() && (!deadline || deadline.timeRemaining() > 1)) {
        this.runTask(deadline)
      } else {
        this.checkTasks()
      }
    }
  }

  checkTasks() {
    if (this.empty()) {
      if (this.currentConcurrency === 0) {
        this.complete()
      }
    } else {
      this.requestItem = requestCallback(this.taskLoop.bind(this), this.timeout)
    }
  }

  stop() {
    this.requestItem && cancelCallback(this.requestItem)
    if (this.status === STATUS.RUNNING) {
      this.status = STATUS.STOPPED
      this.emit('stop', this)
    }
  }

  clear() {
    this.stop()
    this.tasks = []
  }

  destroy() {
    this.clear()
    this.listeners = {}
  }

  error(error) {
    this.emit('task-error', this, error)
  }

  complete() {
    if (this.status !== STATUS.COMPLETED) {
      this.status = STATUS.COMPLETED
      this.emit('complete', this)
    }
  }

  emit(type, ...arg) {
    if (this.listeners[type]) {
      this.listeners[type].forEach((listener) => {
        listener(...arg)
      })
    }
  }

  empty() {
    return this.tasks.length === 0
  }

  on(type, listener) {
    if (this.listeners[type]) {
      this.listeners[type].push(listener)
    } else {
      this.listeners[type] = [listener]
    }
  }

  off(type, listener) {
    if (!type) {
      this.listeners = {}
    } else if (!listener) {
      this.listeners[type] = []
    } else if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter((child) => child !== listener)
    }
  }
}
