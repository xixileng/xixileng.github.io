(function ($) {
  $.fn.fireworks = function (options) {
    // set the defaults
    options = options || {};

    options.opacity = options.opacity || 1;
    options.width = options.width || $(this).width();
    options.height = options.height || $(this).height();
    options.clear = options.clear === void 0 ? true : !!options.clear;

    var fireworksField = this,
      particles = [],
      rockets = [],
      MAX_PARTICLES = 400,
      SCREEN_WIDTH = options.width,
      SCREEN_HEIGHT = options.height;

    // create canvas and get the context
    var canvas = document.createElement('canvas');
    canvas.id = 'fireworksField';
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
    canvas.style.width = SCREEN_WIDTH + 'px';
    canvas.style.height = SCREEN_HEIGHT + 'px';
    canvas.style.position = 'absolute';
    canvas.style.top = '0px';
    canvas.style.left = '0px';
    canvas.style.opacity = options.opacity;
    var context = canvas.getContext('2d');

    // The Particles Object
    function Particle(pos) {
      // 位置
      this.pos = {
        x: pos ? pos.x : 0,
        y: pos ? pos.y : 0,
      };
      // 速度
      this.vel = {
        x: 0,
        y: 0,
      };
      this.shrink = 0.97;
      this.size = 2;

      this.resistance = 1;
      this.gravity = 0;

      this.flick = false;

      this.alpha = 1;
      this.fade = options.clear ? 0 : 0.01;

      this.color = 0;
    }

    Particle.prototype.update = function () {
      // apply resistance
      this.vel.x *= this.resistance;
      this.vel.y *= this.resistance;

      // gravity down
      this.vel.y += this.gravity;

      // update position based on speed
      this.pos.x += this.vel.x;
      this.pos.y += this.vel.y;

      // shrink
      this.size *= this.shrink;

      // fade out
      this.alpha -= this.fade;
    };

    Particle.prototype.render = function (c) {
      if (!this.exists()) {
        return;
      }

      c.save();

      c.globalCompositeOperation = 'lighter';

      var x = this.pos.x,
        y = this.pos.y,
        r = this.size / 2;

      var gradient = c.createRadialGradient(x, y, 0.1, x, y, r);
      gradient.addColorStop(0.1, 'rgba(255,255,255,' + this.alpha + ')');
      gradient.addColorStop(
        0.8,
        'hsla(' + this.color + ', 100%, 50%, ' + this.alpha + ')'
      );
      gradient.addColorStop(1, 'hsla(' + this.color + ', 100%, 50%, 0.1)');

      c.fillStyle = gradient;

      c.beginPath();
      c.arc(
        this.pos.x,
        this.pos.y,
        this.flick ? Math.random() * this.size : this.size,
        0,
        Math.PI * 2,
        true
      );
      c.closePath();
      c.fill();

      c.restore();
    };

    Particle.prototype.exists = function () {
      return this.alpha >= 0.1 && this.size >= 1;
    };

    // The Rocket Object
    function Rocket(x, y) {
      Particle.apply(this, [
        {
          x: x,
          y: y,
        },
      ]);

      this.explosionColor = 0;
    }

    Rocket.prototype = new Particle();
    Rocket.prototype.constructor = Rocket;

    Rocket.prototype.explode = function () {

      var count = Math.random() * 10 + 80;

      for (var i = 0; i < count; i++) {
        var particle = new Particle(this.pos);
        var angle = Math.random() * Math.PI * 2;

        // emulate 3D effect by using cosine and put more particles in the middle
        var speed = Math.cos((Math.random() * Math.PI) / 2) * 15;

        particle.vel.x = Math.cos(angle) * speed;
        particle.vel.y = Math.sin(angle) * speed;

        particle.size = 10;

        particle.gravity = 0.2;
        particle.resistance = 0.92;
        particle.shrink = Math.random() * 0.05 + 0.93;

        particle.flick = true;
        particle.color = this.explosionColor;

        particles.push(particle);
      }
    };

    Rocket.prototype.render = function (c) {
      if (!this.exists()) {
        return;
      }

      c.save();

      c.globalCompositeOperation = 'lighter';

      var x = this.pos.x,
        y = this.pos.y,
        r = this.size / 2;

      var gradient = c.createRadialGradient(x, y, 0.1, x, y, r);
      gradient.addColorStop(0.1, 'rgba(255, 255, 255 ,' + this.alpha + ')');
      gradient.addColorStop(1, 'rgba(0, 0, 0, ' + this.alpha + ')');

      c.fillStyle = gradient;

      c.beginPath();
      c.arc(
        this.pos.x,
        this.pos.y,
        this.flick
          ? (Math.random() * this.size) / 2 + this.size / 2
          : this.size,
        0,
        Math.PI * 2,
        true
      );
      c.closePath();
      c.fill();

      c.restore();
    };

    var loop = function () {
      // update screen size
      if (SCREEN_WIDTH != window.innerWidth) {
        canvas.width = SCREEN_WIDTH = window.innerWidth;
      }
      if (SCREEN_HEIGHT != window.innerHeight) {
        canvas.height = SCREEN_HEIGHT = window.innerHeight;
      }

      // clear canvas
      if (options.clear) {
        context.fillStyle = 'rgba(0, 0, 0, 0.05)';
        context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      }

      var existingRockets = [];

      for (var i = 0; i < rockets.length; i++) {
        // update and render
        rockets[i].update();
        rockets[i].render(context);

        // calculate distance with Pythagoras
        var distance = Math.sqrt(
          Math.pow(SCREEN_WIDTH - rockets[i].pos.x, 2) +
            Math.pow(SCREEN_HEIGHT - rockets[i].pos.y, 2)
        );

        // random chance of 1% if rockets is above the middle
        var randomChance =
          rockets[i].pos.y < (SCREEN_HEIGHT * 2) / 3
            ? Math.random() * 100 <= 1
            : false;

        /* Explosion rules
                 - 80% of screen
                - going down
                - close to the mouse
                - 1% chance of random explosion
            */
        if (
          rockets[i].pos.y < SCREEN_HEIGHT / 5 ||
          rockets[i].vel.y >= 0 ||
          distance < 50 ||
          randomChance
        ) {
          rockets[i].explode();
        } else {
          existingRockets.push(rockets[i]);
        }
      }

      rockets = existingRockets;

      var existingParticles = [];

      for (i = 0; i < particles.length; i++) {
        particles[i].update();

        // render and save particles that can be rendered
        if (particles[i].exists()) {
          particles[i].render(context);
          existingParticles.push(particles[i]);
        }
      }

      // update array with existing particles - old particles should be garbage collected
      particles = existingParticles;

      while (particles.length > MAX_PARTICLES) {
        particles.shift();
      }
    };

    function random(numbers) {
      return numbers[Math.floor(Math.random() * numbers.length)];
    }

    var launchFrom = function (x, y) {
      if (rockets.length < 20) {
        var rocket = new Rocket(x, y);

        rocket.explosionColor = random([210, 270, 255, 30, 285]);
        rocket.vel.y = Math.random() * -6 - 4;
        rocket.vel.x = Math.random() * 6 - 3;
        rocket.size = 8;
        rocket.shrink = 0.999;
        rocket.gravity = 0.01;
        rockets.push(rocket);
      }
    };

    var launch = function () {
      launchFrom(SCREEN_WIDTH * Math.random(), 300 * Math.random() + 400);
    };

    // Append the canvas and start the loops
    $(fireworksField).append(canvas);
    setInterval(launch, 500);
    setInterval(loop, 1000 / 60);

    return fireworksField;
  };
})(jQuery);
