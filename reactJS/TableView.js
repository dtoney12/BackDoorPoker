class TableView extends React.Component {
  constructor(props) {
    super();
    this.state = {
      name: 'Bobs',
      password: '',
      update: '',
      joinTable: false,
      turn: false,
      bet: 0,
      newBet: 0,
      message: '',
      rejoinWaitTimer: 0,
      sitOutNext: false,
      quitYesOrNo: false,
      token: null,
      bootPlayer: false,
      bootPlayerTimer: 0
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


