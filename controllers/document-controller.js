// Import
const db = require("../models");
const _ = require("lodash");
const multer = require("multer");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
const path = require('path');
// Table File
const psdocmas = db.psdocmas
// Common Function
const returnError = require('../common/error');
const returnSuccess = require('../common/success');
const returnSuccessMessage = require('../common/successMessage');
const constant = require("../constant/generalConfig");

// Constant
const errorMsg = require("../constant/errorMessage");
const errorMsgCN = require("../constant/errorMessageCN");

exports.detail = async (req, res) => {
    let document = req.query.document ? req.query.document : '';
    if (_.isEmpty(document)) return returnError(req, 500, "RECORDIDISREQUIRED", res);

    let docmas = await psdocmas.findOne({
        where: {
            psdocfnm: req.query.document
        }, raw: true
    });
    if (!docmas) return returnError(req, 500, "DOCUMENTNOTFOUND", res);

    let DIR = "";
    let type = docmas.psdoctyp;
    if (type == 1) DIR = constant.documentTempPath;


    let outputpath = DIR + document;
    // Check in Temp Folder if Image exist
    let file = fs.existsSync(outputpath);
    if (file) {
        let filetype = document.substring(document.lastIndexOf(".") + 1, document.length);
        if (filetype == "mp4" || filetype == "wav") {
            let tempPath = DIR.substring(2, documentTempPath.length);
            const option = {
                root: path.join(tempPath),
                dotfiles: 'deny',
                headers: {
                    'x-timestamp': Date.now(),
                    'x-sent': true
                }
            }
            res.sendFile(document, option, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("FIle Sent: ", document);
                }
            });
        } else {
            switch (filetype) {
                case "jpg":
                case "jpeg":
                    res.set('Content-Type', 'image/jpeg');
                    break;
                case "png":
                    res.set('Content-Type', 'image/png');
                    break;
                case "pdf":
                    res.set('Content-Type', 'application/pdf');
                    break;
                case "csv":
                    res.set('Content-Type', 'text/csv');
                    break;
                case "xls":
                    res.set('Content-Type', 'application/vnd.ms-excel');
                    break;
                case "xlsx":
                    res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    break;
                case "ppt":
                    res.set('Content-Type', 'application/vnd.ms-powerpoint');
                    break;
                case "pptx":
                    res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
                    break;
                case "txt":
                    res.set('Content-Type', 'text/plain');
                    break;
                case "doc":
                    res.set('Content-Type', 'application/msword');
                    break;
                case "docx":
                    res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
                    break;
                default:
                    break;
            }

            rs = fs.createReadStream(outputpath);
            rs.on("error", function (err) {
                if (err) {
                    console.log(err);
                    return returnError(req, 500, "UNEXPECTEDERROR", res);
                }
            });
            rs.pipe(res);
        }
    } else return returnError(req, 500, "DOCUMENTNOTFOUND", res);
}

