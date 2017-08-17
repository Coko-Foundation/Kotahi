import React from 'react'

const DashboardItem = ({ project }) => (
  <div>
    <div>{ project.title || 'Untitled' }</div>
  </div>
)

export default DashboardItem
