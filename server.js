const port = 5001; // 服务器端口  
const host = '172.18.4.143'; // 服务器IP地址  
//const blacklist = ['123.45.67.89', '98.76.54.32']; // 示例黑名单IP地址  
const moment = require('moment-timezone'); // 引入moment-timezone模块，用于处理时区  
const express = require('express'); // 引入express模块，用于创建服务器  
const multer = require('multer'); // 引入multer模块，用于处理文件上传  
const morgan = require('morgan'); // 引入morgan模块，用于日志记录  
const rateLimit = require('express-rate-limit'); // 引入express-rate-limit模块，用于限制请求频率  
const path = require('path'); // 引入path模块，用于处理文件路径  
const fs = require('fs'); // 引入fs模块，用于文件系统操作 
const app = express();

//日志输出并打印至log文件

// 自定义日期格式函数，设置为中国北京时区  
function customDateFormat() {
  return moment().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');
}

// 获取客户端IP地址的函数  
function getClientIp(req) {
  return req.headers['x-forwarded-for'] ||
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress ||
    '';
}

// 将IPV6地址转换为IPV4地址（如果可能）的函数  
// 注意：这个函数可能不是总是有效的，因为不是所有的IPV6地址都可以这样转换  
// 这里假设了一个特定的格式，这可能不适用于所有情况  
function ipv6ToV4(ip) {
  const parts = ip.split(':');
  // 检查是否是IPV6地址的特定格式，这里只是一个简化的例子  
  if (parts.length > 4 && parts[parts.length - 1].includes('.')) {
    // 假设最后一部分是嵌套的IPV4地址  
    return parts[parts.length - 1];
  } else if (ip.includes(',')) {
    // 处理X-Forwarded-For头中的多个IP地址  
    const ips = ip.split(',');
    for (const ipPart of ips) {
      const ipV6Candidate = ipPart.trim();
      const v4 = ipv6ToV4Candidate(ipV6Candidate);
      if (v4) {
        return v4;
      }
    }
  }
  // 如果没有找到IPV4地址，返回空字符串或原始IPV6地址（根据需要调整）  
  return ''; // 或者返回 ip（如果希望保留原始输入）  
}

// 处理单个IPV6候选地址的函数（为了代码清晰而分离）  
function ipv6ToV4Candidate(ip) {
  const parts = ip.split(':');
  if (parts.length > 4 && parts[parts.length - 1].includes('.')) {
    return parts[parts.length - 1];
  }
  return '';
}

// 创建一个自定义的token用于IP地址  
morgan.token('client-ip', (req, res) => {
  const rawIp = getClientIp(req);
  return ipv6ToV4(rawIp) || rawIp; // 尝试转换，如果失败则返回原始IP  
});

// 创建一个自定义的token用于日期  
morgan.token('local-date', customDateFormat);

// 配置morgan中间件以将日志输出到终端（控制台）  
app.use(morgan(':local-date :client-ip :method :url :status :response-time[2]ms - :res[content-length]b', {
  skip: function (req, res) { return false; } // 确保所有请求都被记录  
}));

// 创建一个写入流，用于将日志写入文件  
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'data/access.log'), { flags: 'a' });

// 配置morgan中间件以将日志输出到文件  
app.use(morgan(':local-date :client-ip :method :url :status :response-time[2]ms - :res[content-length]b', {
  stream: accessLogStream,
  skip: function (req, res) { return false; } // 确保所有请求都被记录到文件中  
}));

//频繁请求短暂封禁ip

// 创建一个速率限制中间件，仅使用 IP 地址作为键  
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟  
  max: 100, // 每个 IP 在时间窗口内最多 100 个请求  
  message: { error: '请求过多喵~请稍候再试喵~' }, // 自定义错误消息  
  keyGenerator: function (req) {
    // 更精确地获取客户端 IP 地址，考虑代理和 IPv6  
    let ip = req.headers['x-forwarded-for'] || '';
    if (!ip || ip.includes(',')) { // 处理 X-Forwarded-For 头中的多个 IP 地址或缺失  
      ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || '';
      if (ip.includes('::ffff:')) { // 处理 IPv6 映射的 IPv4 地址  
        ip = ip.split('::ffff:')[1];
      }
    } else {
      // 如果 X-Forwarded-For 存在且只有一个 IP 地址，则直接使用  
      ip = ip.split(',')[0].trim();
    }
    return ip;
  }
});

