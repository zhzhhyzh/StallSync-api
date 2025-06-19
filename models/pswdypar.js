//Holiday Parameter
module.exports = (sequelize, Sequelize) => {
    const pswdypar = sequelize.define("pswdypar", {
        pswdycde: {
            type: Sequelize.STRING(10),
            allowNull: false
            //Working Day Code - DAY
        },

        pswdydsc: {
            type: Sequelize.STRING(255),
            allowNull: false
            //Desgination Description
        },
        pswdylds: {
            type: Sequelize.STRING(255),
            //Desgination Local Description
        },
       
        pswdyind: {
            type: Sequelize.STRING(10),
            defaultValue:"Y"
            //Workday Indicator - YESORNO  
        },
      
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
                    fields: ['pswdycde']
                }
            ]
        });

    return pswdypar;
};