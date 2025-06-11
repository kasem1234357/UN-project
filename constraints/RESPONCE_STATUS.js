const responce_status ={
    default:{
    status:200,
    msg:'operation work successefly'
    },
    create:{
        status:201,
        msg:'new item created'
    },
    upload:{
      status:201,
      msg:'new media uploaded'
  },
    update:{
        status:201,
        msg:'data updated'
    },
    delete:{
      status:201,
      msg:'item deleted'
    },
    fetch:{
        status:200,
        msg:'data resolved correctly'  
    },
    uncomplated_data:{
       status:400,
       msg:'data not complated'
    },
    not_found:{
       status:404,
       msg:'item not found'
    },
    payment_required:{
       status:402,
       msg:'user not comleted paymenet way or he dont have a enough money'
    },
    invalid:{
      status:401,
      msg:'data have invalid item'
    },
    unauthorized:{
      status:401,
      msg:'this response means unauthenticated' 
    },
    Forbidden:{
        status:403,
        msg:'user dont have access to this url'
    },
    permission_error:{
      status:403,
      msg:`you don't have permissions to perform this action `
    },
    server_error:{
    status:500,
    msg:'some thing going wrong'
    }
}

module.exports = {responce_status}