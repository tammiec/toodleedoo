# Toodleedoo

Toodleedoo is a smart to-do list application that helps you organize and sort your tasks. Upon categorization, Toodleedoo will suggest three resources for the user to check out. The user has the ability to edit the name of their task, add a description, add additional resources, mark it as complete, mark it as important, and send the task to another local user. This project was built as a part of the Lighthouse Labs Web Development Bootcamp for the purposes of building a full-stack web web app from scratch.

## Final Product

#### Home Page:

New tasks are automatically sorted, and users can easily mark as complete, important, or delete right from the main view. Users can also click on the task to reveal a modal with more details.

![Home Page](/docs/page-on-load.png)

#### Edit Task:

![Edit Task Modal](/docs/edit-task-modal.png)

#### Edit Profile:

![Edit Profile](/docs/edit-profile.png)

#### Login Page:

![Login Page](/docs/login-page.png)

#### Responsive Layout:

![Responsive Layout](/docs/responsive.gif)


## Getting Started

1. Create the `.env` by using `.env.example` as a reference `cp .env.example .env`
2. Update the `.env` file with your local information and Google/Facebook client IDs
* Note: `CORE_API_VERSION` can be set to `1` or `2`. `2` is more accurate but makes more calls to the Google Search and Natural Language APIs (up to 5 calls each per new task).
3. Install dependencies using the `npm i` command.
4. Fix to binaries for sass: `npm rebuild node-sass`
5. Reset database: `npm run db:reset`
6. Start the web server using the `npm run local` command. The app will be served at <http://localhost:8080/>.
7. Go to <http://localhost:8080/> in your browser.

## Dependencies
- @google-cloud/language
- axios
- bcrypt
- body-parser
- chalk
- connect-flash
- dotenv
- ejs
- express
- express-partials
- express-session"
- method-override
- morgan
- multer
- node-sass
- node-sass-middleware
- passport
- passport-facebook
- passport-google-oauth
- passport-local
- pg
- pg-native
- sass

## Known Bugs
- **Archive Page**: currently only works when you navigate to this page from the Home Page. Users are not able to access this view from the Edit Profile Page.
- **Share Task Feature**: currently only works with local users (ie. users who have not logged in with Google or Facebook). Also, this feature does not allow for dynamic sharing, and once the task is sent to another user, it belongs solely to that user. In future, we would like to make this a true task sharing feature.

## Creators

- [@jomicm](https://github.com/jomicm)
- [@tammiec](https://github.com/tammiec)
- [@TYLER-JM](https://github.com/TYLER-JM)
