import { find } from 'lodash'
import { compose, withProps } from 'recompose'
import { connect } from 'react-redux'
import { actions } from 'pubsweet-client'
import { ConnectPage } from 'xpub-connect'
import { selectCollection, selectFragment } from 'xpub-selectors'
import Reviewers from './reviewers/Reviewers'
import ReviewerFormContainer from './reviewers/ReviewerFormContainer'
import ReviewerContainer from './reviewers/ReviewerContainer'

export default compose(
  ConnectPage(({ params }) => [
    actions.getCollection({ id: params.project }),
    actions.getFragments({ id: params.project }),
    // actions.getTeams(),
    actions.getUsers(),
    // actions.getFragment({ id: params.project }, { id: params.version }),
  ]),
  connect(
    (state, ownProps) => {
      const project = selectCollection(state, ownProps.params.project)
      const version = selectFragment(state, ownProps.params.version)
      const reviewers = version.reviewers

      const reviewerUsers = state.users.users
      // const reviewerUsers = filter(state.users.users, { reviewer: true })

      // populate the reviewer user
      reviewers.forEach(reviewer => {
        const projectReviewer = find(project.reviewers, {
          user: reviewer.user
        })

        if (projectReviewer) {
          reviewer._user = find(reviewerUsers, {
            id: projectReviewer.user
          })

          reviewer._reviewer = projectReviewer
        }
      })

      return { project, version, reviewers, reviewerUsers }
    }
  ),
  withProps({
    ReviewerForm: ReviewerFormContainer,
    Reviewer: ReviewerContainer
  })
)(Reviewers)
