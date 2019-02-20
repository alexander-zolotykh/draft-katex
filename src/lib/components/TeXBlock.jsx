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
        // eslint-disable-next-line no-unused-vars
        const { theme, doneContent, removeContent, cancelContent, katex } = this.props
        const { editMode, invalidTeX, inputValue, value } = this.state

        let texContent = null
        if (editMode) {
            if (invalidTeX) {
                texContent = ''
            } else {
                texContent = value
            }
        } else {
            texContent = this.getValue().value
        }
        const { displayMode } = this.getValue()

        let className = theme.tex

        if (editMode) {
            className = unionClassNames(className, theme.activeTeX)
        }

        let editPanel = null

        if (editMode) {
            let buttonClass = theme.button

            if (invalidTeX) {
                buttonClass = unionClassNames(buttonClass, theme.invalidButton)
            }

            editPanel = (
                <div className={theme.panel}>
                    <div className={theme.relative}>
                        <textarea
                            className={theme.texValue}
                            onChange={this.onValueChange}
                            onFocus={this.onFocus}
                            value={inputValue}
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

                            <button type="button" className={buttonClass} onClick={this.cancel}>
                                {cancelContent}
                            </button>

                            <button type="button" className={buttonClass} disabled={invalidTeX} onClick={this.save}>
                                {invalidTeX ? doneContent.invalid : doneContent.valid}
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        // eslint-disable-next-line react/destructuring-assignment
        const MathInput = this.props.MathInput || KatexOutput
        return (
            <div ref={this.ref} className={className}>
                {editMode ? (
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
        const { value, inputValue } = this.state

        const entityKey = block.getEntityAt(0)
        const editorState = store.getEditorState()

        const contentState = editorState.getCurrentContent()

        contentState.mergeEntityData(entityKey, {
            value,
            inputValue,
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
        const { editMode } = this.state
        const { store } = this.props
        if (editMode || store.getReadOnly()) {
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
        const { value } = evt.target
        this.onMathInputChange(value)
    }

    onFocus = () => {
        if (this.callbacks.blur) {
            this.callbacks.blur()
        }
    }

    onMathInputChange = (inputValue) => {
        let invalid = false
        const { katex, translator } = this.props
        const value = translator(inputValue)
        try {
            katex.__parse(value) // eslint-disable-line no-underscore-dangle
        } catch (err) {
            invalid = true
        } finally {
            this.setState({
                invalidTeX: invalid,
                value,
                inputValue,
            })
        }
    }

    onClickExternalLink = (event) => {
        window.open(event.target.href)
        event.preventDefault()
    }

    getValue = () => {
        const { block, store } = this.props
        const contentState = store.getEditorState().getCurrentContent()
        return contentState.getEntity(block.getEntityAt(0)).getData()
    }
}
