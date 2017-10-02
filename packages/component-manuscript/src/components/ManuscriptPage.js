import { compose, withHandlers } from 'recompose'
import { connect } from 'react-redux'
import { actions } from 'pubsweet-client'
import { ConnectPage } from 'xpub-connect'
import { selectCurrentUser, selectCollection, selectFragment, selectVersion } from 'xpub-selectors'
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
    }
  ),
  withHandlers({
    updateManuscript: ({ project, version }) => data => {
      return actions.updateFragment(project, {
        id: version.id,
        ...data
      })
    }
  })
)(Manuscript)
