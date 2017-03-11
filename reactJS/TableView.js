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
    window.setPState = this.setState.bind(this);
  }

  render() {
    return (
      <table>
      <tbody>
        {Object.entries(this.state).map( function(entry) {
          // console.log(entry);
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