exports.upload = async (req, res) => {
    try {
        // Declaration
        const documentTempPath = constant.documentTempPath;

        const storage_temp = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, documentTempPath);
            },
            filename: (req, file, cb) => {
                let ext = "";//path.extname(file.originalname);
                let filetype = file.mimetype;
                switch (filetype) {
                    case "image/jpg":
                    case "image/jpeg":
                        ext = ".jpg"
                        break;
                    case "image/png":
                        ext = ".png"
                        break;
                    case "video/mp4":
                    case "video/quicktime":
                        ext = ".mp4";
                        break;
                    case "text/csv":
                    case "text/comma-separated-values":
                        ext = ".csv";
                        break;
                    case "application/vnd.ms-excel":
                        ext = ".xls";
                        break;
                    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                        ext = ".xlsx";
                        break;
                    case "application/pdf":
                        ext = ".pdf";
                        break
                    case "application/vnd.ms-powerpoint":
                        ext = ".ppt";
                        break;
                    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                        ext = ".pptx";
                        break;
                    case "text/plain":
                        ext = ".txt";
                        break;
                    case "audio/wav":
                        ext = ".wav";
                        break;
                    case "application/msword":
                        ext = ".doc";
                        break;
                    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                        ext = ".docx";
                        break;
                    default:
                        ext = "";
                        break;
                }
                cb(null, uuidv4() + ext.toString().toLowerCase())
            },
            onError: function (err, next) {
                next(err);
            }
        });

        const upload_temp = multer({
            storage: storage_temp,
            // limits: {
            //     fileSize: 50000000
            // },
            fileFilter: (req, file, cb) => {
                let fileType = file.mimetype;
                let isJpeg = fileType == "image/jpg"
                    || fileType == "image/jpeg" || fileType == "image/png"
                    || fileType == "video/mp4" || fileType == "video/quicktime"
                    || fileType == "application/vnd.ms-excel" || fileType == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    || fileType == "text/csv" || fileType == "text/comma-separated-values" || fileType == "application/pdf" || fileType == "application/vnd.ms-powerpoint"
                    || fileType == "application/vnd.ms-powerpoint" || fileType == "application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    || fileType == "text/plain" || fileType == "audio/wav" || fileType == "application/msword" || fileType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

                if (!isJpeg) {
                    cb(null, false);
                    console.log('Only .png, .jpg .jpeg .pdf .csv .xls .xlsx and .mp4 format allowed!');
                    return returnError(req, 500, "INVALIDFILETYPE", res);
                } else cb(null, true);
            }
        }).fields([{ name: 'document', maxCount: 1 }]);

        upload_temp(req, res, async (err) => {
            if (err) {
                if (err.code == "LIMIT_FILE_SIZE") return returnError(req, 500, "INVALIDFILELENGTH&50", res)
                else {
                    console.log(err)
                    return returnError(req, 500, "UNEXPECTEDERROR", res);
                }
            }
            console.log("Req.Files", req.files);
            let prdmainfile = req.files.document;
            let inputpath = "";

            if (!_.isEmpty(prdmainfile)) {
                if (prdmainfile.length > 1) return returnError(req, 400, { images: "MAXDOCUMENTUPLOAD&1" }, res);
                let prdmainfilename = prdmainfile[0].filename;
                let orgfnm = prdmainfile[0].originalname
                let filetype = prdmainfile[0].mimetype;
                let ext = "";
                let path = "";
                let rawtype = "";
                switch (filetype) {
                    case "image/jpg":
                    case "image/jpeg":
                        ext = ".jpg";
                        rawtype = "image";
                        break;
                    case "image/png":
                        ext = ".png";
                        rawtype = "image";
                        break;
                    case "video/mp4":
                    case "video/quicktime":
                        ext = ".mp4";
                        rawtype = "video";
                        break;
                    case "text/csv":
                    case "text/comma-separated-values":
                        ext = ".csv";
                        break;
                    case "application/vnd.ms-excel":
                        ext = ".xls";
                        break;
                    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                        ext = ".xlsx";
                        break;
                    case "application/pdf":
                        ext = ".pdf";
                        break;
                    case "application/vnd.ms-powerpoint":
                        ext = ".ppt";
                        break;
                    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                        ext = ".pptx";
                        break;
                    case "text/plain":
                        ext = ".txt";
                        break;
                    case "audio/wav":
                        ext = ".wav";
                        break;
                    case "application/msword":
                        ext = ".doc";
                        break;
                    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                        ext = ".docx";
                        break;
                    default:
                        ext = "";
                        rawtype = "image";
                        break;
                }

                // let newRows = {};
                inputpath = documentTempPath + prdmainfile[0].filename;
                let file_exist = fs.existsSync(inputpath);
                if (file_exist) {
                    let stat = fs.statSync(inputpath);
                    let file_size = stat.size;
                    if (rawtype == "image" && file_size > 10000000) {
                        let errmsg = "";
                        if (req.headers['locale'] && req.headers['locale'].toLowerCase() == 'zh') errmsg = errorMsgCN['INVALIDFILELENGTH'];
                        else errmsg = errorMsg['INVALIDFILELENGTH'];

                        errmsg = errmsg.split("&length");
                        return returnError(req, 500, "", res, "INVALIDFILELENGTH", errmsg[0] + "10" + errmsg[1]);
                    }
                    let sysfnm = prdmainfilename;
                    newRows = { sysfnm: sysfnm, orgfnm: orgfnm, ext: ext.toString().toLowerCase() }
                    await psdocmas.create({ psdocfnm: sysfnm, psdoconm: orgfnm, psdocudt: new Date(), psdocext: ext.toString().toLowerCase() })
                    console.log("Image is successfully uploaded")
                    return returnSuccess(200, { document: newRows }, res);
                } else return returnError(req, 500, "UNEXPECTEDERROR", res);
            }
        })
    } catch (err) {
        console.log("Upload Image Error", err);
    }
}

exports.remove = async (req, res) => {
    let document = req.query.document ? req.query.document : '';
    if (_.isEmpty(document)) return returnError(req, 500, "RECORDIDISREQUIRED", res);

    let DIR = constant.documentTempPath;
    let outputpath = DIR + document;
    // Check in Temp Folder if Image exist
    let file = fs.existsSync(outputpath);
    if (file) {
        fs.unlinkSync(outputpath);
        console.log("Document Deleted : " + document);
        return returnSuccessMessage(req, 200, "DOCUMENTREMOVED", res);
    } else return returnError(req, 500, "DOCUMENTNOTFOUND", res);
}

