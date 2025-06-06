// Import
const db = require("../models");
const _ = require("lodash");

// Table File
const prfunacs = db.prfunacs;
const prfuncde = db.prfuncde;
const psrolpar = db.psrolpar;

// Common Function
const Op = db.Sequelize.Op;
const returnError = require('../common/error');
const returnSuccess = require('../common/success');
const returnSuccessMessage = require('../common/successMessage');
const common = require('../common/common');
const connection = require("../common/db");
const rc = require('../common/redis');

exports.list = async (req, res) => {
    if (!req.query.prusrrole) return returnError(req, 400, { prusrrole: 'ROLECODEISREQUIRED' }, res);

    const { count, rows } = await prfuncde.findAndCountAll({
        where: {
            prfunsts: true
        },
        raw: true, attributes: {
            exclude: ['createdAt', 'updatedAt', 'prcrtusr', 'prmntusr']
        }
    });

    let newRows = {};
    // Get All Role
    // let roles = await prusrrole.findAll({ raw: true });
    // let roles = await common.retrieveGenCodes(req, 'USRROLE');
    let roles = await psrolpar.findAll({
        raw: true, attributes: ['psrolcde', 'psroldsc']
    }).catch(err => {
        console.log(err);
        return returnError(req, 500, "UNEXPECTEDERROR", res)
    });
    for (var j = 0; j < roles.length; j++) {
        let role = roles[j];
        // Get Role Access
        let role_access = await prfunacs.findAll({
            where: {
                pracsrol: role.psroldsc,//role.prrolecode,
                pracssts: true
            }, raw: true
        });

        let currentRow = [];
        for (var i = 0; i < rows.length; i++) {
            let obj = rows[i];
            let checked = await searchFunction(obj, role_access, rows.length);
            obj.actions = checked.actions;
            let prfungrpdsc = '';
            let fungrp = {};
            if (!_.isEmpty(obj.prfungrp)) fungrp = await common.retrieveSpecificGenCodes(req, 'FUNGRP', obj.prfungrp);
            if (fungrp) prfungrpdsc = fungrp.prgedesc ? fungrp.prgedesc : '';
            else prfungrpdsc = '';

            currentRow.push({
                "id": obj.prfuncde,
                "prfungrp": obj.prfungrp,
                "prfuncde": obj.prfuncde,
                "prfunnme": obj.prfunnme,
                "prfunlnm": obj.prfunlnm || '',
                "prfunsts": obj.prfunsts,
                "prfunacs": checked.checked ? 1 : 0,
                "prfunact": obj.actions,
                "prfungrpdsc": prfungrpdsc
            });
        }

        // newRows[role.prrolecode] = currentRow;
        newRows[role.prgecode] = currentRow;
    }

    if (roles.length > 0) return returnSuccess(200, { data: newRows, extra: { file: 'prfunacs', key: ['prfuncde', 'pracsrol'], add: true, edit: true, 'delete': true } }, res);
    else return returnSuccess(200, { total: 0, data: [], extra: { file: 'prfunacs', key: ['prfuncde', 'pracsrol'], add: true, edit: true, 'delete': true } }, res);
}

