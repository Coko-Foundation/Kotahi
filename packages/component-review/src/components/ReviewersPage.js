import { find } from 'lodash'
import { compose, withProps } from 'recompose'
import { connect } from 'react-redux'
import { actions } from 'pubsweet-client'
import { ConnectPage } from 'xpub-connect'
import { selectCollection, selectFragment } from 'xpub-selectors'
import Reviewers from './reviewers/Reviewers'
import ReviewerFormContainer from './reviewers/ReviewerFormContainer'
import ReviewContainer from './reviewers/ReviewContainer'

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

      const versions = project.fragments.map(id => state.fragments[id])

      const reviewerUsers = state.users.users
      // const reviewerUsers = filter(state.users.users, { reviewer: true })

      // populate the reviewer user
      versions.forEach(version => {
        version.reviews.forEach(review => {
          const reviewer = find(project.reviewers, {
            id: review.reviewer
          })

          if (reviewer) {
            reviewer._user = find(reviewerUsers, {
              id: reviewer.user
            })

            review._reviewer = reviewer
          }
        })
      })

      return {
        project,
        version,
        versions,
        reviewerUsers,
        // teams: state.teams,
      }
    }
  ),
  withProps({
    ReviewerForm: ReviewerFormContainer,
    Review: ReviewContainer
  })
)(Reviewers)
