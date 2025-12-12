// 联系人管理系统 JavaScript

// 联系人数据存储
let contacts = [];
let currentContact = null;

// DOM元素
const DOM = {
    // 列表相关
    contactsList: document.getElementById('contacts-list'),
    searchInput: document.getElementById('search-input'),
    searchBtn: document.getElementById('search-btn'),
    filterTabs: document.querySelectorAll('.filter-tab'),
    
    // 表单相关
    contactForm: document.getElementById('contact-form'),
    contactId: document.getElementById('contact-id'),
    contactName: document.getElementById('contact-name'),
    contactAvatar: document.getElementById('contact-avatar'),
    avatarPreview: document.getElementById('avatar-preview'),
    contactMethods: document.getElementById('contact-methods'),
    contactNote: document.getElementById('contact-note'),
    detailTitle: document.getElementById('detail-title'),
    addContactBtn: document.getElementById('add-contact-btn'),
    cancelBtn: document.getElementById('cancel-btn'),
    deleteBtn: document.getElementById('delete-btn'),
    
    // 导入导出
    exportBtn: document.getElementById('export-btn'),
    importBtn: document.getElementById('import-btn'),
    importFile: document.getElementById('import-file')
};

// 初始化应用
function initApp() {
    // 从本地存储加载联系人
    loadContacts();
    
    // 绑定事件监听器
    bindEvents();
    
    // 渲染联系人列表
    renderContacts();
    
    // 显示空表单
    showEmptyForm();
}

// 从本地存储加载联系人
function loadContacts() {
    const storedContacts = localStorage.getItem('contacts');
    if (storedContacts) {
        contacts = JSON.parse(storedContacts);
    } else {
        // 添加一些示例联系人
        contacts = [
            {
                id: generateId(),
                name: '张三',
                avatar: '',
                methods: [
                    { type: 'phone', value: '13800138000' },
                    { type: 'email', value: 'zhangsan@example.com' }
                ],
                note: '朋友',
                bookmarked: true,
                createdAt: new Date().toISOString()
            },
            {
                id: generateId(),
                name: '李四',
                avatar: '',
                methods: [
                    { type: 'phone', value: '13900139000' },
                    { type: 'wechat', value: 'lisi123' }
                ],
                note: '同事',
                bookmarked: false,
                createdAt: new Date().toISOString()
            }
        ];
        saveContacts();
    }
}

