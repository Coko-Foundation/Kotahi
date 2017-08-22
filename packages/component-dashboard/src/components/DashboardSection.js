import React from 'react'
import classes from './DashboardSection.local.css'

const DashboardSection = ({ heading, items, empty, children }) => (
  <div className={classes.root}>
    <div className={classes.heading}>
      {heading}
    </div>

    {items.length ? (
      children
    ) : (
      <div className={classes.empty}>
        {empty()}
      </div>
    )}
  </div>
)

export default DashboardSection
