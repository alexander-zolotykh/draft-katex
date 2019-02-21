import React from 'react';
import * as PropTypes from 'prop-types';

export default class KatexOutput extends React.Component {
    static propTypes = {
        value: PropTypes.string.isRequired,
        // eslint-disable-next-line react/forbid-prop-types
        katex: PropTypes.object.isRequired,
        displayMode: PropTypes.bool.isRequired,
        onClick: PropTypes.func,
    };

    static defaultProps = {
        onClick: () => {},
    };

    constructor(props) {
        super(props);
        this.timer = null;
    }

    componentDidMount() {
        this.update();
    }

    componentWillReceiveProps({ value }) {
        // eslint-disable-next-line react/destructuring-assignment
        if (value !== this.props.value) {
            this.update();
        }
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
        this.timer = null;
    }

    update = () => {
        const { katex } = this.props;
        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.timer = setTimeout(() => {
            const { displayMode, value } = this.props;
            katex.render(value, this.container, {
                displayMode,
            });
        }, 0);
    };

    render() {
        const { onClick } = this.props;

        return (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
            <div
                ref={(container) => {
                    this.container = container;
                }}
                onClick={onClick}
            />
        );
    }
}
