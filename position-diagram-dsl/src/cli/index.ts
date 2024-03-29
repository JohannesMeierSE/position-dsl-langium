import chalk from 'chalk';
import { Command } from 'commander';
import { Model } from '../language-server/generated/ast';
import { PositionsInDiagramsLanguageMetaData } from '../language-server/generated/module';
import { createPositionsInDiagramsServices } from '../language-server/positions-in-diagrams-module';
import { extractAstNode } from './cli-util';
import { generateTikZ as generateTikZ } from './generator';
import { NodeFileSystem } from 'langium/node';

export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createPositionsInDiagramsServices(NodeFileSystem).PositionsInDiagrams;
    const model = await extractAstNode<Model>(fileName, services);
    const generatedFilePath = generateTikZ(model, fileName, opts.destination);
    console.log(chalk.green(`TikZ code generated successfully: ${generatedFilePath}`));
};

export type GenerateOptions = {
    destination?: string;
}

export default function(): void {
    const program = new Command();

    program
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        .version(require('../../package.json').version);

    const fileExtensions = PositionsInDiagramsLanguageMetaData.fileExtensions.join(', ');
    program
        .command('generate')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .option('-d, --destination <dir>', 'destination directory of generating')
        .description('generates TikZ code that creates the diagram information as LaTeX code')
        .action(generateAction);

    program.parse(process.argv);
}
