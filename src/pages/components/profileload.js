import styles from './profileload.css'

import { Component } from 'react'
import { connect } from 'dva'
import { Col, Row, Input, Button, Select } from 'antd'

const { Option } = Select;
const request = require('request-promise');
const yaml = require('js-yaml');

function mapStateToProps(state) {
  return {
    originProxyProfile: state.global.originProxyProfile,
    originRuleProfile: state.global.originRuleProfile,
    groupOptions: state.global.groupOptions,
  };
}

class ProfileLoad extends Component {

  constructor(props) {
    super(props);
  }

  state = {
    loading: false,
    ruleProfileUrl: '',
    proxyProfileUrl: ''
  }

  loadProfile = async () => {
    this.setState({ loading: true });
    try {
      const proxyProfile = await request(this.state.proxyProfileUrl);
      const ruleProfile = await request(this.state.ruleProfileUrl);
      this.props.dispatch({
        type: "global/setOriginProxyProfile",
        payload: proxyProfile,
      });
      this.props.dispatch({
        type: "global/setOriginRuleProfile",
        payload: ruleProfile,
      });

      const parsedProxyProfile = yaml.safeLoad(this.props.originProxyProfile);
      const parsedRuleProfile = yaml.safeLoad(this.props.originRuleProfile);
      this.props.dispatch({
        type: "global/setParsedProxyProfile",
        payload: parsedProxyProfile,
      });
      this.props.dispatch({
        type: "global/setParsedRuleProfile",
        payload: parsedRuleProfile,
      });
      // console.log(parsedRuleProfile["Proxy Group"][0].name);

      var groupOptions = [];
      for (const i in parsedRuleProfile["Proxy Group"]) {
        groupOptions.push(<Option key={i}>{parsedRuleProfile["Proxy Group"][i].name}</Option>);
      }
      this.props.dispatch({
        type: "global/setGroupOptions",
        payload: groupOptions,
      });

      // 处理成需要渲染的数据结构
      var gruopProxiesConfig = [];

      // 待选节点
      var profileProxiesKeys = [];
      for (const i in parsedProxyProfile["Proxy"]) {
        profileProxiesKeys.push({
          key: i.toString(),
          title: parsedProxyProfile["Proxy"][i].name,
        });
      }

      for (const i in parsedRuleProfile["Proxy Group"]) {

        // 组内原有节点
        var groupProxiesKeys = [];
        for (const proxy in parsedRuleProfile["Proxy Group"][i].proxies) {
          groupProxiesKeys.push({
            key: (proxy + profileProxiesKeys.length).toString(),
            title: parsedRuleProfile["Proxy Group"][i].proxies[proxy],
          });
        }

        // 组内原有节点数据处理为targetKey数据格式
        var targetKeys = [];
        for (const key in groupProxiesKeys) {
          targetKeys.push(groupProxiesKeys[key].key)
        }

        gruopProxiesConfig.push({
          proxies: profileProxiesKeys.concat(groupProxiesKeys), // 全部节点
          groupProxies: targetKeys, // 组内原有节点
        })
      }

      this.props.dispatch({
        type: 'global/setTransferData',
        gruopProxiesConfig: gruopProxiesConfig,
      });

      this.props.dispatch({
        type: 'global/setEditDisable',
        editDisable: false,
      });

      // console.log(parsedProxyProfile);
      // console.log(parsedRuleProfile);

      this.setState({ loading: false });
    } catch (e) {
      console.log(e)
      this.setState({ loading: false });
      alert("配置文件获取错误")
    }
  };

  render() {
    return (
      <Row type="flex" justify="space-around" className={styles.normal}>
        <Col span={10}>
          <Input placeholder="规则配置文件链接" onChange={value => this.setState({ ruleProfileUrl: value.target.value })} />
        </Col>
        <Col span={10}>
          <Input placeholder="代理配置文件链接" onChange={value => this.setState({ proxyProfileUrl: value.target.value })} />
        </Col>
        <Col>
          <Button type="primary" onClick={() => {
            this.setState({ loading: true });
            this.loadProfile();
          }} loading={this.state.loading}>Load</Button>
        </Col>
      </Row>
    )
  }
}

export default connect(mapStateToProps)(ProfileLoad)