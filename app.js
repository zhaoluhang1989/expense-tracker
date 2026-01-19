/* ========================================
   记账本 - 应用逻辑
   Expense Tracker App
======================================== */

// ==================== 数据模型 ====================

// 默认支出分类
const DEFAULT_EXPENSE_CATEGORIES = [
    { id: 'food', name: '餐饮', icon: '🍜', type: 'expense' },
    { id: 'transport', name: '交通', icon: '🚇', type: 'expense' },
    { id: 'shopping', name: '购物', icon: '🛒', type: 'expense' },
    { id: 'entertainment', name: '娱乐', icon: '🎮', type: 'expense' },
    { id: 'daily', name: '日用', icon: '🧴', type: 'expense' },
    { id: 'clothes', name: '服饰', icon: '👔', type: 'expense' },
    { id: 'beauty', name: '美容', icon: '💅', type: 'expense' },
    { id: 'social', name: '社交', icon: '🎁', type: 'expense' },
    { id: 'housing', name: '住房', icon: '🏠', type: 'expense' },
    { id: 'medical', name: '医疗', icon: '💊', type: 'expense' },
    { id: 'education', name: '教育', icon: '📚', type: 'expense' },
    { id: 'communication', name: '通讯', icon: '📱', type: 'expense' },
    { id: 'travel', name: '旅行', icon: '✈️', type: 'expense' },
    { id: 'pet', name: '宠物', icon: '🐱', type: 'expense' },
    { id: 'other_expense', name: '其他', icon: '📝', type: 'expense' }
];

// 默认收入分类
const DEFAULT_INCOME_CATEGORIES = [
    { id: 'salary', name: '工资', icon: '💰', type: 'income' },
    { id: 'bonus', name: '奖金', icon: '🎉', type: 'income' },
    { id: 'investment', name: '理财', icon: '📈', type: 'income' },
    { id: 'parttime', name: '兼职', icon: '💼', type: 'income' },
    { id: 'gift', name: '红包', icon: '🧧', type: 'income' },
    { id: 'refund', name: '报销', icon: '📄', type: 'income' },
    { id: 'other_income', name: '其他', icon: '💵', type: 'income' }
];

// 默认账户
const DEFAULT_ACCOUNTS = [
    { id: 'cash', name: '现金', icon: '💵' },
    { id: 'alipay', name: '支付宝', icon: '🔵' },
    { id: 'wechat', name: '微信', icon: '🟢' },
    { id: 'bank', name: '银行卡', icon: '💳' },
    { id: 'credit', name: '信用卡', icon: '💎' }
];

// 可选图标列表
const AVAILABLE_ICONS = [
    '🍜', '🍔', '🍕', '☕', '🍺', '🚇', '🚗', '🚕', '✈️', '🚀',
    '🛒', '🎮', '🎬', '🎵', '📚', '💊', '🏠', '💰', '💳', '🎁',
    '👔', '👗', '👟', '💅', '💄', '📱', '💻', '🖥️', '⌚', '📷',
    '🐱', '🐶', '🌸', '🌈', '⚽', '🏃', '🎯', '🎨', '✏️', '📝'
];

// ==================== 数据存储 ====================

const STORAGE_KEYS = {
    RECORDS: 'expense_records',
    CATEGORIES: 'expense_categories',
    ACCOUNTS: 'expense_accounts',
    BUDGET: 'expense_budget'
};

// 获取数据
function getData(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('读取数据失败:', e);
        return defaultValue;
    }
}

// 保存数据
function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('保存数据失败:', e);
        return false;
    }
}

// 生成UUID
function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ==================== 应用状态 ====================

const AppState = {
    currentPage: 'homePage',
    currentRecordType: 'expense',
    selectedCategoryId: null,
    currentAmount: '0',
    editingRecordId: null,
    selectedMonth: new Date().toISOString().slice(0, 7),
    categoryManageType: 'expense',
    selectedIcon: null
};

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

function initializeApp() {
    // 初始化分类数据
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
        saveData(STORAGE_KEYS.CATEGORIES, [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES]);
    }

    // 初始化账户数据
    if (!localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) {
        saveData(STORAGE_KEYS.ACCOUNTS, DEFAULT_ACCOUNTS);
    }

    // 初始化UI
    initMonthSelector();
    initNavigation();
    initRecordModal();
    initCategoryModal();
    initSettings();

    // 渲染数据
    renderRecordsList();
    updateOverview();
}

