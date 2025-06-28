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
    console.error("Error in isAuthenticated middleware:", error);
    return res.status(500).json({
        message: "Internal server error",
        success: false
    });
}
}

export default isAuthenticated;