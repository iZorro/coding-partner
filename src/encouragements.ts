// src/encouragements.ts
import * as vscode from 'vscode';

// -------------- 中英双语鼓励语列表 --------------
// 中文鼓励语列表（可补充至100条）
const chineseEncouragements: string[] = [
  "你真棒！",
  "恭喜你完成了一个方法，继续加油！",
  "你辛苦了，喝杯咖啡休息一下吧～",
  "太厉害了，离目标又近了一步！",
  "干得漂亮，这部分代码写得很规整！",
  "哇哦，你已经掌握了这个知识点，太棒了！",
  "恭喜创建新文档，开启一段新的编码之旅～",
  "你太牛了，这么快就完成了这个节点！",
  "休息片刻，你值得拥有更好的状态～",
  "太棒了，继续保持这个节奏！",
  "恭喜完成本次编码节点，为你点赞！",
  "你真的很有天赋，编码越来越流畅了！",
  "辛苦啦，吃点小零食补充能量吧～",
  "太优秀了，这个方法写得无可挑剔！",
  "为你喝彩，每一次进步都值得铭记！",
  "你真棒，接下来可以挑战更难的部分了！",
  "恭喜创建新文件，未来可期哦～",
  "你辛苦了，适当放松一下，效率会更高！",
  "干得漂亮，这波操作太丝滑了！",
  "哇，你已经完成这么多工作了，太厉害了！",
  "恭喜完成方法定义，离项目上线又近了一步！",
  "你真的很棒，坚持下去一定会有大收获！",
  "辛苦啦，喝杯奶茶犒劳一下自己吧～",
  "太厉害了，这个逻辑梳理得非常清晰！",
  "为你点赞，每一次编码都充满了诚意！",
  "你真棒，已经克服了这个小难点！",
  "恭喜创建新文档，愿你在里面写出优雅的代码～",
  "你辛苦了，休息五分钟，再继续乘风破浪！",
  "干得漂亮，这部分功能实现得太完美了！",
  "哇哦，你简直是编码小能手，太优秀了！"
];

// 英文鼓励语列表（与中文一一对应，可补充至100条）
const englishEncouragements: string[] = [
  "You are awesome!",
  "Congratulations on finishing a method, keep it up!",
  "You've worked hard, take a break and have a cup of coffee～",
  "Amazing! You're one step closer to your goal!",
  "Well done, this part of the code is very neat!",
  "Wow, you've mastered this knowledge point, great job!",
  "Congratulations on creating a new document, start a new coding journey～",
  "You're awesome, finishing this node so quickly!",
  "Take a short break, you deserve a better state～",
  "Great job, keep up this pace!",
  "Congratulations on completing this coding node, thumbs up for you!",
  "You really have a gift, coding is getting smoother and smoother!",
  "You've worked hard, have some snacks to replenish your energy～",
  "Excellent, this method is impeccable!",
  "Cheers to you, every progress is worth remembering!",
  "You are awesome, you can challenge the harder parts next!",
  "Congratulations on creating a new file, the future is promising～",
  "You've worked hard, relax properly, and you'll be more efficient!",
  "Well done, this operation is so smooth!",
  "Wow, you've already finished so much work, that's amazing!",
  "Congratulations on completing the method definition, one step closer to project launch!",
  "You are really great, persist and you will reap great rewards!",
  "You've worked hard, treat yourself to a cup of milk tea～",
  "Amazing, this logic is sorted out very clearly!",
  "Thumbs up for you, every coding session is full of sincerity!",
  "You are awesome, you've overcome this small difficulty!",
  "Congratulations on creating a new document, may you write elegant code in it～",
  "You've worked hard, rest for five minutes, then ride the wind and waves again!",
  "Well done, this function is implemented perfectly!",
  "Wow, you're simply a coding whiz, so excellent!"
];

// -------------- 语言判断 + 随机获取鼓励语 --------------
/**
 * 判断当前系统语言是否为中文
 * @returns boolean - 是中文返回 true，否则返回 false
 */
function isChineseEnvironment(): boolean {
  // 1. 获取 VS Code 配置的显示语言（优先级最高）
  const vscodeLocale = vscode.env.language;
  // 2. 匹配中文环境（zh-CN 简体中文、zh-TW 繁体中文、zh-HK 香港繁体）
  return /^zh(-|$)/.test(vscodeLocale);
}

/**
 * 根据系统语言自动获取随机鼓励语（默认中文，否则英文）
 * @returns string - 随机鼓励语
 */
export function getRandomEncouragement(): string {
  // 选择对应语言的鼓励语列表
  const targetList = isChineseEnvironment() ? chineseEncouragements : englishEncouragements;
  // 生成随机索引并返回鼓励语
  const randomIndex = Math.floor(Math.random() * targetList.length);
  return targetList[randomIndex];
}

/**
 * （备用）手动指定语言获取随机鼓励语
 * @param lang - 语言类型（zh / en）
 * @returns string - 随机鼓励语
 */
export function getEncouragementByLang(lang: 'zh' | 'en'): string {
  const targetList = lang === 'zh' ? chineseEncouragements : englishEncouragements;
  const randomIndex = Math.floor(Math.random() * targetList.length);
  return targetList[randomIndex];
}