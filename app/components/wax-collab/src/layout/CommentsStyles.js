import styled from 'styled-components'

export const CommentsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 35%;
`
export const FullCommentsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 250px;

  & > div {
    left: 30px;
    position: relative;
    right: initial;
  }
`

export const CommentsContainerNotes = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 35%;
`

export const CommentTrackToolsContainer = styled.div`
  /* background: white; */
  display: flex;
  padding-top: 5px;
  position: fixed;
  right: 30px;
  width: 25%;
  /* z-index: 1; */
`

export const CommentTrackTools = styled.div`
  display: flex;
  font-size: 14px;
  margin-left: auto;
  position: relative;
  white-space: nowrap;
  z-index: 1;
`

export const CommentTrackOptions = styled.div`
  bottom: 5px;
  display: flex;
  margin-left: 10px;
  max-width: 100%;
  overflow-x: auto;
  position: relative;
`
