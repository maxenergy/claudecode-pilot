# 🚀 YOLO 模式快速开始指南

> **目标**: 在您的项目中快速启用 YOLO 模式  
> **时间**: 5分钟  
> **难度**: ⭐ 简单

---

## 📋 快速步骤

### 步骤1: 复制新命令文件到您的项目

```bash
# 进入您的项目目录
cd /home/rogers/source/streaming/AIOTSystem

# 复制 developer-auto 命令
cp /home/rogers/source/tools/claudecode-pilot/examples/developer-auto.md.template \
   .claude/commands/developer-auto.md

# 复制 developer-yolo 命令
cp /home/rogers/source/tools/claudecode-pilot/examples/developer-yolo.md.template \
   .claude/commands/developer-yolo.md

# 替换项目名称占位符
sed -i 's/{{PROJECT_NAME}}/AIOTSystem/g' .claude/commands/developer-auto.md
sed -i 's/{{PROJECT_NAME}}/AIOTSystem/g' .claude/commands/developer-yolo.md

echo "✅ 命令文件已复制并配置完成"
```

### 步骤2: 验证命令文件

```bash
# 检查文件是否存在
ls -la .claude/commands/developer*.md

# 应该看到:
# developer.md
# developer-auto.md
# developer-yolo.md

# 检查 YOLO 模式配置
head -50 .claude/commands/developer-yolo.md | grep "YOLO_MODE"

# 应该看到:
# export YOLO_MODE="yes"
```

### 步骤3: 测试 YOLO 模式

在 Claude Code 中运行：

```
/developer-yolo
```

应该看到：

```
🚀 YOLO 模式已激活

⚠️  警告: 此模式将自动执行所有操作，风险较高

📋 将自动执行:
  ✅ 编写代码
  ✅ 运行测试
  ✅ 提交到 Git
  ✅ 推送到远程仓库
  ✅ 继续下一个任务

🔍 未指定任务ID，查找下一个待执行任务...
✅ 找到下一个任务: T001
```

---

## 🎯 使用示例

### 示例1: 执行单个任务（YOLO 模式）

```bash
# 在测试分支上
git checkout -b feature/yolo-test

# 执行特定任务
/developer-yolo T010
```

### 示例2: 批量执行所有剩余任务

```bash
# 创建测试分支
git checkout -b feature/batch-development

# 启动 YOLO 模式（自动查找下一个任务）
/developer-yolo

# 系统会自动:
# 1. 找到下一个待执行任务
# 2. 实现功能
# 3. 运行测试
# 4. 提交代码
# 5. 推送到远程
# 6. 继续下一个任务
# 7. 重复直到所有任务完成或遇到错误
```

### 示例3: 使用自动模式（更安全）

```bash
# 自动执行，但提交需要确认
/developer-auto T010

# 系统会:
# 1. 自动实现功能
# 2. 自动运行测试
# 3. 询问是否提交
# 4. 询问是否推送
```

---

## 📊 三种模式对比

| 命令 | 确认 | 提交 | 推送 | 继续 | 风险 | 适用场景 |
|------|------|------|------|------|------|---------|
| `/developer T001` | ✅ 每步 | ⚠️ 需确认 | ⚠️ 需确认 | ❌ 手动 | 🟢 低 | 复杂任务 |
| `/developer-auto T001` | ❌ 无 | ⚠️ 需确认 | ⚠️ 需确认 | ❌ 手动 | 🟡 中 | 简单任务 |
| `/developer-yolo T001` | ❌ 无 | ✅ 自动 | ✅ 自动 | ✅ 自动 | 🔴 高 | 大量简单任务 |

---

## ⚠️ 安全提示

### 使用 YOLO 模式前

1. **创建测试分支**:
   ```bash
   git checkout -b feature/yolo-$(date +%Y%m%d)
   ```

2. **创建备份**:
   ```bash
   git branch backup-$(date +%Y%m%d)
   ```

3. **确认远程仓库**:
   ```bash
   git remote -v
   # 确保推送到正确的仓库
   ```

### 使用 YOLO 模式时

1. **监控执行**: 不要离开电脑
2. **准备停止**: 随时可以 Ctrl+C
3. **检查代码**: 定期查看生成的代码

### 使用 YOLO 模式后

1. **审查代码**:
   ```bash
   git log --oneline -10
   git diff main..feature/yolo-test
   ```

2. **运行测试**:
   ```bash
   npm test  # 或其他测试命令
   ```

3. **合并到主分支**:
   ```bash
   git checkout main
   git merge feature/yolo-test
   ```

---

## 🔧 故障排除

### 问题: 命令不存在

```bash
# 检查命令文件
ls .claude/commands/developer-yolo.md

# 如果不存在，重新复制
cp /home/rogers/source/tools/claudecode-pilot/examples/developer-yolo.md.template \
   .claude/commands/developer-yolo.md
```

### 问题: 仍然要求确认

```bash
# 确认使用正确的命令
/developer-yolo T001  # ✅ 正确
/developer yolo T001  # ❌ 错误（旧方式）

# 检查环境变量设置
grep "YOLO_MODE" .claude/commands/developer-yolo.md
```

### 问题: 推送失败

```bash
# 检查远程仓库
git remote -v

# 手动推送
git push origin $(git branch --show-current)
```

---

## 📚 完整文档

- [YOLO 模式修复说明](yolo-mode-fix.md) - 详细的问题分析和解决方案
- [断点续传和 YOLO 模式指南](resume-and-yolo-guide.md) - 完整的使用指南
- [用户指南](user-guide.md) - 整体系统使用指南

---

## 🎉 开始使用

现在您可以：

1. ✅ 使用 `/developer-yolo` 进行完全自动化开发
2. ✅ 使用 `/developer-auto` 进行半自动化开发
3. ✅ 使用 `/developer` 进行手动开发

**建议**: 先在测试分支上尝试 `/developer-auto`，熟悉后再使用 `/developer-yolo`。

---

**祝您开发愉快！** 🚀

