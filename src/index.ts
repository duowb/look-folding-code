import { defineExtension, useActiveTextEditor, useDisposable, useTextEditorVisibleRanges, watch } from 'reactive-vscode'
import { Hover, MarkdownString, type Uri, languages } from 'vscode'
import { generateRange, getDocumentLineContext } from './utils'

interface FileLineInfo {
  startLine: number
  lines: number[]
}

const cacheFoldingMap = new Map<Uri, FileLineInfo[]>()

const { activate, deactivate } = defineExtension(() => {
  const editor = useActiveTextEditor()
  const textEditorVisibleRanges = useTextEditorVisibleRanges(editor)

  const getActiveDocument = () => editor.value?.document

  watch(textEditorVisibleRanges, (newRanges) => {
    const document = getActiveDocument()
    if (!document)
      return
    const list: FileLineInfo[] = []
    newRanges.forEach((item, index) => {
      const nextItem = newRanges[index + 1]
      if (!nextItem) {
        return
      }
      list.push({
        startLine: item.end.line,
        // 从折叠开始的行的下一个到下一次折叠的开始行
        lines: generateRange(item.end.line + 1, nextItem.start.line),
      })
    })
    cacheFoldingMap.set(document.uri, list)
  }, {
    immediate: true,
  })

  useDisposable(languages.registerHoverProvider('*', {
    provideHover(document, position) {
      const { line, character } = position
      const lineContext = getDocumentLineContext(document)
      const lineLength = document.lineAt(line).text.length
      const cacheFileMap = cacheFoldingMap.get(document.uri)
      // 当前页面没有折叠或者鼠标没有放到最后
      if (!cacheFileMap || lineLength !== character) {
        return null
      }
      const { lines = [] } = cacheFileMap.find(item => item.startLine === line) || {}
      const context = lines.map(lineItem => `${lineContext[lineItem]}\n`).join('')
      const markdownString = new MarkdownString(`\`\`\`\n${context}\n\`\`\``)
      return new Hover(markdownString)
    },
  }))
})

export { activate, deactivate }
