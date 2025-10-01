# 系统架构设计文档 - Pomodoro Timer

> **生成时间**: 2025-10-01  
> **生成者**: Architect Agent  
> **项目**: Pomodoro Timer（番茄钟应用）

---

## 🏗️ 架构概述

### 架构风格
**单页应用（SPA）** - 基于 React 的客户端渲染应用

### 设计原则
1. **组件化**: 功能模块化，组件可复用
2. **关注点分离**: UI 与业务逻辑分离
3. **测试驱动**: 高测试覆盖率，确保代码质量
4. **性能优先**: 优化渲染性能，提升用户体验

---

## 🛠️ 技术栈选择

### 方案选择: 快速开发方案

#### 前端框架
- **React 18.2+**: 成熟的 UI 库，生态丰富
- **TypeScript 5.0+**: 类型安全，提高代码质量
- **Vite 4.0+**: 快速的开发服务器和构建工具

#### 状态管理
- **React Hooks**: 使用内置 Hooks（useState, useEffect, useContext）
- **自定义 Hooks**: 封装业务逻辑

#### 样式方案
- **CSS Modules**: 样式隔离，避免命名冲突
- **原生 CSS**: 简单直接，无需额外依赖

#### 测试工具
- **Vitest**: 快速的单元测试框架
- **React Testing Library**: React 组件测试
- **@testing-library/user-event**: 用户交互模拟

#### 代码质量
- **ESLint**: 代码检查
- **Prettier**: 代码格式化
- **TypeScript**: 类型检查

---

## 📐 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    React App                          │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │              App Component                      │  │  │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐     │  │  │
│  │  │  │  Timer   │  │TaskList  │  │Statistics│     │  │  │
│  │  │  │Component │  │Component │  │Component │     │  │  │
│  │  │  └────┬─────┘  └────┬─────┘  └────┬─────┘     │  │  │
│  │  │       │             │              │           │  │  │
│  │  │  ┌────▼─────────────▼──────────────▼─────┐    │  │  │
│  │  │  │         Custom Hooks Layer          │    │  │  │
│  │  │  │  - useTimer                         │    │  │  │
│  │  │  │  - useTasks                         │    │  │  │
│  │  │  │  - useStatistics                    │    │  │  │
│  │  │  │  - useNotification                  │    │  │  │
│  │  │  └────┬────────────────────────────────┘    │  │  │
│  │  │       │                                      │  │  │
│  │  │  ┌────▼────────────────────────────────┐    │  │  │
│  │  │  │         Utils Layer                 │    │  │  │
│  │  │  │  - storage.ts (localStorage)        │    │  │  │
│  │  │  │  - audio.ts (音效管理)              │    │  │  │
│  │  │  └─────────────────────────────────────┘    │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │              localStorage                         │  │
│  │  - tasks: Task[]                                  │  │
│  │  - statistics: Statistics                         │  │
│  │  - settings: Settings                             │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 组件设计

### 1. App Component（根组件）
**职责**: 应用入口，管理全局状态和布局

**状态**:
- 当前计时模式（工作/短休息/长休息）
- 应用设置（音效开关、通知开关）

**子组件**:
- Timer
- TaskList
- Statistics

### 2. Timer Component（计时器组件）
**职责**: 显示计时器，控制计时

**Props**:
```typescript
interface TimerProps {
  mode: 'work' | 'shortBreak' | 'longBreak';
  onComplete: () => void;
}
```

**使用的 Hooks**:
- useTimer
- useNotification

### 3. TaskList Component（任务列表组件）
**职责**: 显示和管理任务列表

**Props**:
```typescript
interface TaskListProps {
  onTaskComplete: (taskId: string) => void;
}
```

**使用的 Hooks**:
- useTasks

**子组件**:
- TaskItem

### 4. Statistics Component（统计组件）
**职责**: 显示统计数据

**Props**:
```typescript
interface StatisticsProps {
  // 无 props，从 Hook 获取数据
}
```

**使用的 Hooks**:
- useStatistics

---

## 🎣 自定义 Hooks 设计

### 1. useTimer
**职责**: 管理计时器逻辑

**接口**:
```typescript
interface UseTimerReturn {
  time: number;              // 剩余时间（秒）
  isRunning: boolean;        // 是否正在运行
  start: () => void;         // 开始计时
  pause: () => void;         // 暂停计时
  reset: () => void;         // 重置计时
}

function useTimer(
  initialTime: number,
  onComplete?: () => void
): UseTimerReturn;
```

### 2. useTasks
**职责**: 管理任务列表

**接口**:
```typescript
interface Task {
  id: string;
  title: string;
  completed: boolean;
  pomodoroCount: number;
  createdAt: string;
}

interface UseTasksReturn {
  tasks: Task[];
  addTask: (title: string) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  incrementPomodoro: (id: string) => void;
}

function useTasks(): UseTasksReturn;
```

### 3. useStatistics
**职责**: 管理统计数据

**接口**:
```typescript
interface Statistics {
  todayPomodoros: number;
  todayWorkTime: number;      // 分钟
  completedTasks: number;
  totalTasks: number;
}

interface UseStatisticsReturn {
  statistics: Statistics;
  incrementPomodoro: () => void;
  addWorkTime: (minutes: number) => void;
}

function useStatistics(): UseStatisticsReturn;
```

### 4. useNotification
**职责**: 管理通知和音效

**接口**:
```typescript
interface UseNotificationReturn {
  playSound: () => void;
  showNotification: (title: string, body: string) => void;
  requestPermission: () => Promise<boolean>;
}

function useNotification(): UseNotificationReturn;
```

---

