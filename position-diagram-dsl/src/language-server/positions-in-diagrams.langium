grammar PositionsInDiagrams

entry Model:
    ( nodes+=Node | edges+=Edge )*;

Node:
    'node' ElementIdentification ('anchor=' anchor=POS_ANCHOR)? ('at=' position=Position<false>)? ';';

Edge:
    'edge' ElementIdentification fromText=TextElement? from=Position<false> parts+=EdgePart+ toText=TextElement? ';';
EdgePart:
    routing=ROUTING pos=Position<false>;

Position<allowPositionAlongEdge>:
    '(' ('[' ('xshift=' xshift=POS_NUM)? ('yshift=' yshift=POS_NUM)? ']')?
    ( PositionNormal | PositionAnchor | PositionIntersection | <allowPositionAlongEdge> PositionAlongEdge ) ')';

PositionNormal:
    posX=POS_NUM ',' posY=POS_NUM;
PositionAnchor:
    node=[Node:ID] ('.' nodeanchor=POS_ANCHOR)?;
PositionIntersection:
    left=Position<false> kind=INTERSECTION right=Position<false>;
PositionAlongEdge: // it has similar properties like other position kinds, but is usable only in special situations => guard condition
    pos=POS_EDGE;

fragment ElementIdentification:
    name=ID ('description=' description=TEXT)?;

TextElement:
    '[text:' 'pos=' pos=Position<true> ('text=' text=TEXT)? ('label=' label=ID)? ']';

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][-\w_]*/;
terminal TEXT: /"[-+\s_a-zA-Z0-9]*"/;
terminal POS_NUM returns string: /[-+]?\d+(\.\d+)?(mm|pt)/;
POS_ANCHOR returns string: 'north_west' | 'north_east' | 'north'
    | 'south_west' | 'south_east' | 'south' | 'west' | 'east' | 'center'; // a "data type rule" (without 'terminal' keyword!)
terminal POS_EDGE returns number: /[-+]?\d+(\.\d+)?/; // strong alternative: /(1\.0)|1|(0\.\d+)|0/
INTERSECTION returns string: '-|' | '|-';
ROUTING returns string: '--' | '-|' | '|-';

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
