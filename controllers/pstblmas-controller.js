// Import
const db = require("../models");
const _ = require("lodash");

// Table File
const pstblmas = db.pstblmas;
const pstblkey = db.pstblkey;

// Common Function
const Op = db.Sequelize.Op;
const returnError = require('../common/error');
const fieldNames = require("../constant/fieldNames");
const returnSuccess = require('../common/success');
const returnSuccessMessage = require('../common/successMessage');
const common = require('../common/common');

// Input Validation
const validateTblmasInput = require('../validation/pstblmas-validation');

exports.list = async (req, res) => {
    let limit = 10;
    if (req.query.limit) limit = req.query.limit;

    let from = 0;
    if (!req.query.page) from = 0;
    else from = parseInt(req.query.page) * parseInt(limit);

    let option = {};
    if (req.query.search || !_.isEmpty(req.query.search)) {
        option = {
            [Op.or]: [
                { pstblnme: { [Op.eq]: req.query.search } },
                { pstblnme: { [Op.like]: '%' + req.query.search + '%' } },
                { pstbldsc: { [Op.eq]: req.query.search } },
                { pstbldsc: { [Op.like]: '%' + req.query.search + '%' } },
            ]
        }
    }

    if (req.query.pstbltyp && !_.isEmpty(req.query.pstbltyp)) option.pstbltyp = req.query.pstbltyp;
    if (req.query.pstblpnt && !_.isEmpty(req.query.pstblpnt)) {
        option.pstblpnt = {
            [Op.or]: [
                { [Op.eq]: req.query.pstblpnt },
                { [Op.like]: '%' + req.query.pstblpnt + '%' }
            ]
        }
    }

    const { count, rows } = await pstblmas.findAndCountAll({
        limit: parseInt(limit),
        offset: from,
        where: option,
        order: [['pstblnme', 'ASC']],
        raw: true,
        attributes: [['pstblnme', 'id'], 'pstblnme', 'pstbltyp', 'pstbldsc', 'pstblpnt']
    });

    let newRows = [];
    for (var i = 0; i < rows.length; i++) {
        let obj = rows[i];
        if (!_.isEmpty(obj.pstbltyp)) {
            let tbltyp = await common.retrieveSpecificGenCodes(req, 'TBLTYPE', obj.pstbltyp);
            obj.pstbltypdsc = tbltyp.prgedesc ? tbltyp.prgedesc : '';
        }

        if (!_.isEmpty(obj.pstblpnt)) {
            let ptable = await pstblmas.findOne({
                where: {
                    pstblnme: obj.pstblpnt
                }, raw: true, attributes: ['pstbldsc']
            });
            if (ptable) obj.pstblpntdsc = ptable.pstbldsc;
            else obj.pstblpntdsc = "";
        }

        newRows.push(obj);
    }

    if (count > 0) return returnSuccess(200, { total: count, data: newRows, extra: { file: 'pstblmas', key: ['pstblnme'] } }, res);
    else return returnSuccess(200, { total: 0, data: [] }, res);
}

exports.findOne = async (req, res) => {
    if (!req.query.id) return returnError(req, 500, "RECORDIDISREQUIRED", res);
    else {
        await pstblmas.findOne({
            where: {
                pstblnme: req.query.id
            }, raw: true
        }).then(async found => {
            if (found) {
                // if (!_.isEmpty(found.pstbltyp)) {
                //     let tbltyp = await common.retrieveSpecificGenCodes(req, 'TBLTYPE', found.pstbltyp);
                //     found.pstbltypdsc = tbltyp.prgedesc ? tbltyp.prgedesc : '';
                // }

                return returnSuccess(200, found, res);
            } else return returnError(req, 500, 'NORECORDFOUND', res);
        }).catch(err => {
            console.log(err);
            return returnError(req, 500, "UNEXPECTEDERROR", res);
        });
    }
}

