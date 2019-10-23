import styles from './proxyedit.css'

import { Row, Transfer, Select, Col, Button } from 'antd';
import { connect } from 'dva';

const fs = window.require('fs')
const { ipcRenderer } = window.require('electron')
const React = require('react');
const yaml = require('js-yaml');

function mapStateToProps(state) {
  return {
    parsedRuleProfile: state.global.parsedRuleProfile,
    parsedProxyProfile: state.global.parsedProxyProfile,
    editDisable: state.global.editDisable,
    gruopProxiesConfig: state.global.gruopProxiesConfig,
    groupOptions: state.global.groupOptions,
  };
}

class ProxyEdit extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: false,
      selectedGroup: '0',
      selectedKeys: [],
      proxies: [],
      groupProxies: []
    }
  }

  async getPath () {
    ipcRenderer.send('open-file-dialog');
    return new Promise ((resolve) => {
      ipcRenderer.on('selected-directory', (event, path) => {
        return resolve(path)
      });
    })
  }

  exportProfile = async () => {
    this.setStateAsync({isLoading: true});
    try {
      var gruopProxiesConfig = this.props.gruopProxiesConfig;
      var proxyProfile = this.props.parsedProxyProfile;
      var ruleProfile = this.props.parsedRuleProfile;

      // 删除节点
      const proxySet = new Set([]);
      for (const group in gruopProxiesConfig) {
        for (const proxy in gruopProxiesConfig[group].groupProxies) {
            const proxykey = gruopProxiesConfig[group].groupProxies[proxy];
            const proxyname = gruopProxiesConfig[group].proxies.filter(function(p){
              return p.key === proxykey;
            })[0].title;
            proxySet.add(proxyname);
        }
      }


      console.log(proxySet)
      for (const proxy in ruleProfile["Proxy"]) { // 对于每一个原有的节点
        if (!proxySet.has(ruleProfile["Proxy"][proxy].name)) {
          ruleProfile["Proxy"][proxy] = null;
        }
      }
      ruleProfile["Proxy"] = ruleProfile["Proxy"].filter( v => v!=null );
      console.log(ruleProfile)

      var groupsName = new Set([]);
      for (const i in ruleProfile["Proxy Group"]) {
        groupsName.add(ruleProfile["Proxy Group"][i].name);
      }

      // 导入节点
      var exportToGroup = [];
      for (const proxy in proxyProfile["Proxy"]) {
        if (proxySet.has(proxyProfile["Proxy"][proxy].name)) {
          exportToGroup.push(proxyProfile["Proxy"][proxy]);
        }
      }
      ruleProfile["Proxy"] = ruleProfile["Proxy"].concat(exportToGroup);
      
      // 导入组
      for(const i in gruopProxiesConfig) {
        var proxiesName = [];
        for (const key in gruopProxiesConfig[i].groupProxies) {
          const proxyname = gruopProxiesConfig[i].proxies.filter(function(p){
            return p.key === gruopProxiesConfig[i].groupProxies[key];
          })[0].title
          proxiesName.push(proxyname);
        }
        ruleProfile["Proxy Group"][i].proxies = proxiesName;
      }

      const dumpYaml = yaml.safeDump(ruleProfile);

      const path = await this.getPath();
      await fs.writeFileSync(path[0] + '/config.yaml', dumpYaml);

      alert("导出成功");
      this.setStateAsync({isLoading: false});
    } catch(e) {
      this.setStateAsync({isLoading: false});
      alert("导出失败");
      console.log(e)
    }
  }

  // setState() async
  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve)
    });
  }

  handleSelectGroupChange = async (key) => {
    await this.setStateAsync({selectedGroup: key});
    await this.setStateAsync({proxies: this.props.gruopProxiesConfig[key].proxies, groupProxies: this.props.gruopProxiesConfig[key].groupProxies});
  }

  // 移动节点后更新相应组配置
  handleChange = async targetKeys => {
    await this.setStateAsync({ groupProxies: targetKeys });
    var gruopProxiesConfig = this.props.gruopProxiesConfig;
    gruopProxiesConfig[parseInt(this.state.selectedGroup)].groupProxies = this.state.groupProxies;
    this.props.dispatch({
      type: 'global/setTransferData',
      gruopProxiesConfig: gruopProxiesConfig,
    });
  };

  handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    this.setState({ selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys] });
  }

  render() {
    return (
    <Row className={styles.proxyedit}>
      <Row className={styles.groupselect}>
        <Col>
        <Select style={{ width: 265 }} onChange={this.handleSelectGroupChange} disabled={this.props.editDisable}>
          {this.props.groupOptions}
        </Select>
        <Button icon='export' disabled={this.props.editDisable} loading={this.state.isLoading} onClick={this.exportProfile}>Export</Button>
        </Col>
      </Row>
      <Transfer
        locale={{itemUnit: '个配置', itemsUnit: '个配置'}}
        titles={['待选代理节点', '组内代理节点']}
        dataSource={this.state.proxies}
        showSearch
        listStyle={{
          width: 360,
          height: 400,
        }}
        disabled={this.props.editDisable}
        targetKeys={this.state.groupProxies}
        onSelectChange={this.handleSelectChange}
        onChange={this.handleChange}
        render={item => `${item.title}`}
      />
    </Row>
    )
  }
}

export default connect(mapStateToProps)(ProxyEdit) 