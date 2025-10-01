# 文档重新生成功能 - 快速参考

> **快速查找**: 常用命令和使用场景  
> **完整文档**: [研究报告](./document-regeneration-research.md) | [实施计划](./document-regeneration-implementation-plan.md)

---

## 🚀 快速开始

### 场景1: 需求变更后更新架构

```bash
# 1. 手动修改需求文档
vim docs/product_requirements.md

# 2. 重新生成架构文档
/regenerate-architecture --from-requirements

# 3. 重新生成任务分解
/regenerate-tasks --from-architecture
```

### 场景2: 架构调整后更新任务

```bash
# 1. 手动修改架构文档
vim docs/architecture.md

# 2. 重新生成任务分解
/regenerate-tasks --from-architecture
```

### 场景3: 任务依赖关系调整

```bash
# 1. 手动修改任务文件
vim task_status.json

# 2. 验证依赖关系
node .claude/tools/task.js validate

# 3. 如有问题，自动修复
node .claude/tools/task.js validate --fix
```

### 场景4: 查看文档状态

```bash
# 查看所有文档状态
/doc-status

# 查看特定文档的变更历史
/doc-diff product_requirements.md v1.0 v1.2

# 回滚到历史版本
/doc-rollback architecture.md v1.0
```

---

## 📋 命令速查表

| 命令 | 用途 | 示例 |
|------|------|------|
| `/regenerate-requirements` | 重新生成需求文档 | `/regenerate-requirements` |
| `/regenerate-architecture` | 重新生成架构文档 | `/regenerate-architecture --from-requirements` |
| `/regenerate-tasks` | 重新生成任务文档 | `/regenerate-tasks --from-architecture` |
| `/regenerate-all` | 智能重新生成所有文档 | `/regenerate-all --dry-run` |
| `/doc-status` | 查看文档状态 | `/doc-status` |
| `/doc-diff` | 查看文档变更 | `/doc-diff architecture.md v1.0 v2.0` |
| `/doc-rollback` | 回滚文档版本 | `/doc-rollback tasks.md v1.0` |

---

## 🔧 工具命令

### doc-manager.js

```bash
# 解析文档元数据
node .claude/tools/doc-manager.js parse docs/product_requirements.md

# 检测文档变更
node .claude/tools/doc-manager.js detect-changes docs/architecture.md

# 备份文档
node .claude/tools/doc-manager.js backup docs/tasks.md

# 列出所有备份
node .claude/tools/doc-manager.js list-backups docs/architecture.md
```

### doc-merger.js

```bash
# 合并文档（保留手动修改）
node .claude/tools/doc-merger.js merge \
  --old docs/architecture.md.backup \
  --new docs/architecture.md.generated \
  --manual-sections "45-60,120-135"

# 预览合并结果
node .claude/tools/doc-merger.js merge --dry-run \
  --old docs/architecture.md.backup \
  --new docs/architecture.md.generated
```

### doc-validator.js

```bash
# 验证文档格式
node .claude/tools/doc-validator.js validate docs/product_requirements.md

# 验证所有文档
node .claude/tools/doc-validator.js validate-all

# 验证依赖关系
node .claude/tools/doc-validator.js validate-dependencies
```

---

## 📊 文档元数据说明

### 元数据字段

```yaml
version: 1.2                    # 文档版本号
generated_by: product-owner     # 生成者 Agent
generated_at: 2025-10-01T10:00:00Z  # 生成时间
last_modified: 2025-10-01T15:30:00Z # 最后修改时间
modified_by: human              # 修改者（human/agent）
manual_sections:                # 手动修改的区域
  - lines: [45, 60]
    description: "自定义配置"
dependencies:                   # 依赖的文档
  - product_requirements.md
triggers_regeneration:          # 触发重新生成的文档
  - architecture.md
  - tasks.md
checksum: a1b2c3d4...          # 文档校验和
```

### 版本号规则

- **主版本号**: 重大变更（如完全重写）
- **次版本号**: 功能性变更（如添加新章节）
- **修订号**: 小修改（如修正错别字）

示例: `1.2.3` → `主.次.修订`

---

## 🎯 最佳实践

### 1. 定期备份

```bash
# 在重大修改前手动备份
node .claude/tools/doc-manager.js backup docs/architecture.md

# 查看备份列表
node .claude/tools/doc-manager.js list-backups docs/architecture.md
```

### 2. 使用 --dry-run 预览

```bash
# 预览重新生成结果，不实际修改文件
/regenerate-architecture --from-requirements --dry-run

# 预览合并结果
node .claude/tools/doc-merger.js merge --dry-run \
  --old docs/architecture.md.backup \
  --new docs/architecture.md.generated
```

### 3. 标记手动修改

在手动修改的区域添加注释：

```markdown
<!-- MANUAL_SECTION_START: 自定义数据库优化配置 -->
## 数据库优化

这是我手动添加的自定义配置...

<!-- MANUAL_SECTION_END -->
```

### 4. 定期验证依赖

```bash
# 每天运行一次依赖验证
node .claude/tools/doc-validator.js validate-dependencies

# 如有问题，查看详细报告
/doc-status
```

### 5. 使用 Git 管理文档

```bash
# 提交前检查文档状态
/doc-status

# 提交文档变更
git add docs/
git commit -m "docs: 更新需求文档 v1.0 → v1.2"

# 创建文档变更分支
git checkout -b docs/add-mobile-support
```

---

## ⚠️ 常见问题

### Q1: 重新生成会丢失我的手动修改吗？

**A**: 不会。系统会自动检测手动修改的区域并保留。如果有冲突，会标记出来让你手动解决。

### Q2: 如何知道哪些文档需要更新？

**A**: 运行 `/doc-status` 查看所有文档的状态。系统会自动检测依赖关系并提示需要更新的文档。

### Q3: 重新生成失败了怎么办？

**A**: 系统会自动备份原文档。你可以使用 `/doc-rollback` 回滚到之前的版本。

### Q4: 可以同时修改多个文档吗？

**A**: 可以，但建议按顺序修改：需求 → 架构 → 任务。这样可以避免依赖关系混乱。

### Q5: 如何查看文档的变更历史？

**A**: 使用 `/doc-diff` 命令查看两个版本之间的差异，或者查看 `.claude/changes/` 目录下的变更日志。

---

## 🔗 相关文档

- [完整研究报告](./document-regeneration-research.md) - 详细的方案设计和技术分析
- [实施计划](./document-regeneration-implementation-plan.md) - 开发时间表和任务分解
- [分层任务结构指南](./hierarchical-tasks-guide.md) - 任务管理最佳实践
- [Claude Code GPT-Pilot README](../README.md) - 系统总体介绍

---

## 📞 获取帮助

### 查看命令帮助

```bash
# 查看命令详细说明
/regenerate-architecture --help

# 查看工具使用说明
node .claude/tools/doc-manager.js --help
```

### 报告问题

如果遇到问题，请提供以下信息：

1. 运行的命令
2. 错误信息
3. 文档状态（`/doc-status` 的输出）
4. 相关文档的元数据

---

**版本**: 1.0  
**最后更新**: 2025-10-01  
**维护者**: Claude Code GPT-Pilot Team

