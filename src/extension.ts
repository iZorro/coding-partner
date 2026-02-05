// src/extension.ts
import * as vscode from 'vscode';
import { getRandomEncouragement } from './encouragements';

// 全局变量：创建输出通道（替代终端），更适合展示鼓励语
let encouragementOutputChannel: vscode.OutputChannel;

// 节点性动作判断辅助：记录上次输入/操作的状态
let lastDocumentContent: string = '';
let lastActiveFileName: string = '';

/**
 * 插件激活入口（VS Code 启动/插件启用时执行）
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('恭喜，coding-partner 插件已激活！🎉');

  // 1. 初始化输出通道（替代终端，无 echo 命令痕迹）
  encouragementOutputChannel = vscode.window.createOutputChannel('Coding Partner');

  // 2. 注册文档内容变更监听（监控完成方法等编码动作）
  const documentChangeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
    monitorDocumentChange(event);
  });

  // 3. 注册新文档创建监听（监控创建文件/文档动作）
  const documentCreateDisposable = vscode.workspace.onDidCreateFiles((event) => {
    monitorDocumentCreate(event);
  });

  // 4. 释放资源
  context.subscriptions.push(
    documentChangeDisposable,
    documentCreateDisposable,
    encouragementOutputChannel // 停用插件时自动销毁输出通道
  );
}

/**
 * 插件停用入口（VS Code 关闭/插件禁用时执行）
 */
export function deactivate() {
  console.log('coding-partner 插件已停用！👋');
}

// -------------- 辅助方法 --------------
/**
 * 监控文档内容变更，判断是否触发节点性编码动作
 * @param event - 文档变更事件对象
 */
function monitorDocumentChange(event: vscode.TextDocumentChangeEvent) {
  const document = event.document;

  // 过滤非代码文档（只监控常见编程文件，可按需扩展）
  const validLanguages = [
    'javascript', 'typescript', 'java', 'python', 'c', 'cpp',
    'csharp', 'go', 'ruby', 'php', 'vue', 'react', 'html', 'css'
  ];
  if (!validLanguages.includes(document.languageId)) {
    return;
  }

  const currentContent = document.getText();
  const currentFileName = document.fileName;

  // 过滤：首次加载、内容减少（删除操作）不触发
  if (lastDocumentContent === '' || currentContent.length <= lastDocumentContent.length) {
    lastDocumentContent = currentContent;
    lastActiveFileName = currentFileName;
    return;
  }

  // 判断是否为节点性动作，是则输出鼓励语
  if (checkNodeAction(currentContent, lastDocumentContent)) {
    outputEncouragementToOutputChannel();
  }

  // 更新上次记录的内容和文件名
  lastDocumentContent = currentContent;
  lastActiveFileName = currentFileName;
}

/**
 * 监控新文件创建，触发鼓励语输出
 * @param event - 文件创建事件对象
 */
function monitorDocumentCreate(event: vscode.FileCreateEvent) {
  // 过滤隐藏文件（.gitignore、.env 等），只对有效文件触发
  const validFiles = event.files.filter(file => {
    const fileName = file.fsPath.split('/').pop() || '';
    return !fileName.startsWith('.');
  });

  if (validFiles.length > 0) {
    outputEncouragementToOutputChannel();
  }
}

/**
 * 判断是否为节点性编码动作（方法、类、对象完成等）
 * @param currentContent - 当前文档完整内容
 * @param lastContent - 上次文档完整内容
 * @returns boolean - 是节点性动作返回 true
 */
function checkNodeAction(currentContent: string, lastContent: string): boolean {
  // 只对比新增的内容，提高判断准确性和性能
  const newContent = currentContent.slice(lastContent.length);

  // 节点动作匹配规则（正则表达式，可按需扩展适配更多语言）
  const nodeActionPatterns = [
    /\}\s*$/, // 大括号闭合（方法、类、对象结束）
    /function\s+\w+\s*\(.*\)\s*\{\s*[\s\S]*\}\s*$/, // 普通函数定义完成
    /\w+\s*=\s*\(.*\)\s*=>\s*\{\s*[\s\S]*\}\s*$/, // 箭头函数定义完成
    /class\s+\w+\s*\{\s*[\s\S]*\}\s*$/, // 类定义完成
    /const\s+\w+\s*=\s*\{\s*[\s\S]*\}\s*;\s*$/ // 对象字面量定义完成
  ];

  // 匹配任意一个规则即判定为节点性动作
  return nodeActionPatterns.some(pattern => pattern.test(newContent));
}

/**
 * 输出随机鼓励语到输出通道（无 echo 命令，更优雅）
 */
function outputEncouragementToOutputChannel() {
  // 获取随机鼓励语
  const encouragement = getRandomEncouragement();
  // 格式化输出内容（添加时间戳，更友好）
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  const outputContent = `[${timeStr}] [Coding Partner] 🎉 ${encouragement}`;

  // 输出到通道（appendLine 自动换行，不会有任何命令痕迹）
  encouragementOutputChannel.appendLine(outputContent);

  // 显示输出通道（不抢夺编辑区焦点，和 terminal.show(true) 效果一致）
  encouragementOutputChannel.show(true);
}