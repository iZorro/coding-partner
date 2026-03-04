// src/extension.ts
import * as vscode from 'vscode';
import { getRandomEncouragement } from './encouragements';

// ---------- typing effect helpers ----------
// some emoji/words to show around cursor while typing
// use unicode escapes to prevent encoding loss during compilation
// typing effects in different languages
const typingEffectsEn = [
  '\u26A1 Keep going, you got this',
  '\uD83D\uDCA5 Almost there, hang tight',
  '\uD83C\uDF1F Great work, keep pushing',
  '\u2728 Nice code, stay focused',
  '\uD83D\uDD25 You rock, don?t stop',
  '\uD83C\uDFC6 Fantastic, keep it up',
  '\uD83D\uDCAA Impressive, well done',
  '\uD83D\uDE80 Stay strong, finish fast',
  '\uD83D\uDE0D Excellent progress, bravo',
  '\uD83D\uDD96 Sharp mind, sharp code',
  '\uD83D\uDE4C\uD83C\uDFFC Keep coding, stay sharp',
  '\uD83E\uDD24 You?re doing amazing things',
  '\uD83D\uDEA8 Focus now, reward later',
  '\uD83E\uDD13 Brilliant, keep going',
  '\uD83D\uDC4D Code smarter, not harder',
  '\uD83C\uDFC1 Victory is near, continue',
  '\uD83C\uDF8C Stay curious, keep building',
  '\u2600\uFE0F Your logic is solid',
  '\uD83D\uDCA1 Energy high, bugs low',
  '\uD83C\uDFAB Dream big, code bigger',
  '\u2705 Persistence pays off soon',
  '\u274C Write today, succeed tomorrow',
  '\u1F9E0 Think deep, code well',
  '\uD83C\uDFB2 Create magic with code',
  '\uD83C\uDFB6 Innovate, iterate, improve',
  '\uD83C\uDFAD Code flows, brain grows',
  '\uD83D\uDC31 Great ideas, great code',
  '\uD83D\uDC36 Keep calm and code on',
  '\uD83C\uDF40 Level up your craft',
  '\uD83C\uDF08 Challenge accepted, completed',
  '\uD83C\uDF7B One more line, victory',
  '\uD83C\uDFAF Build fast, learn faster',
  '\uD83D\uDD25 Be bold, be brilliant',
  '\uD83E\uDE84 Solve problems, build futures',
  '\u2699\uFE0F Write clean, stay sane',
  '\uD83D\uDEE1\uFE0F Believe, build, become',
  '\uD83D\uDD79\uFE0F Keep pushing boundaries today',
  '\uD83D\uDCDD Code hard, ship early',
  '\u26A1 Make every keystroke count'
];

const typingEffectsZh = [
  '\u26A1 继续努力，你可以的',
  '\uD83D\uDCA5 快到了，坚持住',
  '\uD83C\uDF1F 干得好，继续加油',
  '\u2728 代码不错，保持专注',
  '\uD83D\uDD25 你很棒，不要停',
  '\uD83C\uDFC6 太棒了，继续保持',
  '\uD83D\uDCAA 令人印象深刻，做得好',
  '\uD83D\uDE80 保持强力，快完成',
  '\uD83D\uDE0D 进展顺利，真棒',
  '\uD83D\uDD96 思路清晰，代码利落',
  '\uD83D\uDE4C\uD83C\uDFFC 继续编码，保持敏锐',
  '\uD83E\uDD24 你正在做惊人的事情',
  '\uD83D\uDEA8 现在专注，将来有回报',
  '\uD83E\uDD13 聪明的你，继续前进',
  '\uD83D\uDC4D 代码更聪明，不要更辛苦',
  '\uD83C\uDFC1 胜利在望，继续前行',
  '\uD83C\uDF8C 保持好奇，继续构建',
  '\u2600\uFE0F 你的逻辑很扎实',
  '\uD83D\uDCA1 能量高，BUG少',
  '\uD83C\uDFAB 放大梦想，用代码创造',
  '\u2705 坚持不懈，很快就见成效',
  '\u274C 今天写代码，明天成功',
  '\u1F9E0 深思熟虑，写出好代码',
  '\uD83C\uDFB2 用代码创造魔法',
  '\uD83C\uDFB6 创新、迭代、改进',
  '\uD83C\uDFAD 代码流动，大脑成长',
  '\uD83D\uDC31 好主意，好代码',
  '\uD83D\uDC36 保持冷静，继续编码',
  '\uD83C\uDF40 提升你的工艺',
  '\uD83C\uDF08 挑战已接受，即将完成',
  '\uD83C\uDF7B 再写一行，胜利就在眼前',
  '\uD83C\uDFAF 快速构建，快速学习',
  '\uD83D\uDD25 勇敢，出色',
  '\uD83E\uDE84 解决问题，构建未来',
  '\u2699\uFE0F 写得清晰，保持理智',
  '\uD83D\uDEE1\uFE0F 相信、构建、成为',
  '\uD83D\uDD79\uFE0F 今天继续突破边界',
  '\uD83D\uDCDD 努力编码，尽早发布',
  '\u26A1 让每一次敲击成为有价值的'
];

