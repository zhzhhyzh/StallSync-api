// Import
const db = require("../models");
const _ = require('lodash');

// Table File
const prfuncde = db.prfuncde;
const prgentyp = db.prgentyp;
const prgencde = db.prgencde;

// Common Function
const Op = db.Sequelize.Op;
const returnError = require('../common/error');
const returnSuccess = require('../common/success');
const returnSuccessMessage = require('../common/successMessage');
const common = require('../common/common');

// Input Validation
const validateFuncdeInput = require('../validation/funcde-validation');

// Internal Function
async function formatData(data, sequence, obj) {
    return new Promise((resolve, reject) => {
        switch (sequence) {
            case 0:
                if (data.label != '') {
                    obj.prfuna01 = data.status;
                    obj.prfunl01 = data.key;
                } else {
                    obj.prfuna01 = false;
                    obj.prfunl01 = '';
                }
                break;
            case 1:
                if (data.label != '') {
                    obj.prfuna02 = data.status;
                    obj.prfunl02 = data.key;
                } else {
                    obj.prfuna02 = false;
                    obj.prfunl02 = '';
                }
                break;
            case 2:
                if (data.label != '') {
                    obj.prfuna03 = data.status;
                    obj.prfunl03 = data.key;
                } else {
                    obj.prfuna03 = false;
                    obj.prfunl03 = '';
                }
                break;
            case 3:
                if (data.label != '') {
                    obj.prfuna04 = data.status;
                    obj.prfunl04 = data.key;
                } else {
                    obj.prfuna04 = false;
                    obj.prfunl04 = '';
                }
                break;
            case 4:
                if (data.label != '') {
                    obj.prfuna05 = data.status;
                    obj.prfunl05 = data.key;
                } else {
                    obj.prfuna05 = false;
                    obj.prfunl05 = '';
                }
                break;
            case 5:
                if (data.label != '') {
                    obj.prfuna06 = data.status;
                    obj.prfunl06 = data.key;
                } else {
                    obj.prfuna06 = false;
                    obj.prfunl06 = '';
                }
                break;
            case 6:
                if (data.label != '') {
                    obj.prfuna07 = data.status;
                    obj.prfunl07 = data.key;
                } else {
                    obj.prfuna07 = false;
                    obj.prfunl07 = '';
                }
                break;
            case 7:
                if (data.label != '') {
                    obj.prfuna08 = data.status;
                    obj.prfunl08 = data.key;
                } else {
                    obj.prfuna08 = false;
                    obj.prfunl08 = '';
                }
                break;
            case 8:
                if (data.label != '') {
                    obj.prfuna09 = data.status;
                    obj.prfunl09 = data.key;
                } else {
                    obj.prfuna09 = false;
                    obj.prfunl09 = '';
                }
                break;
            case 9:
                if (data.label != '') {
                    obj.prfuna10 = data.status;
                    obj.prfunl10 = data.key;
                } else {
                    obj.prfuna10 = false;
                    obj.prfunl10 = '';
                }
                break;
            default: break;
        }
        return resolve(obj);
    }).catch(err => {
        console.log(err);
        return reject(err);
    });
}

