window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});// very important, if you don't know what it is, don't touch it
// 非常重要，不懂代码不要动，这里可以解决80%的问题，也可以生产1000+的bug

// --- 新增：域名白名单拦截逻辑 ---
const isUrlAllowed = (urlString) => {
    try {
        const url = new URL(urlString, window.location.href);
        // 如果不是 http 或 https 协议（例如 mailto:, javascript: 等），不予拦截，交给系统默认处理
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return true;
        }
        // 允许的 Google 相关域名白名单
        const allowedDomains = [
            'googleusercontent.com', // Google 头像、用户上传的附件/图片
            'gstatic.com',           // Google 静态资源和样式库
            'googleapis.com',         // Google API 数据接口
            'ggpht.com',             // Google 部分服务图标资源
            'google-analytics.com'   // 谷歌分析（部分登录和载入可能依赖）
        ];
        // 检查当前域名是否是白名单域名本身，或是其子域名
        return allowedDomains.some(domain => 
            url.hostname === domain || url.hostname.endsWith('.' + domain)
        );
    } catch (e) {
        // 解析失败（可能是相对路径），默认允许访问
        return true;
    }
}

const hookClick = (e) => {
    const origin = e.target.closest('a')

    // --- 新增拦截逻辑：如果点击了非白名单域名，直接拦截并阻止后续跳转 ---
    if (origin && origin.href) {
        if (!isUrlAllowed(origin.href)) {
            e.preventDefault()
            e.stopPropagation()
            alert('🚫 专注模式已拦截外部访问：' + new URL(origin.href).hostname)
            return
        }
    }

    const isBaseTargetBlank = document.querySelector(
        'head base[target="_blank"]'
    )
    console.log('origin', origin, isBaseTargetBlank)
    if (
        (origin && origin.href && origin.target === '_blank') ||
        (origin && origin.href && isBaseTargetBlank)
    ) {
        e.preventDefault()
        console.log('handle origin', origin)
        location.href = origin.href
    } else {
        console.log('not handle origin', origin)
    }
}

window.open = function (url, target, features) {
    console.log('open', url, target, features)
    // --- 新增拦截逻辑：如果是 window.open 触发的非白名单跳转，予以拦截 ---
    if (url && !isUrlAllowed(url)) {
        alert('🚫 专注模式已拦截窗口打开：' + new URL(url, window.location.href).hostname)
        return null
    }
    location.href = url
}

document.addEventListener('click', hookClick, { capture: true })