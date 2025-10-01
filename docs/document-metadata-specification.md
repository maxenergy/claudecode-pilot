# 文档元数据规范

> **版本**: 1.0  
> **创建日期**: 2025-10-01  
> **适用于**: Claude Code GPT-Pilot v2.0+

---

## 📋 概述

本规范定义了 Claude Code GPT-Pilot 系统中所有文档的元数据格式和管理规则。

### 目的

- 统一文档版本管理
- 追踪文档变更历史
- 管理文档依赖关系
- 支持智能重新生成
- 保留手动修改内容

---

## 📝 元数据格式

### 基本结构

所有文档必须在文件开头包含 YAML frontmatter 格式的元数据：

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
  - product_requirements.md
triggers_regeneration:
  - architecture.md
  - tasks.md
checksum: a1b2c3d4e5f6g7h8
---

# 文档标题

文档内容...
```

---

## 🔑 字段说明

### 必需字段

#### version
- **类型**: String
- **格式**: `major.minor.patch` (语义化版本)
- **说明**: 文档版本号
- **示例**: `"1.2.3"`
- **规则**:
  - 初始版本为 `1.0`
  - 重大变更递增主版本号
  - 功能性变更递增次版本号
  - 小修改递增修订号

#### generated_by
- **类型**: String
- **说明**: 生成此文档的 Agent 名称
- **可选值**:
  - `product-owner` - 产品负责人
  - `architect` - 架构师
  - `tech-lead` - 技术负责人
  - `developer` - 开发工程师
  - `tester` - 测试工程师
  - `reviewer` - 代码审查员
  - `debugger` - 调试专家
  - `human` - 人工创建
- **示例**: `"product-owner"`

#### generated_at
- **类型**: String (ISO 8601)
- **说明**: 文档首次生成时间
- **格式**: `YYYY-MM-DDTHH:mm:ss.sssZ`
- **示例**: `"2025-10-01T10:00:00.000Z"`
- **规则**: 一旦设置，不应修改

#### last_modified
- **类型**: String (ISO 8601)
- **说明**: 文档最后修改时间
- **格式**: `YYYY-MM-DDTHH:mm:ss.sssZ`
- **示例**: `"2025-10-01T15:30:00.000Z"`
- **规则**: 每次修改时自动更新

#### modified_by
- **类型**: String
- **说明**: 最后修改者
- **可选值**:
  - `agent` - 由 Agent 修改
  - `human` - 由人工修改
  - Agent 名称 (如 `product-owner`)
- **示例**: `"human"`
- **规则**: 
  - Agent 生成时设置为 Agent 名称
  - 人工修改后应更新为 `human`

#### checksum
- **类型**: String
- **说明**: 文档内容的 SHA-256 校验和（前16位）
- **格式**: 16位十六进制字符串
- **示例**: `"a1b2c3d4e5f6g7h8"`
- **用途**: 检测文档内容是否被修改

---

### 可选字段

#### manual_sections
- **类型**: Array of Objects
- **说明**: 手动修改的文档区域
- **结构**:
  ```yaml
  manual_sections:
    - lines: [45, 60]
      description: "自定义配置"
      added_at: "2025-10-01T15:30:00Z"
      added_by: "human"
  ```
- **字段说明**:
  - `lines`: 行号范围 `[起始行, 结束行]` (1-based, inclusive)
  - `description`: 修改内容描述
  - `added_at`: 添加时间 (可选)
  - `added_by`: 添加者 (可选)
- **用途**: 在重新生成时保留这些区域

#### dependencies
- **类型**: Array of Strings
- **说明**: 此文档依赖的其他文档
- **示例**:
  ```yaml
  dependencies:
    - product_requirements.md
    - architecture.md
  ```
- **规则**:
  - 使用相对于 `docs/` 目录的路径
  - 如果依赖文档更新，此文档可能需要重新生成

#### triggers_regeneration
- **类型**: Array of Strings
- **说明**: 此文档更新时应触发重新生成的文档
- **示例**:
  ```yaml
  triggers_regeneration:
    - architecture.md
    - tasks.md
  ```
- **规则**:
  - 使用相对于 `docs/` 目录的路径
  - 系统会提示用户是否重新生成这些文档

---

## 📚 文档类型默认配置

### product_requirements.md

```yaml
version: 1.0
generated_by: product-owner
dependencies: []
triggers_regeneration:
  - architecture.md
  - tasks.md
