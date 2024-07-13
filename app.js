import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SNIPPET_FILE = path.join(__dirname, 'snippets.json');
let snippets = [];

const loadSnippets = () => {
    try{
        snippets = JSON.parse(fs.readFileSync(SNIPPET_FILE, 'utf-8'));
    }catch(err){
        snippets = [];
    }
} 

const saveSnippets = () => {
    fs.writeFileSync(SNIPPET_FILE, JSON.stringify(snippets, null, 2));
}

const addSnippet = () => {
    inquirer.prompt([
        { type: 'input', name: 'title', message: 'Enter snippet title: ' },
        { type: 'input', name: 'language', message: 'Enter programming language: ' },
        { type: 'editor', name: 'code', message: 'Enter snippet code: ' },
    ]).then((answers) => {
        const newSnippet = {
            id: Date.now(),
            title: answers.title,
            language: answers.language,
            code: answers.code
        }

        snippets.push(newSnippet);
        saveSnippets();
        console.log(chalk.green("Snippet added successfully."));
        menu();
    });
}

const listSnippets = () => {
    console.log(chalk.yellow('---------------------- All Snippets --------------------'));
    snippets.forEach((snippet) => {
        console.log(`#${snippet.id}: ${snippet.title} - Language: ${snippet.language}`)
    });
    console.log(chalk.yellow(`${snippets.length} snippets found.`));
    menu();
}

const editSnippet = () => {
    inquirer.prompt([
        { type: 'input', name: 'id', message: 'Enter snippet ID to edit: ' },
        { type: 'input', name: 'title', message: 'Enter new title (leave it empty to keep current!): ' },
        { type: 'input', name: 'language', message: 'Enter new Language (leave it empty to keep current!): ' },
        { type: 'input', name: 'code', message: 'Enter new code (leave it empty to keep current!): ' }
    ]).then((answers) => {
        const id = parseInt(answers.id);
        const snippetInd = snippets.findIndex((snippet) => snippet.id === id);
        if(snippetInd !== -1){
            if(answers.title.trim() !== ''){
                snippets[snippetInd].title = answers.title;
            }
            if(answers.language.trim() !== ''){
                snippets[snippetInd].language = answers.language;
            }
            if(answers.code.trim() !== ''){
                snippets[snippetInd].code = answers.code;
            }
            // Save updated snippet\
            saveSnippets();
            console.log(chalk.green('Snippet updated successfully.'));
        }else{
            console.log(chalk.red('No snippet found!!!'));
        }
        menu();
    });
}

// Custom Syntax Highlighter
function highlightCode(code) {
    const keywords = /\b(let|const|var|function|return|if|else|for|while|do|switch|case|break|continue)\b/g;
    const strings = /"[^"]*"|'[^']*'/g;
    const multilineComments = /\/\*[\s\S]*\*\//g;
    const comments = /\/\/[^\n]*/g;
    const properties = /\.\w+/g; // Regex to match dot followed by a valid identifier

    let highlightedCode = code
        .replace(strings, match => chalk.green(match))
        .replace(keywords, match => chalk.blue(match))
        .replace(multilineComments, match => chalk.gray(match))
        .replace(comments, match => chalk.gray(match))
        .replace(properties, match => chalk.yellow(match));

    return highlightedCode;
}

const deleteSnippet = () => {
    inquirer.prompt([
        { type: 'input', message: 'Enter snippet ID to delete: ' }
    ]).then((answer) => {
        const id = parseInt(answer.id);
        const snippetInd = snippets.findIndex((snippet) => snippet.id === id);
        
        if(snippetInd !== -1){
            snippets.splice(snippetInd, 1);
            saveSnippets();
            console.log(chalk.green('Snippet deleted successfully.'));    
        }else{
            console.log(chalk.red('No snippet found of that particular ID!!!'));
        }
        menu();
        // snippets.filter((snippet, ind) => snippet.id !== id);
    });
}

const searchSnippet = () => {
    inquirer.prompt([
        { type: 'input', name: 'searchTerm', message: 'Enter search term: ' }
    ]).then((answer) => {
        let searchTerm = answer.searchTerm.toLowerCase();
        const matchedSnippets = snippets.filter((snippet, ind) => {
            if(snippet.title.toLowerCase().includes(searchTerm) || snippet.language.toLowerCase().includes(searchTerm)) {
                return true;
            }
        });
        if(matchedSnippets.length === 0){
            console.log(chalk.yellow('No snippets found for particular serach term.'));
        }else{
            console.log(chalk.yellow(`---------------------- Match Snippets (${matchedSnippets.length}) --------------------`));
            matchedSnippets.forEach(snippet => {
                console.log(`#${snippet.id}: ${snippet.title} - Language: ${snippet.language}`);
            });
        }
        menu();
    });
}

const showCodeForSnippet = () => {
    inquirer.prompt([
        { type: 'input', name: 'id', message: 'Enter snippet ID: ' }
    ]).then((answer) => {
        const id = parseInt(answer.id);
        const snippetInd = snippets.findIndex((snippet) => snippet.id === id);
        
        if(snippetInd !== -1){
            let code = highlightCode(snippets[snippetInd].code);
            console.log(code);
        }else{
            console.log(chalk.red('No snippet found of that particular ID!!!'));
        }
        menu();
    });
}

// Function to delete all snippets
function deleteAllSnippets() {
    inquirer.prompt([{ type: 'confirm', name: 'confirmDelete', message: 'Are you sure you want to delete all snippets?', default: false }])
        .then(answer => {
            if (answer.confirmDelete) {
                snippets = [];
                saveSnippets();
                console.log(chalk.green('All snippets deleted successfully!'));
            } else {
                console.log(chalk.yellow('Operation cancelled.'));
            }
            menu();
        });
}

const clearTerminal = () => {
    console.clear();
    console.log(chalk.blue('Terminal cleared.'));
    menu();
};

const menu = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Choose an action to perform : ',
            choices: [
                { name: 'Add a snippet', value: 'add' },
                { name: 'List all snippet', value: 'list' },
                { name: 'Edit a snippet', value: 'edit' },
                { name: 'Delete a snippet', value: 'delete' },
                { name: 'Search a snippet', value: 'search' },
                { name: 'Show code for a particular snippet', value: 'show-code' },
                { name: 'Delete All snippets ?', value: 'delete-all' },
                { name: 'Clear the terminal', value: 'clear' },
                { name: 'Exit :(', value: 'exit' }
            ]
        }
    ]).then((answer) => {
        switch(answer.action){
            case 'add':
                addSnippet();
                break;

            case 'list': 
                listSnippets();
                break;

            case 'edit':
                editSnippet();
                break;
            
            case 'delete':
                deleteSnippet();
                break;

            case 'search': 
                searchSnippet();
                break;
            
            case 'show-code': 
                showCodeForSnippet();
                break;

            case 'delete-all': 
                deleteAllSnippets();
                break;

            case 'clear': 
                clearTerminal();
                break;

            case 'exit':
                console.log(chalk.cyan('========================== Made by @PraDev with ❤️   ========================'));
                console.log(chalk.yellow('Goodbye!'));
                break;

            default: 
                break;
        }
    });
}

const main = () => {
    loadSnippets();
    console.log(chalk.bold.rgb(255, 136, 0).underline('\n==== Welcome to Snippet Manager CLI ====\n'));

    menu();
    console.log('\n');
}

main();