// // 使用速率限制中间件  
app.use(limiter);

//api
function getRandomLanguage() {
  const languages = ['大吉喵~', '中吉喵~', '吉喵~', '凶喵~',];
  const randomIndex = Math.floor(Math.random() * languages.length);
  return languages[randomIndex];
};
// 路由：获取包含随机语言、当前时间和请求 IP 的 JSON 信息
app.get('/api', (req, res) => {
  const randomLanguage = getRandomLanguage();
  const currentTime = moment().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');
  const clientIp = getClientIp(req);

  res.json({
    请求状态: "请求成功喵~ 谢谢访问喵~",

    returnRequest: {

      fortune: randomLanguage,

      currentTime: currentTime,

      clientIp: clientIp

    }
  });
})

//以下代码为未来功能 还没做好 鸽鸽鸽

// 创建一个包含黑名单IP地址的数组  

// // 创建一个速率限制中间件，仅使用 IP 地址作为键  
// const rateLimit = require('express-rate-limit'); // 确保已安装express-rate-limit包  
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 分钟  
//   max: 100, // 每个 IP 在时间窗口内最多 100 个请求  
//   message: { error: '请求过多喵~请稍候再试喵~' }, // 自定义错误消息  
//   keyGenerator: function (req) {
//     // 更精确地获取客户端 IP 地址，考虑代理和 IPv6  
//     let ip = req.headers['x-forwarded-for'] || '';
//     if (!ip || ip.includes(',')) { // 处理 X-Forwarded-For 头中的多个 IP 地址或缺失  
//       ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || '';
//       if (ip.includes('::ffff:')) { // 处理 IPv6 映射的 IPv4 地址  
//         ip = ip.split('::ffff:')[1];
//       }
//     } else {
//       // 如果 X-Forwarded-For 存在且只有一个 IP 地址，则直接使用  
//       ip = ip.split(',')[0].trim();
//     }
//     return ip;
//   },
//   // 添加一个检查黑名单的函数  
//   handler: function (req, res, next) {
//     if (blacklist.includes(req.rateLimit.key)) {
//       // 如果IP在黑名单中，返回自定义错误响应  
//       res.status(403).json({ error: '您的IP地址已被封禁喵~请联系管理员喵~' });
//     } else if (req.rateLimit) {
//       // 如果IP不在黑名单中但已达到速率限制，使用默认的错误处理  
//       res.status(429).json(req.rateLimit);
//     } else {
//       // 如果没有达到速率限制，继续处理请求  
//       next();
//     }
//   }
// });

// // 使用速率限制中间件  
// app.use(limiter);

//处理上传与下载

// 设置静态文件服务  
app.use(express.static(path.join(__dirname, 'src')));

// 配置multer用于图片上传  
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 路由：显示随机图片  
app.get('/random-image', (req, res) => {
  const imagesDir = path.join(__dirname, 'images');
  fs.readdir(imagesDir, (err, files) => {
    if (err) {
      return res.status(500).send('没有找到涩图喵');
    }
    const imageFiles = files.filter(file => file.match(/\.(jpeg|jpg|png|gif)$/)); // 过滤出图片文件  
    if (imageFiles.length === 0) {
      return res.status(404).send('没有找到涩图喵');
    }
    const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];
    res.sendFile(path.join(imagesDir, randomImage));
  });
});

// 路由：处理图片上传  
app.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: '没有找到图片文件喵' });
  }
  // 处理上传的文件...  
  res.json({ message: '图片上传成功谢谢喵！' });
  // 注意：这里没有使用res.redirect()，因为我们在前端处理重定向  
});

// 启动服务器  
app.listen(port, host, () => {
  console.log(`服务器启动成功，正在运行于 http://${host}:${port}`);
});