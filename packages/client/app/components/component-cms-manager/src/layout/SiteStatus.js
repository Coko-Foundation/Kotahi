import React from 'react'
import fnv from 'fnv-plus'
import { useTranslation } from 'react-i18next'

import { LayoutSecondaryHeading, LayoutMainHeading } from '../style'

const SiteStatus = ({ cmsLayout, flaxSiteUrlForGroup, triggerAutoSave }) => {
  const { t } = useTranslation()

  const url = `${flaxSiteUrlForGroup}${
    cmsLayout.hexCode ? `${cmsLayout.hexCode}/` : ''
  }`

  const toggleChange = isChecked => {
    const data = {}
    data.isPrivate = isChecked
    data.hexCode = fnv.hash(cmsLayout.id).hex()

    if (!isChecked) {
      data.hexCode = null
    }

    triggerAutoSave(data)
  }

  return (
    <>
      <LayoutMainHeading>{t('cmsPage.layout.Status')}</LayoutMainHeading>
      <div>
        <input
          checked={cmsLayout.isPrivate}
          name="isPrivate"
          onChange={e => toggleChange(e.target.checked)}
          style={{ margin: '10px 10px 10px 0' }}
          type="checkbox"
          value={false}
        />
        {t('cmsPage.layout.DraftCheckbox')}
      </div>
      <LayoutSecondaryHeading>
        {t('cmsPage.layout.MakeFlaxSitePrivate')}
      </LayoutSecondaryHeading>
      <div>
        <a href={`${url}`} target="blank">{`${url}`}</a>
      </div>
    </>
  )
}

export default SiteStatus
