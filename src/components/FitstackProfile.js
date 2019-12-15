import React, { Component } from "react"
import * as blockstack from "blockstack"
import Joyride, { ACTIONS, EVENTS, STATUS } from "react-joyride"
import DatePicker from "react-datepicker"
import { Form } from "react-bootstrap"
import { LineChart } from "react-chartkick"

import "react-datepicker/dist/react-datepicker.css"
import logo from "./../assets/fit_logo.png"
import "chart.js"

const GET_OPTIONS = {
  decrypt: true
}

const PUT_OPTIONS = {
  encrypt: true
}

function Square(props) {
  return (
      <button className="square" onClick={props.onClick}>
          {props.value}
      </button>
  );
}

function calculateWinner(squares) {
  const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
          return squares[a];
      }
  }
  return null;
}

class Board extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
          move: 0,
          squares: Array(9).fill(null),
          squaresHistory: Array(9).fill(null),
          xIsNext: true,
      };
  }

  handleClick(i) {
      const squares = this.state.squares.slice();
      const squaresHistory = this.state.squaresHistory.slice();

      if (calculateWinner(squares) || squares[i]) {
          return;
      }

      let x = 'X';
      let o = 'O';

      let move = this.state.move;
      squaresHistory[move] = this.state.squares;
      move++;
      squares[i] = this.state.xIsNext ? x : o;

      this.setState({
          move: move,
          squares: squares,
          squaresHistory: squaresHistory,
          xIsNext: !this.state.xIsNext,
      });

      this.props.onToggleX(this.state.xIsNext);
  }

  handleUndo() {
      let move = this.state.move;

      const squaresHistory = this.state.squaresHistory.slice();
      squaresHistory[move] = this.state.squares;

      --move;
      this.setState({
          move: move,
          squares: this.state.squaresHistory[move],
          squaresHistory: squaresHistory,
          xIsNext: !this.state.xIsNext,
      });

      this.props.onToggleX(this.state.xIsNext);
  }

  handleRedo() {
      let move = this.state.move;
      move++;
      this.setState({
          move: move,
          squares: this.state.squaresHistory[move],
          xIsNext: !this.state.xIsNext,
      });

      this.props.onToggleX(this.state.xIsNext);
  }

  handleNewGame() {
      this.setState({
          move: 0,
          squares: Array(9).fill(null),
          squaresHistory: Array(9).fill(null),
          xIsNext: true,
      });

      this.props.onToggleX(this.state.xIsNext);
  }

  renderSquare(i) {
      return (
          <Square
              extraClass={this.state.xIsNext ? 'revert' : ''}
              value={this.state.squares[i]}
              onClick={() => this.handleClick(i)}
          />
      );
  }

  render() {
      const winner = calculateWinner(this.state.squares);
      let status;
      if (winner) {
          status = 'Winner: ' + winner;
      } else {
          status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      }
      return (
          <div>
              <div className="status">{status}</div>
              <div className="board-row">
                  {this.renderSquare(0)}
                  {this.renderSquare(1)}
                  {this.renderSquare(2)}
              </div>
              <div className="board-row">
                  {this.renderSquare(3)}
                  {this.renderSquare(4)}
                  {this.renderSquare(5)}
              </div>
              <div className="board-row">
                  {this.renderSquare(6)}
                  {this.renderSquare(7)}
                  {this.renderSquare(8)}
              </div>
              <div className="icons">
                  <button
                      data-tip="Undo"
                      className="function-button"
                      disabled={this.state.move === 0}
                      onClick={() => this.handleUndo()}>
                      <FontAwesomeIcon icon={faUndo} size="4x" />
                  </button>
                  <ReactTooltip place="bottom" type="info" effect="float" />
                  <button
                      data-tip="Redo"
                      className="function-button"
                      disabled={this.state.squaresHistory[this.state.move + 1] === null}
                      onClick={() => this.handleRedo()}>
                      <FontAwesomeIcon icon={faRedo} size="4x" />
                  </button>
                  <ReactTooltip place="bottom" type="info" effect="float" />
                  <button
                      data-tip="New Game"
                      className="function-button"
                      onClick={() => this.handleNewGame()}>
                      <FontAwesomeIcon icon={faFile} size="4x" />
                  </button>
                  <ReactTooltip place="bottom" type="warning" effect="float" />
              </div>
          </div>
      );
  }
}

class Game extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
          classes: 'game',
      };
  }

  onToggleX = x => {
      this.setState({
          classes: x ? 'revert game' : 'game',
      });
  };
  render() {
      return (
          <div className={this.state.classes}>
              <div className="game-board">
                  <Board onToggleX={this.onToggleX} />
              </div>
          </div>
      );
  }
}

