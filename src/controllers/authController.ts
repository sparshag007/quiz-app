import { Request, RequestHandler, Response } from 'express';
import bcrypt from 'bcrypt';
import {User} from '../database/models/User';
import { generateToken, verifyToken } from '../utils/jwtUtils';
import log from "../utils/logger";
import { JwtPayloadWithRole } from '../types/jwt';

const saltRounds = parseInt(process.env.SALT_ROUNDS || "10", 10);

export const registerUser : RequestHandler = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: 'All fields are required: username, email, and password' });
      return;
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'Email already in use' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

    const token = generateToken(newUser.id, newUser.email, newUser.role);

    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    log.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const loginUser: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'All fields are required: username, email, and password' });
      return;
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user.id, user.email, user.role);

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    log.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const checkToken: RequestHandler = async (req: Request, res: Response) => {
  const token = req.headers['authorization'];

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  try {
    const user = await verifyToken(token);
    res.status(200).json({ message: 'Token is valid', user });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

