import bcrypt from 'bcrypt';
// password
export const hashPassword = (password) =>{
    try{
        const saltRounds= 10;
        const hashedPassword = bcrypt.hash(password,saltRounds);
        return hashedPassword
    }catch(error){
        console.log(error);
    }
};

export const comparePassword =(password,hashPassword) =>{
    return bcrypt.compare(password,hashPassword);
};

// answer
export const hashAnswer = (answer) =>{
    try{
        const saltRounds= 10;
        const hashedAnswer = bcrypt.hash(answer,saltRounds);
        return hashedAnswer
    }catch(error){
        console.log(error);
    }
};

export const compareAnswer =(answer,hashAnswer) =>{
    return bcrypt.compare(answer,hashAnswer);
};
