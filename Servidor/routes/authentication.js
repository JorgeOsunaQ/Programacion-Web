const router= require("express").Router();
const bcrypt= require("bcrypt");
const jwt=require("jsonwebtoken");

module.exports= (models)=>{
    router.post("/register",async(req,res)=>{
        const user=req.body;
        const hash= await bcrypt.hash(user.password, +process.env.SALT_ROUNDS);

        user.password=hash;

        await models.usuarioModel.create(user);
        res.send({
            message: "Ok"
        })
    })

    const generateToken= (user)=>new Promise((resolve,reject)=> {
        try{
            const token= jwt.sign({
                username: user.username
            },process.env.SECRET_KEY);
            resolve(token);
        }catch(error)
        {
            reject(error);
        }
    })

    router.post("/login",async(req,res)=>{
        const wrongMessage={message: "User or password are wrong"}
        const userLogin= req.body;

        const user= await models.usuarioModel.findOne({where: {username: userLogin.username}});

        if(user){
            const hash = user.password;
            const result= await bcrypt.compare(userLogin.password, hash);

            if(result){
                const token= await generateToken(user)
                res.send({token})
            }
            else{
            res.status(403).send(wrongMessage);
            }
        }
        else{
            res.status(403).send(wrongMessage);
        }
    })

    return router
}