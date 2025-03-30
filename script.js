// script.js
const config = {
    particleCount: 50,
    colors: ['#ff3366', '#45ffd8', '#7d6fff'],
    sizeRange: [6, 10],
    spreadRange: 200,
    rotationSpeed: 360,
    fallSpeed: 2,
    delayRange: 0.5,
    autoFade: false  // 添加自动消失配置
};

const particles = new Set();

// 调试函数
function debug(message, data = null) {
    console.log(`[Confetti] ${message}`, data || '');
}

// 错误处理函数
function handleError(error, context) {
    console.error(`[Confetti Error] ${context}:`, error);
}

function bindControls() {
    try {
        // 添加收起/展开功能
        const toggleBtn = document.getElementById('togglePanel');
        const controlPanel = document.querySelector('.control-panel');
        
        if (!toggleBtn || !controlPanel) {
            throw new Error('找不到收起/展开按钮或控制面板');
        }

        toggleBtn.addEventListener('click', () => {
            controlPanel.classList.toggle('collapsed');
            debug('控制面板状态:', controlPanel.classList.contains('collapsed') ? '收起' : '展开');
        });

        const controls = [
            { numberId: 'particleCount', rangeId: 'particleRange', key: 'particleCount' },
            { numberId: 'spreadRange', rangeId: 'spreadRange', key: 'spreadRange' },
            { numberId: 'rotationSpeed', rangeId: 'rotationRange', key: 'rotationSpeed' },
            { numberId: 'fallSpeed', rangeId: 'speedRange', key: 'fallSpeed' },
            { numberId: 'delayRange', rangeId: 'delayRange', key: 'delayRange' }
        ];

        controls.forEach(({ numberId, rangeId, key }) => {
            const numberInput = document.getElementById(numberId);
            const rangeInput = document.getElementById(rangeId);

            if (!numberInput || !rangeInput) {
                throw new Error(`找不到控件元素: ${numberId} 或 ${rangeId}`);
            }

            const updateValue = (value) => {
                const numValue = parseFloat(value);
                if (isNaN(numValue)) {
                    throw new Error(`无效的数值: ${value}`);
                }
                config[key] = numValue;
                numberInput.value = value;
                rangeInput.value = value;
                debug(`${key} 更新为:`, numValue);
            };

            numberInput.addEventListener('input', (e) => updateValue(e.target.value));
            rangeInput.addEventListener('input', (e) => updateValue(e.target.value));
        });

        // 颜色控制
        const colorPickers = document.getElementById('colorPickers');
        if (!colorPickers) {
            throw new Error('找不到颜色选择器容器');
        }

        const updateColors = () => {
            config.colors = Array.from(colorPickers.querySelectorAll('input[type="color"]'))
                .map(input => input.value);
            debug('颜色方案更新:', config.colors);
        };

        // 初始颜色方案
        updateColors();
        colorPickers.addEventListener('change', updateColors);

        const addColorBtn = document.getElementById('addColorBtn');
        if (!addColorBtn) {
            throw new Error('找不到添加颜色按钮');
        }

        addColorBtn.addEventListener('click', () => {
            const newPicker = document.createElement('input');
            newPicker.type = 'color';
            newPicker.value = '#ffffff';
            
            // 为新添加的颜色选择器绑定事件
            newPicker.addEventListener('change', updateColors);
            
            colorPickers.appendChild(newPicker);
            updateColors(); // 立即更新颜色方案
            debug('添加新的颜色选择器');
        });

        const testEffectBtn = document.getElementById('testEffectBtn');
        if (!testEffectBtn) {
            throw new Error('找不到测试效果按钮');
        }

        testEffectBtn.addEventListener('click', createConfetti);

        // 添加清除按钮功能
        const clearBtn = document.getElementById('clearParticles');
        if (!clearBtn) {
            throw new Error('找不到清除按钮');
        }

        clearBtn.addEventListener('click', () => {
            debug('开始清除所有粒子');
            particles.forEach(particle => {
                particle.remove();
            });
            particles.clear();
            debug('已清除所有粒子');
        });

        // 添加自动消失开关
        const autoFadeSwitch = document.getElementById('autoFade');
        if (!autoFadeSwitch) {
            throw new Error('找不到自动消失开关');
        }

        autoFadeSwitch.addEventListener('change', (e) => {
            config.autoFade = e.target.checked;
            debug('自动消失状态:', config.autoFade ? '开启' : '关闭');
        });

        debug('控件绑定完成');
    } catch (error) {
        handleError(error, '控件绑定');
    }
}

function createConfetti() {
    try {
        debug('开始创建撒花效果');
        // 不再清除旧粒子
        // particles.forEach(p => p.remove());
        // particles.clear();

        for (let i = 0; i < config.particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // 添加初始位置定义
            const startX = Math.random() * window.innerWidth;
            const startY = -50;  // 从顶部外开始
            
            // 设置起始位置变量
            particle.style.setProperty('--start-x', `${startX}px`);
            particle.style.top = `${startY}px`;
            
            // 计算结束位置
            const spread = (Math.random() - 0.5) * config.spreadRange;
            const endX = startX + spread;
            particle.style.setProperty('--end-x', `${endX}px`);
            
            // 设置其他属性
            particle.style.color = config.colors[Math.floor(Math.random() * config.colors.length)];
            
            const size = config.sizeRange[0] + Math.random() * (config.sizeRange[1] - config.sizeRange[0]);
            particle.style.setProperty('--size', size + 'px');
            
            particle.dataset.type = Math.floor(Math.random() * 3);
            
            // 随机化旋转速度
            const rotation = config.rotationSpeed * (0.8 + Math.random() * 0.4);
            particle.style.setProperty('--rotation', `${rotation}deg`);
            
            // 随机化下落速度
            const duration = config.fallSpeed * (0.8 + Math.random() * 0.4);
            particle.style.animation = `particleDrop ${duration}s ease-out forwards`;
            particle.style.animationDelay = Math.random() * config.delayRange + 's';

            // 根据自动消失设置添加动画结束事件
            if (config.autoFade) {
                particle.addEventListener('animationend', () => {
                    particle.remove();
                    particles.delete(particle);
                });
            }

            document.body.appendChild(particle);
            particles.add(particle);
        }
        debug(`创建了 ${config.particleCount} 个粒子`);
    } catch (error) {
        handleError(error, '创建撒花效果');
    }
}

function init() {
    try {
        debug('开始初始化');
        bindControls();
        createConfetti();
        debug('初始化完成');
    } catch (error) {
        handleError(error, '初始化');
    }
}

// 等待 DOM 加载完成
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// 添加点击和触摸支持
document.addEventListener('click', () => {
    debug('检测到点击事件');
    createConfetti();
});

document.addEventListener('touchstart', e => {
    e.preventDefault();
    debug('检测到触摸事件');
    createConfetti();
});