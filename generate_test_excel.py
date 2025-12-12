#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成测试用的联系人Excel文件
"""

import openpyxl
from openpyxl import Workbook
from datetime import datetime

# 创建工作簿
wb = Workbook()
ws = wb.active
ws.title = "联系人列表"

# 设置表头
headers = [
    "姓名", "书签", "备注", "创建时间", 
    "电话1", "电话2",
    "邮箱1", "邮箱2",
    "地址1",
    "微信1",
    "QQ1"
]
ws.append(headers)

# 测试联系人数据
test_contacts = [
    {
        "姓名": "张三",
        "书签": "是",
        "备注": "好朋友",
        "电话1": "13800138000",
        "电话2": "13900139000",
        "邮箱1": "zhangsan@example.com",
        "地址1": "北京市朝阳区",
        "微信1": "zhangsan123",
        "QQ1": "123456789"
    },
    {
        "姓名": "李四",
        "书签": "否",
        "备注": "同事",
        "电话1": "13700137000",
        "邮箱1": "lisi@company.com",
        "邮箱2": "lisi_personal@example.com",
        "微信1": "lisi_work"
    },
    {
        "姓名": "王五",
        "书签": "是",
        "备注": "家人",
        "电话1": "13600136000",
        "地址1": "上海市浦东新区"
    },
    {
        "姓名": "赵六",
        "书签": "否",
        "备注": "客户",
        "电话1": "13500135000",
        "电话2": "13400134000",
        "邮箱1": "zhaoliu@client.com",
        "微信1": "zhaoliu_client",
        "QQ1": "987654321"
    },
    {
        "姓名": "孙七",
        "书签": "是",
        "备注": "同学",
        "电话1": "13300133000",
        "邮箱1": "sunqi@school.com",
        "微信1": "sunqi_school",
        "QQ1": "456789123"
    }
]

# 填充数据
for contact in test_contacts:
    # 创建一行数据，按照表头顺序
    row_data = []
    for header in headers:
        if header in contact:
            row_data.append(contact[header])
        elif header == "创建时间":
            # 添加当前时间
            row_data.append(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        else:
            # 空值
            row_data.append("")
    
    ws.append(row_data)

# 调整列宽
for col in ws.columns:
    max_length = 0
    column = col[0].column_letter  # 获取列字母
    for cell in col:
        try:
            if len(str(cell.value)) > max_length:
                max_length = len(str(cell.value))
        except:
            pass
    adjusted_width = min(max_length + 2, 30)  # 最大宽度30
    ws.column_dimensions[column].width = adjusted_width

# 保存文件
file_name = f"测试联系人列表_{datetime.now().strftime('%Y%m%d')}.xlsx"
wb.save(file_name)

print(f"测试Excel文件已生成: {file_name}")
print("文件包含5个测试联系人，涵盖了各种联系方式组合")
