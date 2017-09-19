import { filter, find } from 'lodash'
import { compose, withProps } from 'recompose'
import { connect } from 'react-redux'
import actions from 'pubsweet-client/src/actions'
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

      const fragments = filter(state.fragments, fragment => {
        return project.fragments.includes(fragment.id)
      })

      const versions = filter(fragments, { fragmentType: 'version' })
      const projectReviewers = filter(fragments, { fragmentType: 'projectReviewer' })
      const reviewers = filter(fragments, { fragmentType: 'reviewer' })

      const reviewerUsers = state.users.users
      // const reviewerUsers = filter(state.users.users, { reviewer: true })

      // populate the reviewer user
      reviewers.forEach(reviewer => {
        const projectReviewer = find(projectReviewers, { id: reviewer.projectReviewer })

        if (projectReviewer) {
          reviewer._user = find(reviewerUsers, { id: projectReviewer.user })
        }
      })

      return {
        project,
        version,
        versions,
        projectReviewers,
        reviewers,
        reviewerUsers,
        // teams: state.teams,
      }
    }
  ),
  withProps({
    ReviewerForm: ReviewerFormContainer,
    Reviewer: ReviewerContainer
  })
)(Reviewers)
