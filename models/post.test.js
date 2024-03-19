"use strict";

const db = require('../db.js')
const Post = require('./post.js'
)
const {commonBeforeAll, 
    commonAfterAll, 
    commonBeforeEach, 
    commonAfterEach, postIds, userIds} = require('./_testCommon.js')


// Run setup
beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach)
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("Get posts and GET methods", () => {
    test("Get all posts", async () => {
        let posts = await Post.getAllPosts();
        console.log(posts)
        expect(posts.length).toBeGreaterThan(0)
    })

    test("Get a single post", async () => {

        let postResponse = await Post.getSinglePost(postIds[0])
        console.log(postResponse)
        expect(postResponse.post).toBeDefined()
        expect(postResponse.post.postId).toEqual(postIds[0])
        expect(postResponse.post.userId).toBeDefined()
        expect(postResponse.post.titlePlaintext).toEqual(expect.any(String))
    })
})

describe("POST post methods", () => {
    
    
    test('Can create a new post', async () => {
        const newTestPost = {
            userId: userIds[0],
            titleHtml: '<h1>New Post Title</h1>',
            titlePlaintext: 'New Post Title',
            bodyHtml:'<p>New Body</p>',
            bodyPlaintext:'New Body',
            imageUrl:'https://images.unsplash.com/photo-1664575196851-5318f32c3f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Njg0MzB8MHwxfHNlYXJjaHwxfHx3cml0ZXJ8ZW58MHx8fHwxNzA4ODkwNzUzfDA&ixlib=rb-4.0.3&q=80&w=1080'
        }

        let newPostResponse = await Post.createNewPost(newTestPost)
        
        expect(newPostResponse.postId).toBeDefined();
        expect(newPostResponse.userId).toEqual(userIds[0])
    })
    test('Response with error if userId is not provided', async () => {
        const newTestPost = {
            userId: null,
            titleHtml: '<h1>New Post Title</h1>',
            titlePlaintext: 'New Post Title',
            bodyHtml:'<p>New Body</p>',
            bodyPlaintext:'New Body',
            imageUrl:'https://images.unsplash.com/photo-1664575196851-5318f32c3f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Njg0MzB8MHwxfHNlYXJjaHwxfHx3cml0ZXJ8ZW58MHx8fHwxNzA4ODkwNzUzfDA&ixlib=rb-4.0.3&q=80&w=1080'
        }
        
        try {
            await Post.createNewPost(newTestPost)
        } catch (error) {
            expect(error instanceof ExpressError).toBeTruthy();
        }
    })
})