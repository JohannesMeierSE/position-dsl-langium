/******************************************************************************
 * This file was generated by langium-cli 1.0.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/

import { LangiumGeneratedServices, LangiumGeneratedSharedServices, LangiumSharedServices, LangiumServices, LanguageMetaData, Module } from 'langium';
import { PositionsInDiagramsAstReflection } from './ast';
import { PositionsInDiagramsGrammar } from './grammar';

export const PositionsInDiagramsLanguageMetaData: LanguageMetaData = {
    languageId: 'positions-in-diagrams',
    fileExtensions: ['.posdia'],
    caseInsensitive: false
};

export const PositionsInDiagramsGeneratedSharedModule: Module<LangiumSharedServices, LangiumGeneratedSharedServices> = {
    AstReflection: () => new PositionsInDiagramsAstReflection()
};

export const PositionsInDiagramsGeneratedModule: Module<LangiumServices, LangiumGeneratedServices> = {
    Grammar: () => PositionsInDiagramsGrammar(),
    LanguageMetaData: () => PositionsInDiagramsLanguageMetaData,
    parser: {}
};