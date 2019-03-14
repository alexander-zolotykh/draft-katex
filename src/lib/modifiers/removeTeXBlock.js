import {
    Modifier,
    EditorState,
    SelectionState
} from 'draft-js';

export default (editorState, blockKey) => {
    let content = editorState.getCurrentContent();
    const newSelection = new SelectionState({
        anchorKey: blockKey,
        anchorOffset: 0,
        focusKey: blockKey,
        focusOffset: 0,
    });

    const beforeKey = content.getKeyBefore(blockKey);
    const afterKey = content.getKeyAfter(blockKey);
    const beforeBlock = content.getBlockForKey(beforeKey);
    const afterBlock = content.getBlockForKey(afterKey);

    const isBeforeBlockEmpty = beforeBlock.getLength() === 0;
    const isAfterBlockEmpty = afterBlock.getLength() === 0;

    const fromKey = isBeforeBlockEmpty ? beforeKey : blockKey;
    const toKey = isAfterBlockEmpty ? afterKey : blockKey;

    const targetRange = new SelectionState({
        anchorKey: fromKey,
        anchorOffset: 0,
        focusKey: toKey,
        focusOffset: 0,
    });

    // change the blocktype and remove the characterList entry with the sticker
    content = Modifier.setBlockType(
        content,
        targetRange,
        'unstyled'
    );

    content = Modifier.removeRange(content, targetRange, 'backward');

    // force to new selection
    const newState = EditorState.push(editorState, content, 'remove-range');

    return EditorState.forceSelection(newState, newSelection);
};
