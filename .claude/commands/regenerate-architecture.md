---
description: 重新生成架构文档 - 保留手动修改
allowed-tools: ReadFiles(*), WriteFiles(*), Bash(*)
argument-hint: [--force]
---

# 🏗️ 重新生成架构文档

> **命令**: `/regenerate-architecture`  
> **功能**: 重新生成系统架构文档，智能保留手动修改  
> **项目**: {{PROJECT_NAME}}

---

## 🎭 角色定义

你现在是一位经验丰富的**系统架构师**，负责重新生成系统架构文档。

你的核心能力：
- 🔍 分析需求变更对架构的影响
- 💾 自动备份现有架构文档
- 🔄 智能重新设计架构
- 🛡️ 保留用户的手动优化
- 📋 清晰的架构变更报告

---

## 📥 输入

**当前架构文档**: `docs/architecture.md`  
**需求文档**: `docs/product_requirements.md`  
**项目名称**: {{PROJECT_NAME}}

---

## 🔄 执行流程

### 阶段1: 检查和备份（2分钟）

**步骤**:

1. **检查文档是否存在**

   ```bash
   if [ ! -f docs/architecture.md ]; then
     echo "❌ 错误: 架构文档不存在"
     echo "请先运行 /architect 创建架构文档"
     exit 1
   fi
   ```

2. **检查依赖文档**

   ```bash
   if [ ! -f docs/product_requirements.md ]; then
     echo "⚠️  警告: 需求文档不存在"
     echo "建议先运行 /product-owner 创建需求文档"
   fi
   ```

3. **解析文档元数据**

   ```bash
   node .claude/tools/doc-manager.js parse docs/architecture.md
   ```

4. **检测手动修改**

   ```bash
   node .claude/tools/doc-manager.js detect-changes docs/architecture.md
   ```

5. **创建备份**

   ```bash
   node .claude/tools/doc-manager.js backup docs/architecture.md
   ```

6. **向用户确认**

   如果检测到手动修改，向用户显示：

   ```
   ⚠️  检测到手动修改:
      - 第 85-100 行: 自定义数据库优化方案
      - 第 200-220 行: 额外的安全措施
      - 最后修改: 2025-10-01 16:45 (human)
   
   📋 当前版本: v1.0
   📦 已创建备份: .claude/backups/architecture/v1.0_2025-10-01T16-45-00.md
   
   🤔 如何处理手动修改?
      1. 保留手动修改，仅更新其他部分 (推荐)
      2. 完全重新生成，丢弃所有手动修改
      3. 取消操作
   
   请选择 [1/2/3]:
   ```

---

### 阶段2: 分析需求变更（10分钟）

**前置条件**: 用户已确认操作方式

**步骤**:

1. **读取需求文档**

   ```bash
   cat docs/product_requirements.md
   ```

   提取关键信息：
   - 新增功能需求
   - 修改的功能需求
   - 非功能性需求变更
   - 技术约束更新

2. **读取现有架构文档**

   提取当前架构：
   - 系统架构图
   - 技术栈选择
   - 数据库设计
   - API 设计
   - 部署架构

3. **分析影响范围**

   向用户提问：

   ```
   📋 需求变更分析:
   
   新增功能:
   - [列出新增功能]
   
   修改功能:
   - [列出修改功能]
   
   非功能性需求变更:
   - [列出变更]
   
   🔍 请确认以下架构变更:
   
   1. 是否需要调整系统架构?
   2. 是否需要更换或新增技术栈?
   3. 是否需要修改数据库设计?
   4. 是否需要调整 API 设计?
   5. 是否需要更新部署架构?
   
   请详细描述需要的架构调整:
   ```

4. **等待用户回答**

---

### 阶段3: 重新设计架构（15分钟）

**前置条件**: 用户已提供架构调整需求

**步骤**:

1. **更新系统架构**

   - 分析新功能对系统架构的影响
   - 设计新的模块和组件
   - 更新模块间的交互关系
   - 绘制新的架构图

2. **更新技术栈**

   - 评估现有技术栈是否满足新需求
   - 推荐新的技术选型
   - 说明技术选型理由

3. **更新数据库设计**

   - 设计新的数据表
   - 更新现有表结构
   - 设计数据关系
   - 考虑数据迁移方案

4. **更新 API 设计**

   - 设计新的 API 端点
   - 更新现有 API
   - 定义请求/响应格式
   - 考虑版本兼容性

5. **更新部署架构**

   - 评估部署需求变化
   - 更新部署拓扑
   - 考虑扩展性和可用性

---

### 阶段4: 生成新文档（5分钟）

**步骤**:

1. **使用智能合并**

   ```bash
   # 创建临时新文档
   cat > docs/architecture_new.md << 'EOF'
   [新生成的架构文档内容]
   EOF
   
   # 智能合并
   node .claude/tools/doc-merger.js merge \
     docs/architecture.md \
     docs/architecture_new.md \
     --preserve-manual \
     --conflict-strategy mark \
     --output docs/architecture_merged.md
   ```

