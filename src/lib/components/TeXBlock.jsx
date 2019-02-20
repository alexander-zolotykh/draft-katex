/* eslint-disable react/sort-comp */
import React, { Component } from 'react'
import unionClassNames from 'union-class-names'
import KatexOutput from './KatexOutput'

export default class TeXBlock extends Component {
    callbacks = {}
    ref = React.createRef()

    constructor(props) {
        super(props)
        this.state = { editMode: false }
    }

    componentDidMount() {
        document.addEventListener('keydown', this.onKeyDown, false)
        document.addEventListener('mousedown', this.onClickOutside, false)
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.onKeyDown, false)
        document.removeEventListener('mousedown', this.onClickOutside, false)
    }

    render() {
        const { theme, doneContent, removeContent, cancelContent, katex } = this.props

        let texContent = null
        if (this.state.editMode) {
            if (this.state.invalidTeX) {
                texContent = ''
            } else {
                texContent = this.state.value
            }
        } else {
            texContent = this.getValue().value
        }
        const displayMode = this.getValue().displayMode

        let className = theme.tex
        if (this.state.editMode) {
            className = unionClassNames(className, theme.activeTeX)
        }

        let editPanel = null
        if (this.state.editMode) {
            let buttonClass = theme.button
            if (this.state.invalidTeX) {
                buttonClass = unionClassNames(buttonClass, theme.invalidButton)
            }

            editPanel = (
                <div className={theme.panel}>
                    <div className={theme.relative}>
                        <textarea
                            className={theme.texValue}
                            onChange={this.onValueChange}
                            onFocus={this.onFocus}
                            value={this.state.inputValue}
                        />

                        <div className={theme.panelOutput}>
                            <KatexOutput
                                katex={katex}
                                value={texContent}
                                onClick={this.onClick}
                                displayMode={displayMode}
                            />
                        </div>
                    </div>
                    <div className={theme.footer}>
                        <a
                            href="https://mathlive.io/deploy/reference.html"
                            onClick={this.onClickExternalLink}
                            className={theme.link}
                        >
                            Syntax
                        </a>

                        <div className={theme.buttons}>
                            {/* <button className={buttonClass} onClick={this.remove}>
                {removeContent}
              </button> */}

                            <button className={buttonClass} onClick={this.cancel}>
                                {cancelContent}
                            </button>

                            <button className={buttonClass} disabled={this.state.invalidTeX} onClick={this.save}>
                                {this.state.invalidTeX ? doneContent.invalid : doneContent.valid}
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        const MathInput = this.props.MathInput || KatexOutput
        return (
            <div ref={this.ref} className={className}>
                {this.state.editMode ? (
                    <MathInput
                        callbacks={this.callbacks}
                        displayMode={displayMode}
                        katex={katex}
                        onChange={this.onMathInputChange}
                        value={texContent}
                    />
                ) : (
                    <KatexOutput katex={katex} value={texContent} onClick={this.onClick} displayMode={displayMode} />
                )}

                {editPanel}
            </div>
        )
    }

    startEdit = () => {
        const { block, blockProps } = this.props
        blockProps.onStartEdit(block.getKey())
    }

    finishEdit = (newContentState) => {
        const { block, blockProps } = this.props
        blockProps.onFinishEdit(block.getKey(), newContentState)
    }

    remove = () => {
        const { block, blockProps } = this.props
        blockProps.onRemove(block.getKey())
    }

    cancel = () => {
        this.setState({
            invalidTeX: false,
            editMode: false,
            value: null,
        })
    }

    save = () => {
        const { block, store } = this.props

        const entityKey = block.getEntityAt(0)
        const editorState = store.getEditorState()

        const contentState = editorState.getCurrentContent()

        contentState.mergeEntityData(entityKey, {
            value: this.state.value,
            inputValue: this.state.inputValue,
        })

        this.setState(
            {
                invalidTeX: false,
                editMode: false,
                value: null,
            },
            this.finishEdit.bind(this, editorState)
        )
    }

    onKeyDown = (event) => {
        if ('Escape' === event.key) {
            this.onEsc()
        }
    }

    onClickOutside = (event) => {
        const isOutside = event.currentTarget !== this.ref.current && !this.ref.current.contains(event.currentTarget)

        if (isOutside) {
            this.cancel()
        }
    }

    onEsc = () => {
        this.cancel()
    }

    onClick = () => {
        if (this.state.editMode || this.props.store.getReadOnly()) {
            return
        }
        this.setState(
            {
                editMode: true,
                ...this.getValue(),
            },
            () => {
                this.startEdit()
            }
        )
    }

    onValueChange = (evt) => {
        const value = evt.target.value
        this.onMathInputChange(value)
    }

    onFocus = () => {
        if (this.callbacks.blur) {
            this.callbacks.blur()
        }
    }

    onMathInputChange = (inputValue) => {
        let invalid = false
        const value = this.props.translator(inputValue)
        try {
            this.props.katex.__parse(value) // eslint-disable-line no-underscore-dangle
        } catch (e) {
            invalid = true
        } finally {
            this.setState({
                invalidTeX: invalid,
                value,
                inputValue,
            })
        }
    }

    onClickExternalLink(event) {
        window.open(event.target.href)
        event.preventDefault()
    }

    getValue = () => {
        const contentState = this.props.store.getEditorState().getCurrentContent()
        return contentState.getEntity(this.props.block.getEntityAt(0)).getData()
    }
}
