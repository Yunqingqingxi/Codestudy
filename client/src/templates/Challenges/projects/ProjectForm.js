import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Form } from '../../../components/formHelpers';

const propTypes = {
  isBackEndProject: PropTypes.bool,
  isFrontEnd: PropTypes.bool,
  isSubmitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  updateProjectForm: PropTypes.func.isRequired
};

const challengeFields = ['solution'];
const backEndProjectFields = ['solution', 'githubLink'];

const options = {
  types: {
    solution: 'url',
    githubLink: 'url'
  },
  required: ['solution']
};

export class ProjectForm extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  componentDidMount() {
    this.props.updateProjectForm({});
  }
  handleSubmit(values) {
    this.props.updateProjectForm(values);
    this.props.onSubmit();
  }
  render() {
    const { isSubmitting, isFrontEnd, isBackEndProject } = this.props;
    const buttonCopy = isSubmitting
      ? 'Submit and go to my next challenge'
      : "I've completed this challenge";
    return (
      <Form
        buttonText={`${buttonCopy}`}
        formFields={isBackEndProject ? backEndProjectFields : challengeFields}
        id={isFrontEnd ? 'front-end-form' : 'back-end-form'}
        options={{
          ...options,
          placeholders: {
            solution:
              'Link, ex: ' +
              (isFrontEnd
                ? 'https://codepen.io/camperbot/full/oNvPqqo'
                : 'https://camperbot.glitch.me'),
            githubLink: 'ex: https://github.com/camperbot/hello'
          }
        }}
        submit={this.handleSubmit}
      />
    );
  }
}

ProjectForm.propTypes = propTypes;

export default ProjectForm;