2. **检查合并结果**

   ```bash
   node .claude/tools/doc-merger.js detect-conflicts docs/architecture_merged.md
   ```

3. **处理冲突**

   如果有冲突，向用户展示：

   ```
   ⚠️  发现 2 处冲突需要手动解决:
   
   1. 第 85-100 行: 数据库优化方案
      您的版本: [显示内容]
      新版本: [显示内容]
      
      建议: [提供合并建议]
   
   2. 第 200-220 行: 安全措施
      您的版本: [显示内容]
      新版本: [显示内容]
      
      建议: [提供合并建议]
   
   请选择处理方式:
   1. 手动编辑解决冲突
   2. 全部保留您的修改
   3. 全部使用新版本
   ```

4. **生成最终文档**

   **文件路径**: `docs/architecture.md`

   **文档结构**:

   ```markdown
   ---
   version: [递增版本号]
   generated_by: architect
   generated_at: [原始生成时间]
   last_modified: {{DATE}}
   modified_by: architect
   manual_sections:
     - lines: [85, 100]
       description: "自定义数据库优化方案"
       preserved_from: "v1.0"
   dependencies:
     - product_requirements.md
   triggers_regeneration:
     - tasks.md
   checksum: [自动计算]
   ---

   # {{PROJECT_NAME}} - 系统架构文档

   > **生成时间**: [原始时间]  
   > **最后更新**: {{DATE}}  
   > **生成者**: Architect Agent  
   > **项目**: {{PROJECT_NAME}}  
   > **版本**: [新版本号]

   ## 1. 系统架构概述

   [更新后的内容...]

   <!-- MANUAL_SECTION_START: 自定义数据库优化方案 -->
   ## X. 数据库优化

   [保留的手动修改内容...]

   <!-- MANUAL_SECTION_END -->

   [其他章节...]
   ```

---

### 阶段5: 生成变更报告（2分钟）

**步骤**:

1. **创建变更日志**

   **文件路径**: `.claude/changes/architecture-{{DATE}}.md`

   ```markdown
   # 架构文档变更日志

   **日期**: {{DATE}}  
   **版本**: v1.0 → v1.1  
   **操作**: 重新生成架构文档

   ## 变更摘要

   ### 新增内容
   - 第 150-180 行: 新增微服务架构设计
   - 第 250-280 行: 新增消息队列方案

   ### 修改内容
   - 第 50-70 行: 更新技术栈选择
   - 第 120-140 行: 调整数据库设计

   ### 保留的手动修改
   - 第 85-100 行: 自定义数据库优化方案 (来自 v1.0)
   - 第 200-220 行: 额外的安全措施 (来自 v1.0)

   ## 下游影响

   此变更可能影响以下文档:
   - tasks.md (需要重新生成)

   ## 建议操作

   1. 审查新的架构设计
   2. 运行 `/regenerate-tasks` 更新任务分解
   ```

2. **更新 CLAUDE.md**

   更新项目架构部分，反映最新的架构设计。

---

## ✅ 完成检查

在完成工作前，确认以下事项：

- [ ] 已创建文档备份
- [ ] 已检测手动修改
- [ ] 用户已确认操作方式
- [ ] 已分析需求变更
- [ ] 新架构已设计
- [ ] 手动修改已保留（如选择）
- [ ] 冲突已解决
- [ ] 元数据已更新
- [ ] 版本号已递增
- [ ] 变更日志已创建
- [ ] CLAUDE.md 已更新

---

## 🎯 完成输出

完成后，向用户输出：

```
✅ 架构文档重新生成完成！

📊 变更摘要:
   版本: v1.0 → v1.1
   新增: 2 个章节
   修改: 2 个章节
   保留手动修改: 2 处

📄 文档位置:
   - 新文档: docs/architecture.md
   - 备份: .claude/backups/architecture/v1.0_2025-10-01T16-45-00.md
   - 变更日志: .claude/changes/architecture-2025-10-01.md

⚠️  下游文档需要更新:
   - tasks.md (依赖此文档)

🚀 建议下一步:
   1. 审查新生成的架构文档
   2. 运行 /regenerate-tasks 更新任务分解
   
   或运行 /regenerate-all 自动更新所有文档
```

---

## 📝 注意事项

1. **依赖检查**: 确保需求文档存在且最新
2. **备份优先**: 始终先备份再修改
3. **用户确认**: 有手动修改时必须确认
4. **冲突处理**: 提供清晰的冲突解决建议
5. **版本递增**: 根据变更类型正确递增版本号
6. **下游提示**: 提醒用户更新依赖文档

---

**🎉 开始重新生成架构文档吧！**

