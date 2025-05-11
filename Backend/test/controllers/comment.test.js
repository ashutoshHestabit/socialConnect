import request from 'supertest';
import app from '../../app.js';
import Post from '../../models/Post.js';
import Comment from '../../models/Comment.js';
import User from '../../models/User.js';

describe('Comment Controller', () => {
  let authToken, postId;

  beforeAll(async () => {
    // Create user and post
    const user = await User.create({
      username: 'commentuser',
      email: 'comment@example.com',
      password: 'password123',
    });
    
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({
        email: 'comment@example.com',
        password: 'password123',
      });
      
    authToken = loginRes.body.token;
    
    const post = await Post.create({
      content: 'Test post for comments',
      author: user._id,
    });
    
    postId = post._id;
  });

  afterAll(async () => {
    await User.deleteMany();
    await Post.deleteMany();
    await Comment.deleteMany();
  });

  describe('POST /api/comments', () => {
    it('should create a new comment', async () => {
      const res = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          post: postId,
          content: 'Test comment',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
    });
  });

  describe('DELETE /api/comments/:id', () => {
    it('should delete a comment', async () => {
      const comment = await Comment.create({
        post: postId,
        author: (await User.findOne({ email: 'comment@example.com' }))._id,
        content: 'Test comment',
      });

      const res = await request(app)
        .delete(`/api/comments/${comment._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
    });
  });
});