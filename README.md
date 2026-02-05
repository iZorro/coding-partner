# 编码伙伴
# Coding Partner

一个温暖的 VS Code 插件，当您完成关键编码操作时，会用随机消息鼓励您。
A warm VS Code plugin that encourages you with random messages when you finish key coding actions.

## Features
1. **Auto-detect key actions**: Monitor actions like creating new files, completing methods/classes/objects.
自动检测关键操作：监控诸如创建新文件、完成方法/类/对象等操作。
2. **Bilingual support**: Auto-switch between Chinese and English according to your VS Code system language (default Chinese).
双语支持：根据您的 VS Code 系统语言，自动在中文和英文之间切换（默认中文）。
3. **Dedicated terminal**: Output encouragement messages in a separate terminal named "Coding Partner" (with green style for better visibility).
专属终端：在名为 "Coding Partner"（编码伙伴）的独立终端中输出鼓励信息（采用绿色样式以获得更好的可见性）。
4. **Low interference**: Only trigger on valid code files, avoid frequent false triggers.
低干扰：仅在有效的代码文件上触发，避免频繁的误触发。

## How to Use
1. Install the plugin (local development: press `F5` to launch Extension Development Host).
2. Create a new code file (e.g., `test.ts`, `test.js`).
3. Complete a method or create a new file, and you will see encouragement messages in the "Coding Partner" terminal.

## Configuration
- No additional configuration needed, the plugin will auto-adapt to your system language.
- You can supplement more encouragement messages in `src/encouragements.ts` (up to 100 items for each language).

## Supported Languages
- Code files: JavaScript, TypeScript, Java, Python, C/C++, C#, Go, Ruby, PHP, Vue, React, HTML, CSS.
- Encouragement languages: Chinese (zh-CN/zh-TW/zh-HK), English (all other locales).

## Changelog
### v1.0.2
- Initial release.
- Support Chinese/English auto-switch.
- Support monitoring file creation and method completion.
