import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { actions } from 'pubsweet-client'
import { ConnectPage } from 'xpub-connect'
import { selectCollection, selectFragment } from 'xpub-selectors'
import PaperLayout from './PaperLayout'
import { scholar } from '../lib/scholar'

class PaperPage extends React.Component {
  state = {
    paper: null,
  }

  componentDidMount() {
    const { match } = this.props

    this.fetch(match.params.id)
  }

  componentWillReceiveProps(nextProps) {
    const { match } = nextProps

    if (match.params.id !== this.props.match.params.id) {
      this.fetch(match.params.id)
    }
  }

  fetch(id) {
    this.setState({
      paper: null,
    })

    scholar(`paper/${id}`).then(paper => {
      if (this.props.match.params.id !== id) return

      this.setState({ paper })
    })
  }

  render() {
    const { paper } = this.state
    const { project, version } = this.props

    if (!paper) return <div>Loading…</div>

    return (
      <PaperLayout
        id={paper.id}
        paper={paper}
        project={project}
        version={version}
      />
    )
  }
}

export default compose(
  ConnectPage(({ match }) => [
    actions.getCollection({ id: match.params.project }),
    actions.getFragment(
      { id: match.params.project },
      { id: match.params.version },
    ),
  ]),
  connect((state, { match }) => {
    const project = selectCollection(state, match.params.project)
    const version = selectFragment(state, match.params.version)

    return { project, version }
  }),
)(PaperPage)
