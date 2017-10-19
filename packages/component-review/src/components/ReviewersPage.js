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
  ConnectPage(({ match }) => [
    actions.getCollection({ id: match.params.project }),
    actions.getFragments({ id: match.params.project }),
    // actions.getTeams(),
    actions.getUsers(),
    // actions.getFragment({ id: match.params.project }, { id: match.params.version }),
  ]),
  connect(
    (state, { match }) => {
      const project = selectCollection(state, match.params.project)
      const version = selectFragment(state, match.params.version)
      const reviewers = (version.reviewers || []).filter(reviewer => reviewer.reviewer)

      const reviewerUsers = state.users.users
      // const reviewerUsers = filter(state.users.users, { reviewer: true })

      // populate the reviewer user
      // TODO: remove these, as they'll get saved back to the server
      reviewers.forEach(reviewer => {
        const projectReviewer = find(project.reviewers, {
          id: reviewer.reviewer
        })

        reviewer._user = find(reviewerUsers, {
          id: projectReviewer.user
        })

        reviewer._reviewer = projectReviewer
      })

      return { project, version, reviewers, reviewerUsers }
    }
  ),
  withProps({
    ReviewerForm: ReviewerFormContainer,
    Reviewer: ReviewerContainer
  })
)(Reviewers)
