document.getElementById('uploadButton').addEventListener('click', function() {
	// 显示文件选择框并触发表单提交  
	const input = document.querySelector('#uploadForm input[type="file"]');
	input.click();

	// 监听文件选择后的表单提交  
	input.addEventListener('change', function() {
		// 移除之前的事件监听器，避免重复提交  
		input.removeEventListener('change', arguments.callee);
		// 提交表单  
		document.getElementById('uploadForm').submit();
	}, {
		once: true
	});
});

document.getElementById('randomImageButton').addEventListener('click', function() {
	// 加载随机图片  
	const img = document.getElementById('randomImage');
	img.src = '/random-image?' + new Date().getTime(); // 添加时间戳以防止缓存  
});

// 获取图片元素  
const imageElement = document.getElementById('randomImage');

// 添加点击事件监听器  
imageElement.addEventListener('click', function() {
	// 获取图片的src属性  
	const imageSrc = imageElement.src;

	// 创建一个隐藏的a标签  
	const a = document.createElement('a');
	a.style.display = 'none';
	a.href = imageSrc;
	a.download = 'downloaded_image.jpg'; // 设置下载后的文件名，可以根据需要更改  

	// 将a标签添加到文档中  
	document.body.appendChild(a);

	// 触发a标签的点击事件，开始下载  
	a.click();

	// 下载完成后移除a标签  
	document.body.removeChild(a);
});

//点击效果
function addAnimatedText(elementId, options) {
	// 默认配置  
	var defaults = {
		words: ["富强", "民主", "文明", "和谐", "自由", "平等", "公正", "法治", "爱国", "敬业", "诚信", "友善"],
		zIndex: 5,
		initialTopOffset: -20,
		finalTopOffset: -180,
		animationDuration: 3000,
		fontWeight: "bold"
	};

	// 合并默认配置和用户提供的配置  
	var settings = Object.assign({}, defaults, options);

	var a_idx = 0;
	var element = document.getElementById(elementId);

	// 定义一个函数来生成随机颜色  
	function getRandomColor() {
		var letters = '0123456789ABCDEF';
		var color = '#';
		for (var i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	}

	// 添加点击事件监听器  
	element.addEventListener('click', function(e) {
		// 创建一个新的span元素  
		var span = document.createElement('span');
		span.textContent = settings.words[a_idx];
		a_idx = (a_idx + 1) % settings.words.length;

		// 设置span元素的样式  
		span.style.zIndex = settings.zIndex;
		span.style.top = (e.pageY + settings.initialTopOffset) + 'px';
		span.style.left = e.pageX + 'px';
		span.style.position = 'absolute';
		span.style.fontWeight = settings.fontWeight;
		span.style.color = getRandomColor();
		span.style.opacity = 1;

		// 将span元素添加到body中  
		document.body.appendChild(span);

		// 设置动画结束后的回调函数  
		function removeSpan() {
			span.remove();
		}

		// 使用requestAnimationFrame进行简单的动画模拟（这里为了简化，不使用真正的动画库）  
		function animateSpan() {
			var startTime = null;

			function step(timestamp) {
				if (!startTime) startTime = timestamp;
				var progress = timestamp - startTime;
				var percentComplete = Math.min(progress / settings.animationDuration, 1);

				span.style.top = (e.pageY + settings.finalTopOffset * percentComplete) + 'px';
				span.style.opacity = 1 - percentComplete;

				if (percentComplete < 1) {
					requestAnimationFrame(step);
				} else {
					removeSpan();
				}
			}

			requestAnimationFrame(step);
		}

		// 开始动画  
		animateSpan();
	});
}

// 使用示例  
document.addEventListener('DOMContentLoaded', function() {
	addAnimatedText('body', {});
	document.addEventListener('click', function(e) {
		if (e.target.closest('body')) {
			addAnimatedTextToDocument(e); // 这是一个假设的函数，用于处理整个文档的点击  
		}
	});
});

//计数板
// 获取按钮和计数器的元素  
const uploadButton = document.getElementById('uploadButton');
const randomImageButton = document.getElementById('randomImageButton');
const uploadCounter = document.getElementById('uploadCounter');
const randomImageCounter = document.getElementById('randomImageCounter');

// 初始化计数器  
let uploadCount = 0;
let randomImageCount = 0;

// 监听按钮点击事件  
uploadButton.addEventListener('click', () => {
	uploadCount++;
	uploadCounter.textContent = `已经赏了${uploadCount}张涩图`;
});

randomImageButton.addEventListener('click', () => {
	randomImageCount++;
	randomImageCounter.textContent = `已经来了${randomImageCount}张涩图`;
});