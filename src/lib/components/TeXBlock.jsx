/* eslint-disable react/sort-comp */
import React, { Component } from 'react';
import unionClassNames from 'union-class-names';
import KatexOutput from './KatexOutput';

export default class TeXBlock extends Component {
    callbacks = {};

    ref = React.createRef();

    constructor(props) {
        super(props);
        this.state = {
          editMode: false,
          saveCount: 0,
        };
    }

    componentDidMount() {
        document.addEventListener('keydown', this.onKeyDown, false);
        document.addEventListener('mousedown', this.onClickOutside, false);

        if (this.props.store.openImmediately) {
            this.onClick();
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.onKeyDown, false);
        document.removeEventListener('mousedown', this.onClickOutside, false);
    }

    render() {
        const { theme, doneContent, cancelContent, katex } = this.props;
        const { editMode, invalidTeX, inputValue, value } = this.state;
        const editorValue = this.getValue().value;

        let texContent = null;

        if (editMode) {
            if (invalidTeX) {
                texContent = '';
            } else {
                texContent = value;
            }
        } else {
            texContent = editorValue;
        }

        const { displayMode } = this.getValue();

        let className = theme.tex;

        if (editMode) {
            className = unionClassNames(className, theme.activeTeX);
        }

        let editPanel = null;

        if (editMode) {
            const output = invalidTeX ? (
                <div className={theme.errorMessage}>{invalidTeX}</div>
            ) : (
                <KatexOutput katex={katex} value={texContent} onClick={this.onClick} displayMode={displayMode} />
            );

            const okButtonTitle = invalidTeX
                ? 'Invalid KaTeX syntax, please correct your formula first'
                : 'Apply formula';

            const textAreaClassNames = unionClassNames(theme.texValue, theme['texValue--textarea']);
            const textAreaEmulatorClassNames = unionClassNames(theme.texValue, theme['texValue--emulator']);

            editPanel = (
                <div className={theme.panel}>
                    <div className={theme.relative}>
                        <div className={textAreaEmulatorClassNames}>{inputValue}</div>
                        <textarea
                            className={textAreaClassNames}
                            onChange={this.onValueChange}
                            onFocus={this.onFocus}
                            value={inputValue}
                        />

                        <div className={theme.panelOutput}>{output}</div>
                    </div>
                    <div className={theme.footer}>
                        <a
                            href="https://mathlive.io/deploy/reference.html"
                            onClick={this.onClickExternalLink}
                            className={theme.link}
                            title="Open syntax documentation in new window"
                        >
                            Syntax
                        </a>

                        <div className={theme.buttons}>
                            <button
                                type="button"
                                className={theme.button}
                                onClick={this.cancel}
                                title="Cancel editing and close modal"
                            >
                                {cancelContent}
                            </button>

                            <button
                                type="button"
                                className={theme.button}
                                disabled={invalidTeX}
                                onClick={this.save}
                                title={okButtonTitle}
                            >
                                {doneContent.valid}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div ref={this.ref} className={className}>
                <div className="katex-static-output">
                    {editMode ? (
                        <KatexOutput
                            callbacks={this.callbacks}
                            displayMode={displayMode}
                            katex={katex}
                            onChange={this.onMathInputChange}
                            value={editorValue}
                        />
                    ) : (
                        <KatexOutput
                            katex={katex}
                            value={editorValue}
                            onClick={this.onClick}
                            displayMode={displayMode}
                        />
                    )}
                </div>

                {editPanel}
            </div>
        );
    }

    startEdit = () => {
        const { block, blockProps } = this.props;
        blockProps.onStartEdit(block.getKey());
    };

    finishEdit = (newContentState) => {
        const { block, blockProps } = this.props;
        blockProps.onFinishEdit(block.getKey(), newContentState);
    };

    remove = () => {
        const { block, blockProps } = this.props;
        blockProps.onRemove(block.getKey());
    };

    cancel = () => {
      const { saveCount } = this.state;

      if (saveCount) {
        this.setState({
          invalidTeX: false,
          editMode: false,
          value: null,
        });
      } else {
        this.remove();
      }
    };

    save = () => {
        const { block, store } = this.props;
        const { value, inputValue, saveCount } = this.state;

        const entityKey = block.getEntityAt(0);
        const editorState = store.getEditorState();

        const contentState = editorState.getCurrentContent();

        contentState.mergeEntityData(entityKey, {
            value,
            inputValue,
        });

        this.setState(
            {
                invalidTeX: false,
                editMode: false,
                value: null,
                saveCount: saveCount + 1,
            },
            this.finishEdit.bind(this, editorState)
        );
    };

    onKeyDown = (event) => {
        if ('Escape' === event.key) {
            this.onEsc();
        }
    };

    onClickOutside = (event) => {
        const { editMode } = this.state;

        if (editMode) {
            const { target } = event;
            const { current } = this.ref;

            const isOutside = target !== current && !current.contains(target);

            const { invalidTeX } = this.state;

            if (isOutside && !invalidTeX) {
                this.save();
            }
        }
    };

    onEsc = () => {
        this.cancel();
    };

    onClick = () => {
        const { editMode } = this.state;
        const { store } = this.props;
        if (editMode || store.getReadOnly()) {
            return;
        }
        this.setState(
            {
                editMode: true,
                ...this.getValue(),
            },
            () => {
                this.startEdit();
            }
        );
    };

    onValueChange = (evt) => {
        const { value } = evt.target;
        this.onMathInputChange(value);
    };

    onFocus = () => {
        if (this.callbacks.blur) {
            this.callbacks.blur();
        }
    };

    onMathInputChange = (inputValue) => {
        let invalid = false;
        const { katex, translator } = this.props;
        const value = translator(inputValue);
        try {
            katex.__parse(value); // eslint-disable-line no-underscore-dangle
        } catch (err) {
            invalid = err.message;
        } finally {
            this.setState({
                invalidTeX: invalid,
                value,
                inputValue,
            });
        }
    };

    onClickExternalLink = (event) => {
        window.open(event.target.href);
        event.preventDefault();
    };

    getValue = () => {
        const { block, store } = this.props;
        const contentState = store.getEditorState().getCurrentContent();
        return contentState.getEntity(block.getEntityAt(0)).getData();
    };
}