export default class FitstackProfile extends Component {
  state = {
    weightLogs: [],
    loading: true,
    run: false,
    inputDate: '',
    inputUnits: 'lb',
    inputWeight: '',
    stepIndex: 0, // a controlled tour
    steps: [
      {
        target: ".dash-header-text",
        content:
          "Welcome to the Fitness Stack weight tracker! This app allows you to securely track and share your weight loss achievements with friends."
      },
      {
        target: ".dash-entry",
        content: "New weight logs can be added from the bottom input here."
      },
      {
        target: ".dash-add",
        content:
          "Adding an entry appends it to your existing ledger, managed by Blockstack's decentralized and permissioned network."
      },
      {
        target: ".dash-delete",
        content:
          "Deleting the table is irreversible and remove all entries from your ledger. Only use this if you are certain you want to start over!"
      },
      {
        target: ".dash-chart",
        content:
          "We'll automatically plot your data over time as you add weight entries."
      },
      {
        target: ".dash-logout",
        content:
          "Logging out won't remove your data. It'll be saved so your can see it, save it, or make a new entry, the next time you visit!"
      }
    ],
  }

  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleDateChange = this.handleDateChange.bind(this)
    this.saveWeight = this.saveWeight.bind(this)
    this.deleteList = this.deleteList.bind(this)
  }

  componentDidMount() {
    this.listWeight()
  }

  getLogFile = () => 'logs.json'

  handleDateChange(inputDate) {
    this.setState({inputDate})
  }

  listWeight() {
    const self = this
    const { userSession, profile } = this.props
    let person = new blockstack.Person(profile)
    console.log("profile", person)

    userSession.getFile(self.getLogFile(), GET_OPTIONS).then(fileContents => {
      const weightLogs = JSON.parse(fileContents || "[]")
      console.log("fileContents of listWeight", fileContents)
      console.log("weights in listWeight", weightLogs)
      // set the tutorial to run if no logs are present.
      self.setState({ weightLogs, loading: false, run: weightLogs.length === 0 })
    })
  }

  saveWeight(event) {
    event.preventDefault()
    const self = this
    const { userSession } = this.props
    let { inputDate, inputWeight, inputUnits } = this.state
    console.log(this.state)
    if (!inputDate || !inputWeight || !inputUnits) {
      alert('Weight, date, and units must all be specified to save record.')
      return
    }

    inputWeight = parseInt(inputWeight)

    if (isNaN(inputWeight) || inputWeight <= 0) {
      alert('Input weight must be positive')
      return
    }

    userSession.getFile(self.getLogFile(), GET_OPTIONS).then(fileContents => {
        // get the contents of the file /weights.txt
        const weights = JSON.parse(fileContents || "[]")
        console.log("old weights in saveWeight", weights)
        const weightLogs = [
          ...weights,
          {
            weight: inputWeight,
            date: inputDate,
            units: inputUnits
          }
        ]
        console.log("weight to be saved", weightLogs)
        userSession.putFile(self.getLogFile(), JSON.stringify(weightLogs), PUT_OPTIONS).then(() => {
          self.setState({weightLogs})
          self.clearInputs()
        })
      })
  }

  clearInputs() {
    this.setState({
      inputDate: '',
      inputWeight: '',
      inputUnits: 'lb'
    })
  }

  deleteList(event) {
    const { userSession } = this.props
    event.preventDefault()
    userSession.deleteFile(this.getLogFile()).then(() => {
      this.listWeight()
    })
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  deleteLastItem() {
    const { userSession } = this.props
    const self = this
    userSession.getFile(self.getLogFile(), GET_OPTIONS).then(fileContents => {
      const weights = JSON.parse(fileContents || "[]")
      if (weights.length > 1) {
        weights.pop()
        console.log("after deleting last item", weights)

        userSession.putFile(self.getLogFile(), JSON.stringify(weights), PUT_OPTIONS).then(() => {
          self.listWeight(userSession)
        })
      } else if (weights.length === 1) {
        document.getElementById("weights").style.display = "none"
        document.getElementById("weight-body").innerHTML = ""
        userSession.putFile(self.getLogFile(), [], { decrypt: false }).then(() => {
          self.listWeight(userSession)
        })
      }
    })
  }

  handleJoyrideCallback = data => {
    const { action, index, status, type } = data

    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      // Update state to advance the tour
      this.setState({ stepIndex: index + (action === ACTIONS.PREV ? -1 : 1) })
    } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Need to set our running state to false, so we can restart if we click start again.
      this.setState({ run: false })
    }

    console.groupCollapsed(type)
    console.log(data) //eslint-disable-line no-console
    console.groupEnd()
  }

  

  render() {
    const { profile } = this.props
    let { weightLogs, run, stepIndex, inputDate, inputWeight, inputUnits, steps } = this.state

    let data = []
    let units = ""

    return (
      <Game />
    )
  }
}


