import { jest } from '@jest/globals';
import { config } from 'dotenv';

config();

jest.mock('mongoose', () => ({
  connect: jest.fn(),
  Schema: jest.fn(),
  model: jest.fn().mockReturnValue({
    find: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  }),
}));

process.env = {
  ...process.env,
  MONGODB_URI: 'mongodb://localhost:27017/testdb',
  JWT_SECRET: 'testsecret',
};