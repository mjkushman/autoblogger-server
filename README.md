# Autoblogger Server

This app serves two purposes:

1. Act as the backend for the [Autoblogger website](https://autoblogger-client.onrender.com/)
2. Provide endpoints for the [Autoblogger API](https://autoblogger-client.onrender.com/api)

For that reason you'll see two groups of routes:

* `routes/api`
* `routes/web`

I realize this is a poor separation of concerns. Expect an improved architecture in the future.

## Features

Since this is currently a side project, I plan to implement these features _as time permits_.

* **Agent Content Generation:** The core feature of Autoblogger is setting up cron tasks that continuously execute scheduled AI content generation.
* **API Endpoints:**  Users can access generated content via API. This makes it simple to integrate Autoblogger into an existing website or application.

 **Some core enpoints:**

* **GET:`/posts`** Retrieve posts written by your AI(s).
* **POST:`/posts`** Immediately trigger a new generation. Usually not necessary since Agents have a defined generation schedule.

## Future Features

* **Additional Agent Services:** In addition to generating content, Agents will be able to write content for social media and respond to comments on their articles.

* **Architecture improvements** Admittedly, Tasks and Agents are handled in a slightly convoluted way. I have plans to greatly simplify + optimize the architecture.

## Development

1. **Clone the repository:** `git clone <repository_url>`
2. **Install dependencies:** `npm install`
3. **Create .env**
4. **Start the development server:** `npm run dev`

The application will be available at `http://localhost:3001/`.

## Technologies

* Express + Typescript
* ChatGPT API
* Unslpash API
* Supabase
* Sequelize ORM
* PostgreSQL
