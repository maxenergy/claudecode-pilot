---
description: 查看所有文档的状态和元数据
allowed-tools: ReadFiles(*), Bash(*)
---

# 📊 文档状态查看

> **命令**: `/doc-status`  
> **功能**: 查看所有项目文档的状态、版本和元数据  
> **项目**: {{PROJECT_NAME}}

---

## 🎭 角色定义

你现在是一位**文档管理员**，负责检查和报告所有文档的状态。

---

## 📥 输入

**项目文档**:
- `docs/product_requirements.md`
- `docs/architecture.md`
- `docs/tasks.md`
- `task_status.json`

---

## 🔄 执行流程

### 步骤1: 检查文档存在性

```bash
echo "📋 检查项目文档..."
echo ""

docs=(
  "docs/product_requirements.md:需求文档"
  "docs/architecture.md:架构文档"
  "docs/tasks.md:任务分解"
  "task_status.json:任务状态"
)

for entry in "${docs[@]}"; do
  IFS=':' read -r file desc <<< "$entry"
  if [ -f "$file" ]; then
    echo "✅ $desc ($file)"
  else
    echo "❌ $desc ($file) - 不存在"
  fi
done
```

---

### 步骤2: 解析文档元数据

```bash
echo ""
echo "📊 文档元数据:"
echo ""

for doc in docs/*.md; do
  if [ -f "$doc" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📄 $(basename "$doc")"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    node .claude/tools/doc-manager.js parse "$doc"
    echo ""
  fi
done
```

---

### 步骤3: 检测文档变更

```bash
echo "🔍 检测文档变更:"
echo ""

for doc in docs/*.md; do
  if [ -f "$doc" ]; then
    echo "检查: $(basename "$doc")"
    result=$(node .claude/tools/doc-manager.js detect-changes "$doc")
    echo "$result"
    echo ""
  fi
done
```

---

### 步骤4: 检测冲突

```bash
echo "⚠️  检测未解决的冲突:"
echo ""

conflicts_found=0

for doc in docs/*.md; do
  if [ -f "$doc" ]; then
    if node .claude/tools/doc-merger.js detect-conflicts "$doc" 2>/dev/null | grep -q "Found"; then
      echo "⚠️  $(basename "$doc") 存在冲突"
      node .claude/tools/doc-merger.js detect-conflicts "$doc"
      conflicts_found=$((conflicts_found + 1))
      echo ""
    fi
  fi
done

if [ $conflicts_found -eq 0 ]; then
  echo "✅ 没有发现未解决的冲突"
fi
```

---

### 步骤5: 检查依赖关系

```bash
echo ""
echo "🔗 文档依赖关系:"
echo ""

cat << 'EOF'
product_requirements.md (根文档)
├── version: [从元数据读取]
├── modified_by: [从元数据读取]
├── triggers: architecture.md, tasks.md
│
architecture.md
├── version: [从元数据读取]
├── modified_by: [从元数据读取]
├── depends on: product_requirements.md
├── triggers: tasks.md
│
tasks.md
├── version: [从元数据读取]
├── modified_by: [从元数据读取]
├── depends on: product_requirements.md, architecture.md
└── triggers: (无)
EOF
```

---

### 步骤6: 任务状态统计

```bash
echo ""
echo "📈 任务状态统计:"
echo ""

if [ -f task_status.json ]; then
  node .claude/tools/task.js stats
else
  echo "❌ 任务状态文件不存在"
fi
```

---

### 步骤7: 备份历史

```bash
echo ""
echo "💾 备份历史:"
echo ""

if [ -d .claude/backups ]; then
  echo "最近的备份:"
  find .claude/backups -type d -maxdepth 1 | sort -r | head -5 | while read dir; do
    if [ "$dir" != ".claude/backups" ]; then
      size=$(du -sh "$dir" 2>/dev/null | cut -f1)
      echo "  - $(basename "$dir") ($size)"
    fi
  done
else
  echo "❌ 没有找到备份目录"
fi
```

---

### 步骤8: 生成状态报告

