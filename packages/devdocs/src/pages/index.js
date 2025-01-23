/* eslint-disable react/react-in-jsx-scope */

/* eslint-disable-next-line import/no-unresolved */
import Layout from '@theme/Layout'

import styles from './index.module.css'

const Home = () => {
  return (
    <Layout>
      <div className={styles.main}>
        <div>
          <img
            alt="Kotahi flower logo"
            className={styles.flower}
            src="/custom/flower-green.png"
          />
        </div>

        <div>
          <div>
            <img
              alt="Kotahi name logo"
              className={styles.name}
              src="/custom/logo-green.png"
            />
          </div>

          <div className={styles.subtitle}>Developer documentation</div>
        </div>
      </div>
    </Layout>
  )
}

export default Home
