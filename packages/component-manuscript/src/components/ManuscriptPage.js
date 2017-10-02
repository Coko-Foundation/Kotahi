import { find } from 'lodash'
import { compose, withHandlers } from 'recompose'
import { connect } from 'react-redux'
import { actions } from 'pubsweet-client'
import { ConnectPage } from 'xpub-connect'
import { selectCurrentUser, selectCollection, selectFragment, selectVersion } from 'xpub-selectors'
import Manuscript from './Manuscript'

export default compose(
  ConnectPage(({ params }) => [
    actions.getCollection({ id: params.journal }),
    actions.getFragment({ id: params.project }),
  ]),
  connect(
    (state, { params }) => {
      const currentUser = selectCurrentUser(state)
      const journal = selectCollection(state, params.journal)
      const project = selectFragment(state, params.project)
      const version = selectVersion(project, params.version)

      const content = version.manuscript.source // TODO: load from a file

      return { currentUser, journal, project, version, content }
    },
    {
      fileUpload: actions.fileUpload,
    }
  ),
  withHandlers({
    updateManuscript: ({ project, version, journal }) => data => {
      version.manuscript = {
        ...version.manuscript,
        ...data
      }

      return actions.updateFragment(journal, {
        id: project.id,
        versions: project.versions
      })
    }
  })
)(Manuscript)