## 💾 数据模型

### Task（任务）
```typescript
interface Task {
  id: string;                 // UUID
  title: string;              // 任务标题
  completed: boolean;         // 是否完成
  pomodoroCount: number;      // 完成的番茄钟数量
  estimatedPomodoros?: number; // 预计番茄钟数量
  createdAt: string;          // 创建时间（ISO 8601）
  completedAt?: string;       // 完成时间（ISO 8601）
}
```

### Statistics（统计）
```typescript
interface Statistics {
  date: string;               // 日期（YYYY-MM-DD）
  pomodoroCount: number;      // 完成的番茄钟数量
  workTime: number;           // 工作时长（分钟）
  completedTasks: number;     // 完成的任务数量
}

interface DailyStatistics {
  [date: string]: Statistics;
}
```

### Settings（设置）
```typescript
interface Settings {
  soundEnabled: boolean;      // 音效开关
  notificationEnabled: boolean; // 通知开关
  workDuration: number;       // 工作时长（分钟）
  shortBreakDuration: number; // 短休息时长（分钟）
  longBreakDuration: number;  // 长休息时长（分钟）
}
```

---

## 🗂️ 目录结构

```
pomodoro-timer/
├── public/
│   ├── sounds/
│   │   └── complete.mp3        # 完成音效
│   └── favicon.ico
├── src/
│   ├── components/             # UI 组件
│   │   ├── Timer.tsx
│   │   ├── Timer.module.css
│   │   ├── TaskList.tsx
│   │   ├── TaskList.module.css
│   │   ├── TaskItem.tsx
│   │   ├── Statistics.tsx
│   │   ├── Statistics.module.css
│   │   ├── ErrorBoundary.tsx
│   │   └── ErrorBoundary.module.css
│   ├── hooks/                  # 自定义 Hooks
│   │   ├── useTimer.ts
│   │   ├── useTasks.ts
│   │   ├── useStatistics.ts
│   │   └── useNotification.ts
│   ├── types/                  # TypeScript 类型定义
│   │   ├── task.ts
│   │   ├── statistics.ts
│   │   └── settings.ts
│   ├── utils/                  # 工具函数
│   │   ├── storage.ts
│   │   └── audio.ts
│   ├── App.tsx                 # 根组件
│   ├── App.module.css
│   ├── main.tsx                # 入口文件
│   └── vite-env.d.ts
├── tests/
│   └── unit/                   # 单元测试
│       ├── useTimer.test.ts
│       ├── useTasks.test.ts
│       ├── useStatistics.test.ts
│       ├── Timer.test.tsx
│       ├── TaskList.test.tsx
│       ├── Statistics.test.tsx
│       └── storage.test.ts
├── .eslintrc.json              # ESLint 配置
├── .prettierrc                 # Prettier 配置
├── tsconfig.json               # TypeScript 配置
├── vite.config.ts              # Vite 配置
├── package.json
└── README.md
```

---

## 🔄 数据流

### 1. 计时器流程
```
用户点击"开始" 
  → Timer 组件调用 useTimer.start()
  → useTimer 启动 setInterval
  → 每秒更新 time 状态
  → Timer 组件重新渲染显示新时间
  → 时间到达 0
  → 调用 onComplete 回调
  → useNotification.playSound()
  → useNotification.showNotification()
  → useStatistics.incrementPomodoro()
```

### 2. 任务管理流程
```
用户添加任务
  → TaskList 组件调用 useTasks.addTask()
  → useTasks 更新 tasks 状态
  → useTasks 调用 storage.saveTasks()
  → localStorage 保存数据
  → TaskList 组件重新渲染显示新任务
```

### 3. 数据持久化流程
```
应用启动
  → useTasks 调用 storage.loadTasks()
  → 从 localStorage 读取数据
  → 初始化 tasks 状态

数据变更
  → Hook 更新状态
  → useEffect 监听状态变化
  → 调用 storage.save*()
  → 写入 localStorage
```

---

## 🔒 安全考虑

### 数据安全
- 所有数据存储在本地，不上传到服务器
- 不收集用户个人信息
- localStorage 数据仅限当前域名访问

### XSS 防护
- React 自动转义用户输入
- 不使用 dangerouslySetInnerHTML

---

## 📈 性能优化

### 1. 组件优化
- 使用 React.memo 避免不必要的重新渲染
- 使用 useCallback 缓存回调函数
- 使用 useMemo 缓存计算结果

### 2. 代码分割
- 按需加载组件（如果需要）
- 使用 Vite 的代码分割功能

### 3. 资源优化
- 压缩图片和音频文件
- 使用 Vite 的构建优化

---

## 🧪 测试策略

### 单元测试
- 所有 Hooks 100% 覆盖
- 所有组件 > 80% 覆盖
- 所有工具函数 100% 覆盖

### 集成测试
- 用户完整流程测试
- 数据持久化测试

### E2E 测试（可选）
- 关键用户路径测试

---

## 📝 开发规范

### 命名规范
- 组件: PascalCase（如 Timer.tsx）
- Hooks: camelCase，以 use 开头（如 useTimer.ts）
- 工具函数: camelCase（如 storage.ts）
- 类型: PascalCase（如 Task, Statistics）

### 代码风格
- 使用 ESLint 和 Prettier
- 遵循 Airbnb React 风格指南
- 使用 TypeScript 严格模式

### Git 提交规范
- 使用 Conventional Commits
- 格式: `type(scope): message`
- 类型: feat, fix, docs, style, refactor, test, chore

---

**文档版本**: 1.0  
**最后更新**: 2025-10-01  
**审核状态**: 已批准

