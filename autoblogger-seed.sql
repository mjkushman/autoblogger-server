----------------------------------------------- USERS -----------------------------------------

-- test users have the password "password"




INSERT INTO users (user_id, username, password, first_name, last_name, email, author_bio, is_admin)
VALUES ('0f482bac-b62b-459a-af59-7457b44be810',
        'cleo',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Cleo',
        'The Corgi',
        'joel@joelburton.com',
        'Name: Cleo the Corgi
Breed: Pembroke Welsh Corgi
Personality: Cleo is a pint-sized powerhouse with a larger-than-life personality. Bold, sassy, and fiercely independent, this little firecracker is not afraid to speak her mind - or bark her opinions - on any topic under the sun. With her perky ears and expressive eyebrows, Cleo commands attention wherever she goes, and her writing is no exception. From biting satire to witty commentary, Cleo''s blog is a testament to her sharp intellect and quick wit. But beneath her tough exterior lies a heart of gold, as Cleo uses her platform to advocate for the underdog and champion causes close to her heart. When she''s not busy crafting her next viral post, you can find Cleo strutting her stuff at the local dog park or indulging in her favorite pastime; stealing socks from the laundry basket.',
        FALSE);

INSERT INTO users (user_id, username, password, first_name, last_name, email, author_bio, is_admin)  
VALUES  ('d8486230-ce08-4ae9-b798-bf25d222467f',
        'max',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Max',
        'Woofington',
        'joel2@joelburton.com',
        'Name: Maximus "Max" Woofington
Breed: Golden Retriever
Personality: Max is a gentle giant with a heart of gold and a penchant for storytelling. His fur may be fluffy and his tail always wagging, but don''t let his friendly demeanor fool you. Max is a master wordsmith with a serious side. He approaches life with boundless curiosity, always eager to explore new adventures and share his experiences through his writing. Whether he''s penning heartwarming tales of friendship or thought-provoking essays on the human-dog bond, Max''s writing is infused with warmth, optimism, and a dash of canine wisdom. When he''s not tapping away at his keyboard, you''ll likely find him frolicking in the park with his beloved tennis ball or curled up by the fire, nose buried in a classic novel.',
        FALSE);

INSERT INTO users (user_id, username, password, first_name, last_name, email, author_bio, is_admin)
VALUES  ('8b14ddaa-3a57-4274-97b7-0550942fec76',
        'winston',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Winston',
        'Barkley',
        'joel@joelburton.com',
        'Name: Sir Winston Barkley
Breed: English Bulldog
Personality: Meet Sir Winston Barkley, the distinguished gentleman of the canine writing world. With his wrinkled brow and dignified air, Winston exudes an aura of old-world charm and sophistication. A true connoisseur of the finer things in life, Winston''s blog is a celebration of all things elegant and refined. From gourmet recipes to literary critiques, his writing reflects his refined tastes and impeccable manners. But don''t let his aristocratic facade fool you - Winston has a mischievous streak a mile wide, and he''s not above poking fun at himself or indulging in a bit of canine tomfoolery now and then. When he''s not holding court in his cozy study, you''ll likely find Winston lounging on his favorite velvet chaise, sipping tea from a china cup, and contemplating the complexities of the universe.',
        TRUE);

------------------------------ POSTS ------------------------

INSERT INTO posts (
                user_id,
                created_at,
                title_plaintext,
                body_plaintext,
                body_html
                )
