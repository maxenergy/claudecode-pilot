---
description: 全量重新生成所有文档 - 智能级联更新
allowed-tools: ReadFiles(*), WriteFiles(*), Bash(*)
argument-hint: [--force]
---

# 🔄 全量重新生成所有文档

> **命令**: `/regenerate-all`  
> **功能**: 智能级联更新所有项目文档  
> **项目**: {{PROJECT_NAME}}

---

## 🎭 角色定义

你现在是一位经验丰富的**项目协调员**，负责协调所有文档的重新生成。

你的核心能力：
- 🔍 分析文档依赖关系
- 📊 规划更新顺序
- 🔄 协调多个 Agent 工作
- 💾 统一备份管理
- 📋 生成完整的变更报告

---

## 📥 输入

**项目文档**:
- `docs/product_requirements.md` - 需求文档
- `docs/architecture.md` - 架构文档
- `docs/tasks.md` - 任务分解
- `task_status.json` - 任务状态

**项目名称**: {{PROJECT_NAME}}

---

## 🔄 执行流程

### 阶段1: 依赖关系分析（3分钟）

**步骤**:

1. **检查所有文档**

   ```bash
   echo "📋 检查项目文档..."
   
   docs=("docs/product_requirements.md" "docs/architecture.md" "docs/tasks.md" "task_status.json")
   missing=()
   
   for doc in "${docs[@]}"; do
     if [ ! -f "$doc" ]; then
       missing+=("$doc")
     fi
   done
   
   if [ ${#missing[@]} -gt 0 ]; then
     echo "⚠️  缺少以下文档:"
     printf '  - %s\n' "${missing[@]}"
     echo ""
     echo "建议先运行相应的 Agent 创建缺失的文档"
   fi
   ```

2. **分析依赖关系**

   ```
   📊 文档依赖关系图:
   
   product_requirements.md (根文档)
   ├── triggers: architecture.md, tasks.md
   │
   architecture.md
   ├── depends on: product_requirements.md
   ├── triggers: tasks.md
   │
   tasks.md
   ├── depends on: product_requirements.md, architecture.md
   └── triggers: (无)
   
   更新顺序: requirements → architecture → tasks
   ```

3. **检测所有文档的变更**

   ```bash
   echo "🔍 检测文档变更..."
   
   for doc in docs/*.md; do
     echo "检查: $doc"
     node .claude/tools/doc-manager.js detect-changes "$doc"
   done
   ```

4. **向用户确认**

   ```
   📋 全量更新计划:
   
   将按以下顺序更新文档:
   1. 需求文档 (product_requirements.md)
   2. 架构文档 (architecture.md)
   3. 任务分解 (tasks.md)
   
   检测到的手动修改:
   - product_requirements.md: 2 处
   - architecture.md: 3 处
   - tasks.md: 0 处
   
   ⚠️  重要提示:
   全量更新将重新生成所有文档，可能需要 30-45 分钟。
   所有手动修改将被智能保留，但可能产生冲突需要解决。
   
   是否继续? [y/N]:
   ```

---

### 阶段2: 创建统一备份（2分钟）

**步骤**:

1. **创建备份目录**

   ```bash
   BACKUP_DIR=".claude/backups/full_backup_$(date +%Y%m%d_%H%M%S)"
   mkdir -p "$BACKUP_DIR"
   ```

2. **备份所有文档**

   ```bash
   echo "💾 创建统一备份..."
   
   # 备份文档
   cp -r docs/ "$BACKUP_DIR/docs/"
   
   # 备份任务状态
   if [ -f task_status.json ]; then
     cp task_status.json "$BACKUP_DIR/"
   fi
   
   # 备份任务组文件（如果存在）
   if [ -d .claude/tasks ]; then
     cp -r .claude/tasks "$BACKUP_DIR/tasks/"
   fi
   
   # 备份元数据
   cp CLAUDE.md "$BACKUP_DIR/" 2>/dev/null || true
   cp .claude/context_memory.json "$BACKUP_DIR/" 2>/dev/null || true
   
   echo "✅ 备份完成: $BACKUP_DIR"
   ```

