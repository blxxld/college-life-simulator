/**
 * ui-utils.js - UI交互工具函数库
 * 专门处理UI交互、动画、事件绑定等通用逻辑
 */

/**
 * 更新进度条
 * @param {HTMLElement} fillElement - 进度条填充元素
 * @param {number} value - 进度值（0-100）
 * @param {boolean} [enableFlash=true] - 是否启用闪烁动画
 */
function updateProgress(fillElement, value, enableFlash = true) {
    // 参数校验
    if (!(fillElement instanceof HTMLElement)) {
        console.error('进度条元素必须是有效的DOM元素');
        return;
    }

    // 边界值处理
    const safeValue = Math.min(100, Math.max(0, Number(value) || 0));
    
    // 更新宽度
    fillElement.style.width = `${safeValue}%`;
    
    // 启用闪烁动画
    if (enableFlash) {
        // 防止动画叠加
        fillElement.classList.remove('flash');
        // 强制重绘
        void fillElement.offsetWidth;
        fillElement.classList.add('flash');
        
        // 自动移除闪烁类
        setTimeout(() => {
            fillElement.classList.remove('flash');
        }, 1000);
    }
}

/**
 * 批量更新进度条
 * @param {Object} progressMap - 进度条映射 { id: value }
 * @param {boolean} [enableFlash=true] - 是否启用闪烁动画
 */
function batchUpdateProgress(progressMap, enableFlash = true) {
    if (typeof progressMap !== 'object' || progressMap === null) return;

    Object.entries(progressMap).forEach(([id, value]) => {
        const fillElement = document.getElementById(id);
        if (fillElement) {
            updateProgress(fillElement, value, enableFlash);
        }
    });
}

/**
 * 初始化场景按钮事件
 * @param {string} [containerSelector='.scene-buttons'] - 场景按钮容器选择器
 */
function initSceneButtons(containerSelector = '.scene-buttons') {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.warn('未找到场景按钮容器');
        return;
    }

    // 事件委托 - 提升性能，支持动态添加的按钮
    container.addEventListener('click', (e) => {
        const sceneBtn = e.target.closest('.scene-btn');
        if (!sceneBtn) return;

        const sceneKey = sceneBtn.dataset.scene;
        if (sceneKey === 'library') {
            // 示例：图书馆按钮点击逻辑
            const studyProgress = document.getElementById('study-progress');
            if (studyProgress) {
                const currentValue = parseInt(studyProgress.style.width) || 0;
                updateProgress(studyProgress, currentValue + 10);
            }
        }
        // 其他场景按钮的通用逻辑可以在这里扩展
    });
}

/**
 * 显示提示框
 * @param {string} message - 提示信息
 * @param {number} [duration=2000] - 显示时长(ms)
 * @param {string} [toastSelector='#toast'] - 提示框选择器
 */
function showToast(message, duration = 2000, toastSelector = '#toast') {
    const toast = document.querySelector(toastSelector);
    if (!toast) {
        console.warn('未找到提示框元素');
        return;
    }

    toast.textContent = message;
    toast.style.display = 'block';

    // 清除之前的定时器，防止多次触发
    if (toast.timer) clearTimeout(toast.timer);
    
    toast.timer = setTimeout(() => {
        toast.style.display = 'none';
    }, duration);
}

/**
 * 初始化弹窗关闭逻辑
 * @param {string} modalSelector - 弹窗选择器
 * @param {string} [contentSelector='.modal-content'] - 弹窗内容选择器
 */
function initModalClose(modalSelector, contentSelector = '.modal-content') {
    const modal = document.querySelector(modalSelector);
    if (!modal) return;

    modal.addEventListener('click', (e) => {
        const content = modal.querySelector(contentSelector);
        if (content && !content.contains(e.target)) {
            modal.classList.add('hidden');
        }
    });
}

/**
 * 页面加载完成后初始化所有UI逻辑
 */
function initUI() {
    // 初始化场景按钮
    initSceneButtons();
    
    // 初始化弹窗关闭逻辑（示例）
    initModalClose('#sceneModal', '.modal-content');
    
    console.log('UI工具函数初始化完成');
}

// 暴露全局方法（按需）
window.updateProgress = updateProgress;
window.batchUpdateProgress = batchUpdateProgress;
window.showToast = showToast;
window.initUI = initUI;

// 自动初始化
if (document.readyState === 'complete') {
    initUI();
} else {
    window.addEventListener('load', initUI);
}