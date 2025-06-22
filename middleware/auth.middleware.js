export const protect = async (req, res, next) => {
    let token;

    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ){
        try {
            // get token from header

            token = req.headers.authorization.split(' ')[1];

            // verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // check if user still exists
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({message: 'Not authorized, token failed' });
        }
    }

    if(!token){
        return res.status(401).json({message: 'Not authorized, no token' });
    }
}

export const auditLog = (action) => {
    return async (req, res, next) =>{
        req.auditAction = action;
        next();
    }
}