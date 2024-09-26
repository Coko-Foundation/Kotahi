import { gql } from '@apollo/client'

const manuscriptFragment = `
id
shortId
teams {
  id
  role
  displayName
  members {
    id
    user {
      id
      username
    }
    status
  }
}
status
authorFeedback {
  assignedAuthors {
    authorName
    assignedOnDate
  }
}
meta {
  manuscriptId
  history {
    type
    date
  }
}
submission
created
updated
firstVersionCreated
published
hasOverdueTasksForUser
invitations {
  status
}
rolesFound
`

const formForPurposeAndCategoryFragment = `formForPurposeAndCategory(purpose: "submit", category: "submission", groupId: $groupId) {
  structure {
    children {
      id
      component
      name
      title
      shortDescription
      isReadOnly
      validate {
        id
        label
        value
        labelColor
      }
      validateValue {
        minChars
        maxChars
        minSize
      }
      doiValidation
      options {
        id
        label
        labelColor
        value
      }
    }
  }
}
`

export default {
  dashboard: gql`
    query Dashboard($reviewerStatus: String, $wantedRoles: [String]!, $sort: ManuscriptsSort, $filters: [ManuscriptsFilter!]!, $offset: Int, $limit: Int, $timezoneOffsetMinutes: Int, $groupId: ID!, $searchInAllVersions: Boolean!) {
      manuscriptsUserHasCurrentRoleIn(
        reviewerStatus: $reviewerStatus
        wantedRoles: $wantedRoles
        sort: $sort
        filters: $filters
        offset: $offset
        limit: $limit
        timezoneOffsetMinutes: $timezoneOffsetMinutes
        groupId: $groupId
        searchInAllVersions: $searchInAllVersions)
        {
          totalCount
          manuscripts {
            manuscriptVersions {
              ${manuscriptFragment}
              parentId
            }
            ${manuscriptFragment}
            searchSnippet
          }
        }
      ${formForPurposeAndCategoryFragment}
    }
  `,
}
