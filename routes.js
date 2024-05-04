const adminUsersRightsControler = require("./controllers/adminUsersRightsControler");
const authController = require("./controllers/authController");
const changeIapplyController = require("./controllers/changeIapplyController");
const changeStatusController = require("./controllers/changeStatusController");
const commentsController = require("./controllers/commentsController");
const createController = require("./controllers/createController");
const dataController = require("./controllers/dataController");
const editController = require("./controllers/editController");
const fileUploadsController = require("./controllers/fileUploadsController");
const iApplyConroller = require("./controllers/iapplyDataController");
const loggerController = require("./controllers/loggerControler");
const reportsContoller = require("./controllers/reportsController");
const searchController = require("./controllers/searchController");
const unknownController = require("./controllers/unknownController");
const workflowController = require("./controllers/workflowController");


module.exports=(app)=>{

    try {
    app.use('/users',authController);
    app.use('/data/catalog',dataController);
    app.use('/data/create',createController);
    app.use('/data/edit',editController);
    app.use('/iApply',iApplyConroller);
    app.use('/data/changeStatus',changeStatusController);
    app.use('/comments',commentsController);
    app.use('/search',searchController);
    app.use('/reportsController',reportsContoller);
    app.use('/changeIApply',changeIapplyController);
    app.use('/admin',adminUsersRightsControler);
    app.use('/workflow',workflowController);
    app.use('/wrongDataLogger',loggerController)
    app.use('/files', fileUploadsController);
    app.use('*',unknownController);        
    } catch (error) {
        app.use((req,res,next)=>{
            console.log('Uncaught error')
            res.status=501
            res.json(error)
            next()
        })
    }

    

}