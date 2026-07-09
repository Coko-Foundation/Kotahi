/* eslint-disable import/no-extraneous-dependencies */

import { faker } from '@faker-js/faker'

import preview from '../../.storybook/preview'
import PageDescription from '../../app/ui/shared/PageDescription'

faker.seed(1)

const meta = preview.meta({
  component: PageDescription,
})

export const Base = meta.story({
  args: {
    children: faker.lorem.paragraph(),
  },
})

export const LongText = meta.story({
  args: {
    children: faker.lorem.paragraphs(3),
  },
})
