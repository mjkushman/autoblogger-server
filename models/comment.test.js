"use strict";

const db = require('../db.js')
const Comment = require('./comment.js'
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

/** Run tests for Comments */
describe("Get comments and GET methods", () => {
    test("Get all comments for a post", async () => {
        let commentResponse = await Comment.getComments(postIds[0]);
        
        console.log("TYPE OF",typeof(commentResponse.comments[0].createdAt))

        expect(Number(commentResponse.numComments.numComments)).toBeGreaterThan(0)
        expect(commentResponse.comments[0].createdAt).toBeInstanceOf(Date)
        expect(commentResponse.comments[0].userId).toBeDefined()
    })

    test("Get a single post", async () => {
    })
})


describe("Comment POST methods", () => {
    
    
    test('Can create a new comment', async () => {
        const newTestComment = {
            userId: userIds[0],
            body: 'Test New Comment Body Title'
        }

        let newCommentResponse = await Comment.addComment(postIds[1], newTestComment)
        console.log(newCommentResponse)
        
        expect(newCommentResponse.body).toBe('Test New Comment Body Title');
        expect(newCommentResponse.comment_id).toBeDefined()
    })
})