class Word {
  _loadImagePromise = null
  _animater = null
  _timer = null
  _scale = 0.1
  _maxScale = 1
  _step = 0.01
  _precision = 3
  _status = STATUS.INIT

  ctx = null
  image = null
  stars = []

  constructor(dom, image) {
    this.loadImage(image)
    this._loadImagePromise.then(() => {
      this.initCanvas(dom)
    })
  }

  initCanvas(dom) {
    let canvas = dom

    const isCanvas = canvas.nodeName.toLowerCase() === 'canvas'
    if (!isCanvas) {
      canvas = document.createElement('canvas')
      dom.appendChild(canvas)
    }

    const { width, height } = this.image
    canvas.width = width
    canvas.height = height
    canvas.style.cssText = `width: ${width}px; height: ${height}px;`

    this.ctx = canvas.getContext('2d')
    
    const offScreenCanvas = canvas.cloneNode()
    this.offScreenCtx = offScreenCanvas.getContext('2d')
  }

  loadImage(image) {
    this._loadImagePromise = new Promise((resolve, reject) => {
      let imageElement = image
      if (!(imageElement instanceof HTMLElement)) {
        imageElement = new Image()
        imageElement.src = image
      }
      imageElement.onload = function() {
        resolve(this)
      }
      imageElement.onerror = function(error) {
        reject(error)
      }

      this.image = imageElement
    })
  }

  start() {
    this._status = STATUS.INIT
    this._loadImagePromise.then(() => {
      this.renderImage()
      this.createStars()
      this.render()
    })
  }

  stop() {
    this.clearCtx()
    this._status = STATUS.COMPLETED

    this._animater && cancelAnimationFrame(this._animater)
    this._animater = null
  }

  createStars() {
    const { width, height } = this.ctx.canvas
    for (let x = 0; x < width; x += this._precision) {
     for (let y = 0; y < height; y += this._precision) {
        const data = this.ctx.getImageData(x, y, 1, 1).data
        if (data[3] === 255) { // 实心的才创建对象
          const star = new Star({ x, y })
          this.stars.push(star)
        }
      }
    }
  }

  render() {
    if (this.isBurnOff()) return

    this._animater = requestAnimationFrame(() => {
      if (this._scale < this._maxScale) {
        this.ctx.canvas.style.transform = `scale(${this._scale})`
        this._scale += this._step
        this._step += 0.002
      }

      this.clearCtx()

      // this.renderImage()
      this.renderStars()

      this.render()
    })
  }

  clearCtx() {
    const { ctx } = this
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
  }
  
  renderImage() {
    const { ctx } = this

    const { width, height } = ctx.canvas
    ctx.drawImage(this.image, 0, 0, width, height)
  }

  updateStars() {
    const indexArray = []
    this.stars.forEach((star, index) => {
      star.update()
      if (star.isBurnOff()) {
        indexArray.push(index)
      }
    })

    indexArray.reverse().forEach(index => this.stars.splice(index, 1))

    if (this.stars.length === 0) {
      this.stop()
    }
  }

  renderStars() {
    this.updateStars()
    const { width, height } = this.ctx.canvas

    // star 使用离屏 canvas，以便使用 globalCompositeOperation
    this.offScreenCtx.clearRect(0, 0, width, height)
    this.stars.forEach(star => {
      star.render(this.offScreenCtx)
    })

    this.ctx.save()
    this.ctx.globalCompositeOperation = 'source-over'
    this.ctx.drawImage(this.offScreenCtx.canvas, 0, 0, width, height)
    this.ctx.restore()
  }

  isBurnOff() {
    return this._status === STATUS.COMPLETED
  }
}

const MIN_SIZE = 0.3
const MAX_SIZE = 1
const SHRINK = 0.98
const GRAVITY = 2
class Star {
  x = 0
  y = 0
  fall = false
  gravity = GRAVITY
  size = MIN_SIZE
  maxSize = MAX_SIZE
  color = 'rgba(248, 241, 224, 0.8)'
  shrink = SHRINK

  constructor(options = {}) {
    Object.keys(options).forEach(key => {
      this[key] = options[key]
    })
  }

  update() {
    this.size /= this.shrink

    if (this.fall) {
      this.y += Math.random(0.5, 1) * this.gravity
    }
    if (this.size >= this.maxSize) {
      this.shrink = 1 / this.shrink
      this.fall = true
    }
  }

  render(ctx) {
    if (this.isBurnOff()) return

    ctx.save()

    const { x, y } = this

    ctx.fillStyle = this.color

    ctx.beginPath()
    ctx.arc(x, y, this.size, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.fill()

    ctx.restore()
  }

  isBurnOff() {
    return this.size < MIN_SIZE
  }
}