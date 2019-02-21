import React, { Children, Component } from 'react';
import * as PropTypes from 'prop-types';
import unionClassNames from 'union-class-names';
import insertTeXBlock from '../modifiers/insertTeXBlock';

export default class InsertKatexButton extends Component {
    static propTypes = {
        children: PropTypes.node,
        initialValue: PropTypes.string,
        translator: PropTypes.func.isRequired,
        // eslint-disable-next-line react/forbid-prop-types
        theme: PropTypes.any,
    };

    static defaultProps = {
        initialValue: null,
        theme: null,
        children: null,
    };

    onClick = () => {
        const { store, translator, initialValue } = this.props;

        const editorState = store.getEditorState();

        store.setEditorState(insertTeXBlock(editorState, translator, initialValue));
    };

    render() {
        const { theme = {}, className, children, defaultContent } = this.props;
        const combinedClassName = unionClassNames(theme.insertButton, className);
        const content = Children.count(children) ? children : defaultContent;

        return (
            <button className={combinedClassName} onClick={this.onClick} type="button">
                {content}
            </button>
        );
    }
}
