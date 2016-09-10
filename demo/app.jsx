import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import fetch from 'isomorphic-fetch';
import highlight from '../src';

const contentLinks = [
  {
    url: '/devserver.js',
    label: 'devserver',
  },
];

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = { content: '' };
    this.load(contentLinks[0]);
  }

  load(item) {
    fetch(item.url, item.options || {})
      .then(res => res.text())
      .then(content => {
        this.setState({ content });
      });
  }

  render() {
    const items = contentLinks.map(t => {
      const linkProps = {
        key: t.url,
        href: t.url,
        onClick: (e) => {
          e.preventDefault();
          this.load(t.url);
          return false;
        },
        style: {
          margin: '4px',
        },
      };
      return <a {...linkProps}>{t.label}</a>;
    });
    const html = highlight(this.state.content, 'js');
    return (
      <Grid className="app">
        <Row>
          <Col md={8}>
            <div>{items}</div>
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </Col>
        </Row>
      </Grid>
    );
  }
}
