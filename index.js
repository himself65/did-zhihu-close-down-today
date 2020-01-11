require('dotenv').config()

const axios = require('axios')
const { Toolkit } = require('actions-toolkit')
const { GistBox } = require('gist-box')

Toolkit.run(
  async tools => {
    const { GIST_ID, GH_USERNAME, GH_PAT } = process.env

    // Get the user's public events
    tools.log.debug(`Getting activity for ${GH_USERNAME}`)
    const events = await tools.github.activity.listPublicEventsForUser({
      username: GH_USERNAME,
      per_page: 100
    })
    tools.log.debug(
      `Activity for ${GH_USERNAME}, ${events.data.length} events found.`
    )

    let closed = true
    for (let i = 0; i < 3; i++) {
      await axios.get('https://www.zhihu.com').
        then(res => res.status === 200 ? closed = false : [])
    }

    let content = ''
    if (closed) {
      content = `知乎今天倒闭了
      Zhihu.com have closed down today!!!😊
      `
    } else {
      content = `知乎今天没有倒闭
      Zhihu.com haven't closed down today. 😔
      `
    }

    const box = new GistBox({ id: GIST_ID, token: GH_PAT })
    try {
      tools.log.debug(`Updating Gist ${GIST_ID}`)
      await box.update({ content })
      tools.exit.success('Gist updated!')
    } catch (err) {
      tools.log.debug('Error getting or update the Gist:')
      return tools.exit.failure(err)
    }
  },
  {
    event: ['schedule', 'push'],
    secrets: ['GH_PAT', 'GH_USERNAME', 'GIST_ID']
  }
)
