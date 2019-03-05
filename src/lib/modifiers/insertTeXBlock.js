import {
    EditorState,
    AtomicBlockUtils,
} from 'draft-js';
import { getEditorStyles, setEditorStyles } from '../utils';

let count = 0;
const examples = [
    'f(x)=\\frac{ax^2}{y}+bx+c',

    'P(E) = \\binom{n}{k} p^k (1-p)^{ n-k}',

    `\\gamma \\overset{def}{=}
  \\lim\\limits_{n \\to \\infty} \\left(
    \\sum\\limits_{k=1}^n {1 \\over k} - \\ln n
  \\right) \\approx 0.577 |`,
];

export default function insertTeXBlock(editorState, translator, tex, displayMode = true) {
    let texContent = tex;

    if (!texContent) {
        const nextFormula = count % examples.length;
        count += 1;
        texContent = examples[nextFormula];
    }

    const styles = getEditorStyles(editorState);
    const contentState = editorState.getCurrentContent();
    const newContentState = contentState.createEntity('KateX', 'IMMUTABLE', {
        value: translator(texContent),
        inputValue: texContent,
        displayMode,
    });

    let nextEditorState = AtomicBlockUtils.insertAtomicBlock(
        editorState,
        newContentState.getLastCreatedEntityKey(),
        ' ',
    );

    nextEditorState = EditorState.forceSelection(nextEditorState, nextEditorState.getCurrentContent().getSelectionAfter());

    nextEditorState = setEditorStyles(nextEditorState, styles);

    return nextEditorState;
}
