import { compose, withHandlers } from 'recompose'
import { connect } from 'react-redux'
import { actions } from 'pubsweet-client'
import { ConnectPage } from 'xpub-connect'
import {
  selectCurrentUser,
  selectCollection,
  selectFragment,
} from 'xpub-selectors'
import Manuscript from './Manuscript'

export default compose(
  ConnectPage(({ match }) => [
    actions.getCollection({ id: match.params.project }),
    actions.getFragment(
      { id: match.params.project },
      { id: match.params.version },
    ),
  ]),
  connect(
    (state, { match }) => {
      const currentUser = selectCurrentUser(state)
      const project = selectCollection(state, match.params.project)
      const version = selectFragment(state, match.params.version)

      const content = version.source // TODO: load from a file

      return { content, currentUser, project, version }
    },
    {
      fileUpload: actions.fileUpload,
      updateVersion: actions.updateFragment,
    },
  ),
  withHandlers({
    updateManuscript: ({ updateVersion, project, version }) => data => {
      return updateVersion(project, {
        id: version.id,
        rev: version.rev,
        ...data,
      })
    },
  }),
)(Manuscript)
