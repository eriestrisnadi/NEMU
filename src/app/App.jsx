import React, { Component } from "react";
import { HashRouter, Route } from "react-router-dom";
import Home from "./Home";
import Run from "./Run";

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const Page = {
      Home: props => {
        props = Object.assign({}, this.props, props);
        return <Home {...props} />;
      },
      Run: props => {
        props = Object.assign({}, this.props, props);
        return <Run {...props} />;
      },
    };

    return (
      <HashRouter>
        <div className="App">
          <Route exact path="/" render={Page.Home} />
          <Route exact path="/run" render={Page.Run} />
        </div>
      </HashRouter>
    );
  }
}

export default App;
