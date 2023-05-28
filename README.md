#### Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## MERN Stack
**MERN** stands for MongoDB, Express, React, Node, after the four key technologies that make up the stack.\
**M**ongoDB — document database.\
**E**xpress(.js) — web framework.\
**N**ode.js\
**R**eact(.js) — a client-side JavaScript framework.

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

### Try this Application at your local machine
  *  First, clone this repository
  *  Execute `cd JSBelgrade-MERN`
  *  Execute `yarn install`, to install all dependencies for a project.
  *  Install MongoDB at your local machine, or create free cloud MongoDB database.\
    [Set Up A MongoDB Cluster](https://www.mongodb.com/basics/clusters/mongodb-cluster-setup)
  *  Enter connection string into the **/.env** file like I did, for example:
     **MY_MONGO_URI='mongodb://127.0.0.1:27017/JSBelgrade-MERN'**
  *  Execute: `yarn run dev`

### App structure
  Client app is created by command: `npx create-react-app JSBelgrade-MERN typescript`\
  and moved to the folder `/client`\
  Project uses React Hooks.\
  This template treats Parent -> Child entity relation, known as 1:N relation.\
  We could create additional templates too.\
  We have **GlobalProvider** and another **Provider** for each Page
  ```
  <GlobalProvider>
    <Router>
      <App>
        <CategoryProvider>
          <Categories>
            CRUD operations
          </Categories>
        </CategoryProvider>
        <MenuProvider>
          <Menus>
            CRUD operations
          </Menus>
        </MenuProvider>
      </App>
    </Router>
  </GlobalProvider>
```

### Generator
##### `yarn run generate-menu-meal`

This is the sample of generating code for `menu-meal' relation.\
You can clone this script, and customize it for other relations you need.\
Generator will re-generate code for CRUD operations of two related entites: 'parent table' -> 'child table',\
based on relation **categories** -> **questions**.\
It is especially useful for Admin modules, where apps have many tables to maintain.
  *  NodeJS script copies **categories** folder to **menus** folder.
  *  It replaces names of files.
  *  It replaces names of variables used in code, for example **CategoryRow** to **MenuRow**.
  *  Generator creates MongoDB models: /models/Menu.js and /models/Meal.js
  *  Generator creates Express routes: /routes/menu.route.js and /routes/meal.route.js
  *  Next version of Generator will be much more sofisticated.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://react.dev/).
