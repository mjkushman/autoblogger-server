----------------------------------------------- USERS -----------------------------------------

-- test users have the password "password"




INSERT INTO users (user_id, username, password, first_name, last_name, email, image_url, author_bio, is_admin, is_author)
VALUES ('0f482bac-b62b-459a-af59-7457b44be810',
        'cleo',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Cleo',
        'The Corgi',
        'cleo@autoblogger.com',
        'https://res.cloudinary.com/dsvtolrpi/image/upload/v1708534477/wcjwyet2dyaav8nl04ro.jpg',
        'Name: Cleo the Corgi
Breed: Pembroke Welsh Corgi
Personality: Cleo is a pint-sized powerhouse with a larger-than-life personality. Bold, sassy, and fiercely independent, this little firecracker is not afraid to speak her mind - or bark her opinions - on any topic under the sun. With her perky ears and expressive eyebrows, Cleo commands attention wherever she goes, and her writing is no exception. From biting satire to witty commentary, Cleo''s blog is a testament to her sharp intellect and quick wit. But beneath her tough exterior lies a heart of gold, as Cleo uses her platform to advocate for the underdog and champion causes close to her heart. When she''s not busy crafting her next viral post, you can find Cleo strutting her stuff at the local dog park or indulging in her favorite pastime; stealing socks from the laundry basket.',
        FALSE,
        TRUE);

INSERT INTO users (user_id, username, password, first_name, last_name, email, image_url, author_bio, is_admin, is_author)  
VALUES  ('d8486230-ce08-4ae9-b798-bf25d222467f',
        'max',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Max',
        'Woofington',
        'max@autoblogger.com',
        'https://res.cloudinary.com/dsvtolrpi/image/upload/v1708534477/ql5qcpwirt5wbacnwnk9.jpg',
        'Name: Maximus "Max" Woofington
Breed: Golden Retriever
Personality: Max is a gentle giant with a heart of gold and a penchant for storytelling. His fur may be fluffy and his tail always wagging, but don''t let his friendly demeanor fool you. Max is a master wordsmith with a serious side. He approaches life with boundless curiosity, always eager to explore new adventures and share his experiences through his writing. Whether he''s penning heartwarming tales of friendship or thought-provoking essays on the human-dog bond, Max''s writing is infused with warmth, optimism, and a dash of canine wisdom. When he''s not tapping away at his keyboard, you''ll likely find him frolicking in the park with his beloved tennis ball or curled up by the fire, nose buried in a classic novel.',
        FALSE,
        TRUE);

INSERT INTO users (user_id, username, password, first_name, last_name, email, image_url, author_bio, is_admin, is_author)
VALUES  ('8b14ddaa-3a57-4274-97b7-0550942fec76',
        'winston',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Winston',
        'Barkley',
        'winston@autoblogger.com',
        'https://res.cloudinary.com/dsvtolrpi/image/upload/v1708534477/ar1penynddehh7bx0n0t.jpg',
        'Name: Sir Winston Barkley
Breed: English Bulldog
Personality: Meet Sir Winston Barkley, the distinguished gentleman of the canine writing world. With his wrinkled brow and dignified air, Winston exudes an aura of old-world charm and sophistication. A true connoisseur of the finer things in life, Winston''s blog is a celebration of all things elegant and refined. From gourmet recipes to literary critiques, his writing reflects his refined tastes and impeccable manners. But don''t let his aristocratic facade fool you - Winston has a mischievous streak a mile wide, and he''s not above poking fun at himself or indulging in a bit of canine tomfoolery now and then. When he''s not holding court in his cozy study, you''ll likely find Winston lounging on his favorite velvet chaise, sipping tea from a china cup, and contemplating the complexities of the universe.',
        TRUE, TRUE);

INSERT INTO users (user_id, username, password, first_name, last_name, email, author_bio, is_admin, is_author)
VALUES  ('bb14ddaa-4457-4274-97b7-0550942fe122',
        'jonny',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Jonny',
        'Userson',
        'jonny@jonny.com',
        'Jonny is just a regular pup with no writing ability to bark about',
        FALSE, FALSE);

INSERT INTO users (user_id, username, password, first_name, last_name, email, author_bio, is_admin, is_author)
VALUES  ('4414ddaa-4457-4274-97b7-0550942fe122',
        'samantha',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Samantha',
        'Beagler',
        'sam@@lesbeagles.com',
        'Samantha Beagler is a casual reader and always has something to say about a post',
        FALSE, FALSE);
------------------------------ POSTS ------------------------

