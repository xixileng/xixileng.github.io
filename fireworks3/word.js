const WORD_STATUS = {
  INIT: 'init',
  COMPLETE: 'complete'
}

class Word {
  _loadImagePromise = null
  _animater = null
  _timer = null
  _scale = 0.1
  _maxScale = 1
  _step = 0.01
  _status = WORD_STATUS.INIT

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
    this._status = WORD_STATUS.INIT
    this._loadImagePromise.then(() => {
      this.renderImage()
      this.createStars()
      this.render()
    })
  }

  stop() {
    this.clearCtx()
    this._status = WORD_STATUS.COMPLETE

    this._animater && cancelAnimationFrame(this._animater)
    this._animater = null
  }

  createStars() {
    const { width, height } = this.ctx.canvas
    for (let x = 0; x < width; x += 10) {
     for (let y = 0; y < height; y += 10) {
        const data = this.ctx.getImageData(x, y, 1, 1).data
        if (data[3] > 0) {
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
      }

      this.clearCtx()

      this.renderImage()
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
    this.ctx.globalCompositeOperation = 'source-in'
    this.ctx.drawImage(this.offScreenCtx.canvas, 0, 0, width, height)
    this.ctx.restore()
  }

  isBurnOff() {
    return this._status === WORD_STATUS.COMPLETE
  }
}

class Star {
  x = 0
  y = 0
  size = 3
  maxSize = 8
  color = 'rgba(248, 241, 224, 0.8)'
  shrink = 0.99

  constructor(options = {}) {
    Object.keys(options).forEach(key => {
      this[key] = options[key]
    })
    this.shadowColor = tinycolor(this.color).setAlpha(0.1)
  }

  update() {
    this.size /= this.shrink

    if (this.size >= this.maxSize) {
      this.shrink = 1 / this.shrink
    }
  }

  render(ctx) {
    if (this.isBurnOff()) return

    ctx.save()

    const { x, y } = this
    const radius = this.size / 2

    // const gradient = ctx.createRadialGradient(x, y, 0.1, x, y, radius)
    // gradient.addColorStop(0.1, 'rgba(255,255,255,0.5)')
    // gradient.addColorStop(0.8, this.color)
    // gradient.addColorStop(1, this.shadowColor)

    // ctx.fillStyle = gradient

    ctx.fillStyle = this.color

    ctx.beginPath()
    ctx.arc(x, y, this.size, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.fill()

    ctx.restore()
  }

  isBurnOff() {
    return this.size < 1.2
  }
}