// 保存联系人到本地存储
function saveContacts() {
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 绑定事件监听器
function bindEvents() {
    // 表单提交
    DOM.contactForm.addEventListener('submit', handleFormSubmit);
    
    // 添加联系人按钮
    DOM.addContactBtn.addEventListener('click', showEmptyForm);
    
    // 取消按钮
    DOM.cancelBtn.addEventListener('click', showEmptyForm);
    
    // 删除按钮
    DOM.deleteBtn.addEventListener('click', handleDelete);
    
    // 搜索功能
    DOM.searchInput.addEventListener('input', handleSearch);
    DOM.searchBtn.addEventListener('click', handleSearch);
    
    // 过滤标签
    DOM.filterTabs.forEach(tab => {
        tab.addEventListener('click', handleFilter);
    });
    
    // 头像预览
    DOM.contactAvatar.addEventListener('change', handleAvatarChange);
    
    // 导入导出
    DOM.exportBtn.addEventListener('click', handleExport);
    DOM.importBtn.addEventListener('click', () => DOM.importFile.click());
    DOM.importFile.addEventListener('change', handleImport);
}

// 处理表单提交
function handleFormSubmit(e) {
    e.preventDefault();
    
    // 收集表单数据
    const contactData = {
        name: DOM.contactName.value.trim(),
        avatar: DOM.avatarPreview.src || '',
        methods: getContactMethods(),
        note: DOM.contactNote.value.trim(),
        bookmarked: currentContact ? currentContact.bookmarked : false,
        createdAt: currentContact ? currentContact.createdAt : new Date().toISOString()
    };
    
    if (currentContact) {
        // 更新现有联系人
        contactData.id = currentContact.id;
        const index = contacts.findIndex(c => c.id === currentContact.id);
        contacts[index] = contactData;
    } else {
        // 添加新联系人
        contactData.id = generateId();
        contacts.unshift(contactData);
    }
    
    // 保存并更新UI
    saveContacts();
    renderContacts();
    showEmptyForm();
    
    // 显示成功消息
    showMessage('联系人已保存', 'success');
}

// 获取联系方式
function getContactMethods() {
    const methods = [];
    const methodItems = document.querySelectorAll('.contact-method-item');
    
    methodItems.forEach(item => {
        const type = item.querySelector('.method-type').value;
        const value = item.querySelector('.method-value').value.trim();
        
        if (value) {
            methods.push({ type, value });
        }
    });
    
    return methods;
}

// 渲染联系人列表
function renderContacts(filteredContacts = contacts) {
    DOM.contactsList.innerHTML = '';
    
    if (filteredContacts.length === 0) {
        DOM.contactsList.innerHTML = '<li class="loading">暂无联系人</li>';
        return;
    }
    
    filteredContacts.forEach(contact => {
        const li = createContactItem(contact);
        DOM.contactsList.appendChild(li);
    });
}

// 创建联系人列表项
function createContactItem(contact) {
    const li = document.createElement('li');
    li.className = `contact-item ${currentContact?.id === contact.id ? 'active' : ''}`;
    li.dataset.id = contact.id;
    
    // 获取主要电话号码
    const phone = contact.methods.find(m => m.type === 'phone');
    
    li.innerHTML = `
        <div class="contact-avatar">
            ${contact.avatar ? 
                `<img src="${contact.avatar}" alt="${contact.name}">` : 
                contact.name.charAt(0)
            }
        </div>
        <div class="contact-info">
            <div class="contact-name">${contact.name}</div>
            <div class="contact-phone">${phone ? phone.value : '无电话'}</div>
        </div>
        <div class="contact-actions">
            <button class="btn-bookmark ${contact.bookmarked ? '' : 'empty'}" 
                    onclick="toggleBookmark('${contact.id}')">
                <i class="fas fa-star"></i>
            </button>
        </div>
    `;
    
    // 点击查看详情
    li.addEventListener('click', (e) => {
        if (!e.target.closest('.btn-bookmark')) {
            showContactDetail(contact);
        }
    });
    
    return li;
}

// 显示联系人详情
function showContactDetail(contact) {
    currentContact = contact;
    
    // 更新表单
    DOM.contactId.value = contact.id;
    DOM.contactName.value = contact.name;
    DOM.contactNote.value = contact.note;
    DOM.detailTitle.textContent = contact.name;
    
    // 显示删除按钮
    DOM.deleteBtn.style.display = 'inline-block';
    
    // 更新头像预览
    if (contact.avatar) {
        DOM.avatarPreview.src = contact.avatar;
        DOM.avatarPreview.style.display = 'block';
    } else {
        DOM.avatarPreview.style.display = 'none';
    }
    
    // 清空现有联系方式
    DOM.contactMethods.innerHTML = '';
    
    // 添加联系方式
    contact.methods.forEach(method => {
        addContactMethod(method.type, method.value);
    });
    
    // 至少保留两个空的联系方式
    if (contact.methods.length < 2) {
        for (let i = contact.methods.length; i < 2; i++) {
            addContactMethod();
        }
    }
    
    // 更新列表选中状态
    updateListSelection(contact.id);
}

// 显示空表单
function showEmptyForm() {
    currentContact = null;
    
    // 重置表单
    DOM.contactForm.reset();
    DOM.contactId.value = '';
    DOM.detailTitle.textContent = '添加联系人';
    DOM.avatarPreview.style.display = 'none';
    DOM.avatarPreview.src = '';
    DOM.contactAvatar.value = '';
    
    // 隐藏删除按钮
    DOM.deleteBtn.style.display = 'none';
    
    // 清空联系方式
    DOM.contactMethods.innerHTML = '';
    
    // 添加两个默认联系方式
    addContactMethod('phone');
    addContactMethod('email', '');
    
    // 更新列表选中状态
    updateListSelection(null);
}

// 添加联系方式项
function addContactMethod(type = 'phone', value = '') {
    const div = document.createElement('div');
    div.className = 'contact-method-item';
    
    div.innerHTML = `
        <select class="method-type">
            <option value="phone" ${type === 'phone' ? 'selected' : ''}>电话</option>
            <option value="email" ${type === 'email' ? 'selected' : ''}>邮箱</option>
            <option value="address" ${type === 'address' ? 'selected' : ''}>地址</option>
            <option value="wechat" ${type === 'wechat' ? 'selected' : ''}>微信</option>
            <option value="qq" ${type === 'qq' ? 'selected' : ''}>QQ</option>
        </select>
        <input type="text" class="method-value" placeholder="请输入联系方式" value="${value}">
        <button type="button" class="btn-remove-method" onclick="removeContactMethod(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    DOM.contactMethods.appendChild(div);
    
    // 绑定添加按钮
    bindAddMethodButton();
}

// 移除联系方式项
function removeContactMethod(btn) {
    const item = btn.closest('.contact-method-item');
    const methodItems = document.querySelectorAll('.contact-method-item');
    
    // 至少保留一个联系方式
    if (methodItems.length > 1) {
        item.remove();
    }
}

// 绑定添加联系方式按钮
function bindAddMethodButton() {
    // 移除现有按钮
    const existingBtn = document.getElementById('add-method-btn');
    if (existingBtn) {
        existingBtn.remove();
    }
    
    // 创建新按钮
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'add-method-btn';
    btn.className = 'btn btn-small btn-secondary';
    btn.innerHTML = '<i class="fas fa-plus"></i> 添加联系方式';
    btn.onclick = () => addContactMethod();
    
    DOM.contactMethods.parentNode.appendChild(btn);
}

// 更新列表选中状态
function updateListSelection(contactId) {
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.id === contactId) {
            item.classList.add('active');
        }
    });
}

// 处理搜索
function handleSearch() {
    const searchTerm = DOM.searchInput.value.toLowerCase();
    const activeFilter = document.querySelector('.filter-tab.active').dataset.filter;
    
    let filtered = contacts;
    
    // 应用搜索
    if (searchTerm) {
        filtered = filtered.filter(contact => {
            return contact.name.toLowerCase().includes(searchTerm) ||
                   contact.methods.some(method => 
                       method.value.toLowerCase().includes(searchTerm)
                   );
        });
    }
    
    // 应用过滤
    if (activeFilter === 'bookmarked') {
        filtered = filtered.filter(contact => contact.bookmarked);
    }
    
    renderContacts(filtered);
}

// 处理过滤
function handleFilter(e) {
    // 更新激活标签
    DOM.filterTabs.forEach(tab => tab.classList.remove('active'));
    e.target.classList.add('active');
    
    // 执行搜索过滤
    handleSearch();
}

// 切换书签
function toggleBookmark(contactId) {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
        contact.bookmarked = !contact.bookmarked;
        saveContacts();
        renderContacts();
        
        // 如果当前正在查看该联系人，更新详情
        if (currentContact && currentContact.id === contactId) {
            currentContact.bookmarked = contact.bookmarked;
        }
    }
}

// 处理头像更改
function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            DOM.avatarPreview.src = e.target.result;
            DOM.avatarPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// 显示消息
function showMessage(message, type = 'info') {
    // 创建消息元素
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    
    // 添加到页面
    document.body.appendChild(messageEl);
    
    // 3秒后移除
    setTimeout(() => {
        messageEl.remove();
    }, 3000);
}

// 导出联系人到Excel
function handleExport() {
    if (contacts.length === 0) {
        showMessage('没有联系人可以导出', 'warning');
        return;
    }
    
    // 准备导出数据
    const exportData = contacts.map(contact => {
        // 获取所有联系方式
        const methods = {};
        contact.methods.forEach((method, index) => {
            const key = `${method.type}${index + 1}`;
            methods[key] = method.value;
        });
        
        return {
            '姓名': contact.name,
            '书签': contact.bookmarked ? '是' : '否',
            '备注': contact.note,
            '创建时间': new Date(contact.createdAt).toLocaleString(),
            ...methods
        };
    });
    
    // 创建工作簿和工作表
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '联系人列表');
    
    // 导出文件
    XLSX.writeFile(wb, `联系人列表_${new Date().toISOString().slice(0, 10)}.xlsx`);
    
    showMessage('联系人已导出', 'success');
}

// 导入Excel联系人
function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            // 处理导入的数据
            const importedContacts = processImportedData(jsonData);
            
            // 合并联系人
            contacts = [...contacts, ...importedContacts];
            saveContacts();
            renderContacts();
            
            showMessage(`成功导入 ${importedContacts.length} 个联系人`, 'success');
        } catch (error) {
            console.error('导入失败:', error);
            showMessage('导入失败，请检查文件格式', 'error');
        }
    };
    
    reader.readAsArrayBuffer(file);
    
    // 重置文件输入
    e.target.value = '';
}

// 处理导入的数据
function processImportedData(jsonData) {
    const imported = [];
    
    jsonData.forEach(item => {
        const contact = {
            id: generateId(),
            name: item['姓名'] || '',
            avatar: '',
            methods: [],
            note: item['备注'] || '',
            bookmarked: item['书签'] === '是',
            createdAt: new Date().toISOString()
        };
        
        // 提取联系方式
        Object.keys(item).forEach(key => {
            if (key !== '姓名' && key !== '书签' && key !== '备注' && key !== '创建时间') {
                const value = item[key];
                if (value) {
                    // 提取类型（去掉数字后缀）
                    const type = key.replace(/\d+$/, '');
                    contact.methods.push({ type, value });
                }
            }
        });
        
        // 只添加有效的联系人
        if (contact.name || contact.methods.length > 0) {
            imported.push(contact);
        }
    });
    
    return imported;
}

// 删除联系人
function handleDelete() {
    if (currentContact) {
        if (confirm(`确定要删除联系人 "${currentContact.name}" 吗？`)) {
            // 从联系人列表中删除
            contacts = contacts.filter(contact => contact.id !== currentContact.id);
            
            // 保存并更新UI
            saveContacts();
            renderContacts();
            showEmptyForm();
            
            // 显示成功消息
            showMessage('联系人已删除', 'success');
        }
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', initApp);