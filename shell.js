
function createDisplay() {
    const [w, h] = process.stdout.getWindowSize()
    const width = w
    const height = h - 2
    const displaySize = width * height
    const contents = {
        last: Array(displaySize).fill(' '),
        current: Array(displaySize).fill(' '),
    }

    function createNewPage() {
        const pageContent = [...contents.current]

        function makeLine(line, value) {
            const start = line * width
            const end = start + width
            for (let i = start; i < end; i++) {
                pageContent[i] = value[i - start] || ' '
            }
            return pageContent
        }

        function render() {
            renderContent(pageContent)
        }

        return {
            width,
            height,
            makeLine,
            render,
        }

    }


    function renderContent(pageContent) {
        for (let index = 0; index < displaySize; index++) {
            const value = pageContent[index]
            if (!comparePixels(index, value)) continue
            const w = index % width
            const h = Math.floor(index / width)
            writePixel(w, h, value)
        }

        contents.last = [...contents.current]
        contents.current = [...pageContent]
        return [...contents.current]

    }

    function writePixel(w, h, value) {
        if (!value && value !== ' ') return
        process.stdout.cursorTo(w, h)
        process.stdout.write(value)
        process.stdout.cursorTo(0, height - 2)
        return value
    }

    function comparePixels(index, value) {
        const last = contents.current[index]
        const current = value
        if (typeof last === undefined) return false
        if (typeof current === undefined) return false
        if (last === current) return false
        return true
    }

    function clear() {
        console.log('\x1Bc')
        process.stdout.cursorTo(0, 0)
        console.log(Array(displaySize).fill(' ').join(''))
    }

    clear()

    return {
        width,
        height,
        createNewPage,
        clear,
    }

}


function startListen() {

    let selectedCallback = () => { }
    let selectedOption = 0
    let options = []
    let isListening = true
    const display = createDisplay()
    const page = display.createNewPage()


    const methods = {
        '\u0003': () => { process.exit() },
        '\u000D': () => selectedCallback(),
        '\u001B\u005B\u0041': () => {
            selectedOption--
            if (selectedOption < 0) {
                selectedOption = options.length - 1
            }
            selectedCallback = options[selectedOption].method
        },
        '\u001B\u005B\u0042': () => {
            selectedOption++
            if (selectedOption > options.length - 1) {
                selectedOption = 0
            }
            selectedCallback = options[selectedOption].method
        },
    }

    function setOptions(newOptions) {
        options = newOptions
        selectedOption = 0
        selectedCallback = options[selectedOption].method
        renderOptions()
    }

    function renderOptions() {
        if (!isListening) { return }
        const height = page.height - 1
        page.makeLine(0, `Selected: ${options[selectedOption].tag}                                `)
        function getIndexOption(line) {
            const midIndex = Math.floor(height / 2)
            if (selectedOption < midIndex) {
                return line
            }
            if (selectedOption >= options.length - midIndex) {
                return line + (options.length - height)
            }
            return line + (selectedOption - Math.floor(height / 2))
        }
        for (let line = 0; line < height; line++) {
            const indexOption = getIndexOption(line)
            const option = options[indexOption]
            if (!option) {
                page.makeLine(line + 1, '')
                continue
            }
            if (indexOption === selectedOption) {
                page.makeLine(line + 1, `> ${option.tag}`)
            } else {
                page.makeLine(line + 1, `  ${option.tag}`)
            }
        }
        page.render()
    }

    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.on('data', data => {
        if (!isListening) { return }
        const methodName = data.toString()
        const method = methods[methodName]
        if (method) {
            method()
        }
        renderOptions()
    })


    function close() {
        isListening = false
        process.stdin.pause(false)
        console.log('\x1Bc')
    }

    return {
        setOptions,
        close,
    }
}


module.exports = {
    startListen,
}