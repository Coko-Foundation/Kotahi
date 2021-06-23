import React from 'react'
import styled from 'styled-components'
import Color from 'color'
import { th } from '@pubsweet/ui-toolkit'
import Table from './Table'
import CardCollection, { Card } from './CardCollection'
import ConcentricStepsChart from './ConcentricStepsChart'
import DurationsChart from './DurationsChart'
import Tooltip from './Tooltip'
import lightenBy from '../../../shared/lightenBy'

const ChartCard = styled(Card)`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: center;
`

const BigNumbersCard = styled(ChartCard)`
  width: 150px;
`

const CardHeader = styled.div`
  color: ${th('colorPrimary')};
  font-size: 120%;
  margin-top: 1em;
  text-align: center;

  :first-child {
    margin-top: 0;
  }
`

const BigNumber = styled.div`
  font-size: 300%;
  line-height: 120%;
`

const NoteRight = styled.div`
  text-align: right;
  width: 100%;
`

const Note = styled.div`
  color: ${lightenBy('colorText', 0.2)};
  font-size: ${th('fontSizeBaseSmall')};
`

const getBarColor = (
  barIndex,
  barsCount,
  lightness = 0.6,
  saturation = 0.6,
) => {
  const baseHue = 243
  const targetHue = 22

  const hue =
    barIndex === 0
      ? baseHue
      : baseHue + ((targetHue - baseHue) * barIndex) / (barsCount - 1)

  return Color.hsl(hue, saturation * 100, lightness * 100).hex()
}

const getDaysStringTo1Dp = valueDays => {
  const roundedDays = Math.round(valueDays * 10) / 10
  return `${roundedDays} day${roundedDays === 1 ? '' : 's'}`
}

const SummaryReport = ({
  avgPublishTimeDays,
  avgReviewTimeDays,
  unsubmittedCount,
  submittedCount,
  unassignedCount,
  reviewInvitedCount,
  reviewInviteAcceptedCount,
  reviewedCount,
  rejectedCount,
  revisingCount,
  acceptedCount,
  publishedCount,
  publishedTodayCount,
  avgPublishedDailyCount,
  avgRevisingDailyCount,
  durationsData,
}) => {
  const getEditorsConcentricBarChartData = () => {
    const data = [
      { name: 'All manuscripts', value: unsubmittedCount + submittedCount },
      { name: 'Submitted', value: submittedCount },
      { name: 'Editor assigned', value: submittedCount - unassignedCount },
      {
        name: 'Decision complete',
        value: rejectedCount + revisingCount + acceptedCount,
      },
      { name: 'Accepted', value: acceptedCount },
      { name: 'Published', value: publishedCount },
    ]

    const barColors = data.map((_, i) => getBarColor(i, data.length, 0.6))

    const labelColors = data.map((_, i) =>
      getBarColor(i, data.length, 0.3, 1.0),
    )

    return { data, barColors, labelColors }
  }

  const getReviewersConcentricBarChartData = () => {
    const data = [
      { name: 'All manuscripts', value: unsubmittedCount + submittedCount },
      { name: 'Reviewer invited', value: reviewInvitedCount },
      { name: 'Invite accepted', value: reviewInviteAcceptedCount },
      { name: 'Review completed', value: reviewedCount },
    ]

    const barColors = data.map((_, i) => getBarColor(i, data.length, 0.6))

    const labelColors = data.map((_, i) =>
      getBarColor(i, data.length, 0.3, 1.0),
    )

    return { data, barColors, labelColors }
  }

  return (
    <>
      <CardCollection style={{ width: 950, height: 680 }}>
        <ChartCard>
          <CardHeader>Editors&rsquo; workflow</CardHeader>
          <ConcentricStepsChart {...getEditorsConcentricBarChartData()} />
        </ChartCard>
        <ChartCard>
          <CardHeader>Reviewers&rsquo; workflow</CardHeader>
          <ConcentricStepsChart {...getReviewersConcentricBarChartData()} />
        </ChartCard>
        <BigNumbersCard>
          <CardHeader>
            Manuscripts published today
            <Tooltip content="From midnight local time" />
          </CardHeader>
          <BigNumber>{publishedTodayCount}</BigNumber>
          <NoteRight>
            Month average {avgPublishedDailyCount}
            <Tooltip content="Based on weekdays for the previous month" />
          </NoteRight>
          <CardHeader>Manuscripts currently in revision</CardHeader>
          <BigNumber>{revisingCount}</BigNumber>
          <NoteRight>
            Month average {avgRevisingDailyCount}
            <Tooltip content="Based on weekdays for the previous month" />
          </NoteRight>
        </BigNumbersCard>
        <ChartCard>
          <CardHeader>
            Reviewing and editing durations for individual manuscripts
          </CardHeader>
          <DurationsChart data={durationsData} />
        </ChartCard>
      </CardCollection>
      <Table
        columnSchemas={[{ width: '12em' }, { width: '7em' }]}
        // prettier-ignore
        rows={[
          [
            {
              content: (
                <div>
                  Average time to publish
                  <Note>From submission to published</Note>
                </div>
              ),
              isHeading: true,
            },
            getDaysStringTo1Dp(avgPublishTimeDays),
          ],
          [{ content: 'Average time to review', isHeading: true }, getDaysStringTo1Dp(avgReviewTimeDays)],
          [{ content: 'Unsubmitted', isHeading: true }, unsubmittedCount],
          [{ content: 'Submitted', isHeading: true }, submittedCount],
          [{ content: 'Unassigned', isHeading: true }, unassignedCount],
          [{ content: 'Reviewed', isHeading: true }, reviewedCount],
          [{ content: 'Rejected', isHeading: true }, rejectedCount],
          [{ content: 'Awaiting revision', isHeading: true }, revisingCount],
          [{ content: 'Accepted', isHeading: true }, acceptedCount],
          [{ content: 'Published', isHeading: true }, publishedCount],
        ]}
      />
    </>
  )
}

export default SummaryReport
