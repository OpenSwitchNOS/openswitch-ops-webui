/*
 * Properties table that shows property names and values.
 * @author Frank Wood
 */

var React = require('react'),
    PropTypes = React.PropTypes,
    ClassNames = require('classnames');

module.exports = React.createClass({

    displayName: 'PropTable',

    propTypes: {
        className: PropTypes.string,
        data: PropTypes.arrayOf(PropTypes.array).isRequired
    },

    render: function() {
        var cls = ClassNames(
            'propTable',
            this.props.className
        );

        return (
            <table className={cls}>
                <tbody>
                    {this.props.data.map(function(row) {
                        var name = row[0];
                        name = typeof name === 'string' && name.length > 0 ?
                                name + ':' : '';
                        return (
                            <tr key={name}>
                                <td>{name}</td><td>{row[1]}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    }

});
