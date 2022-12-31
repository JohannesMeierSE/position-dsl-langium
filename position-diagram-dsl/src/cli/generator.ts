import fs from 'fs';
import { CompositeGeneratorNode, NL, toString } from 'langium';
import path from 'path';
import { Model, Position, PositionAlongEdge, PositionAnchor, PositionIntersection, PositionNormal, POS_ANCHOR, TextElement } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';

export function generateTikZ(model: Model, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.tex`;

    const text = new CompositeGeneratorNode();
    text.append('\\documentclass[tikz]{standalone}', NL);
    text.append('\\begin{document}', NL);
    text.append('\\begin{tikzpicture}[n/.style={rectangle,draw},e/.style={draw,-},t/.style={rectangle,draw=none,align=center}]', NL, NL);

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
        text.append(`\\draw[e] `);
        text.append(printPosition(edge.from, true));
        text.append(printTextElement(edge.fromText));
        edge.parts.forEach(part => {
            text.append(" " + part.routing + " " + printPosition(part.pos, true));
        });
        text.append(printTextElement(edge.toText));
        text.append(`;`, NL);
    });

    text.append(NL, '\\end{tikzpicture}', NL);
    text.append('\\end{document}', NL);

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(text));
    return generatedFilePath;
}

function printTextElement(text : TextElement | undefined) : string {
    if (text == undefined) {
        return "";
    }
    let result = ` node[t] {${text.text}}`;
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

function printPositionNormal(pos : PositionNormal) : string {
    return pos.posX + ", " + pos.posY;
}
function printPositionAnchor(pos : PositionAnchor) : string {
    return pos.node.ref?.name + printAnchor(pos.nodeanchor, ".", "");
}
function printPositionIntersection(pos : PositionIntersection) : string {
    let result = printPosition(pos.left, true) + " ";
    if (pos.kind == '-|') {
        result = result + "-|";
    } else {
        result = result + "|-";
    }
    result = result + " " + printPosition(pos.right, true);
    return result;
}
function printPositionAlongEdge(pos : PositionAlongEdge) : string {
    return "pos=" + pos.pos;
}
