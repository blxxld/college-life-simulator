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
        handleSceneInteraction(sceneKey);
    });
}

/**
 * 处理场景交互逻辑
 * @param {string} sceneKey - 场景键值
 */
function handleSceneInteraction(sceneKey) {
    // 检查游戏是否已经结束
    if (document.getElementById('endingModal') && document.getElementById('endingModal').classList.contains('active')) {
        return;
    }

    // 检查是否有可用行动次数
    if (window.gameData && window.gameData.actionsLeft <= 0) {
        showToast('提示', '本周行动次数已用完');
        return;
    }

    // 消耗一次行动
    if (window.gameData) {
        window.gameData.actionsLeft--;
    }

    // 根据场景执行不同逻辑
    switch (sceneKey) {
        case 'library':
            handleLibraryScene();
            break;
        case 'canteen':
            handleCanteenScene();
            break;
        case 'dorm':
            handleDormScene();
            break;
        case 'gym':
            handleGymScene();
            break;
        case 'campus':
            handleCampusScene();
            break;
        case 'club':
            handleClubScene();
            break;
    }

    // 更新UI
    if (window.updateUI) {
        window.updateUI();
    }

    // 检查是否需要结束本周
    if (window.gameData && window.gameData.actionsLeft <= 0 && window.endWeek) {
        window.endWeek();
    }
}

/**
 * 处理图书馆场景
 */
function handleLibraryScene() {
    if (!window.gameData) return;

    // 学习效果 - 增强角色培养感
    const studyGain = 20 + Math.floor(Math.random() * 8);
    const healthLoss = 4;
    const happyLoss = 3;

    window.updateStat('study', studyGain);
    window.updateStat('health', -healthLoss);
    window.updateStat('happy', -happyLoss);

    window.addLog(`📚 在图书馆专注学习，学业+${studyGain}，健康-${healthLoss}，快乐-${happyLoss}`, 'log-default');
    window.showToast('study', studyGain);
    window.showToast('health', -healthLoss);
    window.showToast('happy', -happyLoss);

    // 随机事件
    const randomEvent = Math.random();

    if (randomEvent < 0.25) {
        // 遇到学霸
        window.addRelation('classmate', 5);
        window.updateStat('study', 8);
        window.addLog('👨‍🎓 遇到了学霸同学，他分享了学习方法，学业+8，好感+5', 'log-reward');
        window.showToast('study', 8);
        window.showToast('social', 5);
    } else if (randomEvent < 0.5) {
        // 参加学习小组
        window.updateStat('study', 6);
        window.updateStat('social', 4);
        window.addLog('📚 加入了临时学习小组，与同学们一起学习，学业+6，社交+4', 'log-event');
        window.showToast('study', 6);
        window.showToast('social', 4);
    } else if (randomEvent < 0.7) {
        // 发现稀有书籍
        const rareBooks = ['textbook', 'magicSeed'];
        const bookId = rareBooks[Math.floor(Math.random() * rareBooks.length)];
        window.gameData.inventory[bookId] = (window.gameData.inventory[bookId] || 0) + 1;
        window.addLog(`📖 发现了一本稀有书籍：${window.ITEMS_DATA[bookId].name}`, 'log-reward');
        if (window.renderItemsPanel) {
            window.renderItemsPanel();
        }
    } else if (randomEvent < 0.85) {
        // 图书馆闭馆
        window.updateStat('happy', -5);
        window.addLog('🚪 图书馆突然闭馆，你不得不提前离开，快乐-5', 'log-warning');
        window.showToast('happy', -5);
    } else {
        // 找不到座位
        window.updateStat('happy', -3);
        window.updateStat('study', -5);
        window.addLog('😞 图书馆人满为患，找不到座位，学业-5，快乐-3', 'log-warning');
        window.showToast('happy', -3);
        window.showToast('study', -5);
    }

    // 检查技能解锁
    window.checkAndUnlockSkill('study');
    // 检查成就
    window.checkAchievements();
}

/**
 * 处理食堂场景
 */
