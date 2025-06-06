// Import
const db = require("../models");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const _ = require("lodash");
const short = require('short-uuid');
const { v4: uuidv4 } = require('uuid');


//Table import
const usrlgnpf = db.usrlgnpf;
const psusrprf = db.psusrprf;
const psrstpwd = db.psrstpwd;
const prfuncde = db.prfuncde;
const prfunacs = db.prfunacs;
const psmbrprf = db.psmbrprf;

//Common Function
// Common Function
const Op = db.Sequelize.Op;
const returnError = require('../common/error');
const returnSuccess = require('../common/success');
const returnSuccessMessage = require('../common/successMessage');
const common = require('../common/common');
const connection = require("../common/db");

// Input Validation
const userCreationValidation = require('../validation/user-creation');
const prUpdateProfileValidation = require('../validation/user-update');
const prResetPassValidation = require('../validation/prrstpwd-validation');
const validateLoginInput = require('../validation/user-login');

//Any Login
exports.login = async (req,res) =>{
  const { errors, isValid } = validateLoginInput(req.body);
    if (!isValid) {
        return returnError(req, 400, errors, res);
    }

    if (req.headers["api-key"] != process.env.API_KEY) return returnError(req, 500, "INVALIDKEY", res);

    const username = req.body.username;
    const password = req.body.password;
    await psusrprf.findOne({
        where: {
            psusrunm: username
        }, raw: true
    }).then(async data => {
        if (data) {
            if (data.psusrsts == 'L') return returnError(req, 400, { username: 'ACCOUNTLOCKED' }, res);
            else if (data.psusrsts == 'C') return returnError(req, 400, { username: 'ACCOUNTCLOSED' }, res);
            else if (data.psusrsts == 'E') return returnError(req, 400, { username: 'MEMBEREXPIRED' }, res);

            bcrypt.compare(password, data.psusrpwd).then(async isMatch => {
                if (isMatch) {
                    const t = await connection.sequelize.transaction();

                    let payload = { id: data.id, psusrunm: data.psusrunm, iat: Date.now() };

                    jwt.sign(
                        payload,
                        "secret",
                        async (err, token) => {
                            // Write / Update into Login Table - SSO Purpose
                            await usrlgnpf.findOne({
                                where: {
                                    psusrunm: data.psusrunm
                                }, raw: true
                            }).then(lgnpf => {
                                if (lgnpf) {
                                    let options = {
                                        pslgnsts: true,
                                        pslgidat: new Date(),
                                        pslgntkn: "Bearer " + token
                                    };
                                    if (lgnpf.pslgnsts) {
                                        options.pslgidat = new Date();
                                    }
                                    usrlgnpf.update(options, {
                                        transaction: t,
                                        where: {
                                            id: lgnpf.id
                                        }
                                    }).catch(err => {
                                        console.log(err);
                                        t.rollback();
                                        return returnError(req, 500, "UNEXPECTEDERROR", res);
                                    });;
                                } else {
                                    usrlgnpf.create({
                                        psusrunm: data.psusrunm,
                                        pslgnsts: true,
                                        pslgidat: new Date(),
                                        pslgntkn: "Bearer " + token
                                    }, {
                                        transaction: t,
                                    }).catch(err => {
                                        console.log(err);
                                        t.rollback();
                                        return returnError(req, 500, "UNEXPECTEDERROR", res);
                                    });
                                }
                            });

                            // Update First Login Flag
                            await psusrprf.update({
                                psfstlgn: false,
                                psapptkn: req.body.push_token ? req.body.push_token : data.psapptkn
                            }, {
                                transaction: t,
                                where: {
                                    id: data.id
                                }
                            }).catch(err => {
                                console.log(err);
                                t.rollback();
                                return returnError(req, 500, "UNEXPECTEDERROR", res);
                            });

                            t.commit();
                            return returnSuccess(200, { token: "Bearer " + token }, res);
                        });

                } else return returnError(req, 400, { password: "INCORRECTPASS" }, res);

            });
        }
        else return returnError(req, 400, { username: "USERNOTFOUND" }, res);
    }).catch(err => {
        console.log(err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
}

//Login For Member
exports.login_m = async (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);
    if (!isValid) {
        return returnError(req, 400, errors, res);
    }

    if (req.headers["api-key"] != process.env.API_KEY) return returnError(req, 500, "INVALIDKEY", res);

    const username = req.body.username;
    const password = req.body.password;
    await psusrprf.findOne({
        where: {
            psusrunm: username
        }, raw: true
    }).then(async data => {
        if (data) {
            if (data.psusrsts == 'L') return returnError(req, 500, 'ACCOUNTLOCKED', res);
            else if (data.psusrsts == 'C') return returnError(req, 500, 'ACCOUNTCLOSED', res);
            else if (data.psusrsts == 'E') return returnError(req, 500, 'MEMBEREXPIRED', res);

            if (data.psusrtyp != 'MBR') return returnError(req, 500, 'INVALIDLOGIN', res);

            bcrypt.compare(password, data.psusrpwd).then(async isMatch => {
                if (isMatch) {
                    const t = await connection.sequelize.transaction();

                    let payload = { id: data.id, psusrunm: data.psusrunm, iat: Date.now() };

                    jwt.sign(
                        payload,
                        "secret",
                        async (err, token) => {
                            // Write / Update into Login Table - SSO Purpose
                            await usrlgnpf.findOne({
                                where: {
                                    psusrunm: data.psusrunm
                                }, raw: true
                            }).then(lgnpf => {
                                if (lgnpf) {
                                    let options = {
                                        pslgnsts: true,
                                        pslgidat: new Date(),
                                        pslgntkn: "Bearer " + token
                                    };
                                    if (lgnpf.pslgnsts) {
                                        options.pslgidat = new Date();
                                    }
                                    usrlgnpf.update(options, {
                                        transaction: t,
                                        where: {
                                            id: lgnpf.id
                                        }
                                    }).catch(err => {
                                        console.log(err);
                                        t.rollback();
                                        return returnError(req, 500, "UNEXPECTEDERROR", res);
                                    });;
                                } else {
                                    usrlgnpf.create({
                                        psusrunm: data.psusrunm,
                                        pslgnsts: true,
                                        pslgidat: new Date(),
                                        pslgntkn: "Bearer " + token
                                    }, {
                                        transaction: t,
                                    }).catch(err => {
                                        console.log(err);
                                        t.rollback();
                                        return returnError(req, 500, "UNEXPECTEDERROR", res);
                                    });
                                }
                            });

                            // Update First Login Flag
                            await psusrprf.update({
                                psfstlgn: false,
                                psapptkn: req.body.push_token ? req.body.push_token : data.psapptkn
                            }, {
                                transaction: t,
                                where: {
                                    id: data.id
                                }
                            }).catch(err => {
                                console.log(err);
                                t.rollback();
                                return returnError(req, 500, "UNEXPECTEDERROR", res);
                            });

                            t.commit();
                            return returnSuccess(200, { token: "Bearer " + token }, res);
                        });

                } else return returnError(req, 400, { password: "INCORRECTPASS" }, res);

            });
        }
        else return returnError(req, 400, { username: "USERNOTFOUND" }, res);
    }).catch(err => {
        console.log(err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
}


exports.reset = async (req, res) => {
    let username = req.body.username;
    if (!username) return returnError(req, 400, { username: 'USERNAMEISREQUIRED' }, res);

    // Check if user exists
    let user = await psusrprf.findOne({
        where: { psusrunm: username },
        raw: true,
        attributes: { exclude: ['createdAt', 'updatedAt', 'crtuser', 'mntuser'] }
    });

    if (!user) return returnError(req, 400, { psusrunm: 'USERNOTFOUND' }, res);

    // Generate a new random hexadecimal password (8 characters)
    const rawPassword = crypto.randomBytes(4).toString('hex');
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

   

    // Update the user's password and set the change password flag
    const update = await psusrprf.update({
        psusrpwd: hashedPassword, // change to hashedPassword if using hashing
        pschgpwd: true
    }, {
        where: { psusrunm: username }
    });

    if (!update) return returnError(req, 500, "FAILEDTOUPDATEPASSWORD", res);

    // Log and email
    let uid = uuidv4();
    const resetLog = {
        psrstuid: uid,
        psrstusr: username,
        psrstgdt: new Date(),
        psrststs: 'A'
    };

    const check = await psrstpwd.findOne({ where: { psrstusr: username } });

    if (check) {
        await psrstpwd.update(resetLog, { where: { psrstusr: username } });
        common.writeMntLog('psrstpwd', resetLog, await psrstpwd.findOne({ where: { psrstusr: username }, raw: true }), username, 'C', username);
    } else {
        await psrstpwd.create(resetLog);
        common.writeMntLog('psrstpwd', resetLog, await psrstpwd.findOne({ where: { psrstusr: username }, raw: true }), username, 'A', username);
    }

    // Compose email
    let message = `
        <p>Dear ${user.psusrnam},</p>
        <p>You have requested to reset your password. Below is your new temporary password:</p>
        <p><strong>${rawPassword}</strong></p>
        <p>Please login and change your password as soon as possible.</p>
        <br/>
        <p>Thanks & Regards,<br/>StallSync</p>
    `;

    // Send email
    await general.sendEmail(req, user.psusreml, 'Your Password Has Been Reset', message)
        .catch(err => {
            console.error(err);
            return returnError(req, 500, "EMAILSENDFAILED", res);
        });

    return returnSuccessMessage(req, 200, "PASSWORDRESETSUCCESS", res);
};

exports.change_password = async (req, res) => {
    const oldpassword = req.body.oldpassword
    const newpassword = req.body.newpassword

    //Validation
    const { errors, isValid } = prResetPassValidation(req.body);
    if (!isValid) return returnError(req, 400, errors, res);

    psusrprf.findOne({
        where: {
            psusrunm: req.user.psusrunm
        }, raw: true, attributes: { exclude: ['createdAt', 'updatedAt', 'crtuser', 'mntuser'] }
    }).then(async user => {
        if (!user) return returnError(req, 400, { psusrunm: 'USERNOTFOUND' }, res);

        await bcrypt.compare(oldpassword, user.psusrpwd).then(async isMatch => {
            if (isMatch) {
                // Change Password
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) throw err;
                    bcrypt.hash(newpassword, salt, (err, hash) => {
                        if (err) throw err;
                        let newPassword = hash;
                        psusrprf.update({
                            psusrpwd: newPassword,
                            pschgpwd: false
                        }, {
                            where: {
                                id: user.id
                            }
                        }).then(async () => {
                            common.writeMntLog('psusrprf', user, await psusrprf.findOne({ where: { psusrunm: user.psusrunm }, raw: true }), user.psusrunm, 'C', user.psusrunm);
                            return returnSuccessMessage(req, 200, "PASSWORDRESET", res);
                        }).catch(err => {
                            console.log(err);
                            return returnError(req, 500, "UNEXPECTEDERROR", res);
                        });
                    });
                });
            } else return returnError(req, 400, { oldpassword: "INVALIDPASSWORD" }, res);
        })
    }).catch(err => {
        console.log(err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
}

exports.create = async (req, res) => {
    //Validation
    const { errors, isValid } = userCreationValidation(req.body, 'N');
    if (!isValid) return returnError(req, 400, errors, res);

    let flag = await validatePassword(req.body.psusrpwd);
    if (!flag.flag) {
        let messages = '';
        for (var i = 0; i < flag.error.length; i++) {
            let obj = flag.error[i];
            messages += '<p>' + obj + '</p>';
        }
        return res.status(400).json({ message: { 'psusrpwd': messages } });
    }

    // Validate Code
    let description = await common.retrieveSpecificGenCodes(req, 'USRROLE', req.body.psusrrol);
    if (!description || _.isEmpty(description.prgedesc)) return returnError(req, 400, { psusrrol: 'INVALIDDATAVALUE' }, res);

    // Check Duplicate
    let user = await psusrprf.findOne({
        where: {
            psusrunm: req.body.psusrunm
        }, raw: true
    });
    if (user) return returnError(req, 400, { psusrunm: 'USERALREADYEXIST' }, res);

    const new_psusrprf = {
        psusrunm: req.body.psusrunm,
        psusrnam: req.body.psusrnam,
        psusreml: req.body.psusreml,
        psusrsts: 'A',
        psusrtyp: 'ADM',
        psusrrol: req.body.psusrrol,
        psstsdt8: new Date(),
        psusrphn: req.body.psusrphn
    }

    bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;
        bcrypt.hash(req.body.psusrpwd, salt, (err, hash) => {
            if (err) throw err;
            new_psusrprf.psusrpwd = hash;
            psusrprf.create(new_psusrprf).then(data => {
                let created = data.get({ plain: true });
                common.writeMntLog('psusrprf', null, null, created.psusrunm, 'A', req.user.psusrunm);
                return returnSuccessMessage(req, 200, "RECORDCREATED", res);
            }).catch(err => {
                console.log(err);
                return returnError(req, 500, "UNEXPECTEDERROR", res);
            });
        })
    });
}

exports.list = async (req, res) => {
    if (req.user.psusrtyp != 'ADM')
        return returnError(req, 500, "INVALIDAUTHORITY", res);

    let limit = 10;
    if (req.query.limit) limit = req.query.limit;

    let from = 0;
    if (!req.query.page) from = 0;
    else from = parseInt(req.query.page) * parseInt(limit);

    let option = {};
    if (req.query.psusrunm && !_.isEmpty(req.query.psusrunm)) {
        option.psusrunm = req.query.psusrunm;
    }

    if (req.query.psusrnam && !_.isEmpty(req.query.psusrnam)) {
        option = {
            [Op.or]: [
                { psusrnam: { [Op.like]: req.query.psusrnam + '%' } },
                { psusrnam: req.query.psusrnam }
            ]
        }
    }

    if (req.query.psusrsts && !_.isEmpty(req.query.psusrsts)) {
        option.psusrsts = req.query.psusrsts;
    }

    // if (req.query.psusrtyp && !_.isEmpty(req.query.psusrtyp)) {
    //     option.psusrtyp = req.query.psusrtyp;
    // }
    option.psusrtyp = { [Op.ne]: "MBR" };
    const { count, rows } = await psusrprf.findAndCountAll({
        limit: parseInt(limit),
        offset: from,
        where: option,
        raw: true, attributes: [['psusrunm', 'id'], 'psusrunm', 'psusrnam', 'psusreml', 'psusrsts', 'psusrtyp', 'psusrphn', 'psusrals', 'psusrrol']
    });

    let newRows = [];
    for (var i = 0; i < rows.length; i++) {
        let obj = rows[i];
        if (!_.isEmpty(obj.psusrtyp)) {
            let usrtyp = await common.retrieveSpecificGenCodes(req, 'USRTYP', obj.psusrtyp);
            obj.psusrtypdsc = usrtyp.prgedesc ? usrtyp.prgedesc : '';
        }
        if (!_.isEmpty(obj.psusrsts)) {
            let usrsts = await common.retrieveSpecificGenCodes(req, 'USRSTS', obj.psusrsts);
            obj.psusrstsdsc = usrsts.prgedesc ? usrsts.prgedesc : '';
        }
        if (!_.isEmpty(obj.psusrrol)) {
            let usrrol = await common.retrieveSpecificGenCodes(req, 'USRROLE', obj.psusrrol);
            obj.psusrroldsc = usrrol.prgedesc ? usrrol.prgedesc : '';
        }
        newRows.push(obj);
    }

    if (count > 0) return returnSuccess(200, { total: count, data: newRows, extra: { file: 'psusrprf', key: ['psusrunm'] } }, res);
    else return returnSuccess(200, { total: 0, data: [] }, res);
}

exports.detail = (req, res) => {
    if (req.user.psusrtyp != 'ADM')
        return returnError(req, 500, "INVALIDAUTHORITY", res);

    const usrnm = req.query.id ? req.query.id : '';
    if (usrnm == '') return returnError(req, 500, "RECORDIDISREQUIRED", res);
    psusrprf.findOne({
        where: {
            psusrunm: usrnm
        }, raw: true, attributes: [['id', 'psusrunm'], 'psusrunm', 'psusrnam', 'psusreml', 'psusrsts', 'psusrtyp', 'psusrphn', 'psusrals', 'psusrrol', 'psredind']
    }).then(async usrunme => {
        if (usrunme) {
            if (!_.isEmpty(usrunme.psusrtyp)) {
                let usrtyp = await common.retrieveSpecificGenCodes(req, 'USRTYP', usrunme.psusrtyp);
                usrunme.psusrtypdsc = usrtyp.prgedesc ? usrtyp.prgedesc : '';
            }
            if (!_.isEmpty(usrunme.psusrsts)) {
                let usrsts = await common.retrieveSpecificGenCodes(req, 'USRSTS', usrunme.psusrsts);
                usrunme.psusrstsdsc = usrsts.prgedesc ? usrsts.prgedesc : '';
            }
            if (!_.isEmpty(usrunme.psusrrol)) {
                let usrrol = await common.retrieveSpecificGenCodes(req, 'USRROLE', usrunme.psusrrol);
                usrunme.psusrroldsc = usrrol.prgedesc ? usrrol.prgedesc : '';
            }
            return returnSuccess(200, usrunme, res);
        } else return returnError(req, 500, "NORECORDFOUND", res);
    }).catch(err => {
        console.log(err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
}

exports.update = async (req, res) => {
    if (req.user.psusrtyp != 'ADM')
        return returnError(req, 500, "INVALIDAUTHORITY", res);

    //Validation
    const { errors, isValid } = prUpdateProfileValidation(req.body, 'C');
    if (!isValid) return returnError(req, 400, errors, res);

    await psusrprf.findOne({
        where: {
            psusrunm: req.body.id
        },
        raw: true, attributes: { exclude: ['createdAt', 'updatedAt', 'crtuser', 'mntuser'] }
    }).then(async user => {
        if (!user) return returnError(req, 400, { psusrunm: "USERNOTFOUND" }, res);

        let obj = req.body;

        if (obj.psusrsts && obj.psusrsts != user.psusrsts) obj.psstsdt8 = new Date();
        obj.mntuser = req.user.psusrunm;
        obj.psusrunm = user.psusrunm;

        const new_psusrprf = {
            psusrunm: obj.psusrunm,
            psusrnam: obj.psusrnam,
            psusreml: obj.psusreml,
            psusrphn: obj.psusrphn,
            psusrsts: obj.psusrsts,
            psusrtyp: obj.psusrtyp,
            psusrrol: obj.psusrrol,
            psredind: obj.psredind,
        }

        await psusrprf.update(new_psusrprf,
            {
                where: {
                    id: user.id
                }
            }).then(async update => {
                // await psmbrcon.findOne({
                //     where: {
                //         psdrawid: req.body.id
                //     }, raw: true
                // }).then(async mbrcon => {
                //     if (mbrcon) {
                //         await psmbrcon.update({
                //             psmcntpn: obj.psusrnam,
                //             psmphone: obj.psusrphn,
                //             psmemail: obj.psusreml,
                //             psusrsts: obj.psusrsts,
                //             mntuser: req.user.psusrunm
                //         }, {
                //             where: {
                //                 id: mbrcon.id
                //             }
                //         }).then(async () => {
                //             common.writeMntLog('psmbrcon', mbrcon, await psmbrcon.findByPk(mbrcon.id, { raw: true }), mbrcon.psmberid, 'C', req.user.psusrunm);
                //             common.writeMntLog('psusrprf', update, await psusrprf.findOne({ where: { psusrunm: user.psusrunm }, raw: true }), user.psusrunm, 'C', user.psusrunm);
                //             return returnSuccessMessage(req, 200, "USERUPDATED", res);
                //         })
                //     }
                //     else {
                //         common.writeMntLog('psusrprf', update, await psusrprf.findOne({ where: { psusrunm: user.psusrunm }, raw: true }), user.psusrunm, 'C', user.psusrunm);
                //         return returnSuccessMessage(req, 200, "USERUPDATED", res);
                //     }
                // }).catch(err => {
                //     console.log(err);
                //     return returnError(req, 500, "UNEXPECTEDERROR", res);
                // });
                common.writeMntLog('psusrprf', update, await psusrprf.findOne({ where: { psusrunm: user.psusrunm }, raw: true }), user.psusrunm, 'C', user.psusrunm);
                return returnSuccessMessage(req, 200, "USERUPDATED", res);
            }).catch(err => {
                console.log(err);
                return returnError(req, 500, "UNEXPECTEDERROR", res);
            });
    }).catch(err => {
        console.log(err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
}

exports.delete = async (req, res) => {
    if (req.user.psusrtyp != 'ADM')
        return returnError(req, 500, "INVALIDAUTHORITY", res);

    const id = req.body.id ? req.body.id : '';
    if (id == '')
        return returnError(req, 500, "RECORDIDISREQUIRED", res);

    await psusrprf.findOne({
        where: {
            psusrunm: id,
        }, raw: true
    }).then(user => {
        if (user.psusrtyp != ' ADM')
            return returnError(req, 500, "USERACCOUNTCANTDELETE", res);
        if (user) {
            psusrprf.destroy({
                where: {
                    id: user.id
                }
            }).then(() => {
                common.writeMntLog('psusrprf', null, null, user.psusrunm, 'D', req.user.psusrunm);
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

exports.home = async (req, res) => {
    let user = {};
    let mbr = {};

    // if (req.user.psusrtyp == "MBR") {
    //     user = await psmbrcon.findOne({
    //         where: {
    //             psdrawid: req.user.psusrunm
    //         }, raw: true
    //     });
    //     mbr = await psmember.findOne({
    //         where: {
    //             psmberid: user.psmberid
    //         }, raw: true
    //     });
    // }

    // Check First Login
    let data = {};
    data.psusrtyp = req.user.psusrtyp;
    data.psusrunm = req.user.psusrunm;
    data.psusrnme = user && user.psmcntpn ? user.psmcntpn : req.user.psusrnam;
    data.psusrnam = user && user.psmcntpn ? user.psmcntpn : req.user.psusrnam;
    data.psmberid = req.user.psmberid;
    data.psusrals = req.user.psusrals;
    data.psmbrnam = mbr.psmbrnam;
    data.psmbdate = mbr.psmbdate;
    data.psmbbzrn = mbr.psmbbzrn;
    data.psmblicn = mbr.psmblicn;

    data.emlind = false;
    data.settfa = false;
    if (req.user.pschgpwd || req.user.psfstlgn) data.chgpwd = true;
    else data.chgpwd = false;

    if (!_.isEmpty(req.user.psusrrol)) {
        // Get Functions Count
        let func_count = await prfuncde.count();
        // Get Function Groups
        let grouped_functions = {};
        let error = false;
        let result = await common.redisGet("access_matrix-" + req.user.psusrrol).catch(err => {
            error = true;
        });

        if (error) {
            let fungrp = await common.retrieveGenCodes(req, 'FUNGRP');
            if (fungrp) {
                for (var i = 0; i < fungrp.length; i++) {
                    let grp = fungrp[i];
                    let functions = await prfuncde.findAll({
                        where: {
                            prfungrp: grp.prgecode
                        }, raw: true, attributes: {
                            exclude: ['createdAt', 'updatedAt', 'crtuser', 'mntuser']
                        }
                    });

                    let functions_arr = [];
                    for (var j = 0; j < functions.length; j++) {
                        let obj = functions[j];
                        let access = await prfunacs.findAll({
                            where: {
                                pracsfun: obj.prfuncde,
                                pracsrol: req.user.psusrrol,
                                pracssts: true
                            }, raw: true
                        });

                        let checked = await searchFunction(req, obj, access, func_count);
                        functions_arr.push({
                            prfuncde: checked.function,
                            prfunnme: checked.functiondsc,
                            prfunlnm: checked.functionlds,
                            prfunacs: obj.prfunsts ? checked.checked ? 1 : 0 : 0,
                            actions: checked.actions
                        });
                    }
                    grouped_functions[grp.prgecode] = functions_arr;
                }
            }
            data.access = grouped_functions;
        } else {
            if (!_.isEmpty(result)) {
                grouped_functions = result;//JSON.parse(result);
            } else if (_.isEmpty(result)) {
                let fungrp = await common.retrieveGenCodes(req, 'FUNGRP');
                if (fungrp) {
                    for (var i = 0; i < fungrp.length; i++) {
                        let grp = fungrp[i];
                        let functions = await prfuncde.findAll({
                            where: {
                                prfungrp: grp.prgecode
                            }, raw: true, attributes: {
                                exclude: ['createdAt', 'updatedAt', 'crtuser', 'mntuser']
                            }
                        });

                        let functions_arr = [];
                        for (var j = 0; j < functions.length; j++) {
                            let obj = functions[j];
                            let access = await prfunacs.findAll({
                                where: {
                                    pracsfun: obj.prfuncde,
                                    pracsrol: req.user.psusrrol,
                                    pracssts: true
                                }, raw: true
                            });

                            let checked = await searchFunction(req, obj, access, func_count);
                            functions_arr.push({
                                prfuncde: checked.function,
                                prfunnme: checked.functiondsc,
                                prfunlnm: checked.functionlds,
                                prfunacs: obj.prfunsts ? checked.checked ? 1 : 0 : 0,
                                actions: checked.actions
                            });
                        }
                        grouped_functions[grp.prgecode] = functions_arr;
                    }
                }
                await common.redisSet("access_matrix-" + req.user.psusrrol, JSON.stringify(grouped_functions));
            }
        }

        data.access = grouped_functions;
    } else data.access = [];
    return returnSuccess(200, data, res);
}

