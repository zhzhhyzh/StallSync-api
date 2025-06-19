//Holiday Parameter
module.exports = (sequelize, Sequelize) => {
    const psholpar = sequelize.define("psholpar", {
        psholcde: {
            type: Sequelize.STRING(255),
            allowNull: false
            //Holiday Code
        },

        psholdsc: {
            type: Sequelize.STRING(255),
            allowNull: false
            //Desgination Description
        },
        pshollds: {
            type: Sequelize.STRING(255),
            //Desgination Local Description
        },
        psholtyp: {
            type: Sequelize.STRING(10),
            defaultValue: "F"
            , allowNull: false
            //Holiday Type - HOLTYPE
        },
        psholdat: {
            type: Sequelize.DATE,
            allowNull:false
            //Holiday date
        },
        // psholday: {
        //     type: Sequelize.INTEGER,
        //     defaultValue: 1,
        //     //Holiday Sequence
        // },
        // psholsts: {
        //     type: Sequelize.STRING(10),
        //     allowNull: false,
        //     defaultValue:"Y"
        //     //Holiday Status - YESORNO  
        // },
        // psholstd: {
        //     type: Sequelize.DATE,
        //     defaultValue: new Date()
        //     //Status date
        // },
        crtuser: {
            type: Sequelize.STRING(25),
            allowNull: false
            // Creation User
        },
        mntuser: {
            type: Sequelize.STRING(25),
            allowNull: false
            // Last Maintained User
        }
    }, { freezeTableName: true },
        {
            indexes: [
                {
                    fields: ['psholcde']
                }
            ]
        });

    return psholpar;
};