function handleCanteenScene() {
    if (!window.gameData) return;

    // 健康和快乐提升
    const healthGain = 8 + Math.floor(Math.random() * 5);
    const happyGain = 10 + Math.floor(Math.random() * 5);
    const moneyLoss = 20;

    window.updateStat('health', healthGain);
    window.updateStat('happy', happyGain);
    window.updateStat('money', -moneyLoss);

    window.addLog(`🍽️ 在食堂用餐，健康+${healthGain}，快乐+${happyGain}，金钱-${moneyLoss}`, 'log-default');
    window.showToast('health', healthGain);
    window.showToast('happy', happyGain);
    window.showToast('money', -moneyLoss);

    // 随机事件
    const randomEvent = Math.random();

    if (randomEvent < 0.25) {
        // 遇到辅导员
        window.addRelation('counselor', 4);
        window.updateStat('social', 5);
        window.addLog('👨‍🏫 在食堂遇到了辅导员，他请你喝了一杯饮料，社交+5，好感+4', 'log-reward');
        window.showToast('social', 5);
        window.showToast('happy', 3);
        window.updateStat('happy', 3);
    } else if (randomEvent < 0.5) {
        // 美食节
        window.updateStat('happy', 8);
        window.updateStat('health', 3);
        window.addLog('🎉 食堂举办美食节，你尝试了各种美食，快乐+8，健康+3', 'log-reward');
        window.showToast('happy', 8);
        window.showToast('health', 3);
    } else if (randomEvent < 0.7) {
        // 排队冲突
        window.updateStat('happy', -5);
        window.updateStat('social', -3);
        window.addLog('😠 在食堂排队时与同学发生了小冲突，快乐-5，社交-3', 'log-warning');
        window.showToast('happy', -5);
        window.showToast('social', -3);
    } else if (randomEvent < 0.85) {
        // 免费汤
        window.updateStat('health', 5);
        window.updateStat('money', 5); // 省了5元
        window.addLog('🍲 食堂今天提供免费汤，健康+5，节省了5元', 'log-reward');
        window.showToast('health', 5);
        window.showToast('money', 5);
    } else {
        // 食物中毒
        window.updateStat('health', -10);
        window.updateStat('happy', -8);
        window.addLog('🤢 吃了不干净的食物，健康-10，快乐-8', 'log-warning');
        window.showToast('health', -10);
        window.showToast('happy', -8);
    }

    // 检查技能解锁
    window.checkAndUnlockSkill('rest');
    // 检查成就
    window.checkAchievements();
}

/**
 * 处理宿舍场景
 */
function handleDormScene() {
    if (!window.gameData) return;

    // 休息效果
    const healthGain = 15 + Math.floor(Math.random() * 8);
    const happyGain = 10 + Math.floor(Math.random() * 5);
    const studyLoss = 2;

    window.updateStat('health', healthGain);
    window.updateStat('happy', happyGain);
    window.updateStat('study', -studyLoss);

    window.addLog(`🏠 在宿舍休息，健康+${healthGain}，快乐+${happyGain}，学业-${studyLoss}`, 'log-default');
    window.showToast('health', healthGain);
    window.showToast('happy', happyGain);
    window.showToast('study', -studyLoss);

    // 随机事件
    const randomEvent = Math.random();

    if (randomEvent < 0.25) {
        // 室友聚会
        window.updateStat('happy', 10);
        window.updateStat('social', 8);
        window.addLog('🎉 室友们组织了小型聚会，大家一起聊天玩游戏，快乐+10，社交+8', 'log-reward');
        window.showToast('happy', 10);
        window.showToast('social', 8);
    } else if (randomEvent < 0.5) {
        // 收到礼物
        const gifts = ['giftBox', 'musicCD', 'movieTicket'];
        const giftId = gifts[Math.floor(Math.random() * gifts.length)];
        window.gameData.inventory[giftId] = (window.gameData.inventory[giftId] || 0) + 1;
        window.addLog(`🎁 收到了朋友寄来的礼物：${window.ITEMS_DATA[giftId].name}`, 'log-reward');
        if (window.renderItemsPanel) {
            window.renderItemsPanel();
        }
    } else if (randomEvent < 0.7) {
        // 宿舍卫生检查
        window.updateStat('happy', -5);
        window.updateStat('health', -3);
        window.addLog('🧹 宿舍卫生检查不合格，需要打扫，快乐-5，健康-3', 'log-warning');
        window.showToast('happy', -5);
        window.showToast('health', -3);
    } else if (randomEvent < 0.85) {
        // 安静的夜晚
        window.updateStat('health', 5);
        window.updateStat('happy', 3);
        window.addLog('🌙 夜晚非常安静，你睡了个好觉，健康+5，快乐+3', 'log-reward');
        window.showToast('health', 5);
        window.showToast('happy', 3);
    } else {
        // 宿舍断电
        window.updateStat('happy', -8);
        window.updateStat('health', -5);
        window.addLog('💡 宿舍突然断电，晚上只能摸黑度过，快乐-8，健康-5', 'log-warning');
        window.showToast('happy', -8);
        window.showToast('health', -5);
    }

    // 检查技能解锁
    window.checkAndUnlockSkill('rest');
    // 检查成就
    window.checkAchievements();
}

/**
 * 处理体育馆场景
 */
