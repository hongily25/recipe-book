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

  generateCardSet(cards) {
    alert('todo: generate cards');
  }

  render() {
    const { profile } = this.props
    let { weightLogs, run, stepIndex, inputDate, inputWeight, inputUnits, steps } = this.state

    let data = []
    let units = ""
    
    const config = {
      cards: [
          {
              backImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSexUDniZ8qYHFpbK4Xyjd4Vs_Fx60Zwe7_5INiYN5H5dNNWiJZ',
              connectionID: 1
          },
          {
              backTxt: 'GRUNT',
              connectionID: 1
          },
          {
              backImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQS13Kjh3SeT8Fmcy73l5FKRiH8Tcq9w9SIAddixX-XHwODxe5C',
              connectionID: 2
          },
          {
              backTxt: 'REACT',
              connectionID: 2
          },
          {
              backImg: 'https://gravatar.com/avatar/5a224f121f96bd037bf6c1c1e2b686fb?s=512&d=https://codepen.io/assets/avatars/user-avatar-512x512-6e240cf350d2f1cc07c2bed234c3a3bb5f1b237023c204c782622e80d6b212ba.png',
              connectionID: 3
          },
          {
              backTxt: 'GSAP',
              connectionID: 3
          },
          {
              backImg: 'http://richardgmartin.me/wp-content/uploads/2014/11/ember-mascot.jpeg',
              connectionID: 4
          },
          {
              backTxt: 'EMBER',
              connectionID: 4
          },
          {
              backImg: 'https://odoruinu.files.wordpress.com/2014/11/3284117.png',
              connectionID: 5
          },
          {
              backTxt: 'KARMA', 
              connectionID: 5
          },
          {
              backImg: 'https://cdn.auth0.com/blog/webpack/logo.png',
              connectionID: 6
          },
          {
              backTxt: 'WEBPACK',
              connectionID: 6
          },
          {
              backImg: 'https://res.cloudinary.com/teepublic/image/private/s--JnfxjOP1--/t_Resized%20Artwork/c_fit,g_north_west,h_1054,w_1054/co_ffffff,e_outline:53/co_ffffff,e_outline:inner_fill:53/co_bbbbbb,e_outline:3:1000/c_mpad,g_center,h_1260,w_1260/b_rgb:eeeeee/c_limit,f_jpg,h_630,q_90,w_630/v1509564403/production/designs/2016815_1.jpg',
              connectionID: 7
          },
          {
              backTxt: 'ANGULAR',
              connectionID: 7
          },
          {
              backImg: 'https://smyl.es/wurdp/assets/mongodb.png',
              connectionID: 8
          },
          {
              backTxt: 'MONGO DB',
              connectionID: 8
          },
      ]
  };

    return (
      <div class="align-center">

    <h1 class="heading">Brainymo</h1>
    <p class="desc">Frontend Arsenal Memory Game</p>

    <button class="btn" id="btn-start" onClick={this.generateCardSet}>
        Start
    </button>

    <div class="cards-container">
        <div class="flip-container hide" id="card-template">
            <div class="flipper">
                <div class="front">
                    <label>frontend technologies</label>
                </div>
                <div class="back">
                    <label></label>
                </div>
            </div>
        </div>
    </div>

    <div class="timer">
        <label id="minutes"></label>:
        <label id="seconds"></label>
        <div class="time">
            MY BEST TIME: <span id="bestTime"></span>
        </div>
    </div>
</div>
    )
  }
}
