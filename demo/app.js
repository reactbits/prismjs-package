import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import highlight from '../src';
import qwest from 'qwest';

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
		this.load(contentLinks[0].url);
	}

	load(url) {
		qwest.get(url).then((xhr, content) => {
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
