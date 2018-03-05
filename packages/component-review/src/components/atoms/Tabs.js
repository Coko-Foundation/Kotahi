import React from 'react'
import styled from 'styled-components'
import { th } from '@pubsweet/ui'
import Tab from './Tab'

// TODO: allow the tab content to be separate from the key

const Root = styled.div``
const TabsContainer = styled.div`
  display: flex;
  margin-bottom: ${th('gridUnit')};
`
const Title = styled.div`
  border-bottom: ${th('borderWidth')} ${th('borderStyle')} ${th('colorBorder')};
  padding: ${th('subGridUnit')} 1em;
`
const TabContainer = styled.div``
const Content = styled.div``

class Tabs extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      activeKey: props.activeKey || null,
    }
  }

  componentDidMount() {
    const { activeKey } = this.props
    this.setState({ activeKey })
  }

  componentWillReceiveProps(nextProps) {
    const { activeKey } = nextProps

    if (activeKey !== this.props.activeKey) {
      this.setState({ activeKey })
    }
  }

  setActiveKey(activeKey) {
    this.setState({ activeKey })
  }

  render() {
    const { sections, title } = this.props
    const { activeKey } = this.state

    return (
      <Root>
        <TabsContainer>
          {title && <Title>{title}</Title>}

          {sections.map(({ key, label }) => (
            <TabContainer key={key} onClick={() => this.setActiveKey(key)}>
              <Tab active={activeKey === key}>{label || key}</Tab>
            </TabContainer>
          ))}
        </TabsContainer>

        {activeKey && (
          <Content>
            {sections.find(section => section.key === activeKey).content}
          </Content>
        )}
      </Root>
    )
  }
}

export default Tabs
