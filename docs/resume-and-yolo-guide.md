# 🔄 断点续传和 YOLO 模式使用指南

> **版本**: v2.2.0  
> **日期**: 2025-10-02  
> **功能**: 断点续传 + YOLO 模式

---

## 📋 目录

1. [问题场景](#问题场景)
2. [解决方案](#解决方案)
3. [使用方法](#使用方法)
4. [模式对比](#模式对比)
5. [实战示例](#实战示例)
6. [注意事项](#注意事项)
7. [故障排除](#故障排除)

---

## 🎯 问题场景

### 场景1: 电脑重启后恢复

**问题**:
```
你正在开发 T010 任务
突然电脑死机/重启
重启后，你想继续从 T010 开始
```

**之前的做法**:
```bash
# 需要手动记住任务ID
/developer T010

# 或者查看任务状态
cat task_status.json | grep in_progress
/developer T010
```

**现在的做法**:
```bash
# 一条命令自动恢复
/developer-resume auto
```

---

### 场景2: 批量执行任务

**问题**:
```
你有 50 个简单任务要执行
每个任务都需要手动确认
非常耗时
```

**之前的做法**:
```bash
/developer auto T001
# 等待完成...
/developer auto T002
# 等待完成...
# ... 重复 50 次
```

**现在的做法**:
```bash
# YOLO 模式一次性执行所有任务
/developer-resume yolo
```

---

## ✅ 解决方案

### 1. 断点续传机制

**核心功能**:
- ✅ 自动检测进行中的任务
- ✅ 如果没有进行中的任务，查找下一个待执行任务
- ✅ 支持三种执行模式（手动/自动/YOLO）
- ✅ 智能恢复任务状态

**工作原理**:
```
1. 读取 task_status.json
2. 查找状态为 "in_progress" 的任务
3. 如果找到，从该任务继续
4. 如果没找到，查找下一个 "pending" 任务
5. 根据模式执行任务
```

---

### 2. YOLO 模式

**核心功能**:
- 🚀 完全自动化，无任何确认
- 🚀 自动提交代码到 Git
- 🚀 自动推送到远程仓库
- 🚀 自动继续下一个任务
- 🚀 遇到错误立即停止

**工作原理**:
```
1. 检测到 "yolo" 参数
2. 设置 YOLO_MODE=yes
3. 跳过所有确认步骤
4. 执行完任务后自动提交
5. 自动推送到远程仓库
6. 自动继续下一个任务
```

---

## 🚀 使用方法

### 方法1: 使用 /developer-resume 命令

#### 手动模式（默认）

```bash
/developer-resume
```

**特点**:
- 检测中断的任务
- 每个阶段等待确认
- 适合复杂任务
- 风险等级: 🟢 低

**输出示例**:
```
🔍 检测上次中断的任务...

🔄 找到中断的任务: T010

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 恢复任务: T010
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

任务详情:
{
  "id": "T010",
  "title": "实现用户登录功能",
  "status": "in_progress",
  ...
}

准备恢复任务: T010
是否继续? (y/N): _
```

---

#### 自动模式

```bash
/developer-resume auto
```

**特点**:
- 自动检测并恢复
- 无需手动确认
- 适合简单任务
- 风险等级: 🟡 中

**输出示例**:
```
🔍 检测上次中断的任务...
🔄 找到中断的任务: T010
🤖 自动化模式已激活 - 将自动执行所有步骤

🚀 开始执行任务...

✅ [自动确认] 📋 实现计划已生成，准备开始编写测试
✅ [自动确认] ⚠️ 测试已创建并确认失败
✅ [自动确认] ✅ 功能实现完成，所有测试通过
...
```

---

#### YOLO 模式

```bash
/developer-resume yolo
```

**特点**:
- 完全自动化
- 自动提交和推送
- 适合批量任务
- 风险等级: 🔴 高

**输出示例**:
```
🔍 检测上次中断的任务...
📋 找到下一个待执行任务: T010
🚀 YOLO 模式已激活 - 完全自动化，包括自动提交和推送
⚠️  警告: 此模式将自动执行所有操作，风险较高

🚀 开始执行任务...

✅ [自动确认] 📋 实现计划已生成
✅ [自动确认] ⚠️ 测试已创建
✅ [自动确认] ✅ 功能实现完成
✅ [自动确认] ✅ 代码重构完成

✅ 代码已提交到本地仓库
🚀 YOLO 模式: 自动推送到远程仓库...
✅ 代码已推送到远程仓库 (分支: main)

✅ 任务 T010 完成！
🚀 自动继续下一个任务: T011
...
```

---

### 方法2: 直接使用 /developer 命令

#### 手动模式

```bash
/developer T010
```

#### 自动模式

```bash
/developer auto T010
# 或
/developer T010 auto
```

#### YOLO 模式

```bash
/developer yolo T010
# 或
/developer T010 yolo
```

---

## 📊 模式对比

| 特性 | 手动模式 | 自动模式 | YOLO模式 |
|------|---------|---------|---------|
| **触发方式** | `/developer-resume` | `/developer-resume auto` | `/developer-resume yolo` |
| **用户确认** | ✅ 每步确认 | ❌ 无确认 | ❌ 无确认 |
| **自动提交** | ❌ 需确认 | ❌ 需确认 | ✅ 自动 |
| **自动推送** | ❌ 需确认 | ❌ 需确认 | ✅ 自动 |
| **继续下一任务** | ❌ 手动 | ❌ 手动 | ✅ 自动 |
| **错误处理** | 🛑 停止等待 | 🛑 停止报告 | 🛑 停止报告 |
| **适用场景** | 复杂任务 | 简单任务 | 批量任务 |
| **风险等级** | 🟢 低 | 🟡 中 | 🔴 高 |
| **推荐使用** | 生产环境 | 测试环境 | 测试分支 |

---

## 💡 实战示例

### 示例1: 电脑重启后恢复（您的场景）

**背景**:
- 你正在开发 T010 任务
- 电脑突然重启
- 想要继续开发

**操作步骤**:

```bash
# 1. 打开项目
cd /home/rogers/source/streaming/AIOTSystem

# 2. 检查任务状态（可选）
node .claude/tools/task.js list in_progress

# 3. 自动恢复并继续
/developer-resume auto

# 系统会自动:
# - 检测到 T010 是进行中的任务
# - 从 T010 开始执行
# - 自动完成所有步骤
# - 完成后停止（不会自动继续下一个任务）
```

---

### 示例2: 批量执行剩余任务（YOLO 模式）

**背景**:
- 你已经完成了 T001-T009
- 还有 T010-T085 共 76 个任务
- 这些任务都比较简单
- 想要一次性完成

**操作步骤**:

```bash
# 1. 确保在测试分支
git checkout -b feature/auto-development

# 2. 启动 YOLO 模式
/developer-resume yolo

# 系统会自动:
# - 从 T010 开始执行
# - 完成一个任务后自动提交
# - 自动推送到远程仓库
# - 自动继续下一个任务
# - 直到所有任务完成或遇到错误

# 3. 如果中途遇到错误
# 系统会停止并显示错误信息
# 你可以修复错误后继续:
/developer-resume yolo

# 4. 完成后合并到主分支
git checkout main
git merge feature/auto-development
```

---

### 示例3: 手动中断后恢复

**背景**:
- 你在执行 T015 时按了 Ctrl+C
- 想要继续执行

**操作步骤**:

```bash
# 1. 检查任务状态
node .claude/tools/task.js list in_progress

# 输出:
# [
#   {
#     "id": "T015",
#     "status": "in_progress",
#     ...
#   }
# ]

# 2. 恢复执行（手动模式）
/developer-resume

# 3. 或者自动模式
/developer-resume auto
```

---

## ⚠️ 注意事项

### 1. YOLO 模式风险

**会自动执行的操作**:
- ✅ 编写代码
- ✅ 运行测试
- ✅ 修复错误（尝试）
- ✅ 提交代码到 Git
- ✅ 推送到远程仓库
- ✅ 继续下一个任务

**使用前请确保**:
- ✅ 你信任这个系统
- ✅ 你有完整的备份
- ✅ 你在测试分支上工作
- ✅ 你可以随时回滚代码

**建议**:
- 🟢 在测试分支上使用
- 🟢 先用少量任务测试
- 🟢 定期检查代码质量
- 🔴 不要在生产分支上使用
- 🔴 不要在重要项目上直接使用

---

### 2. 任务状态一致性

**问题**:
- 如果有多个进行中的任务，系统会选择第一个
- 建议保持只有一个任务处于进行中状态

**解决方案**:
```bash
# 查看所有进行中的任务
node .claude/tools/task.js list in_progress

# 如果有多个，手动重置不需要的任务
node .claude/tools/task.js update T015 pending
```

---

### 3. 中断恢复

**问题**:
- 系统会从任务的开始重新执行
- 不会保留部分完成的代码

**建议**:
- 在任务完成前不要中断
- 如果必须中断，先提交已完成的代码

---

### 4. 错误处理

**所有模式遇到错误都会停止**:
- 显示错误信息
- 保存当前进度
- 等待手动修复

**修复后继续**:
```bash
# 修复错误后，重新运行
/developer-resume auto

# 或者从特定任务开始
/developer auto T015
```

---

## 🔧 故障排除

### 问题1: 找不到中断的任务

**症状**:
```
✅ 所有任务已完成！
```

**原因**:
- 所有任务都已完成
- 或者任务状态文件损坏

**解决方案**:
```bash
# 1. 检查任务状态
node .claude/tools/task.js stats

# 2. 查看所有任务
node .claude/tools/task.js list

# 3. 如果需要重新执行某个任务
node .claude/tools/task.js update T010 pending
/developer-resume auto
```

---

### 问题2: YOLO 模式推送失败

**症状**:
```
⚠️  推送失败（可能没有配置远程仓库或网络问题）
```

**原因**:
- 没有配置远程仓库
- 网络问题
- 没有推送权限

**解决方案**:
```bash
# 1. 检查远程仓库配置
git remote -v

# 2. 如果没有配置，添加远程仓库
git remote add origin <repository-url>

# 3. 手动推送
git push origin <branch-name>

# 4. 继续 YOLO 模式
/developer-resume yolo
```

---

### 问题3: 任务状态不正确

**症状**:
- 系统恢复了错误的任务
- 或者跳过了某些任务

**解决方案**:
```bash
# 1. 查看任务状态
node .claude/tools/task.js list

# 2. 手动修正任务状态
node .claude/tools/task.js update T010 in_progress
node .claude/tools/task.js update T011 pending

# 3. 重新恢复
/developer-resume auto
```

---

## 📚 相关文档

- `.claude/commands/developer-resume.md` - 恢复命令详细说明
- `.claude/commands/developer.md` - 开发者命令详细说明
- `.claude/tools/task.js` - 任务管理工具
- `docs/fixes-summary.md` - 问题修复总结

---

## 🎯 快速参考

### 常用命令

```bash
# 恢复开发（手动模式）
/developer-resume

# 恢复开发（自动模式）
/developer-resume auto

# 恢复开发（YOLO 模式）
/developer-resume yolo

# 查看任务状态
node .claude/tools/task.js stats

# 查看进行中的任务
node .claude/tools/task.js list in_progress

# 查看下一个任务
node .claude/tools/task.js next

# 更新任务状态
node .claude/tools/task.js update T010 pending
```

---

**版本**: v2.2.0  
**发布日期**: 2025-10-02  
**维护者**: Claude Code GPT-Pilot Team

