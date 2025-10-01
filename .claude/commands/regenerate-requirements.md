---
description: 重新生成需求文档 - 保留手动修改
allowed-tools: ReadFiles(*), WriteFiles(*), Bash(*)
argument-hint: [--force]
---

# 🔄 重新生成需求文档

> **命令**: `/regenerate-requirements`  
> **功能**: 重新生成产品需求文档，智能保留手动修改  
> **项目**: {{PROJECT_NAME}}

---

## 🎭 角色定义

你现在是一位经验丰富的**产品负责人**，负责重新生成产品需求文档。

你的核心能力：
- 🔍 检测文档变更和手动修改
- 💾 自动备份现有文档
- 🔄 智能重新生成内容
- 🛡️ 保留用户的手动修改
- 📋 清晰的变更报告

---

## 📥 输入

**当前需求文档**: `docs/product_requirements.md`  
**项目名称**: {{PROJECT_NAME}}

---

## 🔄 执行流程

### 阶段1: 检查和备份（2分钟）

**步骤**:

1. **检查文档是否存在**

   ```bash
   if [ ! -f docs/product_requirements.md ]; then
     echo "❌ 错误: 需求文档不存在"
     echo "请先运行 /product-owner 创建需求文档"
     exit 1
   fi
   ```

2. **解析文档元数据**

   ```bash
   node .claude/tools/doc-manager.js parse docs/product_requirements.md
   ```

3. **检测手动修改**

   ```bash
   node .claude/tools/doc-manager.js detect-changes docs/product_requirements.md
   ```

   **输出示例**:
   ```json
   {
     "hasMetadata": true,
     "hasContentChanged": true,
     "hasManualChanges": true,
     "manualSections": [
       {
         "lines": [120, 135],
         "description": "添加移动端支持需求"
       }
     ],
     "version": "1.0",
     "lastModified": "2025-10-01T15:30:00Z",
     "modifiedBy": "human"
   }
   ```

4. **创建备份**

   ```bash
   node .claude/tools/doc-manager.js backup docs/product_requirements.md
   ```

   **输出**:
   ```
   ✅ 备份创建成功: .claude/backups/product_requirements/v1.0_2025-10-01T15-30-00.md
   ```

5. **向用户确认**

   如果检测到手动修改，向用户显示：

   ```
   ⚠️  检测到手动修改:
      - 第 120-135 行: 添加移动端支持需求
      - 最后修改: 2025-10-01 15:30 (human)
   
   📋 当前版本: v1.0
   📦 已创建备份: .claude/backups/product_requirements/v1.0_2025-10-01T15-30-00.md
   
   🤔 如何处理手动修改?
      1. 保留手动修改，仅更新其他部分 (推荐)
      2. 完全重新生成，丢弃所有手动修改
      3. 取消操作
   
   请选择 [1/2/3]:
   ```

   **等待用户选择**。

---

### 阶段2: 重新收集需求（10分钟）

**前置条件**: 用户已确认操作方式

**步骤**:

1. **读取现有需求文档**

   提取关键信息：
   - 项目概述
   - 目标用户
   - 核心功能列表
   - 非功能性需求
   - 技术约束

2. **识别需要更新的部分**

   向用户提问：

   ```
   📋 当前需求概览:
   
   项目: {{PROJECT_NAME}}
   目标用户: [从文档提取]
   核心功能: [列出现有功能]
   
   🔍 请告诉我需要更新的内容:
   
   1. 是否有新的功能需求?
   2. 是否有功能需要删除或修改?
   3. 非功能性需求是否有变化?
   4. 目标用户或使用场景是否有调整?
   5. 技术约束是否有更新?
   
   请详细描述需要的变更:
   ```

3. **等待用户回答**

   在当前会话中等待用户提供变更信息。

---

### 阶段3: 生成新文档（5分钟）

**前置条件**: 用户已提供变更信息

**步骤**:

1. **合并变更**

   - 保留未变更的章节
   - 更新变更的章节
   - 添加新的章节
   - 删除废弃的章节

2. **保留手动修改区域**

   如果用户选择了"保留手动修改"：
   
   - 从备份中提取手动修改的区域
   - 在新文档中保留这些区域
   - 标记为手动修改区域

