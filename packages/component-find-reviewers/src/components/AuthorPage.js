import React from 'react'
import faker from 'faker'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { actions } from 'pubsweet-client'
import { ConnectPage } from 'xpub-connect'
import { selectCollection, selectFragment } from 'xpub-selectors'
import AuthorLayout from './AuthorLayout'
import { scholar } from '../lib/scholar'
// import { newestFirst } from '../lib/sort'

class AuthorPage extends React.Component {
  state = {
    author: null,
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
      author: null,
    })

    scholar(`author/${id}`).then(author => {
      if (this.props.match.params.id !== id) return

      author.email = faker.internet.email()

      author.affiliation = [
        faker.address.streetAddress(),
        faker.address.city(),
        faker.address.country(),
      ].join(', ')

      this.setState({ author })

      // TODO: need years from the API, this is too many requests

      // Promise.all(
      //   author.papers.map(paper => scholar(`paper/${paper.paperId}`)),
      // ).then(papers => {
      //   author.papers = papers.sort(newestFirst)
      //   this.setState({ author })
      // })
    })
  }

  assignReviewer = () => {
    // const { author } = this.state
    // TODO: need to know the submission to assign this reviewer to
  }

  render() {
    const { author } = this.state
    const { project, version } = this.props

    if (!author) return <div>Loading…</div>

    return (
      <AuthorLayout
        assignReviewer={this.assignReviewer}
        author={author}
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
)(AuthorPage)