exports.list_role = async (req, res) => {
    let function_groups = await common.retrieveGenCodes(req, 'FUNGRP');

    let group_access = [];
    for (var k = 0; k < function_groups.length; k++) {
        let group = function_groups[k];

        let rows = await prfuncde.findAll({
            where: {
                prfungrp: group.prgecode,
                prfunsts: true
            }, raw: true, attributes: {
                exclude: ['createdAt', 'updatedAt', 'prcrtusr', 'prmntusr']
            }
        });

       // let roles = await prusrrole.findAll({ raw: true });
        // let roles = await common.retrieveGenCodes(req, 'USRROLE');
        let roles = await psrolpar.findAll({
            raw: true, attributes: ['psrolcde', 'psroldsc']
        }).catch(err => {
            console.log(err);
            return returnError(req, 500, "UNEXPECTEDERROR", res)
        });
        let newRows = [];
        for (var i = 0; i < rows.length; i++) {
            let access = [];
            let obj = rows[i];
            for (var j = 0; j < roles.length; j++) {
                let role = roles[j];
                let role_access = await prfunacs.findAll({
                    where: {
                        pracsfun: obj.prfuncde,
                        pracsrol: role.psrolcde,//role.prrolecode,
                        pracssts: true
                    }, raw: true
                });

                let result = await searchFunction(obj, role_access, rows.length);
                access.push({
                    pracsrol: role.psrolcde,//role.prrolecode,
                    pracsroldsc: role.psroldsc,//role.prroledesc,
                    prroleacs: result.checked ? 1 : 0,
                    prfunact: result.actions
                });
            }
            newRows.push({
                pracsfun: obj.prfuncde,
                pracsfundsc: obj.prfunnme,
                roles: access
            });
        }
        group_access.push({
            prfungrp: group.prgecode,
            prfungrpdsc: group.prgedesc,
            prfunctions: newRows
        });
    }

    if (function_groups.length > 0) return returnSuccess(200, { data: group_access, extra: { file: 'prfunacs', key: ['prfuncde', 'pracsrol'], add: true, edit: true, 'delete': true } }, res);
    else return returnSuccess(200, { total: 0, data: [], extra: { file: 'prfunacs', key: ['prfuncde', 'pracsrol'], add: true, edit: true, 'delete': true } }, res);
}

