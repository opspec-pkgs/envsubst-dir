const variables = require('./variables.json');
const fs = require('fs');

const processDirs = (dirPath) => {
    fs.readdirSync(dirPath).forEach(item => {
        const itemAbsPath = `${dirPath}/${item}`;
        const itemStat = fs.statSync(itemAbsPath);

        if (itemStat.isDirectory()) {
            processDirs(itemAbsPath);
        } else {
            fileEnvsubst(itemAbsPath);
        }
    });
};

const fileEnvsubst = (itemAbsPath) => {
    let hydratedTemplate = fs.readFileSync(itemAbsPath, 'utf8');

    Object.entries(variables).forEach(([name, value]) => {
        if (typeof value !== 'string') {
            // stringifying strings adds surrounding dquotes; we don't want that
            value = JSON.stringify(value)
        }

        // replace ${name}
        hydratedTemplate = hydratedTemplate.replace(new RegExp(`\\$\{${name}}`, 'g'), value);
        // replace $name
        hydratedTemplate = hydratedTemplate.replace(new RegExp(`\\$${name}`, 'g'), value);
    });


    fs.writeFileSync(itemAbsPath, hydratedTemplate);
};

processDirs('/result');
