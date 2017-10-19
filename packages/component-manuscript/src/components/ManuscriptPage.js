import { compose, withHandlers } from 'recompose'
import { connect } from 'react-redux'
import { actions } from 'pubsweet-client'
import { ConnectPage } from 'xpub-connect'
import { selectCurrentUser, selectCollection, selectFragment } from 'xpub-selectors'
import Manuscript from './Manuscript'

export default compose(
  ConnectPage(({ params }) => [
    actions.getCollection({ id: params.project }),
    actions.getFragment({ id: params.project }, { id: params.version })
  ]),
  connect(
    (state, { params }) => {
      const currentUser = selectCurrentUser(state)
      const project = selectCollection(state, params.project)
      const version = selectFragment(state, params.version)

      const content = version.source // TODO: load from a file

      return { currentUser, project, version, content }
    },
    {
      fileUpload: actions.fileUpload,
      updateVersion: actions.updateFragment
    }
  ),
  withHandlers({
    updateManuscript: ({ updateVersion, project, version }) => data => {
      return updateVersion(project, {
        id: version.id,
        rev: version.rev,
        ...data
      })
    }
  })
)(Manuscript)