// ==================== 月份选择器 ====================

function initMonthSelector() {
    const selector = document.getElementById('monthSelector');
    const now = new Date();

    // 生成最近12个月的选项
    for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const value = date.toISOString().slice(0, 7);
        const label = `${date.getFullYear()}年${date.getMonth() + 1}月`;

        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        if (i === 0) option.selected = true;
        selector.appendChild(option);
    }

    selector.addEventListener('change', function () {
        AppState.selectedMonth = this.value;
        renderRecordsList();
        updateOverview();
        if (AppState.currentPage === 'statsPage') {
            renderStats();
        }
    });
}

// ==================== 页面导航 ====================

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', function () {
            const pageId = this.dataset.page;
            switchPage(pageId);

            // 更新导航状态
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function switchPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        AppState.currentPage = pageId;

        // 页面切换时的特殊处理
        if (pageId === 'statsPage') {
            renderStats();
        } else if (pageId === 'settingsPage') {
            renderCategoryManagement();
            updateBudgetStatus();
        }
    }
}

// ==================== 记账弹窗 ====================

function initRecordModal() {
    const modal = document.getElementById('recordModal');
    const addBtn = document.getElementById('addRecordBtn');
    const closeBtn = document.getElementById('closeModal');
    const saveBtn = document.getElementById('saveRecord');
    const typeBtns = document.querySelectorAll('.type-btn');
    const numpadBtns = document.querySelectorAll('.numpad-btn');

    // 打开弹窗
    addBtn.addEventListener('click', function () {
        openRecordModal();
    });

    // 关闭弹窗
    closeBtn.addEventListener('click', function () {
        closeRecordModal();
    });

    // 点击背景关闭
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeRecordModal();
        }
    });

    // 保存记录
    saveBtn.addEventListener('click', function () {
        saveRecord();
    });

    // 类型切换
    typeBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const type = this.dataset.type;
            AppState.currentRecordType = type;

            typeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            renderCategoryGrid();
        });
    });

    // 数字键盘
    numpadBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const value = this.dataset.value;
            handleNumpadInput(value);
        });
    });

    // 初始化日期
    document.getElementById('dateInput').valueAsDate = new Date();

    // 初始化账户下拉
    renderAccountSelect();
}

function openRecordModal(record = null) {
    const modal = document.getElementById('recordModal');

    if (record) {
        // 编辑模式
        AppState.editingRecordId = record.id;
        AppState.currentRecordType = record.type;
        AppState.currentAmount = record.amount.toString();
        AppState.selectedCategoryId = record.categoryId;

        document.getElementById('amountDisplay').textContent = record.amount;
        document.getElementById('accountSelect').value = record.accountId;
        document.getElementById('dateInput').value = record.date;
        document.getElementById('noteInput').value = record.note || '';

        // 更新类型按钮
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === record.type);
        });
    } else {
        // 新建模式
        resetRecordModal();
    }

    renderCategoryGrid();
    modal.classList.add('active');
}

function closeRecordModal() {
    const modal = document.getElementById('recordModal');
    modal.classList.remove('active');
    resetRecordModal();
}

function resetRecordModal() {
    AppState.editingRecordId = null;
    AppState.currentAmount = '0';
    AppState.selectedCategoryId = null;

    document.getElementById('amountDisplay').textContent = '0';
    document.getElementById('noteInput').value = '';
    document.getElementById('dateInput').valueAsDate = new Date();

    // 重置类型为支出
    AppState.currentRecordType = 'expense';
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === 'expense');
    });
}

function handleNumpadInput(value) {
    let amount = AppState.currentAmount;

    if (value === 'backspace') {
        amount = amount.slice(0, -1) || '0';
    } else if (value === '.') {
        if (!amount.includes('.')) {
            amount += '.';
        }
    } else {
        if (amount === '0') {
            amount = value;
        } else {
            // 限制小数点后两位
            const parts = amount.split('.');
            if (parts.length === 2 && parts[1].length >= 2) {
                return;
            }
            // 限制整数部分长度
            if (parts[0].length >= 8 && !amount.includes('.')) {
                return;
            }
            amount += value;
        }
    }

    AppState.currentAmount = amount;
    document.getElementById('amountDisplay').textContent = amount;
}