exports.list = async (req, res) => {
    let limit = 10;
    if (req.query.limit) limit = req.query.limit;

    let from = 0;
    if (!req.query.page) from = 0;
    else from = parseInt(req.query.page) * parseInt(limit);

    let option = {};
    if (req.query.search) {
        option = {
            [Op.or]: [
                { prfuncde: { [Op.like]: '%' + req.query.search + '%' } },
                { prfuncde: req.query.search },
                { prfunnme: { [Op.like]: '%' + req.query.search + '%' } },
                { prfunnme: req.query.search }
            ]
        }
        // from = 0;
    } 
    // else {
    //     option = {
    //         prfuncde: { [Op.like]: '%%' }
    //     }
 
    if(req.query.prfungrp){
        option.prfungrp = req.query.prfungrp
    }

    const { count, rows } = await prfuncde.findAndCountAll({
        limit: parseInt(limit),
        offset: from,
        where: option,
        order:[["prfuncde","ASC"]],
        raw: true
    });

    let newRows = [];
    for (var i = 0; i < rows.length; i++) {
        let obj = rows[i];

        let fungrp = {};
        !_.isEmpty(obj.prfungrp) ? fungrp = await common.retrieveSpecificGenCodes(req, 'FUNGRP', obj.prfungrp) : fungrp = {};

        let funact = [];
        obj.prfunl01 != '' ?
            funact.push({ key: 'prfuna01', label: obj.prfunl01, status: obj.prfuna01 }) : '';
        obj.prfunl02 != '' ?
            funact.push({ key: 'prfuna02', label: obj.prfunl02, status: obj.prfuna02 }) : '';
        obj.prfunl03 != '' ?
            funact.push({ key: 'prfuna03', label: obj.prfunl03, status: obj.prfuna03 }) : '';
        obj.prfunl04 != '' ?
            funact.push({ key: 'prfuna04', label: obj.prfunl04, status: obj.prfuna04 }) : '';
        obj.prfunl05 != '' ?
            funact.push({ key: 'prfuna05', label: obj.prfunl05, status: obj.prfuna05 }) : '';
        obj.prfunl06 != '' ?
            funact.push({ key: 'prfuna06', label: obj.prfunl06, status: obj.prfuna06 }) : '';
        obj.prfunl07 != '' ?
            funact.push({ key: 'prfuna07', label: obj.prfunl07, status: obj.prfuna07 }) : '';
        obj.prfunl08 != '' ?
            funact.push({ key: 'prfuna08', label: obj.prfunl08, status: obj.prfuna08 }) : '';
        obj.prfunl09 != '' ?
            funact.push({ key: 'prfuna09', label: obj.prfunl09, status: obj.prfuna09 }) : '';
        obj.prfunl10 != '' ?
            funact.push({ key: 'prfuna10', label: obj.prfunl10, status: obj.prfuna10 }) : '';

        newRows.push({
            id: obj.prfuncde,
            prfuncde: obj.prfuncde,
            prfunnme: obj.prfunnme,
            prfunlnm: obj.prfunlnm,
            prfunsts: obj.prfunsts,
            prfungrp: obj.prfungrp,
            prfungrpdsc: fungrp.prgedesc ? fungrp.prgedesc : '',
            prfunact: funact
        });
    }

    // let add = await common.checkAction(req.user, 'prfuncde', 'add');
    // let edit = await common.checkAction(req.user, 'prfuncde', 'edit');
    // let del = await common.checkAction(req.user, 'prfuncde', 'delete');

    if (count > 0) return returnSuccess(200, { total: count, data: newRows, extra: { file: 'prfuncde', key: ['prfuncde'] } }, res);
    else return returnSuccess(200, { total: 0, data: [], extra: { file: 'prfuncde', key: ['prfuncde'] } }, res);
}