exports.bulk_upload = async (req, res) => {
    try {
        // Declaration
        const documentTempPath = constant.documentTempPath;

        const storage_temp = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, documentTempPath);
            },
            filename: (req, file, cb) => {
                let ext = "";//path.extname(file.originalname);
                let filetype = file.mimetype;
                switch (filetype) {
                    case "image/jpg":
                    case "image/jpeg":
                        ext = ".jpg"
                        break;
                    case "image/png":
                        ext = ".png"
                        break;
                    case "video/mp4":
                    case "video/quicktime":
                        ext = ".mp4";
                        break;
                    case "text/csv":
                    case "text/comma-separated-values":
                        ext = ".csv";
                        break;
                    case "application/vnd.ms-excel":
                        ext = ".xls";
                        break;
                    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                        ext = ".xlsx";
                        break;
                    case "application/pdf":
                        ext = ".pdf";
                        break
                    case "application/vnd.ms-powerpoint":
                        ext = ".ppt";
                        break;
                    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                        ext = ".pptx";
                        break;
                    case "text/plain":
                        ext = ".txt";
                        break;
                    case "audio/wav":
                        ext = ".wav";
                        break;
                    case "application/msword":
                        ext = ".doc";
                        break;
                    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                        ext = ".docx";
                        break;
                    default:
                        ext = "";
                        break;
                }
                cb(null, uuidv4() + ext.toString().toLowerCase())
            },
            onError: function (err, next) {
                next(err);
            }
        });

        const upload_temp = multer({
            storage: storage_temp,
            // limits: {
            //     fileSize: 50000000
            // },
            fileFilter: (req, file, cb) => {
                let fileType = file.mimetype;
                let isJpeg = fileType == "image/jpg"
                    || fileType == "image/jpeg" || fileType == "image/png"
                    || fileType == "video/mp4" || fileType == "video/quicktime"
                    || fileType == "application/vnd.ms-excel" || fileType == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    || fileType == "text/csv" || fileType == "text/comma-separated-values" || fileType == "application/pdf" || fileType == "application/vnd.ms-powerpoint"
                    || fileType == "application/vnd.ms-powerpoint" || fileType == "application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    || fileType == "text/plain" || fileType == "audio/wav" || fileType == "application/msword" || fileType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

                if (!isJpeg) {
                    cb(null, false);
                    console.log('Only .png, .jpg .jpeg .pdf .csv .xls .xlsx and .mp4 format allowed!');
                    return returnError(req, 500, "INVALIDFILETYPE", res);
                } else cb(null, true);
            }
        }).array('document');

        upload_temp(req, res, async (err) => {
            if (err) {
                console.log(err)
                return returnError(req, 500, "UNEXPECTEDERROR", res);
            }

            console.log("Req.Files", req.files);
            if (req.files.length < 1) return returnError(req, 500, "DOCUMENTISREQUIRED", res);

            let documents = req.files;
            let inputpath = "";
            let errors = {};
            let errIdx = 0;
            let successUploaded = [];
            for (var i = 0; i < documents.length; i++) {
                let doc = documents[i];

                let filename = doc.filename;
                let orgfnm = doc.originalname
                let filetype = doc.mimetype;
                let ext = "";
                let path = "";
                let rawtype = "";
                switch (filetype) {
                    case "image/jpg":
                    case "image/jpeg":
                        ext = ".jpg";
                        rawtype = "image";
                        break;
                    case "image/png":
                        ext = ".png";
                        rawtype = "image";
                        break;
                    case "video/mp4":
                    case "video/quicktime":
                        ext = ".mp4";
                        rawtype = "video";
                        break;
                    case "text/csv":
                    case "text/comma-separated-values":
                        ext = ".csv";
                        break;
                    case "application/vnd.ms-excel":
                        ext = ".xls";
                        break;
                    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                        ext = ".xlsx";
                        break;
                    case "application/pdf":
                        ext = ".pdf";
                        break;
                    case "application/vnd.ms-powerpoint":
                        ext = ".ppt";
                        break;
                    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                        ext = ".pptx";
                        break;
                    case "text/plain":
                        ext = ".txt";
                        break;
                    case "audio/wav":
                        ext = ".wav";
                        break;
                    case "application/msword":
                        ext = ".doc";
                        break;
                    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                        ext = ".docx";
                        break;
                    default:
                        ext = "";
                        rawtype = "image";
                        break;
                }

                // let newRows = {};
                inputpath = documentTempPath + filename;
                let file_exist = fs.existsSync(inputpath);
                if (file_exist) {
                    let stat = fs.statSync(inputpath);
                    let file_size = stat.size;

                    let isValidFormat = filetype == "image/jpg"
                        || filetype == "image/jpeg" || filetype == "image/png"
                        || filetype == "video/mp4" || filetype == "video/quicktime"
                        || filetype == "application/vnd.ms-excel" || filetype == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        || filetype == "text/csv" || filetype == "text/comma-separated-values" || filetype == "application/pdf" || filetype == "application/vnd.ms-powerpoint"
                        || filetype == "application/vnd.ms-powerpoint" || filetype == "application/vnd.openxmlformats-officedocument.presentationml.presentation"
                        || filetype == "text/plain" || filetype == "audio/wav" || filetype == "application/msword" || filetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

                    if (rawtype == "image" && file_size > 10000000) {
                        let errmsg = "";
                        if (req.headers['locale'] && req.headers['locale'].toLowerCase() == 'zh') errmsg = errorMsgCN['INVALIDFILELENGTH'];
                        else errmsg = errorMsg['INVALIDFILELENGTH'];
                        errmsg = errmsg.split("&length");

                        errIdx = (0 + i);
                        errors.code = "INVALIDFILELENGTH";
                        errors.msg = errmsg[0] + "10" + errmsg[1];
                        break;
                    } else if (!isValidFormat) {
                        console.log('Only .png, .jpg .jpeg .pdf .csv .xls .xlsx and .mp4 format allowed!');
                        errIdx = (0 + i);
                        errors.code = "INVALIDFILETYPE";
                        errors.msg = "NM";
                        break;
                    }
                    if (errIdx > 0) break;

                    let sysfnm = filename;
                    newRows = { sysfnm: sysfnm, orgfnm: orgfnm, ext: ext.toString().toLowerCase() }
                    console.log("File Uploaded -- <" + (i + 1) + ">", newRows);
                    successUploaded.push(newRows);
                    await psdocmas.create({ psdocfnm: sysfnm, psdoconm: orgfnm, psdocudt: new Date(), psdocext: ext.toString().toLowerCase() })

                    // return returnSuccess(200, { document: newRows }, res);
                } else {
                    errIdx = (0 + i);
                    errors.code = "UNEXPECTEDERROR";
                    errors.msg = "NM";
                    break;
                }
                if (errIdx > 0) break;
            }
            if (errIdx > 0) {
                if (errors.msg == "NM") return returnError(req, 500, errors.code, res);
                else return returnError(req, 500, "", res, errors.code, errors.msg);
            } else {
                return returnSuccess(200, { document: successUploaded }, res);
            }
        });
    } catch (err) {
        console.log("Upload Image Error", err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    }
}

