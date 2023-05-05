#### Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## MERN Stack
**MERN** stands for MongoDB, Express, React, Node, after the four key technologies that make up the stack.\
**M**ongoDB — document database.\
**E**xpress(.js) — web framework.\
**N**ode.js\
**R**eact(.js) — a client-side JavaScript framework.\

## Support-Knowledge application

Real application [https://support-knowledge.onrender.com](https://support-knowledge.onrender.com) which uses Category/Question template.

## Available Scripts

In the project directory, you can run:
### `yarn run dev`
Runs concurrently server script "/server.js" and the React App "/client/src" in the development mode.\
"/server.js" script starts 'Express' web application framework and connects MongoDB database.

### Running React and Node.js in one shot with concurrently!
To make concurrently work with React and Node, we added scripts in **package.json**.\
&nbsp;&nbsp;"scripts": {\
&nbsp;&nbsp;&nbsp;&nbsp;"server": "nodemon server.js",\
&nbsp;&nbsp;&nbsp;&nbsp;"client": "npm start --prefix client",\
&nbsp;&nbsp;&nbsp;&nbsp;"dev": "concurrently \"npm run server\" \"npm run client\""\
&nbsp;&nbsp;}\
We can concurrently **debug** Node and React

### Generator
##### `yarn run generate-menu-meal`

Generator will generate code for CRUD operations of two related entites: 'parent table' -> 'child table',\
based on relation **categories** -> **questions**.\
It is especially useful for Admin modules, where apps sometimes have many tables to maintain.
  *  NodeJS script copies **categories** folder to **menus** folder.
  *  It replaces names of files.
  *  It replaces names of variables used in code, for example **CategoryRow** to **MenuRow**.
  *  Generator creates MongoDB models: /models/Menu.js and /models/Meal.js
  *  Generator creates Express routes: /routes/menu.route.js and /routes/meal.route.js
  *  Next version of Generator will be much more sofisticated.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.


## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
