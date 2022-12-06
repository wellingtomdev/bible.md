
const constructMarkdown = require('./constructMarkdown')
const shell = require('./shell')
const allBible = require('./allBible')

const listenShell = shell.startListen()


listenShell.setOptions(allBible.books.map(book => {
    return {
        tag: book.human,
        method: () => {
            selectChapter(book)
        }
    }
}))


function selectChapter(book) {
    listenShell.setOptions(book.chapters.map(chapter => {
        return {
            tag: chapter.human,
            method: async () => {
                listenShell.close()
                await constructMarkdown(book, chapter)
                process.exit()
            }
        }
    }))
}