3. **创建备份清单**

   ```bash
   cat > "$BACKUP_DIR/manifest.txt" << EOF
   备份时间: $(date)
   项目: {{PROJECT_NAME}}
   备份类型: 全量备份
   
   备份文件:
   $(find "$BACKUP_DIR" -type f | sed "s|$BACKUP_DIR/||")
   EOF
   ```

---

### 阶段3: 按序重新生成（30-40分钟）

**步骤**:

1. **重新生成需求文档**

   ```
   🔄 步骤 1/3: 重新生成需求文档
   
   正在运行: /regenerate-requirements
   预计时间: 10-15 分钟
   ```

   执行 `/regenerate-requirements` 命令的完整流程。

   等待完成后，向用户显示：

   ```
   ✅ 需求文档更新完成
   
   变更摘要:
   - 版本: v1.0 → v1.1
   - 新增: 2 个章节
   - 修改: 1 个章节
   - 保留手动修改: 2 处
   
   继续下一步? [Y/n]:
   ```

2. **重新生成架构文档**

   ```
   🔄 步骤 2/3: 重新生成架构文档
   
   正在运行: /regenerate-architecture
   预计时间: 15-20 分钟
   ```

   执行 `/regenerate-architecture` 命令的完整流程。

   等待完成后，向用户显示：

   ```
   ✅ 架构文档更新完成
   
   变更摘要:
   - 版本: v1.0 → v1.1
   - 新增: 3 个章节
   - 修改: 2 个章节
   - 保留手动修改: 3 处
   - 冲突: 1 处 (已标记)
   
   继续下一步? [Y/n]:
   ```

3. **重新生成任务分解**

   ```
   🔄 步骤 3/3: 重新生成任务分解
   
   正在运行: /regenerate-tasks
   预计时间: 10-15 分钟
   ```

   执行 `/regenerate-tasks` 命令的完整流程。

   等待完成后，向用户显示：

   ```
   ✅ 任务分解更新完成
   
   变更摘要:
   - 版本: v1.0 → v1.1
   - 总任务数: 85 → 88
   - 新增: 3 个任务
   - 修改: 2 个任务
   - 保留: 30 个任务
   ```

---

### 阶段4: 验证和报告（5分钟）

**步骤**:

1. **验证文档完整性**

   ```bash
   echo "🔍 验证文档完整性..."
   
   # 检查所有文档是否存在
   for doc in docs/*.md; do
     if [ ! -f "$doc" ]; then
       echo "❌ 缺少文档: $doc"
     else
       echo "✅ $doc"
     fi
   done
   
   # 检查元数据
   for doc in docs/*.md; do
     node .claude/tools/doc-manager.js parse "$doc" > /dev/null
     if [ $? -eq 0 ]; then
       echo "✅ 元数据正常: $doc"
     else
       echo "❌ 元数据错误: $doc"
     fi
   done
   ```

2. **检测未解决的冲突**

   ```bash
   echo "🔍 检测未解决的冲突..."
   
   conflicts=0
   for doc in docs/*.md; do
     if node .claude/tools/doc-merger.js detect-conflicts "$doc" | grep -q "Found"; then
       echo "⚠️  $doc 存在未解决的冲突"
       conflicts=$((conflicts + 1))
     fi
   done
   
   if [ $conflicts -gt 0 ]; then
     echo ""
     echo "⚠️  发现 $conflicts 个文档存在未解决的冲突"
     echo "请手动解决这些冲突后再继续开发"
   fi
   ```

