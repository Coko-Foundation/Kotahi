const {
  addResourceToFolder,
  cmsFileTree,
  cmsLayout,
  cmsPageById,
  cmsPages,
  createCMSPage,
  deleteCMSPage,
  deleteResource,
  getActiveCmsFilesTree,
  getCmsFileContent,
  getFoldersList,
  layoutArticle,
  layoutCss,
  layoutFavicon,
  layoutFlaxFooterConfig,
  layoutFlaxHeaderConfig,
  layoutLogo,
  layoutPublishConfig,
  layoutPublishingCollection,
  pageContent,
  pageCreator,
  pageMeta,
  renameResource,
  storedPartnerFile,
  updateCMSLayout,
  updateCMSPage,
  updateFlaxRootFolder,
  updateResource,
} = require('../../../controllers/cms.controllers')

module.exports = {
  Query: {
    async cmsPages(_, __, ctx) {
      const groupId = ctx.req.headers['group-id']
      return cmsPages(groupId)
    },

    async cmsPage(_, { id }) {
      return cmsPageById(id)
    },

    async cmsLayout(_, __, ctx) {
      const groupId = ctx.req.headers['group-id']
      return cmsLayout(groupId)
    },

    async getCmsFilesTree(_, { folderId }, ctx) {
      const groupId = ctx.req.headers['group-id']
      return cmsFileTree(groupId, folderId)
    },

    async getActiveCmsFilesTree(_, __, ctx) {
      const groupId = ctx.req.headers['group-id']
      return getActiveCmsFilesTree(groupId)
    },

    async getCmsFileContent(_, { id }) {
      return getCmsFileContent(id)
    },

    async getFoldersList(_, vars, ctx) {
      const groupId = ctx.req.headers['group-id']
      return getFoldersList(groupId)
    },
  },
  Mutation: {
    async createCMSPage(_, { input }, ctx) {
      const groupId = ctx.req.headers['group-id']
      return createCMSPage(groupId, input)
    },

    async updateCMSPage(_, { id, input }, ctx) {
      return updateCMSPage(id, ctx.userId, input)
    },

    async deleteCMSPage(_, { id }) {
      return deleteCMSPage(id)
    },

    async updateCMSLayout(_, { input }, ctx) {
      const groupId = ctx.req.headers['group-id']
      return updateCMSLayout(groupId, input)
    },

    async addResourceToFolder(_, { id, type }) {
      return addResourceToFolder(id, type)
    },

    async deleteResource(_, { id }) {
      return deleteResource(id)
    },

    async renameResource(_, { id, name }) {
      return renameResource(id, name)
    },

    async updateResource(_, { id, content }) {
      return updateResource(id, content)
    },

    async updateFlaxRootFolder(_, { id }, ctx) {
      const groupId = ctx.req.headers['group-id']
      return updateFlaxRootFolder(id, groupId)
    },
  },

  CMSPage: {
    async meta(parent) {
      return pageMeta(parent)
    },

    async creator(parent) {
      return pageCreator(parent)
    },

    async content(parent) {
      return pageContent(parent)
    },
  },

  CMSLayout: {
    async article(parent) {
      return layoutArticle(parent)
    },

    async css(parent) {
      return layoutCss(parent)
    },

    async favicon(parent) {
      return layoutFavicon(parent)
    },

    async flaxFooterConfig(parent) {
      return layoutFlaxFooterConfig(parent)
    },

    async flaxHeaderConfig(parent) {
      return layoutFlaxHeaderConfig(parent)
    },

    async logo(parent) {
      return layoutLogo(parent)
    },

    async publishConfig(parent) {
      return layoutPublishConfig(parent)
    },

    async publishingCollection(parent) {
      return layoutPublishingCollection(parent)
    },
  },

  StoredPartner: {
    async file(parent) {
      return storedPartnerFile(parent)
    },
  },
}
