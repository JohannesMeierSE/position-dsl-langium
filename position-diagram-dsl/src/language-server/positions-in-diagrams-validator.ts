import { ValidationAcceptor, ValidationChecks } from 'langium';
import { PositionsInDiagramsAstType, Model, PositionAlongEdge, TextElement } from './generated/ast';
import type { PositionsInDiagramsServices } from './positions-in-diagrams-module';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: PositionsInDiagramsServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.PositionsInDiagramsValidator;
    const checks: ValidationChecks<PositionsInDiagramsAstType> = {
        Model: validator.checkUniqueElementIdentifier,
        PositionAlongEdge: validator.checkContainerOfPositionAlongEdge
        // , Person: validator.checkPersonStartsWithCapital
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class PositionsInDiagramsValidator {

    /*
    checkPersonStartsWithCapital(person: Person, accept: ValidationAcceptor): void {
        if (person.name) {
            const firstChar = person.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Person name should start with a capital.', { node: person, property: 'name' });
            }
        }
    }
    */

    /*
     * All nodes and edges must have unique names.
     */
    checkUniqueElementIdentifier(model : Model, accept : ValidationAcceptor): void {
        const reported = new Set();
        model.nodes.forEach(node => {
            if (reported.has(node.name)) {
                accept('error', 'Node has non-unique name: ' + node.name, {node: node, property: 'name'});
            }
            reported.add(node.name);
        });
        model.edges.forEach(edge => {
            if (reported.has(edge.name)) {
                accept('error', 'Edge has non-unique name: ' + edge.name, {node: edge, property: 'name'});
            }
            reported.add(edge.name);
        });
    }

    /*
     * The container of a PositionAlongEdge must be a TextElement.
     * In theory, this constraint is already realized by the grammar definition (which works in corresponding editors).
     * But in practice, the generated ASG specifies (Edge | Node | PositionIntersection | TextElement) as type for the container attribute ...
     */
    checkContainerOfPositionAlongEdge(pos : PositionAlongEdge, accept : ValidationAcceptor): void {
        if (pos.$container && pos.$container.$type !== TextElement) {
            accept('error', 'PositionAlongEdge can be used only for text nodes within an Edge: ' + pos, {node: pos}); // {node: pos, property: 'container'}
        }
    }
}
