const port = 5001; // 服务器端口  
const host = 'ip'; // 服务器IP地址  
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
  const languages = [
    {
      "求签": "——中吉——",
      "签文": "天上有云飘过的日子，天气令人十分舒畅。工作非常顺利，连午睡时也会想到好点子。突然发现，与老朋友还有其他的共同话题… ——每一天，每一天都要积极开朗地度过——"
    },
    {
      "求签": "——中吉——",
      "签文": "十年磨一剑，今朝示霜刃。恶运已销，身临否极泰来之时。苦练多年未能一显身手的才能，现今有了大展身手的极好机会。若是遇到阻碍之事，亦不必迷惘，大胆地拔剑，痛快地战斗一番吧。"
    },
    {
      "求签": "——大吉——",
      "签文": "会起风的日子，无论干什么都会很顺利的一天。周围的人心情也非常愉快，绝对不会发生冲突，还可以吃到一直想吃，但没机会吃的美味佳肴。无论是工作，还是旅行，都一定会十分顺利吧。那么，应当在这样的好时辰里，一鼓作气前进…"
    },
    {
      "求签": "——大吉——",
      "签文": "宝剑出匣来，无往不利。出匣之光，亦能照亮他人。今日能一箭射中空中的猎物，能一击命中守卫要害。若没有目标，不妨四处转转，说不定会有意外之喜。同时，也不要忘记和倒霉的同伴分享一下好运气哦。"
    },
    {
      "求签": "——大吉——",
      "签文": "失而复得的一天。原本以为石沉大海的事情有了好的回应，原本分道扬镳的朋友或许可以再度和好，不经意间想起了原本已经忘记了的事情。世界上没有什么是永远无法挽回的，今天就是能够挽回失去事物的日子。"
    },
    {
      "求签": "——大吉——",
      "签文": "浮云散尽月当空，逢此签者皆为上吉。明镜在心清如许，所求之事心想则成。合适顺心而为的一天，不管是想做的事情，还是想见的人，现在是行动起来的好时机。"
    },
    {
      "求签": "——吉——",
      "签文": "明明没有什么特别的事情，却感到心情轻快的日子。在没注意过的角落可以找到本以为丢失已久的东西。食物比平时更加鲜美，路上的风景也令人眼前一亮。——这个世界上充满了新奇的美好事物——"
    },
    {
      "求签": "——吉——",
      "签文": "枯木逢春，正当万物复苏之时。陷入困境时，能得到解决办法。举棋不定时，会有贵人来相助。可以整顿一番心情，清理一番家装，说不定能发现意外之财。"
    },
    {
      "求签": "——吉——",
      "签文": "一如既往的一天。身体和心灵都适应了的日常。出现了能替代弄丢的东西的物品，令人很舒心。和常常遇见的人关系会变好，可能会成为朋友。——无论是多寻常的日子，都能成为宝贵的回忆——"
    },
    {
      "求签": "——末吉——",
      "签文": "云遮月半边，雾起更迷离。抬头即是浮云遮月，低头则是浓雾漫漫。虽然一时前路迷惘，但也会有一切明了的时刻。现下不如趁此机会磨炼自我，等待拨云见皎月。"
    },
    {
      "求签": "——末吉——",
      "签文": "空中的云层偏低，并且仍有堆积之势，不知何时雷雨会骤然从头顶倾盆而下。但是等雷雨过后，还会有彩虹在等着。宜循于旧，守于静，若妄为则难成之。"
    },
    {
      "求签": "——末吉——",
      "签文": "平稳安详的一天。没有什么令人难过的事情会发生。适合和久未联系的朋友聊聊过去的事情，一同欢笑。吃东西的时候会尝到很久以前体验过的过去的味道。——要珍惜身边的人与事——"
    },
    {
      "求签": "——末吉——",
      "签文": "气压稍微有点低，是会令人想到遥远的过去的日子。早已过往的年轻岁月，与再没联系过的故友的回忆，会让人感到一丝平淡的怀念，又稍微有一点点感伤。——偶尔怀念过去也很好。放松心情面对未来吧——"
    },
    {
      "求签": "——凶——",
      "签文": "珍惜的东西可能会遗失，需要小心。如果身体有不适，一定要注意休息。在做出决定之前，一定要再三思考。"
    },
    {
      "求签": "——凶——",
      "签文": "隐约感觉会下雨的一天。可能会遇到不顺心的事情。应该的褒奖迟迟没有到来，服务生也可能会上错菜。明明没什么大不了的事，却总感觉有些心烦的日子。——难免有这样的日子——"
    },
    {
      "求签": "——大凶——",
      "签文": "内心空落落的一天。可能会陷入深深的无力感之中。很多事情都无法理清头绪，过于钻牛角尖则易生病。虽然一切皆陷于低潮谷底中，但也不必因此而气馁。若能撑过一时困境，他日必另有一番作为。"
    }
  ];
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
    status: {
      "code": 200,
      "message": "求签成功喵~"
    },
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
  console.log(`服务器启动成功!
    正在运行于 http://${host}:${port},
    功能列表：
  - 网页服务
  - 文件上传
  - 随机签文
  - 随机图片
  -日志:
  `);
});