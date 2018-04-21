'use strict';

/**
 * 五一数钱小游戏页面
 *
 * CountMoneyGame类，代表一个数钱游戏类。
 * @constructor
 * @date 2018/04/09
 * @author 山茶
 * 构造函数模式用于定义实例属性,原型模式用于定义方法和共享的属性(用的有点混)
 * DOM操作上混杂了原生js和zepto,阅读不畅请谅解~~
 */

// const dialog = require('components/dialog/dialog');
// 五一数钱游戏类
function CountMoneyGame() {
  // 用变量保存多处使用的DOM节点,减少节点获取次数
  this.game_background = document.getElementById('game-background');
  this.shadow_wrap = document.getElementById('shadow-wrap');
  this.result_wrap = document.getElementById('result-wrap');
  this.floatMoney_1 = document.getElementById('float-money-1');
  this.floatMoney_2 = document.getElementById('float-money-2');
  this.floatMoney_3 = document.getElementById('float-money-3');
  // 纸币初始位置
  this.initial_y = parseFloat($('.money-100').css('top'));
  this.money_index = parseInt($('.money-100').css('z-index'));
  // 优惠券
  this.result_discount = '//cdn1.showjoy.com/images/55/552c2be43a8e478fa12a1789f49b5275.png';
  // 0元购物券
  this.result_zero = '//cdn1.showjoy.com/images/50/508530819b8b493a90975d55f9a6b19a.png';
  // 免单
  this.result_free = '//cdn1.showjoy.com/images/96/96eec1fa08a54684a2dbf7d29603071f.png';
  // 未满6900
  this.result_nothing = '//cdn1.showjoy.com/images/d0/d026e37e1107409f97e7ad323293b5bd.png';
  // 满6900未中奖
  this.result_no_award = '//cdn1.showjoy.com/images/12/12bc6c23ba9546c897f488e38d196e72.png';
  this.result_url = '';
  // 动画结束事件兼容性判断
  this.animationType = this.game_background.style.WebkitAnimation === undefined ? 'animationend' : 'webkitAnimationEnd';
}

