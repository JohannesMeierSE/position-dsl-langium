import { Model, Node, PositionNormal } from '../src/language-server/generated/ast';
import { printPositionNormal } from '../src/cli/generator';

describe('test the TikZ generator', () => {
    test('test printing of PositionNormal', () => {
        // build the EMF model
        let model : Model = {
            $type : 'Model',
            nodes : [],
            edges : []
        };
        let node : Node = {
            $type : 'Node',
            $container : model,
            name : "n1"
        };
        let position : PositionNormal = {
            $type : 'PositionNormal',
            $container : node,
            posX : "2mm",
            posY : "-3mm",
            xshift : "", // TODO: why is this required? it should be an optional argument according to the grammar!
            yshift : ""
        };
        node.position = position;
        model.nodes[0] = node;

        // test the EMF model
        expect(position.$container).toBe(node);
        expect(node.position).toBe(position);
        expect(model.nodes.length).toBe(1);
        expect(model.nodes.indexOf(node)).toBe(0);
        expect(model.edges.length).toBe(0);

        // test the generated TikZ string
        expect(printPositionNormal(position)).toBe("2mm, -3mm");
    });
});
