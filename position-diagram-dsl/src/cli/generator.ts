import fs from 'fs';
import { CompositeGeneratorNode, NL, toString } from 'langium';
import path from 'path';
import { Model, Position, PositionAlongEdge, PositionAnchor, PositionIntersection, PositionNormal, POS_ANCHOR, TextElement } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';

export function generateTikZ(model: Model, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.tex`;

    const text = new CompositeGeneratorNode();
    // header
    text.append('\\documentclass[tikz]{standalone}', NL);
    text.append('\\begin{document}', NL);
    text.append('\\begin{tikzpicture}[n/.style={rectangle,draw,align=center},e/.style={draw,->},t/.style={rectangle,draw=none,fill=black!10,align=center,font=\\footnotesize}]', NL, NL);

    // nodes
    model.nodes.forEach(node => {
        text.append(`\\node[n`);
        text.append(printAnchor(node.anchor, ", anchor=", ""));
        text.append(`] (${node.name})`);
        if (node.position) {
            text.append(" at " + printPosition(node.position, true));
        }
        text.append(` {${node.name}};`, NL);
    });

    // edges
    model.edges.forEach(edge => {
        text.append(`\\path[e] `);
        text.append(printPosition(edge.from, true));
        edge.parts.forEach(part => {
            text.append(" " + part.routing + " " + printPosition(part.pos, true));
        });
        text.append(printTextElementInline(edge.fromText));
        text.append(printTextElementInline(edge.toText));
        text.append(`;`, NL);
        text.append(printTextElementSeparate(edge.fromText));
        text.append(printTextElementSeparate(edge.toText));
    });

    // footer
    text.append(NL, '\\end{tikzpicture}', NL);
    text.append('\\end{document}', NL);

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(text));
    return generatedFilePath;
}

function printTextElementInline(text : TextElement | undefined) : string {
    if (text == undefined || text.pos.$type !== 'PositionAlongEdge') {
        return "";
    }
    let result = ` node[t`;
    result = result + printAnchor(text.anchor, ", anchor=", "");
    // position
    result = result + ", pos=" + (<PositionAlongEdge> text.pos).pos;
    if (text.pos.xshift) {
        result = result + ", xshift=" + text.pos.xshift;
    }
    if (text.pos.yshift) {
        result = result + ", yshift=" + text.pos.yshift;
    }
    result = result + "]";

    if (text.name) {
        result = result + "(" + text.name + ")";
    }
    result = result + " {";
    if (text.text) {
        result = result + text.text;
    }
    result = result + "}";
    return result;
}

// if the text element has no PositionAlongEdge, it is "detached" from the edge and will be rendered similar to a "normal node"
function printTextElementSeparate(text : TextElement | undefined) : string {
    if (text == undefined || text.pos.$type == 'PositionAlongEdge') {
        return "";
    }
    let result = `\\node[t`;
    result = result + printAnchor(text.anchor, ", anchor=", "");
    result = result + "]";

    if (text.name) {
        result = result + " (" + text.name + ")";
    }
    // position
    result = result + " at " + printPosition(text.pos, true);
    result = result + " {";
    if (text.text) {
        result = result + text.text;
    }
    result = result + "};\n";
    return result;
}

function printAnchor(anchor : POS_ANCHOR | undefined, prefix : string, postfix : string) : string {
    if (anchor == undefined) {
        return "";
    }
    let result = "" + anchor;
    result = result.replaceAll("_", " ");
    result = prefix + result + postfix;
    return result;
}

function printPosition(pos : Position, brackets : boolean) : string {
    let result = "";
    let optionBefore = false;

    // xshift
    if (pos.xshift) {
        if (optionBefore) {
            result = result + ", ";
        } else {
            result = result + "[";
            optionBefore = true;
        }
        result = result + "xshift=" + pos.xshift;
    }

    // yshift
    if (pos.yshift) {
        if (optionBefore) {
            result = result + ", ";
        } else {
            result = result + "[";
            optionBefore = true;
        }
        result = result + "yshift=" + pos.yshift; // TODO: bei Positionsangaben fehlt die Einheit am Ende? mm/pt
    }

    if (optionBefore) {
        result = result + "] ";
    }

    // different kinds of positions
    if (pos.$type == 'PositionNormal') {
        result = result + printPositionNormal(<PositionNormal> pos);
    }
    if (pos.$type == 'PositionAnchor') {
        result = result + printPositionAnchor(<PositionAnchor> pos);
    }
    if (pos.$type == 'PositionIntersection') {
        result = result + printPositionIntersection(<PositionIntersection> pos);
    }
    if (pos.$type == 'PositionAlongEdge') {
        result = result + printPositionAlongEdge(<PositionAlongEdge> pos);
    }

    if (brackets) {
        result = "(" + result + ")";
    }
    return result;
}

export function printPositionNormal(pos : PositionNormal) : string {
    return pos.posX + ", " + pos.posY;
}
function printPositionAnchor(pos : PositionAnchor) : string {
    return pos.node.ref?.name + printAnchor(pos.nodeanchor, ".", "");
}
function printPositionIntersection(pos : PositionIntersection) : string {
    if (pos.left.$type == 'PositionIntersection' || pos.right.$type == 'PositionIntersection'
            || pos.left.xshift || pos.left.yshift || pos.right.xshift || pos.right.yshift) {
        // TikZ requires a complex syntax for complex cases
        let result = "perpendicular cs:";
        if (pos.kind == '-|') {
            result = result + "horizontal line through={" + printPosition(pos.left, true) + "}";
            result = result + ",";
            result = result + "vertical line through={" + printPosition(pos.right, true) + "}";
        } else {
            result = result + "vertical line through={" + printPosition(pos.left, true) + "}";
            result = result + ",";
            result = result + "horizontal line through={" + printPosition(pos.right, true) + "}";
        }
        return result;
    } else {
        // TikZ supports an easier syntax for simple cases
        let result = printPosition(pos.left, false) + " ";
        if (pos.kind == '-|') {
            result = result + "-|";
        } else {
            result = result + "|-";
        }
        result = result + " " + printPosition(pos.right, false);
        return result;
    }
}
function printPositionAlongEdge(pos : PositionAlongEdge) : string {
    return "pos=" + pos.pos;
}
