# 文档重新生成功能实施计划

> **基于**: 文档重新生成研究报告 v1.0  
> **方案**: 版本化文档 + 重新生成命令  
> **预计工期**: 10-14 天  
> **优先级**: 高

---

## 🎯 项目目标

为 Claude Code GPT-Pilot 添加文档重新生成和变更管理功能，解决以下问题：

1. ✅ 支持需求、架构、任务文档的重新生成
2. ✅ 保留用户手动修改的内容
3. ✅ 智能检测文档间的依赖关系
4. ✅ 提供清晰的变更历史和审计日志
5. ✅ 支持增量更新和全量重新生成

---

## 📋 功能清单

### 核心功能

- [ ] 文档元数据管理
- [ ] 版本号自动递增
- [ ] 变更检测机制
- [ ] 文档备份和恢复
- [ ] 智能合并算法
- [ ] 冲突标记和解决
- [ ] 依赖关系管理
- [ ] 级联更新检测

### 新增命令

- [ ] `/regenerate-requirements` - 重新生成需求文档
- [ ] `/regenerate-architecture` - 重新生成架构文档
- [ ] `/regenerate-tasks` - 重新生成任务文档
- [ ] `/regenerate-all` - 智能重新生成所有文档
- [ ] `/doc-status` - 查看文档状态和依赖关系
- [ ] `/doc-diff` - 查看文档变更
- [ ] `/doc-rollback` - 回滚到历史版本

### 工具和脚本

- [ ] `.claude/tools/doc-manager.js` - 文档管理工具
- [ ] `.claude/tools/doc-merger.js` - 文档合并工具
- [ ] `.claude/tools/doc-validator.js` - 文档验证工具

---

## 🏗️ 技术架构

### 文件结构

```
.claude/
├── tools/
│   ├── doc-manager.js          # 文档管理核心
│   ├── doc-merger.js           # 智能合并引擎
│   ├── doc-validator.js        # 文档验证工具
│   └── task.js                 # 任务管理（已存在）
├── backups/                    # 文档备份目录
│   ├── product_requirements/
│   │   ├── v1.0_2025-10-01.md
│   │   └── v1.1_2025-10-02.md
│   ├── architecture/
│   └── tasks/
├── changes/                    # 变更日志目录
│   ├── requirements-2025-10-01.md
│   ├── architecture-2025-10-02.md
│   └── tasks-2025-10-03.md
└── commands/                   # 斜杠命令（已存在）
    ├── regenerate-requirements.md
    ├── regenerate-architecture.md
    ├── regenerate-tasks.md
    └── regenerate-all.md

docs/
├── product_requirements.md     # 带元数据
├── architecture.md             # 带元数据
└── tasks.md                    # 带元数据
```

### 文档元数据格式

```markdown
---
version: 1.2
generated_by: product-owner
generated_at: 2025-10-01T10:00:00Z
last_modified: 2025-10-01T15:30:00Z
modified_by: human
manual_sections:
  - lines: [45, 60]
    description: "自定义数据库优化配置"
  - lines: [120, 135]
    description: "额外的安全措施"
dependencies:
  - none
triggers_regeneration:
  - architecture.md
  - tasks.md
checksum: a1b2c3d4e5f6...
---

# 产品需求文档
...
```

---

## 📅 实施时间表

### 第1周: 基础设施和核心功能

#### Day 1-2: 文档元数据系统

**任务**:
1. 设计文档元数据格式规范
2. 创建 `doc-manager.js` 基础框架
3. 实现元数据解析和写入功能
4. 更新 Product Owner 模板，添加元数据生成

**交付物**:
- [ ] 文档元数据规范文档
- [ ] `doc-manager.js` (v0.1)
- [ ] 更新后的 `product-owner.md.template`
- [ ] 单元测试

**验收标准**:
```bash
# 测试元数据解析
node .claude/tools/doc-manager.js parse docs/product_requirements.md

# 输出:
{
  "version": "1.0",
  "generated_by": "product-owner",
  "generated_at": "2025-10-01T10:00:00Z",
  "dependencies": []
}
```

#### Day 3-4: 变更检测和备份

**任务**:
1. 实现文档变更检测算法
2. 实现自动备份机制
3. 实现版本号自动递增
4. 创建备份目录结构

**交付物**:
- [ ] 变更检测功能
- [ ] 自动备份功能
- [ ] 版本管理功能
- [ ] 单元测试

