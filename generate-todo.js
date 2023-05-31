const fse = require('fs-extra')
const path = require('path')
const replace = require('replace-in-file');

const from = [
    /CATEGORY/g, /CATEGORIES/g, /Categories/g, /categories/g, /Category/g, /category/g
]

const to = [
    'TODO', 'TODOS', 'Todos', 'todos', 'Todo', 'todo',
]

const options = {
    files: 'client/src/todos/**/*.ts*',
    from,
    to,
    countMatches: true
};

async function copyFolderAndRenameFileNames(source, destination) {
    // remove generated folder and create a new one
    fse.removeSync(destination)
    fse.ensureDirSync(destination);
    const directoryEntries = await fse.readdir(source, { withFileTypes: true });
    return Promise.all(
        directoryEntries.map(async (entry) => {
            let newName = entry.name;
            for (let i = 0; i < from.length; i++) {
                if (entry.name.match(from[i]))
                    newName = entry.name.replace(from[i], to[i])
            }
            const sourcePath = path.join(source, entry.name);
            console.log({ sourcePath, destination, newName })
            const destinationPath = path.join(destination, newName);
            return entry.isDirectory()
                ? copyFolderAndRenameFileNames(sourcePath, destinationPath)
                : fse.copyFileSync(sourcePath, destinationPath);
        })
    );
}

async function generateModels(master) {
    const masterModel = `./models/${master}.js`
    fse.removeSync(masterModel)
    fse.copyFileSync('./models/Category.js', masterModel)
    try {
        const results = await replace({
            files: [`models/${master}.js`],
            from,
            to,
            countMatches: true
        })
        console.log('Replacement results:', results);
    }
    catch (error) {
        console.error('Error occurred:', error);
    }
}

async function generateRoutes(master) {
    const masterRoute = `./routes/${master}.route.js`
    fse.removeSync(masterRoute)
    fse.copyFileSync('./routes/category.route.js', masterRoute)
    try {
        const results = await replace({
            files: [`routes/${master}.route.js`],
            from,
            to,
            countMatches: true
        })
        console.log('Replacement results:', results);
    }
    catch (error) {
        console.error('Error occurred:', error);
    }
}

async function generate() {
    // 1)
    // Copy 'categories' folder to 'todos' folder,
    // replacing filenames, for example 'CategoryProvider.tsx' to 'MenuProvider.tsx'
    await copyFolderAndRenameFileNames('./client/src/categories', './client/src/todos');

    // 2)
    // Make replacements in all the generated files
    try {
        const results = await replace(options)
        console.log('Replacement results:', results);
    }
    catch (error) {
        console.error('Error occurred:', error);
    }

    // 3)
    await generateModels('Todo');

    // 4)
    await generateRoutes('todo');

    // 5)
    console.log("=======================================")
    console.log('To add additional fields to Menu or Meal')
    console.log('Modify /models/Todo')
    console.log('Modify /src/todos/types')
    console.log('Modify /src/todos/components/TodoForm.tsx')
    console.log('Or wait for more sofisticated generator')
    console.log("=======================================")
}

generate();
