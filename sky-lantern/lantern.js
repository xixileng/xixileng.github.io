(function () {
  const svg = document.querySelector('svg')
  const WIDTH = svg.viewBox.baseVal.width
  const HEIGHT = svg.viewBox.baseVal.height
  
  const container = document.querySelector('.lanternContainer')
  const originLantern = document.querySelector('#lantern')

  const COUNT = 30
  
  for (let index = 0; index < COUNT; index++) {
    const interval = random(0.8, 1.5) * index * 1000
    setTimeout(() => {
      const lantern = createLantern(originLantern)
      container.appendChild(lantern)
    }, interval);
  }

  function createLantern(originLantern) {
    const lantern = originLantern.cloneNode(true)
    const x = random(0, WIDTH)
    const y = HEIGHT
    lantern.style.transformOrigin = `0px 0px 0px`
    lantern.style.transform = `translate3d(${x}px, ${y}px ,0)`
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
      lantern.style.transform = `translate3d(${x}px, ${y}px ,0) scale3d(${scale}, ${scale}, 1)`

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