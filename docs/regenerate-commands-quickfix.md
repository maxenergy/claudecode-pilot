# 🚀 Regenerate 命令快速修复指南

> **适用场景**: 如果你在使用 `/regenerate-tasks` 等命令时遇到执行失败  
> **修复时间**: 5分钟  
> **难度**: ⭐ 简单

---

## 📋 问题症状

运行 `/regenerate-tasks` 时看到类似错误：

```
> /regenerate-tasks is running…
  ⎿ Allowed 3 tools for this command

● Bash(if [ ! -f docs/tasks.md ]; then echo "❌ 错误: 任务文档不存在"; exit 1; fi && if [ ! -f docs/product_requirements.md ]...
  ⎿ Running…
  ⎿ 命令执行失败或卡住
```

---

## ✅ 快速解决方案

### 方案 1: 更新到最新版本（推荐）

如果你是通过 npm 安装的：

```bash
# 更新到最新版本
npm update -g claudecode-gpt

# 或者重新安装
npm uninstall -g claudecode-gpt
npm install -g claudecode-gpt
```

如果你是通过 git clone 安装的：

```bash
cd /path/to/claudecode-pilot
git pull origin main
npm install
npm link
```

### 方案 2: 手动更新命令文件

如果你已经在项目中初始化了 claudecode-gpt，需要更新命令文件：

```bash
# 进入你的项目目录
cd /path/to/your/project

# 备份现有命令
cp .claude/commands/regenerate-tasks.md .claude/commands/regenerate-tasks.md.backup

# 从 claudecode-pilot 复制最新版本
cp /path/to/claudecode-pilot/.claude/commands/regenerate-tasks.md .claude/commands/

# 验证更新
cat .claude/commands/regenerate-tasks.md | head -20
```

### 方案 3: 重新初始化项目（如果方案2不可行）

⚠️ **警告**: 这会覆盖 `.claude/` 目录，请先备份！

```bash
# 备份现有配置
cp -r .claude .claude.backup

# 重新初始化
claudecode-gpt init --name "Your Project Name"

# 如果需要，恢复自定义配置
# 手动合并 .claude.backup 中的自定义内容
```

---

## 🔍 验证修复

运行以下命令验证修复是否成功：

```bash
# 检查命令文件是否存在
ls -la .claude/commands/regenerate-tasks.md

# 查看文件前几行，确认有 frontmatter
head -10 .claude/commands/regenerate-tasks.md
```

应该看到类似输出：

```yaml
---
description: 重新生成任务分解 - 保留手动修改
allowed-tools: ReadFiles(*), WriteFiles(*), Bash(*)
argument-hint: [--force]
---
```

---

## 🧪 测试命令

在 Claude Code 中测试命令：

1. 确保你的项目有必要的文档：
   - `docs/product_requirements.md`
   - `docs/architecture.md`
   - `docs/tasks.md`

2. 运行命令：
   ```
   /regenerate-tasks
   ```

3. 应该看到：
   - ✅ 文档检查通过
   - ✅ 备份创建成功
   - ✅ 准备信息显示
   - ✅ Claude Code 询问是否继续

---

## 🆘 如果仍然失败

### 检查清单

- [ ] 确认 `.claude/commands/regenerate-tasks.md` 文件存在
- [ ] 确认文件有正确的 frontmatter（`---` 开头）
- [ ] 确认 `docs/` 目录存在
- [ ] 确认必要的文档文件存在
- [ ] 尝试重启 Claude Code

### 手动执行检查脚本

如果命令仍然失败，可以手动运行检查脚本：

```bash
# 检查文档是否存在
if [ ! -f docs/tasks.md ]; then
  echo "❌ 错误: 任务文档不存在，请先运行 /tech-lead 创建任务分解"
  exit 1
fi

if [ ! -f docs/product_requirements.md ]; then
  echo "❌ 错误: 需求文档不存在"
  exit 1
fi

if [ ! -f docs/architecture.md ]; then
  echo "❌ 错误: 架构文档不存在"
  exit 1
fi

echo "✅ 所有依赖文档存在"
```

### 创建缺失的文档

如果检查发现文档缺失，使用相应的命令创建：

```
# 创建需求文档
/product-owner

# 创建架构文档
/architect

# 创建任务分解
/tech-lead
```

---

## 📚 相关命令

其他 regenerate 命令也可能需要类似的修复：

- `/regenerate-requirements` - 重新生成需求文档
- `/regenerate-architecture` - 重新生成架构文档
- `/regenerate-all` - 重新生成所有文档

如果这些命令也有问题，应用相同的修复方案。

---

## 🔗 获取帮助

如果问题仍未解决：

1. **查看详细文档**: [regenerate-commands-fix.md](regenerate-commands-fix.md)
2. **查看用户指南**: [user-guide.md](user-guide.md)
3. **提交 Issue**: [GitHub Issues](https://github.com/yourusername/claudecode-pilot/issues)
4. **查看示例项目**: `examples/sample-project/`

---

## 📝 预防措施

为避免将来出现类似问题：

1. **定期更新**: 保持 claudecode-gpt 为最新版本
2. **备份配置**: 定期备份 `.claude/` 目录
3. **文档完整**: 确保所有必要的文档都存在
4. **测试命令**: 在重要操作前先测试命令

---

**修复完成后，你应该能够正常使用所有 regenerate 命令了！** 🎉