function handleGymScene() {
    if (!window.gameData) return;

    // 锻炼效果
    const healthGain = 18 + Math.floor(Math.random() * 10);
    const happyGain = 10 + Math.floor(Math.random() * 5);
    const studyLoss = 3;
    const moneyLoss = 25;

    window.updateStat('health', healthGain);
    window.updateStat('happy', happyGain);
    window.updateStat('study', -studyLoss);
    window.updateStat('money', -moneyLoss);

    window.addLog(`💪 在体育馆锻炼，健康+${healthGain}，快乐+${happyGain}，学业-${studyLoss}，金钱-${moneyLoss}`, 'log-default');
    window.showToast('health', healthGain);
    window.showToast('happy', happyGain);
    window.showToast('study', -studyLoss);
    window.showToast('money', -moneyLoss);

    // 随机事件
    const randomEvent = Math.random();

    if (randomEvent < 0.25) {
        // 遇到专业教练
        window.updateStat('health', 10);
        window.addRelation('counselor', 5);
        window.addLog('👨‍🏫 遇到了专业教练，他指导了你正确的锻炼方法，健康+10，好感+5', 'log-reward');
        window.showToast('health', 10);
        window.showToast('social', 5);
    } else if (randomEvent < 0.5) {
        // 参加篮球比赛
        window.updateStat('social', 8);
        window.updateStat('happy', 6);
        window.addLog('🏀 参加了一场篮球比赛，结识了新朋友，社交+8，快乐+6', 'log-reward');
        window.showToast('social', 8);
        window.showToast('happy', 6);
    } else if (randomEvent < 0.7) {
        // 运动受伤
        window.updateStat('health', -15);
        window.updateStat('happy', -5);
        window.addLog('🤕 运动时不小心受伤了，健康-15，快乐-5', 'log-warning');
        window.showToast('health', -15);
        window.showToast('happy', -5);
    } else if (randomEvent < 0.85) {
        // 健身挑战
        window.updateStat('health', 12);
        window.updateStat('happy', 8);
        window.addLog('🏆 完成了健身挑战，感觉自己更加强壮了，健康+12，快乐+8', 'log-reward');
        window.showToast('health', 12);
        window.showToast('happy', 8);
    } else {
        // 设备故障
        window.updateStat('happy', -8);
        window.updateStat('health', -3);
        window.addLog('🔧 健身设备出现故障，锻炼计划被打乱，快乐-8，健康-3', 'log-warning');
        window.showToast('happy', -8);
        window.showToast('health', -3);
    }

    // 检查技能解锁
    window.checkAndUnlockSkill('exercise');
    // 检查成就
    window.checkAchievements();
}

/**
 * 处理校园场景
 */
function handleCampusScene() {
    if (!window.gameData) return;

    // 基础探索效果
    const happyGain = 5 + Math.floor(Math.random() * 3);
    const socialGain = 3 + Math.floor(Math.random() * 2);

    window.updateStat('happy', happyGain);
    window.updateStat('social', socialGain);

    window.addLog(`🌳 在校园探索，快乐+${happyGain}，社交+${socialGain}`, 'log-default');
    window.showToast('happy', happyGain);
    window.showToast('social', socialGain);

    // 随机事件
    const randomEvent = Math.random();

    if (randomEvent < 0.15) {
        // 发现秘密花园
        window.updateStat('happy', 15);
        window.updateStat('health', 5);
        window.addLog('🌸 发现了校园里的秘密花园，环境优美，快乐+15，健康+5', 'log-reward');
        window.showToast('happy', 15);
        window.showToast('health', 5);
    } else if (randomEvent < 0.3) {
        // 遇到校园明星
        window.updateStat('social', 10);
        window.updateStat('happy', 8);
        window.addLog('✨ 遇到了校园明星，和他/她聊了一会儿，社交+10，快乐+8', 'log-reward');
        window.showToast('social', 10);
        window.showToast('happy', 8);
    } else if (randomEvent < 0.45) {
        // 校园活动
        window.updateStat('social', 12);
        window.updateStat('happy', 10);
        window.addLog('🎉 参加了校园活动，认识了很多新朋友，社交+12，快乐+10', 'log-reward');
        window.showToast('social', 12);
        window.showToast('happy', 10);
    } else if (randomEvent < 0.6) {
        // 学术讲座
        window.updateStat('study', 10);
        window.updateStat('social', 5);
        window.addLog('📚 听了一场精彩的学术讲座，学业+10，社交+5', 'log-reward');
        window.showToast('study', 10);
        window.showToast('social', 5);
    } else if (randomEvent < 0.75) {
        // 校园迷路
        window.updateStat('happy', -5);
        window.updateStat('health', -3);
        window.addLog('😵 在校园里迷路了，绕了很久才找到方向，快乐-5，健康-3', 'log-warning');
        window.showToast('happy', -5);
        window.showToast('health', -3);
    } else if (randomEvent < 0.9) {
        // 遇到神秘商人
        window.gameData.metMerchant = true;
        const rareItems = ['luckyCharm', 'clover', 'mysteriousCharm'];
        const itemId = rareItems[Math.floor(Math.random() * rareItems.length)];
        window.gameData.inventory[itemId] = (window.gameData.inventory[itemId] || 0) + 1;
        window.updateStat('money', -100);
        window.addLog(`🤫 遇到了神秘商人，花100元购买了${window.ITEMS_DATA[itemId].name}`, 'log-reward');
        window.showToast('money', -100);
        if (window.renderItemsPanel) {
            window.renderItemsPanel();
        }
    } else {
        // 遇到流浪猫
        if (!window.gameData.hasCat && window.gameData.inventory.catFood > 0) {
            window.gameData.hasCat = true;
            window.gameData.inventory.catFood--;
            window.addLog('🐱 遇到了一只流浪猫，你用猫粮收养了它！', 'log-reward');
            window.showToast('happy', 15);
            window.updateStat('happy', 15);
            if (window.renderItemsPanel) {
                window.renderItemsPanel();
            }
        } else if (!window.gameData.hasCat) {
            window.addLog('🐱 遇到了一只流浪猫，但你没有猫粮', 'log-default');
        } else {
            window.addLog('🐱 遇到了你的猫咪，它很开心', 'log-default');
            window.updateStat('happy', 3);
            window.showToast('happy', 3);
        }
    }

    // 检查技能解锁
    window.checkAndUnlockSkill('socialize');
    // 检查成就
    window.checkAchievements();
}