// current list depending on IDE language
let currentTypingEffects: string[] = typingEffectsEn;

// keep a list of active decoration types so we can dispose them later if needed
let activeEffectDecorations: vscode.TextEditorDecorationType[] = [];
// debounce timestamp to prevent overlapping effects during rapid typing
let lastTypingEffectTime: number = 0;

// output channel used to show encouragement messages
let encouragementOutputChannel: vscode.OutputChannel;

// track the last known document content and active file name
let lastDocumentContent: string = '';
let lastActiveFileName: string = '';

/**
 * Called when the extension is activated by VS Code
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Coding Partner extension activated');
  // choose effect language based on IDE locale
  const lang = vscode.env.language.toLowerCase();
  if (lang.startsWith('zh')) {
    currentTypingEffects = typingEffectsZh;
  } else {
    currentTypingEffects = typingEffectsEn;
  }

  // 1. create an output channel for encouragement messages
  encouragementOutputChannel = vscode.window.createOutputChannel('Coding Partner');

  // 2. listen for document changes to trigger effects
  const documentChangeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
    monitorDocumentChange(event);
  });

  // 3. listen for file creation events
  const documentCreateDisposable = vscode.workspace.onDidCreateFiles((event) => {
    monitorDocumentCreate(event);
  });

  // 4. register disposables so they are cleaned up on deactivate
  context.subscriptions.push(
    documentChangeDisposable,
    documentCreateDisposable,
    encouragementOutputChannel // include output channel in subscriptions
  );
}

/**
 * Called when the extension is deactivated
 */
export function deactivate() {
  console.log('Coding Partner extension deactivated');
}

// -------------- ???? --------------
/**
 * Handles when the text document changes
 * @param event - the change event for the document
 */
function monitorDocumentChange(event: vscode.TextDocumentChangeEvent) {
  const document = event.document;

  // only operate on supported programming languages
  const validLanguages = [
    'javascript', 'typescript', 'java', 'python', 'c', 'cpp',
    'csharp', 'go', 'ruby', 'php', 'vue', 'react', 'html', 'css'
  ];
  if (!validLanguages.includes(document.languageId)) {
    return;
  }

  // show typing animation for every insert change (only when there is an active editor)
  const editor = vscode.window.activeTextEditor;
  if (editor && event.contentChanges.length > 0) {
    event.contentChanges.forEach(change => {
      if (change.text && change.text.length > 0) {
        const position = change.range.end;
        showTypingEffect(editor, position);
      }
    });
  }

  const currentContent = document.getText();
  const currentFileName = document.fileName;

  // if content is empty or smaller than before, just update trackers and skip
  if (lastDocumentContent === '' || currentContent.length <= lastDocumentContent.length) {
    lastDocumentContent = currentContent;
    lastActiveFileName = currentFileName;
    return;
  }

  // if a code block completion or similar action detected, output encouragement
  if (checkNodeAction(currentContent, lastDocumentContent)) {
    outputEncouragementToOutputChannel();
  }

  // update stored content and file name for next change
  lastDocumentContent = currentContent;
  lastActiveFileName = currentFileName;
}

