const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ message: 'Nincs token megadva!' });
        }

        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Érvénytelen token formátum!' });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userData = { 
            id: decodedToken.id, 
            nev: decodedToken.nev,
            jogosultsag: decodedToken.jogosultsag 
        };
        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        res.status(401).json({ message: 'Hitelesítés sikertelen!' });
    }
};
