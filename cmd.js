const variables = require('./variables.json');
const fs = require('fs');
const path = require('path');

// copy templates into result before processing
const copyFileSync = (source, target) => {
    let targetFile = target;
    
    //if target is a directory a new file with the same name will be created
    if (fs.existsSync(target)) {
        if (fs.lstatSync(target).isDirectory()) {
            targetFile = path.join(target, path.basename(source));
        }
    }
    fs.writeFileSync(targetFile, fs.readFileSync(source));
};

const copyFolderRecursiveSync = (source, target) => {
    let files = [];

    // check if path.basename is source root directory
    let sourcePathBasename = '';
    if (path.basename(source) !== 'templates') {
        sourcePathBasename = path.basename(source);
    }

    //check if folder needs to be created or integrated
    let targetFolder = path.join(target, sourcePathBasename);

    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
    }

    //copy
    if (fs.lstatSync(source).isDirectory()) {
        files = fs.readdirSync(source);
        files.forEach( file => {
            let curSource = path.join(source, file);
            if (fs.lstatSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, targetFolder);
            } else {
                copyFileSync(curSource, targetFolder);
            }
        } );
    }
};

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

copyFolderRecursiveSync('/templates', '/result');
processDirs('/result');
