async function constructMarkdown(book, chapter) {
    const usfm = chapter.usfm
    const url = `https://nodejs.bible.com/api/bible/chapter/3.1?id=1930&reference=${usfm}`
    console.log('Downloading', url)
    const data = await request(url)
    const verses = extractVerses(data)
    console.log('Downloaded', Object.keys(verses).length, 'verses')
    const markdown = formatVersesInMarkdownString(data.reference.human, verses)
    saveData(markdown, `${book.human} ${chapter.human}.md`)
    console.log('Saved', `${book.human} ${chapter.human}.md`)
}

function request(url) {
    return new Promise((resolve, reject) => {
        const https = require('https')
        https.get(url, (res) => {
            let data = ''
            res.on('data', (chunk) => {
                data += chunk
            })
            res.on('end', () => {
                resolve(JSON.parse(data))
            })
        }).on('error', (err) => {
            reject(err)
        })
    })
}

function saveData(data, filename = 'data.json') {
    const fs = require('fs')
    return fs.writeFileSync(filename, typeof data != 'string' ? JSON.stringify(data) : data, 'utf8')
}

function extractVerses(data) {
    function divideVerses(text) {
        const content = text.trim().split(' ').filter(c => c).join(' ').split('')
        const length = content.length
        const verses = {}
        let verse = null
        for (let index = 0; index < length; index++) {
            const char = content[index];
            if (!isNaN(+char) && char != ' ') {
                if (typeof verse == 'string' || verse == null) {
                    verse = +char
                } else {
                    verse = +`${verse}${char}`
                }

                if (isNaN(+content[index + 1])) {
                    verse = verse.toString()
                    verses[verse] = ''
                }

            } else {
                verses[verse] += char
            }
        }
        return verses
    }

    const { content } = data
    const cheerio = require('cheerio')
    const $ = cheerio.load(content)
    $('.note').remove()
    let text = ''
    $('.chapter').children('div').each((index, element) => {
        $(element).children('.verse').each((index, element) => {
            text += `  ${$(element).text()}  `
        })
    })
    const verses = divideVerses(text)
    return verses
}

function formatVersesInMarkdownString(title, verses) {
    let markdown = `# ${title} \n\n\n`
    Object.keys(verses).forEach(verse => {
        const text = verses[verse]
        markdown += `> ${verse} - ${text} \n\n\n`
    })
    return markdown
}


module.exports = constructMarkdown