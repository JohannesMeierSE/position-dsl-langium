# position-dsl-langium
Exploring Langium with a textual DSL for positions of elements in graphical diagrams


## Objectives and Context of this Project

* Main objective of this project is to learn Langium (https://langium.org/) for creating textual DSLs.
* Since Langium is web-based with TypeScript and VS Code extensions, secondary objectives are to learn the programming languages TypeScript and JavaScript as well as the IDE Visual Studio Code.
* Therefore, this project develops a new textual DSL with Langium and provides some custom functionalities (validation, code generation) around this DSL.


## Features of the DSL

The textual DSL describes a graphical diagram (or network or graph) consisting of nodes and edges with the focus on their layout via detailed positions:

* The `Model` of the graphical diagram consists of `Nodes` and `Edges`, which are identified by (unique) `names` and might have an additional `description`.
* `Positions` are used to determine the positions of nodes and edges for the layout of the diagram:
  * A `Node` has an optional `Position` (which is "(0mm,0mm)" if missing).
  * An `Edge` starts at one `Position` and ends at another `Position` and might have arbitrary intermediate `Positions`. Each of these parts route the edge directly (`--`) or rectangular (`-|` first horizontal second vertical, `|-` first vertical second horizontal).
* There are four kinds of `Positions`:
  * `PositionNormal` specifies the position with x and y coordinates (`3mm,-2.4pt`) and allows to place an element at any absolute position.
  * `PositionAnchor` specifies a position relative to a `Node` which is identified by its name (`node2`).
  * `PositionIntersection` specifies a position related to two different positions at their rectangular intersection (`(node2) -| (2mm,3mm)`).
  * `PositionAlongEdge` defines one point on the current `Edge` as position, specified as a floating value between 0 (the start point of the edge) and 1 (the end point of the edge). This is a special support for `TextElements` (see below).
* Additionally, all kinds of `Positions` can be shifted in horizontal (`xshift=2mm`) and vertical (`yshift=-3.4pt`) direction.
* Anchors of `Nodes` specify one point of the node, e.g. `center` for the middle of the node or `north west` for the upper left corner of the node. Anchors can be used to concretize a `PositionAnchor` (`node2.south`) or to determine the point of a node which is adjusted to be exactly at the specified position of this node.
* `TextElements` allow to place some `text` at the beginng and the end of an `Edge`. Here, `PositionAlongEdge` can be used for positions of `TextElements` to align them along the edge.

The definition of a corresponding grammar is realized in [position-diagram-dsl/src/language-server/positions-in-diagrams.langium](position-diagram-dsl/src/language-server/positions-in-diagrams.langium).


## Validation of Constraints

* `Nodes` and `Edges` must have unique `names`.
* The `container` of a `PositionAlongEdge` must be a `TextElement`.

The validation is realized in [position-diagram-dsl/src/language-server/positions-in-diagrams-validator.ts](position-diagram-dsl/src/language-server/positions-in-diagrams-validator.ts).


## Code Generation

There are two different generators for this DSL:

### generate TikZ code

* Since the sketched DSL is strongly inspired by the TikZ language for typesetting vector graphics with LaTeX (https://www.ctan.org/pkg/pgf), the first generator takes a diagram specification conforming to the new DSL and provides a text document which can be rendered by pdfLaTeX into a scalable vector graphic embedded into a PDF file.
* Since TikZ/PGF provide much more features, which are not required in this scenario, this new DSL makes sense to provide only some features to the user in a more consise way.
* Execute the TikZ generator with `./bin/cli generate examples/example1.posdia` to generate corresponding TikZ code into the folder `generated/`, `cd generated/`, execute the generated document with `pdflatex example1.tex` and look at the resulting `example1.pdf`.
* This generator is realized in [position-diagram-dsl/src/cli/generator.ts](position-diagram-dsl/src/cli/generator.ts).

### TODO another generator


## Example

Here is an example, which conforms to the Langium grammer:
![examples/example1.posdia](position-diagram-dsl/examples/example1.posdia)

The corresponding result of the TikZ generator (see above) is:
![examples/example1.tex](position-diagram-dsl/examples/example1.tex)

Using `pdflatex` will produce this PDF:
![examples/example1.pdf](position-diagram-dsl/examples/example1.pdf)


## Test the DSL

There are different options to test the DSL:

* Work with the sourcecode of this project:
  * as preparation, read https://langium.org/docs/getting-started/ before, install VS Code and Node.js and install all Langium packages (`npm install -
g yo langium generator-langium langium-cli`)
  * checkout this repository: `git clone https://github.com/JohannesMeierSE/position-dsl-langium.git`, `cd position-dsl-langium/position-diagram-dsl/`
  * install required dependencies with `npm install` locally (these dependencies are located in `node_modules/` afterwards)
  * generate JavaScript from the provided TypeScript code: `npm run build`
  * use VS Code to start the project as VS Code extension in a new instance of VS Code and use the custom editor to write text files conforming to the grammar (or try the provided example in [`examples/example1.posdia`](position-diagram-dsl/examples/example1.posdia))
  * run one of the generators (see above)
* Use the official playground of Langium at https://langium.org/playground/:
  * Copy the grammar definition in [position-diagram-dsl/src/language-server/positions-in-diagrams.langium](position-diagram-dsl/src/language-server/positions-in-diagrams.langium) into the left editor
  * Use the editor on the right to write text conforming to the grammar or copy this example into the right editor: [position-diagram-dsl/examples/example1.posdia](position-diagram-dsl/examples/example1.posdia)
 

## Technical Details of the DSL

* Extension name: position-diagram-dsl
* Language name: Positions in Diagrams
* File extensions: .posdia
