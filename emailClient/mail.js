const nodemailer=require('nodemailer');
const { IP_ADDRESS, FRONT_END_IP_ADDRESS } = require('../constants');
const emailAdress='nikolay.dimov83@gmail.com'
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'nikolay.dimov83@gmail.com',
      pass: 'dxvpsakhmnrjdmzg'
    }
  });

function serverSendMail(from,to,mailSubject,content){
const mailOptions={
  from: from,
  to: to,
  subject: mailSubject,
  html: content
}

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
})

}

function prepareMailContent(request){
  let lastComment=''
  if (request.comments){
    if(request.comments.length>0){
      if(request.comments[request.comments.length-1].body){
                  lastComment=`
Последен коментар: ${request.comments[request.comments.length-1].body}`
        }

      }
    }

  return `
  <div><a href=https://${FRONT_END_IP_ADDRESS}/dashboard/${request._id}>Plan B заявка с id:  <a/>
  По апликация ${request.iApplyId} 
  На клиент ${request.clientName}, 
  ЕГФН:${request.clientEGFN} 
  Статус: ${request.status.statusName}${lastComment}
  </div>`
  
}

  /*const mailOptions = {
    from: 'hello@example.com',
    to: 'ndimov@postbank.bg',
    subject: 'Subject',
    text: 'Email content'
  };*/
  
module.exports={serverSendMail,emailAdress,prepareMailContent};