const fs = require('fs-extra');
const esprima = require('esprima');
const estraverse = require('estraverse');

function customElementsPlugin() {
    return {
        name: 'custom-elements',
        setup(build) {
            build.onLoad({ filter: /.*/, namespace: 'file' }, async (args) => {
                console.log("💘 file", args.path)
                
                const contents = await fs.promises.readFile(args.path, 'utf8');
                
                const ast = esprima.parseScript(contents);

                estraverse.traverse(ast, {
                    enter: node => {
                        if (node.type === 'CallExpression' &&
                            node.callee.name === 'define' &&
                            node.callee.object.name === 'customElements') {
                            const tagName = node.arguments[0].name || node.arguments[0].value;
                            console.log(`Found custom element: ${tagName}`);
                            // Perform any additional actions needed with the tag name
                        }
                    }
                });

                // Return the original file contents so esbuild knows how to handle it
                return { contents: contents, loader: 'js' };
            });
        },
    };
}

module.exports = customElementsPlugin;