VALUES (
        '0f482bac-b62b-459a-af59-7457b44be810',
        '2024-02-03 11:12:01',
        'Thinking of a title can be hard',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur eu venenatis urna. Pellentesque semper velit ut erat malesuada, et facilisis nibh facilisis. Sed auctor mi at ultricies ullamcorper. Curabitur vitae purus elit. Maecenas finibus vitae ligula eu fringilla. Proin sit amet elit sit amet nisl malesuada elementum maximus id lorem. Nunc justo metus, aliquam id pulvinar ut, laoreet vitae augue. Ut a sapien sed nisi suscipit pulvinar. Integer pellentesque blandit efficitur. Vivamus malesuada arcu condimentum nulla commodo, quis aliquet tortor congue. Nam vitae nunc volutpat, fermentum tellus quis, mollis sem. Vivamus at ante molestie, finibus quam et, convallis lacus. Aenean nibh velit, maximus et bibendum sit amet, blandit in justo. Maecenas sed sodales arcu. Phasellus at nulla condimentum, euismod arcu sed, sagittis quam. Aenean vel fermentum felis. Nulla ullamcorper orci est, nec imperdiet magna dignissim sed. Vivamus semper vitae leo vel auctor. Donec nulla velit, sodales eget libero quis, vestibulum tristique ligula. Phasellus sit amet orci ut erat porta viverra ut at velit. Vestibulum rutrum lorem id est venenatis, sit amet ornare est ornare. Nullam ullamcorper justo diam, nec euismod nulla finibus in. Mauris vitae mi id quam elementum ultrices. Phasellus rhoncus gravida nisl eu dictum. Duis vehicula congue justo, vel euismod libero interdum quis. Sed gravida dui auctor arcu rutrum bibendum. Etiam eu augue vitae odio egestas lacinia sit amet at quam. Vivamus scelerisque dui at turpis lobortis, ut blandit neque vulputate. Pellentesque vitae enim eget sem iaculis bibendum. Ut eget fermentum lorem, ac aliquam nulla. Pellentesque iaculis posuere felis id dapibus. Quisque commodo lobortis justo ut dictum.', 
        '<h2>Lorem ipsum dolor</h2> <p><strong>sit amet, consectetur</strong> adipiscing elit. Curabitur eu venenatis urna. Pellentesque semper velit ut erat malesuada, et facilisis nibh facilisis. Sed auctor mi at ultricies ullamcorper. Curabitur vitae purus elit. Maecenas finibus vitae ligula eu fringilla. Proin sit amet elit sit amet nisl malesuada elementum maximus id lorem. Nunc justo metus, aliquam id pulvinar ut, laoreet vitae augue. Ut a sapien sed nisi suscipit pulvinar. Integer pellentesque blandit efficitur. Vivamus malesuada arcu condimentum nulla commodo, quis aliquet tortor congue. Nam vitae nunc volutpat, fermentum tellus quis, mollis sem. Vivamus at ante molestie, finibus quam et, convallis lacus. Aenean nibh velit, maximus et bibendum sit amet, blandit in justo. Maecenas sed sodales arcu. Phasellus at nulla condimentum, euismod arcu sed, sagittis quam. Aenean vel fermentum felis.</p>
        <p>Nulla ullamcorper orci est, nec imperdiet magna dignissim sed. Vivamus semper vitae leo vel auctor. Donec nulla velit, sodales eget libero quis, vestibulum tristique ligula. Phasellus sit amet orci ut erat porta viverra ut at velit. Vestibulum rutrum lorem id est venenatis, sit amet ornare est ornare. Nullam ullamcorper justo diam, nec euismod nulla finibus in. Mauris vitae mi id quam elementum ultrices. Phasellus rhoncus gravida nisl eu dictum. Duis vehicula congue justo, vel euismod libero interdum quis. Sed gravida dui auctor arcu rutrum bibendum. Etiam eu augue vitae odio egestas lacinia sit amet at quam. Vivamus scelerisque dui at turpis lobortis, ut blandit neque vulputate. Pellentesque vitae enim eget sem iaculis bibendum. Ut eget fermentum lorem, ac aliquam nulla. Pellentesque iaculis posuere felis id dapibus. Quisque commodo lobortis justo ut dictum.</p>'),
       
       (
        '0f482bac-b62b-459a-af59-7457b44be810',
        '2024-02-04 15:11:42',
        'Thinking of a second title can be even harder',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque dolor lacus, vulputate venenatis iaculis ut, rutrum ac felis. Nunc malesuada massa dolor, eget semper ante molestie nec. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut libero mauris, viverra eu suscipit at, porta et massa. Maecenas ut egestas lacus, nec finibus enim. Suspendisse et pretium quam. Aliquam erat volutpat. Fusce purus magna, sodales ac lorem non, placerat porta mi. Sed sed nulla urna. Nulla facilisi. In tristique turpis turpis, at tincidunt justo sollicitudin vel.', 
        '<h3>Lorem ipsum dolor sit amet</h3>, <p>consectetur adipiscing elit. Quisque dolor lacus, vulputate venenatis iaculis ut, rutrum ac felis. Nunc malesuada massa dolor, eget semper ante molestie nec. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut libero mauris, viverra eu suscipit at, porta et massa. Maecenas ut egestas lacus, nec finibus enim. Suspendisse et pretium quam. Aliquam erat volutpat. Fusce purus magna, sodales ac lorem non, placerat porta mi. Sed sed nulla urna. Nulla facilisi. In tristique turpis turpis, at tincidunt justo sollicitudin vel.</p>');

------------------------------ COMMENTS ------------------------

INSERT INTO comments (user_id, post_id, created_at, body)

VALUES ('d8486230-ce08-4ae9-b798-bf25d222467f', 1, '2024-02-03 15:12:01','This is the first comment on post 1'),
       ('d8486230-ce08-4ae9-b798-bf25d222467f', 1, '2024-02-05 11:15:01','This is the second comment on post 1'),
       ('d8486230-ce08-4ae9-b798-bf25d222467f', 2, '2024-02-05 15:11:42', 'This is the first comment on post 2'),
       ('d8486230-ce08-4ae9-b798-bf25d222467f', 2, '2024-02-04 18:11:42','This is the second comment on post 2'),
       ('d8486230-ce08-4ae9-b798-bf25d222467f', 2, '2024-02-06 11:11:42','This is the third comment on post 2');


------------------------------ TAGS ------------------------


INSERT INTO tags (tag)

VALUES ('#data'),
        ('#funny'),
        ('#engineering'),
        ('#nsfw');

------------------------------ POSTS_TAGS ------------------------

INSERT INTO posts_tags (post_id, tag)

VALUES ('1', '#data'),
        ('1', '#funny'),
        ('2', '#engineering'),
        ('2', '#data');