exports.findOne = async (req, res) => {
    const id = req.query.id;
    if (!req.query.id) return returnError(req, 500, "RECORDIDISREQUIRED", res);
    else {
        await prfuncde.findOne({
            where: {
                prfuncde: id
            }, raw: true
        }).then(async funcde => {
            if (funcde) {
                let funact = [];
                let funcode = [];

                if (funcde.prfunl01 != '') {
                    funact.push({ key: funcde.prfunl01, label: funcde.prfunl01, status: funcde.prfuna01 });
                    funcode.push(funcde.prfunl01);
                }
                if (funcde.prfunl02 != '') {
                    funact.push({ key: funcde.prfunl02, label: funcde.prfunl02, status: funcde.prfuna02 })
                    funcode.push(funcde.prfunl02);
                }
                if (funcde.prfunl03 != '') {
                    funact.push({ key: funcde.prfunl03, label: funcde.prfunl03, status: funcde.prfuna03 })
                    funcode.push(funcde.prfunl03);
                }
                if (funcde.prfunl04 != '') {
                    funact.push({ key: funcde.prfunl04, label: funcde.prfunl04, status: funcde.prfuna04 })
                    funcode.push(funcde.prfunl04);
                }
                if (funcde.prfunl05 != '') {
                    funact.push({ key: funcde.prfunl05, label: funcde.prfunl05, status: funcde.prfuna05 })
                    funcode.push(funcde.prfunl05);
                }
                if (funcde.prfunl06 != '') {
                    funact.push({ key: funcde.prfunl06, label: funcde.prfunl06, status: funcde.prfuna06 })
                    funcode.push(funcde.prfunl06);
                }
                if (funcde.prfunl07 != '') {
                    funact.push({ key: funcde.prfunl07, label: funcde.prfunl07, status: funcde.prfuna07 })
                    funcode.push(funcde.prfunl07);
                }
                if (funcde.prfunl08 != '') {
                    funact.push({ key: funcde.prfunl08, label: funcde.prfunl08, status: funcde.prfuna08 })
                    funcode.push(funcde.prfunl08);
                }
                if (funcde.prfunl09 != '') {
                    funact.push({ key: funcde.prfunl09, label: funcde.prfunl09, status: funcde.prfuna09 })
                    funcode.push(funcde.prfunl09);
                }
                if (funcde.prfunl10 != '') {
                    funact.push({ key: funcde.prfunl10, label: funcde.prfunl10, status: funcde.prfuna10 });
                    funcode.push(funcde.prfunl10);
                }

                // Get Available Actions
                let type = await prgentyp.findOne({
                    where: {
                        prgtycde: 'FUNACT'
                    }, raw: true
                });
                if (type) {
                    avl_funcde = await prgencde.findAll({
                        where: {
                            prgtycde: type.prgtycde,
                            prgecode: {
                                [Op.not]: funcode
                            }
                        }, raw: true, attributes: [['prgecode', 'key'], ['prgedesc', 'label']]
                    });
                } else avl_funcde = [];

                // Get Function Action Description
                let formatted_funact = [];
                for (var i = 0; i < funact.length; i++) {
                    let obj = funact[i];
                    if (!_.isEmpty(obj.label)) {
                        let act = await common.retrieveSpecificGenCodes(req, 'FUNACT', obj.label);
                        if (act) act.prgedesc ? obj.label = act.prgedesc : '';
                    }
                    formatted_funact.push(obj);
                }

                // Get Function Group Description
                let fungrp = {};
                fungrp = await common.retrieveSpecificGenCodes(req, 'FUNGRP', funcde.prfungrp);

                return returnSuccess(200, {
                    id: funcde.prfuncde,
                    prfuncde: funcde.prfuncde,
                    prfunnme: funcde.prfunnme,
                    prfunlnm: funcde.prfunlnm ? funcde.prfunlnm : '',
                    prfunsts: funcde.prfunsts,
                    prfungrp: funcde.prfungrp,
                    prfungrpdsc: fungrp.prgedesc ? fungrp.prgedesc ? fungrp.prgedesc : '' : '',
                    prfunact: formatted_funact,
                    pravlact: avl_funcde
                }, res);
            } else return returnError(req, 500, 'NORECORDFOUND', res);
        }).catch(err => {
            console.log(err);
            return returnError(req, 500, "UNEXPECTEDERROR", res);
        });
    }
}

