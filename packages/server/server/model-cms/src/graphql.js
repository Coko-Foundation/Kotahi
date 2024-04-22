const axios = require('axios')
const { Readable } = require('stream')

const models = require('@pubsweet/models')
const { createFile, fileStorage } = require('@coko/server')
const { uploadFileHandler } = require('@coko/server/src/services/fileStorage')
const File = require('@coko/server/src/models/file/file.model')

const {
  replaceImageSrc,
  replaceImageFromNunjucksTemplate,
  getFilesWithUrl,
  getFileWithUrl,
  setFileUrls,
} = require('../../utils/fileStorageUtils')

const setInitialLayout = async groupId => {
  const { formData } = await models.Config.getCached(groupId)
  const { primaryColor, secondaryColor } = formData.groupIdentity

  const layout = await new models.CMSLayout({
    primaryColor,
    secondaryColor,
    groupId,
  }).save()

  return layout
}

const getFlaxPageConfig = async (configKey, groupId) => {
  const pages = await models.CMSPage.query()
    .where('groupId', groupId)
    .select(['id', 'title', 'url', configKey])
    .orderBy('title')

  if (!pages) return []

  return pages
    .map(page => ({
      id: page.id,
      title: page.title,
      url: page.url,
      shownInMenu: page[configKey].shownInMenu,
      sequenceIndex: page[configKey].sequenceIndex,
    }))
    .sort((page1, page2) => {
      if (page1.sequenceIndex < page2.sequenceIndex) return -1
      if (page1.sequenceIndex > page2.sequenceIndex) return 1
      return 0
    })
}

const addSlashes = inputString => {
  let str = inputString

  if (!inputString.startsWith('/')) {
    str = `/${inputString}`
  }

  if (!inputString.endsWith('/')) {
    str = `${inputString}/`
  }

  return str
}

const cleanCMSPageInput = inputData => {
  if (!inputData.url) return inputData
  const attrs = { ...inputData }
  attrs.url = addSlashes(inputData.url)
  return inputData
}

const cmsFileTree = async (groupId, folderId) => {
  const AllFiles = await models.CMSFileTemplate.query().where(
    'groupId',
    groupId,
  )

  const fileIds = AllFiles.filter(file => file.fileId !== null).map(
    f => f.fileId,
  )

  const files = await models.File.query().whereIn('id', fileIds)
  const filesWithUrl = await getFilesWithUrl(files)

  const getChildren = children =>
    children.map(child => {
      const nestedChildren = AllFiles.filter(f => f.parentId === child.id)
      const file = filesWithUrl.find(fu => fu.id === child.fileId)

      const fileUrl = file
        ? file.storedObjects.find(f => f.type === 'original')
        : { url: null }

      return {
        id: child.id,
        name: child.name,
        children: getChildren(nestedChildren),
        fileId: child.fileId,
        url: fileUrl.url,
      }
    })

  const rootNode = folderId
    ? AllFiles.find(f => f.id === folderId)
    : AllFiles.find(f => f.parentId === null)

  const children = AllFiles.filter(f => f.parentId === rootNode.id)

  return {
    id: rootNode.id,
    name: rootNode.name,
    children: getChildren(children),
    fileId: null,
    url: null,
  }
}

