
function startListen() {

    let selectedCallback = () => { }
    let selectedOption = 0
    let options = []
    let isListening = true

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
        const height = process.stdout.getWindowSize()[1] - 3
        let contents = ''
        function printContent(content) {
            contents += content + '\n'
        }
        printContent(`Selected: ${options[selectedOption].tag}`)
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
                printContent('')
                continue
            }
            if (indexOption === selectedOption) {
                printContent(`> ${options[indexOption].tag}`)
            } else {
                printContent(`  ${options[indexOption].tag}`)
            }
        }
        console.log('\x1Bc')
        console.log(contents)
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