/**
 * 处理社团场景
 */
function handleClubScene() {
    if (!window.gameData) return;

    // 社交效果
    const socialGain = 15 + Math.floor(Math.random() * 8);
    const happyGain = 12 + Math.floor(Math.random() * 6);
    const studyLoss = 4;

    window.updateStat('social', socialGain);
    window.updateStat('happy', happyGain);
    window.updateStat('study', -studyLoss);

    window.addLog(`🎭 在社团活动，社交+${socialGain}，快乐+${happyGain}，学业-${studyLoss}`, 'log-default');
    window.showToast('social', socialGain);
    window.showToast('happy', happyGain);
    window.showToast('study', -studyLoss);

    // 随机事件
    const randomEvent = Math.random();

    if (randomEvent < 0.2) {
        // 社团比赛
        window.updateStat('social', 15);
        window.updateStat('happy', 12);
        window.addRelation('clubber', 8);
        window.addLog('🏆 参加了社团比赛并获得了奖项，社交+15，快乐+12，好感+8', 'log-reward');
        window.showToast('social', 15);
        window.showToast('happy', 12);
    } else if (randomEvent < 0.4) {
        // 社团聚餐
        window.updateStat('happy', 10);
        window.updateStat('social', 10);
        window.updateStat('money', -50);
        window.addLog('🍻 参加了社团聚餐，大家玩得很开心，快乐+10，社交+10，金钱-50', 'log-event');
        window.showToast('happy', 10);
        window.showToast('social', 10);
        window.showToast('money', -50);
    } else if (randomEvent < 0.6) {
        // 社团会议
        window.updateStat('social', 8);
        window.updateStat('study', 5);
        window.addLog('📋 参加了社团会议，讨论了很多有意义的话题，社交+8，学业+5', 'log-event');
        window.showToast('social', 8);
        window.showToast('study', 5);
    } else if (randomEvent < 0.8) {
        // 社团冲突
        window.updateStat('happy', -8);
        window.updateStat('social', -5);
        window.addLog('😠 社团内部发生了小冲突，心情受到影响，快乐-8，社交-5', 'log-warning');
        window.showToast('happy', -8);
        window.showToast('social', -5);
    } else {
        // 社团奖励
        const rewards = ['medal', 'giftBox', 'musicCD', 'movieTicket'];
        const rewardId = rewards[Math.floor(Math.random() * rewards.length)];
        window.gameData.inventory[rewardId] = (window.gameData.inventory[rewardId] || 0) + 1;
        window.addLog(`🎁 获得了社团奖励：${window.ITEMS_DATA[rewardId].name}`, 'log-reward');
        if (window.renderItemsPanel) {
            window.renderItemsPanel();
        }
    }

    // 检查技能解锁
    window.checkAndUnlockSkill('socialize');
    // 检查成就
    window.checkAchievements();
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
window.initUI = initUI;
window.initSceneButtons = initSceneButtons;
window.handleSceneInteraction = handleSceneInteraction;
window.handleLibraryScene = handleLibraryScene;
window.handleCanteenScene = handleCanteenScene;
window.handleDormScene = handleDormScene;
window.handleGymScene = handleGymScene;
window.handleCampusScene = handleCampusScene;
window.handleClubScene = handleClubScene;

// 自动初始化
if (document.readyState === 'complete') {
    initUI();
} else {
    window.addEventListener('load', initUI);
}