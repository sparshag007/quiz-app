import jwt from 'jsonwebtoken';

const secretKey = process.env.SECRET_KEY || 'your_secret_key';

export const generateToken = (id: number, email: string, role: string) => {
  return jwt.sign({ id, email, role }, secretKey, { expiresIn: '1h' });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, secretKey);
};
