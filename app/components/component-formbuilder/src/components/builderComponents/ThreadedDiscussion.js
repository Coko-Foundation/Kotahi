import React from 'react'
import SimpleWaxEditor from '../../../../wax-collab/src/SimpleWaxEditor'
import { SimpleWaxEditorWrapper } from '../style'

import ThreadedComment from '../ThreadedComment'

const ThreadedDiscussion = props => {
  const {
    user,
    userCanAddComment,
    channelId,
    value,
    key,
    comments,
    ...SimpleWaxEditorProps
  } = props

  const lastComment = comments ? comments[comments.length - 1] : null

  return (
    <>
      {comments.map(comment => {
        return (
          <ThreadedComment
            comment={comment}
            currentUserId={user.id}
            key={comment.id}
            simpleWaxEditorProps={SimpleWaxEditorProps}
          />
        )
      })}

      {(lastComment ? lastComment.author.id : '') !== user.id && (
        <SimpleWaxEditorWrapper>
          <SimpleWaxEditor {...SimpleWaxEditorProps} />
        </SimpleWaxEditorWrapper>
      )}
    </>
  )
}

export default ThreadedDiscussion
