# 故障排除指南

## 问题：初始化后看不到斜杠命令

### 症状

运行 `claudecode-gpt init` 后，在 Claude Code 中输入 `/pr` 时，没有看到 `/product-owner` 等命令出现在自动补全列表中。

### 原因

Claude Code 需要重新加载项目才能识别 `CLAUDE.md` 文件中定义的新命令。

### 解决方案

#### 方法1：重新加载窗口（推荐）

1. 在 Claude Code 中按 `Ctrl+Shift+P`（Mac: `Cmd+Shift+P`）
2. 输入 "Reload Window"
3. 选择 "Developer: Reload Window"
4. 等待窗口重新加载
5. 再次输入 `/pr`，应该能看到 `/product-owner` 命令

#### 方法2：重新打开项目

1. 关闭 Claude Code
2. 重新打开项目目录
3. 等待 Claude Code 完全加载
4. 输入 `/pr`，应该能看到命令

#### 方法3：手动触发命令

如果自动补全仍然不工作，可以直接输入完整命令：

```
/product-owner
```

然后按回车，Claude Code 应该能识别并执行。

### 验证

成功后，输入 `/` 应该能看到以下命令：

- `/product-owner` - 定义产品需求
- `/architect` - 设计系统架构
- `/tech-lead` - 分解任务
- `/developer` - 实现任务（手动模式）
- `/developer-auto` - 自动化批量执行
- `/tester` - 编写测试
- `/reviewer` - 代码审查
- `/debugger` - 调试问题
- `/next-task` - 查看下一个任务
- `/task-list` - 查看所有任务
- `/status` - 查看项目状态
- `/help` - 显示帮助

---

## 问题：CLAUDE.md 文件内容不完整

### 症状

打开 `CLAUDE.md` 文件，发现内容很少（只有几行）。

### 原因

可能是模板文件复制失败。

### 解决方案

#### 检查文件大小

```bash
wc -l CLAUDE.md
```

应该显示约 1200+ 行。如果少于 100 行，说明文件不完整。

#### 重新初始化

```bash
# 备份现有文件
mv CLAUDE.md CLAUDE.md.backup

# 重新运行 init（会重新生成 CLAUDE.md）
claudecode-gpt init --name "YourProjectName"
```

#### 手动复制模板

如果重新初始化不工作，可以手动复制：

```bash
# 找到 claudecode-gpt 的安装位置
npm root -g

# 复制模板文件
cp $(npm root -g)/claudecode-gpt/examples/CLAUDE.md.template ./CLAUDE.md

# 替换项目名称
sed -i 's/{{PROJECT_NAME}}/YourProjectName/g' CLAUDE.md
sed -i "s/{{DATE}}/$(date +%Y-%m-%d)/g" CLAUDE.md
```

---

## 问题：Agent 模板文件缺失

### 症状

`.claude-pilot/templates/` 目录为空或缺少某些 Agent 模板。

### 解决方案

#### 检查模板文件

```bash
ls -la .claude-pilot/templates/
```

应该看到 7 个文件：
- product-owner.md
- architect.md
- tech-lead.md
- developer.md
- tester.md
- reviewer.md
- debugger.md

#### 重新复制模板

```bash
# 找到安装位置
INSTALL_DIR=$(npm root -g)/claudecode-gpt

# 复制所有模板
cp $INSTALL_DIR/examples/*.md.template .claude-pilot/templates/

# 重命名（去掉 .template 后缀）
cd .claude-pilot/templates/
for f in *.template; do mv "$f" "${f%.template}"; done
```

---

## 问题：task.js 工具不工作

### 症状

运行 `node .claude-pilot/tools/task.js` 报错：`Cannot find module`

### 原因

task.js 文件没有被复制到项目中。

### 解决方案

#### 手动复制 task.js

```bash
# 找到安装位置
INSTALL_DIR=$(npm root -g)/claudecode-gpt

# 复制 task.js
cp $INSTALL_DIR/.claude-pilot/tools/task.js .claude-pilot/tools/
```

#### 验证

```bash
node .claude-pilot/tools/task.js help
```

应该显示帮助信息。

---

## 问题：命令执行后没有反应

### 症状

输入 `/product-owner` 后，Claude Code 没有任何响应。

### 可能原因

1. CLAUDE.md 文件格式错误
2. Claude Code 版本过旧
3. 网络连接问题

