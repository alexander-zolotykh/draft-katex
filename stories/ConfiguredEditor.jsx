import React, { Component } from 'react';
import asciimath2latex from 'asciimath-to-latex';
import { EditorState, RichUtils } from 'draft-js';

import Editor from 'draft-js-plugins-editor';

import { createKaTeXPlugin, katex } from '../src';
import '../src/lib/styles.module.css';

const katexTheme = {
    insertButton: 'Button Button-small Button-insert',
};

function configuredEditor(props) {
    const kaTeXPlugin = createKaTeXPlugin({
        // the configs here are mainly to show you that it is possible. Feel free to use w/o config
        doneContent: {
            valid: 'Ok',
            invalid: 'Invalid syntax',
        },
        katex, // <-- required
        removeContent: 'Remove',
        cancelContent: 'Cancel',
        theme: katexTheme,
        translator: props.withAsciimath ? asciimath2latex : null,
    });

    const plugins = [kaTeXPlugin];

    const baseEditorProps = Object.assign({
        plugins,
    });

    return {
        baseEditorProps,
        InsertButton: kaTeXPlugin.InsertButton,
        insertFormula: kaTeXPlugin.insertFormula,
    };
}

export default class ConfiguredEditor extends Component {
    static propTypes = {};

    constructor(props) {
        super(props);
        const { baseEditorProps, InsertButton, insertFormula } = configuredEditor(props);
        this.baseEditorProps = baseEditorProps;
        this.InsertButton = InsertButton;
        this.insertFormula = insertFormula;
        const editorState = this.getDefaultState();

        this.state = {
            editorState,
        };
    }

    componentDidMount() {
        this.focus();
    }

    getDefaultState = () => RichUtils.toggleInlineStyle(EditorState.createEmpty(), "BOLD");

    // use this when triggering a button that only changes editorstate
    onEditorStateChange = (editorState) => {
        this.setState(() => ({
            editorState,
        }));
    };

    focus = () => {
        this.editor.focus();
    };

    onInsertFormula = (evt) => {
        evt.preventDefault();
        this.insertFormula(undefined, true);
    };

    onBold = (evt) => {
        evt.preventDefault();

        this.setStyle("BOLD");
    };

    onItalic = (evt) => {
        evt.preventDefault();

        this.setStyle("ITALIC");
    };

    setStyle = (style) => {
        this.setState((state) => {
            return {
                editorState: RichUtils.toggleInlineStyle(state.editorState, style),
            };
        });
    };

    render() {
        const { InsertButton, state } = this;

        return (
            <div>
                <h1>DraftJS KaTeX Plugin</h1>

                <div
                    style={{
                        border: '#ccc 1px solid',
                        background: '#ccc',
                        padding: 10,
                    }}
                >
                    <InsertButton/>

                    <InsertButton initialValue="int(s-x)^3"> Insert ascii math </InsertButton>

                    <button type="button" onClick={this.onInsertFormula}>insertFormula()</button>
                    <button type="button" onMouseDown={this.onBold}>bold</button>
                    <button type="button" onMouseDown={this.onItalic}>italic</button>
                </div>

                <Editor
                    plugins={this.baseEditorProps.plugins}
                    ref={(element) => {this.editor = element;}}
                    editorState={state.editorState}
                    onChange={this.onEditorStateChange}
                />
            </div>
        );
    }

}
