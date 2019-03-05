import { RichUtils } from 'draft-js';

export function getEditorStyles(editorState) {
    return editorState.getCurrentInlineStyle().toArray();
}

export function setEditorStyles(editorState, styles = []) {
    return styles.reduce((state, style) => RichUtils.toggleInlineStyle(state, style), editorState);
}
