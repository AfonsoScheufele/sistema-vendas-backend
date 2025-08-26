const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization; // "Bearer <token>"
  if (!header) return res.status(401).json({ message: "Token não fornecido" });

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id: ... }
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
};