function renderCategoryGrid() {
    const grid = document.getElementById('categoryGrid');
    const categories = getData(STORAGE_KEYS.CATEGORIES);
    const filtered = categories.filter(c => c.type === AppState.currentRecordType);

    grid.innerHTML = filtered.map(cat => `
        <div class="category-item ${cat.id === AppState.selectedCategoryId ? 'selected' : ''}" 
             data-id="${cat.id}">
            <span class="category-icon">${cat.icon}</span>
            <span class="category-name">${cat.name}</span>
        </div>
    `).join('');

    // 绑定点击事件
    grid.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', function () {
            const id = this.dataset.id;
            AppState.selectedCategoryId = id;

            grid.querySelectorAll('.category-item').forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

function renderAccountSelect() {
    const select = document.getElementById('accountSelect');
    const accounts = getData(STORAGE_KEYS.ACCOUNTS);

    select.innerHTML = accounts.map(acc => `
        <option value="${acc.id}">${acc.icon} ${acc.name}</option>
    `).join('');
}

function saveRecord() {
    const amount = parseFloat(AppState.currentAmount);

    if (isNaN(amount) || amount <= 0) {
        showToast('请输入有效金额');
        return;
    }

    if (!AppState.selectedCategoryId) {
        showToast('请选择分类');
        return;
    }

    const record = {
        id: AppState.editingRecordId || generateId(),
        type: AppState.currentRecordType,
        amount: amount,
        categoryId: AppState.selectedCategoryId,
        accountId: document.getElementById('accountSelect').value,
        note: document.getElementById('noteInput').value.trim(),
        date: document.getElementById('dateInput').value,
        createdAt: AppState.editingRecordId ? undefined : Date.now(),
        updatedAt: Date.now()
    };

    const records = getData(STORAGE_KEYS.RECORDS);

    if (AppState.editingRecordId) {
        // 更新记录
        const index = records.findIndex(r => r.id === AppState.editingRecordId);
        if (index !== -1) {
            record.createdAt = records[index].createdAt;
            records[index] = record;
        }
    } else {
        // 新增记录
        records.push(record);
    }

    saveData(STORAGE_KEYS.RECORDS, records);

    closeRecordModal();
    renderRecordsList();
    updateOverview();

    showToast(AppState.editingRecordId ? '记录已更新' : '记录已保存');
}

// ==================== 账单列表 ====================

function renderRecordsList() {
    const container = document.getElementById('recordsList');
    const records = getData(STORAGE_KEYS.RECORDS);
    const categories = getData(STORAGE_KEYS.CATEGORIES);

    // 过滤当月记录
    const monthRecords = records.filter(r => r.date.startsWith(AppState.selectedMonth));

    if (monthRecords.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <p>暂无记录，点击下方按钮开始记账</p>
            </div>
        `;
        return;
    }

    // 按日期分组
    const grouped = {};
    monthRecords.forEach(record => {
        if (!grouped[record.date]) {
            grouped[record.date] = [];
        }
        grouped[record.date].push(record);
    });

    // 按日期倒序排列
    const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    container.innerHTML = sortedDates.map(date => {
        const dayRecords = grouped[date];
        const dayIncome = dayRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
        const dayExpense = dayRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);

        const dateObj = new Date(date);
        const weekday = ['日', '一', '二', '三', '四', '五', '六'][dateObj.getDay()];
        const dateLabel = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日 周${weekday}`;

        return `
            <div class="date-group">
                <div class="date-header">
                    <span>${dateLabel}</span>
                    <span class="date-total">
                        ${dayIncome > 0 ? `收入 ¥${dayIncome.toFixed(2)}` : ''}
                        ${dayIncome > 0 && dayExpense > 0 ? ' | ' : ''}
                        ${dayExpense > 0 ? `支出 ¥${dayExpense.toFixed(2)}` : ''}
                    </span>
                </div>
                ${dayRecords.map(record => {
            const category = categories.find(c => c.id === record.categoryId) || { icon: '📝', name: '未知' };
            return `
                        <div class="record-item" data-id="${record.id}">
                            <div class="record-icon">${category.icon}</div>
                            <div class="record-info">
                                <div class="record-category">${category.name}</div>
                                <div class="record-note">${record.note || ''}</div>
                            </div>
                            <div class="record-amount ${record.type}">
                                ${record.type === 'income' ? '+' : '-'}¥${record.amount.toFixed(2)}
                            </div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    }).join('');

    // 绑定点击编辑事件
    container.querySelectorAll('.record-item').forEach(item => {
        item.addEventListener('click', function () {
            const id = this.dataset.id;
            const record = records.find(r => r.id === id);
            if (record) {
                openRecordModal(record);
            }
        });

        // 长按删除
        let pressTimer;
        item.addEventListener('touchstart', function (e) {
            pressTimer = setTimeout(() => {
                const id = this.dataset.id;
                if (confirm('确定删除这条记录吗？')) {
                    deleteRecord(id);
                }
            }, 800);
        });
        item.addEventListener('touchend', () => clearTimeout(pressTimer));
        item.addEventListener('touchmove', () => clearTimeout(pressTimer));
    });
}

