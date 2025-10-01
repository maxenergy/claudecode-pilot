# 示例项目 - 番茄钟应用

> 这是一个完整的示例项目，演示如何使用 Claude Code GPT-Pilot 系统进行软件开发。

## 📋 项目概述

**项目名称**: Pomodoro Timer（番茄钟应用）  
**项目类型**: Web 应用  
**技术栈**: React + TypeScript + Vite  
**开发方法**: TDD（测试驱动开发）

## 🎯 项目目标

开发一个简单的番茄钟应用，帮助用户管理时间和提高专注力。

### 核心功能

1. **计时器功能**
   - 25分钟工作时间
   - 5分钟短休息
   - 15分钟长休息

2. **任务管理**
   - 添加任务
   - 标记任务完成
   - 查看任务列表

3. **统计功能**
   - 完成的番茄钟数量
   - 今日工作时长
   - 任务完成率

## 📂 项目结构

```
sample-project/
├── README.md                    # 本文件
├── product_requirements.md      # 产品需求文档（Product Owner 生成）
├── architecture.md              # 架构设计文档（Architect 生成）
├── tasks.md                     # 任务分解文档（Tech Lead 生成）
├── task_status.json             # 任务状态跟踪文件
└── docs/
    ├── test_report_T001.md      # 测试报告示例
    ├── review_report_T001.md    # 代码审查报告示例
    └── debug_report_T001.md     # 调试报告示例
```

## 🚀 如何使用这个示例项目

### 1. 了解项目背景

首先阅读以下文档，了解项目的完整背景：

1. **product_requirements.md** - 了解产品需求和用户故事
2. **architecture.md** - 了解技术架构和设计决策
3. **tasks.md** - 了解任务分解和开发计划

### 2. 查看任务状态

使用 task.js 工具查看任务状态：

```bash
# 查看所有任务
node ../../.claude-pilot/tools/task.js list

# 查看下一个可执行任务
node ../../.claude-pilot/tools/task.js next

# 查看所有可执行任务
node ../../.claude-pilot/tools/task.js executable
```

### 3. 测试单任务模式

在 Claude Code 中执行：

```
/developer T001
```

这将启动单任务模式，逐步执行 TDD 5阶段流程。

### 4. 测试自动化模式

在 Claude Code 中执行：

```
/developer-auto T001
```

或者从任意任务开始：

```
/developer-auto T003
```

这将启动自动化模式，连续执行多个任务。

### 5. 测试其他 Agent

```
# 代码审查
/reviewer T001

# 测试编写
/tester T001

# 问题调试
/debugger "计时器无法暂停"
```

## 📊 任务列表概览

本示例项目包含 10 个任务，涵盖了完整的开发流程：

| 任务ID | 任务名称 | 优先级 | 预计时间 | 依赖 | 状态 |
|--------|---------|--------|---------|------|------|
| T001 | 搭建项目基础结构 | 高 | 2h | 无 | pending |
| T002 | 实现计时器核心逻辑 | 高 | 3h | T001 | pending |
| T003 | 实现计时器 UI 组件 | 高 | 2h | T002 | pending |
| T004 | 实现任务管理功能 | 中 | 2.5h | T001 | pending |
| T005 | 实现任务列表 UI | 中 | 2h | T004 | pending |
| T006 | 实现统计功能 | 中 | 2h | T002, T004 | pending |
| T007 | 实现统计页面 UI | 中 | 1.5h | T006 | pending |
| T008 | 实现数据持久化 | 低 | 2h | T004, T006 | pending |
| T009 | 添加音效和通知 | 低 | 1.5h | T003 | pending |
| T010 | 优化和性能调优 | 低 | 2h | T001-T009 | pending |

**总计**: 10 个任务，预计 20.5 小时

## 🎓 学习要点

通过这个示例项目，你可以学习到：

1. **Product Owner 工作流程**
   - 如何收集和整理需求
   - 如何编写用户故事
   - 如何定义验收标准

2. **Architect 工作流程**
   - 如何选择技术栈
   - 如何设计系统架构
   - 如何初始化项目

3. **Tech Lead 工作流程**
   - 如何分解任务
   - 如何定义依赖关系
   - 如何估算工时

4. **Developer 工作流程**
   - 如何使用 TDD 方法开发
   - 如何使用单任务模式
   - 如何使用自动化模式

5. **Tester 工作流程**
   - 如何设计测试用例
   - 如何编写测试代码
   - 如何生成测试报告

6. **Reviewer 工作流程**
   - 如何进行代码审查
   - 如何检查代码质量
   - 如何提供改进建议

7. **Debugger 工作流程**
   - 如何诊断问题
   - 如何使用调试工具
   - 如何编写调试报告

## 💡 最佳实践

1. **始终从 Product Owner 开始**
   - 确保需求清晰明确
   - 定义好验收标准

2. **架构设计要充分**
   - 选择合适的技术栈
   - 设计清晰的模块结构

3. **任务分解要合理**
   - 每个任务 1-3 小时
   - 明确任务依赖关系

4. **严格遵循 TDD**
   - 先写测试，再写实现
   - 保持高测试覆盖率

5. **及时代码审查**
   - 每个任务完成后审查
   - 及时发现和修复问题

6. **善用自动化模式**
   - 简单任务使用自动化
   - 复杂任务使用手动模式

## 🔧 故障排除

### 问题1: task.js 找不到

**解决方案**: 确保在项目根目录执行命令，或使用正确的相对路径。

### 问题2: 任务依赖检查失败

**解决方案**: 使用 `node task.js check T00X` 查看具体缺失的依赖。

### 问题3: 自动化模式中途停止

**解决方案**: 查看错误信息，修复问题后使用 `/developer-auto T00X` 继续执行。

## 📚 相关文档

- [Claude Code GPT-Pilot 主文档](../../README.md)
- [CLAUDE.md 命令参考](../../examples/CLAUDE.md.template)
- [Developer Agent 文档](../../examples/developer.md.template)
- [task.js 工具文档](../../.claude-pilot/tools/task.js)

## 📝 许可证

MIT License

---

**开始探索 Claude Code GPT-Pilot 吧！** 🚀

