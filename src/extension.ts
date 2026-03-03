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
  '\u26A1 ???????',
  '\uD83D\uDCA5 ??????',
  '\uD83C\uDF1F ???????',
  '\u2728 ???????',
  '\uD83D\uDD25 ????',
  '\uD83C\uDFC6 ????',
  '\uD83D\uDCAA ????',
  '\uD83D\uDE80 ????',
  '\uD83D\uDE0D ????',
  '\uD83D\uDD96 ????',
  '\uD83D\uDE4C\uD83C\uDFFC ????',
  '\uD83E\uDD24 ???',
  '\uD83D\uDEA8 ????',
  '\uD83E\uDD13 ????',
  '\uD83D\uDC4D ?????',
  '\uD83C\uDFC1 ????',
  '\uD83C\uDF8C ????',
  '\u2600\uFE0F ????',
  '\uD83D\uDCA1 ????',
  '\uD83C\uDFAB ????',
  '\u2705 ????',
  '\u274C ????????',
  '\u1F9E0 ????',
  '\uD83C\uDFB2 ??????',
  '\uD83C\uDFB6 ????',
  '\uD83C\uDFAD ?????',
  '\uD83D\uDC31 ?????',
  '\uD83D\uDC36 ????',
  '\uD83C\uDF40 ????',
  '\uD83C\uDF08 ????',
  '\uD83C\uDF7B ????',
  '\uD83C\uDFAF ????',
  '\uD83D\uDD25 ????',
  '\uD83E\uDE84 ????',
  '\u2699\uFE0F ????',
  '\uD83D\uDEE1\uFE0F ????',
  '\uD83D\uDD79\uFE0F ????',
  '\uD83D\uDCDD ????',
  '\u26A1 ??????'
];

// current list depending on IDE language
let currentTypingEffects: string[] = typingEffectsEn;

// keep a list of active decoration types so we can dispose them later if needed
let activeEffectDecorations: vscode.TextEditorDecorationType[] = [];
// debounce timestamp to prevent overlapping effects during rapid typing
let lastTypingEffectTime: number = 0;

// ??????????????????????????
let encouragementOutputChannel: vscode.OutputChannel;

// ????????????????/?????
let lastDocumentContent: string = '';
let lastActiveFileName: string = '';

/**
 * ???????VS Code ??/????????
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('???coding-partner ????????');
  // choose effect language based on IDE locale
  const lang = vscode.env.language.toLowerCase();
  if (lang.startsWith('zh')) {
    currentTypingEffects = typingEffectsZh;
  } else {
    currentTypingEffects = typingEffectsEn;
  }

  // 1. ?????????????? echo ?????
  encouragementOutputChannel = vscode.window.createOutputChannel('Coding Partner');

  // 2. ???????????????????????
  const documentChangeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
    monitorDocumentChange(event);
  });

  // 3. ????????????????/?????
  const documentCreateDisposable = vscode.workspace.onDidCreateFiles((event) => {
    monitorDocumentCreate(event);
  });

  // 4. ????
  context.subscriptions.push(
    documentChangeDisposable,
    documentCreateDisposable,
    encouragementOutputChannel // ?????????????
  );
}

/**
 * ???????VS Code ??/????????
 */
export function deactivate() {
  console.log('coding-partner ????????');
}

// -------------- ???? --------------
/**
 * ??????????????????????
 * @param event - ????????
 */
function monitorDocumentChange(event: vscode.TextDocumentChangeEvent) {
  const document = event.document;

  // ????????????????????????
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

  // ?????????????????????
  if (lastDocumentContent === '' || currentContent.length <= lastDocumentContent.length) {
    lastDocumentContent = currentContent;
    lastActiveFileName = currentFileName;
    return;
  }

  // ??????????????????
  if (checkNodeAction(currentContent, lastDocumentContent)) {
    outputEncouragementToOutputChannel();
  }

  // ?????????????
  lastDocumentContent = currentContent;
  lastActiveFileName = currentFileName;
}

/**
 * ???????????????
 * @param event - ????????
 */
function monitorDocumentCreate(event: vscode.FileCreateEvent) {
  // ???????.gitignore?.env ???????????
  const validFiles = event.files.filter(file => {
    const fileName = file.fsPath.split('/').pop() || '';
    return !fileName.startsWith('.');
  });

  if (validFiles.length > 0) {
    outputEncouragementToOutputChannel();
  }
}

/**
 * ????????????????????????
 * @param currentContent - ????????
 * @param lastContent - ????????
 * @returns boolean - ???????? true
 */
function checkNodeAction(currentContent: string, lastContent: string): boolean {
  // ???????????????????
  const newContent = currentContent.slice(lastContent.length);

  // ???????????????????????????
  const nodeActionPatterns = [
    /\}\s*$/, // ????????????????
    /function\s+\w+\s*\(.*\)\s*\{\s*[\s\S]*\}\s*$/, // ????????
    /\w+\s*=\s*\(.*\)\s*=>\s*\{\s*[\s\S]*\}\s*$/, // ????????
    /class\s+\w+\s*\{\s*[\s\S]*\}\s*$/, // ?????
    /const\s+\w+\s*=\s*\{\s*[\s\S]*\}\s*;\s*$/ // ?????????
  ];

  // ?????????????????
  return nodeActionPatterns.some(pattern => pattern.test(newContent));
}

/**
 * ?????????????? echo ???????
 */
function outputEncouragementToOutputChannel() {
  // ???????
  const encouragement = getRandomEncouragement();
  // ??????????????????
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  const outputContent = `[${timeStr}] [Coding Partner] \uD83C\uDF89 ${encouragement}`;

  // ??????appendLine ???????????????
  encouragementOutputChannel.appendLine(outputContent);

  // ????????????????? terminal.show(true) ?????
  encouragementOutputChannel.show(true);
}
// ---------- typing animation helpers ----------

/**
 * ??????????????????
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
 * ?????? HEX ?????
 */
function getRandomColor(): string {
  const letters = '789ABCD';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
}


