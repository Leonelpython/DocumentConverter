import { error } from "console"
import fs from "fs"
import PDFDocument from "pdfkit"
import { PDFParse } from "pdf-parse"
import { Document, Paragraph, Packer, TextRun, PageOrientation} from "docx"
import WordExtractor from "word-extractor"

export async function txt_pdf(file_path, dest_path) {
    fs.readFile(file_path, async (err, data) => {
        if (err) {
            console.error(`error txt_docx: ${err}`)
        } else {
            await del(file_path)
            WritePdf(data, dest_path)
        }
    })
}

export async function pdf_txt(file_path, dest_path) {
    let text = await ReadPdf(file_path)
    await del(file_path)
    fs.writeFile(dest_path, text, (err) => {
        if (err) {
            console.error(`error txt_docx: ${err}`)
        }
    })
}

export async function txt_docx(file_path, dest_path) {
    fs.readFile(file_path, async (err, data) => {
        if (err) {
            console.error(`error txt_docx: ${err}`)
        } else {
            await del(file_path)
            await WriteTxtDocx(data, dest_path)
        }
    })
}

export async function docx_txt(file_path, dest_path) {
    let extracted = await ReadDocxTxt(file_path)
    extracted.then((doc) => {
        fs.writeFile(dest_path, doc.getBody(), (err) => {
            if(err) {
                console.error("error writing docx to text file")
            } else {
                console.log(`text file wrote: ${dest_path}`)
            }
        })
    }).catch((e) => {
        console.error(`error extracted docx to text: ${e}`)
    })
}

export async function pdf_docx(file_path, dest_path) {
    let pages = await ReadPdfDocx(file_path)
    console.log(`info: ${JSON.stringify(pages)}`)
}

export async function docx_pdf(file_path, dest_path) {
    
}

// READ WRITE

async function ReadPdf(file_path) {
    if(!fs.existsSync(file_path)) {
        throw new error(`bad path: ${file_path}`)
    } else {
        let pdf = new PDFParse({url: file_path})
        let text = await pdf.getText()
        return text.text
    }
}


async function WritePdf(data, dest_path) {
    const doc = new PDFDocument()
    doc.pipe(fs.createWriteStream(dest_path))
    doc.text(data, 100, 100).save().end()
}

async function ReadDocxTxt(file_path) {
    if(!fs.existsSync(file_path)) {
        throw new error(`bad path: ${file_path}`)
    } else {
        let extractor = new WordExtractor()
        let extracted = extractor.extract(file_path)
        return extracted
    }
}

async function WriteTxtDocx(data, dest_path) {
    // data = String(data).split('\n')
    // let paragraphs = await iter(data)

    data = String(data).split('\n')
    let paragraphs = await iter(data)

    const doc = new Document({
        sections: [
            {
                children: paragraphs
            },
        ],
    });

    Packer.toBuffer(doc)
    .then((buffer) => {
        fs.writeFileSync(dest_path, buffer);
    }).catch((error) => {
        throw new error(`error writing txt docx: ${error}`)
    })
}

// PROCESS DATA

// async function iter(data) {
//     let paragraphs = []
//     data.map((item) => {
//         paragraphs.push(new Paragraph(
//             {
//                 children: [
//                     new TextRun(item)
//                 ]
//             }
//         ))
//     })
//     return paragraphs
// }

async function iter(data) {
    let paragraphs = []
    let par = {
        children: []
    }
    data.map((p) => {
        let tab = p.split('\t')
        let word = ''
        if(tab.length > 1) {
            tab.map((t) => {
                word = t.split(' ')
                word.map((w) => {
                    par['children'].push(new TextRun(w + ' '))
                })
            })
            par['children'].push(new TextRun('\t'))
        } else {
            word = p.split(' ')
            word.map((w) => {
                par['children'].push(new TextRun(w + ' '))
            })
        }
        paragraphs.push(new Paragraph(par))
        par['children'] = []
    })
    return paragraphs
}

// DEL FILEPATH

async function del(src) {
    if(fs.existsSync(src)) {
        fs.rm(src, {recursive: true}, (err) => {
            if (err) {
                console.error(`error removing file: ${err}`)
            } else {
                console.log(`path ${src} removed`)
            }
        })
    }
}

async function ReadPdfDocx(file_path) {
    let parser = new PDFParse({url: file_path})
    let info = parser.getInfo({parsePageInfo: true})
    return info["total"]
}

// async function WritePdfDocx(info, data, dest_path) {
//     let paragraphs = []
//     paragraphs = new Paragraph({
        
//     })
//     const doc = new Document({
//         sections: [
//             {
//                 properties: {
//                     page: {
//                         size: PageOrientation.PORTRAIT,
//                         pageNumbers: {
//                             start: 1,
                            
//                         }
//                     }
//                 },
//                 children: 
//             }
//         ]
//     })
// }