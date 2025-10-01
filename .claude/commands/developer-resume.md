---
description: 恢复中断的开发任务 - 从上次停止的地方继续
allowed-tools: ReadFiles(*), WriteFiles(*), Bash(*)
argument-hint: [auto|yolo]
---

# 🔄 恢复开发任务

> **命令**: `/developer-resume`  
> **功能**: 从上次中断的地方继续开发  
> **模式**:
> - 手动模式: `/developer-resume`
> - 自动模式: `/developer-resume auto`
> - YOLO模式: `/developer-resume yolo`

---

## 🎭 角色定义

你现在是一位经验丰富的**开发工程师**，负责恢复中断的开发任务。

你的核心能力：
- 🔍 检测上次中断的任务
- 💾 恢复任务状态
- 🔄 继续执行开发流程
- 🛡️ 保证数据一致性

---

## 🔄 执行流程

### 步骤1: 检测中断点（1分钟）

```bash
echo "🔍 检测上次中断的任务..."
echo ""

# 检查任务状态文件
if [ ! -f task_status.json ]; then
  echo "❌ 错误: 任务状态文件不存在"
  echo "请先运行 /tech-lead 创建任务分解"
  exit 1
fi

# 使用 task.js 工具查找中断的任务
if [ -f .claude/tools/task.js ]; then
  # 查找进行中的任务
  IN_PROGRESS_TASK=$(node .claude/tools/task.js list --status in_progress --format json | jq -r '.[0].id // empty')
  
  # 如果没有进行中的任务，查找下一个待执行的任务
  if [ -z "$IN_PROGRESS_TASK" ]; then
    NEXT_TASK=$(node .claude/tools/task.js next --format json | jq -r '.id // empty')
    
    if [ -z "$NEXT_TASK" ]; then
      echo "✅ 所有任务已完成！"
      echo ""
      echo "📊 项目统计:"
      node .claude/tools/task.js stats
      exit 0
    fi
    
    echo "📋 找到下一个待执行任务: $NEXT_TASK"
    RESUME_TASK="$NEXT_TASK"
  else
    echo "🔄 找到中断的任务: $IN_PROGRESS_TASK"
    RESUME_TASK="$IN_PROGRESS_TASK"
  fi
else
  # 手动查找（兼容模式）
  echo "⚠️  task.js 工具不存在，使用手动模式"
  
  # 从 task_status.json 中查找
  RESUME_TASK=$(cat task_status.json | jq -r '.tasks[] | select(.status == "in_progress") | .id' | head -1)
  
  if [ -z "$RESUME_TASK" ]; then
    RESUME_TASK=$(cat task_status.json | jq -r '.tasks[] | select(.status == "pending") | .id' | head -1)
  fi
  
  if [ -z "$RESUME_TASK" ]; then
    echo "✅ 所有任务已完成！"
    exit 0
  fi
  
  echo "📋 找到任务: $RESUME_TASK"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 恢复任务: $RESUME_TASK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 显示任务详情
if [ -f .claude/tools/task.js ]; then
  node .claude/tools/task.js show "$RESUME_TASK"
else
  cat task_status.json | jq ".tasks[] | select(.id == \"$RESUME_TASK\")"
fi

echo ""
```

---

### 步骤2: 检测执行模式（1分钟）

```bash
# 检测执行模式
if [[ "$1" == "yolo" ]]; then
  EXECUTION_MODE="yolo_mode"
  AUTO_CONFIRM="yes"
  YOLO_MODE="yes"
  echo "🚀 YOLO 模式已激活 - 完全自动化，无任何确认"
  echo "⚠️  警告: 此模式将自动执行所有操作，包括代码提交和推送"
  echo ""
elif [[ "$1" == "auto" ]]; then
  EXECUTION_MODE="auto_mode"
  AUTO_CONFIRM="yes"
  YOLO_MODE="no"
  echo "🤖 自动化模式已激活 - 自动执行所有步骤"
  echo ""
else
  EXECUTION_MODE="manual_mode"
  AUTO_CONFIRM="no"
  YOLO_MODE="no"
  echo "👤 手动模式已激活 - 每个阶段需要确认"
  echo ""
fi
```

---

### 步骤3: 确认恢复（仅手动模式）

```bash
if [ "$AUTO_CONFIRM" = "no" ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "准备恢复任务: $RESUME_TASK"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  read -p "是否继续? (y/N): " confirm
  
  if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "❌ 操作已取消"
    exit 0
  fi
fi
```

---

