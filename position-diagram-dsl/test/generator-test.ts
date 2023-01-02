import { Model, Node, PositionNormal } from '../src/language-server/generated/ast';
import { printPositionNormal } from '../src/cli/generator';

describe('test the TikZ generator', () => {
    test('test printing of PositionNormal', () => {
        // build the EMF model
        let model : Model = {
            $type : 'Model',
            nodes : [], // Node ergänzen?? ist das automatisch bidirektional?
            edges : []
        };
        let node : Node = {
            $type : 'Node',
            $container : model,
            name : "n1"
        };
        let generator : PositionNormal = {
            $type : 'PositionNormal',
            $container : node,
            posX : "2mm",
            posY : "-3mm",
            xshift : "", // optional argument ?!
            yshift : ""
        };

        // test the generated TikZ string
        expect(printPositionNormal(generator)).toBe("2mm, -3mm");
    });
});
