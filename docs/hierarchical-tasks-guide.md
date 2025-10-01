# 分层任务结构使用指南

> Claude Code GPT-Pilot v2.0 新功能

## 📋 概述

从 v2.0 开始，Claude Code GPT-Pilot 支持两种任务文件结构：

- **扁平结构**: 适用于小型项目（< 50 个任务）
- **分层结构**: 适用于大型项目（>= 50 个任务）

系统会根据任务数量**自动选择**最合适的结构。

---

## 🎯 为什么需要分层结构？

### 问题

在大型项目中（例如 85+ 个任务），使用单个 `task_status.json` 文件会导致：

1. **性能问题**: 文件过大，读写缓慢
2. **生成困难**: Claude 生成大型 JSON 时容易卡住或超时
3. **维护困难**: 难以查找和修改特定任务
4. **版本控制**: Git diff 不清晰，容易产生合并冲突
5. **并行开发**: 多人同时修改同一文件容易冲突

### 解决方案

分层结构将任务按功能模块分组存储：

```
.claude/
├── tasks/
│   ├── infrastructure.json    # 基础设施任务组
│   ├── frontend.json           # 前端任务组
│   ├── backend.json            # 后端任务组
│   ├── testing.json            # 测试任务组
│   └── documentation.json      # 文档任务组
└── task_status.json            # 主索引文件
```

**优势**:
- ✅ 文件小，读写快
- ✅ 易于生成和维护
- ✅ Git diff 清晰
- ✅ 支持并行开发
- ✅ 模块化管理

---

## 📁 文件结构详解

### 扁平结构（< 50 任务）

**文件**: `task_status.json`

```json
{
  "project": "SmallProject",
  "total_tasks": 10,
  "tasks": [
    {
      "id": "T001",
      "title": "任务1",
      "status": "pending",
      "dependencies": []
    }
  ]
}
```

### 分层结构（>= 50 任务）

**主索引文件**: `task_status.json`

```json
{
  "project": "LargeProject",
  "total_tasks": 85,
  "task_groups": [
    {
      "id": "infrastructure",
      "name": "基础设施",
      "file": ".claude/tasks/infrastructure.json",
      "task_count": 15,
      "status": "not_started",
      "priority": "高"
    },
    {
      "id": "frontend",
      "name": "前端开发",
      "file": ".claude/tasks/frontend.json",
      "task_count": 30,
      "status": "in_progress",
      "priority": "高"
    }
  ]
}
```

**任务组文件**: `.claude/tasks/infrastructure.json`

```json
{
  "group_id": "infrastructure",
  "group_name": "基础设施",
  "tasks": [
    {
      "id": "T001",
      "group_id": "infrastructure",
      "title": "项目初始化",
      "description": "创建项目结构，配置开发环境",
      "status": "completed",
      "priority": "高",
      "estimated_hours": 2,
      "dependencies": [],
      "acceptance_criteria": [
        "项目可以启动",
        "依赖安装完成"
      ]
    },
    {
      "id": "T002",
      "group_id": "infrastructure",
      "title": "配置数据库",
      "status": "in_progress",
      "dependencies": ["T001"]
    }
  ],
  "updated_at": "2025-10-01T00:00:00.000Z"
}
```

---

## 🔧 使用方法

### 1. Tech Lead 生成任务

当 Tech Lead Agent 分解任务时，会自动判断：

```
任务数量 < 50  → 使用扁平结构
任务数量 >= 50 → 使用分层结构
```

**Tech Lead 会自动**:
1. 创建 `.claude/tasks/` 目录（如需要）
2. 生成主索引文件 `task_status.json`
3. 生成各个任务组文件（如使用分层结构）

### 2. Developer 读取任务

Developer Agent 使用 `task.js` 工具读取任务，**无需关心**使用的是哪种结构：

```bash
# 获取下一个可执行任务
node .claude/tools/task.js next

# 查看所有任务
node .claude/tools/task.js list

# 查看项目统计
node .claude/tools/task.js stats

# 更新任务状态
node .claude/tools/task.js update T001 completed
```

`task.js` 会**自动检测**结构类型并正确读取。

### 3. 手动创建分层结构

如果需要手动创建分层结构：

**步骤1**: 创建目录

```bash
mkdir -p .claude/tasks
```

**步骤2**: 创建主索引文件

```bash
cat > task_status.json << 'EOF'
{
  "project": "MyProject",
  "total_tasks": 85,
  "task_groups": [
    {
      "id": "infrastructure",
      "name": "基础设施",
      "file": ".claude/tasks/infrastructure.json",
      "task_count": 15,
      "status": "not_started"
    }
  ]
}
EOF
```