exports.create = async (req, res) => {
    //Validation
    const { errors, isValid } = validateFuncdeInput(req.body, 'A');
    if (!isValid) return returnError(req, 400, errors, res);

    // Format Incoming Data
    let funact = req.body.prfunact;
    let new_funact = {};
    for (var i = 0; i < funact.length; i++) {
        let obj = funact[i];
        if (obj.key != '') new_funact = await formatData(obj, i, new_funact);
    }

    prfuncde.findOne({
        where: {
            prfuncde: req.body.prfuncde
        }, raw: true
    }).then(gentyp => {
        if (gentyp) return returnError(req, 400, { prfuncde: "RECORDEXISTS" }, res);
        else {
            req.body.prcrtuser = req.user.psusrunm;
            new_funact.prfuncde = req.body.prfuncde;
            new_funact.prfunnme = req.body.prfunnme;
            new_funact.prfunlnm = req.body.prfunlnm;
            new_funact.prfungrp = req.body.prfungrp;

            prfuncde.create(new_funact).then(data => {
                let created = data.get({ plain: true });
                common.writeMntLog('prfuncde', null, null, created.prfuncde, 'A', req.user.psusrunm);
                return returnSuccessMessage(req, 200, "RECORDCREATED", res);
            }).catch(err => {
                console.log(err);
                return returnError(req, 500, "UNEXPECTEDERROR", res);
            });
        }
    }).catch(err => {
        console.log(err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
}

exports.update = async (req, res) => {
    //Validation
    const { errors, isValid } = validateFuncdeInput(req.body, 'C');
    if (!isValid) return returnError(req, 400, errors, res);

    let grp = await common.retrieveSpecificGenCodes(req, 'FUNGRP', req.body.prfungrp);
    if (!grp) return returnError(req, 400, { prfungrp: 'FUNGRPNOTFOUND' }, res);
    const id = req.body.id;
    await prfuncde.findOne({
        where: {
            prfuncde: id
        }, raw: true, attributes: { exclude: ['prmntusr', 'updatedAt', 'createdAt'] }
    }).then(async funcde => {
        if (funcde) {
            if (req.body.prfuncde && req.body.prfuncde != funcde.prfuncde) return returnError(req, 400, { prfuncde: 'FUNCDECANTBECHANGE' }, res);

            let new_funcde = {
                prfunnme: req.body.prfunnme,
                prfunlnm: req.body.prfunlnm,
                prmntusr: req.user.psusrunm,
                prfunsts: req.body.prfunsts,
                prfungrp: req.body.prfungrp
            }

            // Format Incoming Data
            let funact = req.body.prfunact;
            for (var i = 0; i < 10; i++) {
                let obj = funact[i];
                if (!obj) obj = { label: '' };
                new_funcde = await formatData(obj, i, new_funcde);
            }

            prfuncde.update(new_funcde,
                {
                    where: {
                        id: funcde.id
                    }
                }).then(async () => {
                    common.writeMntLog('prfuncde', funcde, await prfuncde.findByPk(funcde.id, { raw: true }), funcde.prfuncde, 'C', req.user.psusrunm);
                    return returnSuccessMessage(req, 200, "RECORDUPDATED", res);
                }).catch(err => {
                    return returnError(req, 500, "UNEXPECTEDERROR", res);
                });
        } else {
            return returnError(req, 500, "NORECORDFOUND", res);
        }
    });
}

exports.delete = (req, res) => {
    const id = req.body.id;
    if (!id) return returnError(req, 500, "RECORDIDISREQUIRED", res);
    prfuncde.findOne({
        where: {
            prfuncde: id
        }, raw: true
    }).then(funcde => {
        if (funcde) {
            prfuncde.destroy({
                where: { id: funcde.id }
            }).then(() => {
                common.writeMntLog('prfuncde', null, null, funcde.prfuncde, 'D', req.user.psusrunm);
                return returnSuccessMessage(req, 200, "RECORDDELETED", res);
            }).catch(err => {
                console.log(err);
                return returnError(req, 500, "UNEXPECTEDERROR", res);
            });
        } else return returnError(req, 500, "NORECORDFOUND", res);
    }).catch(err => {
        console.log(err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
}
