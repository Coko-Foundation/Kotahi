import React from 'react'
import ReactMarkdown from 'react-markdown'
import htmlParser from 'react-markdown/plugins/html-parser'
import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'

import PaperEmbed from './PaperEmbed'

import { AspectRatio, EmbedContainer, EmbedComponent } from './style'

const ExternalEmbed = props => {
  let { aspectratio, url, src, width = '100%', height = 200 } = props

  if (!src && url) src = url
  if (typeof src !== 'string') return null

  // if an aspect ratio is passed in, we need to use the EmbedComponent which does some trickery with padding to force an aspect ratio. Otherwise we should just use a regular iFrame
  if (aspectratio && aspectratio !== undefined) {
    return (
      <AspectRatio ratio={aspectratio} style={{ height }}>
        <EmbedComponent
          allowFullScreen
          frameBorder="0"
          height={height}
          src={src}
          title={`iframe-${src}`}
          width={width}
        />
      </AspectRatio>
    )
  }
  return (
    <EmbedContainer style={{ height }}>
      <iframe
        allowFullScreen
        frameBorder="0"
        height={height}
        src={src}
        title={`iframe-${src}`}
        width={width}
      />
    </EmbedContainer>
  )
}

const InternalEmbed = props => {
  if (props.entity !== 'thread') return null
  return 'INTERNAL'
  // return <ThreadAttachment id={props.id} />
}

const Embed = props => {
  // if (props.type === 'internal') {
  //   return <InternalEmbed {...props} />
  // }

  // if (props.type === 'paper') {
  //   return <PaperEmbed {...props} />
  // }
  return <></>
  // return <ExternalEmbed {...props} />
}

// var preprocessingInstructions = [
//   {
//     shouldPreprocessNode: function (node) {
//       return node.attribs && node.attribs['data-process'] === 'shared';
//     },
//     preprocessNode: function (node) {
//       node.attribs = {id: `preprocessed-${node.attribs.id}`,};
//     },
//   }
// ];
const processingInstructions = [
  {
    shouldProcessNode(node) {
      return node.name === 'embed'
    },
    processNode(node, children, index) {
      return <Embed {...node.attribs} id={node.attribs.id} key={index} />
    },
  },
  {
    shouldProcessNode(node) {
      return node.name === 'p'
    },
    processNode(node, children, index) {
      return (
        <div {...node.attribs} id={node.attribs.id} key={index}>
          {children}
        </div>
      )
    },
  },
]

const parseHtml = htmlParser({
  processingInstructions,
})

const MessageRenderer = React.memo(({ message }) => {
  const p = props => <div>{props.children}</div>

  return message.enhanced ? (
    <ReactMarkdown
      astPlugins={[parseHtml]}
      escapeHtml={false}
      renderers={{ paragraph: p }}
      source={message.enhanced}
    />
  ) : (
    <ReactMarkdown source={message.content} />
  )
})

export default MessageRenderer