**验收标准**:
```bash
# 检测文档变更
node .claude/tools/doc-manager.js detect-changes docs/product_requirements.md

# 输出:
{
  "hasManualChanges": true,
  "lastModified": "2025-10-01T15:30:00Z",
  "modifiedSections": [
    { "lines": [45, 60], "description": "手动添加的配置" }
  ]
}

# 备份文档
node .claude/tools/doc-manager.js backup docs/product_requirements.md

# 输出:
✅ 已备份到: .claude/backups/product_requirements/v1.0_2025-10-01.md
```

#### Day 5: 重新生成命令 - Requirements

**任务**:
1. 创建 `/regenerate-requirements` 命令模板
2. 实现需求文档重新生成逻辑
3. 集成变更检测和备份
4. 添加用户确认提示

**交付物**:
- [ ] `regenerate-requirements.md` 命令模板
- [ ] 重新生成逻辑
- [ ] 用户交互界面
- [ ] 测试用例

**验收标准**:
```bash
# 用户修改需求文档后
/regenerate-requirements

# 输出:
⚠️  检测到手动修改:
   - 第 45-60 行: 自定义配置
   
是否继续重新生成? [y/n]: y

✅ 已备份当前版本: v1.0
✅ 正在重新生成...
✅ 需求文档已更新: v1.0 → v1.1
```

---

### 第2周: 智能合并和依赖管理

#### Day 6-7: 智能合并引擎

**任务**:
1. 创建 `doc-merger.js` 工具
2. 实现文档区块识别算法
3. 实现手动修改提取功能
4. 实现智能合并算法
5. 实现冲突标记功能

**交付物**:
- [ ] `doc-merger.js` 工具
- [ ] 区块识别算法
- [ ] 合并算法
- [ ] 冲突标记功能
- [ ] 单元测试

**验收标准**:
```bash
# 合并文档
node .claude/tools/doc-merger.js merge \
  --old docs/architecture.md.backup \
  --new docs/architecture.md.generated \
  --manual-sections "45-60,120-135"

# 输出:
✅ 已保留 2 处手动修改
✅ 已更新 5 个章节
⚠️  发现 1 处冲突:
   - 第 78 行: 技术栈选择冲突
   
已标记冲突，请手动解决。
```

#### Day 8-9: 架构和任务重新生成

**任务**:
1. 创建 `/regenerate-architecture` 命令
2. 创建 `/regenerate-tasks` 命令
3. 实现依赖关系检测
4. 实现级联更新提示
5. 更新 Architect 和 Tech Lead 模板

**交付物**:
- [ ] `regenerate-architecture.md` 命令模板
- [ ] `regenerate-tasks.md` 命令模板
- [ ] 依赖检测功能
- [ ] 级联更新逻辑
- [ ] 更新后的 Agent 模板

**验收标准**:
```bash
# 重新生成架构
/regenerate-architecture --from-requirements

# 输出:
🔍 检测到需求文档已更新 (v1.0 → v1.2)
📄 当前架构版本: 1.0

⚠️  此操作将触发以下文档更新:
   - architecture.md (v1.0 → v2.0)
   - tasks.md (需要重新生成)
   
是否继续? [y/n]: y

✅ 架构文档已更新
🚀 建议运行: /regenerate-tasks
```

#### Day 10: 全量重新生成和依赖管理

**任务**:
1. 创建 `/regenerate-all` 命令
2. 实现依赖关系图
3. 实现智能更新顺序
4. 创建 `/doc-status` 命令
5. 创建文档验证工具

**交付物**:
- [ ] `regenerate-all.md` 命令模板
- [ ] 依赖关系图生成
- [ ] `doc-status.md` 命令模板
- [ ] `doc-validator.js` 工具
- [ ] 测试用例

**验收标准**:
```bash
# 查看文档状态
/doc-status

# 输出:
📊 文档状态概览:

📄 product_requirements.md
   版本: v1.2
   最后修改: 2025-10-01 15:30 (human)
   依赖: 无
   触发更新: architecture.md, tasks.md
   状态: ⚠️  下游文档需要更新

📄 architecture.md
   版本: v1.0
   最后修改: 2025-10-01 10:00 (architect)
   依赖: product_requirements.md
   触发更新: tasks.md
   状态: ⚠️  需要重新生成 (依赖已更新)

📄 tasks.md
   版本: v1.0
   最后修改: 2025-10-01 10:30 (tech-lead)
   依赖: product_requirements.md, architecture.md
   状态: ⚠️  需要重新生成 (依赖已更新)

🔄 建议操作:
   1. /regenerate-architecture
   2. /regenerate-tasks
   或运行: /regenerate-all
```

