import React from 'react'
import Tab from './Tab'
import classes from './Tabs.local.scss'

// TODO: allow the tab content to be separate from the key

class Tabs extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      activeKey: null,
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
      <div className={classes.root}>
        <div className={classes.tabs}>
          {title && <span className={classes.title}>{title}</span>}

          {sections.map(({ key, label }) => (
            <span
              className={classes.tab}
              key={key}
              onClick={() => this.setActiveKey(key)}
            >
              <Tab active={activeKey === key}>{label || key}</Tab>
            </span>
          ))}
        </div>

        {activeKey && (
          <div className={classes.content}>
            {sections.find(section => section.key === activeKey).content}
          </div>
        )}
      </div>
    )
  }
}

export default Tabs
