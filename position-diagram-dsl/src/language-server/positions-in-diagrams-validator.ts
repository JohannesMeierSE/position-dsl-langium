import { ValidationAcceptor, ValidationChecks } from 'langium';
import { PositionsInDiagramsAstType, Person } from './generated/ast';
import type { PositionsInDiagramsServices } from './positions-in-diagrams-module';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: PositionsInDiagramsServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.PositionsInDiagramsValidator;
    const checks: ValidationChecks<PositionsInDiagramsAstType> = {
        Person: validator.checkPersonStartsWithCapital
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class PositionsInDiagramsValidator {

    checkPersonStartsWithCapital(person: Person, accept: ValidationAcceptor): void {
        if (person.name) {
            const firstChar = person.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Person name should start with a capital.', { node: person, property: 'name' });
            }
        }
    }

}
