import styles from './index.css'

import { Component } from 'react'
import { Typography, Layout } from 'antd'
import ProxyEdit from './components/proxyedit'
import ProfileLoad from './components/profileload'

const { Header, Content } = Layout;
const { Title } = Typography;

class Index extends Component {
  render() {
    return (
      <div>
        <Layout>
          <Header className={styles.title}>
            <Typography>
              <Title level={2}>Clash Profile Tool</Title>
            </Typography>
          </Header>
          <Content className={styles.content}>
            <ProfileLoad></ProfileLoad>
            <ProxyEdit></ProxyEdit>
          </Content>
        </Layout>
      </div>
    )
  }
}

export default Index