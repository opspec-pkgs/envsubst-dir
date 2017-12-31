const variables = require('./variables.json');
const fs = require('fs');
const path = require('path');

const processDirs = (dirPath) => {
    fs.readdirSync(dirPath).forEach(item => {
        const itemAbsPath = `${dirPath}/${item}`;
        const itemStat = fs.statSync(itemAbsPath);

        if (itemStat.isDirectory()) {
            processDirs(itemAbsPath);
        } else {
            fileEnvsubst(itemAbsPath, item);
        }
    });
};

const fileEnvsubst = (itemAbsPath, file) => {
    let hydratedFile = fs.readFileSync(itemAbsPath, 'utf8');

    Object.entries(variables).forEach(([name, value]) => {
        let literalValue = JSON.stringify(value);
        literalValue = literalValue.substring(1, literalValue.length - 1);
        
        // replace ${name}
        hydratedFile = hydratedFile.replace(new RegExp(`\\$\{${name}}`, 'g'), literalValue);
        // replace $name
        hydratedFile = hydratedFile.replace(new RegExp(`\\$${name}`, 'g'), literalValue);
    });
    fs.writeFileSync(itemAbsPath, hydratedFile);
};

processDirs('/result');