```

### architecture.md

```yaml
version: 1.0
generated_by: architect
dependencies:
  - product_requirements.md
triggers_regeneration:
  - tasks.md
```

### tasks.md

```yaml
version: 1.0
generated_by: tech-lead
dependencies:
  - product_requirements.md
  - architecture.md
triggers_regeneration: []
```

---

## 🔄 版本管理规则

### 版本号递增规则

| 变更类型 | 版本递增 | 示例 |
|---------|---------|------|
| **重大变更** | 主版本号 +1 | `1.2.3` → `2.0.0` |
| **功能性变更** | 次版本号 +1 | `1.2.3` → `1.3.0` |
| **小修改** | 修订号 +1 | `1.2.3` → `1.2.4` |

### 重大变更示例

- 完全重写文档
- 改变文档结构
- 删除主要章节
- 技术栈完全更换

### 功能性变更示例

- 添加新章节
- 添加新功能需求
- 添加新的架构组件
- 添加新任务

### 小修改示例

- 修正错别字
- 更新时间戳
- 调整格式
- 补充说明

---

## 🛠️ 工具使用

### 添加元数据

```bash
# 为文档添加元数据（如果缺失）
node .claude/tools/doc-manager.js add-metadata docs/product_requirements.md
```

### 解析元数据

```bash
# 查看文档元数据
node .claude/tools/doc-manager.js parse docs/architecture.md
```

### 更新元数据

```bash
# 更新单个字段
node .claude/tools/doc-manager.js update-metadata docs/tasks.md version 1.1
```

### 检测变更

```bash
# 检测文档是否有手动修改
node .claude/tools/doc-manager.js detect-changes docs/architecture.md
```

---

## ✅ 最佳实践

### 1. 初始化文档时添加元数据

所有 Agent 生成的文档都应包含完整的元数据。

### 2. 手动修改后更新 modified_by

```yaml
modified_by: human  # 手动修改后设置
```

### 3. 标记手动修改区域

使用 `manual_sections` 标记重要的手动修改：

```yaml
manual_sections:
  - lines: [45, 60]
    description: "自定义数据库优化配置"
```

或在文档中使用注释：

```markdown
<!-- MANUAL_SECTION_START: 自定义配置 -->
## 自定义配置

这是我手动添加的配置...

<!-- MANUAL_SECTION_END -->
```

### 4. 定期验证依赖关系

```bash
# 检查所有文档的依赖关系
node .claude/tools/doc-validator.js validate-dependencies
```

### 5. 重大变更前备份

```bash
# 创建备份
node .claude/tools/doc-manager.js backup docs/architecture.md
```

---

## 🔍 验证规则

### 元数据完整性检查

- [ ] 所有必需字段都存在
- [ ] 版本号格式正确
- [ ] 时间戳格式正确
- [ ] generated_by 值有效
- [ ] checksum 与内容匹配

### 依赖关系检查

- [ ] dependencies 中的文件都存在
- [ ] triggers_regeneration 中的文件都存在
- [ ] 没有循环依赖

### 版本号检查

- [ ] 版本号递增合理
- [ ] 主版本号变更有说明
- [ ] 版本历史连续

---

## 📖 示例

### 完整示例：product_requirements.md

```markdown
---
version: 1.2
generated_by: product-owner
generated_at: 2025-10-01T10:00:00.000Z
last_modified: 2025-10-01T15:30:00.000Z
modified_by: human
manual_sections:
  - lines: [120, 135]
    description: "添加移动端支持需求"
    added_at: "2025-10-01T15:30:00.000Z"
dependencies: []
triggers_regeneration:
  - architecture.md
  - tasks.md
checksum: a1b2c3d4e5f6g7h8
---

# 产品需求文档 - MyProject

> **生成时间**: 2025-10-01  
> **生成者**: Product Owner Agent  
> **项目**: MyProject

## 📋 项目概述

...
```

---

## 🔗 相关文档

- [文档重新生成研究报告](./document-regeneration-research.md)
- [文档重新生成实施计划](./document-regeneration-implementation-plan.md)
- [快速参考指南](./document-regeneration-quick-reference.md)

---

**版本**: 1.0  
**最后更新**: 2025-10-01  
**维护者**: Claude Code GPT-Pilot Team