function deleteRecord(id) {
    let records = getData(STORAGE_KEYS.RECORDS);
    records = records.filter(r => r.id !== id);
    saveData(STORAGE_KEYS.RECORDS, records);

    renderRecordsList();
    updateOverview();
    showToast('记录已删除');
}

function updateOverview() {
    const records = getData(STORAGE_KEYS.RECORDS);
    const monthRecords = records.filter(r => r.date.startsWith(AppState.selectedMonth));

    const totalIncome = monthRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
    const totalExpense = monthRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
    const balance = totalIncome - totalExpense;

    document.getElementById('totalIncome').textContent = `¥${totalIncome.toFixed(2)}`;
    document.getElementById('totalExpense').textContent = `¥${totalExpense.toFixed(2)}`;
    document.getElementById('totalBalance').textContent = `¥${balance.toFixed(2)}`;
}

// ==================== 统计页面 ====================

let expenseChart = null;
let trendChart = null;

function renderStats() {
    renderExpenseChart();
    renderTrendChart();
    renderCategoryBreakdown();
}

function renderExpenseChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    const records = getData(STORAGE_KEYS.RECORDS);
    const categories = getData(STORAGE_KEYS.CATEGORIES);

    // 当月支出按分类统计
    const monthExpenses = records.filter(r =>
        r.date.startsWith(AppState.selectedMonth) && r.type === 'expense'
    );

    const categoryTotals = {};
    monthExpenses.forEach(record => {
        if (!categoryTotals[record.categoryId]) {
            categoryTotals[record.categoryId] = 0;
        }
        categoryTotals[record.categoryId] += record.amount;
    });

    const sortedCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    const labels = sortedCategories.map(([id]) => {
        const cat = categories.find(c => c.id === id);
        return cat ? cat.name : '未知';
    });

    const data = sortedCategories.map(([, amount]) => amount);

    const colors = [
        '#6c5ce7', '#00d4aa', '#ff6b8a', '#feca57', '#54a0ff',
        '#ff9ff3', '#48dbfb', '#1dd1a1'
    ];

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 0,
                cutout: '60%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: 'rgba(255,255,255,0.7)',
                        font: { size: 11 },
                        padding: 10,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