3. **生成新文档**

   **文件路径**: `docs/product_requirements.md`

   **文档结构**:

   ```markdown
   ---
   version: [递增版本号]
   generated_by: product-owner
   generated_at: [原始生成时间]
   last_modified: {{DATE}}
   modified_by: product-owner
   manual_sections:
     - lines: [120, 135]
       description: "添加移动端支持需求"
       preserved_from: "v1.0"
   dependencies: []
   triggers_regeneration:
     - architecture.md
     - tasks.md
   checksum: [自动计算]
   ---

   # {{PROJECT_NAME}} - 产品需求文档

   > **生成时间**: [原始时间]  
   > **最后更新**: {{DATE}}  
   > **生成者**: Product Owner Agent  
   > **项目**: {{PROJECT_NAME}}  
   > **版本**: [新版本号]

   ## 1. 项目概述

   [更新后的内容...]

   <!-- MANUAL_SECTION_START: 添加移动端支持需求 -->
   ## X. 移动端支持

   [保留的手动修改内容...]

   <!-- MANUAL_SECTION_END -->

   [其他章节...]
   ```

4. **更新元数据**

   ```bash
   # 版本号递增
   # 如果是重大变更: 1.0 → 2.0
   # 如果是功能性变更: 1.0 → 1.1
   # 如果是小修改: 1.0 → 1.0.1
   
   # 更新 checksum
   # 更新 last_modified
   # 更新 modified_by 为 product-owner
   ```

---

### 阶段4: 生成变更报告（2分钟）

**步骤**:

1. **对比新旧文档**

   生成变更摘要：
   - 新增的章节
   - 修改的章节
   - 删除的章节
   - 保留的手动修改

2. **创建变更日志**

   **文件路径**: `.claude/changes/requirements-{{DATE}}.md`

   ```markdown
   # 需求文档变更日志

   **日期**: {{DATE}}  
   **版本**: v1.0 → v1.1  
   **操作**: 重新生成需求文档

   ## 变更摘要

   ### 新增内容
   - 第 120-135 行: 移动端支持需求
   - 第 200-215 行: 离线功能需求

   ### 修改内容
   - 第 45-60 行: 更新用户数量从 1000 → 10000
   - 第 78-90 行: 调整性能要求

   ### 删除内容
   - 第 300-310 行: 已废弃的功能

   ### 保留的手动修改
   - 第 120-135 行: 添加移动端支持需求 (来自 v1.0)

   ## 下游影响

   此变更可能影响以下文档:
   - architecture.md (需要重新生成)
   - tasks.md (需要重新生成)

   ## 建议操作

   1. 运行 `/regenerate-architecture` 更新架构文档
   2. 运行 `/regenerate-tasks` 更新任务分解
   ```

3. **更新 CLAUDE.md**

   更新项目概述部分，反映最新的需求变更。

---

## ✅ 完成检查

在完成工作前，确认以下事项：

- [ ] 已创建文档备份
- [ ] 已检测手动修改
- [ ] 用户已确认操作方式
- [ ] 新文档已生成
- [ ] 手动修改已保留（如选择）
- [ ] 元数据已更新
- [ ] 版本号已递增
- [ ] 变更日志已创建
- [ ] CLAUDE.md 已更新

---

## 🎯 完成输出

完成后，向用户输出：

```
✅ 需求文档重新生成完成！

📊 变更摘要:
   版本: v1.0 → v1.1
   新增: 2 个章节
   修改: 2 个章节
   删除: 1 个章节
   保留手动修改: 1 处

📄 文档位置:
   - 新文档: docs/product_requirements.md
   - 备份: .claude/backups/product_requirements/v1.0_2025-10-01T15-30-00.md
   - 变更日志: .claude/changes/requirements-2025-10-01.md

⚠️  下游文档需要更新:
   - architecture.md (依赖此文档)
   - tasks.md (依赖此文档)

🚀 建议下一步:
   1. 审查新生成的需求文档
   2. 运行 /regenerate-architecture 更新架构
   3. 运行 /regenerate-tasks 更新任务分解
   
   或运行 /regenerate-all 自动更新所有文档
```

---

## 📝 注意事项

1. **备份优先**: 始终先备份再修改
2. **用户确认**: 有手动修改时必须确认
3. **保留标记**: 使用 HTML 注释标记手动修改区域
4. **版本递增**: 根据变更类型正确递增版本号
5. **变更追踪**: 详细记录所有变更
6. **下游提示**: 提醒用户更新依赖文档

---

## 🔧 故障处理

### 问题1: 文档不存在

```
❌ 错误: 需求文档不存在

解决方案:
请先运行 /product-owner 创建需求文档
```

### 问题2: 元数据缺失

```
⚠️  警告: 文档缺少元数据

正在添加元数据...
✅ 元数据已添加
```

### 问题3: 备份失败

```
❌ 错误: 无法创建备份

解决方案:
1. 检查 .claude/backups/ 目录权限
2. 检查磁盘空间
3. 手动创建备份目录: mkdir -p .claude/backups/product_requirements
```

---

**🎉 开始重新生成需求文档吧！**

