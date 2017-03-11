class TableView extends React.Component {
  constructor(props) {
    super();
    this.state = {
    };
  }

  render() {
    return (
      <table>
        {Object.entries(this.props.playerState).map( function(entry) {
          console.log(entry);
          return  <tr>
                    <td>{entry[0]}:</td> <td>{entry[1]}</td>
                  </tr>
        })}
      </table>
    )
  }
}

// PropTypes tell other developers what `props` a component expects
// Warnings will be shown in the console when the defined rules are violated
TableView.propTypes = {
  playerState: React.PropTypes.object.isRequired
};

// In the ES6 spec, files are "modules" and do not share a top-level scope
// `var` declarations will only exist globally where explicitly defined
window.TableView = TableView;