function renderTrendChart() {
    const ctx = document.getElementById('trendChart').getContext('2d');
    const records = getData(STORAGE_KEYS.RECORDS);

    // 获取当月每天的收支
    const year = parseInt(AppState.selectedMonth.slice(0, 4));
    const month = parseInt(AppState.selectedMonth.slice(5, 7));
    const daysInMonth = new Date(year, month, 0).getDate();

    const incomeByDay = new Array(daysInMonth).fill(0);
    const expenseByDay = new Array(daysInMonth).fill(0);

    records.filter(r => r.date.startsWith(AppState.selectedMonth)).forEach(record => {
        const day = parseInt(record.date.slice(8, 10)) - 1;
        if (record.type === 'income') {
            incomeByDay[day] += record.amount;
        } else {
            expenseByDay[day] += record.amount;
        }
    });

    const labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}日`);

    if (trendChart) {
        trendChart.destroy();
    }

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '收入',
                    data: incomeByDay,
                    borderColor: '#00d4aa',
                    backgroundColor: 'rgba(0, 212, 170, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                },
                {
                    label: '支出',
                    data: expenseByDay,
                    borderColor: '#ff6b8a',
                    backgroundColor: 'rgba(255, 107, 138, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    ticks: {
                        color: 'rgba(255,255,255,0.5)',
                        maxTicksLimit: 7
                    }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    ticks: { color: 'rgba(255,255,255,0.5)' }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255,255,255,0.7)',
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

function renderCategoryBreakdown() {
    const container = document.getElementById('categoryBreakdown');
    const records = getData(STORAGE_KEYS.RECORDS);
    const categories = getData(STORAGE_KEYS.CATEGORIES);

    const monthExpenses = records.filter(r =>
        r.date.startsWith(AppState.selectedMonth) && r.type === 'expense'
    );

    const totalExpense = monthExpenses.reduce((sum, r) => sum + r.amount, 0);

    const categoryTotals = {};
    monthExpenses.forEach(record => {
        if (!categoryTotals[record.categoryId]) {
            categoryTotals[record.categoryId] = 0;
        }
        categoryTotals[record.categoryId] += record.amount;
    });

    const sorted = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);

    container.innerHTML = sorted.map(([id, amount]) => {
        const cat = categories.find(c => c.id === id) || { icon: '📝', name: '未知' };
        const percent = totalExpense > 0 ? (amount / totalExpense * 100) : 0;

        return `
            <div class="breakdown-item">
                <span class="breakdown-icon">${cat.icon}</span>
                <div class="breakdown-info">
                    <div class="breakdown-name">${cat.name}</div>
                    <div class="breakdown-bar">
                        <div class="breakdown-fill" style="width: ${percent}%"></div>
                    </div>
                </div>
                <span class="breakdown-amount">¥${amount.toFixed(2)}</span>
            </div>
        `;
    }).join('');
}

// ==================== 设置页面 ====================

function initSettings() {
    // 导出数据
    document.getElementById('exportBtn').addEventListener('click', exportData);

    // 导入数据
    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });

    document.getElementById('importFile').addEventListener('change', importData);

    // 预算设置
    const budgetInput = document.getElementById('budgetInput');
    const budget = getData(STORAGE_KEYS.BUDGET, { amount: 0 });
    budgetInput.value = budget.amount || '';

    document.getElementById('saveBudgetBtn').addEventListener('click', () => {
        const amount = parseFloat(budgetInput.value) || 0;
        saveData(STORAGE_KEYS.BUDGET, { amount });
        updateBudgetStatus();
        showToast('预算已保存');
    });

    // 分类管理标签
    document.querySelectorAll('.cat-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            AppState.categoryManageType = this.dataset.type;
            document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            renderCategoryManagement();
        });
    });

    // 添加分类
    document.getElementById('addCategoryBtn').addEventListener('click', openCategoryModal);
}

function updateBudgetStatus() {
    const budget = getData(STORAGE_KEYS.BUDGET, { amount: 0 });
    const records = getData(STORAGE_KEYS.RECORDS);
    const monthExpenses = records.filter(r =>
        r.date.startsWith(AppState.selectedMonth) && r.type === 'expense'
    );
    const totalExpense = monthExpenses.reduce((sum, r) => sum + r.amount, 0);

    const container = document.getElementById('budgetStatus');

    if (budget.amount > 0) {
        const remaining = budget.amount - totalExpense;
        const percent = (totalExpense / budget.amount * 100).toFixed(1);
        const isOver = remaining < 0;

        container.innerHTML = `
            <div>本月预算: ¥${budget.amount.toFixed(2)}</div>
            <div>已支出: ¥${totalExpense.toFixed(2)} (${percent}%)</div>
            <div style="color: ${isOver ? 'var(--accent-expense)' : 'var(--accent-income)'}">
                ${isOver ? `超支 ¥${Math.abs(remaining).toFixed(2)}` : `剩余 ¥${remaining.toFixed(2)}`}
            </div>
        `;
        container.className = 'budget-status' + (isOver ? ' warning' : '');
    } else {
        container.innerHTML = '<div style="color:var(--text-muted)">未设置预算</div>';
        container.className = 'budget-status';
    }
}

function renderCategoryManagement() {
    const grid = document.getElementById('categoryManageGrid');
    const categories = getData(STORAGE_KEYS.CATEGORIES);
    const filtered = categories.filter(c => c.type === AppState.categoryManageType);

    grid.innerHTML = filtered.map(cat => `
        <div class="category-item" data-id="${cat.id}">
            <span class="category-icon">${cat.icon}</span>
            <span class="category-name">${cat.name}</span>
        </div>
    `).join('');

    // 长按删除分类
    grid.querySelectorAll('.category-item').forEach(item => {
        let pressTimer;
        item.addEventListener('touchstart', function (e) {
            pressTimer = setTimeout(() => {
                const id = this.dataset.id;
                if (confirm('确定删除这个分类吗？')) {
                    deleteCategory(id);
                }
            }, 800);
        });
        item.addEventListener('touchend', () => clearTimeout(pressTimer));
        item.addEventListener('touchmove', () => clearTimeout(pressTimer));
    });
}

function deleteCategory(id) {
    let categories = getData(STORAGE_KEYS.CATEGORIES);
    categories = categories.filter(c => c.id !== id);
    saveData(STORAGE_KEYS.CATEGORIES, categories);
    renderCategoryManagement();
    showToast('分类已删除');
}

function exportData() {
    const data = {
        records: getData(STORAGE_KEYS.RECORDS),
        categories: getData(STORAGE_KEYS.CATEGORIES),
        accounts: getData(STORAGE_KEYS.ACCOUNTS),
        budget: getData(STORAGE_KEYS.BUDGET),
        exportTime: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `记账本备份_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('数据已导出');
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        try {
            const data = JSON.parse(event.target.result);

            if (data.records) saveData(STORAGE_KEYS.RECORDS, data.records);
            if (data.categories) saveData(STORAGE_KEYS.CATEGORIES, data.categories);
            if (data.accounts) saveData(STORAGE_KEYS.ACCOUNTS, data.accounts);
            if (data.budget) saveData(STORAGE_KEYS.BUDGET, data.budget);

            renderRecordsList();
            updateOverview();
            renderCategoryManagement();
            updateBudgetStatus();

            showToast('数据已导入');
        } catch (err) {
            showToast('导入失败，文件格式错误');
            console.error(err);
        }
    };
    reader.readAsText(file);

    // 重置文件输入
    e.target.value = '';
}