---

### 第3周: 优化和文档

#### Day 11-12: 功能完善和优化

**任务**:
1. 添加 `/doc-diff` 命令
2. 添加 `/doc-rollback` 命令
3. 性能优化
4. 错误处理完善
5. 添加日志记录

**交付物**:
- [ ] `doc-diff.md` 命令模板
- [ ] `doc-rollback.md` 命令模板
- [ ] 性能优化报告
- [ ] 错误处理文档
- [ ] 日志系统

**验收标准**:
```bash
# 查看文档变更
/doc-diff product_requirements.md v1.0 v1.2

# 输出:
📊 版本对比: v1.0 → v1.2

新增内容:
+ 第 45-60 行: 移动端支持需求
+ 第 120-135 行: 离线功能需求

修改内容:
~ 第 78 行: 用户数量从 1000 → 10000

删除内容:
- 第 200-210 行: 已废弃的功能

# 回滚文档
/doc-rollback architecture.md v1.0

# 输出:
⚠️  警告: 此操作将回滚到 v1.0 (2025-10-01 10:00)
   当前版本 v2.0 的所有修改将丢失
   
是否继续? [y/n]: y

✅ 已回滚到 v1.0
✅ 已备份 v2.0 到: .claude/backups/architecture/v2.0_rollback.md
```

#### Day 13-14: 文档和教程

**任务**:
1. 编写用户使用指南
2. 编写开发者文档
3. 创建示例项目
4. 录制演示视频（可选）
5. 更新 README.md

**交付物**:
- [ ] 用户使用指南
- [ ] 开发者文档
- [ ] API 参考文档
- [ ] 示例项目
- [ ] 演示视频（可选）
- [ ] 更新后的 README.md

---

## ✅ 验收标准

### 功能验收

- [ ] 所有新命令正常工作
- [ ] 文档元数据正确生成和解析
- [ ] 变更检测准确无误
- [ ] 备份和恢复功能正常
- [ ] 智能合并保留手动修改
- [ ] 依赖关系正确检测
- [ ] 级联更新提示准确

### 性能验收

- [ ] 大文档（>1000行）处理时间 < 5秒
- [ ] 变更检测时间 < 1秒
- [ ] 备份操作时间 < 2秒
- [ ] 合并操作时间 < 3秒

### 质量验收

- [ ] 单元测试覆盖率 > 80%
- [ ] 集成测试通过
- [ ] 无已知 Bug
- [ ] 代码符合规范
- [ ] 文档完整清晰

---

## 🚀 发布计划

### Beta 版本 (v2.0-beta)

**发布时间**: Day 10  
**功能范围**:
- 核心重新生成命令
- 基础变更检测
- 简单备份恢复

**目标用户**: 内部测试

### 正式版本 (v2.0)

**发布时间**: Day 14  
**功能范围**:
- 完整功能集
- 智能合并
- 依赖管理
- 完整文档

**目标用户**: 所有用户

---

## 📝 风险和缓解措施

### 风险1: 智能合并算法复杂度高

**影响**: 可能导致开发延期  
**概率**: 中  
**缓解措施**:
- 先实现简单版本（基于行号）
- 后续迭代优化（基于语义）
- 提供手动合并选项

### 风险2: 用户学习成本

**影响**: 用户接受度低  
**概率**: 中  
**缓解措施**:
- 提供详细文档和教程
- 设计直观的命令和提示
- 提供 `--dry-run` 预览模式

### 风险3: 向后兼容性问题

**影响**: 破坏现有项目  
**概率**: 低  
**缓解措施**:
- 保持现有命令不变
- 新功能作为可选增强
- 提供迁移工具和指南

---

## 📚 参考资料

- [文档重新生成研究报告](./document-regeneration-research.md)
- [分层任务结构使用指南](./hierarchical-tasks-guide.md)
- [Claude Code GPT-Pilot README](../README.md)

---

**版本**: 1.0  
**创建日期**: 2025-10-01  
**作者**: Claude Planning Agent  
**状态**: 待审核