```bash
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 文档状态总结"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 统计文档数量
total_docs=$(find docs -name "*.md" -type f | wc -l)
echo "📄 文档总数: $total_docs"

# 统计有手动修改的文档
manual_modified=0
for doc in docs/*.md; do
  if [ -f "$doc" ]; then
    if node .claude/tools/doc-manager.js detect-changes "$doc" | grep -q '"hasManualChanges": true'; then
      manual_modified=$((manual_modified + 1))
    fi
  fi
done
echo "✏️  手动修改: $manual_modified 个文档"

# 统计有冲突的文档
conflicts=0
for doc in docs/*.md; do
  if [ -f "$doc" ]; then
    if node .claude/tools/doc-merger.js detect-conflicts "$doc" 2>/dev/null | grep -q "Found"; then
      conflicts=$((conflicts + 1))
    fi
  fi
done
echo "⚠️  未解决冲突: $conflicts 个文档"

# 备份数量
backup_count=$(find .claude/backups -maxdepth 1 -type d 2>/dev/null | wc -l)
backup_count=$((backup_count - 1))  # 减去 backups 目录本身
echo "💾 备份数量: $backup_count"

echo ""
```

---

## 🎯 完成输出

完成后，向用户输出完整的状态报告：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 {{PROJECT_NAME}} - 文档状态报告
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 文档清单:
✅ 需求文档 (docs/product_requirements.md)
✅ 架构文档 (docs/architecture.md)
✅ 任务分解 (docs/tasks.md)
✅ 任务状态 (task_status.json)

📊 文档元数据:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 product_requirements.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "version": "1.1",
  "generated_by": "product-owner",
  "generated_at": "2025-10-01T10:00:00.000Z",
  "last_modified": "2025-10-01T16:30:00.000Z",
  "modified_by": "human",
  "manual_sections": [
    {
      "lines": [120, 135],
      "description": "添加移动端支持需求"
    }
  ],
  "dependencies": [],
  "triggers_regeneration": ["architecture.md", "tasks.md"]
}

[其他文档的元数据...]

🔍 变更检测:

检查: product_requirements.md
{
  "hasManualChanges": true,
  "hasContentChanged": true,
  "manualSections": [...],
  "version": "1.1",
  "lastModified": "2025-10-01T16:30:00.000Z",
  "modifiedBy": "human"
}

[其他文档的变更检测...]

⚠️  未解决的冲突:

✅ 没有发现未解决的冲突

🔗 文档依赖关系:

product_requirements.md (根文档)
├── version: v1.1
├── modified_by: human
├── triggers: architecture.md, tasks.md
│
architecture.md
├── version: v1.1
├── modified_by: architect
├── depends on: product_requirements.md
├── triggers: tasks.md
│
tasks.md
├── version: v1.1
├── modified_by: tech-lead
├── depends on: product_requirements.md, architecture.md
└── triggers: (无)

📈 任务状态统计:

Project: {{PROJECT_NAME}}
Total tasks: 88
Completed: 25 (28%)
In progress: 5 (6%)
Pending: 58 (66%)

💾 备份历史:

最近的备份:
  - full_backup_20251001_180000 (15M)
  - architecture_20251001_164500 (2.5M)
  - product_requirements_20251001_163000 (1.8M)
  - tasks_20251001_170000 (3.2M)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 文档状态总结
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 文档总数: 3
✏️  手动修改: 1 个文档
⚠️  未解决冲突: 0 个文档
💾 备份数量: 4

🚀 建议操作:

✅ 文档状态良好
- 所有文档都存在
- 没有未解决的冲突
- 备份记录完整

💡 提示:
- 1 个文档有手动修改，重新生成时会保留
- 定期运行 /doc-status 检查文档状态
- 重大变更前建议运行 /regenerate-all
```

---

## 📝 注意事项

1. **定期检查**: 建议每周运行一次 `/doc-status`
2. **变更前检查**: 重大变更前先检查文档状态
3. **冲突处理**: 发现冲突立即处理
4. **备份管理**: 定期清理旧备份，保留重要版本

---

**🎉 查看文档状态吧！**