// ==================== 分类管理弹窗 ====================

function initCategoryModal() {
    const modal = document.getElementById('categoryModal');
    const closeBtn = document.getElementById('closeCategoryModal');
    const saveBtn = document.getElementById('saveCategoryBtn');

    // 关闭弹窗
    closeBtn.addEventListener('click', closeCategoryModal);
    modal.addEventListener('click', function (e) {
        if (e.target === modal) closeCategoryModal();
    });

    // 保存分类
    saveBtn.addEventListener('click', saveNewCategory);

    // 渲染图标选择器
    renderIconPicker();
}

function openCategoryModal() {
    const modal = document.getElementById('categoryModal');
    document.getElementById('newCategoryName').value = '';
    document.getElementById('newCategoryType').value = AppState.categoryManageType;
    AppState.selectedIcon = AVAILABLE_ICONS[0];
    renderIconPicker();
    modal.classList.add('active');
}

function closeCategoryModal() {
    const modal = document.getElementById('categoryModal');
    modal.classList.remove('active');
}

function renderIconPicker() {
    const picker = document.getElementById('iconPicker');
    picker.innerHTML = AVAILABLE_ICONS.map(icon => `
        <div class="icon-option ${icon === AppState.selectedIcon ? 'selected' : ''}" data-icon="${icon}">
            ${icon}
        </div>
    `).join('');

    picker.querySelectorAll('.icon-option').forEach(option => {
        option.addEventListener('click', function () {
            AppState.selectedIcon = this.dataset.icon;
            picker.querySelectorAll('.icon-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

function saveNewCategory() {
    const name = document.getElementById('newCategoryName').value.trim();
    const type = document.getElementById('newCategoryType').value;

    if (!name) {
        showToast('请输入分类名称');
        return;
    }

    const categories = getData(STORAGE_KEYS.CATEGORIES);

    // 检查是否重复
    if (categories.some(c => c.name === name && c.type === type)) {
        showToast('该分类已存在');
        return;
    }

    const newCategory = {
        id: generateId(),
        name: name,
        icon: AppState.selectedIcon || '📝',
        type: type
    };

    categories.push(newCategory);
    saveData(STORAGE_KEYS.CATEGORIES, categories);

    closeCategoryModal();
    renderCategoryManagement();
    showToast('分类已添加');
}

// ==================== Toast 提示 ====================

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}
