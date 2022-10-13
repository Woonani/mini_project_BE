const express = require('express');
const User = require('../models/user');
const { verifyToken } = require('../library/middlewares');
const bcrypt = require('bcrypt');
const router = express.Router();
const ErrorResponse = require('../utils/errorResponse')
const jwt = require('jsonwebtoken'); 


router
  .get('/me',async (req, res, next) => {
  const user = {}
    let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }
  
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401))
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findByPk(decoded.id)
    // console.log(req.user)
    user.data= req.user.dataValues
   
    console.log(user)
    res.status(200).json({ success: true, data: user })
  } catch (err) {
    console.log(err)
    return next(new ErrorResponse('Not authorized to access this route', 401))
  }
});

router.patch('/:userId', verifyToken, async (req, res, next) => {
    try {
      const {password, name, className, phoneNum} = req.body;

      console.log(password, name, className, phoneNum)
      const hash = await bcrypt.hash(password, 12);
      const updatedCount = 
      await User.update({ 
        password: hash,
        name, 
        className, 
        phoneNum },
        { where: {id: req.params.userId }}); // 포스트맨 확인하려고 req.decoded.id 를 req.body.id로 바꿈
        
      console.log("updatedCount",updatedCount)
      res.json({
        code: 200,
        message: `수정됐습니다 : ${req.body.password} ${req.body.name} ${req.body.className} ${req.body.phoneNum}`,
      });
    } catch(error) {
      console.error(error);
      next(error);
    }
  })
  // router.delete('/', verifyToken, async (req, res)=>{
  //   try {
  //     const deleteUser = await User.findOne({where: { id: req.decoded.id}}) // 포스트맨 확인하려고 req.decoded.id 를 req.body.id로 바꿈
  //     console.log('deleteUser: '+ deleteUser);
  //     if(deleteUser){
  //       await User.destroy({where: {id: deleteUser.id}});
  //       res.json({
  //           code: 200,
  //           message: ' 회원 탈퇴 성공!',
  //       })
  //     }else{
  //       res.send(" 삭제할 유저가 없습니다.")
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  //   })

module.exports = router;