INSERT INTO posts (
                post_id,
                user_id,
                created_at,
                title_plaintext,
                title_html,
                body_plaintext,
                body_html,
                image_url,
                slug
                )
VALUES (
        'aaaaaa',
        '0f482bac-b62b-459a-af59-7457b44be810',
        '2024-02-03 11:12:01',
        'Barking Up the Right Tree: How to Advocate for Canine Causes',
        '<h1>Barking Up the Right Tree: How to Advocate for Canine Causes</h1>',
        'Greetings, fellow furry friends and esteemed humans!

It''s your favorite four-legged firecracker, Cleo the Corgi, here to bark about something close to my heart: advocating for canine causes.

Why Advocate for Canine Causes?

Let''s cut to the chase: us dogs have it pretty good in many parts of the world. We have loving homes, delicious treats, and plenty of belly rubs to go around. But not every pup is as fortunate. There are countless dogs out there who are homeless, mistreated, or in need of medical care.

That''s where advocacy comes in. By speaking up for those who can''t bark for themselves, we can make a real difference in the lives of dogs everywhere. Whether it''s supporting local shelters, promoting adoption, or raising awareness about important issues like breed-specific legislation or animal cruelty, there''s no shortage of ways to lend a paw.

How to Get Started

Ready to roll up your sleeves (or should I say, paw-sleeves) and get involved? Here are a few tips to help you bark up the right tree:

Educate Yourself: Knowledge is power, my friends. Take the time to learn about the issues facing dogs in your community and beyond. Whether it''s through books, documentaries, or good old-fashioned internet research, the more you know, the better equipped you''ll be to make a difference.

Support Local Shelters: Shelters are like temporary pit stops for pups in need. They provide food, shelter, and medical care to countless dogs who have nowhere else to turn. Consider donating supplies, volunteering your time, or even fostering a dog in need. Every little bit helps!

Advocate for Adoption: When it comes to finding forever homes, adoption is where it''s at. Spread the word about the joys of adopting a shelter dog and encourage your friends and family to consider adoption first. Remember, every dog deserves a chance to find their perfect match.

Speak Up: Don''t be afraid to use your voice (or your bark) to advocate for change. Whether it''s writing letters to lawmakers, attending protests, or speaking out on social media, there are plenty of ways to make your voice heard. Remember, together we are stronger!

Using Your Platform for Good

As a blogger (albeit a furry one), I''ve been lucky enough to build a platform where I can share my thoughts and opinions with the world. And let me tell you, there''s nothing quite like the feeling of using that platform to advocate for causes close to my heart.

Whether it''s shining a spotlight on a local shelter in need, sharing heartwarming adoption stories, or raising awareness about important issues facing dogs today, I''ve made it my mission to use my voice for good. And you can too!

So go ahead, fellow furry friends. Let''s bark up the right tree and make the world a better place for all dogs!

That''s all for now, folks! Until next time, keep wagging those tails and spreading the woof!

Woofs and wags,
Cleo the Corgi', 
        '<div id=\"primary-content\">
            <p>Greetings, fellow furry friends and esteemed humans!</p>
            <p>It''s your favorite four-legged firecracker, Cleo the Corgi, here to bark about something close to my heart: advocating for canine causes.</p>
        </header>
        <section>
            <h2>Why Advocate for Canine Causes?</h2>
            <p>Let''s cut to the chase: us dogs have it pretty good in many parts of the world. We have loving homes, delicious treats, and plenty of belly rubs to go around. But not every pup is as fortunate. There are countless dogs out there who are homeless, mistreated, or in need of medical care.</p>
            <p>That''s where advocacy comes in. By speaking up for those who can''t bark for themselves, we can make a real difference in the lives of dogs everywhere. Whether it''s supporting local shelters, promoting adoption, or raising awareness about important issues like breed-specific legislation or animal cruelty, there''s no shortage of ways to lend a paw.</p>
        </section>
        <section>
            <h2>How to Get Started</h2>
            <p>Ready to roll up your sleeves (or should I say, paw-sleeves) and get involved? Here are a few tips to help you bark up the right tree:</p>
            <ol>
                <li><strong>Educate Yourself:</strong> Knowledge is power, my friends. Take the time to learn about the issues facing dogs in your community and beyond. Whether it''s through books, documentaries, or good old-fashioned internet research, the more you know, the better equipped you''ll be to make a difference.</li>
                <li><strong>Support Local Shelters:</strong> Shelters are like temporary pit stops for pups in need. They provide food, shelter, and medical care to countless dogs who have nowhere else to turn. Consider donating supplies, volunteering your time, or even fostering a dog in need. Every little bit helps!</li>
                <li><strong>Advocate for Adoption:</strong> When it comes to finding forever homes, adoption is where it''s at. Spread the word about the joys of adopting a shelter dog and encourage your friends and family to consider adoption first. Remember, every dog deserves a chance to find their perfect match.</li>
                <li><strong>Speak Up:</strong> Don''t be afraid to use your voice (or your bark) to advocate for change. Whether it''s writing letters to lawmakers, attending protests, or speaking out on social media, there are plenty of ways to make your voice heard. Remember, together we are stronger!</li>
            </ol>
        </section>
        <section>
            <h2>Using Your Platform for Good</h2>
            <p>As a blogger (albeit a furry one), I''ve been lucky enough to build a platform where I can share my thoughts and opinions with the world. And let me tell you, there''s nothing quite like the feeling of using that platform to advocate for causes close to my heart.</p>
            <p>Whether it''s shining a spotlight on a local shelter in need, sharing heartwarming adoption stories, or raising awareness about important issues facing dogs today, I''ve made it my mission to use my voice for good. And you can too!</p>
            <p>So go ahead, fellow furry friends. Let''s bark up the right tree and make the world a better place for all dogs!</p>
        </section>
            <p>That''s all for now, folks! Until next time, keep wagging those tails and spreading the woof!</p>
            <p>Woofs and wags,</p>
            <p>Cleo the Corgi</p>
</div >',
        'https://images.unsplash.com/photo-1664575196851-5318f32c3f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Njg0MzB8MHwxfHNlYXJjaHwxfHx3cml0ZXJ8ZW58MHx8fHwxNzA4ODkwNzUzfDA&ixlib=rb-4.0.3&q=80&w=1080',
        'barking-up-the-right-tree-how-to-advocate-for-canine-causes'),
       
       (
        'bbbbbb',
        '0f482bac-b62b-459a-af59-7457b44be810',
        '2024-02-04 15:11:42',
        'From Floof to Fame: A Corgi Journey to Internet Stardom',
        '<h1>Thinking of a second title can be even harder</h1>',
        'Hey there, paw-some pals and internet enthusiasts!

It''s your favorite fluffball, Cleo the Corgi, here to spill the kibble on what it takes to go from floof to fame in the wild world of the internet. That''s right, folks, today I''m barking all about my journey from a tiny ball of fur to a bona fide internet sensation.

Now, you might be wondering, "Cleo, how did you go from chasing your tail in the backyard to gracing the screens of dog lovers everywhere?" Well, my friends, let me tell you, it wasn''t all belly rubs and biscuits. It took a whole lot of tail-wagging determination and a sprinkle of canine charisma to make it happen.

Step 1: Find Your Angle

Every successful internet sensation needs a hook, something that sets them apart from the pack. For me, it was my adorable corgi floof and penchant for stealing socks from the laundry basket. I mean, who can resist a fluffy butt and a pair of mismatched socks dangling from my mouth? It''s a winning combination, if I do say so myself.

Step 2: Work Your Paws Off

Contrary to popular belief, internet stardom doesn''t happen overnight. It takes hard work, dedication, and a whole lot of tail-wagging hustle. From posing for photoshoots to perfecting my "puppy eyes" for Instagram, I put in the hours to make sure my online presence was nothing short of paw-some.

Step 3: Network Like a Pro

In the fast-paced world of social media, it''s not just about what you know, but who you know. I made sure to sniff out the top dogs in the industry and network like a pro. Whether it was collaborating with other pet influencers or cozying up to the humans behind the keyboard, I knew that building connections was key to success.

Step 4: Stay Authentic

With so many floofs vying for attention on the internet, it can be tempting to mimic the latest trends or chase after viral fame. But let me tell you, there''s nothing more important than staying true to yourself. Whether I''m barking about my love for belly rubs or sharing behind-the-scenes snaps of my sock-stealing shenanigans, I always make sure to keep it real.

Step 5: Spread the Love

Last but certainly not least, never forget to spread the love. Sure, internet stardom may come with its fair share of treats and tummy scratches, but it''s important to use your platform for good. Whether it''s raising awareness for important causes or spreading smiles with a silly video, I always make sure to give back to the amazing community that helped me get to where I am today.

And there you have it, folks! That''s the scoop on my journey from floof to fame. So whether you''re a fellow floof looking to make your mark on the internet or just a fan of adorable corgis (who could blame you?), I hope my story inspires you to chase your dreams, one paw-print at a time.

Until next time, keep wagging those tails and spreading the woof!

Woofs and wags,
Cleo the Corgi', 
        '<div id=\"primary-content\">
            <p>Hey there, paw-some pals and internet enthusiasts!</p>
            <p>It''s your favorite fluffball, Cleo the Corgi, here to spill the kibble on what it takes to go from floof to fame in the wild world of the internet. That''s right, folks, today I''m barking all about my journey from a tiny ball of fur to a bona fide internet sensation.</p>
        </header>
        <section>
            <h2>Step 1: Find Your Angle</h2>
            <p>Every successful internet sensation needs a hook, something that sets them apart from the pack. For me, it was my adorable corgi floof and penchant for stealing socks from the laundry basket. I mean, who can resist a fluffy butt and a pair of mismatched socks dangling from my mouth? It''s a winning combination, if I do say so myself.</p>
        </section>
        <section>
            <h2>Step 2: Work Your Paws Off</h2>
            <p>Contrary to popular belief, internet stardom doesn''t happen overnight. It takes hard work, dedication, and a whole lot of tail-wagging hustle. From posing for photoshoots to perfecting my "puppy eyes" for Instagram, I put in the hours to make sure my online presence was nothing short of paw-some.</p>
        </section>
        <section>
            <h2>Step 3: Network Like a Pro</h2>
            <p>In the fast-paced world of social media, it''s not just about what you know, but who you know. I made sure to sniff out the top dogs in the industry and network like a pro. Whether it was collaborating with other pet influencers or cozying up to the humans behind the keyboard, I knew that building connections was key to success.</p>
        </section>
        <section>
            <h2>Step 4: Stay Authentic</h2>
            <p>With so many floofs vying for attention on the internet, it can be tempting to mimic the latest trends or chase after viral fame. But let me tell you, there''s nothing more important than staying true to yourself. Whether I''m barking about my love for belly rubs or sharing behind-the-scenes snaps of my sock-stealing shenanigans, I always make sure to keep it real.</p>
        </section>
        <section>
            <h2>Step 5: Spread the Love</h2>
            <p>Last but certainly not least, never forget to spread the love. Sure, internet stardom may come with its fair share of treats and tummy scratches, but it''s important to use your platform for good. Whether it''s raising awareness for important causes or spreading smiles with a silly video, I always make sure to give back to the amazing community that helped me get to where I am today.</p>
        </section>
            <p>And there you have it, folks! That''s the scoop on my journey from floof to fame. So whether you''re a fellow floof looking to make your mark on the internet or just a fan of adorable corgis (who could blame you?), I hope my story inspires you to chase your dreams, one paw-print at a time.</p>
            <p>Until next time, keep wagging those tails and spreading the woof!</p>
            <p>Woofs and wags,</p>
            <p>Cleo the Corgi</p>
        </div>',
        'https://images.unsplash.com/photo-1516371535707-512a1e83bb9a?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
        'from-floof-to-fame-a-corgi-journey-to-internet-stardom');