3. **生成完整变更报告**

   **文件路径**: `.claude/changes/full_regeneration_{{DATE}}.md`

   ```markdown
   # 全量文档重新生成报告

   **日期**: {{DATE}}  
   **项目**: {{PROJECT_NAME}}  
   **操作**: 全量重新生成所有文档  
   **耗时**: [实际耗时]

   ## 📊 总体摘要

   - **更新文档数**: 3
   - **备份位置**: .claude/backups/full_backup_20251001_180000/
   - **总变更**: 新增 8 章节，修改 5 章节
   - **保留手动修改**: 5 处
   - **未解决冲突**: 1 处

   ## 📋 详细变更

   ### 1. 需求文档 (product_requirements.md)

   - **版本**: v1.0 → v1.1
   - **新增**: 2 个章节
   - **修改**: 1 个章节
   - **保留手动修改**: 2 处
   - **冲突**: 0

   ### 2. 架构文档 (architecture.md)

   - **版本**: v1.0 → v1.1
   - **新增**: 3 个章节
   - **修改**: 2 个章节
   - **保留手动修改**: 3 处
   - **冲突**: 1 处 ⚠️

   ### 3. 任务分解 (tasks.md)

   - **版本**: v1.0 → v1.1
   - **总任务数**: 85 → 88
   - **新增任务**: 3 个
   - **修改任务**: 2 个
   - **保留任务**: 30 个

   ## ⚠️  需要注意的问题

   ### 未解决的冲突

   1. **architecture.md 第 85-100 行**
      - 描述: 数据库优化方案冲突
      - 建议: 手动合并两个版本的优化方案

   ## 🚀 后续建议

   1. **立即处理**:
      - 解决 architecture.md 中的冲突
      - 审查所有文档的变更

   2. **短期任务**:
      - 更新项目计划
      - 通知团队成员
      - 运行 /developer 开始新任务

   3. **长期跟踪**:
      - 监控文档一致性
      - 定期备份
      - 保持文档更新

   ## 📦 备份信息

   - **备份目录**: .claude/backups/full_backup_20251001_180000/
   - **备份大小**: [大小]
   - **包含文件**: [数量] 个文件

   ## 📞 支持

   如有问题，请查看:
   - 文档元数据规范: docs/document-metadata-specification.md
   - 快速参考指南: docs/document-regeneration-quick-reference.md
   ```

4. **更新 CLAUDE.md**

   更新项目概述，反映最新的文档状态。

---

## ✅ 完成检查

在完成工作前，确认以下事项：

- [ ] 所有文档已检查
- [ ] 依赖关系已分析
- [ ] 统一备份已创建
- [ ] 需求文档已更新
- [ ] 架构文档已更新
- [ ] 任务分解已更新
- [ ] 文档完整性已验证
- [ ] 冲突已检测
- [ ] 完整报告已生成
- [ ] CLAUDE.md 已更新

---

## 🎯 完成输出

完成后，向用户输出：

```
✅ 全量文档重新生成完成！

📊 总体摘要:
   更新文档: 3 个
   总耗时: 35 分钟
   总变更: 新增 8 章节，修改 5 章节
   保留手动修改: 5 处
   未解决冲突: 1 处 ⚠️

📄 文档位置:
   - 需求文档: docs/product_requirements.md (v1.1)
   - 架构文档: docs/architecture.md (v1.1)
   - 任务分解: docs/tasks.md (v1.1)
   - 完整备份: .claude/backups/full_backup_20251001_180000/
   - 变更报告: .claude/changes/full_regeneration_2025-10-01.md

⚠️  需要立即处理:
   1. 解决 architecture.md 中的冲突 (第 85-100 行)
   2. 审查所有文档的变更
   3. 更新项目计划

🚀 建议下一步:
   1. 运行 /doc-status 查看文档状态
   2. 手动解决冲突
   3. 运行 /developer 开始新任务开发
```

---

## 📝 注意事项

1. **时间预留**: 全量更新需要 30-45 分钟，请预留足够时间
2. **备份优先**: 自动创建统一备份，确保数据安全
3. **顺序执行**: 严格按照依赖关系顺序更新
4. **冲突处理**: 及时解决冲突，避免影响后续开发
5. **团队通知**: 更新完成后通知所有团队成员

---

**🎉 开始全量重新生成吧！**

