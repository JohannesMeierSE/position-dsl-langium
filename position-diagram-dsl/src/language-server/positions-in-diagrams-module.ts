import {
    createDefaultModule, createDefaultSharedModule, DefaultSharedModuleContext, inject,
    LangiumServices, LangiumSharedServices, Module, PartialLangiumServices
} from 'langium';
import { PositionsInDiagramsGeneratedModule, PositionsInDiagramsGeneratedSharedModule } from './generated/module';
import { PositionsInDiagramsValidator, registerValidationChecks } from './positions-in-diagrams-validator';

/**
 * Declaration of custom services - add your own service classes here.
 */
export type PositionsInDiagramsAddedServices = {
    validation: {
        PositionsInDiagramsValidator: PositionsInDiagramsValidator
    }
}

/**
 * Union of Langium default services and your custom services - use this as constructor parameter
 * of custom service classes.
 */
export type PositionsInDiagramsServices = LangiumServices & PositionsInDiagramsAddedServices

/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services. The Langium defaults can be partially specified to override only
 * selected services, while the custom services must be fully specified.
 */
export const PositionsInDiagramsModule: Module<PositionsInDiagramsServices, PartialLangiumServices & PositionsInDiagramsAddedServices> = {
    validation: {
        PositionsInDiagramsValidator: () => new PositionsInDiagramsValidator()
    }
};

/**
 * Create the full set of services required by Langium.
 *
 * First inject the shared services by merging two modules:
 *  - Langium default shared services
 *  - Services generated by langium-cli
 *
 * Then inject the language-specific services by merging three modules:
 *  - Langium default language-specific services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 *
 * @param context Optional module context with the LSP connection
 * @returns An object wrapping the shared services and the language-specific services
 */
export function createPositionsInDiagramsServices(context: DefaultSharedModuleContext): {
    shared: LangiumSharedServices,
    PositionsInDiagrams: PositionsInDiagramsServices
} {
    const shared = inject(
        createDefaultSharedModule(context),
        PositionsInDiagramsGeneratedSharedModule
    );
    const PositionsInDiagrams = inject(
        createDefaultModule({ shared }),
        PositionsInDiagramsGeneratedModule,
        PositionsInDiagramsModule
    );
    shared.ServiceRegistry.register(PositionsInDiagrams);
    registerValidationChecks(PositionsInDiagrams);
    return { shared, PositionsInDiagrams };
}