const resolvers = {
  Query: {
    async cmsPages(_, vars, ctx) {
      const groupId = ctx.req.headers['group-id']

      const cmsPages = await models.CMSPage.query()
        .where('groupId', groupId)
        .orderBy('title')

      return cmsPages
    },

    async cmsPage(_, { id }, _ctx) {
      const cmsPage = await models.CMSPage.query().findById(id)
      return cmsPage
    },

    async cmsLayout(_, _vars, ctx) {
      const groupId = ctx.req.headers['group-id']
      let layout = await models.CMSLayout.query()
        .where('groupId', groupId)
        .first()

      if (!layout) {
        layout = await setInitialLayout(groupId) // TODO move this to seedArticleTemplate.js or similar
      }

      return layout
    },

    async getCmsFilesTree(_, { folderId }, ctx) {
      const groupId = ctx.req.headers['group-id']

      return cmsFileTree(groupId, folderId)
    },

    async getActiveCmsFilesTree(_, _vars, ctx) {
      const groupId = ctx.req.headers['group-id']

      const cmsFileTemplate = await models.CMSFileTemplate.query().findOne({
        groupId,
        rootFolder: true,
      })

      return JSON.stringify(await cmsFileTree(groupId, cmsFileTemplate.id))
    },
    async getCmsFileContent(_, { id }, ctx) {
      const file = await models.File.query().findById(id)

      const { storedObjects } = await getFileWithUrl(file)

      const fileUrl = storedObjects.find(f => f.type === 'original')

      const response = await axios({
        method: 'get',
        url: fileUrl.url,
      })

      return {
        id,
        content:
          typeof response.data === 'object'
            ? JSON.stringify(response.data)
            : response.data.toString(),
        name: file.name,
        url: fileUrl.url,
      }
    },
    async getFoldersList(_, vars, ctx) {
      const groupId = ctx.req.headers['group-id']

      let folderArray = []

      const AllFiles = await models.CMSFileTemplate.query().where({ groupId })
      const folders = AllFiles.filter(file => file.fileId === null)

      const rootNodes = AllFiles.filter(f => f.parentId === null).map(f => ({
        ...f,
        name: `/${f.name}`,
      }))

      const getChildren = children =>
        children.forEach(child => {
          const nestedChildren = folders
            .filter(f => f.parentId === child.id)
            .map(cld => ({
              ...cld,
              name: `${child.name}/${cld.name}`,
            }))

          folderArray = folderArray.concat(nestedChildren)
          // getChildren(nestedChildren)
        })

      rootNodes.forEach(node => {
        // folderArray.push(node)
        getChildren([node])
      })

      return folderArray
    },
  },
  Mutation: {
    async createCMSPage(_, { input }, ctx) {
      try {
        const groupId = ctx.req.headers['group-id']

        const savedCmsPage = await new models.CMSPage(
          cleanCMSPageInput({ ...input, groupId }),
        ).save()

        const cmsPage = await models.CMSPage.query().findById(savedCmsPage.id)
        return { success: true, error: null, cmsPage }
      } catch (e) {
        if (e.constraint === 'cms_pages_url_group_id_key') {
          return {
            success: false,
            error: e.constraint,
            column: 'url',
            errorMessage: 'Url already taken.',
          }
        }

        return { success: false, error: 'Something went wrong.' }
      }
    },

    async updateCMSPage(_, { id, input }, ctx) {
      const attrs = cleanCMSPageInput(input)

      if (!input.creatorId) {
        attrs.creatorId = ctx.user
      }

      const cmsPage = await models.CMSPage.query().updateAndFetchById(id, attrs)
      return cmsPage
    },

    async deleteCMSPage(_, { id }, ctx) {
      try {
        const response = await models.CMSPage.query().where({ id }).delete()

        if (response) {
          return {
            success: true,
          }
        }

        return {
          success: false,
          error: `Something went wrong`,
        }
      } catch (err) {
        return {
          success: false,
          error: `Something went wrong. ${err.message}`,
        }
      }
    },

    async updateCMSLayout(_, { _id, input }, ctx) {
      const groupId = ctx.req.headers['group-id']

      const layout = await models.CMSLayout.query()
        .where('groupId', groupId)
        .first()

      if (!layout) {
        const savedCmsLayout = await new models.CMSLayout(input).save()

        const cmsLayout = await models.CMSLayout.query().findById(
          savedCmsLayout.id,
        )

        return cmsLayout
      }

      const cmsLayout = await models.CMSLayout.query().updateAndFetchById(
        layout.id,
        input,
      )

      return cmsLayout
    },

    async addResourceToFolder(_, { id, type }, ctx) {
      const parent = await models.CMSFileTemplate.query().findOne({ id })

      const name = type ? 'new folder' : 'new file'

      const insertedResource = await models.CMSFileTemplate.query()
        .insertGraph({
          name,
          parentId: parent.id,
          groupId: parent.groupId,
        })
        .returning('id')

      let fileId = null

      if (!type) {
        const insertedFile = await createFile(
          Readable.from(' '),
          name,
          null,
          null,
          ['cmsTemplateFile'],
          insertedResource.id,
        )

        fileId = insertedFile.id

        await models.CMSFileTemplate.query()
          .update({ fileId })
          .where({ id: insertedResource.id })
        return {
          id: insertedResource.id,
          fileId,
          name,
        }
      }

      return {
        id: insertedResource.id,
        fileId: null,
        name,
        children: [],
      }
    },

    async deleteResource(_, { id }, ctx) {
      const item = await models.CMSFileTemplate.query().findOne({ id })

      if (item.fileId) {
        await models.CMSFileTemplate.query().findOne({ id }).delete()
        const file = await models.File.query().findOne({ id: item.fileId })
        const keys = file.storedObjects.map(f => f.key)

        try {
          if (keys.length > 0) {
            await fileStorage.deleteFiles(keys)
            await File.query().deleteById(id)
          }
        } catch (e) {
          throw new Error('The was a problem deleting the file')
        }
      } else {
        const hasChildren = await models.CMSFileTemplate.query().where({
          parentId: item.id,
        })

        if (hasChildren.length === 0) {
          await models.CMSFileTemplate.query().findOne({ id }).delete()
        }
      }

      return {
        id: item.id,
        fileId: item.fileId,
        name: item.name,
        parentId: item.parentId,
      }
    },

    async renameResource(_, { id, name }, ctx) {
      const item = await models.CMSFileTemplate.query().findOne({ id })

      const updatedItem = await models.CMSFileTemplate.query()
        .patch({ name })
        .findOne({ id })
        .returning('*')

      if (item.fileId) {
        await models.File.query().patch({ name }).findOne({ id: item.fileId })
      }

      return updatedItem
    },

    async updateResource(_, { id, content }, ctx) {
      const file = await models.File.query().findOne({ id })

      const { key, mimetype } = file.storedObjects.find(
        obj => obj.type === 'original',
      )

      await uploadFileHandler(Readable.from(content), key, mimetype)

      return { id, content }
    },

    async updateFlaxRootFolder(_, { id }, ctx) {
      const groupId = ctx.req.headers['group-id']

      await models.CMSFileTemplate.query()
        .patch({ rootFolder: false })
        .where({ groupId })

      return models.CMSFileTemplate.query()
        .patch({ rootFolder: true })
        .findOne({ id, groupId })
        .returning('*')
    },
  },

  CMSPage: {
    async meta(parent) {
      if (parent.meta) {
        return JSON.stringify({
          ...parent.meta,
          title: parent.submission.$title,
          abstract: parent.submission.$abstract,
        }) // TODO update flax so we can remove these bogus title and abstract fields
      }

      return null
    },

    async creator(parent) {
      if (!parent.creatorId) {
        return null
      }

      return models.CMSPage.relatedQuery('creator').for(parent.id).first()
    },

    async content(parent) {
      if (!parent.content) return parent.content

      let files = await models.File.query().where('object_id', parent.id)
      files = await getFilesWithUrl(files)

      return replaceImageSrc(parent.content, files, 'medium')
    },
  },

  CMSLayout: {
    async logo(parent) {
      if (!parent.logoId) {
        return null
      }

      const logoFile = await models.CMSLayout.relatedQuery('logo')
        .for(parent.id)
        .first()

      const updatedStoredObjects = await setFileUrls(logoFile.storedObjects)

      logoFile.storedObjects = updatedStoredObjects
      return logoFile
    },
    async favicon(parent, _, ctx) {
      try {
        const { groupId } = parent

        const activeConfig = await models.Config.query().findOne({
          groupId,
          active: true,
        })

        const file = await File.find(
          activeConfig.formData.groupIdentity.favicon,
        )

        file.storedObjects = await setFileUrls(file.storedObjects)
        return file
      } catch (error) {
        return null
      }
    },

    async flaxHeaderConfig(parent) {
      return getFlaxPageConfig('flaxHeaderConfig', parent.groupId)
    },

    async flaxFooterConfig(parent) {
      return getFlaxPageConfig('flaxFooterConfig', parent.groupId)
    },

    async publishConfig(parent) {
      const { formData } = await models.Config.getCached(parent.groupId)

      return JSON.stringify({
        licenseUrl: formData.publishing.crossref.licenseUrl,
        title: formData.groupIdentity.title,
        description: formData.groupIdentity.description,
        contact: formData.groupIdentity.contact,
        issn: formData.groupIdentity.issn,
        logoPath: formData.groupIdentity.logoPath,
      })
    },

    async article(parent) {
      if (parent.article || parent.article === '') return parent.article

      const { article } = await models.ArticleTemplate.query().findOne({
        groupId: parent.groupId,
        isCms: true,
      })

      let files = await models.File.query().where({ objectId: parent.groupId })
      files = await getFilesWithUrl(files)

      return replaceImageFromNunjucksTemplate(article, files, 'medium') ?? ''
    },

    async css(parent) {
      if (parent.css || parent.css === '') return parent.css

      const { css } = await models.ArticleTemplate.query().findOne({
        groupId: parent.groupId,
        isCms: true,
      })

      return css ?? ''
    },

    async publishingCollection(parent) {
      return models.PublishingCollection.query().where({
        groupId: parent.groupId,
        active: true,
      })
    },
  },

  StoredPartner: {
    async file(parent) {
      try {
        const file = await File.find(parent.id)
        const updatedStoredObjects = await setFileUrls(file.storedObjects)
        file.storedObjects = updatedStoredObjects
        return file
      } catch (err) {
        return null
      }
    },
  },
}

