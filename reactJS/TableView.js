class TableView extends React.Component {
  constructor(props) {
    super();
    this.state = {
      name: 'Bob',
      joinTable: 'false',
      rejoinWaitTimer: 0,
      sitOutNext: false,
      quitYesOrNo: false,
      turn: false,
      token: null,
      bootPlayer: false,
      bootPlayerTimer: 0,
      bet: 0,
      newBet: 0,
      time: 0
    };
    window.setTableState = this.setState.bind(this);
  }

  render() {
    return (
      <table>
      <tbody>
        {Object.entries(this.state).map( function(entry) {
          entry[1] = String(entry[1]);
          return  <tr>
                      <td>{entry[0]}:</td> 
                      <td>{entry[1]}</td>
                  </tr>
        })}
      </tbody>
      </table>
    )
  }
}