/**
 * Handles newly created files in the workspace
 * @param event - file creation event
 */
function monitorDocumentCreate(event: vscode.FileCreateEvent) {
  // filter out hidden/system files (like .gitignore, .env)
  const validFiles = event.files.filter(file => {
    const fileName = file.fsPath.split('/').pop() || '';
    return !fileName.startsWith('.');
  });

  if (validFiles.length > 0) {
    outputEncouragementToOutputChannel();
  }
}

/**
 * Determines whether a significant coding action occurred since last update
 * @param currentContent - the full current document text
 * @param lastContent - the previous document text
 * @returns boolean - true if an action pattern was found
 */
function checkNodeAction(currentContent: string, lastContent: string): boolean {
  // compute newly added text since last check
  const newContent = currentContent.slice(lastContent.length);

  // patterns that look like code block completions or declarations
  const nodeActionPatterns = [
    /\}\s*$/, // closing brace
    /function\s+\w+\s*\(.*\)\s*\{\s*[\s\S]*\}\s*$/, // function declaration
    /\w+\s*=\s*\(.*\)\s*=>\s*\{\s*[\s\S]*\}\s*$/, // arrow function assignment
    /class\s+\w+\s*\{\s*[\s\S]*\}\s*$/, // class declaration
    /const\s+\w+\s*=\s*\{\s*[\s\S]*\}\s*;\s*$/ // object assignment
  ];

  // test new content against each pattern
  return nodeActionPatterns.some(pattern => pattern.test(newContent));
}

/**
 * Appends a random encouragement message to the output channel
 */
function outputEncouragementToOutputChannel() {
  // select a random encouragement message
  const encouragement = getRandomEncouragement();
  // format current time for logging
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  const outputContent = `[${timeStr}] [Coding Partner] \uD83C\uDF89 ${encouragement}`;

  // add the message to the output channel
  encouragementOutputChannel.appendLine(outputContent);

  // make sure the output channel is visible to the user
  encouragementOutputChannel.show(true);
}
// ---------- typing animation helpers ----------

/**
 * Displays a visual typing effect at the cursor position
 */
function showTypingEffect(editor: vscode.TextEditor, position: vscode.Position) {
  const now = Date.now();
  // if previous effect happened less than 150ms ago, skip to avoid overlap
  if (now - lastTypingEffectTime < 190) {
    return;
  }
  lastTypingEffectTime = now;
  const list = currentTypingEffects || typingEffectsEn;
  const effect = list[Math.floor(Math.random() * list.length)];
  const color = getRandomColor();
  // decoration placed at the cursor, then shifted upward via transform
  const deco = vscode.window.createTextEditorDecorationType({
    after: {
      contentText: effect,
      margin: '0 0 0 0',
      color: color,
      textDecoration: `none; line-height:2em; background: rgba(68, 66, 66, 0.5); color:${color}; font-size:2em; position:absolute; top:-1.6em; transform: translateX(0); pointer-events:none; padding:0 5px; border-radius:10px;`
    },
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen
  });

  activeEffectDecorations.push(deco);
  const range = new vscode.Range(position, position);
  editor.setDecorations(deco, [{ range }]);

  // keep decoration visible a bit longer so user can read it (random 200-400ms)
  const stay = 200 + Math.random() * 200;
  setTimeout(() => {
    deco.dispose();
    activeEffectDecorations = activeEffectDecorations.filter(d => d !== deco);
  }, stay);
}

/**
 * Generate a random HEX color string
 */
function getRandomColor(): string {
  const letters = '789ABCD';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
}


