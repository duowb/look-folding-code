import { useLogger } from 'reactive-vscode'
import type { TextDocument } from 'vscode'
import { displayName } from './generated/meta'

export const logger = useLogger(displayName)

/**
 * 获取文档每行的上下文内容
 *
 * @param document 文本文档对象
 * @returns 返回文档每行的文本内容数组
 */
export function getDocumentLineContext(document: TextDocument) {
  const { lineCount, lineAt } = document
  const lineContext: string[] = []
  for (let index = 0; index < lineCount; index++) {
    lineContext.push(`${lineAt(index).text}`)
  }
  return lineContext
}
/**
 * 生成一个从`start`到`end`（不包括`end`）的连续整数数组。
 *
 * @param start 起始数字（包含）
 * @param end 终止数字（不包含）
 * @returns 返回一个整数数组
 */
export function generateRange(start: number, end: number): number[] {
  const nums: number[] = []
  for (let index = start; index < end; index++) {
    nums.push(index)
  }
  return nums
}
