import jwt from 'jsonwebtoken';

const isAuthenticated = async (req, res, next) =>{
try{
    const token  = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            message: "Unauthorized access",
            success: false
        });
    }

    const decode = await jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
        return res.status(401).json({
            message: "Unauthorized access",
            success: false
        });
    }

    req.id = decode.userId;
    next();
}
catch (error) {
    // token expired or invalid -> user has to login again (401, not 500)
    return res.status(401).json({
        message: "Session expired, please login again",
        success: false
    });
}
}

export default isAuthenticated;