const typeDefs = `
  extend type Query {
    cmsPage(id: ID!): CMSPage!
    cmsPages: [CMSPage!]!
    cmsLayout: CMSLayout!
    getCmsFilesTree(folderId: ID): CmsFileTree!
    getCmsFileContent(id: ID!): FileContent!
    getFoldersList: [FolderView!]
    getActiveCmsFilesTree: String!
  }

  extend type Mutation {
    createCMSPage(input: CMSPageInput!): CreatePageResponse!
    updateCMSPage(id: ID!, input: CMSPageInput!): CMSPage!
    deleteCMSPage(id: ID!): DeletePageResponse!
    updateCMSLayout(input: CMSLayoutInput!): CMSLayout!
    addResourceToFolder(id: ID!, type: Boolean!): CmsFileTree!
    deleteResource(id: ID!): CmsFileTree!
    renameResource(id: ID!, name: String!): CmsFileTree!
    updateResource(id: ID!, content: String!): FileContent!
    updateFlaxRootFolder(id: ID!): FolderView!
  }

  type CMSPage {
    id: ID!
    url: String!
    title: String!
    status: String!
    content: String
    meta: String
    creator: User
    published: DateTime
    edited: DateTime
    created: DateTime!
    updated: DateTime
  }

  type CreatePageResponse {
    cmsPage: CMSPage
    success: Boolean!
    column: String
    error: String
    errorMessage: String
  }


  type DeletePageResponse {
    success: Boolean!
    error: String
  }

  type StoredPartner {
    id: ID!
    url: String
    sequenceIndex: Int
    file: File
  }

  type CMSLayout {
    id: ID!
    active: Boolean!
    primaryColor: String!
    secondaryColor: String!
    logo: File
    favicon: File
    partners: [StoredPartner!]
    footerText: String
    isPrivate:Boolean
    hexCode: String
    published: DateTime
    edited: DateTime!
    created: DateTime!
    updated: DateTime
    flaxHeaderConfig: [FlaxPageHeaderConfig!]
    flaxFooterConfig: [FlaxPageFooterConfig!]
    publishConfig: String!
    article: String!
    css: String!
    publishingCollection: PublishCollection! 
  }

  type CmsFileTree {
    id: ID!
    name: String!
    children: [CmsFileTree!]
    fileId: ID
    parentId: ID
    url: String
  }

  type FolderView {
    id: ID!
    name: String!
    rootFolder: Boolean!
  }

  type FileContent {
    id: ID!
    content: String!
    name: String!
    url: String!
  }

  type FlaxPageHeaderConfig {
    id: ID!
    title: String!
    url: String!
    sequenceIndex: Int
    shownInMenu: Boolean
  }

  type FlaxPageFooterConfig {
    id: ID!
    title: String!
    url: String!
    sequenceIndex: Int
    shownInMenu: Boolean
  }

  input CMSPageInput {
    title: String
    url: String
    content: String
    published: DateTime
    edited: DateTime
    flaxHeaderConfig: FlaxConfigInput
    flaxFooterConfig: FlaxConfigInput
  }

  input StoredPartnerInput {
    id: ID!
    url: String
    sequenceIndex: Int 
  }

  input CMSLayoutInput {
    primaryColor: String
    secondaryColor: String
    logoId: String
    isPrivate: Boolean
    hexCode: String
    partners: [StoredPartnerInput]
    footerText: String
    published: DateTime
    edited: DateTime
  }

  input FlaxConfigInput {
    sequenceIndex: Int
    shownInMenu: Boolean
  }
`

module.exports = { resolvers, typeDefs }
