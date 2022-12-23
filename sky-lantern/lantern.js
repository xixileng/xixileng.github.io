(function () {
  const WIDTH = window.innerWidth
  const HEIGHT = window.innerHeight

  const svg = document.querySelector('svg')
  svg.setAttribute('width', WIDTH)
  svg.setAttribute('height', HEIGHT)
  svg.setAttribute('viewBox', `0 0 ${WIDTH} ${HEIGHT}`)
  
  const container = document.querySelector('.lanternContainer')
  const originLantern = document.querySelector('#lantern')

  const COUNT = 60
  
  for (let index = 0; index < COUNT; index++) {
    const interval = random(0.2, 0.5) * index * 1000
    setTimeout(() => {
      const lantern = createLantern(originLantern)
      container.appendChild(lantern)
    }, interval);
  }

  function createLantern(originLantern) {
    const lantern = originLantern.cloneNode(true)
    const x = random(WIDTH * 0.1, WIDTH * 0.9)
    const y = HEIGHT
    const transformOrigin = `0 0`
    const transform = `translate(${x}, ${y})`
    lantern.setAttribute('transformOrigin', transformOrigin)
    lantern.setAttribute('transform', transform)
    lantern.x = x
    lantern.y = y
    lantern.deltaX = random(-0.5, 0.5)
    lantern.deltaY = random(0.5, 1)
    lantern.scale = 1
    return lantern
  }

  setInterval(() => {
    const lanterns = container.children
    for (let index = 0; index < lanterns.length; index++) {
      const lantern = lanterns[index];
      let x = lantern.x + lantern.deltaX
      let y = lantern.y - lantern.deltaY
      let scale = lantern.scale
      if (y <= HEIGHT - 100) {
        scale *= 0.996
      }
      const transform = `translate(${x}, ${y}) scale(${scale}, ${scale})`
      lantern.setAttribute('transform', transform)

      if (y <= -100 || x <= -100 || x > WIDTH) {
        x = random(0, WIDTH)
        y = HEIGHT
        scale = 1
      }
      lantern.x = x
      lantern.y = y
      lantern.scale = scale
    }
  }, 16.6); // animationFrame 在高刷屏下跑太快了
})()