### 解决方案

#### 1. 检查 CLAUDE.md 格式

打开 `CLAUDE.md`，确保文件格式正确，特别是命令定义部分：

```markdown
### 1️⃣ /product-owner

**角色**: Product Owner（产品负责人）
**别名**: /po
**触发条件**: 用户输入 `/product-owner` 或 `/po`
...
```

#### 2. 更新 Claude Code

确保使用最新版本的 Claude Code：

```bash
# 检查版本
claude --version

# 更新（如果需要）
# 访问 https://claude.ai/code 下载最新版本
```

#### 3. 检查网络连接

Claude Code 需要网络连接才能工作。确保：
- 网络连接正常
- 没有防火墙阻止
- 代理设置正确（如果使用代理）

#### 4. 查看 Claude Code 日志

1. 按 `Ctrl+Shift+P`（Mac: `Cmd+Shift+P`）
2. 输入 "Toggle Developer Tools"
3. 查看 Console 标签中的错误信息

---

## 问题：变量替换不正确

### 症状

打开 Agent 模板文件，看到 `{{PROJECT_NAME}}` 等占位符没有被替换。

### 解决方案

#### 手动替换变量

```bash
# 替换所有模板文件中的变量
find .claude-pilot/templates -name "*.md" -exec sed -i 's/{{PROJECT_NAME}}/YourProjectName/g' {} \;
find .claude-pilot/templates -name "*.md" -exec sed -i "s/{{DATE}}/$(date +%Y-%m-%d)/g" {} \;
find .claude-pilot/templates -name "*.md" -exec sed -i "s/{{YEAR}}/$(date +%Y)/g" {} \;
find .claude-pilot/templates -name "*.md" -exec sed -i 's/{{AUTHOR}}/Your Name/g' {} \;

# 也替换 CLAUDE.md
sed -i 's/{{PROJECT_NAME}}/YourProjectName/g' CLAUDE.md
sed -i "s/{{DATE}}/$(date +%Y-%m-%d)/g" CLAUDE.md
```

---

## 问题：npm link 失败

### 症状

运行 `npm link` 时报错：`EACCES: permission denied`

### 解决方案

#### 使用 sudo（Linux/Mac）

```bash
sudo npm link
```

#### 修复 npm 权限（推荐）

```bash
# 创建全局目录
mkdir ~/.npm-global

# 配置 npm 使用新目录
npm config set prefix '~/.npm-global'

# 添加到 PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 重新 link
npm link
```

---

## 问题：找不到 claudecode-gpt 命令

### 症状

运行 `claudecode-gpt` 时报错：`command not found`

### 解决方案

#### 检查安装

```bash
# 检查是否已安装
npm list -g claudecode-gpt

# 如果未安装，重新安装
npm install -g claudecode-gpt
```

#### 检查 PATH

```bash
# 查看 npm 全局 bin 目录
npm bin -g

# 确保该目录在 PATH 中
echo $PATH | grep $(npm bin -g)
```

如果不在 PATH 中：

```bash
# 添加到 PATH
echo "export PATH=$(npm bin -g):\$PATH" >> ~/.bashrc
source ~/.bashrc
```

#### 使用 npx（临时方案）

```bash
npx claudecode-gpt init --name "MyProject"
```

---

## 问题：性能问题

### 症状

- 命令执行很慢
- Claude Code 响应缓慢
- 内存占用过高

### 解决方案

#### 1. 减少任务数量

如果项目有大量任务（100+），考虑：
- 分批处理任务
- 使用任务过滤
- 定期清理已完成任务

#### 2. 优化 task_status.json

```bash
# 备份
cp task_status.json task_status.json.backup

# 只保留未完成的任务
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('task_status.json'));
data.tasks = data.tasks.filter(t => t.status !== 'completed');
fs.writeFileSync('task_status.json', JSON.stringify(data, null, 2));
"
```

#### 3. 重启 Claude Code

定期重启 Claude Code 以释放内存。

---

## 获取帮助

如果以上方法都无法解决问题：

1. **查看文档**
   - [README.md](../README.md)
   - [User Guide](user-guide.md)

2. **报告问题**
   - GitHub Issues: https://github.com/yourusername/claudecode-pilot/issues
   - 提供详细的错误信息和复现步骤

3. **社区支持**
   - 加入讨论组
   - 查看常见问题

---

**最后更新**: 2025-10-01

