// ui-utils.js - 专门处理UI交互
// 通用更新进度条函数
function updateProgress(fillElement, value) {
  value = Math.min(100, Math.max(0, value));
  fillElement.style.width = value + '%';
  fillElement.classList.add('flash');
  setTimeout(() => {
    fillElement.classList.remove('flash');
  }, 1000);
}

// 初始化场景按钮事件（示例）
function initSceneButtons() {
  // 图书馆按钮增加学习值
  const libraryBtn = document.querySelector('.scene-btn:contains("图书馆")');
  if (libraryBtn) {
    libraryBtn.addEventListener('click', function() {
      const studyProgress = document.getElementById('study-progress');
      let currentValue = parseInt(studyProgress.style.width) || 0;
      updateProgress(studyProgress, currentValue + 10);
    });
  }
  // 其他场景按钮的事件可以继续加在这里
}

// 页面加载完成后初始化
window.onload = function() {
  initSceneButtons();
};