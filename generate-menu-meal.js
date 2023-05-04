const fse = require('fs-extra')
const path = require('path')
const replace = require('replace-in-file');

const options = {
    files: 'client/src/menus/**/*.ts*',
    from: [
        /CATEGORY/g, /CATEGORIES/g, /Categories/g, /categories/g, /Category/g, /category/g,
        /QUESTION/g, /QUESTIONS/g, /Questions/g, /questions/g, /faQuestion/g, /Question/g,  /question/g
    ],
    to: [
        'MENU', 'MENUS', 'Menus', 'menus', 'Menu', 'menu',
        'MEAL', 'MEALS', 'Meals', 'meals', 'faThumbsUp', 'Meal', 'meal'
    ],
    countMatches: true
};

async function copyDirRenameFiles(source, destination) {
    await fse.ensureDirSync(destination);
    const directoryEntries = await fse.readdir(source, { withFileTypes: true });

    const { from, to } = options;

    return Promise.all(
        directoryEntries.map(async (entry) => {
            let newName = entry.name;
            for (let i = 0; i < from.length; i++) {
                if (entry.name.match(from[i]))
                    newName = entry.name.replace(from[i], to[i])
            }
            const sourcePath = path.join(source, entry.name);
            console.log({sourcePath, destination, newName})
            const destinationPath = path.join(destination, newName);

            return entry.isDirectory()
                ? copyDirRenameFiles(sourcePath, destinationPath)
                : fse.copyFileSync(sourcePath, destinationPath);
        })
    );
}

async function generate() {
    fse.removeSync('./client/src/menus')
    await copyDirRenameFiles('./client/src/categories', './client/src/menus');

    fse.copyFileSync('./routes/category.route.js', './routes/menu.route.js')
    fse.copyFileSync('./routes/question.route.js', './routes/meal.route.js')

    try {
        const results = await replace(options)
        console.log('Replacement results:', results);
    }
    catch (error) {
        console.error('Error occurred:', error);
    }
}

generate();
