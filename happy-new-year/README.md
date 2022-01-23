## 常见问题

### 运行方式
将代码拷贝到本地后，双击 index.html，或者访问在线地址 https://xixileng.github.io/happy-new-year/

### 修改烟花颜色
同目录下的 constants.js 文件里，修改 DEFAULT_COLORS 的值即可，是一个颜色数组，常规的 HEX、RGBA、HSLA 都可兼容

### 修改烟花其他属性
同目录下的 fireworks.js 文件里，有详细的注释，修改之后刷新网页即可查看效果

### 修改文字
1. 创建一张透明背景的图片，图片主体必须为完全不透明的
2. 将图片转为 base64 格式以避免本地跨域（在线转换可前往：https://www.base64-image.de/）
3. 拿到 base64 数据后，粘贴到 imageSrc.js 内，保留文件开头结尾，使其成为 const imageSrc = 'xxx' 的结构
4. 刷新网页即可查看效果