exports.action = async (req, res) => {
    //Validation
    // const { errors, isValid } = validateFuncdeInput(req.body, 'A');
    // if (!isValid) return returnError(req, 400, errors, res);
    const t = await connection.sequelize.transaction();

    let data = req.body.data;
    let rolecode = req.body.prrolecode;

      // Verify Role
    // let role = await prusrrole.findOne({
    //     where: {
    //         prrolecode: rolecode
    //     }, raw: true
    // });
    // let role = await common.retrieveSpecificGenCodes(req, 'USRROLE', rolecode);
    let roles = await psrolpar.findOne({
        where: {
            psrolcde: rolecode
        },
        raw: true, attributes: ['psrolcde', 'psroldsc']
    }).catch(err => {
        console.log(err);
        return returnError(req, 500, "UNEXPECTEDERROR", res)
    });
    if (!roles) return returnError(req, 400, { prrolecode: 'ROLENOTFOUND' }, res);

    // Loop Data
    for (var i = 0; i < data.length; i++) {
        let obj = data[i];

        let funcde = await prfuncde.findOne({
            where: {
                prfuncde: obj.prfuncde
            }, raw: true
        });
        if (!funcde) return returnError(req, 400, { prfuncde: 'FUNCTIONNOTFOUND' }, res);

        let funacs = await prfunacs.findOne({
            where: {
                pracsfun: obj.prfuncde,
                pracsrol: rolecode//role.prrolecode
            }, raw: true
        });
        if (funacs) {
            // Copy Object for Compare Purpose
            let tempObj = JSON.parse(JSON.stringify(obj));
            // Remove Key
            delete tempObj.prfuncde;

            let compare = await common.compareObject(tempObj, funacs);
            let options = {};
            tempObj.pracsa01 = tempObj.prfunact.pracsa01 == null ? funacs.pracsa01 : tempObj.prfunact.pracsa01 ? 1 : 0;
            tempObj.pracsa02 = tempObj.prfunact.pracsa02 == null ? funacs.pracsa02 : tempObj.prfunact.pracsa02 ? 1 : 0;
            tempObj.pracsa03 = tempObj.prfunact.pracsa03 == null ? funacs.pracsa03 : tempObj.prfunact.pracsa03 ? 1 : 0;
            tempObj.pracsa04 = tempObj.prfunact.pracsa04 == null ? funacs.pracsa04 : tempObj.prfunact.pracsa04 ? 1 : 0;
            tempObj.pracsa05 = tempObj.prfunact.pracsa05 == null ? funacs.pracsa05 : tempObj.prfunact.pracsa05 ? 1 : 0;
            tempObj.pracsa06 = tempObj.prfunact.pracsa06 == null ? funacs.pracsa06 : tempObj.prfunact.pracsa06 ? 1 : 0;
            tempObj.pracsa07 = tempObj.prfunact.pracsa07 == null ? funacs.pracsa07 : tempObj.prfunact.pracsa07 ? 1 : 0;
            tempObj.pracsa08 = tempObj.prfunact.pracsa08 == null ? funacs.pracsa08 : tempObj.prfunact.pracsa08 ? 1 : 0;
            tempObj.pracsa09 = tempObj.prfunact.pracsa09 == null ? funacs.pracsa09 : tempObj.prfunact.pracsa09 ? 1 : 0;
            tempObj.pracsa10 = tempObj.prfunact.pracsa10 == null ? funacs.pracsa10 : tempObj.prfunact.pracsa10 ? 1 : 0;
            delete tempObj.prfunact;

            if (!compare) {
                if (obj.pracssts) options = tempObj;
                else {
                    options = {
                        pracsa01: 0,
                        pracsa02: 0,
                        pracsa03: 0,
                        pracsa04: 0,
                        pracsa05: 0,
                        pracsa06: 0,
                        pracsa07: 0,
                        pracsa08: 0,
                        pracsa09: 0,
                        pracsa10: 0,
                        pracssts: obj.pracssts,
                        prmntusr: req.user.psusrunm
                    }
                }
                // Update Access
                await prfunacs.update(options, {
                    transaction: t,
                    where: {
                        id: funacs.id
                    }
                }).then(async () => {
                    common.writeMntLog('prfunacs', funacs, await prfunacs.findByPk(funacs.id, { raw: true }), funacs.pracsfun + '-' + funacs.pracsrol, 'C', req.user.psusrunm, "Access", funacs.pracsfun + '-' + funacs.pracsrol);
                }).catch(async err => {
                    console.log(err);
                    await t.rollback();
                    return returnError(req, 500, "UNEXPECTEDERROR", res);
                });
            }
        } else {
            // Write Access
            let options = {};
            options = {
                pracsfun: obj.prfuncde,
                pracsrol: rolecode,//role.prgecode,//role.prrolecode,
                pracsa01: funcde.prfuna01 ? obj.prfunact.pracsa01 ? 1 : 0 : 0,
                pracsa02: funcde.prfuna02 ? obj.prfunact.pracsa02 ? 1 : 0 : 0,
                pracsa03: funcde.prfuna03 ? obj.prfunact.pracsa03 ? 1 : 0 : 0,
                pracsa04: funcde.prfuna04 ? obj.prfunact.pracsa04 ? 1 : 0 : 0,
                pracsa05: funcde.prfuna05 ? obj.prfunact.pracsa05 ? 1 : 0 : 0,
                pracsa06: funcde.prfuna06 ? obj.prfunact.pracsa06 ? 1 : 0 : 0,
                pracsa07: funcde.prfuna07 ? obj.prfunact.pracsa07 ? 1 : 0 : 0,
                pracsa08: funcde.prfuna08 ? obj.prfunact.pracsa08 ? 1 : 0 : 0,
                pracsa09: funcde.prfuna09 ? obj.prfunact.pracsa09 ? 1 : 0 : 0,
                pracsa10: funcde.prfuna10 ? obj.prfunact.pracsa10 ? 1 : 0 : 0,
                pracssts: obj.pracssts
            }

            await prfunacs.create(options, {
                transaction: t
            }).then(data => {
                let created = data.get({ plain: true });
                common.writeMntLog('prfunacs', null, null, created.pracsfun + '-' + created.pracsrol, 'A', req.user.psusrunm, "Access", created.pracsfun + '-' + created.pracsrol);
            }).catch(err => {
                console.log(err);
                t.rollback();
                return returnError(req, 500, "UNEXPECTEDERROR", res);
            });
        }
    }
    t.commit();
    await rc.set("access_matrix-" + rolecode, "");
    return returnSuccessMessage(req, 200, "ACCESSIBILITYUPDATED", res);
}