exports.create = async (req, res) => {
    //Validation
    const { errors, isValid } = validateTblmasInput(req.body, 'A');
    if (!isValid) return returnError(req, 400, errors, res);

    const description1 = await common.retrieveSpecificGenCodes(req, 'TBLTYPE', req.body.pstbltyp);
    if (!description1 || _.isEmpty(description1.prgedesc)) {
        return returnError(req, 400, { pstbltyp: "INVALIDDATAVALUE" }, res);
    }

    // let findFN = fieldNames[req.body.pstblkey];
    // if (!findFN) {
    //     console.log("Field key is not exist.");
    //     return returnError(req, 500, "NORECORDFOUND", res);
    // };

    let pstblpnt = req.body.pstblpnt;
    if (pstblpnt) {
        let ptable = await pstblmas.findOne({
            where: {
                pstblnme: req.body.pstblpnt
            }, raw: true
        });
        if (!ptable) return returnError(req, 400, { pstblpnt: "INVALIDDATAVALUE" }, res);
        // let findPNT = fieldNames[req.body.pstblpnt];
        // if (!findPNT) {
        //     console.log("Parent File Name Not Found");
        //     return returnError(req, 500, "NORECORDFOUND", res);
        // };
    };
    // const findField = await fieldNames.pswrswkh

    pstblmas.findOne({
        where: {
            pstblnme: req.body.pstblnme
        }, raw: true
    }).then(found => {
        if (found) return returnError(req, 400, { pstblnme: "RECORDEXISTS" }, res);
        else {
            const new_found = {
                pstblnme: req.body.pstblnme,
                pstbldsc: req.body.pstbldsc,
                pstbllds: req.body.pstbllds,
                pstblpnt: req.body.pstblpnt,
                pstbltyp: req.body.pstbltyp,
                crtuser: req.user.psusrunm,
                mntuser: req.user.psusrunm
            }

            pstblmas.create(new_found).then(data => {
                let created = data.get({ plain: true });
                common.writeMntLog('pstblmas', null, null, created.pstblnme, 'A', req.user.psusrunm, "", created.pstblnme);
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
    const { errors, isValid } = validateTblmasInput(req.body, 'C');
    if (!isValid) return returnError(req, 400, errors, res);

    const description1 = await common.retrieveSpecificGenCodes(req, 'TBLTYPE', req.body.pstbltyp);
    if (!description1 || _.isEmpty(description1.prgedesc)) {
        return returnError(req, 400, { pstbltyp: "INVALIDDATAVALUE" }, res);
    }

    // let findFN = fieldNames[req.body.pstblkey];
    // if (!findFN) {
    //     console.log("Field key is not exist.");
    //     return returnError(req, 500, "RECORDNOTFOUND", res);
    // };

    let pstblpnt = req.body.pstblpnt;
    if (pstblpnt) {
        let ptable = await pstblmas.findOne({
            where: {
                pstblnme: req.body.pstblpnt
            }, raw: true
        });
        if (!ptable) return returnError(req, 400, { pstblpnt: "INVALIDDATAVALUE" }, res);
        // let findPNT = fieldNames[req.body.pstblpnt];
        // if (!findPNT) {
        //     console.log("Parent File Name Not Found");
        //     return returnError(req, 500, "NORECORDFOUND", res);
        // };
    };

    // const pstblnme = req.body.pstblnme;

    await pstblmas.findOne({
        where: {
            pstblnme: req.body.pstblnme
        }, raw: true, attributes: { exclude: ['mntuser', 'createdAt'] }
    }).then(found => {
        if (found) {
            if (isNaN(new Date(req.body.updatedAt)) || (new Date(found.updatedAt).getTime() !== new Date(req.body.updatedAt).getTime())) return returnError(req, 500, "RECORDOUTOFSYNC", res)

            // if (req.body.pstblnme && req.body.pstblnme != found.pstblnme) return returnError(req, 400, { pstblnme: 'NORECORDFOUND' }, res);

            const new_found = {
                pstbldsc: req.body.pstbldsc,
                pstbllds: req.body.pstbllds,
                pstblpnt: req.body.pstblpnt,
                pstbltyp: req.body.pstbltyp,
                mntuser: req.user.psusrunm
            }

            pstblmas.update(new_found,
                {
                    where: {
                        id: found.id
                    }
                }).then(async () => {
                    common.writeMntLog('pstblmas', found, await pstblmas.findByPk(found.id, { raw: true }), found.pstblnme, 'C', req.user.psusrunm);
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
    pstblmas.findOne({
        where: {
            pstblnme: id
        }, raw: true
    }).then(found => {
        if (found) {
            pstblmas.destroy({
                where: { id: found.id }
            }).then(() => {
                common.writeMntLog('pstblmas', null, null, found.pstblnme, 'D', req.user.psusrunm, "", found.pstblnme);
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

exports.key_list = async (req, res) => {
    if (!req.query.pstblnme || _.isEmpty(req.query.pstblnme)) return returnError(req, 500, "RECORDIDISREQUIRED", res);

    let limit = 10;
    if (req.query.limit) limit = req.query.limit;

    let from = 0;
    if (!req.query.page) from = 0;
    else from = parseInt(req.query.page) * parseInt(limit);

    let option = {
        pstblnme: req.query.pstblnme
    };

    const { count, rows } = await pstblkey.findAndCountAll({
        limit: parseInt(limit),
        offset: from,
        where: option,
        order: [['pstblkys', 'ASC']],
        raw: true
    });

    // Find Table
    let table = await pstblmas.findOne({
        where: {
            pstblnme: req.query.pstblnme
        }, raw: true
    });

    let newRows = [];
    for (var i = 0; i < rows.length; i++) {
        let obj = rows[i];
        if (!_.isEmpty(obj.pstblkyn)) {
            obj.pstblkyndsc = fieldNames[obj.pstblkyn] ? fieldNames[obj.pstblkyn] : ""
        }

        if (table) {
            obj.pstblnmedsc = !_.isEmpty(table.pstbldsc) ? table.pstbldsc : ""
        }

        newRows.push(obj);
    }

    if (count > 0) return returnSuccess(200, { total: count, data: newRows, extra: { file: 'pstblkey', key: ['pstblnme', 'pstblkyn'] } }, res);
    else return returnSuccess(200, { total: 0, data: [] }, res);
}

exports.key_detail = async (req, res) => {
    if (!req.query.id || _.isEmpty(req.query.id)) return returnError(req, 500, "RECORDIDISREQUIRED", res);

    await pstblkey.findOne({
        where: {
            id: req.query.id
        }, raw: true
    }).then(async tblkey => {
        if (tblkey) {
           tblkey.pstblkyndsc =  doesVariableExist(tblkey.pstblkyn);


            return returnSuccess(200, tblkey, res);
        } else return returnError(req, 500, "NORECORDFOUND", res);
    });
}

function doesVariableExist(variableName) {
    return fieldNames.hasOwnProperty(variableName) ? fieldNames[variableName] : "";
  }

exports.key_create = async (req, res) => {
    //Validation
    let errors = {};
    let err_ind = false;

    if (!req.body.pstblnme || _.isEmpty('' + req.body.pstblnme)) {
        errors.pstblnme = "FIELDISREQUIRED";
        err_ind = true;
    } else {
        let check_exist = await pstblmas.findOne({
            where: {
                pstblnme: req.body.pstblnme
            }, raw: true
        });
        if (!check_exist) {
            errors.pstblnme = "INVALIDDATAVALUE";
            err_ind = true;
        }
    }

    if (!req.body.pstblkyn || _.isEmpty('' + req.body.pstblkyn)) {
        errors.pstblkyn = "FIELDISREQUIRED";
        err_ind = true;
    } else {
        if (!fieldNames[req.body.pstblkyn] || _.isEmpty('' + fieldNames[req.body.pstblkyn])) {
            errors.pstblkyn = "INVALIDDATAVALUE";
            err_ind = true;
        }
    }

    if (req.body.pstblkys == null || _.isEmpty('' + req.body.pstblkys) || req.body.pstblkys == 0) {
        errors.pstblkys = "FIELDISREQUIRED";
        err_ind = true;
    } else if (req.body.pstblkys < 0 || _.isNaN(req.body.pstblkys)) {
        errors.pstblkys = "INVALIDDATAVALUE";
        err_ind = true;
    }

    if (err_ind) return returnError(req, 400, errors, res);
    else {
        // Check Duplicate
        let check_exist = await pstblkey.findOne({
            where: {
                pstblnme: req.body.pstblnme,
                pstblkyn: req.body.pstblkyn,
            }, raw: true
        });
        if (check_exist) return returnError(req, 400, { pstblkyn: "RECORDEXISTS" }, res);

        await pstblkey.create({
            pstblnme: req.body.pstblnme,
            pstblkyn: req.body.pstblkyn,
            pstblkys: req.body.pstblkys,
            crtuser: req.user.psusrunm,
            mntuser: req.user.psusrunm
        }).then((data) => {
            let created = data.get({ plain: true });
            common.writeMntLog('pstblkey', null, null, created.pstblnme + '-' + created.pstblkyn, 'A', req.user.psusrunm, "", created.pstblkyn);
            return returnSuccessMessage(req, 200, "RECORDCREATED", res);
        })
    }
}

exports.key_update = async (req, res) => {
    //Validation
    let errors = {};
    let err_ind = false;

    if (!req.body.id || _.isEmpty('' + req.body.id)) return returnError(req, 500, "RECORDIDISREQUIRED", res);

    if (req.body.pstblkys == null || _.isEmpty('' + req.body.pstblkys) || req.body.pstblkys == 0) {
        errors.pstblkys = "FIELDISREQUIRED";
        err_ind = true;
    } else if (req.body.pstblkys < 0 || _.isNaN(req.body.pstblkys)) {
        errors.pstblkys = "INVALIDDATAVALUE";
        err_ind = true;
    }

    if (err_ind) return returnError(req, 400, errors, res);
    await pstblkey.findOne({
        where: {
            id: req.body.id
        }, raw: true, attributes: { exclude: ['mntuser', 'updatedAt', 'createdAt'] }
    }).then(async found => {
        if (found) {
            if (found.pstblkys != req.body.pstblkys) {
                // Check Duplicate
                let check_dup = await pstblkey.findOne({
                    where: {
                        pstblnme: found.pstblnme,
                        pstblkyn: found.pstblkyn,
                        pstblkys: req.body.pstblkys
                    }, raw: true
                });
                if (check_dup) return returnError(req, 400, { pstblkys: "RECORDEXISTS" }, res);
            }

            pstblkey.update({
                pstblkys: req.body.pstblkys
            },
                {
                    where: {
                        id: found.id
                    }
                }).then(async () => {
                    common.writeMntLog('pstblkey', found, await pstblkey.findByPk(found.id, { raw: true }), found.pstblnme + '-' + found.pstblkyn, 'C', req.user.psusrunm, "", found.pstblkyn);
                    return returnSuccessMessage(req, 200, "RECORDUPDATED", res);
                }).catch(err => {
                    return returnError(req, 500, "UNEXPECTEDERROR", res);
                });
        } else {
            return returnError(req, 500, "NORECORDFOUND", res);
        }
    });
}

exports.key_delete = (req, res) => {
    const id = req.body.id;
    if (!id) return returnError(req, 500, "RECORDIDISREQUIRED", res);
    pstblkey.findOne({
        where: {
            id: id
        }, raw: true
    }).then(found => {
        if (found) {
            pstblkey.destroy({
                where: { id: found.id }
            }).then(() => {
                common.writeMntLog('pstblkey', null, null, found.pstblnme + '-' + found.pstblkey, 'D', req.user.psusrunm, "Table Master", found.pstblkyn);
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