const fse = require('fs-extra')
const path = require('path')
const replace = require('replace-in-file');

const from = [
    /CATEGORY/g, /CATEGORIES/g, /Categories/g, /categories/g, /Category/g, /category/g,
    /QUESTION/g, /QUESTIONS/g, /Questions/g, /questions/g, /faQuestion/g, /Question/g, /question/g
]

const to = [
    'MENU', 'MENUS', 'Menus', 'menus', 'Menu', 'menu',
    'MEAL', 'MEALS', 'Meals', 'meals', 'faThumbsUp', 'Meal', 'meal'
]

const options = {
    files: 'client/src/menus/**/*.ts*',
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

async function generateModels(master, slave) {
    const masterModel = `./models/${master}.js`
    const slaveModel = `./models/${slave}.js`
    fse.removeSync(masterModel)
    fse.removeSync(slaveModel)
    fse.copyFileSync('./models/Category.js', masterModel)
    fse.copyFileSync('./models/Question.js', slaveModel)
    try {
        const results = await replace({
            files: [`models/${master}.js`, `models/${slave}.js`],
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

async function generateRoutes(master, slave) {
    const masterRoute = `./routes/${master}.route.js`
    const slaveRoute = `./routes/${slave}.route.js`
    fse.removeSync(masterRoute)
    fse.removeSync(slaveRoute)
    fse.copyFileSync('./routes/category.route.js', masterRoute)
    fse.copyFileSync('./routes/question.route.js', slaveRoute)
    try {
        const results = await replace({
            files: [`routes/${master}.route.js`, `routes/${slave}.route.js`],
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
    // Copy 'categories' folder to 'menus' folder,
    // replacing filenames, for example 'CategoryProvider.tsx' to 'MenuProvider.tsx'
    await copyFolderAndRenameFileNames('./client/src/categories', './client/src/menus');

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
    await generateModels('Menu', 'Meal');

    // 4)
    await generateRoutes('menu', 'meal');
    // 5)
    console.log("=======================================")
    console.log('To add additional fields to Menu or Meal')
    console.log('Modify /models/Menu')
    console.log('Modify /src/menus/types')
    console.log('Modify /src/menus/components/MenuForm.tsx')
    console.log('Or wait for more sofisticated generator')
    console.log("=======================================")
}

generate();