**步骤3**: 创建任务组文件

```bash
cat > .claude/tasks/infrastructure.json << 'EOF'
{
  "group_id": "infrastructure",
  "group_name": "基础设施",
  "tasks": [
    {
      "id": "T001",
      "group_id": "infrastructure",
      "title": "项目初始化",
      "status": "pending",
      "dependencies": []
    }
  ]
}
EOF
```

---

## 📊 任务组划分建议

### 推荐的任务组

| 组ID | 名称 | 说明 | 优先级 |
|------|------|------|--------|
| `infrastructure` | 基础设施 | 项目配置、工具设置、CI/CD | 高 |
| `frontend` | 前端开发 | UI组件、页面、样式 | 高 |
| `backend` | 后端开发 | API、服务、数据库 | 高 |
| `testing` | 测试 | 单元测试、集成测试、E2E | 中 |
| `documentation` | 文档 | API文档、用户指南 | 低 |

### 自定义任务组

根据项目特点，可以创建自定义任务组：

- `mobile`: 移动端开发
- `desktop`: 桌面应用
- `deployment`: 部署相关
- `security`: 安全加固
- `performance`: 性能优化
- `migration`: 数据迁移

---

## 🔍 task.js v2.0 API

### 结构检测

```javascript
const { isHierarchical } = require('./.claude/tools/task.js');

if (isHierarchical()) {
  console.log('使用分层结构');
} else {
  console.log('使用扁平结构');
}
```

### 加载任务

```javascript
const { loadTaskStatus } = require('./.claude/tools/task.js');

// 自动检测结构并加载
const taskStatus = loadTaskStatus();
console.log(`总任务数: ${taskStatus.total_tasks}`);
console.log(`任务列表: ${taskStatus.tasks.length}`);
```

### 加载任务组

```javascript
const { loadTaskGroup } = require('./.claude/tools/task.js');

// 加载特定任务组
const group = loadTaskGroup('infrastructure');
console.log(`任务组: ${group.group_name}`);
console.log(`任务数: ${group.tasks.length}`);
```

### 更新任务

```javascript
const { updateTaskStatus } = require('./.claude/tools/task.js');

// 更新任务状态（自动保存到正确的文件）
updateTaskStatus('T001', 'completed');
```

---

## ✅ 最佳实践

### 1. 任务组大小

- 每个任务组建议 **10-30 个任务**
- 避免单个任务组过大（> 50 个任务）
- 避免任务组过多（> 10 个组）

### 2. 任务ID命名

使用统一的命名规则：

```
T001-T015: infrastructure
T016-T045: frontend
T046-T070: backend
T071-T080: testing
T081-T085: documentation
```

### 3. 依赖管理

跨任务组的依赖也能正常工作：

```json
{
  "id": "T016",
  "group_id": "frontend",
  "dependencies": ["T001", "T002"]  // 依赖 infrastructure 组的任务
}
```

### 4. 状态同步

任务组状态会自动计算：

- `not_started`: 所有任务都是 pending
- `in_progress`: 至少一个任务 in_progress 或 completed
- `completed`: 所有任务都是 completed

---

## 🔄 迁移指南

### 从扁平结构迁移到分层结构

如果项目任务增长到 50+ 个，可以手动迁移：

**步骤1**: 备份现有文件

```bash
cp task_status.json task_status.json.backup
```

**步骤2**: 创建任务组

按功能将任务分组，创建对应的任务组文件。

**步骤3**: 更新主索引

修改 `task_status.json` 为分层格式。

**步骤4**: 测试

```bash
node .claude/tools/task.js stats
node .claude/tools/task.js list
```

---

## 🐛 故障排除

### 问题1: 命令找不到任务

**原因**: 任务组文件路径错误

**解决**: 检查 `task_status.json` 中的 `file` 路径是否正确

### 问题2: 任务状态不更新

**原因**: 任务组文件权限问题

**解决**: 确保 `.claude/tasks/` 目录有写权限

### 问题3: 依赖检查失败

**原因**: 跨任务组依赖的任务ID不存在

**解决**: 确保所有依赖的任务ID在某个任务组中存在

---

## 📚 相关文档

- [task.js API 文档](../README.md#task-management)
- [Tech Lead Agent 指南](../examples/tech-lead.md.template)
- [Developer Agent 指南](../examples/developer.md.template)

---

**版本**: v2.0  
**更新时间**: 2025-10-01  
**作者**: Claude Code GPT-Pilot Team