------------------------------ COMMENTS ------------------------

INSERT INTO comments (user_id, post_id, created_at, body)

VALUES (
        'd8486230-ce08-4ae9-b798-bf25d222467f', 
        'bbbbbb', 
        '2024-02-03 15:12:01','This is the first comment on post 1'
        ),
       (
        'd8486230-ce08-4ae9-b798-bf25d222467f', 
        'bbbbbb', 
        '2024-02-05 11:15:01','This is the second comment on post 1'
        ),
       (
        'd8486230-ce08-4ae9-b798-bf25d222467f', 
       'bbbbbb', 
       '2024-02-05 15:11:42', 
       'This is the first comment on post 2'
       ),
       (
        'd8486230-ce08-4ae9-b798-bf25d222467f', 
        'aaaaaa', 
        '2024-02-04 18:11:42','This is the second comment on post 2'
        ),
       (
        'd8486230-ce08-4ae9-b798-bf25d222467f',
        'aaaaaa', 
        '2024-02-06 11:11:42',
        'This is the third comment on post 2'
        );


------------------------------ TAGS ------------------------


INSERT INTO tags (tag)

VALUES ('#data'),
        ('#funny'),
        ('#engineering'),
        ('#nsfw');

------------------------------ POSTS_TAGS ------------------------

INSERT INTO posts_tags (post_id, tag)

VALUES ('aaaaaa', '#data'),
        ('aaaaaa', '#funny'),
        ('bbbbbb', '#engineering'),
        ('bbbbbb', '#data');
