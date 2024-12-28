// const bcrypt = require("bcrypt");

// const db = require("../db.js");
// const { BCRYPT_WORK_FACTOR } = require("../config");


// let postIds =[];
// let userIds =[];
// let commentIds =[];
// /** Set up some test data in the db */
// async function commonBeforeAll() {
//   // clear any remnant data
//   await db.query("DELETE FROM users");
//   await db.query("DELETE FROM posts");
//   await db.query("DELETE FROM comments");

//   // Add 3 users to the db.
//   // hash the password "123456" for storage
//   const userResult = await db.query(
//     `
//     INSERT INTO users (
//         user_id,
//         username, 
//         password, 
//         first_name, 
//         last_name, 
//         email, 
//         author_bio, 
//         image_url, 
//         is_author)
    
//         VALUES ('c2250ab6-5a6b-4ca0-9052-35db36ff6e79','testuser1', $1, 'testuser1_firstname', 'testuser1_lastname', 'testuser1@gmail.com', 'Author Bio for Testuser 1. Testuser 1 has always been a great testuser. Loves to test things.', 'https://picsum.photos/500', true),

//         ('086dce09-233f-4880-81ed-08c93bd4c660', 'testuser2', $2, 'testuser2_firstname', 'testuser2_lastname', 'testuser2@gmail.com', 'Author Bio for Testuser 2. Testuser 2 has always been a great testuser. Loves to test things.', 'https://picsum.photos/500', true), 

//         ('8cd9ca57-449c-43b4-90ea-24826cd52ce7','testuser3', $3, 'testuser3_firstname', 'testuser3_lastname', 'testuser3@gmail.com', 'testuser3 is not an author', 'https://picsum.photos/500', false)
//     RETURNING user_id`,
//     [
//       await bcrypt.hash("123456", BCRYPT_WORK_FACTOR),
//       await bcrypt.hash("123456", BCRYPT_WORK_FACTOR),
//       await bcrypt.hash("123456", BCRYPT_WORK_FACTOR),
//     ]
//   );

//   for(let id of userResult.rows.map((r) => r.user_id)){
//     userIds.push(id)
//   }
//   console.log('USERIDS',userIds)
  
//   // add 2 posts to the db. One post for testuser1 and another post for testuser2
//   const postResult = await db.query(`
    
//     INSERT INTO posts (
//         post_id,
//         user_id,
//         created_at,
//         title_plaintext,
//         title_html,
//         body_plaintext,
//         body_html,
//         image_url,
//         slug
//         )
//     VALUES (
//     'aaaaaa',
//     $1,
//     '2024-02-03 11:12:01',
//     'Test Post 1 Title plaintext',
//     '<h1>Test Post 1 Title html</h1>',
//     'Test Post 1 Body plaintext', 
//     '<div id=\"primary-content\"> <p>Test post 1 body html</p> </div >',
//     'https://images.unsplash.com/photo-1664575196851-5318f32c3f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Njg0MzB8MHwxfHNlYXJjaHwxfHx3cml0ZXJ8ZW58MHx8fHwxNzA4ODkwNzUzfDA&ixlib=rb-4.0.3&q=80&w=1080',
//     'test-post-1-slug'),
//     ('bbbbbb',
//     $2,
//     '2024-02-04 11:12:01',
//     'Test Post 2 Title plaintext',
//     '<h1>Test Post 2 Title html</h1>',
//     'Test Post 2 Body plaintext', 
//     '<div id=\"primary-content\"> <p>Test post 2 body html</p> </div >',
//     'https://images.unsplash.com/photo-1664575196851-5318f32c3f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Njg0MzB8MHwxfHNlYXJjaHwxfHx3cml0ZXJ8ZW58MHx8fHwxNzA4ODkwNzUzfDA&ixlib=rb-4.0.3&q=80&w=1080',
//     'test-post-2-slug')
//     RETURNING post_id`,[
//         userIds[0], userIds[1]
//     ]);
//     for(let id of postResult.rows.map((r) => r.post_id)){
//         postIds.push(id)
//     }
//     console.log('POSTIDS',postIds)

//     // Add a COMMENT to post 1 and a comment to post 2

//   const commentResult = await db.query(`
    
//   INSERT INTO comments (
//       post_id,
//       user_id,
//       body
//       )
//   VALUES
//     ('aaaaaa', $1, 'Test comment body 1'),
//     ('bbbbbb', $2, 'Test comment body 2')
//   RETURNING comment_id`,[
//       userIds[0], userIds[1]
//   ]);
//   for(let id of commentResult.rows.map((r) => r.comment_id)){
//       commentIds.push(id)
//   }
//   console.log('POSTIDS',postIds)
    
// }



// /** start new transaction */
// async function commonBeforeEach() {
//   await db.query("BEGIN");
// }
// /** ROLLBACk any changes after every test */
// async function commonAfterEach() {
//   await db.query("ROLLBACK");
// }

// /** close the connection */
// async function commonAfterAll() {
//   await db.end();
// }

// module.exports = {
//   commonBeforeAll,
//   commonBeforeEach,
//   commonAfterEach,
//   commonAfterAll,
//   postIds,
//   userIds,
//   commentIds
// };
