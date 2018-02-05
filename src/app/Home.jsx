import React, { Component } from 'react';
import DocumentTitle from 'react-document-title';

class Home extends Component {
  constructor(props){
    super(props);

    // This binding is necessary to make `this` work in the callback
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
  }

  render() {
    return (
      <DocumentTitle title={this.props.title}>
        <div
          className="uk-flex uk-flex-middle uk-flex-center Home"
          uk-height-viewport=""
          onDragOver={e => this.handleDragOver(e)}
          onDrop={e => this.handleDrop(e)}>
          <h1>{this.props.title}</h1>
        </div>
      </DocumentTitle>
    );
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  handleDrop(e) {
    e.preventDefault();
    let file;
    if (e.dataTransfer.items) {
      file = e.dataTransfer.items[0].getAsFile();
    } else {
      file = e.dataTransfer.files[0];
    }
    const name = file.name ? file.name : 'Unknown';
    this.props.history.push({ pathname: "/run", state: { file, name } });
  };
}

export default Home;