var jwt = require('jsonwebtoken');

const fetchuser = (req, res, next) => { 
const token = req.header("auth-token")
if (!token) {
    res.status(401).send({ error: "please authenticate using a valid token" })
}
try {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing. Add it to backend/.env");
    }

    const data = jwt.verify(token, process.env.JWT_SECRET)
    req.user = data.user
    next();
} catch (error) {
    res.status(401).send({ error: "please authenticate using a valid token" })
}
}
;

module.exports = fetchuser;
