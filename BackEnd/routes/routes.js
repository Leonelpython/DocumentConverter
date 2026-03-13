import express from "express"
import path from "path"
import fs from "fs"
import multer from "multer";
import { txt_docx, pdf_docx, txt_pdf, pdf_txt, docx_txt } from "../process/process.js"

const router = express.Router()

const upload = multer({dest: 'uploads/'})

router.get('/dest/:user/:id', (req, res) => {
    const {id} = req.params
    // id = id.slice(id.lastIndexOf("_"), id.lastIndexOf("."))
    const filepath = path.resolve(`dest/${req.session.username}/${id}`)
    res.sendFile(filepath, (err) => {
        if(err) {
            console.error(`file not found: ${err} - ${filepath}`)
            res.status(404).send("File Not Found")
        } else {
            console.log(`file sent: ${filepath}`)
        }
    })
})

router.get('/dest/:id', (req, res) => {
    if(!req.session.username) {
        console.error('User Not Authenticated')
        res.send("User Not Authenticated")
    }
    const {id} = req.params
    res.redirect(`/dest/${req.session.username}/${id}`)
})

router.post('/uploads', upload.single("file"), (req, res) => {
    console.log(`file: ${JSON.stringify(req.file)}`)
    let ext_src = req.file.originalname
    ext_src = ext_src.substring(ext_src.lastIndexOf(".")+1, ext_src[-1])
    const {dest_ext} = req.query
    let filepath = req.file.path.replace('\\', '/')

    fs.rename(filepath, `${filepath}.${ext_src}`, (err) => {
        if(err) {
            console.error('error renaming file')
        } else {
            console.log(`file renamed: ${filepath}`)
        }
    })
    filepath = `${filepath}.${ext_src}`
    const filename = req.file.originalname.substring(0, req.file.originalname.lastIndexOf("."))
    if(!fs.existsSync(`dest/${req.session.username}`)) {
        fs.mkdir(`dest/${req.session.username}`, {recursive: true}, (err) => {
            if(err) {
                throw new error(`error: ${err}`)
            }
        })
    }
    const dest_to_send = path.join(`dest/${filename}_${req.file.filename.replace('_','')}.${dest_ext}`).replace('\\', '/')
    const dest = path.join(`dest/${req.session.username}/${filename}_${req.file.filename.replace('_','')}.${dest_ext}`).replace('\\', '/')

    console.log(`user upload: ${req.sessionID}`)

    console.log(`dest: ${dest}`)

    const mimetype = req.file.mimetype
    console.log(`mime: ${mimetype}`)

    if (ext_src == "txt" && dest_ext == "pdf") {
        txt_pdf(filepath, dest)
    }

    if (ext_src == "txt" && dest_ext == "docx") {
        txt_docx(filepath, dest)
    }

    if (ext_src == "pdf" && dest_ext == "txt") {
        pdf_txt(filepath, dest)
    }

    if (ext_src == "pdf" && dest_ext == "docx") {
        pdf_docx(filepath, dest)
    }

    if (ext_src == "docx" && dest_ext == "txt") {
        docx_txt(filepath, dest)
    }

    if (ext_src == "docx" && dest_ext == "pdf") {
        docx_pdf(filepath, dest)
    }

    // if(mimetype != "pdf/plain" || mimetype!= "docx/plain" || mimetype!= "text/plain") {
    if(!ext_src in ["pdf", "txt", "docx"]) {
        res.json({success: false, msg: "file not supported"})
    } else {
        res.json({success: true, url: dest_to_send})
        console.log(`file sent: ${dest_to_send}`)
    }
})

router.get('/deconnection', (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            console.error('failed destroying session')
        }
    })
    console.log('session destroyed')
})

export default router