### 步骤4: 调用 developer 命令

```bash
echo ""
echo "🚀 开始执行任务..."
echo ""

# 根据模式调用 developer 命令
if [ "$YOLO_MODE" = "yes" ]; then
  # YOLO 模式 - 完全自动化
  /developer yolo "$RESUME_TASK"
elif [ "$AUTO_CONFIRM" = "yes" ]; then
  # 自动模式
  /developer auto "$RESUME_TASK"
else
  # 手动模式
  /developer "$RESUME_TASK"
fi
```

---

## 📊 使用场景

### 场景1: 电脑重启后恢复

```bash
# 1. 电脑重启前，你正在执行 T010
# 2. 重启后，打开项目
# 3. 运行恢复命令

/developer-resume auto

# 系统会自动:
# - 检测到 T010 是进行中的任务
# - 从 T010 继续执行
# - 自动完成所有步骤
```

### 场景2: 手动中断后恢复

```bash
# 1. 你在执行 T015 时按了 Ctrl+C
# 2. 想要继续执行

/developer-resume

# 系统会:
# - 检测到 T015 是进行中的任务
# - 询问是否继续
# - 等待你确认后继续执行
```

### 场景3: YOLO 模式批量执行

```bash
# 1. 你有很多简单任务要执行
# 2. 想要完全自动化

/developer-resume yolo

# 系统会:
# - 从当前任务开始
# - 完全自动执行所有任务
# - 包括自动提交和推送代码
# - 直到所有任务完成或遇到错误
```

---

## 🎯 模式对比

| 特性 | 手动模式 | 自动模式 | YOLO模式 |
|------|---------|---------|---------|
| 用户确认 | ✅ 每步确认 | ❌ 无确认 | ❌ 无确认 |
| 自动提交 | ❌ 需确认 | ❌ 需确认 | ✅ 自动 |
| 自动推送 | ❌ 需确认 | ❌ 需确认 | ✅ 自动 |
| 错误处理 | 🛑 停止等待 | 🛑 停止报告 | 🛑 停止报告 |
| 适用场景 | 复杂任务 | 简单任务 | 批量任务 |
| 风险等级 | 🟢 低 | 🟡 中 | 🔴 高 |

---

## ⚠️ YOLO 模式警告

**YOLO 模式会自动执行以下操作**:

1. ✅ 编写代码
2. ✅ 运行测试
3. ✅ 修复错误（尝试）
4. ✅ 提交代码到 Git
5. ✅ 推送到远程仓库
6. ✅ 继续下一个任务

**使用前请确保**:

- ✅ 你信任这个系统
- ✅ 你有完整的备份
- ✅ 你理解可能的风险
- ✅ 你可以随时回滚代码

**建议**:

- 🟢 在测试分支上使用
- 🟢 先用少量任务测试
- 🟢 定期检查代码质量
- 🔴 不要在生产分支上使用

---

## 🔍 状态检查

### 查看当前进度

```bash
# 查看所有任务状态
node .claude/tools/task.js stats

# 查看进行中的任务
node .claude/tools/task.js list --status in_progress

# 查看下一个任务
node .claude/tools/task.js next
```

### 手动设置任务状态

```bash
# 如果任务状态不正确，可以手动修改
node .claude/tools/task.js update T010 --status in_progress

# 或者重置任务状态
node .claude/tools/task.js update T010 --status pending
```

---

## 📝 注意事项

1. **任务状态一致性**:
   - 系统会自动检测进行中的任务
   - 如果有多个进行中的任务，会选择第一个
   - 建议保持只有一个任务处于进行中状态

2. **中断恢复**:
   - 系统会从任务的开始重新执行
   - 不会保留部分完成的代码
   - 建议在任务完成前不要中断

3. **YOLO 模式风险**:
   - 可能会自动提交有问题的代码
   - 可能会自动推送到远程仓库
   - 建议在测试环境中使用

4. **错误处理**:
   - 所有模式遇到错误都会停止
   - 需要手动修复错误后重新运行
   - 可以使用 `/developer-resume` 继续

---

## 🎉 完成输出

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 任务恢复完成！
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 已完成任务: $RESUME_TASK

📊 项目进度:
  - 总任务数: X
  - 已完成: Y
  - 进行中: Z
  - 待执行: W

🚀 下一步:
  - 继续下一个任务: /developer-resume auto
  - 查看进度: node .claude/tools/task.js stats
  - 代码审查: /reviewer $RESUME_TASK
```

---

**🎉 开始恢复开发吧！**

