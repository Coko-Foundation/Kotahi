import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { actions } from 'pubsweet-client'
import { ink } from 'pubsweet-component-ink-frontend/actions'
import { ConnectPage } from 'xpub-connect'
import { selectCollection, selectFragment } from 'xpub-selectors'
import { calculateAuthorScores, calculatePaperScores } from '../lib/score'
import FindReviewersLayout from './FindReviewersLayout'

class FindReviewersPage extends React.Component {
  state = {
    papers: null,
    authors: null,
    error: null,
  }

  componentDidMount() {
    const { version } = this.props

    this.fetch(version)
  }

  componentWillReceiveProps(nextProps) {
    const { version } = nextProps

    if (version.id !== this.props.version.id) {
      this.fetch(version)
    }
  }

  fetch({ metadata: { title, abstract } }) {
    const text = [title, abstract].join('\n\n')

    this.setState({
      papers: null,
      authors: null,
      error: null,
    })

    const file = new File([text], 'paper.txt', { type: 'text/plain' })

    const options = {
      recipe: 'find-reviewers',
      outputFileName: 'paper_mlt.json',
    }

    this.props
      .ink(file, options)
      .then(response => {
        const data = JSON.parse(response.converted)
        const papers = calculatePaperScores(data)
        const authors = calculateAuthorScores(papers)

        // TODO: use actual board member data
        authors.forEach(author => {
          author.boardMember = Math.random() > 0.95
          author.flagged = Math.random() > 0.9
          author.expanded = true // TODO: remove the "expanded" property if not useful
        })

        this.setState({ papers, authors })
      })
      .catch(error => {
        console.error(error)

        this.setState({
          error:
            'Sorry, there was a problem calculating reviewers for this submission',
        })
      })
  }

  toggleAuthor = id => field => () => {
    const { authors } = this.state

    const index = authors.findIndex(author => author.id === id)

    authors[index][field] = !authors[index][field]

    this.setState({ authors })
  }

  render() {
    const { error, authors, papers } = this.state

    return (
      <FindReviewersLayout
        authors={authors}
        error={error}
        papers={papers}
        project={this.props.project}
        toggleAuthor={this.toggleAuthor}
        version={this.props.version}
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
  connect(
    (state, { match }) => {
      const project = selectCollection(state, match.params.project)
      const version = selectFragment(state, match.params.version)

      return { project, version }
    },
    { ink },
  ),
)(FindReviewersPage)
