import {PDFParse} from 'https://cdn.jsdelivr.net/npm/pdf-parse@latest/dist/pdf-parse/web/pdf-parse.es.js';

let input = document.getElementById('file')
let area = document.getElementById('area')
let filename = document.getElementById('filename')
let file_label = document.querySelector('#file_label')
let file = document.getElementById('file')
let all_names = document.querySelector('#src_text')
let dest_names = document.querySelector('#dest_file')
let preview = document.querySelector(".preview")
let main = document.querySelector('.main')

let convert = document.getElementById('convert')
let child = {'next': ''}
let iscreated = false

try{
    let ext = "txt"
    let dest = "txt"
    all_names.addEventListener('change', () => {
        if(child['next'] != true) {
            dest_names.insertBefore(child['elem'], child['next'])
        } else {
            dest_names.appendChild(child['elem'])
        }
    })
    dest_names.addEventListener("click", (e) => {
        let content = e.target.value
        if(content.endsWith('text')) {
            dest = "txt"
        }
        if(content.endsWith('docx')) {
            dest = "docx"
        }
        if(content.endsWith('pdf')) {
            dest = "pdf"
        }
    })

    all_names.addEventListener("click", (e) => {
        if(area.style.visibility == 'visible') {
            area.style.visibility = 'hidden'
            // location.href = window.location
        }
        let content = e.target.value
        
        if(document.getElementById(`${content}_dest`)) {
            child['next'] = document.getElementById(`${content}_dest`).nextSibling
            child['elem'] = document.getElementById(`${content}_dest`)
        }

        if(document.getElementById(`${content}_dest`)) {
            document.getElementById(`${content}_dest`).remove()
        }

        if(content.endsWith('text')) {
            ext = "txt"
        }
        if(content.endsWith('docx')) {
            ext = "docx"
        }
        if(content.endsWith('pdf')) {
            ext = "pdf"
        }
    })

    input.addEventListener('change', (e) => {
        iscreated = false
        const f = e.target.files[0]
        let name = f.name
        area.style.visibility = 'visible'
        filename.textContent = `${name}`
        filename.style.color = 'blue'
        filename.style.textDecorationLine = 'underline'
        filename.style.cursor = 'pointer'
        filename.addEventListener('click', async () => {
            if(!iscreated) {
                if(document.querySelector('.show') != null) {
                    console.log('has children')
                    document.querySelector('.show').remove()
                }
                const div = document.createElement('div')
                div.className = 'show'
                div.style.display = 'flex'
                div.style.flexDirection = 'column'
                div.style.overflowY = 'auto'
                div.style.scrollBehavior = 'auto'
                div.style.height = '100%'
                const up = document.createElement('div')
                up.style.display = 'flex'
                up.style.flexDirection = 'row'
                up.style.justifyContent = 'space-between'
                up.style.height = '50px'
                up.style.position = 'sticky'
                up.style.backgroundColor = 'rgb(31, 31, 31)'
                up.style.zIndex = '1'
                up.style.top = '0'
                up.style.left = '0'
                const close = document.createElement('img')
                close.src = '../Images/close.jpg'
                close.style.cursor = 'pointer'
                close.id = "close"
                if(ext == 'txt') {
                    const pre = document.createElement('pre')
                    pre.id = 'preview_area'
                    pre.style.margin = '0 20px 20px 20px'
                    pre.style.color = 'black'
                    div.style.overflowX = 'auto'
                    preview.style.backgroundColor = 'white'
                    div.style.backgroundColor = 'white'
                    up.style.justifyContent = 'flex-end'
                    const reader = new FileReader()
                    reader.onload = () => {
                    pre.textContent = reader.result
                    }
                    reader.onerror = () => {
                        console.error('error file reader')
                    }
                    reader.readAsText(f)

                    up.appendChild(close)
                    div.appendChild(up)
                    div.appendChild(pre)
                    preview.appendChild(div)
                    
                    preview.style.display = 'flex'
                }
                if(ext == 'pdf') {
                    // div.style.overflowX = 'hidden'
                    div.style.overflowX = 'auto'
                    preview.style.backgroundColor = 'rgb(31, 31, 31)'
                    div.style.backgroundColor = 'rgb(31, 31, 31)'
                    up.style.justifyContent = 'space-between'

                    const div_pre = document.createElement('div')
                    div_pre.id = 'preview_area'
                    div_pre.style.margin = '0 20px 20px 20px'
                    div_pre.style.color = 'black'
                    div_pre.style.position = 'sticky'
                    // div_pre.style.width = '100%'
                    div_pre.style.left = '20px'

                    let total = 0
                    let actual_page = 1
                    let offset = {}

                    let div_page = document.createElement('div')
                    div_page.style.display = 'flex'
                    div_page.style.flexDirection = 'row'
                    div_page.style.alignItems = 'center'
                    div_page.style.justifyContent = 'center'
                    div_page.style.color = 'white'
                    let pages = document.createElement('span')
                    pages.style.marginRight = '5px'
                    pages.textContent = 'Page:'
                    let pageNumber = document.createElement('input')
                    pageNumber.type = 'text'
                    pageNumber.value = actual_page
                    pageNumber.style.border = '3px solid rgb(255, 255, 255)'
                    pageNumber.style.marginRight = '2px'
                    pageNumber.id = 'pageNumber'
                    pageNumber.style.width = '40px'
                    pageNumber.style.backgroundColor = 'rgb(31, 31, 31)'
                    pageNumber.style.color = 'white'
                    let span = document.createElement('span')
                    span.id = 'total'

                    PDFParse.setWorker('https://cdn.jsdelivr.net/npm/pdf-parse@latest/dist/pdf-parse/web/pdf.worker.mjs');
                    let url = URL.createObjectURL(f)
                    const parser = new PDFParse({url: url, worker: 16})
                    let req = await parser.getText()
                    // let info = await parser.getInfo({parsePageInfo: true})
                    // await parser.destroy()
                    // req = req.text
                    
                    // console.log(`req: ${req}`)
                    // console.log(`info: ${JSON.stringify(info)}`)

                    for(const [k, v] of Object.entries(req)) {
                        // console.log(`v: ${JSON.stringify(v)}`)
                        if(typeof(v) != 'object') {
                            continue
                        }
                        for(let item of v) {
                            for(let[k, v] of Object.entries(item)) {
                                if(k == "num") {
                                    total += 1
                                    // console.log(`total: ${total}`)
                                    // console.log(`item k: ${JSON.stringify(item[k])}`)
                                    continue
                                }
                                if(actual_page < 3){
                                    console.log(`item: ${JSON.stringify(item[k])}`)
                                }
                                let div = document.createElement('div')
                                div.style.display = 'flex'
                                div.style.flexDirection = 'column'
                                div.style.marginBottom = '40px'
                                div.style.width = '100%'
                                div.style.justifyContent = 'center'
                                div.style.alignItems = 'center'
                                div.id = `div_${actual_page}`
                                div.style.backgroundColor = 'white'
                                let p = document.createElement('pre')
                                p.textContent = item[k]
                                p.id = `p_${actual_page}`
                                p.style.backgroundColor = 'white'
                                p.style.marginBottom = 0
                                // p.style.width = '100%'
                                p.style.fontFamily = 'sans-serif'
                                let smalldiv = document.createElement('div')
                                smalldiv.style.display = 'flex'
                                smalldiv.style.flexDirection = 'row'
                                smalldiv.style.justifyContent = 'flex-end'
                                smalldiv.style.backgroundColor = 'white'
                                smalldiv.style.width = '100%'
                                let small = document.createElement('small')
                                small.style.display = 'flex'
                                small.textContent = `Page ${actual_page}`
                                small.style.color = 'black'
                                small.className = 'pages'
                                small.style.backgroundColor = 'white'
                                smalldiv.append(small)
                                div.appendChild(p)
                                div.appendChild(smalldiv)
                                div_pre.appendChild(div)
                                actual_page += 1
                            }
                        }
                    }
                    console.log(`file: ${url}`)
                    span.textContent = `/${total}`

                    div_page.appendChild(pages)
                    div_page.appendChild(pageNumber)
                    div_page.appendChild(span)
                    up.appendChild(div_page)
                    up.appendChild(close)
                    div.appendChild(up)
                    div.appendChild(div_pre)
                    preview.appendChild(div)
                    
                    preview.style.display = 'flex'

                    for(let i = 1; i <= total; i++) {
                        offset[document.getElementById(`p_${i}`).offsetTop] = i
                    }

                    // document.getElementById(`div_${total}`).style.marginBottom = '0px'

                    let alltouch = []

                    document.getElementById('pageNumber').addEventListener('keydown', (evt) => {
                        let value = document.getElementById('pageNumber').value
                        if(value > total) {
                            value = total
                            document.getElementById('pageNumber').textContent = value
                        }
                        if(evt.key == 'Enter') {
                            document.querySelector('.show').scrollTo(document.getElementById(`p_${value}`).offsetLeft, document.getElementById(`p_${value}`).offsetTop - 40)
                        }
                    })

                    div.addEventListener('touchstart', (e) => {
                        e.preventDefault()
                        console.log('touchestart')
                        let touches = e.changedTouches

                        for(const i = 0;  i < touches.length; i++) {
                            alltouch.push(touches[i])
                            console.log(`touches: ${touches[i]}`)
                        }
                    })

                    div.addEventListener('touchmove', (e) => {
                        e.preventDefault()
                        let touches = e.changedTouches
                        // let ctx = document.createElement('canvas').getContext('2d')
                        for(const i = 0;  i < touches.length; i++) {
                            // ctx.moveTo(alltouch[i].pageX, alltouch[i].pageY)
                            // ctx.moveTo(touches[i].pageX, touches[i].pageY)
                            console.log(`y coord move: ${touches[i].pageY}`)

                            if(touches[i].pageY in offset) {
                                document.getElementById('pageNumber').value = offset[touches[i].pageY]
                            }

                            alltouch.splice(i, 1, touches[i])
                        }
                    })

                    div.addEventListener('touchend', (e) => {
                        e.preventDefault()
                        let touches = e.changedTouches
                        // let ctx = document.createElement('canvas').getContext('2d')
                        for(const i = 0;  i < touches.length; i++) {
                            // ctx.moveTo(alltouch[i].pageX, alltouch[i].pageY)
                            // ctx.moveTo(touches[i].pageX, touches[i].pageY)
                            console.log(`y coord end: ${touches[i].pageY}`)

                            if(touches[i].pageY in offset) {
                                document.getElementById('pageNumber').value = offset[touches[i].pageY]
                            }

                            alltouch.splice(i, 1)
                        }
                    })

                    div.addEventListener('touchcancel', (e) => {
                        e.preventDefault()
                        let touches = e.changedTouches
                        // let ctx = document.createElement('canvas').getContext('2d')
                        for(const i = 0;  i < touches.length; i++) {
                            // ctx.moveTo(alltouch[i].pageX, alltouch[i].pageY)
                            // ctx.moveTo(touches[i].pageX, touches[i].pageY)
                            console.log(`y coord cancel: ${touches[i].pageY}`)

                            alltouch.splice(i, 1)
                        }
                    })

                }
                iscreated = true
            }

            document.getElementById('close').addEventListener('click', (e) => {
                e.preventDefault()
                preview.style.display = ''
            })

        })

        convert.addEventListener('click', async (e) => {
            e.preventDefault()
            console.log(`name ${name}`)
            console.log(`ext ${ext}`)

            const formdata = new FormData()
            formdata.append("file", file.files[0])

            console.log(`length: ${file.files.length}`)
            // const url = new Request({url: `http://localhost:3000/uploads?dest_ext=${dest}`, credentials: true})
            // const response = await fetch(url, {method: "post", body: formdata})
            const response = await fetch(`http://localhost:3000/uploads?dest_ext=${dest}`, {method: "post", body: formdata})

            if(response.ok && response.status == 200) {
                const data = await response.json()
                if(!data.success) {
                    convert.style.visibility = "hidden"
                    file_label.style.visibility = "hidden"
                    filename.style.visibility = "hidden"
                    let span = document.createElement("span")
                    span.textContent = data.msg
                    span.style.color = "white"
                    area.appendChild(span)
                } else {
                    let a = document.createElement('a')
                    a.href = `${window.location.origin}/${data.url}`
                    convert.style.display = 'none'                    
                    a.style.borderRadius = "12px"
                    a.style.color = 'white'
                    a.style.backgroundColor = 'blue'
                    a.style.textDecorationLine = 'none'
                    a.style.justifySelf = 'center'
                    a.style.alignSelf = 'center'
                    a.text = "Download"
                    a.target = '_self'
                    area.appendChild(a)
                }
            }
            // window.location.assign(window.location.href)
        })

    })

    window.addEventListener('beforeunload', async () => {
        let response = await fetch('/deconnection')
        if(!response.ok || response.status == 200) {
            console.error(`error deconnection`)
        } else {
            console.log('deconnected')
        }
    })

    } catch(e) {
        console.log(`error: ${e}`)
}