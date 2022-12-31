import { startLanguageServer } from 'langium';
import { NodeFileSystem } from 'langium/node';
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node';
import { createPositionsInDiagramsServices } from './positions-in-diagrams-module';

// Create a connection to the client
const connection = createConnection(ProposedFeatures.all);

// Inject the shared services and language-specific services
const { shared } = createPositionsInDiagramsServices({ connection, ...NodeFileSystem });

// Start the language server with the shared services
startLanguageServer(shared);