exports.download = async (req, res) => {
    let filename = req.body.filename ? req.body.filename : "";
    if (!filename || filename == "")
        return returnError(req, 500, "RECORDIDISREQUIRED", res);

    // Find File
    psdocmas.findOne({
        where: {
            psdocfnm: filename
        }, raw: true
    }).then(async (file) => {
        if (file) {
            let DIR = await get_document_path(file.psdoctyp);

            if (file.psdoctyp == "1") DIR = constant.documentTempPath;
            else if (file.psdoctyp == "2") DIR = constant.staffImagePath;
            else if (file.psdoctyp == "3") DIR = constant.merchantImagePath;
            else if (file.psdoctyp == "4") DIR = constant.ssmImagePath;
            else if (file.psdoctyp == "5") DIR = constant.productImagePath;
            else if (file.psdoctyp == "6") DIR = constant.announcementImg;

            if (!fs.existsSync(DIR + filename)) return returnError(req, 500, "DOCUMENTNOTFOUND", res);
            else {
                let phyFile = `${DIR}${filename}`;
                let filetype = filename.substring(filename.lastIndexOf(".") + 1, filename.length);
                switch (filetype) {
                    case "jpg":
                    case "jpeg":
                        res.set('Content-Type', 'image/jpeg');
                        break;
                    case "png":
                        res.set('Content-Type', 'image/png');
                        break;
                    case "pdf":
                        res.set('Content-Type', 'application/pdf');
                        break;
                    case "csv":
                        res.set('Content-Type', 'text/csv');
                        break;
                    case "xls":
                        res.set('Content-Type', 'application/vnd.ms-excel');
                        break;
                    case "xlsx":
                        res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                        break;
                    case "ppt":
                        res.set('Content-Type', 'application/vnd.ms-powerpoint');
                        break;
                    case "pptx":
                        res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
                        break;
                    case "txt":
                        res.set('Content-Type', 'text/plain');
                        break;
                    case "doc":
                        res.set('Content-Type', 'application/msword');
                        break;
                    case "docx":
                        res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
                        break;
                    default:
                        break;
                }

                res.download(phyFile, file.psdoconm);
            }
        } else return returnError(req, 500, "DOCUMENTNOTFOUND", res);
    })
};

function get_document_path(type) {
    return new Promise((resolve, reject) => {
        let DIR = "";
        if (type == 1) DIR = constant.documentTempPath;

        return resolve(DIR);
    })
}
