import request from 'supertest';
import app from '../../app.js';
import Post from '../../models/Post.js';
import User from '../../models/User.js';

describe('Post Controller', () => {
  let authToken;

  beforeAll(async () => {
    // Create user and get token
    const user = await User.create({
      username: 'postuser',
      email: 'post@example.com',
      password: 'password123',
    });
    
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'post@example.com',
        password: 'password123',
      });
      
    authToken = res.body.token;
  });

  afterAll(async () => {
    await User.deleteMany();
    await Post.deleteMany();
  });

  describe('POST /api/posts', () => {
    it('should create a new post', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .field('content', 'Test post content')
        .attach('image', 'test/fixtures/test-image.jpg');

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
    });
  });

  describe('GET /api/posts', () => {
    it('should get all posts', async () => {
      const res = await request(app)
        .get('/api/posts');

      expect(res.statusCode).toEqual(200);
      expect(res.body.posts).toBeInstanceOf(Array);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete a post', async () => {
      const post = await Post.create({
        content: 'Test post',
        author: (await User.findOne({ email: 'post@example.com' }))._id,
      });

      const res = await request(app)
        .delete(`/api/posts/${post._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
    });
  });
});