// Internal Function
async function searchFunction(item, selected, counter) {
    return new Promise(async (resolve, reject) => {
        let formatted = {
            actions: []
        };
        let result = '';

        for (var i = 0; i < counter; i++) {
            let obj = selected[i] ? selected[i] : {};
            formatted.function = item.prfuncde;
            if (obj.pracsrol) formatted.pracsrol = obj.pracsrol;

            if (item.prfuncde == obj.pracsfun) {
                formatted.checked = true;
            }

            if (obj.pracsfun && formatted.function == obj.pracsfun) {
                result = await formatAction(item, obj, true);
                // formatted.role = obj.pracsrol;
            }
        }
        if (result.length < 1) {
            result = await formatAction(item, {}, false);
            // formatted.role = "";
        }
        formatted.actions = result;
        return resolve(formatted);
        // return resolve({ checked: false });
    });
}

async function formatAction(item, selected, allow) {
    return new Promise((resolve, reject) => {
        let result = [];
        if (!allow) {
            if (item.prfuna01) {
                result.push({
                    field: 'pracsa01',
                    label: item.prfunl01,
                    checked: 0
                });
            }
            if (item.prfuna02) {
                result.push({
                    field: 'pracsa02',
                    label: item.prfunl02,
                    checked: 0
                });
            }
            if (item.prfuna03) {
                result.push({
                    field: 'pracsa03',
                    label: item.prfunl03,
                    checked: 0
                });
            }
            if (item.prfuna04) {
                result.push({
                    field: 'pracsa04',
                    label: item.prfunl04,
                    checked: 0
                });
            }
            if (item.prfuna05) {
                result.push({
                    field: 'pracsa05',
                    label: item.prfunl05,
                    checked: 0
                });
            }
            if (item.prfuna06) {
                result.push({
                    field: 'pracsa06',
                    label: item.prfunl06,
                    checked: 0
                });
            }
            if (item.prfuna07) {
                result.push({
                    field: 'pracsa07',
                    label: item.prfunl07,
                    checked: 0
                });
            }
            if (item.prfuna08) {
                result.push({
                    field: 'pracsa08',
                    label: item.prfunl08,
                    checked: 0
                });
            }
            if (item.prfuna09) {
                result.push({
                    field: 'pracsa09',
                    label: item.prfunl09,
                    checked: 0
                });
            }
            if (item.prfuna10) {
                result.push({
                    field: 'pracsa10',
                    label: item.prfunl10,
                    checked: 0
                });
            }
        } else {
            if (item.prfuna01) {
                result.push({
                    field: 'pracsa01',
                    label: item.prfunl01,
                    checked: selected.pracsa01 ? 1 : 0
                });
            }
            if (item.prfuna02) {
                result.push({
                    field: 'pracsa02',
                    label: item.prfunl02,
                    checked: selected.pracsa02 ? 1 : 0
                });
            }
            if (item.prfuna03) {
                result.push({
                    field: 'pracsa03',
                    label: item.prfunl03,
                    checked: selected.pracsa03 ? 1 : 0
                });
            }
            if (item.prfuna04) {
                result.push({
                    field: 'pracsa04',
                    label: item.prfunl04,
                    checked: selected.pracsa04 ? 1 : 0
                });
            }
            if (item.prfuna05) {
                result.push({
                    field: 'pracsa05',
                    label: item.prfunl05,
                    checked: selected.pracsa05 ? 1 : 0
                });
            }
            if (item.prfuna06) {
                result.push({
                    field: 'pracsa06',
                    label: item.prfunl06,
                    checked: selected.pracsa06 ? 1 : 0
                });
            }
            if (item.prfuna07) {
                result.push({
                    field: 'pracsa07',
                    label: item.prfunl07,
                    checked: selected.pracsa07 ? 1 : 0
                });
            }
            if (item.prfuna08) {
                result.push({
                    field: 'pracsa08',
                    label: item.prfunl08,
                    checked: selected.pracsa08 ? 1 : 0
                });
            }
            if (item.prfuna09) {
                result.push({
                    field: 'pracsa09',
                    label: item.prfunl09,
                    checked: selected.pracsa09 ? 1 : 0
                });
            }
            if (item.prfuna10) {
                result.push({
                    field: 'pracsa10',
                    label: item.prfunl10,
                    checked: selected.pracsa10 ? 1 : 0
                });
            }
        }

        return resolve(result);
    });
}
