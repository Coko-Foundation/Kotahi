import { debounce, filter } from 'lodash'
import { compose, withProps } from 'recompose'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { reduxForm, SubmissionError } from 'redux-form'
import actions from 'pubsweet-client/src/actions'
import { ConnectPage } from 'xpub-connect'
import { selectCollection, selectFragment } from 'xpub-selectors'
import uploadFile from 'xpub-upload'
import DecisionLayout from './decision/DecisionLayout'

const onSubmit = (values, dispatch, props) => {
  console.log('submit', values)

  return dispatch(actions.updateFragment(props.project, {
    id: props.decision.id,
    submitted: new Date(),
    ...values
  })).then(() => {
    // TODO: show "thanks for your review" message
    dispatch(push(`/`))
  }).catch(error => {
    if (error.validationErrors) {
      throw new SubmissionError()
    }
  })
}

const onChange = (values, dispatch, props) => {
  console.log('change', values)

  return dispatch(actions.updateFragment(props.project, {
    id: props.decision.id,
    // submitted: false,
    ...values
  }))

  // TODO: display a notification when saving/saving completes/saving fails
}

export default compose(
  ConnectPage(({params}) => [
    actions.getCollection({id: params.project}),
    actions.getFragment({id: params.project}, {id: params.version}),
    actions.getFragment({id: params.project}, {id: params.decision}),
  ]),
  connect(
    (state, ownProps) => {
      const project = selectCollection(state, ownProps.params.project)

      // const fragments = filter(state.fragments, fragment => {
      //   return project.fragments.includes(fragment.id)
      // })

      const fragments = project.fragments.map(id => state.fragments[id])

      return {
        project,
        versions: filter(fragments, { fragmentType: 'version' }),
        reviews: filter(fragments, { fragmentType: 'review' }),
        decisions: filter(fragments, { fragmentType: 'decisions' }),
        // version: selectFragment(state, ownProps.params.version),
        // decision: selectFragment(state, ownProps.params.decision)
      }
    },
    {
      uploadFile
    }
  ),
  withProps(({decision}) => {
    return {
      initialValues: decision
    }
  }),
  reduxForm({
    form: 'decision',
    onSubmit,
    onChange: debounce(onChange, 1000)
  })
)(DecisionLayout)
