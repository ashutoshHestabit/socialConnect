import request from 'supertest';
import app from '../../app.js';
import Post from '../../models/Post.js';
import User from '../../models/User.js';

describe('Like Controller', () => {
  let authToken, postId;

  beforeAll(async () => {
    // Create user and post
    const user = await User.create({
      username: 'likeuser',
      email: 'like@example.com',
      password: 'password123',
    });
    
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({
        email: 'like@example.com',
        password: 'password123',
      });
      
    authToken = loginRes.body.token;
    
    const post = await Post.create({
      content: 'Test post for likes',
      author: user._id,
    });
    
    postId = post._id;
  });

  afterAll(async () => {
    await User.deleteMany();
    await Post.deleteMany();
  });

  describe('PUT /api/posts/:id/like', () => {
    it('should like/unlike a post', async () => {
      // First like
      let res = await request(app)
        .put(`/api/posts/${postId}/like`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.likes).toHaveLength(1);

      // Second request to unlike
      res = await request(app)
        .put(`/api/posts/${postId}/like`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.likes).toHaveLength(0);
    });
  });
});