CountMoneyGame.prototype = {
  init(){
    this.initData();
    this.bindOnceEvent();
    this.bindEvent();
  },
  // 初始化成员变量，初始化DOM显示
  initData() {
    this.startY = 0; // 拖动起始坐标
    this.beforeY = 0; // 拖动前一刻坐标
    this.currentY = 0; // 拖动即时坐标
    this.endY = 0; // 拖动抬起坐标
    this.moneyTotal = 0; // 获取钞票总数
    this.secondCurrent = 15; // 倒计时秒
    this.msCurrent = 0; // 倒计时毫秒(*100)
    this.timeInterval = null; // 倒计时定时器
    this.gameNumber = this.getGameNumber(); // 剩余游戏次数
    this.result_wrap.style.display = 'none';
    document.getElementById('second-time').innerHTML = '15';
    document.getElementById('ms-time').innerHTML = '00';
    document.getElementById('game-count').innerHTML = this.gameNumber;
    document.getElementById('moneyTotal').innerHTML = '0';
  },

  bindOnceEvent() {
    // 开启定时器，只启动一次(初始zIndex都是999,最后一个会默认最上)
    $('#game-moneys').one('touchstart',(e) => {
      e.preventDefault();
      this.startTime();
    });
  },
  // 事件绑定  采用事件委托机制,让父容器响应事件,减少事件绑定优化性能
  bindEvent() {
    let shadowImg = $('#shadow-img');
    const gameMoneys = $('#game-moneys');
    let opacity = 0;
    shadowImg.on('touchstart',(e) => {
      this.touchstartHandle(e);
    });
    shadowImg.on('touchmove',(e) => {
      this.touchmoveHandle(e, () => {
        opacity = 1 / (this.startY - this.currentY) * 10;
        if (opacity <= 0.8) {
          this.shadow_wrap.style.opacity = opacity;
        }
      });
    });
    shadowImg.on('touchend',(e) => {
      this.touchendHandle(e, () => {
        // 得把变量销毁,不然不用了还占着内存
        shadowImg = null;
        this.shadow_wrap = null;
        // innnerHTML='' 的效率比remove高
        document.getElementById('game-shadow').innerHTML = '';
      },() => {
        $('#shadow-wrap').css('opacity', 0.8);
      });
    });
    // 开始数钱
    gameMoneys.on('touchstart', (e) => {
      this.touchstartHandle(e, (target) => {
        target.css('zIndex', this.money_index + 1);
      });
    });
    // 数钱中
    gameMoneys.on('touchmove', (e) => {
      this.touchmoveHandle(e, (target) => {
        if (this.startY - this.currentY > 100) {
          target.css('opacity', 0.8);
        }
      }, true);
    });
    // 数完该张
    gameMoneys.on('touchend', (e) => {
      document.getElementById('money-audio').load();
      document.getElementById('money-audio').play();
      this.touchendHandle(e, (target) => {
        // 结束动画回调,让钱归位复用
        target.css({
          top: this.initial_y,
          opacity: 1,
          zIndex: this.money_index - 1,
        });
        // 掉钱
        this.fallMoney();
      }, undefined, true);
    });

    $('#play-again').on('touchend',() => {
      this.onceAgain();
    });
  },
  // 获取游戏次数
  getGameNumber() {
    return 3;
  },
  // 减少游戏次数
  reduceGameNumber() {
    $.get('/m/api/shop/activity/reduceLotteryNumber');
  },
  // 移除事件
  removeEvent() {
    const shadowImg = $('#shadow-img');
    shadowImg.off('touchstart');
    shadowImg.off('touchmove');
    shadowImg.off('touchend');
  },
  // 游戏结束
  gameOver() {
    clearInterval(this.timeInterval);
    document.getElementById('result-audio').play();
    this.countResult();
  },
  countResult() {
    this.gameNumber -= 1;
    const lastMoneyTotal = this.moneyTotal;
    document.getElementById('money-count').innerHTML = `您数了${lastMoneyTotal}元`;
    // 发请求获得游戏结果,根据结果进入不同游戏界面
    if (lastMoneyTotal >= 6900) {
      // $.getJSON('/m/api/shop/activity/drawLottery', (data) => {
        const type = ~~(Math.random()*4+1);
        const data = {
          type: type,
          success: type < 4,
          worth: 15,
          couponName: '满199元可用',
          orderNumber: '8888888888'
        }
        if(data.success) {
          // 据说这样更符合面向对象编程理念,重点是eslint对switch缩进判断很坑啊~~~
          const resultType = {
            '1': [this.result_discount, '<span class="discount-count">'+data.worth+
              '</span><span class="discount-full">'+data.couponName+'</span>'],
            '2': [this.result_free, '<span class="free-content"><p class="free-order-number">免单单号 '+data.orderNumber+
              '</p><p class="free-word">订单只针对活动期间的有效订单哦</p>'+
              '<a href="javascript:void(0)" class="look-details">点击查看免单详情</a></span>'],
            '3': [this.result_zero, ''],
          };
          this.result_url = resultType[data.type][0];
          document.getElementById('result-content-dom').innerHTML = resultType[data.type][1];
        } else {
          this.result_url = this.result_no_award;
        }
        this.showResult();
      // });
    } else {
      // this.reduceGameNumber();
      this.result_url = this.result_nothing;
      this.showResult();
    }
  },
  // 结果界面
  showResult() {
    const resultImg = new Image();
    resultImg.src = this.result_url;
    const resultGroup = document.getElementById('result-group');
    resultImg.onload = () => {
      resultGroup.style.height = resultImg.height/2 + 'px';
      resultImg.style.cssText = 'position: absolute; top: 0';
      this.result_wrap.insertBefore(resultImg, resultGroup);
      this.result_wrap.style.display = 'block';
      setTimeout(() => { this.result_wrap.style.pointerEvents = 'auto';},1000);
    };
  },
  // 再玩一次
  onceAgain() {
    if (this.gameNumber <= 0) {
      // dialog.toast('抱歉,您的机会已用完,可以下单/分享来获取次数哦!');
      return false;
    }
    this.result_wrap.style.display = 'none';
    this.initData();
    this.bindOnceEvent();
  },
  // 退出游戏
  exit() {
    this.removeEvent();
  },
  // 分享游戏
  share() {
    $.get('/m/api/shop/activity/share');
  },
  // 定时器开始
  startTime() {
    const secondDom = document.getElementById('second-time');
    const msDom = document.getElementById('ms-time');
    // 定时器有延迟,得先手动执行一次
    this.secondTime(secondDom, msDom);
    // 定时器第一个参数避免传入字符串,应当避免JS解析JS
    this.timeInterval = setInterval(() => {
      this.secondTime(secondDom, msDom);
    },100);
  },
  // 倒计时定时器
  secondTime(second, ms) {
    if(this.msCurrent % 10 === 0){
      if(this.secondCurrent <= 0){
        this.gameOver();
        return false;
      }
      this.secondCurrent -= 1;
      second.innerHTML = ('0' + this.secondCurrent).substr(-2);
      this.msCurrent = 10;
    }
    this.msCurrent -= 1;
    ms.innerHTML = '0' + this.msCurrent;
  },
  // 滑动开始事件
  touchstartHandle(e, callback) {
    e.preventDefault();
    this.startY = +e.changedTouches[0].clientY;
    this.beforeY = +e.changedTouches[0].clientY;
    if (callback) {
      callback($(e.target));
    }
  },
  // 滑动过程事件
  touchmoveHandle(e, callback = () => {}, isMoney = false) {
    e.preventDefault();
    this.currentY = +e.changedTouches[0].clientY;
    const target = isMoney ? $(e.target) : $(e.currentTarget);
    let targetY = parseFloat(target.css('top'));
    target.css('top', targetY - (this.beforeY - this.currentY));
    this.beforeY = this.currentY;
    callback(target);
  },
  // 滑动结束事件
  touchendHandle(e, next = () => {}, cancel = () => {}, isMoney = false) {
    e.preventDefault();
    const target = isMoney ? $(e.target) : $(e.currentTarget);
    this.endY = +e.changedTouches[0].clientY;
    // 设置50像素触发距离
    if (this.startY - this.endY > 50) {
      if (isMoney) {
        this.moneyTotal += 100;
        document.getElementById('moneyTotal').innerHTML = '' + this.moneyTotal;
      }
      target.animate({
        top: '-'+target.css('height'),
        opacity: 0,
      },300,'linear', () => {next(target);});
    } else {
      // 回到初始位置
      target.animate({
        top: isMoney ? this.initial_y : 0,
        opacity: 1,
      },100,'linear', () => {cancel();});
    }
  },
  fallMoney() {
    // 计算初始偏移量,顺便用于选图
    const random = ~~(Math.random()*90);
    //  根据随机值随机选择掉钱模型
    let currentMoney = !(random % 3) ? this.floatMoney_1.cloneNode(false) :
      (random & 1 ? this.floatMoney_2.cloneNode(false) : this.floatMoney_3.cloneNode(false));
    currentMoney.onload = () => {
      // 位运算速度更快
      currentMoney.style.left = random +'%';
      // 添加进背景图层
      this.game_background.appendChild(currentMoney);
      currentMoney.className += ' fall-animation';
      // 动画结束回调
      currentMoney.addEventListener(this.animationType, () => {
        this.game_background.removeChild(currentMoney);
        // 清空对象,移除事件绑定
        currentMoney = null;
      });
    };
  },
};

new CountMoneyGame().init();
// gogogo
