const replace = require('replace-in-file');

const options = {
    files: 'client/src/groups/**/*.ts*',
    from: [
        /CATEGORY/g, /CATEGORIES/g, /Categories/g, /categories/g, /Category/g, /category/g, 
        /QUESTION/g, /QUESTIONS/g, /Questions/g, /questions/g, /Question/g, /question/g
    ],
    to: [
        'GROUP', 'GROUPS', 'Groups', 'groups', 'Group', 'group',
        'USER', 'USERS', 'Users', 'users', 'User', 'user'
    ],
    countMatches: true
};

async function generate() {
    try {
        const results = await replace(options)
        console.log('Replacement results:', results);
    }
    catch (error) {
        console.error('Error occurred:', error);
    }
}

generate();
